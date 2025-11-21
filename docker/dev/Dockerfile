# Development Dockerfile for Gachapon Player Frontend
# SvelteKit with Vite HMR support

FROM node:22-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Install adapter-node for Docker dev environment
RUN pnpm add -D @sveltejs/adapter-node

# Copy configuration files (use dev configs without cloudflare/workerd)
COPY docker/dev/svelte.config.js ./svelte.config.js
COPY docker/dev/vite.config.ts ./vite.config.ts
COPY tsconfig.json ./
COPY wrangler.jsonc ./
COPY drizzle.config.*.ts ./
COPY auth.config.ts ./
COPY eslint.config.js ./
COPY .prettierrc .prettierignore ./

# Copy source code (will be overridden by volume mounts in dev)
COPY src ./src
COPY static ./static
COPY scripts ./scripts
COPY drizzle ./drizzle

# Expose Vite dev server port
EXPOSE 5173

# Run Vite dev server with host flag for Docker
CMD ["pnpm", "exec", "vite", "dev", "--host", "0.0.0.0"]
