import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class InvokeRecordInterceptor implements NestInterceptor {
  private readonly logger = new Logger(InvokeRecordInterceptor.name)
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    let request = context.switchToHttp().getRequest()
    let response = context.switchToHttp().getResponse()

    let userAgent = request.headers['user-agent']

    let {
      ip, 
      method,
      path,
    } = request

    this.logger.debug(
      `
        请求方法: ${method}\t
        请求路径: ${path}\t
        请求ip : ${ip}\t
        请求agent : ${userAgent}\t
        \t\t: 
        请求调用的 : ${context.getClass().name} ${context.getHandler().name}\t
      `
    )
    this.logger.debug(
      `
        当前用户ID: ${request.user?.userId}\t
        当前用户名: ${request.user?.username}\t
      `
    )

    let now = new Date()

    return next.handle().pipe(
      tap((res) => {
        this.logger.debug(
          `
            返回方法: ${method}\t
            返回路径: ${path}\t
            返回ip : ${ip}\t
            返回agent : ${userAgent}\t
            \t\t: 
            返回调用的 : ${response.statusCode} : ${Date.now() - now.getTime()}ms\t
          `
        )
        this.logger.debug(
          `
            返回数据: ${JSON.stringify(res)}\t
          `
        )
      })
    )
  }
}
