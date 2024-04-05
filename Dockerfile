###
# this dockerfile produces image/container that serves customly packaged hubs and admin static files
# the result container should serve reticulum as "hubs_page_origin" and "admin_page_origin" on (path) "/hubs/pages"
###
FROM node:gallium as builder
RUN mkdir -p /hubs/admin/ && cd /hubs
COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY admin/package.json admin/
COPY admin/package-lock.json admin/
RUN cd admin && npm ci --legacy-peer-deps && cd ..
COPY . .
ENV BASE_ASSETS_PATH="{{rawhubs-base-assets-path}}"
RUN npm run build 1> /dev/null
RUN cd admin && npm run build 1> /dev/null && cp -R dist/* ../dist && cd ..
RUN mkdir -p dist/pages && mv dist/*.html dist/pages && mv dist/hub.service.js dist/pages && mv dist/schema.toml dist/pages          
RUN mkdir /hubs/rawhubs && mv dist/pages /hubs/rawhubs && mv dist/assets /hubs/rawhubs && mv dist/favicon.ico /hubs/rawhubs/pages

FROM alpine/openssl as ssl
RUN mkdir /ssl && openssl req -x509 -newkey rsa:2048 -sha256 -days 36500 -nodes -keyout /ssl/key -out /ssl/cert -subj '/CN=hubs'

FROM nginx:alpine
RUN apk add bash
RUN mkdir /ssl && mkdir -p /www/hubs && mkdir -p /www/hubs/pages && mkdir -p /www/hubs/assets
COPY --from=ssl /ssl /ssl
COPY --from=builder /hubs/rawhubs/pages /www/hubs/pages
COPY --from=builder /hubs/rawhubs/assets /www/hubs/assets
COPY scripts/docker/nginx.config /etc/nginx/conf.d/default.conf
COPY scripts/docker/run.sh /run.sh
RUN chmod +x /run.sh && cat /run.sh
CMD bash /run.sh
