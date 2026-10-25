FROM node:24-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM node:24-alpine AS runner

WORKDIR /app

RUN corepack enable

# Criar grupo e usuário não-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiar arquivos do estágio de build
# COPY --from=build --chown=appuser:appgroup /app/package.json /app/pnpm-lock.yaml ./
# COPY --from=build --chown=appuser:appgroup /app/node_modules ./node_modules
# COPY --from=build --chown=appuser:appgroup /app/dist ./dist
# COPY --from=build --chown=appuser:appgroup /app/public ./public

# Se for usar apenas para testar/visualizar o build final
COPY --from=build --chown=appuser:appgroup /app/dist ./dist

USER appuser 

EXPOSE 5173

# Ajuste: Executa o preview em vez do dev
CMD ["pnpm", "dlx", "serve", "-s", "dist", "-l", "5173"]