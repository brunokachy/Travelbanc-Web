import { Component, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { Service } from '../../provider/api.service';
import { TypeaheadMatch, ModalDirective } from 'ngx-bootstrap';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { FlightSearch } from '../../models/flightsearch';
import { Router } from '@angular/router';
import { HotelLocation } from '../../models/hotelLocation';
import { RoomDetailList } from '../../models/roomDetailList';
import { HotelSearch } from '../../models/hotelSearch';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    moduleId: module.id,
    selector: 'home',
    templateUrl: 'home.component.html',
    styleUrls: []
})

export class HomeComponent {
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

    multipleDest: { "departureAirport": any, "arrivalAirport": any, "departureDate": string }[] = []

    noOfRooms: number = 1;
    hotelLocation: HotelLocation;
    hotel: string
    roomDetailLists: RoomDetailList[] = [];
    checkinDate: string = ''
    checkoutDate: string = ''
    minCheckinDate: Date;
    maxCheckinDate: Date;
    minCheckoutDate: Date;
    maxCheckoutDate: Date;
    hotelLocations: HotelLocation[] = [];
    hotelDatasource: Observable<any> = Observable.of([]);

    constructor(private service: Service, private router: Router, private spinner: NgxSpinnerService) {
        this.getCountries()
        let token = JSON.parse(localStorage.getItem('token'));
        let countries = JSON.parse(localStorage.getItem('countries'));
        localStorage.clear();
        localStorage.setItem('token', JSON.stringify(token));
        localStorage.setItem('countries', JSON.stringify(countries))

        this.formatDepartureDate()
        this.formatCheckinDate()
        this.populateMultipleDest()
        this.setRooms()

        this.datasource = Observable.create((observer: any) => {
            // Runs on every search
            observer.next(this.airports);
        }).mergeMap((token: string) => Observable.of(this.airports));

        this.hotelDatasource = Observable.create((observer: any) => {
            observer.next(this.hotelLocations);
        }).mergeMap((token: string) => Observable.of(this.hotelLocations));


        localStorage.setItem("viewFlightSearchResult", "false")
        localStorage.setItem("viewFlightDetail", "false")
        localStorage.setItem("viewFlightPayment", "false")
        localStorage.setItem("viewHotelPayment", "false")
        localStorage.setItem("viewHotelSearchResult", "false")
        localStorage.setItem("viewHotelRoom", "false")
        localStorage.setItem("viewHotelDetails", "false")
    }

    getCountries() {
        if (localStorage.getItem('countries') == null) {
            if (localStorage.getItem('token') != null) {
                this.service.callAPI('', this.service.GETCOUNTRIES)
                    .subscribe(data => {
                        localStorage.setItem('countries', JSON.stringify(data.data))
                    }, error => {
                        console.log(error);
                    });
            }
        }
    }


    populateMultipleDest() {
        this.multipleDest.push({ "departureAirport": null, "arrivalAirport": null, "departureDate": null })
        this.multipleDest.push({ "departureAirport": null, "arrivalAirport": null, "departureDate": null })
        // this.multipleDest.push({ "departureAirport": null, "arrivalAirport": null, "departureDate": null })
    }

