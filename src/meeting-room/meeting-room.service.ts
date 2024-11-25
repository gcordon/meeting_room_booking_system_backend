import { BadRequestException, Controller, Injectable } from '@nestjs/common';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { MeetingRoomEntity } from './entities/meeting-room.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Like, Repository } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';

@Injectable()
@ApiTags('会议室模块')
@Controller('meeting-room')
export class MeetingRoomService {

  @InjectRepository(MeetingRoomEntity)
  private repository: Repository<MeetingRoomEntity>
  
  // 初始化会议室数据
  initData() {
    const room1 = new MeetingRoomEntity();
    room1.name = '木星';
    room1.capacity = 10;
    room1.equipment = '白板';
    room1.location = '一层西';

    const room2 = new MeetingRoomEntity();
    room2.name = '金星';
    room2.capacity = 5;
    room2.equipment = '';
    room2.location = '二层东';

    const room3 = new MeetingRoomEntity();
    room3.name = '天王星';
    room3.capacity = 30;
    room3.equipment = '白板，电视';
    room3.location = '三层东';

    this.repository.insert([room1, room2, room3])
  }

  async find(pageNo: number, pageSize: number, name: string, capacity: number, equipment: string) {
    if (pageNo < 1 ) {
      throw new BadRequestException('页面最小为1')
    }

    const skipCount = (pageNo - 1) * pageSize // 跳过多少条

    const condition: Record<string,any> = {}
    if (name) {
      condition.name = Like(`%${name}%`)
    }
    if (capacity) {
      condition.capacity = capacity
    }
    if (equipment) {
      condition.equipment = Like(`%${equipment}%`)
    }

    const [meetingRooms, totalCount] = await this.repository.findAndCount({
      skip: skipCount, // 跳过多少条
      take: pageSize, // 取多少条
      where: condition, // 条件
    })

    return {
      meetingRooms,
      totalCount,
    }
  }

  async create(createMeetingRoomDto: CreateMeetingRoomDto) {
    const room = await this.repository.findOneBy({
      name: createMeetingRoomDto.name
    })
    if (room) {
      throw new BadRequestException('会议室名字已存在')
    }

    return await this.repository.save(createMeetingRoomDto)
  }


  @InjectEntityManager() // 使用EntityManager来删除
  entityManager: EntityManager // 注入EntityManager
  async delete(id: number) {
    // 1 因为 booking 表关联了 meeting-room 表，有外键约束，所以要删除所有的预定之后再去删除会议室。
    // const bookings = await this.entityManager.findBy(BookingEntity, {
    //   room: {
    //     id: id
    //   }
    // })
    // for (let i = 0; i < bookings.length; i++) {
    //   await this.entityManager.delete(BookingEntity, bookings[i].id)
    // }
    
    // 2 删除会议室
    await this.repository.delete(id)

    return 'success'
  }

  async findById(id: number) {
    return this.repository.findOneBy({
      id
    });
  }

  async update(meetingRoomDto: UpdateMeetingRoomDto) {
    const meetingRoom = await this.repository.findOneBy({
      id: meetingRoomDto.id
    })
    if (!meetingRoom) {
      throw new BadRequestException('会议室不存在')
    }

    meetingRoom.name = meetingRoomDto.name
    meetingRoom.capacity = meetingRoomDto.capacity

    if (meetingRoomDto.equipment) { // 如果设备不为空，则更新设备
      meetingRoom.equipment = meetingRoomDto.equipment
    }
    if (meetingRoomDto.location) { // 如果位置不为空，则更新位置
      meetingRoom.location = meetingRoomDto.location
    }

    await this.repository.update({
      id: meetingRoomDto.id,
    }, meetingRoom)
    return 'success'
  }
}
