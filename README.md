# 12col

Standalone experiments, infographics, and interactive projects. 

## How it works

Each project under `src/projects/` is independent—no shared code between them. They just happen to live in the same repo and get built together.

```
src/
├── pages/projects/[name].astro   # Route for each project
└── projects/[name]/              # Project code lives here
    ├── components/
    ├── scripts/
    ├── styles/
    └── assets/
```

To add a project, create a route file at `src/pages/projects/foo.astro` and put your code in `src/projects/foo/`. That's it.

More details in [PROJECTS.md](./PROJECTS.md).
