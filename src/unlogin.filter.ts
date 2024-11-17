import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

/**
 * 未登录异常类
 * 用于表示用户未登录的异常情况
 */
export class UnloginException {
  message: string

  /**
   * 构造函数
   * @param message - 异常消息
   */
  constructor(message?) {
    this.message = message
  }
}

/**
 * 未登录异常过滤器
 * 用于捕获和处理未登录异常
 */
@Catch(UnloginException)
export class UnloginFilter implements ExceptionFilter {
  /**
   * 捕获并处理异常
   * @param exception - 未登录异常对象
   * @param host - 参数主机对象，用于获取请求上下文
   */
  catch(exception: UnloginException, host: ArgumentsHost) {
    // 获取响应对象
    const response = host.switchToHttp().getResponse<Response>();

    // 返回统一的错误响应格式
    response.json({
      code: HttpStatus.UNAUTHORIZED, // 401 未授权状态码
      message: 'failed', // 失败消息
      data: exception.message || '用户未登陆' // 使用异常消息或默认消息
    })
  }
}
