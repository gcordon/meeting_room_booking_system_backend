# 0. 41e4876cfbba 是容器 id

# 1. 先把备份文件复制到容器中
docker cp /Users/zengruilin/2024/1_NestExample/lin_nest_juejin/meeting_room_booking_system_backend/mysql备份_部署到阿里云前/mysql_all_databases_backup.sql 41e4876cfbba:/tmp/

# 2. 进入容器
docker exec -it 41e4876cfbba bash

# 3. 在容器中执行导入
mysql -uroot -proot < /tmp/mysql_all_databases_backup.sql