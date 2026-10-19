# --- Etapa 1: compilar TypeScript a JavaScript ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- Etapa 2: imagen final liviana solo con dependencias de producción ---
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
# Se ejecuta con un usuario sin privilegios
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
