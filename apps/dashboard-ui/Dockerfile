# ===== STAGE 1: Builder =====
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/dashboard-ui/package.json ./apps/dashboard-ui/

RUN pnpm install --frozen-lockfile --filter dashboard-ui...

COPY apps/dashboard-ui ./apps/dashboard-ui

WORKDIR /app/apps/dashboard-ui
RUN pnpm build

# ===== STAGE 2: Nginx static =====
FROM nginx:1.27-alpine AS runtime

RUN apk add --no-cache curl

COPY --from=builder /app/apps/dashboard-ui/dist /usr/share/nginx/html
COPY apps/dashboard-ui/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]