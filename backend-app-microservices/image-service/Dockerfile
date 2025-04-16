FROM node:22.12.0-alpine

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY image-service/package.json image-service/package-lock.json* ./
RUN npm install

# Копируем shared-proto
COPY shared-proto /shared-proto

# Копируем исходный код сервиса
COPY image-service/ .


RUN 

# Сборка приложения
RUN npm run build

EXPOSE 8080 8081

CMD ["npm", "run", "start:prod"]