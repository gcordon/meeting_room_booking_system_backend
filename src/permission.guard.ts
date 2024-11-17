import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject()
  private reflector: Reflector

  
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 获取请求投
    let request = context.switchToHttp().getRequest()
    // 无需校验的情况
    if (!request.user) {
      return true
    }

    // 获取 meta 值
    let requirePermission = this.reflector.getAllAndOverride(
      'require-permission',
      [
        context.getClass(),
        context.getHandler()
      ],
    )
    // 无需校验的情况
    if (!requirePermission) {
      return true
    }
    // 验证权限码
    // 获取用户权限列表
    const userPermissions = request.user.permissions.map(item => item.code);
    
    // 检查用户是否拥有所需权限
    const hasPermission = requirePermission.every(permission => userPermissions.includes(permission));
    if (!hasPermission) {
      throw new UnauthorizedException('对不起，您没有访问该资源的权限');
    }

    return true
  }
}
