FROM node:22.12.0-alpine

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY api-gateway/package.json api-gateway/package-lock.json* ./
RUN npm install

# Копируем shared-proto
COPY shared-proto /shared-proto

# Копируем исходный код сервиса
COPY api-gateway/ .

# Сборка приложения
RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "start:prod"]