    typeaheadOnSelectM(e: TypeaheadMatch, type: string, index: number): void {
        if (type == 'Departure') {
            this.multipleDest[index].departureAirport = e.item;
            this.getAirportCountry(this.multipleDest[index].departureAirport)
        }
        if (type == 'Destination') {
            this.multipleDest[index].arrivalAirport = e.item
            this.getAirportCountry(this.multipleDest[index].arrivalAirport)
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

    typeaheadOnSelectH(e: TypeaheadMatch): void {
        this.hotelLocation = e.item;
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
            flightSearch.flightItineraryDetail.push({ "originAirportCode": this.departureAirport.iataCode, "destinationAirportCode": this.destinationAirport.iataCode, "departureDate": this.formatDate(this.departureDate) });
            let flightHeader = { "departureAirport": this.departureAirport, "destinationAirport": this.destinationAirport, "totalTravelers": this.getTotalTraveller(), "ticketClass": this.getTicketClass(flightSearch.ticketClass), "depatureDate": this.departureDate, "arrivalDate": this.returnDate, "tripType": tripTypeString }
            localStorage.setItem('flightHeader', JSON.stringify(flightHeader));
        }
        if (tripType == '2') {
            tripTypeString = "Round Trip"
            flightSearch.flightItineraryDetail.push({ "originAirportCode": this.departureAirport.iataCode, "destinationAirportCode": this.destinationAirport.iataCode, "departureDate": this.formatDate(this.departureDate) });
            flightSearch.flightItineraryDetail.push({ "originAirportCode": this.destinationAirport.iataCode, "destinationAirportCode": this.departureAirport.iataCode, "departureDate": this.formatDate(this.returnDate) });
            let flightHeader = { "departureAirport": this.departureAirport, "destinationAirport": this.destinationAirport, "totalTravelers": this.getTotalTraveller(), "ticketClass": this.getTicketClass(flightSearch.ticketClass), "depatureDate": this.departureDate, "arrivalDate": this.returnDate, "tripType": tripTypeString }
            localStorage.setItem('flightHeader', JSON.stringify(flightHeader));
        }
        if (tripType == '3') {
            let index = this.multipleDest.length - 1
            tripTypeString = "Multi Trip"
            for (let m of this.multipleDest) {
                flightSearch.flightItineraryDetail.push({ "originAirportCode": m.departureAirport.iataCode, "destinationAirportCode": m.arrivalAirport.iataCode, "departureDate": this.formatDate(m.departureDate) });
            }
            let flightHeader = { "departureAirport": this.multipleDest[0].departureAirport, "destinationAirport": this.multipleDest[index].arrivalAirport, "totalTravelers": this.getTotalTraveller(), "ticketClass": this.getTicketClass(flightSearch.ticketClass), "depatureDate": this.departureDate, "arrivalDate": this.returnDate, "tripType": tripTypeString }
            localStorage.setItem('flightHeader', JSON.stringify(flightHeader));
            localStorage.setItem('multipleDest', JSON.stringify(this.multipleDest))
        }
        this.spinner.show();

        this.service.callAPI(flightSearch, this.service.PROCESSFLIGHTSEARCH).subscribe(
            flight => {
                if (flight.status == 0) {
                    localStorage.setItem('flight', JSON.stringify(flight.data));
                    flightSearch.flightItineraryDetail = flightItineraryDetails
                    localStorage.setItem('flightSearch', JSON.stringify(flightSearch));
                    this.spinner.hide();
                    localStorage.setItem("viewFlightSearchResult", "true")
                    this.router.navigate(['/flight_search_result']);
                }
            },
            error => {
                console.log(error);
                this.spinner.hide();
                this.showModal()
            });
    }

    formatCheckinDate() {
        var d = new Date();
        var year = d.getFullYear();
        var month = d.getMonth();
        var day = d.getDate();
        this.minCheckinDate = d
        this.minCheckoutDate = d
        this.maxCheckinDate = new Date(year + 2, month, day)
        this.maxCheckoutDate = new Date(year + 2, month, day)
    }

    formateCheckoutDate(checkinDate) {
        var msec = Date.parse(checkinDate);
        var dd = new Date(msec);
        var year = dd.getFullYear();
        var month = dd.getMonth();
        var day = dd.getDate();
        this.minCheckoutDate = new Date(year, month, day + 1)
        this.maxCheckoutDate = new Date(year + 2, month, day)
    }

    formatDepartureDate() {
        var d = new Date();
        var year = d.getFullYear();
        var month = d.getMonth();
        var day = d.getDate();
        this.minDepartureDate = d
        this.maxDepartureDate = new Date(year + 1, month, day)
        this.minReturnDate = d
        this.maxReturnDate = new Date(year + 1, month, day)
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

    formatDate(date): string {
        var msec = Date.parse(date);
        let d = moment(msec).format("DD/MM/YYYY");
        return d
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

    checkInputH(e) {
        if (e.length > 1) {
            this.getLocationsBySearchTerm(e)
        }
    }

    // getAirports(token: string) {
    //     let requestData = JSON.stringify({ "searchTerm": token, "limit": 10 });
    //     let airports = []
    //     this.service.callAPI(requestData, this.service.GETAIRPORTBYSEARCHTERM).subscribe(
    //         data => {
    //             if (data.status == 0) {
    //                 for (let u of data.data) {
    //                     let airport = u
    //                     this.service.callAPI(JSON.stringify({ "cityCode": airport.cityCode }), this.service.GETCITY).subscribe(
    //                         city => {
    //                             if (city.status == 0) {
    //                                 let countries = JSON.parse(localStorage.getItem("countries"))
    //                                 for (let c of countries) {
    //                                     if (c.code == city.data.countryCode) {
    //                                         airport.country = c.name
    //                                         airport.displayName = airport.name + ' (' + airport.cityCode + ') ' + airport.cityName + ', ' + airport.country
    //                                         airports.push(airport)
    //                                         if (airports.length == data.data.length) {
    //                                             this.airports = []
    //                                             this.airports = airports
    //                                         }
    //                                     }
    //                                 }
    //                             }
    //                         });
    //                 }
    //             }
    //         },
    //         error => {
    //             console.log(error);
    //         });
    // }

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

    getLocationsBySearchTerm(searchValue: string) {
        let requestData = JSON.stringify({ "searchTerm": searchValue, "maxLimit": 10 });
        this.service.callAPI(requestData, this.service.GETLOCATIONS).subscribe(
            data => {
                if (data.status == 0) {
                    this.hotelLocations = [];
                    this.hotelLocations = data.data
                }
            },
            error => {
                console.log(error);
            });
    }

    checkRooms(e) {
        if (e > this.roomDetailLists.length) {
            for (var i = this.roomDetailLists.length; i < e; i++) {
                let roomDetail = new RoomDetailList()
                roomDetail.adultsAgeList = [20]
                roomDetail.childrenAgeList = []
                roomDetail.numberOfAdults = 1
                roomDetail.numberOfChildren = 0
                this.roomDetailLists.push(roomDetail)
            }
        }

        if (e < this.roomDetailLists.length) {
            let newValue = this.roomDetailLists.length - e
            for (var i = 0; i < newValue; i++) {
                this.roomDetailLists.pop()
            }
        }
    }

    setRooms() {
        let roomDetail = new RoomDetailList()
        roomDetail.adultsAgeList = [20]
        roomDetail.childrenAgeList = []
        roomDetail.numberOfAdults = 1
        roomDetail.numberOfChildren = 0
        this.roomDetailLists.push(roomDetail)
    }

    addDestination() {
        this.multipleDest.push({ "departureAirport": null, "arrivalAirport": null, "departureDate": null })
    }

    removeDestination() {
        this.multipleDest.pop()
    }

    setChildrenAge(e, o) {
        if (e > this.roomDetailLists[o].childrenAgeList.length) {
            for (var i = 0; i < e; i++) {
                console.log(i)
                this.roomDetailLists[o].childrenAgeList[i] = 0
            }
        }

        if (e < this.roomDetailLists[o].childrenAgeList.length) {
            let newValue = this.roomDetailLists[o].childrenAgeList.length - e
            for (var i = 0; i < newValue; i++) {
                this.roomDetailLists[o].childrenAgeList.pop()
            }
        }

    }

    setAdultAge(e, o) {
        if (e > this.roomDetailLists[o].adultsAgeList.length) {
            for (var i = 0; i < e; i++) {
                this.roomDetailLists[o].adultsAgeList[i] = 20
            }
        }

        if (e < this.roomDetailLists[o].adultsAgeList.length) {
            let newValue = this.roomDetailLists[o].adultsAgeList.length - e
            for (var i = 0; i < newValue; i++) {
                this.roomDetailLists[o].adultsAgeList.pop()
            }
        }
    }

    searchHotel() {
        let hotelSearch = new HotelSearch();
        hotelSearch.checkInDate = this.formatDate(this.checkinDate)
        hotelSearch.checkOutDate = this.formatDate(this.checkoutDate)
        hotelSearch.location = this.hotelLocation
        hotelSearch.numberOfRooms = this.noOfRooms
        hotelSearch.resultLimit = 100
        hotelSearch.roomDetailList = this.roomDetailLists
        this.spinner.show();
        this.service.callAPI(hotelSearch, this.service.SEARCHHOTELS).subscribe(
            hotel => {
                if (hotel.status == 0) {
                    localStorage.setItem('hotels', JSON.stringify(hotel.data));
                    localStorage.setItem('hotelSearch', JSON.stringify(hotelSearch))
                    this.spinner.hide()
                    localStorage.setItem("viewHotelSearchResult", "true")
                    this.router.navigate(['/hotel_search_result']);
                }
            },
            error => {
                console.log(error);
                this.spinner.hide()
                this.showModal()
            });

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
            console.log('The maximum number of travellers allowed is 9')
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
            console.log('The maximum number of adult travellers allowed is 5')
        } else {
            this.adultTraveller = this.adultTraveller + 1;
            this.addTotalTraveller();
        }
    }

    checkChildMax() {
        if (this.childTraveller == 5) {
            this.travellerAlert = "The maximum number of child travellers allowed is 5"
            console.log('The maximum number of child travellers allowed is 5')
        } else {
            this.childTraveller = this.childTraveller + 1;
            this.addTotalTraveller();
        }
    }

    checkInfantAdultRatio(name) {
        if (this.adultTraveller == this.infantTraveller) {
            this.travellerAlert = "The number of Infants cannot exceed the number of adults. Ratio is 1:1."
            console.log('The number of Infants cannot exceed the number of adults. Ratio is 1:1.')
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

    @ViewChild('autoShownModal') autoShownModal: ModalDirective;
    isModalShown: boolean = false;

    showModal(): void {
        this.isModalShown = true;
    }

    hideModal(): void {
        this.autoShownModal.hide();
    }

    onHidden(): void {
        this.isModalShown = false;
    }

}

