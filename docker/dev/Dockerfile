# Development Dockerfile for Gachapon Player Frontend
# SvelteKit with Cloudflare Workers (workerd) support
# Note: Using Debian-based image (not Alpine) because workerd requires glibc

FROM node:22-slim

# Install system dependencies for workerd binary
RUN apt-get update && apt-get install -y \
    # wget for healthcheck
    wget \
    # ca-certificates for HTTPS
    ca-certificates \
    # Clean up to reduce image size
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (includes wrangler and workerd binaries)
RUN pnpm install --frozen-lockfile || pnpm install

# Copy configuration files (use dev configs with Cloudflare adapter)
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

# Run Vite dev server with Wrangler (Cloudflare Workers emulation)
# Uses vite.config.ts which integrates with Wrangler
CMD ["pnpm", "exec", "vite", "dev", "--host", "0.0.0.0"]
