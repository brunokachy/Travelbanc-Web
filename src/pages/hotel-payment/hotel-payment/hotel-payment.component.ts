import { Component, ViewChild } from '@angular/core';
import { HotelList } from '../../../models/hotelList';
import { HotelSearch } from '../../../models/hotelSearch';
import { HotelOfferList } from '../../../models/hotelOfferList';
import { Router } from '@angular/router';
import { Service } from '../../../provider/api.service';
import * as moment from 'moment';
import { User } from '../../../models/user';
import { VisitorDetail } from '../../../models/visitorDetails';
import { BookingResponse } from '../../../models/bookingResponse';
import { ModalDirective } from 'ngx-bootstrap';

declare var getpaidSetup
@Component({
    moduleId: module.id,
    selector: 'hotel_payment',
    templateUrl: 'hotel-payment.component.html',
    styleUrls: []
})
export class HotelPaymentComponent {
    hotel: HotelList
    hotelSearch: HotelSearch
    room: HotelOfferList
    nights: number
    contactDetail: User;
    bookingResponse: BookingResponse


    constructor(private router: Router, private service: Service) {
        this.hotel = JSON.parse(localStorage.getItem('hotel'))
        this.hotelSearch = JSON.parse(localStorage.getItem('hotelSearch'));
        this.room = JSON.parse(localStorage.getItem("room"))
        this.contactDetail = JSON.parse(localStorage.getItem("contactDetail"))
        this.calculateNights()
        this.bookingResponse = JSON.parse(localStorage.getItem("bookingResponse"))
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
        if (amount == 0) {
            return 0;
        }
        var str = amount.toString();
        var result = str.slice(0, -2) + "." + str.slice(-2);
        return parseInt(result);
    }

    ravePay() {
        //test key
        // const PBFKey = "FLWPUBK-6a70c6d8b6ce35128f6f8b91a065abe0-X"
        //live key
        const PBFKey = "FLWPUBK-9cb85e4e284f07ad0e6df07daf188b45-X"
        const ref = this;
        var payResponse = null;
        const phoneNumber = this.contactDetail.phoneNumber.replace('+', '')
        const amount = ref.formatCurrency(this.room.price);
        ref.bookingResponse.paidAmount = ref.room.price

        getpaidSetup({
            PBFPubKey: PBFKey,
            customer_email: this.contactDetail.email,
            customer_firstname: this.contactDetail.firstName,
            customer_lastname: this.contactDetail.lastName,
            custom_description: "",
            custom_title: "TravelBanc LTD",
            amount: amount,
            customer_phone: phoneNumber,
            country: "NG",
            txref: this.bookingResponse.referenceNumber,
            integrity_hash: "",
            onclose: function () {
                if (payResponse != null) {
                    localStorage.setItem("viewPaymentResponse", "true")
                    ref.router.navigate(['/payment_response']);
                    window.location.reload();
                }
            },
            callback: function (response) {
                if (response.success == false) {

                } else {
                    payResponse = response.tx.flwRef;
                    localStorage.setItem("paymentRef", response.tx.flwRef)
                    localStorage.setItem("txFee", response.tx.appfee)
                    localStorage.setItem("totalAmount", response.tx.amount + response.tx.appfee)
                    if (response.tx.chargeResponseCode == "00" || response.tx.chargeResponseCode == "0") {

                    } else {
                        console.log("Error paying with rave")
                    }
                }
            }
        });

    }

    goHome() {
        let token = JSON.parse(localStorage.getItem('token'));
        let countries = JSON.parse(localStorage.getItem('countries'));
        localStorage.clear();
        localStorage.setItem('token', JSON.stringify(token));
        localStorage.setItem('countries', JSON.stringify(countries))
        this.router.navigate(['/home']);
        window.location.reload();
    }

}
