FROM nginx:alpine
WORKDIR /src/.
COPY src/. /usr/share/nginx/html
EXPOSE 80
