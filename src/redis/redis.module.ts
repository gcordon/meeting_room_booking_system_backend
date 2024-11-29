import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

@Global() // 全局模块，使 Redis 服务在整个应用中可用
@Module({
  providers: [
    RedisService, // 提供 Redis 服务
    {
      provide: 'REDIS_CLIENT', // 提供 Redis 客户端
      async useFactory(configService: ConfigService) {
        // 创建 Redis 客户端
        const client = createClient({
          socket: {
            host: configService.get('redis_server_host'), // Redis 服务器主机
            port: configService.get('redis_server_port'), // Redis 服务器端口
          },
          database: configService.get('redis_server_database'), // 使用的数据库索引
        })

        // 监听错误事件
        // client.once('error', (err) => {
        //   console.error('Redis 客户端连接错误:', err);
        // });

        try {
          await client.connect(); // 尝试连接到 Redis 服务器
          console.log('Redis 客户端连接成功');
          return client;
        } catch (err) {
          console.error('Redis 客户端连接失败:', err);
          throw err; // 抛出错误以便上层处理
        }
      },
      inject: [ConfigService] // 注入 ConfigService 以便可以使用配置
    }
  ],
  exports: [ // 导出模块
    RedisService, // 导出 RedisService 以便其他模块可以使用
  ]
})
export class RedisModule {} // Redis 模块定义
