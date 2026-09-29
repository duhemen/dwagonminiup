# ===== STAGE 1: Builder =====
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/central-server/package.json ./apps/central-server/
COPY apps/central-server/prisma ./apps/central-server/prisma

RUN pnpm install --frozen-lockfile --filter central-server...

COPY apps/central-server ./apps/central-server

WORKDIR /app/apps/central-server
RUN pnpm exec prisma generate
RUN pnpm build

# ===== STAGE 2: Runtime =====
FROM node:20-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache dumb-init curl
RUN corepack enable && corepack prepare pnpm@9 --activate

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/central-server/package.json ./apps/central-server/
COPY --from=builder /app/apps/central-server/dist ./apps/central-server/dist
COPY --from=builder /app/apps/central-server/prisma ./apps/central-server/prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/central-server/node_modules ./apps/central-server/node_modules

WORKDIR /app/apps/central-server

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:4000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]