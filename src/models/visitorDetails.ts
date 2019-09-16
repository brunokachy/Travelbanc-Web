import { User } from './user';
import { RoomDetailList } from './roomDetailList';

export class VisitorDetail{
    constructor(
    ) { }

    public availabilitySignature: string
    public contactInformation: User
    public numberOfRooms: number
    public roomDetailList: RoomDetailList[]
}