import { ApiProperty } from "@nestjs/swagger";
import { MeetingRoomVo } from "./meeting-room.vo";

export class MeetingRoomListVo {

    @ApiProperty({
        type: [MeetingRoomVo]
    })
    users: Array<MeetingRoomVo>;
    // meetingRooms: Array<MeetingRoomVo>;

    @ApiProperty()
    totalCount: number;
}