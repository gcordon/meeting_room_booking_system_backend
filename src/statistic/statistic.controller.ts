import { Controller, Inject, Get, Query } from '@nestjs/common';
import { StatisticService } from './statistic.service';

@Controller('statistic')
export class StatisticController {

    @Inject(StatisticService)
    private statisticService: StatisticService;

    // http://localhost:3005/statistic/userBookingCount?startTime=2024-11-25&endTime=2024-11-30
    @Get('userBookingCount')
    async userBookingCount(@Query() query: any) {
        return this.statisticService.userBookingCount(query.startTime, query.endTime);
    }

    // http://localhost:3005/statistic/meetingRoomUsedCount?startTime=2024-11-25&endTime=2024-11-30
    @Get('meetingRoomUsedCount')
    async meetingRoomUsedCount(@Query('startTime') startTime: string, @Query('endTime') endTime) {
        return this.statisticService.meetingRoomUsedCount(startTime, endTime);
    }
}
