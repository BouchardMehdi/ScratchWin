FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_APP_BASE_PATH=/scratchwin/
ARG VITE_API_BASE_URL=/scratchwin/api
ARG VITE_DEV_PROXY_TARGET=http://localhost:3000

ENV VITE_APP_BASE_PATH=$VITE_APP_BASE_PATH
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_DEV_PROXY_TARGET=$VITE_DEV_PROXY_TARGET

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
