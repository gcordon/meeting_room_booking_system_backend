import { Controller, Get, Post, Body, Patch, Param, Delete, DefaultValuePipe, Query, Put, HttpStatus } from '@nestjs/common';
import { MeetingRoomService } from './meeting-room.service';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { generateParseIntPipe } from 'src/utils';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { RequireLogin } from 'src/custom.decorator';
import { MeetingRoomVo } from './vo/meeting-room.vo';
import { UpdateMeetingRoomVo } from './vo/update-meeting-room.vo';
import { MeetingRoomListVo } from './vo/meeting-room-list.vo';

@Controller('meeting-room')
export class MeetingRoomController {
  constructor(
    private readonly meetingRoomService: MeetingRoomService
  ) {}

  @ApiBearerAuth()
  @ApiQuery({
    name: 'pageNo',
    description: '页码',
    type: Number,
    default: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页条数',
    type: Number,
    default: 10,
  })
  @ApiQuery({
    name: 'name',
    description: '会议室名称',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'capacity',
    description: '容量',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'equipment',
    description: '设备',
    type: String,
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: MeetingRoomListVo,
  })
  @Get('list')
  async list(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo')) pageNo: number,
    @Query('pageSize', new DefaultValuePipe(10), generateParseIntPipe('pageSize')) pageSize: number,
    @Query('name') name: string,
    @Query('capacity') capacity: number,
    @Query('equipment') equipment: string
  ) {
    return this.meetingRoomService.find(pageNo, pageSize, name, capacity, equipment)
  }

  @ApiBearerAuth()
  @ApiBody({
    type: CreateMeetingRoomDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '会议室名字已存在',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: MeetingRoomVo,
  })
  @Post('create')
  async create(@Body() createMeetingRoomDto: CreateMeetingRoomDto) {
    return await this.meetingRoomService.create(createMeetingRoomDto);
  }

  @ApiBearerAuth()
  @ApiBody({
    type: UpdateMeetingRoomVo,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
    type: MeetingRoomVo,
  })
  @Put('update')
  async update(@Body() meetingRoomDto: UpdateMeetingRoomDto) {
    return await this.meetingRoomService.update(meetingRoomDto);
  }


  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: '会议室ID',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
    type: MeetingRoomVo,
  })
  @Get(':id')
  async find(@Param('id') id: number) {
    return this.meetingRoomService.findById(id);
  }

  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: '会议室ID',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success'
  })
  @RequireLogin()
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.meetingRoomService.delete(id);
  }
}
