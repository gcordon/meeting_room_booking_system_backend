import { MigrationInterface, QueryRunner } from "typeorm";

export class Data1734665424177 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 注意: 插入用户数据时密码都是经过 md5 加密的
        // 用户数据: id、用户名、密码、昵称、邮箱、头像、手机号、是否冻结、是否管理员、创建时间、更新时间
        await queryRunner.query("INSERT INTO `user` VALUES (1,'zhangsan','96e79218965eb72c92a549dd5a330112','张三','xxx@xx.com','uploads/1732268363120-528104208- çå¤´.jpeg','13233323333',0,1,'2024-10-25 23:32:11.635759','2024-11-22 17:39:38.000000'),(2,'lisi','1a100d2c0dab19c4430e7d73762b3423','里斯','yy@yy.com','xx.png','14244424444',1,0,'2024-10-25 23:32:11.660326','2024-10-31 16:22:53.000000'),(4,'lin','993f1df9451ccbaab7428f4ed519fd8c','锐','11@qq.com',NULL,NULL,0,0,'2024-11-20 14:58:49.568506','2024-11-20 14:58:49.568506'),(5,'rui','d6e6c347a9e9430a4cef72455c53f73d','zr1','22@qq.com','uploads/a.png',NULL,0,0,'2024-11-20 15:13:55.689926','2024-11-22 16:50:38.815182'),(6,'zeng1','f1f37217b194530ff8deb169029fa6d4','z','z1@qq.com',NULL,NULL,0,0,'2024-11-26 15:13:12.533205','2024-11-26 15:13:12.533205'),(7,'zeng2','f1f37217b194530ff8deb169029fa6d4','e','z2@qq.com',NULL,NULL,0,0,'2024-11-26 15:14:12.946776','2024-11-26 15:14:12.946776')")

        // 注意: 会议室数据中 isBooked 字段默认为 0 表示未被预订
        // 会议室数据: id、名称、容量、位置、设备、描述、是否被预订、创建时间、更新时间
        await queryRunner.query("INSERT INTO `meeting_room_entity` VALUES (1,'木星',10,'一层西','白板','',0,'2024-11-25 10:50:18.947295','2024-11-25 10:50:18.947295'),(2,'金星',5,'二层东','','',0,'2024-11-25 10:50:18.947295','2024-11-25 10:50:18.947295'),(3,'天王星',30,'三层东','白板，电视','',0,'2024-11-25 10:50:18.947295','2024-11-25 10:50:18.947295'),(5,'海王星',10,'四层西','白板，电视','',0,'2024-11-25 11:09:48.285000','2024-11-25 11:09:48.285000')")

        // 注意: 预订状态包括: 申请中、审批通过、审批驳回、已解除
        // 预订数据: id、开始时间、结束时间、状态、备注、用户id、会议室id、创建时间、更新时间
        await queryRunner.query("INSERT INTO `booking`(`id`,`startTime`,`endTime`,`status`,`note`,`userId`,`roomId`,`createTime`,`updateTime`) VALUES (1,'2024-11-26 15:15:40','2024-11-26 16:15:40','审批通过','',6,3,'2024-11-26 15:15:40.255033','2024-11-26 17:20:55.000000'),(2,'2024-11-26 15:15:40','2024-11-26 16:15:40','审批驳回','',7,5,'2024-11-26 15:15:40.269686','2024-11-26 17:02:20.000000'),(3,'2024-11-26 15:15:40','2024-11-26 16:15:40','已解除','',7,3,'2024-11-26 15:15:40.283768','2024-11-26 17:02:25.000000'),(4,'2024-11-26 15:15:40','2024-11-26 16:15:40','申请中','',6,5,'2024-11-26 15:15:40.300873','2024-11-26 15:15:40.300873'),(5,'2024-11-26 12:34:23','2024-11-26 16:34:23','申请中','',4,3,'2024-11-26 16:37:15.822966','2024-11-26 16:43:23.845246'),(8,'2024-12-03 23:00:00','2024-11-26 23:59:00','审批通过','',4,1,'2024-11-26 17:24:03.114332','2024-11-26 17:24:49.000000')")

        // 权限数据: id、权限代码、权限描述
        await queryRunner.query("INSERT INTO `permissions` VALUES (1,'ccc','访问 cc 接口'),(2,'ddd','访问 dd 接口')")

        // 角色数据: id、角色名称
        await queryRunner.query("INSERT INTO `role` VALUES (1,'管理员'),(2,'普通用户')")

        // 角色-权限关联数据: 角色id、权限id
        await queryRunner.query("INSERT INTO `role_permissions` VALUES (1,1),(1,2),(2,2)")

        // 用户-角色关联数据: 用户id、角色id
        await queryRunner.query("INSERT INTO `user_roles` VALUES (1,1),(2,2)")
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 注意: 如果需要回滚，建议按照相反的顺序删除数据
        // 删除顺序: user_roles -> role_permissions -> role -> permissions -> booking -> meeting_room_entity -> user
        await queryRunner.query("DELETE FROM `user_roles`")
        await queryRunner.query("DELETE FROM `role_permissions`")
        await queryRunner.query("DELETE FROM `role`")
        await queryRunner.query("DELETE FROM `permissions`")
        await queryRunner.query("DELETE FROM `booking`")
        await queryRunner.query("DELETE FROM `meeting_room_entity`")
        await queryRunner.query("DELETE FROM `user`")
    }

}
