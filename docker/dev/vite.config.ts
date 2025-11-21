// Development Vite config for Docker (without Cloudflare/workerd)
import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		}),
		devtoolsJson()
	],
	server: {
		host: '0.0.0.0',
		port: 5173,
		strictPort: true,
		allowedHosts: ['gachapon-frontend.findhawker.food']
	}
});
