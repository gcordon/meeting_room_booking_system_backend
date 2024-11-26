import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Query, DefaultValuePipe } from '@nestjs/common';
import { generateParseIntPipe } from 'src/utils';
import { RequireLogin, UserInfo } from 'src/custom.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('list')
  async list(
      @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo')) pageNo: number,
      @Query('pageSize', new DefaultValuePipe(10), generateParseIntPipe('pageSize')) pageSize: number,
      @Query('username') username: string,
      @Query('meetingRoomName') meetingRoomName: string,
      @Query('meetingRoomPosition') meetingRoomPosition: string,
      @Query('bookingTimeRangeStart') bookingTimeRangeStart: number,
      @Query('bookingTimeRangeEnd') bookingTimeRangeEnd: number,
  ) {
      return this.bookingService.find(pageNo, pageSize, username, meetingRoomName, meetingRoomPosition, bookingTimeRangeStart, bookingTimeRangeEnd);
  }

  @ApiBearerAuth()
  @Post('add')
  @RequireLogin()
  async add(@Body() booking: CreateBookingDto, @UserInfo('userId') userId: number) {
      await this.bookingService.add(booking, userId);
      return 'success'
  }

  // 审批通过
  @Get("apply/:id")
  async apply(@Param('id') id: number) {
      return this.bookingService.apply(id);
  }

  // 审批驳回
  @Get("reject/:id")
  async reject(@Param('id') id: number) {
      return this.bookingService.reject(id);
  }

  // 解除
  @Get("unbind/:id")
  async unbind(@Param('id') id: number) {
      return this.bookingService.unbind(id);
  }

  // 催办
  @Get('urge/:id')
  async urge(@Param('id') id: number) {
      return this.bookingService.urge(id);
  }
}
