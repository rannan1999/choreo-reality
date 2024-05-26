FROM node:alpine

# 创建工作目录并切换到该目录
WORKDIR /home/choreouser

# 暴露端口
EXPOSE 3000

# 复制文件到工作目录
COPY files/* /home/choreouser/

# 安装必要的软件包，创建用户和组，设置权限并安装 npm 依赖
RUN apk update && apk upgrade && \
    apk add --no-cache openssl curl gcompat iproute2 coreutils bash gawk sudo && \
    apk addgroup --gid 10008 choreo && \
    apk adduser --disabled-password --no-create-home --uid 10008 --ingroup choreo choreouser && \
    usermod -aG sudo choreouser && \
    chmod +x /home/choreouser/index.js /home/choreouser/start.sh && \
    npm install

# 使用非 root 用户执行命令
USER 10008

# 设置启动命令
CMD ["node", "index.js"]
