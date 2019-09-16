import { OriginDestinationOptions } from './originDestinationOptions';
export class PricedItineraries {
    public sequencyNumber: number;
    public totalFare: number;
    public currencyCode: string;
    public ticketLimitTime: string;
    public signature: string;
    public originDestinationOptions: OriginDestinationOptions[] = [];
    public logo: string;

    constructor(
    ) { }

}