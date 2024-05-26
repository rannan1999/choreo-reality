# 使用最新的 Node 镜像
FROM node:latest

# 设置工作目录为 /app
WORKDIR /app

# 暴露端口 3000
EXPOSE 3000

# 复制文件到 /app 目录
COPY files/* /app/

# 更新系统并安装所需软件包
RUN apt-get update && \
    apt install --only-upgrade linux-libc-dev && \
    apt-get install -y iproute2 vim netcat-openbsd && \
    addgroup --gid 10008 choreo && \
    adduser --disabled-password  --no-create-home --uid 10008 --ingroup choreo choreouser && \
    usermod -aG sudo choreouser && \
    chmod +x index.js start.sh && \
    npm install

# 设置容器启动命令
CMD [ "node", "index.js" ]

# 将用户切换为 choreouser
USER 10008
