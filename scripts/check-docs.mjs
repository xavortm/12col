#!/usr/bin/env node

/**
 * Documentation Checker
 * Runs as a pre-commit hook to ensure README.md and CLAUDE.md stay up to date
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

function readFile(path) {
  try {
    return readFileSync(path, 'utf-8');
  } catch {
    return '';
  }
}

function getProjects() {
  const projectsDir = join(rootDir, 'src', 'projects');
  if (!existsSync(projectsDir)) return [];

  return readdirSync(projectsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

function getScripts() {
  const pkg = readJson(join(rootDir, 'package.json'));
  return pkg?.scripts || {};
}

function getDependencies() {
  const pkg = readJson(join(rootDir, 'package.json'));
  const deps = pkg?.dependencies || {};
  const devDeps = pkg?.devDependencies || {};
  return { ...deps, ...devDeps };
}

function checkDocumentation() {
  const readme = readFile(join(rootDir, 'README.md'));
  const claude = readFile(join(rootDir, 'CLAUDE.md'));

  const projects = getProjects();
  const scripts = getScripts();
  const dependencies = getDependencies();

  let hasIssues = false;
  const suggestions = [];

  // Check 1: Verify all package.json scripts are documented in README
  const documentedScripts = Object.keys(scripts);
  const standardScripts = ['dev', 'build', 'preview', 'astro'];
  const customScripts = documentedScripts.filter(s => !standardScripts.includes(s));

  if (customScripts.length > 0) {
    const missingScripts = customScripts.filter(script => {
      const scriptPattern = new RegExp(`\`pnpm ${script}\`|pnpm run ${script}`);
      return !scriptPattern.test(readme);
    });

    if (missingScripts.length > 0) {
      hasIssues = true;
      suggestions.push({
        type: 'scripts',
        message: `New npm scripts not documented in README.md: ${missingScripts.join(', ')}`,
        action: 'Add these scripts to the Commands section in README.md',
      });
    }
  }

  // Check 2: Verify important dependencies are mentioned if they affect architecture
  const architecturalDeps = ['react', 'vue', 'svelte', 'solid-js', 'preact', 'three', 'd3', 'canvas'];
  const importantDeps = Object.keys(dependencies).filter(dep =>
    architecturalDeps.some(arch => dep.includes(arch))
  );

  if (importantDeps.length > 0) {
    const unmentionedDeps = importantDeps.filter(dep => {
      return !readme.includes(dep) && !claude.includes(dep);
    });

    if (unmentionedDeps.length > 0) {
      hasIssues = true;
      suggestions.push({
        type: 'dependencies',
        message: `Architectural dependencies not mentioned in docs: ${unmentionedDeps.join(', ')}`,
        action: 'Consider mentioning these in CLAUDE.md under "Packages and libraries"',
      });
    }
  }

  // Check 3: Ensure architecture section exists if we have multiple projects
  if (projects.length > 1) {
    if (!readme.includes('## 🏗️ Architecture') && !readme.includes('## Architecture')) {
      hasIssues = true;
      suggestions.push({
        type: 'architecture',
        message: 'Multiple projects exist but README.md lacks an Architecture section',
        action: 'Add an Architecture section explaining the standalone projects pattern',
      });
    }
  }

  // Check 4: Verify CLAUDE.md mentions projects directory if it exists
  if (projects.length > 0) {
    const hasProjectsStructure =
      /projects\/.*# .*Standalone projects/i.test(claude) ||
      /src\/.*projects/i.test(claude) ||
      claude.includes('projects directory');

    if (!hasProjectsStructure) {
      hasIssues = true;
      suggestions.push({
        type: 'structure',
        message: 'CLAUDE.md should document the src/projects/ directory structure',
        action: 'Update Project Structure section in CLAUDE.md to include projects directory',
      });
    }
  }

  return { hasIssues, suggestions };
}

function main() {
  log('\n🔍 Checking documentation consistency...', 'cyan');

  const { hasIssues, suggestions } = checkDocumentation();

  if (!hasIssues) {
    log('✓ Documentation is up to date!\n', 'green');
    return 0;
  }

  log('\n⚠️  Documentation may need updates:\n', 'yellow');

  suggestions.forEach(({ type, message, action }, index) => {
    log(`${index + 1}. [${type.toUpperCase()}] ${message}`, 'yellow');
    log(`   → ${action}\n`, 'cyan');
  });

  log('💡 Tip: Update docs before committing, or run:', 'cyan');
  log('   git commit --no-verify', 'cyan');
  log('   (to skip this check)\n', 'cyan');

  // Exit with code 1 to prevent commit (user can override with --no-verify)
  return 1;
}

process.exit(main());
