export class FlightSearch {

    public tripType: number;
    public ticketClass: number;
    public travellerDetail: { "adults": number, "children": number, "infants": number };
    public flightItineraryDetail: {"originAirportCode": string, "destinationAirportCode": string, "departureDate": string}[] = [];

    constructor(
    ) { }

}
