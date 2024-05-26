FROM node:alpine

WORKDIR /home/choreouser

EXPOSE 3000

COPY files/* /home/choreouser/

RUN apk update && apk upgrade &&\
    apk add --no-cache openssl curl gcompat iproute2 coreutils &&\
    apk add --no-cache bash gawk &&\
    apk addgroup --gid 10008 choreo &&\
    apk adduser --disabled-password  --no-create-home --uid 10008 --ingroup choreo choreouser &&\
    usermod -aG sudo choreouser &&\

    chmod +x index.js start.sh &&\
    npm install

CMD ["node", "index.js"]

USER 10008
