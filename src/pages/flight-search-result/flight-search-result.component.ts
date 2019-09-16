import { Component, TemplateRef } from '@angular/core';
import { Flight } from '../../models/flight';
import { PricedItineraries } from '../../models/pricedItineraries';
import * as moment from 'moment';
import { OriginDestinationOptions } from '../../models/originDestinationOptions';
import { BsModalService, BsModalRef, TypeaheadMatch } from 'ngx-bootstrap';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Service } from '../../provider/api.service';
import { FlightSearch } from '../../models/flightsearch';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    moduleId: module.id,
    selector: 'flight_search_result',
    templateUrl: 'flight-search-result.component.html',
    styleUrls: []
})
export class FlightSearchResultComponent {
    flight: Flight;
    pricedItineraries: PricedItineraries[] = [];
    modalRef: BsModalRef;
    pricedItinerary: PricedItineraries;
    originDestinationOptions: OriginDestinationOptions[] = [];
    flightHeader: any

    minDepartureDate: Date;
    maxDepartureDate: Date;
    minReturnDate: Date;
    maxReturnDate: Date;
    departureDate: string = '';
    returnDate: string = '';

    departureCity: string;
    destinationCity: string;
    airports: any[] = []
    departureAirport: any;
    destinationAirport: any;
    datasource: Observable<any> = Observable.of([]);

    adultTraveller: number = 1;
    childTraveller: number = 0;
    infantTraveller: number = 0;
    totalTraveller: number = 1
    travellerAlert: string = ""
    tripType: string = '2';
    seatclass: string = '1';
    flightSearch: any

    isOpen: boolean = true

    multipleDest: { "departureAirport": any, "arrivalAirport": any, "departureDate": string }[] = []
    airlines: { "name": string, "code": string, "minPrice": number }[] = []

    sortValue: string = 'Lowest Price'

    stops: number = -1
    airline: { "name": string, "code": string, "minPrice": number } = { "name": "SHOW ALL", "code": "", "minPrice": 0 }

    constructor(private modalService: BsModalService, private service: Service, private router: Router,
        private spinnerService: NgxSpinnerService) {
        this.flight = JSON.parse(localStorage.getItem('flight'));
        this.flightHeader = JSON.parse(localStorage.getItem('flightHeader'));
        this.popluateFlights()
        this.getAirlineList()
    }

    popluateFlights() {
        this.pricedItineraries = []
        for (let a of this.flight.airlineItineraries) {
            for (let b of a.pricedItineraries) {
                this.pricedItineraries.push(b)
            }
        }
        this.sort()
    }

    sort() {
        if (this.sortValue == 'Lowest Price') {
            this.pricedItineraries.sort(function (obj1, obj2) {
                return obj1.totalFare - obj2.totalFare
            });
        }
        if (this.sortValue == 'Highest Price') {
            this.pricedItineraries.sort(function (obj1, obj2) {
                return obj2.totalFare - obj1.totalFare
            });
        }
        if (this.sortValue == 'Earliest Departure') {
            this.pricedItineraries.sort(function (obj1, obj2) {
                let a = moment(obj1.originDestinationOptions[0].flightSegments[0].departureTime, "dd/MM/YYYY HH:mm").valueOf()
                let b = moment(obj2.originDestinationOptions[0].flightSegments[0].departureTime, "dd/MM/YYYY HH:mm").valueOf()
                return a - b
            });
        }

        if (this.sortValue == 'Latest Departure') {
            this.pricedItineraries.sort(function (obj1, obj2) {
                let a = moment(obj1.originDestinationOptions[0].flightSegments[0].departureTime, "dd/MM/YYYY HH:mm").valueOf()
                let b = moment(obj2.originDestinationOptions[0].flightSegments[0].departureTime, "dd/MM/YYYY HH:mm").valueOf()
                return b - a
            });
        }
    }


    selectFlight(pricedItineraries: PricedItineraries) {
        localStorage.setItem('pricedItineraries', JSON.stringify(pricedItineraries))
        localStorage.setItem("viewFlightDetail", "true")
        this.router.navigate(['/flight_detail']);
    }

