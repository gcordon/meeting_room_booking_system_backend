// 导入所需的装饰器和实体
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RoleEntity } from "./role.entity";

// 定义用户实体
@Entity({
    name: 'user', // 指定数据库表名
})
export class UserEntity {
    // 主键ID，自动生成
    @PrimaryGeneratedColumn()
    id: number;

    // 用户名
    @Column({
        length: 50,
        comment: '用户名',
        unique: true // 唯一
    })
    username: string;

    // 密码
    @Column({
        length: 50,
        comment: '密码'
    })
    password: string;

    // 昵称
    @Column({
        name: 'nick_name',
        length: 50,
        comment: '昵称'
    })
    nickName: string;

    // 邮箱
    @Column({
        comment: '邮箱',
        length: 50
    })
    email: string;

    // 头像
    @Column({
        comment: '头像',
        length: 100,
        nullable: true // 允许为空
    })
    headPic: string;

    // 手机号
    @Column({
        comment: '手机号',
        length: 20,
        nullable: true // 允许为空
    })
    phoneNumber: string;

    // 是否冻结
    @Column({
        comment: '是否冻结',
        default: false // 默认值为false
    })
    isFrozen: boolean;

    // 是否是管理员
    @Column({
        comment: '是否是管理员',
        default: false // 默认值为false
    })
    isAdmin: boolean;

    // 创建时间，自动设置
    @CreateDateColumn()
    createTime: Date;

    // 更新时间，自动更新
    @UpdateDateColumn()
    updateTime: Date;

    // 多对多关系：用户和角色
    @ManyToMany(() => RoleEntity)
    @JoinTable({
        name: 'user_roles', // 指定关联表名
    })
    roles: RoleEntity[];
}
