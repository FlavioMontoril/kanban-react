FROM node:24-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

# Recebe o valor de 'args' do docker-compose
ARG VITE_API_AUTH_BASE_URL
ENV VITE_API_AUTH_BASE_URL=$VITE_API_AUTH_BASE_URL

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

ARG VITE_WS_URL
ENV VITE_WS_URL=$VITE_WS_URL

ARG VITE_AUTH_WS_URL
ENV VITE_AUTH_WS_URL=$VITE_AUTH_WS_URL

RUN pnpm run build

FROM nginx:alpine

#Este COPY é  utilizado quando possui rotas na aplicação, junto com o arquivo na raiz nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]