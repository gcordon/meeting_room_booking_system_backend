// 从 @nestjs/core 导入 repl 模块
import { repl } from '@nestjs/core';
// 导入应用程序主模块
import { AppModule } from './app.module';

/**
 * 启动 REPL 服务器的引导函数
 */
async function bootstrap() {
  // 创建并等待 REPL 服务器实例
  const replServer = await repl(AppModule);
  // 设置 REPL 历史记录文件
  replServer.setupHistory(".nestjs_repl_history", (err, repl) => {
    // 如果出现错误则打印错误信息
    if (err) {
      console.error(err)
    }
  });
}

// 执行引导函数
bootstrap();