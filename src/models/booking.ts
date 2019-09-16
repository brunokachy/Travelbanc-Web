import { ReservationOwner } from "./reservationowner";

export class Booking {
    public reservationType: string;
    public amount: number;
    public title: string;
    public description: string;
    public reservationOwner: ReservationOwner
    public checkinDate: string;
    public checkoutDate: string;
    public hotelLocation: string;
    public ticketLimitTime: string;
    public travellers: ReservationOwner[] = [];

    constructor(
    ) { }


}