export class HotelOfferList {
    constructor(
    ) { }

    public offerId: string
    public roomType: string
    public roomDescription: string
    public refundRule: string
    public cancellationRule: string
    public breakfastIncluded: boolean
    public price: number
    public offerSignature: string
    public extraInformationList: {"name":string, "detail":string}[] = [];
}