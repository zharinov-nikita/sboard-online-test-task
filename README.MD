![preview](https://github.com/zharinov-nikita/sboard-online-test-task/blob/master/preview.gif)

# ⚠️ Посмотреть проект без локального запуска:

[http://89.223.69.49:4173](http://89.223.69.49:4173)

---

# Запуск проекта локально

На компе должен быть установлен Docker и Docker Compose:

**Docker version 28.0.4**

**Docker Compose version v2.34.0-desktop.1**

---

1. Заходим в почтовый сервис [ethereal.email](https://ethereal.email/login) - сюда будут приходить письма с кодом подтверждения при авторизации от фронтенда

логин:

```
fiona.price99@ethereal.email
```

пароль:

```
9PuDtDgjXY2mmZV9sU
```

> ⚠️ Если не приходят письма, попробуйте временно отключить антивирус

---

2. Клонируем репозиторий и запускаем проект через docker

```
git clone https://github.com/zharinov-nikita/sboard-online-test-task
```

```
cd sboard-online-test-task
```

```
docker-compose up --build -d
```

---

**FRONTEND**

(local)

[http://localhost:4173](http://localhost:4173)

(remote)

[http://89.223.69.49:4173](http://89.223.69.49:4173)

**API-GATEWAY**

```
(local)
http://localhost:5000/api

(remote)
http://89.223.69.49:5000/api
```

**GRPC-AUTH-SERVICE**

```
(local)
grpc://localhost:3031

(remote)
grpc://89.223.69.49:3031
```

**GRPC-IMAGE-SERVICE**

```
(local)
grpc://localhost:8081

(remote)
grpc://89.223.69.49:8081
```

**WEB-SOCKET**

```
(local)
ws://localhost:5000

(remote)
ws://89.223.69.49:5000
```

---

# Структура проекта

```
├── backend-app-microservices/      # Backend (NestJS, микросервисы)
│   ├── api-gateway/                # HTTP API для frontend + WS соединение для отслеживания статуса загрузки изображений
│   ├── auth-service/               # gRPC-сервис авторизации (JWT, регистрация/вход)
│   ├── image-service/              # gRPC-сервис загрузки и обработки изображений
│   └── shared-proto/              # Общие gRPC-протоколы между сервисами
└── frontend-app/                   # Frontend (React + TypeScript)
```

---

# Контакты

[РЕЗЮМЕ](https://hh.ru/resume/e834d51bff0ea2a2bd0039ed1f376448396b77)

[TELEGRAM](https://t.me/NIKITA_NZT_48)

[GITHUB](https://github.com/zharinov-nikita/sboard-online-test-task)