    formatDate(date: string) {
        let d = moment(date, "dd/MM/YYYY HH:mm").format('HH:mm');
        return d;
    }

    formatStops(stops: number) {
        if (stops == 0) {
            return 'Non-stop';
        }
        if (stops == 1) {
            return '1 stop';
        }
        if (stops > 1) {
            return '2+ stops'
        }
    }

    formatFlightLocation(name) {
        name = name.substr(0, name.indexOf('-'));
        return name
    }
    formatFlightCountry(name) {
        name = name.substring(name.indexOf(",") + 1);
        return name
    }

    formatTime(originDestinationOptions: OriginDestinationOptions[]) {
        let h: number = 0
        let m: number = 0
        for (let o of originDestinationOptions) {
            for (let ff of o.flightSegments) {
                h = h + parseInt(moment(ff.journeyDuration, "HH:mm").format('H'));
                m = m + parseInt(moment(ff.journeyDuration, "HH:mm").format('mm'));
            }
        }

        h = h + m / 60 | 0
        let mins = m % 60 | 0;
        let hString = h + ' hour';
        let mString = mins + ' min';
        if (h > 1) {
            hString = h + ' hours';
        }

        if (mins > 1) {
            mString = mins + ' mins';
        }
        var duration = hString + ', ' + mString;
        return duration;
    }

    formatTime3(date: string) {
        let d = moment(date, "DD/MM/YYYY HH:mm").format('HH:mm');
        return d;
    }

    formatCurrency(amount: number) {
        var str = amount.toString();
        var result = str.slice(0, -2) + "." + str.slice(-2);
        return parseInt(result);
    }

    // openModal(template: TemplateRef<any>, pricedItinerary: PricedItineraries) {
    //     this.pricedItinerary = pricedItinerary
    //     this.originDestinationOptions = []
    //     for (let u of this.pricedItinerary.originDestinationOptions) {
    //         this.originDestinationOptions.push(u);
    //     }
    //     this.modalRef = this.modalService.show(template);
    // }

    formatSegmentDuration(o: OriginDestinationOptions) {
        let h = 0;
        let m = 0;
        let index = 1
        for (let oo of o.flightSegments) {
            let hh = moment(oo.journeyDuration, "HH:mm").format('HH');
            let mm = moment(oo.journeyDuration, "HH:mm").format('mm')

            if (o.flightSegments[index] != null) {
                let a = moment(oo.arrivalTime, "DD/MM/YYYY HH:mm").valueOf()
                let b = moment(o.flightSegments[index].departureTime, "DD/MM/YYYY HH:mm").valueOf()
                let c: number = b - a
                let tempTime = moment.duration(c);
                h = h + tempTime.hours()
                m = m + tempTime.minutes()
            }
            h = h + parseInt(hh)
            m = m + parseInt(mm)
            index++
        }
        if (m >= 60) {
            h = h + 1
            m = m - 60
        }
        let hString = h + 'h';
        let mString = m + 'm';
        var duration = hString + ' ' + mString;
        return duration;

    }

    formatTime2(date: string) {
        let d = moment(date, "DD/MM/YYYY HH:mm").format('HH:mm');
        return d;
    }

    formatDate2(date: string) {
        let d = moment(date, "DD/MM/YYYY HH:mm").format('DD MMM YY');
        return d;
    }

    formateDate3(checkinDate) {
        var msec = Date.parse(checkinDate);
        let d = moment(msec).format('MMM DD, YYYY');
        if (d == 'Invalid date') {
            return checkinDate
        }
        return d
    }

    formatDate4(date): string {
        let dd = moment(date, "DD/MM/YYYY").toString()
        var msec = Date.parse(dd);
        let d = moment(msec).format("ddd Do MMM, YYYY");
        return d
    }

    formatDate5(date): string {
        let dd = moment(date, "ddd Do MMM, YYYY").toString()
        let msec = Date.parse(dd);
        let d = moment(msec).format("DD/MM/YYYY");
        return d
    }

    calculateLayoverTime(arrivalTime: string, departureTime: string) {
        let a = moment(arrivalTime, "DD/MM/YYYY HH:mm").valueOf()
        let b = moment(departureTime, "DD/MM/YYYY HH:mm").valueOf()
        let c: number = b - a
        let tempTime = moment.duration(c);
        return tempTime.hours() + 'h ' + tempTime.minutes() + 'm'
    }

