FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/edge-node/package.json ./apps/edge-node/

RUN pnpm install --frozen-lockfile --filter edge-node...

COPY apps/edge-node ./apps/edge-node

WORKDIR /app/apps/edge-node
RUN pnpm build

FROM node:20-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache dumb-init curl
RUN corepack enable && corepack prepare pnpm@9 --activate

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/edge-node/package.json ./apps/edge-node/
COPY --from=builder /app/apps/edge-node/dist ./apps/edge-node/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/edge-node/node_modules ./apps/edge-node/node_modules

WORKDIR /app/apps/edge-node

ENV NODE_ENV=production

EXPOSE 4001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]