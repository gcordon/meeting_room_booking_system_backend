# 0. mysql_lin 是容器 id

# 1. 先把备份文件复制到容器中
# air 
docker cp /Users/zengruilin/2024/1_NestExample/lin_nest_juejin/meeting_room_booking_system_backend/mysql备份_部署到阿里云前/mysql_all_databases_backup.sql mysql_lin:/tmp/

# mini
docker cp /Users/zengruilin/Desktop/lin_coding/meeting_room_booking_system_backend/mysql备份_部署到阿里云前/mysql_all_databases_backup.sql mysql_lin:/tmp/


# 2. 进入容器
docker exec -it mysql_lin bash

# 3. 在容器中执行导入
mysql -uroot -proot < /tmp/mysql_all_databases_backup.sql