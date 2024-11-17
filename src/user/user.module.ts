import { Body, Injectable, Module, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RegisterUserDto } from './dto/user.dto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { RoleEntity } from 'src/entities/role.entity';
import { PermissionEntity } from 'src/entities/permission.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      PermissionEntity
    ])
  ],
  controllers: [UserController],
  providers: [UserService],
})

export class UserModule {
  constructor(private readonly userService: UserService) {
  }
}
