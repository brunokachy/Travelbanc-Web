import { HotelLocation } from "./hotelLocation";
import { RoomDetailList } from "./roomDetailList";

export class HotelSearch {
    constructor(
    ) { }

    public location: HotelLocation;
    public checkInDate: string;
    public checkOutDate: string;
    public checkinDateDisplay: string;
    public checkoutDateDisplay: string;
    public numberOfRooms: number;
    public resultLimit: number
    public roomDetailList: RoomDetailList[] = [];
}