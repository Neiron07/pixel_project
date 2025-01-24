FROM node:16-alpine

# Создаем директорию приложения и устанавливаем рабочий каталог
WORKDIR /usr/src/app

# Копируем все файлы из текущей директории в контейнер
COPY . .

# Устанавливаем зависимости для сервера
WORKDIR /usr/src/app/server
RUN yarn install

# Для разработки запускаем с помощью nodemon
CMD ["yarn", "dev"]
EXPOSE 5000