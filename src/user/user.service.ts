import { HttpException, HttpStatus, Inject, Injectable, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { Like, Repository } from 'typeorm';
import { RegisterUserDto } from './dto/user.dto';
import { Logger } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { md5 } from 'src/utils';
import { RoleEntity } from 'src/entities/role.entity';
import { PermissionEntity } from 'src/entities/permission.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserVo } from './vo/login-user.vo';
import { unsubscribe } from 'diagnostics_channel';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update.dto';
import { UserListVo } from './vo/user-list.vo';

@Injectable()
export class UserService {
  private logger = new Logger()
  
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>

  @InjectRepository(RoleEntity)
  private readonly roleRepository: Repository<RoleEntity>

  @InjectRepository(PermissionEntity)
  private readonly permissionRepository: Repository<PermissionEntity>

  @Inject(RedisService)
  private redisService: RedisService

  async register(body: RegisterUserDto) {
    let captcha = await this.redisService.get(`captcha_${body.email}`)
    if (!captcha) {
      throw new HttpException('验证码已过期', HttpStatus.BAD_REQUEST)
    }

    if (body.captcha !== captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST)
    }

    const user = await this.userRepository.findOne({
      where: {
        email: body.email
      }
    })
    if (user) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST)
    }

    let newUser = new UserEntity()
    newUser.username = body.username
    newUser.password = md5(body.password)
    newUser.email = body.email
    newUser.nickName = body.nickName
    
    try {
      await this.userRepository.save(newUser)
      return '注册成功'
    } catch (e) {
      this.logger.error(e, UserService)
      return '注册失败'
    }
  }

  async initData() {
    const user1 = new UserEntity();
    user1.username = "zhangsan";
    user1.password = md5("111111");
    user1.email = "xxx@xx.com";
    user1.isAdmin = true;
    user1.nickName = '张三';
    user1.phoneNumber = '13233323333';

    const user2 = new UserEntity();
    user2.username = 'lisi';
    user2.password = md5("222222");
    user2.email = "yy@yy.com";
    user2.nickName = '李四';
    user2.phoneNumber = '14244424444';

    const role1 = new RoleEntity();
    role1.name = '管理员';

    const role2 = new RoleEntity();
    role2.name = '普通用户';

    const permission1 = new PermissionEntity();
    permission1.code = 'ccc';
    permission1.description = '访问 cc 接口';

    const permission2 = new PermissionEntity();
    permission2.code = 'ddd';
    permission2.description = '访问 dd 接口';

    user1.roles = [role1];
    user2.roles = [role2];

    role1.permissions = [permission1, permission2];
    role2.permissions = [permission2];

    // 注意：先保存权限，再保存角色，最后保存用户，否则会有问题！！
    await this.permissionRepository.save([permission1, permission2]);
    await this.roleRepository.save([role1, role2]);
    await this.userRepository.save([user1, user2]);
  }

  async findUserById(userId: number, isAdmin: boolean,) {
    let user = await this.userRepository.findOne({
      where: {
        id: userId,
        isAdmin,
      },
      relations: [ 'roles', 'roles.permissions']
    })

    return {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      email: user.email,
      roles: user.roles.map(item => item.name),
      permissions: user.roles.reduce((arr, item) => {
          item.permissions.forEach(permission => {
              if(arr.indexOf(permission) === -1) {
                  arr.push(permission);
              }
          })
          return arr;
      }, []),
    }
  }

  async publicLogin(body: LoginUserDto, isAdmin: boolean) {
    let user = await this.userRepository.findOne({
      where: {
        username: body.username,
        isAdmin
      },
      relations: ['roles', 'roles.permissions'], // 关联查询
    })

    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST)
    }

    if (user.password !== md5(body.password)) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST)
    }

    let vo = new LoginUserVo()
    vo.userInfo = {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      headPic: user.headPic,
      phoneNumber: user.phoneNumber,
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      createTime: user.createTime.getTime(),
      // 提取用户角色名称
      roles: user.roles.map(role => role.name), // 使用 map 函数遍历 user.roles 数组，提取每个角色的 name 属性
      
      // 提取用户所有权限的代码
      // 先展平所有角色的权限列表，然后提取每个权限的代码
      // permissions: user.roles.flatMap(role => 
      //   role.permissions.map(permission => permission.code)
      // ) // 使用 flatMap 函数遍历 user.roles 数组，对每个角色的 permissions 数组使用 map 函数提取 code 属性，最后将结果展平成一个数组

      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach(permission => {
            if(arr.indexOf(permission) === -1) {
                arr.push(permission);
            }
        })
        return arr;
      }, [])
    }

    return vo
  }

  async userLogin(body: LoginUserDto) {
    let user = await this.publicLogin(body, false)
    return user
  }

  async adminLogin(body: LoginUserDto) {
    let user = await this.publicLogin(body, true)
    return user
  }

  async findUserDetailById(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId
      },
    })

    return user
  }

  async updatePassword(passwordDto: UpdateUserPasswordDto,) {
    let captcha = await this.redisService.get(`update_password_captcha_${passwordDto.email}`)

    if(!captcha) {
        throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    if(passwordDto.captcha !== captcha) {
        throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOneBy({
      username: passwordDto.username
    });

    if (foundUser.email !== passwordDto.email) {
      throw new HttpException('邮箱不正确', HttpStatus.BAD_REQUEST);
    }

    foundUser.password = md5(passwordDto.password);

    try {
      await this.userRepository.save(foundUser);
      return '密码修改成功';
    } catch(e) {
      this.logger.error(e, UserService);
      return '密码修改失败';
    }
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    const captcha = await this.redisService.get(`update_user_captcha_${updateUserDto.email}`);

    if(!captcha) {
        throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    if(updateUserDto.captcha !== captcha) {
        throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOneBy({
      id: userId
    });

    if(updateUserDto.nickName) {
        foundUser.nickName = updateUserDto.nickName;
    }
    if(updateUserDto.headPic) {
        foundUser.headPic = updateUserDto.headPic;
    }

    try {
      await this.userRepository.save(foundUser);
      return '用户信息修改成功';
    } catch(e) {
      this.logger.error(e, UserService);
      return '用户信息修改成功';
    }
  }

  async freezeUserById(userId: number) {
    // http://localhost:3005/user/freeze?id=2
    const foundUser = await this.userRepository.findOneBy({ 
      id: userId 
    });
    foundUser.isFrozen = true;
    await this.userRepository.save(foundUser);
  }

  async findUsers(username: string, nickName: string, email: string, pageNo: number, pageSize: number) {
    const skipCount = (pageNo - 1) * pageSize;

    const conditin: Record<string, any> = {}
    if (username) {
      conditin.username = Like(`%${username}%`)
    }
    if (nickName) {
      conditin.nickName = Like(`%${nickName}%`)
    }
    if (email) {
      conditin.email = Like(`%${email}%`)
    }
    
    const [users, totalCount] = await this.userRepository.findAndCount({
      select: ['id', 'username', 'nickName', 'email', 'phoneNumber', 'isFrozen', 'headPic', 'createTime'],
      skip: skipCount,
      take: pageSize,
      where: conditin
    });

    const vo = new UserListVo()
    vo.totalCount = totalCount
    vo.users = users

    return vo
  }
}