    formatDuration(departureTime: string, arrivalTime: string) {
        let a = moment(arrivalTime, "DD/MM/YYYY HH:mm").valueOf()
        let b = moment(departureTime, "DD/MM/YYYY HH:mm").valueOf()
        let c: number = a - b
        let tempTime = moment.duration(c);
        return tempTime.hours() + 'h ' + tempTime.minutes() + 'm'
    }

    getTotalDuration(pricedItinerary: PricedItineraries) {
        let t1 = 0;
        let t2 = 0;
        for (let o of pricedItinerary.originDestinationOptions) {
            let index = 0
            for (let oo of o.flightSegments) {
                // let a = moment(oo.arrivalTime, "DD/MM/YYYY HH:mm").valueOf()
                // let b = moment(oo.departureTime, "DD/MM/YYYY HH:mm").valueOf()


                let d = moment(oo.journeyDuration, "HH:mm").valueOf()
                //  let c1: number = a - b
                t1 = t1 + d

                if (o.flightSegments[index + 1] != null) {
                    let a = moment(oo.arrivalTime, "DD/MM/YYYY HH:mm").valueOf()
                    let b = moment(o.flightSegments[index + 1].departureTime, "DD/MM/YYYY HH:mm").valueOf()
                    let c2: number = b - a
                    t2 = t2 + c2
                }
                index++
            }
        }
        let tempTime1 = moment.duration(t1);
        let tempTime2 = moment.duration(t2);
        let t3 = t1 - t2
        let tempTime3 = moment.duration(t1 + t2);

        // console.log(tempTime1.hours() + 'h ' + tempTime1.minutes() + 'm')
        // console.log(tempTime2.hours() + 'h ' + tempTime2.minutes() + 'm')
        return tempTime3.hours() + 'h ' + tempTime3.minutes() + 'm'
    }




    // getTotalDuration(pricedItinerary: PricedItineraries) {
    //     let h = 0;
    //     let m = 0;
    //     for (let o of pricedItinerary.originDestinationOptions) {
    //         let index = 1
    //         for (let oo of o.flightSegments) {
    //             let hh = moment(oo.journeyDuration, "HH:mm").valueOf()
    //             if (o.flightSegments[index] != null) {
    //                 let a = moment(oo.arrivalTime, "DD/MM/YYYY HH:mm").valueOf()
    //                 let b = moment(o.flightSegments[index].departureTime, "DD/MM/YYYY HH:mm").valueOf()
    //                 let c: number = b - a
    //                 let tempTime = moment.duration(c);
    //                 h = h + tempTime.hours()
    //                 m = m + tempTime.minutes()

    //             }
    //             h = h + moment.duration(hh).hours()
    //             m = m + moment.duration(hh).minutes()

    //             index++
    //         }
    //     }
    //     let minutes: number = m % 60;
    //     let hours: number = Math.floor(m / 60);

    //     let hString = h + 'h';
    //     let mString = m + 'm';
    //     var duration = hString + ' ' + mString;
    //     return duration;

    // }

    openSearchModal(template: TemplateRef<any>) {
        this.flightSearch = JSON.parse(localStorage.getItem("flightSearch"))

        this.departureCity = this.flightHeader.departureAirport.displayName
        this.destinationCity = this.flightHeader.destinationAirport.displayName
        this.departureAirport = this.flightHeader.departureAirport
        this.destinationAirport = this.flightHeader.destinationAirport
        this.seatclass = this.flightSearch.ticketClass
        this.adultTraveller = this.flightSearch.travellerDetail.adults
        this.childTraveller = this.flightSearch.travellerDetail.children
        this.infantTraveller = this.flightSearch.travellerDetail.infants
        this.formatDepartureDate()

        if (JSON.parse(localStorage.getItem("multipleDest")) == null) {
            this.populateMultipleDest()
        }
        if (this.flightHeader.tripType == 'One-way Trip') {
            this.departureDate = this.formatDate4(this.flightSearch.flightItineraryDetail[0].departureDate)
        }
        if (this.flightHeader.tripType == 'Round Trip') {
            this.departureDate = this.formatDate4(this.flightSearch.flightItineraryDetail[0].departureDate)
            this.returnDate = this.formatDate4(this.flightSearch.flightItineraryDetail[1].departureDate)
            this.formatReturnDate(this.flightSearch.flightItineraryDetail[0].departureDate)
        }

        if (this.flightHeader.tripType == 'Multi Trip') {
            this.multipleDest = JSON.parse(localStorage.getItem("multipleDest"))
            for (let m of this.multipleDest) {
                m.departureDate = this.formatDate4(m.departureDate)
            }
        }
        this.datasource = Observable.create((observer: any) => {
            observer.next(this.airports);
        }).mergeMap((token: string) => Observable.of(this.airports));
        this.modalRef = this.modalService.show(template);
    }

