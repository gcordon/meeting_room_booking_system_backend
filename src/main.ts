// 导入所需的依赖
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { FormatResponseInterceptor } from './format-response.interceptor';
import { InvokeRecordInterceptor } from './invoke-record.interceptor';
import { UnloginFilter } from './unlogin.filter';
import { CustomExceptionFilter } from './custom-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // 创建 NestJS 应用实例
  const app = await NestFactory.create(AppModule);

  // cors 跨域问题
  app.enableCors()

  // 使用全局管道进行数据验证
  app.useGlobalPipes(new ValidationPipe()) // 全局使用验证管道
  // 使用全局拦截器处理响应格式
  app.useGlobalInterceptors(new FormatResponseInterceptor())
  // 使用全局拦截器记录调用信息
  app.useGlobalInterceptors(new InvokeRecordInterceptor())
  // 使用全局过滤器处理未登录异常
  app.useGlobalFilters(new UnloginFilter())
  // 使用全局过滤器处理自定义异常
  app.useGlobalFilters(new CustomExceptionFilter())

  // 创建 Swagger 文档配置
  const config = new DocumentBuilder()
    .setTitle('会议室预订系统')
    .setDescription('会议室预订系统接口文档')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      name: 'Authorization',
      //  下面两行可以让前缀不自动加 `Bearer `
      // type: 'apiKey',
      // name: 'Authorization',
      // 
      description: '请输入 JWT 令牌',
      in: 'header',
    })
    .build()
  // 根据配置创建 Swagger 文档
  const document = SwaggerModule.createDocument(app, config)
  // 设置 Swagger UI 的访问路径
  SwaggerModule.setup('api-doc', app, document)
  
  // 获取配置服务并读取端口配置
  const configService = app.get(ConfigService)
  let port = configService.get('nest_server_port')
  // 启动应用并监听指定端口
  await app.listen(port)
}
// 启动应用
bootstrap();
