import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { PermissionEntity } from './entities/permission.entity';
import { UnloginException } from './unlogin.filter';

interface JwtUserData {
  userId: number
  username: string
  roles: string[]
  permissions: PermissionEntity[]
}


@Injectable()
export class LoginGuard implements CanActivate {
  @Inject()
  private reflector: Reflector

  @Inject(JwtService)
  private jwtService: JwtService

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 获取请求投
    let request = context.switchToHttp().getRequest()

    // 获取 meta 值
    let requireLogin = this.reflector.getAllAndOverride(
      'require-login',
      [
        context.getClass(),
        context.getHandler()
      ],
    )
    
    // 无需登陆即可访问
    if (!requireLogin) {
      return true
    }

    let authorization = request.headers.authorization
    // 得到的格式是 `Bearer token值` ，所以需要截取 token 值
    if (authorization && authorization.startsWith('Bearer ')) {
      authorization = authorization.slice(7)
    }

    if (!authorization) {
      // throw new UnauthorizedException('用户未登陆')
      throw new UnloginException()
    }

    // 验证 jwt 
    try {
      let token = authorization
      let data = this.jwtService.verify<JwtUserData>(token)
      // 验证通过，赋予查询后的用户信息
      request.user = {
        userId: data.userId,
        username: data.username,
        roles: data.roles,
        permissions: data.permissions
      }
      return true
    } catch (error) {
      throw new UnauthorizedException('token 失效，请重新登陆')
    }
  }
}