    getTotalTraveller(): string {
        let totalTraveller = this.adultTraveller + ' adult'
        if (this.childTraveller > 0) {
            totalTraveller = totalTraveller + ', ' + this.childTraveller + ' child'
        }

        if (this.infantTraveller > 0) {
            totalTraveller = totalTraveller + ', ' + this.infantTraveller + ' infant '
        }

        return totalTraveller
    }

    checkInput(e) {
        if (e.length > 1) {
            this.getAirports(e)
        }
    }

    typeaheadOnSelect(e: TypeaheadMatch, type: string): void {
        if (type == 'Departure') {
            this.departureAirport = e.item;
            this.getAirportCountry(this.departureAirport)

        }
        if (type == 'Destination') {
            this.destinationAirport = e.item;
            this.getAirportCountry(this.destinationAirport)
        }
    }

    typeaheadOnSelectM(e: TypeaheadMatch, type: string, index: number): void {
        if (type == 'Departure') {
            this.multipleDest[index].departureAirport = e.item;
            this.getAirportCountry(this.departureAirport)
        }
        if (type == 'Destination') {
            this.multipleDest[index].arrivalAirport = e.item
            this.getAirportCountry(this.destinationAirport)
        }
    }


    getAirportCountry(airport: any) {
        this.service.callAPI(JSON.stringify({ "cityCode": airport.cityCode }), this.service.GETCITY).subscribe(
            city => {
                if (city.status == 0) {
                    let countries = JSON.parse(localStorage.getItem("countries"))
                    for (let c of countries) {
                        if (c.code == city.data.countryCode) {
                            airport.country = c.name
                        }
                    }
                }
            });
    }

    getAirports(token: string) {
        let requestData = JSON.stringify({ "searchTerm": token, "limit": 10 });
        let airports = []
        this.service.callAPI(requestData, this.service.GETAIRPORTBYSEARCHTERM).subscribe(
            data => {
                if (data.status == 0) {
                    for (let u of data.data) {
                        let airport = u
                        airport.displayName = airport.name + ' (' + airport.cityCode + '), ' + airport.cityName
                        airports.push(airport)
                        if (airports.length == data.data.length) {
                            this.airports = []
                            this.airports = airports
                        }
                    }
                }
            },
            error => {
                console.log(error);
            });
    }

    formatDepartureDate() {
        var d = new Date();
        var year = d.getFullYear();
        var month = d.getMonth();
        var day = d.getDate();
        this.minDepartureDate = d
        this.maxDepartureDate = new Date(year + 1, month, day)
    }

    formatReturnDate(departureDate) {
        var msec = Date.parse(departureDate);
        var dd = new Date(msec);
        var year = dd.getFullYear();
        var month = dd.getMonth();
        var day = dd.getDate();
        this.minReturnDate = new Date(year, month, day + 1)
        this.maxReturnDate = new Date(year + 1, month, day)
    }

    populateMultipleDest() {
        this.multipleDest.push({ "departureAirport": null, "arrivalAirport": null, "departureDate": null })
        this.multipleDest.push({ "departureAirport": null, "arrivalAirport": null, "departureDate": null })
    }

    addDestination() {
        this.multipleDest.push({ "departureAirport": null, "arrivalAirport": null, "departureDate": null })
    }

    removeDestination() {
        this.multipleDest.pop()
    }

