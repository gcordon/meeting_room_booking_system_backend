import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateMeetingRoomDto } from "../dto/create-meeting-room.dto";
import { IsNotEmpty } from "class-validator";

export class UpdateMeetingRoomVo extends PartialType(CreateMeetingRoomDto){
    
    @ApiProperty()
    @IsNotEmpty({
        message: '会议室ID不能为空'
    })
    id: number;
}