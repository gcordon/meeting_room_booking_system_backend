import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { PermissionEntity } from './entities/permission.entity';
import { MeetingRoomEntity } from './meeting-room/entities/meeting-room.entity';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { LoginGuard } from './login.guard';
import { PermissionGuard } from './permission.guard';
import { MeetingRoomModule } from './meeting-room/meeting-room.module';
import { BookingModule } from './booking/booking.module';
import { BookingEntity } from './booking/entities/booking.entity';
import { StatisticModule } from './statistic/statistic.module';
import * as path from 'path';

/**
 * 应用程序的主模块
 * 配置数据库连接和应用程序的控制器和服务
 */
@Module({
  imports: [ // 模块导入
    // 
    JwtModule.registerAsync({
      global: true,
      async useFactory(configService: ConfigService) {
        return {
          secret: configService.get('jwt_secret'),
          signOptions: {
            expiresIn: '30m',
          }
        }
      },
      inject: [ConfigService],
    }),
    // 连接数据库 https://docs.nestjs.com/techniques/database
    TypeOrmModule.forRootAsync({
      async useFactory(configService: ConfigService) {
        return {
          type: 'mysql', // 数据库类型
          host: configService.get('mysql_server_host'), // 数据库主机
          port: configService.get('mysql_server_port'), // 数据库端口
          username: configService.get('mysql_server_username'), // 数据库用户名
          password: configService.get('mysql_server_password'), // 数据库密码
          database: configService.get('mysql_server_database'), // 数据库名称
          synchronize: false, // 自动同步实体
          logging: true, // 启用日志记录
          entities: [ // 实体列表
            UserEntity, // 用户实体
            RoleEntity, // 角色实体
            PermissionEntity, // 权限实体
            MeetingRoomEntity, // 会议室实体
            BookingEntity,
          ], // 实体列表（当前为空）
          poolSize: 10, // 连接池大小
          connectorPackage: 'mysql2', // 使用的MySQL连接器包
          // extra: {
          //   authPlugin: 'sha256_password', // 身份验证插件
          // },
        }
      },
      inject: [ConfigService],
    }),
    // 全局 env 环境变量
    ConfigModule.forRoot({ // https://docs.nestjs.com/techniques/configuration
      isGlobal: true, // 全局环境变量
      envFilePath: process.env.NODE_ENV === 'production' 
        ? path.join(__dirname, '.env')  // 生产环境使用 dist 目录下的 .env
        : 'src/.env', // 开发环境使用 src 目录下的 .env
    }),
    // 用户模块
    UserModule,
    // redis 模块
    RedisModule,
    // 邮件模块
    EmailModule,
    // 会议室模块
    MeetingRoomModule,
    // 预约模块
    BookingModule,
    StatisticModule,
  ],
  controllers: [AppController], // 控制器
  providers: [
    AppService,
    {
      provide: APP_GUARD, // 提供全局守卫
      useClass: LoginGuard, // 使用登录守卫
    },
    {
      provide: APP_GUARD, // 提供全局守卫
      useClass: PermissionGuard, // 使用权限守卫
    },
  ], // 服务提供者
})
export class AppModule {}
