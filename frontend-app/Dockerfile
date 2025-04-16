FROM node:22.12.0-alpine

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package.json package-lock.json* ./
RUN npm install

# Копируем весь код
COPY . .

# Сборка приложения
RUN npm run build

# Открываем порт для Vite preview (по умолчанию 4173)
EXPOSE 4173

# Запускаем Vite в режиме preview
CMD ["npm", "run", "preview"]