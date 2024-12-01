# 使用 Node.js 19.9.0 Alpine 作为构建阶段的基础镜像
FROM node:20.18-alpine3.19 AS build-stage

# 设置工作目录为 /app
WORKDIR /app

# 复制 package.json 文件到工作目录
COPY package.json .

# 设置 npm 镜像源为国内源
RUN npm config set registry https://registry.npmmirror.com/

# 安装项目依赖
RUN npm install

# 复制所有源代码到工作目录
COPY . .

# 构建项目
RUN npm run build

# 生产阶段
FROM node:20.18-alpine3.19 AS production-stage

# 从构建阶段复制构建产物和 package.json 到生产环境
COPY --from=build-stage /app/dist /app
COPY --from=build-stage /app/package.json /app/package.json

# 确保复制 .env 文件
COPY --from=build-stage /app/src/.env /app/.env

# 设置工作目录为 /app
WORKDIR /app

# 设置 npm 镜像源为国内源
RUN npm config set registry https://registry.npmmirror.com/

# 只安装生产环境依赖
RUN npm install --production

# 暴露 3005 端口
EXPOSE 3005

# 启动应用
CMD ["node", "/app/main.js"]