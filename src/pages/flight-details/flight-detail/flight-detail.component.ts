import { Component, TemplateRef, ViewChild } from '@angular/core';
import { PricedItineraries } from '../../../models/pricedItineraries';
import { Router } from '@angular/router';
import { OriginDestinationOptions } from '../../../models/originDestinationOptions';
import * as moment from 'moment';
import { User } from '../../../models/user';
import { Passenger } from '../../../models/passenger';
import { FlightSearch } from '../../../models/flightsearch';
import { Country } from '../../../models/country';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap';
import { Service } from '../../../provider/api.service';
import { BookingResponse } from '../../../models/bookingResponse';
import { ReservationOwner } from '../../../models/reservationowner';
import { Booking } from '../../../models/booking';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    moduleId: module.id,
    selector: 'flight_detail',
    templateUrl: 'flight-detail.component.html',
    styleUrls: []
})
export class FlightDetailComponent {
    pricedItinerary: PricedItineraries
    flightSearch: FlightSearch
    flightHeader: any
    originDestinationOptions: OriginDestinationOptions[] = [];
    modalRef: BsModalRef;

    user = new User();
    contactDetail: User = new User();
    countries: Country[] = [];
    contactPhoneNumber: string;
    passengers: Passenger[] = [];
    maxAdultBday: Date;
    maxChildBday: Date;
    minChildBday: Date;
    maxInfantBday: Date;
    minInfantBday: Date;
    login: boolean = false;
    email: string
    password: string
    shouldRegister: boolean = false
    alertMessage: string
    constructor(private modalService: BsModalService, private router: Router, private service: Service, private spinnerService: NgxSpinnerService) {
        this.pricedItinerary = JSON.parse(localStorage.getItem('pricedItineraries'));
        this.flightSearch = JSON.parse(localStorage.getItem('flightSearch'));
        this.flightHeader = JSON.parse(localStorage.getItem('flightHeader'));
        this.getCountries()
        this.populateFlightDetails()
        this.createTravellerDetail();
        this.formatPassengerBday()
    }

    getCountries() {
        this.spinnerService.show()
        this.service.callAPI('', this.service.GETCOUNTRIES)
            .subscribe(data => {
                this.countries = data.data
                this.checkProfile()
                this.spinnerService.hide()
            }, error => {
                console.log(error);
            });
    }


