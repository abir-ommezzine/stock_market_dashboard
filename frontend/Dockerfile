# Build stage
FROM node:20-alpine as build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# ⚠️ Vite output is /dist NOT /build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
