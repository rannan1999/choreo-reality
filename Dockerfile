FROM node:alpine

# 创建工作目录并切换到该目录
WORKDIR /app

# 复制所有文件到工作目录
COPY . .

# 暴露端口
EXPOSE 3000

# 使用 apk 安装必要的软件包，创建用户和组，设置权限并安装 npm 依赖
RUN apk update && apk upgrade && \
    apk add --no-cache openssl curl gcompat iproute2 coreutils bash gawk sudo && \
    addgroup -g 10008 choreo && \
    adduser -D -H -u 10008 -G choreo choreouser && \
    usermod -aG sudo choreouser && \
    chmod +x /app/index.js /app/start.sh && \
    npm install

# 切换到非 root 用户
USER 10008

# 设置启动命令
CMD ["node", "index.js"]
