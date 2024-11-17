import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

/**
 * 自定义异常过滤器
 * 用于捕获和处理 HttpException 类型的异常
 * 统一处理异常响应格式
 */
@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  /**
   * 捕获并处理异常
   * @param exception - HTTP异常对象,包含状态码和错误信息
   * @param host - 参数主机对象,用于获取请求上下文
   * @returns void
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    // 从 host 中获取响应对象
    const response = host.switchToHttp().getResponse<Response>();

    // 设置 HTTP 响应状态码
    response.statusCode = exception.getStatus()

    // 从异常对象中获取错误响应信息
    const exceptionResponse = exception.getResponse()
    
    // 处理错误信息格式,支持字符串数组格式
    let data = (exceptionResponse as { message: string[] }).message.join && (exceptionResponse as { message: string[] }).message.join(',') || exception.message

    // 返回统一的错误响应格式:
    // - code: HTTP状态码 
    // - message: 统一的失败提示
    // - data: 具体的错误信息
    response.json({
      code: exception.getStatus(),
      message: 'failed',
      data: data
    }).end()
  }
}
