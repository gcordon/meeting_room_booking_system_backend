import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { BookingEntity } from 'src/booking/entities/booking.entity';
import { UserEntity } from 'src/entities/user.entity';
import { EntityManager } from 'typeorm';
import { MeetingRoomEntity } from 'src/meeting-room/entities/meeting-room.entity';
@Injectable()
export class StatisticService {

    @InjectEntityManager()
    private entityManager: EntityManager;

    async userBookingCount(startTime: string, endTime: string) {
        const res = await this.entityManager
            .createQueryBuilder(BookingEntity, 'b') // 创建查询构造器
            .select('u.id', 'userId') // 选择用户id
            .addSelect('u.username', 'username') // 选择用户名
            .leftJoin(UserEntity, 'u', 'b.userId = u.id') // 左连接用户表
            .addSelect('count(1)', 'bookingCount') // 预定次数
            .where('b.startTime between :time1 and :time2', { // 预定时间范围
                time1: startTime, 
                time2: endTime
            })
            .addGroupBy('b.user') // 按用户分组
            .getRawMany(); // 获取结果
        return res
    }


    async meetingRoomUsedCount(startTime: string, endTime: string) {
        const res = await this.entityManager
            .createQueryBuilder(BookingEntity, 'b')
            .select('m.id', 'meetingRoomId')
            .addSelect('m.name', 'meetingRoomName')
            .leftJoin(MeetingRoomEntity, 'm', 'b.roomId = m.id')
            .addSelect('count(1)', 'usedCount')
            .where('b.startTime between :time1 and :time2', {
                time1: startTime, 
                time2: endTime
            })
            .addGroupBy('b.roomId')
            .getRawMany();
        return res;
    }
}
