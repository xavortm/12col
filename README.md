# 12col

An Astro-based collection of standalone experimental projects, infographics, and interactive experiences.

## 🚀 Project Structure

Inside this Astro project, you'll see the following structure:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── astro.svg
│   ├── components/
│   │   └── Welcome.astro
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro              # Welcome page
│   │   └── projects/
│   │       └── [name].astro         # Individual project routes
│   └── projects/                    # 👈 Standalone projects
│       └── [name]/
│           ├── components/          # Project-specific components
│           ├── scripts/             # TypeScript/JavaScript
│           ├── styles/              # CSS files
│           └── assets/              # Images, fonts, etc.
├── PROJECTS.md                      # Guide for creating projects
├── CLAUDE.md                        # Project instructions
└── package.json
```

## 🏗️ Architecture

This project uses a **standalone projects pattern** where each sub-project under `/projects/[name]` is completely independent with zero shared code.

### Key Principles

- **Individual Route Files**: Each project gets its own route file in `src/pages/projects/[name].astro`
- **Zero Coordination**: No central registry - just create a route file and it works
- **Complete Isolation**: Projects only import from their own directory tree
- **Flexible Technology**: Each project can use different libraries and frameworks
- **Single Build**: All projects compile together into one deployable `dist/` folder

### Structure Requirements

Each project must follow this structure:

```text
src/projects/[project-name]/
├── components/       # Project-specific Astro components
├── scripts/         # TypeScript/JavaScript for interactivity
├── styles/          # CSS files
└── assets/          # Images, fonts, etc.
```

**Route file**: `src/pages/projects/[project-name].astro`
- Imports Layout and project components
- Imports project scripts and styles
- Completely self-contained

### Code Isolation Rules

**✅ DO:**
- Import only from your own project directory
- Use scoped styles in `.astro` components
- Keep all project code self-contained

**❌ DON'T:**
- Import from root `src/components/`
- Import from other projects
- Share code between projects

See [PROJECTS.md](./PROJECTS.md) for detailed instructions on creating new projects.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`            | Installs dependencies                            |
| `pnpm dev`                | Starts local dev server at `localhost:4321`      |
| `pnpm build`              | Build your production site to `./dist/`          |
| `pnpm preview`            | Preview your build locally, before deploying     |
| `pnpm astro ...`          | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help`    | Get help using the Astro CLI                     |
| `pnpm test`               | Run unit tests in watch mode                     |
| `pnpm test:run`           | Run unit tests once                              |
| `pnpm test:e2e`           | Run E2E tests with Playwright                    |
| `pnpm check-docs`         | Check if documentation is up to date             |
| `pnpm setup-hooks`        | Install git hooks for automatic doc checking     |

### 🪝 Git Hooks Setup

After cloning the repository, run once:

```bash
pnpm setup-hooks
```

This installs a pre-commit hook that automatically checks if documentation needs updating when you commit changes to:
- `package.json` (new scripts or dependencies)
- `src/projects/` (architecture changes)
- Configuration files

The hook will warn you if docs are out of sync. You can:
- Update the docs and commit again
- Bypass with `git commit --no-verify` if the changes don't require doc updates

## 📝 Creating a New Project

Quick start:

```bash
# 1. Create directory structure
mkdir -p src/projects/your-project/{components,scripts,styles,assets}

# 2. Create route file
touch src/pages/projects/your-project.astro

# 3. Build your project
pnpm dev

# Visit http://localhost:4321/projects/your-project
```

See [PROJECTS.md](./PROJECTS.md) for complete instructions and examples.

## 👀 Want to learn more?

- Astro Documentation: [docs.astro.build](https://docs.astro.build)
- Astro Discord: [astro.build/chat](https://astro.build/chat)
- Project Structure: See [PROJECTS.md](./PROJECTS.md)
- Project Instructions: See [CLAUDE.md](./CLAUDE.md)
