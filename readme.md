!
<br> Все ссылания на переменные идут для `.env`
<br>В котором находятся все основные переменные для корректировки.
<br>Создайте или используйте базовый с редакцией **логин/пароль**.
<br>!
------------------------------
Необходимые предустановки
------------------------------
- [Docker](https://www.docker.com/)
- [WSL2](https://learn.microsoft.com/ru-ru/windows/wsl/install) <- используется самим Docker (если используете без него, должно работать и так)<br>Используется для создания ключа, поэтому если ключ будет создаваться по пункту `1` необходимо к использованию<br>(либо используйте другой способ создания ключа)
------------------------------
Последовательность запуска:
------------------------------
Все приведённые команды с учётом запуска из директории `docker-compose.yml`.
1. Создайте сертификат и ключ для использования HTTPS(опционально, измените порт для HTTP):
  ```
  wsl -u root
  apt-get update
  apt-get install openssl
  openssl genrsa -out ./nginx/selfsigned.key 2048
  openssl req -new -x509 -key ./nginx/selfsigned.key -out ./nginx/selfsigned.crt -days 365
  ```
2. Дополнительно DF(Diffle-Hellman):
  ```
  openssl dhparam -out ./nginx/dhparam.pem 2048
  ```
3. Запустите контейнеры:
  ```
  docker-compose up -d
  ```
------------------------------
Описание переменных `.env`:
- `SMART_SCREEN_CONTAINER_NAME` <- наименование контейнера для сервиса
- `SMART_SCREEN_INSIDE_PORT` <- открываемый внутренний порт контейнера
- `NGINX_CONTAINER_NAME` <- наименование контейнера для сервера [NGINX](https://hub.docker.com/_/nginx)
- `NGINX_CONTAINER_OUTSIDE_PORT` <- открываемый внешний порт контейнера сервера
- `NGINX_CONTAINER_INSIDER_PORT` <- открываемй внутренний порт контейнера сервера