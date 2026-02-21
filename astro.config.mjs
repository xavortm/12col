// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
    site: 'https://xavortm.github.io',
    base: '/12col/',
    vite: {
        esbuild: {
            target: 'es2022',
        },
    },
})
