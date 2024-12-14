1. 固定mysql 和 redis版本
2. 先创建需要数据库表
3. 在运行容器
4. 访问url看是否能行




以下是删除所有Docker容器和镜像的命令：
1. 首先停止所有正在运行的容器：
docker stop $(docker ps -a -q)
删除所有容器：
docker rm $(docker ps -a -q)
3. 删除所有镜像：
docker rmi $(docker images -q)
如果遇到某些镜像无法删除，可以使用强制删除命令：
docker rmi -f $(docker images -q)
补充说明：
docker ps -a -q 列出所有容器的ID
docker images -q 列出所有镜像的ID
-f 参数表示强制删除
请注意：
删除操作是不可逆的
删除前请确保没有重要数据需要保存
如果镜像正被容器使用，需要先删除相关容器才能删除镜像