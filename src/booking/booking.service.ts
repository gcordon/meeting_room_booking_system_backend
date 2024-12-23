import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { MeetingRoomEntity } from 'src/meeting-room/entities/meeting-room.entity';
import { BookingEntity } from './entities/booking.entity';
import { Like, Between } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';
@Injectable()
export class BookingService {

  @InjectEntityManager()
  private entityManager: EntityManager;

  /**
   * 1 pnpm repl
   * 2 await get(BookingService).initData()
   * 3 await get(BookingService).find(1, 10, 'zeng', '天王', '三层', Date.now() - 24 * 60 * 60 * 1000, Date.now() + 24 * 60 * 60 * 1000)  // 后两个参数是 向后一天，向前一天
   */
  async initData() {
    // username = zengr1
      const user1 = await this.entityManager.findOneBy(UserEntity, {
        id: 6
      });
    // username = zengr2
      const user2 = await this.entityManager.findOneBy(UserEntity, {
        id: 7
      });

      const room1 = await this.entityManager.findOneBy(MeetingRoomEntity, {
        id: 3
      });
      const room2 = await this.entityManager.findOneBy(MeetingRoomEntity, {
        id: 5
      });

      const booking1 = new BookingEntity();
      booking1.room = room1;
      booking1.user = user1;
      booking1.startTime = new Date();
      booking1.endTime = new Date(Date.now() + 1000 * 60 * 60);

      await this.entityManager.save(BookingEntity, booking1);

      const booking2 = new BookingEntity();
      booking2.room = room2;
      booking2.user = user2;
      booking2.startTime = new Date();
      booking2.endTime = new Date(Date.now() + 1000 * 60 * 60);

      await this.entityManager.save(BookingEntity, booking2);

      const booking3 = new BookingEntity();
      booking3.room = room1;
      booking3.user = user2;
      booking3.startTime = new Date();
      booking3.endTime = new Date(Date.now() + 1000 * 60 * 60);

      await this.entityManager.save(BookingEntity, booking3);

      const booking4 = new BookingEntity();
      booking4.room = room2;
      booking4.user = user1;
      booking4.startTime = new Date();
      booking4.endTime = new Date(Date.now() + 1000 * 60 * 60);

      await this.entityManager.save(BookingEntity, booking4);
  }

  async find(pageNo: number, pageSize: number, username: string, meetingRoomName: string, meetingRoomPosition: string, bookingTimeRangeStart: number, bookingTimeRangeEnd: number ) {
    const skipCount = (pageNo - 1) * pageSize;

    const condition: Record<string, any> = {};

    if(username) {
      condition.user = {
        username: Like(`%${username}%`)
      }
    }

    if(meetingRoomName) {
      condition.room =  {
        name: Like(`%${meetingRoomName}%`)
      }
    }

    if(meetingRoomPosition) {
      if (!condition.room) {
        condition.room = {}
      }
      condition.room.location = Like(`%${meetingRoomPosition}%`)
    }

    if(bookingTimeRangeStart) {
      if(!bookingTimeRangeEnd) {
        bookingTimeRangeEnd = bookingTimeRangeStart + 60 * 60 * 1000
      }
      condition.startTime = Between(new Date(bookingTimeRangeStart), new Date(bookingTimeRangeEnd))
    }

    const [bookings, totalCount] = await this.entityManager.findAndCount(BookingEntity, {
      where: condition,
      relations: {
        user: true,
        room: true,
      },
      skip: skipCount,
      take: pageSize
    });

    return {
      bookings: bookings.map(item => {
        delete item.user.password;
        return item;
      }),
      totalCount
    }
  }

  async add(bookingDto: CreateBookingDto, userId: number) {
    const meetingRoom = await this.entityManager.findOneBy(MeetingRoomEntity, {
      id: bookingDto.meetingRoomId
    });

    if(!meetingRoom) {
      throw new BadRequestException('会议室不存在');
    }

    const user = await this.entityManager.findOneBy(UserEntity, {
      id: userId
    });

    const booking = new BookingEntity();
    booking.room = meetingRoom;
    booking.user = user;
    booking.startTime = new Date(bookingDto.startTime);
    booking.endTime = new Date(bookingDto.endTime);

    const res = await this.entityManager.findOneBy(BookingEntity, {
      room: {
        id: meetingRoom.id
      },
      startTime: LessThanOrEqual(booking.startTime), // 开始时间小于等于
      endTime: MoreThanOrEqual(booking.endTime) // 结束时间大于等于
    });

    if (res) {
      throw new BadRequestException('该时间段已被预定');
    }

    await this.entityManager.save(BookingEntity, booking);
  }

  async apply(id: number) {
    await this.entityManager.update(BookingEntity, {
      id
    }, {
      status: '审批通过'      
    });
    return 'success'
  }

  async reject(id: number) {
      await this.entityManager.update(BookingEntity, {
        id
      }, {
        status: '审批驳回'      
      });
      return 'success'
  }

  async unbind(id: number) {
      await this.entityManager.update(BookingEntity, {
        id
      }, {
        status: '已解除'      
      });
      return 'success'
  }


  @Inject(RedisService) // 注入 RedisService
  private redisService: RedisService; // 声明 RedisService

  @Inject(EmailService) // 注入 EmailService
  private emailService: EmailService; // 声明 EmailService

  async urge(id: number) {
    const flag = await this.redisService.get('urge_' + id);

    if(flag) {
      return '半小时内只能催办一次，请耐心等待';
    }

    let email = await this.redisService.get('admin_email');

    if(!email) { 
      const admin = await this.entityManager.findOne(UserEntity, {
        select: {
          email: true
        },
        where: {
          isAdmin: true
        }
      });

      email = admin.email

      this.redisService.set('admin_email', admin.email);
    }

    this.emailService.sendMail({
      to: email,
      subject: '预定申请催办提醒',
      html: `id 为 ${id} 的预定申请正在等待审批`
    });
    
    this.redisService.set('urge_' + id, 1, 60 * 30);
  }

}
