import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';

/**
 * 响应数据格式化拦截器
 * 将所有响应数据统一格式化为 { code, message, data } 的格式
 */
@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
  /**
   * 拦截器的核心方法
   * @param context - 执行上下文，包含请求和响应等信息
   * @param next - 调用链中的下一个处理器
   * @returns Observable 包含格式化后的响应数据
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 获取响应对象
    let response = context.switchToHttp().getResponse<Response>()
    
    // 处理响应数据流
    return next.handle().pipe(map((data) => {
      // 将响应数据格式化为统一的格式
      return {
        code: response.statusCode, // HTTP 状态码
        message: 'success', // 响应消息
        data, // 实际响应数据
      }
    }))
  }
}
