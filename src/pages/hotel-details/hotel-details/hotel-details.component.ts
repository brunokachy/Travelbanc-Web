import { Component, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { Service } from '../../../provider/api.service';
import { HotelList } from '../../../models/hotelList';
import { HotelOfferList } from '../../../models/hotelOfferList';
import { HotelSearch } from '../../../models/hotelSearch';
import * as moment from 'moment';
import { RoomDetailList } from '../../../models/roomDetailList';
import { User } from '../../../models/user';
import { VisitorDetail } from '../../../models/visitorDetails';
import { Country } from '../../../models/country';
import { BookingResponse } from '../../../models/bookingResponse';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap';
import { ReservationOwner } from '../../../models/reservationowner';
import { Booking } from '../../../models/booking';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    moduleId: module.id,
    selector: 'hotel_details',
    templateUrl: 'hotel-details.component.html',
    styleUrls: []
})
export class HotelDetailsComponent {
    hotel: HotelList
    hotelSearch: HotelSearch
    room: HotelOfferList
    nights: number
    modalRef: BsModalRef;

    roomDetailLists: RoomDetailList[] = [];
    contactDetail: User = new User()
    contactPhoneNumber: string
    countryName: string = "";
    countries: Country[] = [];
    visitorDetails: VisitorDetail = new VisitorDetail()
    maxAdultBday: Date;

    login: boolean = false;
    email: string
    password: string
    shouldRegister: boolean = false
    alertMessage: string

    constructor(private modalService: BsModalService, private router: Router, private service: Service, private spinnerService: NgxSpinnerService) {
        this.hotel = JSON.parse(localStorage.getItem('hotel'))
        this.hotelSearch = JSON.parse(localStorage.getItem('hotelSearch'));
        this.room = JSON.parse(localStorage.getItem("room"))
        this.roomDetailLists = this.hotelSearch.roomDetailList
        this.calculateNights()
        this.formatBday()
        this.populateTravellers()
        this.getCountries()
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


    calculateNights() {
        var now = moment(this.hotelSearch.checkInDate, "DD/MM/YYYY"); //todays date
        var end = moment(this.hotelSearch.checkOutDate, "DD/MM/YYYY"); // another date
        var duration = moment.duration(end.diff(now));
        var days = duration.asDays();
        this.nights = days
    }

    formateDate2(date) {
        let a = moment(date, "DD/MM/YYYY").valueOf()
        let d = moment(a).format('dddd');
        return d
    }

    formateDate3(date) {
        let a = moment(date, "DD/MM/YYYY").valueOf()
        let d = moment(a).format('MMM DD, YYYY');
        return d
    }

    formatCurrency(amount: number) {
        var str = amount.toString();
        var result = str.slice(0, -2) + "." + str.slice(-2);
        return parseInt(result);
    }

    formatBday() {
        let d = new Date();
        let year = d.getFullYear();
        let month = d.getMonth();
        let day = d.getDate();
        this.maxAdultBday = new Date(year - 18, month, day)
    }

    formatDate3(date): string {
        var msec = Date.parse(date);
        let d = moment(msec).format("DD/MM/YYYY");
        return d
    }

    populateTravellers() {
        this.visitorDetails.availabilitySignature = localStorage.getItem('availabiitySignature')
        this.visitorDetails.numberOfRooms = this.hotelSearch.numberOfRooms
        for (let u of this.roomDetailLists) {
            for (let m of u.adultsAgeList) {
                let user = new User()
                user.age = m
                u.adultList.push(user)
            }
            for (let m of u.childrenAgeList) {
                let user = new User()
                user.age = m
                u.childrenList.push(user)
            }
        }
        this.visitorDetails.roomDetailList = this.roomDetailLists
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

    proceed() {
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
        this.contactDetail.cityName = this.contactDetail.city
        this.contactDetail.title = parseInt((this.contactDetail.title).toString())
        for (let r of this.roomDetailLists) {
            for (let a of r.adultList) {
                a.title = parseInt((a.title).toString())
            }
            for (let a of r.childrenList) {
                a.title = parseInt((a.title).toString())
            }
        }

        this.visitorDetails.contactInformation = this.contactDetail
        let availabiitySignature = localStorage.getItem('availabilitySignature');
        this.contactDetail.dateOfBirth = this.formatDate3(this.contactDetail.dateOfBirth)
        let requestData = {
            "availabilitySignature": availabiitySignature, "contactInformation": this.contactDetail,
            "numberOfRooms": this.hotelSearch.numberOfRooms, "roomDetailList": this.roomDetailLists
        }
        this.spinnerService.show()
        this.service.callAPI(requestData, this.service.CREATEAFILLIATEHOTELBOOKING).subscribe(
            booking => {
                if (booking.status == 0) {
                    let bookingResponse: BookingResponse = booking.data
                    localStorage.setItem("contactDetail", JSON.stringify(this.contactDetail))
                    if (bookingResponse.referenceNumber == null) {
                        bookingResponse.referenceNumber = bookingResponse.bookingNumber
                    }
                    this.secondBooking(bookingResponse)
                    localStorage.setItem('bookingResponse', JSON.stringify(bookingResponse))
                    localStorage.setItem("viewHotelPayment", "true")
                    this.router.navigate(['/hotel_payment']);
                }
            },
            error => {
                console.log(error);
                this.spinnerService.hide()
                this.alertMessage = "Problem with hotel booking, try again later"
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
        for (let r of this.roomDetailLists) {
            for (let a of r.adultList) {
                let guest: ReservationOwner = new ReservationOwner()
                if (a.title == 4) {
                    guest.titleCode = 0
                } else {
                    guest.titleCode = a.title
                }
                guest.firstName = a.firstName
                guest.lastName = a.lastName
                travellers.push(guest)
            }
            for (let a of r.childrenList) {
                let guest: ReservationOwner = new ReservationOwner()
                if (a.title == 4) {
                    guest.titleCode = 0
                } else {
                    guest.titleCode = a.title
                }
                guest.firstName = a.firstName
                guest.lastName = a.lastName
                travellers.push(guest)
            }
        }


        let booking: Booking = new Booking()
        booking.amount = this.room.price
        booking.description = this.room.roomDescription + ", " + this.nights + "nights"
        booking.reservationType = "Hotel"
        booking.title = this.hotel.hotelName
        booking.travellers = travellers
        booking.reservationOwner = reservationOwner
        booking.checkinDate = this.formateDate3(this.hotelSearch.checkInDate)
        booking.checkoutDate = this.formateDate3(this.hotelSearch.checkOutDate)
        booking.hotelLocation = this.hotelSearch.location.name


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
            || this.contactDetail.title == null) {
            this.alertMessage = "Please fill the Customer Account detail first"
            this.showModal()
        } else {
            this.roomDetailLists[0].adultList[0].firstName = this.contactDetail.firstName
            this.roomDetailLists[0].adultList[0].lastName = this.contactDetail.lastName
            this.roomDetailLists[0].adultList[0].title = this.contactDetail.title
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



