export class HotelList {
    constructor(
    ) { }
    public hotelId: string
    public hotelName: string
    public fullAddress: string
    public addressDetail: {"streetAddress":string, "city":string, "country":string, "postalCode": string}
    public description: string
    public starRating: string
    public minimumPrice: number
    public imageList: {"imageUrl":string, "imageThumbnailUrl":string}[] = []
    public extraInformationList: {"name":string, "detail":string}[] = []
    public facilityList: {"type": string, "detail": string}[] = []
    public hotelCoordinate: {"latitude":string, "longitude":string}
}