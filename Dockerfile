FROM node:alpine

WORKDIR /app

COPY . .

EXPOSE 7844

RUN apk update && apk upgrade &&\
    apk add --no-cache openssl curl gcompat iproute2 coreutils &&\
    apk add --no-cache bash gawk &&\
    chmod +x index.js start.sh &&\
    npm install

USER 10008

CMD ["node", "index.js"]
