import { BadRequestException, Body, Controller, DefaultValuePipe, Get, HttpStatus, Inject, ParseIntPipe, Post, Query, UnauthorizedException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/user.dto';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginUserVo } from './vo/login-user.vo';
import { RequireLogin, UserInfo } from 'src/custom.decorator';
import { UserDetailVo } from './vo/user-info.vo';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update.dto';
import { generateParseIntPipe } from 'src/utils';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { RefreshTokenVo } from './vo/refresh-token.vo';
import { UserListVo } from './vo/user-list.vo';
import { UserEntity } from 'src/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { storage } from 'src/my-file-storage';

@ApiTags('用户管理模块')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  private jwtService: JwtService

  @Inject(ConfigService)
  private configService: ConfigService
  
  @Inject(EmailService)
  private emailService: EmailService

  @Inject(RedisService)
  private redisService: RedisService

  @Get('init-data')
  async initData() {
    // http://localhost:3005/user/init-data
    await this.userService.initData();
    return 'done'
  }

  @ApiBody({
    description: '上传文件',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '要上传的图片文件(支持 .png/.jpg/.gif)',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.OK,
    description: '文件上传成功，返回文件路径',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '只能上传图片文件',
    type: String,
  })
  // 
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    dest: 'uploads',// 使用默认的存储引擎
    storage: storage, // 使用自定义的存储引擎
    limits: {// 限制文件大小
      fileSize: 1024 * 1024 * 10, // 10MB
    },
    fileFilter(req, file, callback) {
      const extname = path.extname(file.originalname);        
      // callback 的第一个参数是 error，第二个参数是是否接收文件。
      if(['.png', '.jpg', '.jpeg', '.gif'].includes(extname)) {
        callback(null, true);
      } else {
        callback(new BadRequestException('只能上传图片'), false);
      }
    }
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('file', file);
    return file.path;
  }
  

  @ApiBody({type: RegisterUserDto,})
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已过期/验证码错误/用户已存在',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '注册成功/注册失败',
    type: String,
  })
  @Post('register')
  register(@Body() body: RegisterUserDto) {
    return this.userService.register(body)
  }

  @ApiQuery({
    name: 'address',
    description: '邮箱地址',
    required: true,
    type: String,
    example: 'xx@xx.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '发送成功',
    type: String,
  })
  @Get('register-captcha')
  async registerCaptcha(@Query('address') address: string) {
    // http://localhost:3005/user/register-captcha?address=87788877@qq.com
    const code = Math.random().toString().slice(2,8);

    await this.redisService.set(`captcha_${address}`, code, 60 * 5)

    await this.emailService.sendMail({
      to: address,
      subject: '注册验证码',
      html: `<p>你的验证码是: ${code}</p>`,
    })
  
    return {
      code,
      address
    }
  }

  // @ApiBearerAuth()
  @ApiQuery({
      name: 'address',
      description: '邮箱地址',
      type: String
  })
  @ApiResponse({
      type: String,
      description: '发送成功'
  })
  // @RequireLogin()
  @Get('update_password/captcha')
  async updatePasswordCaptcha(@Query('address') address: string) {
    // http://localhost:3005/user/update_password/captcha?address=yy@yy.com
    const code = Math.random().toString().slice(2,8);

    await this.redisService.set(`update_password_captcha_${address}`, code, 10 * 60);

    await this.emailService.sendMail({
      to: address,
      subject: '更改密码验证码',
      html: `<p>你的更改密码验证码是 ${code}</p>`
    });
    return '发送成功 '+code;
  }

  @ApiBearerAuth()
  @ApiResponse({
    type: String,
    description: '发送成功',
  })
  @RequireLogin()
  @Get('update/captcha')
  async updateCaptcha(@UserInfo('email') address: string, @UserInfo() user: UserEntity) {
      // http://localhost:3005/user/update/captcha?address=yy@yy.com
      const code = Math.random().toString().slice(2,8);

      await this.redisService.set(`update_user_captcha_${address}`, code, 10 * 60);

      await this.emailService.sendMail({
        to: address,
        subject: '更改用户信息验证码',
        html: `<p>你的验证码是 ${code}</p>`
      });
      return '发送成功 '+code;
  }

  createJwt(vo: LoginUserVo): LoginUserVo {
    // 生成访问令牌
    vo.accessToken = this.jwtService.sign({
      userId: vo.userInfo.id,
      username: vo.userInfo.username,
      email: vo.userInfo.email,
      roles: vo.userInfo.roles,
      permissions: vo.userInfo.permissions
    }, {
      // 设置访问令牌过期时间，默认为30分钟
      expiresIn: this.configService.get('jwt_access_token_expires_time') || '30m'
    })

    // 生成刷新令牌
    vo.refreshToken = this.jwtService.sign({
      userId: vo.userInfo.id
    }, {
      // 设置刷新令牌过期时间，默认为7天
      expiresIn: this.configService.get('jwt_refresh_token_expres_time') || '7d'
    })

    // 返回登录信息，包括用户信息、访问令牌和刷新令牌
    return vo
  }


  @ApiBody({
    type: LoginUserDto,
    description: '用户登录信息',
    examples: {
      example1: {
        value: {
          username: 'lin',
          password: 'linlin'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在/密码错误',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息 && token',
    type: LoginUserVo,
  })
  @Post('login')
  async userLogin(@Body() body: LoginUserDto) {
    // 调用用户登录服务
    let vo = await this.userService.userLogin(body)
    
    vo = this.createJwt(vo)

    return vo
  }

  @ApiBody({
    type: LoginUserDto,
    description: 'admin用户登录信息',
    examples: {
      example1: {
        value: {
          username: 'zhangsan',
          password: '111111'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在/密码错误',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息 && token',
    type: LoginUserVo,
  })
  @Post('admin/login')
  async adminLogin(@Body() body: LoginUserDto) {

    // 调用用户登录服务
    let vo = await this.userService.adminLogin(body)
    
    vo = this.createJwt(vo)

    return vo
  }

  async publicRefresh(refreshToken: string, isAdmin: boolean,) {
    try {
      let data = this.jwtService.verify(refreshToken)

      let user = await this.userService.findUserById(data.id, isAdmin)
      
      const access_token = this.jwtService.sign({
        userId: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions
      }, {
        expiresIn: this.configService.get('jwt_access_token_expires_time') || '30m'
      });

      const refresh_token = this.jwtService.sign({
        userId: user.id
      }, {
        expiresIn: this.configService.get('jwt_refresh_token_expres_time') || '7d'
      });

      let vo = new RefreshTokenVo();
      vo.access_token = access_token;
      vo.refresh_token = refresh_token;

      return vo
    } catch (error) {
      throw new UnauthorizedException('token 已失效，请重新登陆')
    }

  }

  @Get('admin/refresh')
  async adminRefresh(@Query('refreshToken') refreshToken: string,) {
    // http://localhost:3005/user/refresh?refreshToken=
    let e = await this.publicRefresh(refreshToken, true)
    return e
  }

  @ApiQuery({
    name: 'refreshToken',
    description: '刷新令牌',
    required: true,
    type: String,
    example: '',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'token 已失效，请重新登陆',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功，返回访问令牌 && 刷新令牌',
    type: RefreshTokenVo,
  })
  @Get('refresh')
  async refresh(@Query('refreshToken') refreshToken: string,) {
    let e = await this.publicRefresh(refreshToken, false)
    return e
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息',
    type: UserDetailVo,
  })
  @Get('info')
  @RequireLogin()
  async info(@UserInfo('userId') userId: number) {
    let user = await this.userService.findUserDetailById(userId)

    let vo = new UserDetailVo();
    vo.id = user.id;
    vo.email = user.email;
    vo.username = user.username;
    vo.headPic = user.headPic;
    vo.phoneNumber = user.phoneNumber;
    vo.nickName = user.nickName;
    vo.createTime = user.createTime;
    vo.isFrozen = user.isFrozen;

    return vo
  }

  // @ApiBearerAuth()
  @ApiBody({
      type: UpdateUserPasswordDto
  })
  @ApiResponse({
      type: String,
      description: '验证码已失效/不正确'
  })
  @Post(['update_password', 'admin/update_password'])
  // @RequireLogin()
  async updatePassword(
    // @UserInfo('userId') userId: number,
    @Body() passwordDto: UpdateUserPasswordDto
  ) {
    return await this.userService.updatePassword(passwordDto)
  }

  @ApiBearerAuth()
  @ApiBody({
      type: UpdateUserDto
  })
  @ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: '验证码已失效/不正确'
  })
  @ApiResponse({
      status: HttpStatus.OK,
      description: '更新成功',
      type: String
  })
  @Post(['update', 'admin/update'])
  @RequireLogin()
  async update(@UserInfo('userId') userId: number, @Body() updateUserDto: UpdateUserDto) {
      return await this.userService.update(userId, updateUserDto); 
  }

  @ApiBearerAuth()
  @ApiQuery({
      name: 'id',
      description: '用户id',
      type: Number
  })
  @ApiResponse({
      type: String,
      description: '冻结成功'
  })
  @RequireLogin()
  @Get('freeze')
  async freeze(@Query('id') userId: number) {
    await this.userService.freezeUserById(userId)
    return '冻结成功'
  }

  @ApiBearerAuth()
  @ApiQuery({
      name: 'pageNo',
      description: '第几页',
      type: Number
  })
  @ApiQuery({
      name: 'pageSize',
      description: '每页多少条',
      type: Number
  })
  @ApiQuery({
      name: 'username',
      description: '用户名',
      type: String
  })
  @ApiQuery({
      name: 'nickName',
      description: '昵称',
      type: String
  })
  @ApiQuery({
      name: 'email',
      description: '邮箱地址',
      type: String
  })
  @ApiResponse({
      type: UserListVo,
      description: '用户列表'
  })
  @RequireLogin()
  @Get('list')
  async list(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo')) pageNo: number,
    @Query('pageSize', new DefaultValuePipe(2), generateParseIntPipe('pageSize')) pageSize: number,
    @Query('username') username: string,
    @Query('nickName') nickName: string,
    @Query('email') email: string,
  ) {
    // http://localhost:3005/user/list?username=zhangsan&nickName&email&pageNo=1&pageSize=2
    // http://localhost:3005/user/list?username=zhangsan&nickName=张三&email=xxx@xx.com&pageNo=1&pageSize=2
    return await this.userService.findUsers(username, nickName, email,pageNo, pageSize, )
  }
}
