// 导入所需的装饰器和实体
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PermissionEntity } from "./permission.entity";

// 定义用户实体
@Entity({
    name: 'role', // 指定数据库表名
})
export class RoleEntity {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 20,
        comment: '角色名'
    })
    name: string;

    @ManyToMany(() => PermissionEntity)
    @JoinTable({
        name: 'role_permissions'
    })
    permissions: PermissionEntity[] 
}
