import { Controller, Get, SetMetadata } from '@nestjs/common';
import { AppService } from './app.service';
import { RequireLogin, RequirePermission, UserInfo } from './custom.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('aa')
  // @SetMetadata('require-login', true)
  // @SetMetadata('require-permission', ['ccc'],)
  @RequireLogin()
  @RequirePermission('ddd')
  aa(@UserInfo('username') username: string, @UserInfo() userInfo): object {
    // http://localhost:3005/aa
    let r1 = {
      username,
      userInfo,
    }
    return r1
  }

  @Get('bb')
  @SetMetadata('require-login', true)
  @SetMetadata('require-permission', ['ddd'],)
  bb(): string {
    // http://localhost:3005/bb
    return 'bb'
  }

  @Get('cc')
  cc(): string {
    // http://localhost:3005/cc
    return 'cc'
  }
}