    add(name: string) {
        this.travellerAlert = ""
        this.checkMaxTravellers(name);
    }

    minus(name: string) {
        this.travellerAlert = ""
        if (name == 'Adult') {
            this.checkInfantAdultRatio(name)
        }

        if (name == 'Child') {
            this.childTraveller--
            this.minusTotalTraveller();
        }

        if (name == 'Infant') {
            this.infantTraveller--
            this.minusTotalTraveller();
        }

    }

    addTotalTraveller() {
        this.totalTraveller++
    }

    minusTotalTraveller() {
        this.totalTraveller--
    }

    checkMaxTravellers(name: string) {
        if (this.totalTraveller == 9) {
            this.travellerAlert = "The maximum number of travellers allowed is 9"
        }
        else {
            if (name == 'Adult') {
                this.checkAdultMax()
            }

            if (name == 'Child') {
                this.checkChildMax()
            }

            if (name == 'Infant') {
                this.checkInfantAdultRatio(name)
            }
        }
    }

    checkAdultMax() {
        if (this.adultTraveller == 5) {
            this.travellerAlert = "The maximum number of adult travellers allowed is 5"
        } else {
            this.adultTraveller = this.adultTraveller + 1;
            this.addTotalTraveller();
        }
    }

    checkChildMax() {
        if (this.childTraveller == 5) {
            this.travellerAlert = "The maximum number of child travellers allowed is 5"
        } else {
            this.childTraveller = this.childTraveller + 1;
            this.addTotalTraveller();
        }
    }

    checkInfantAdultRatio(name) {
        if (this.adultTraveller == this.infantTraveller) {
            this.travellerAlert = "The number of Infants cannot exceed the number of adults. Ratio is 1:1."
        } else {
            if (name == 'Adult') {
                this.adultTraveller = this.adultTraveller - 1;
                this.minusTotalTraveller();
            }
            if (name == 'Infant') {
                this.infantTraveller = this.infantTraveller + 1;
                this.addTotalTraveller();
            }
        }
    }

    searchFlight(tripType: string) {
        let tripTypeString = ""
        let flightSearch = new FlightSearch();
        let flightItineraryDetails = flightSearch.flightItineraryDetail
        flightSearch.ticketClass = parseInt(this.seatclass);
        flightSearch.tripType = parseInt(tripType);
        flightSearch.travellerDetail = { "adults": this.adultTraveller, "children": this.childTraveller, "infants": this.infantTraveller };
        if (tripType == '1') {
            tripTypeString = "One-way Trip"
            flightSearch.flightItineraryDetail.push({ "originAirportCode": this.departureAirport.iataCode, "destinationAirportCode": this.destinationAirport.iataCode, "departureDate": this.formatDate5(this.departureDate) });
            let flightHeader = { "departureAirport": this.departureAirport, "destinationAirport": this.destinationAirport, "totalTravelers": this.getTotalTraveller(), "ticketClass": this.getTicketClass(flightSearch.ticketClass), "depatureDate": this.departureDate, "arrivalDate": this.returnDate, "tripType": tripTypeString }
            localStorage.setItem('flightHeader', JSON.stringify(flightHeader));
        }
        if (tripType == '2') {
            tripTypeString = "Round Trip"
            flightSearch.flightItineraryDetail.push({ "originAirportCode": this.departureAirport.iataCode, "destinationAirportCode": this.destinationAirport.iataCode, "departureDate": this.formatDate5(this.departureDate) });
            flightSearch.flightItineraryDetail.push({ "originAirportCode": this.destinationAirport.iataCode, "destinationAirportCode": this.departureAirport.iataCode, "departureDate": this.formatDate5(this.returnDate) });
            let flightHeader = { "departureAirport": this.departureAirport, "destinationAirport": this.destinationAirport, "totalTravelers": this.getTotalTraveller(), "ticketClass": this.getTicketClass(flightSearch.ticketClass), "depatureDate": this.departureDate, "arrivalDate": this.returnDate, "tripType": tripTypeString }
            localStorage.setItem('flightHeader', JSON.stringify(flightHeader));
        }
        if (tripType == '3') {
            let index = this.multipleDest.length - 1
            tripTypeString = "Multi Trip"
            for (let m of this.multipleDest) {
                flightSearch.flightItineraryDetail.push({ "originAirportCode": m.departureAirport.iataCode, "destinationAirportCode": m.arrivalAirport.iataCode, "departureDate": this.formatDate5(m.departureDate) });
            }
            let flightHeader = { "departureAirport": this.multipleDest[0].departureAirport, "destinationAirport": this.multipleDest[index].arrivalAirport, "totalTravelers": this.getTotalTraveller(), "ticketClass": this.getTicketClass(flightSearch.ticketClass), "depatureDate": this.departureDate, "arrivalDate": this.returnDate, "tripType": tripTypeString }
            localStorage.setItem('flightHeader', JSON.stringify(flightHeader));
            localStorage.setItem('multipleDest', JSON.stringify(this.multipleDest))
        }
        this.spinnerService.show();
        this.service.callAPI(flightSearch, this.service.PROCESSFLIGHTSEARCH).subscribe(
            flight => {
                if (flight.status == 0) {
                    this.flightHeader = JSON.parse(localStorage.getItem('flightHeader'));
                    localStorage.setItem('flight', JSON.stringify(flight.data));
                    this.flight = flight.data
                    this.popluateFlights()
                    this.getAirlineList()
                    flightSearch.flightItineraryDetail = flightItineraryDetails
                    localStorage.setItem('flightSearch', JSON.stringify(flightSearch));
                    this.flightSearch = flightSearch
                    this.spinnerService.hide();
                    this.modalRef.hide()
                }
            },
            error => {
                console.log(error);
            });
    }

