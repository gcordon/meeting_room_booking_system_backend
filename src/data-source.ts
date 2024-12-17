// 导入必要的依赖
import { DataSource } from "typeorm";
import { config } from 'dotenv';

// 导入实体类
import { PermissionEntity } from './entities/permission.entity';
import { RoleEntity } from './entities/role.entity';
import { UserEntity } from './entities/user.entity';
import { MeetingRoomEntity } from './meeting-room/entities/meeting-room.entity';
import { BookingEntity } from './booking/entities/booking.entity';

// 加载环境变量配置文件
config({ path: './src/.env-migration' });

// 打印环境变量,用于调试
console.log(process.env);

// 导出 TypeORM 数据源配置
export default new DataSource({
    type: "mysql", // 数据库类型
    host: `${process.env.mysql_server_host}`, // 数据库主机地址
    port: +`${process.env.mysql_server_port}`, // 数据库端口
    username: `${process.env.mysql_server_username}`, // 数据库用户名
    password: `${process.env.mysql_server_password}`, // 数据库密码
    database: `${process.env.mysql_server_database}`, // 数据库名
    synchronize: false, // 是否自动同步实体到数据库
    logging: true, // 是否启用日志
    entities: [ // 实体列表
      UserEntity, RoleEntity, PermissionEntity, MeetingRoomEntity, BookingEntity
    ],
    poolSize: 10, // 连接池大小
    migrations: ['src/migrations/**.ts'], // 迁移文件路径
    connectorPackage: 'mysql2', // MySQL连接器包
    extra: {
        authPlugin: 'sha256_password', // 身份验证插件
    }
});