    populateFlightDetails() {
        for (let u of this.pricedItinerary.originDestinationOptions) {
            this.originDestinationOptions.push(u);
        }
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

    formatCurrency(amount: number) {
        var str = amount.toString();
        var result = str.slice(0, -2)
        return parseInt(result);
    }

    formatTime2(date: string) {
        let d = moment(date, "DD/MM/YYYY HH:mm").format('HH:mm');
        return d;
    }

    formatDate2(date: string) {
        let d = moment(date, "DD/MM/YYYY HH:mm").format('DD MMM YY');
        return d;
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

    formatDate3(date): string {
        var msec = Date.parse(date);
        let d = moment(msec).format("DD/MM/YYYY");
        return d
    }

    onPassengerBirthdayChange(e, i) {
        this.passengers[i].dateOfBirth = this.formatDate3(e)
    }

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

    checkProfile() {
        if (JSON.parse(sessionStorage.getItem("user")) != null) {
            this.contactDetail = JSON.parse(sessionStorage.getItem("user"))
            this.contactDetail.city = this.contactDetail.cityName
            this.contactPhoneNumber = this.contactDetail.phoneNumber
            this.getTitlename(this.contactDetail.title)
            this.login = true;
        } else {
            this.contactDetail.firstName = ''
            this.contactDetail.lastName = ''
            this.contactDetail.dateOfBirth = ''
            this.contactDetail.email = ''
            this.contactDetail.firstName = ''
            this.contactPhoneNumber = ''
            this.contactDetail.address = ''
            this.contactDetail.cityName = ''
            this.contactDetail.countryName = 'NIGERIA'
        }
    }

    createTravellerDetail() {
        for (let index = 1; index < (this.flightSearch.travellerDetail.adults + 1); index++) {
            let p = new Passenger()
            p.dateOfBirth = ''
            p.passportExpiryDate = '';
            p.passportIssuingCountryCode = '';
            p.passportNumber = '';
            p.ageGroup = 3;
            this.passengers.push(p)
        }

        for (let index = 1; index < (this.flightSearch.travellerDetail.children + 1); index++) {
            let p = new Passenger();
            p.dateOfBirth = ''
            p.passportExpiryDate = '';
            p.passportIssuingCountryCode = '';
            p.passportNumber = '';
            p.ageGroup = 2;
            this.passengers.push(p)
        }

        for (let index = 1; index < (this.flightSearch.travellerDetail.infants + 1); index++) {
            let p = new Passenger();
            p.dateOfBirth = ''
            p.passportExpiryDate = '';
            p.passportIssuingCountryCode = '';
            p.passportNumber = '';
            p.ageGroup = 1;
            this.passengers.push(p)
        }
    }

    formatPassengerBday() {
        let d = new Date();
        let year = d.getFullYear();
        let month = d.getMonth();
        let day = d.getDate();
        this.maxAdultBday = new Date(year - 18, month, day)
        this.maxChildBday = new Date(year - 3, month, day)
        this.minChildBday = new Date(year - 18, month, day)
        this.maxInfantBday = new Date(year, month, day)
        this.minInfantBday = new Date(year - 1, month, day)
    }

    formatFlightLocation(name) {
        name = name.substr(0, name.indexOf('-'));
        return name
    }

    buyTicket() {
        if (this.contactPhoneNumber.indexOf("+") > -1) {
            this.contactDetail.phoneNumber = this.contactPhoneNumber;
            for (let c of this.countries) {
                if (this.contactDetail.countryName == c.name) {
                    this.contactDetail.countryCode = c.code
                }
            }
        }
        if (!(this.contactPhoneNumber.indexOf("+") > -1)) {
            for (let c of this.countries) {
                if (this.contactDetail.countryName == c.name) {
                    this.contactDetail.countryCode = c.code
                    if (!(c.dialingCode.indexOf("+") > -1)) {
                        this.contactDetail.phoneNumber = '+' + c.dialingCode + '' + this.contactPhoneNumber;
                    } else {
                        this.contactDetail.phoneNumber = c.dialingCode + '' + this.contactPhoneNumber;
                    }
                }
            }
        }
        this.contactDetail.dateOfBirth = this.formatDate3(this.contactDetail.dateOfBirth)
        this.contactDetail.title = parseInt((this.contactDetail.title).toString())
        for (let p of this.passengers) {
            p.title = parseInt((p.title).toString())
        }

        let requestData = {
            "pricedItinerary": this.pricedItinerary, "contactInformation": this.contactDetail,
            "travellers": this.passengers
        }
        this.spinnerService.show()
        this.service.callAPI(requestData, this.service.CREATEAFILLIATEFLIGHTBOOKING).subscribe(
            booking => {
                if (booking.status == 0) {
                    let bookingResponse: BookingResponse = booking.data
                    localStorage.setItem('bookingResponse', JSON.stringify(bookingResponse))
                    localStorage.setItem('contactDetail', JSON.stringify(this.contactDetail));
                    this.secondBooking(bookingResponse)
                    localStorage.setItem("viewFlightPayment", "true")
                    this.router.navigate(['/flight_payment']);
                }
            },
            error => {
                console.log(error);
                this.spinnerService.hide()
                this.alertMessage = "Problem with flight booking, try again later"
                this.showModal()
            });
        if (this.shouldRegister) {
            this.contactDetail.platform = 'Web'
            this.service.callAPII(this.contactDetail, this.service.CREATEACCOUNT).subscribe(
                data => {
                },
                error => {
                    console.log(error);
                });
        }
    }

    secondBooking(bookingResponse: BookingResponse) {
        let reservationOwner: ReservationOwner = new ReservationOwner()
        reservationOwner.address = this.contactDetail.address + ", " + this.contactDetail.city + ", " + this.contactDetail.countryName
        reservationOwner.dateOfBirth = this.contactDetail.dateOfBirth
        reservationOwner.email = this.contactDetail.email
        reservationOwner.firstName = this.contactDetail.firstName
        reservationOwner.lastName = this.contactDetail.lastName
        reservationOwner.phoneNumber = this.contactDetail.phoneNumber
        if (this.contactDetail.title == 4) {
            reservationOwner.titleCode = 0
        } else {
            reservationOwner.titleCode = this.contactDetail.title
        }

        let travellers: ReservationOwner[] = [];
        for (let p of this.passengers) {
            let traveller: ReservationOwner = new ReservationOwner()
            traveller.firstName = p.firstName
            traveller.lastName = p.lastName
            if (p.title == 4) {
                traveller.titleCode = 0
            } else {
                traveller.titleCode = p.title
            }
            traveller.dateOfBirth = p.dateOfBirth
            travellers.push(traveller)
        }

        let booking: Booking = new Booking()
        booking.amount = this.pricedItinerary.totalFare
        booking.description = this.flightHeader.ticketClass + "(" + this.flightHeader.tripType + ")"
        booking.reservationType = "Flight"
        booking.title = this.flightHeader.departureAirport.cityName + " to " + this.flightHeader.destinationAirport.cityName
        booking.travellers = travellers
        booking.reservationOwner = reservationOwner
        booking.ticketLimitTime = this.pricedItinerary.ticketLimitTime

        let requestData = { "bookingResponse": bookingResponse, "reservation": booking }
        this.service.callAPII(requestData, this.service.BOOK).subscribe(
            data => {
                localStorage.setItem('secondbookingResponse', JSON.stringify(data.data))
                this.spinnerService.hide()
            },
            error => {
                console.log(error);
            });
    }

    setAdultContact() {
        if (this.contactDetail.firstName == '' || this.contactDetail.lastName == ''
            || this.contactDetail.title == null || this.contactDetail.dateOfBirth == null) {
            this.alertMessage = "Please fill the Customer Account detail first"
            this.showModal()
        } else {
            this.passengers[0].firstName = this.contactDetail.firstName
            this.passengers[0].lastName = this.contactDetail.lastName
            this.passengers[0].title = this.contactDetail.title
            this.passengers[0].dateOfBirth = this.formatDate3(this.contactDetail.dateOfBirth)
        }
    }

    openSearchModal(template: TemplateRef<any>) {
        this.modalRef = this.modalService.show(template);
    }

    signin() {
        this.service.callAPII({ "email": this.email, "password": this.password }, this.service.LOGIN).subscribe(
            data => {
                if (data.status == 'failure') {
                    this.alertMessage = data.message
                    this.showModal()
                }
                if (data.status == 'success') {
                    sessionStorage.setItem("user", JSON.stringify(data.data))
                    this.checkProfile()
                    this.modalRef.hide()
                }
            },
            error => {
                console.log(error);
                this.alertMessage = " Problem signing in"
                this.showModal()
            });

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

    getTitlename(title) {
        if (title != null) {
            if (title == "MISS") {
                this.contactDetail.title = 1
            }
            if (title == "MASTER") {
                this.contactDetail.title = 2
            }
            if (title == "MRS") {
                this.contactDetail.title = 3
            }
            if (title == "MR") {
                this.contactDetail.title = 4
            }
        }
    }

}



