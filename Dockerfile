# Dockerfile for Turbo monorepo apps
FROM node:22-alpine AS base

# Build arguments for app selection
ARG APP_NAME=chatbot
ARG PORT=3000

# Install pnpm
RUN npm install -g pnpm@10.16.1

# Setup working directory
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
ARG APP_NAME

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy all apps package.json for workspace resolution
COPY apps/${APP_NAME}/package.json ./apps/${APP_NAME}/package.json

# Copy all packages package.json
COPY packages ./packages

RUN pnpm install --frozen-lockfile

# Build the application
FROM base AS builder
ARG APP_NAME
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the specified app
RUN pnpm turbo build --filter=@apps/${APP_NAME}

# Production image
FROM base AS runner
ARG APP_NAME
ARG PORT
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy workspace configuration
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/turbo.json ./turbo.json

# Copy necessary files for the app
COPY --from=builder /app/apps/${APP_NAME}/next.config.* ./apps/${APP_NAME}/
COPY --from=builder /app/apps/${APP_NAME}/package.json ./apps/${APP_NAME}/
COPY --from=builder /app/apps/${APP_NAME}/public ./apps/${APP_NAME}/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP_NAME}/.next ./apps/${APP_NAME}/.next

# Copy dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy packages source files (needed for transpilePackages)
COPY --from=builder /app/packages ./packages

USER nextjs

EXPOSE ${PORT}

ENV PORT=${PORT}
ENV HOSTNAME="0.0.0.0"

CMD pnpm --filter=@apps/${APP_NAME} start