    getTicketClass(ticketClass: number): string {
        if (ticketClass == 1) {
            return 'Economy';
        } else if (ticketClass == 2) {
            return 'Premium';
        } else if (ticketClass == 3) {
            return 'Business';
        } else {
            return 'First Class';
        }
    }

    getAirlineList() {
        let s: { "name": string, "code": string, "minPrice": number }[] = []
        for (let b of this.pricedItineraries) {
            s.push({ "name": b.originDestinationOptions[0].flightSegments[0].airlineName, "code": b.originDestinationOptions[0].flightSegments[0].airlineCode, "minPrice": b.totalFare })
        }
        this.airlines = this.removeDuplicates(s, 'name');
        this.airlines.pop()

        for (let a of this.airlines) {
            let prices: number[] = []
            for (let ss of s) {
                if (a.name == ss.name) {
                    prices.push(ss.minPrice)
                }
            }
            const min = Math.min.apply(Math, prices)
            a.minPrice = min
        }

        this.airlines.sort(function (a, b) {
            var textA = a.name.toUpperCase();
            var textB = b.name.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
    }

    removeDuplicates(originalArray, prop) {
        var newArray = [];
        var lookupObject = {};

        for (var i in originalArray) {
            lookupObject[originalArray[i][prop]] = originalArray[i];
        }

        for (i in lookupObject) {
            newArray.push(lookupObject[i]);
        }
        return newArray;
    }

    filter() {
        let filtered1: PricedItineraries[] = []
        let filtered2: PricedItineraries[] = []
        if (this.airline.name == "SHOW ALL") {
            this.popluateFlights()
            filtered1 = this.pricedItineraries
        } else {
            this.popluateFlights()
            for (let f of this.pricedItineraries) {
                if (f.originDestinationOptions[0].flightSegments[0].airlineName == this.airline.name) {
                    filtered1.push(f)
                }
            }

        }

        for (let p of filtered1) {
            if (this.stops != 2 && this.stops != -1) {
                if (p.originDestinationOptions[0].stops == this.stops) {
                    filtered2.push(p)
                }
            } else {
                if (p.originDestinationOptions[0].stops >= this.stops) {
                    filtered2.push(p)
                }
            }
        }
        this.pricedItineraries = filtered2
    }

    selectAirline(airline) {
        if (airline == '0') {
            airline = { "name": "SHOW ALL", "code": "", "minPrice": 0 }
        }
        this.airline = airline
        this.filter()
    }

    selectStops(stops) {
        this.stops = stops
        this.filter()
    }

}
