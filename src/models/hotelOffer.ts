import { HotelOfferList } from "./hotelOfferList";

export class HotelOffer{
    constructor(
    ) { }

    public searchSignature: string
    public hotelId: string
    public hotelName: string
    public availableOffers: number
    public offerList: HotelOfferList[] = []

}