# Dockerfile for Next.js application
FROM node:22-alpine AS base

# Install pnpm
RUN npm install -g pnpm@10.16.1

# Setup working directory
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application files
COPY . .

# Build the Next.js application
RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# Copy dependencies
COPY --from=builder /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["pnpm", "start"]
