import { Component, ViewChild } from '@angular/core';
import { BookingResponse } from '../../../models/bookingResponse';
import { User } from '../../../models/user';
import { PricedItineraries } from '../../../models/pricedItineraries';
import { Service } from '../../../provider/api.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
declare var getpaidSetup
@Component({
    moduleId: module.id,
    selector: 'flight_payment',
    templateUrl: 'flight-payment.component.html',
    styleUrls: []
})
export class FlightPaymentComponent {
    pricedItinerary: PricedItineraries;
    contactDetail: User;
    bookingResponse: BookingResponse
    constructor(private service: Service, private router: Router, private spinner: NgxSpinnerService) {
        this.pricedItinerary = JSON.parse(localStorage.getItem('pricedItineraries'));
        this.contactDetail = JSON.parse(localStorage.getItem("contactDetail"))
        this.bookingResponse = JSON.parse(localStorage.getItem("bookingResponse"))
    }

    formatFlightLocation(name) {
        name = name.substr(0, name.indexOf('-'));
        return name
    }

    formatTime2(date: string) {
        let d = moment(date, "DD/MM/YYYY HH:mm").format('HH:mm');
        return d;
    }

    formatDate2(date: string) {
        let d = moment(date, "DD/MM/YYYY HH:mm").format('DD MMM YY');
        return d;
    }

    formatCurrency(amount: number) {
        var str = amount.toString();
        var result = str.slice(0, -2)
        return parseInt(result);
    }

    formatDuration(departureTime: string, arrivalTime: string) {
        let a = moment(arrivalTime, "DD/MM/YYYY HH:mm").valueOf()
        let b = moment(departureTime, "DD/MM/YYYY HH:mm").valueOf()
        let c: number = a - b
        let tempTime = moment.duration(c);
        return tempTime.hours() + 'h ' + tempTime.minutes() + 'm'
    }

    calculateLayoverTime(arrivalTime: string, departureTime: string) {
        let a = moment(arrivalTime, "DD/MM/YYYY HH:mm").valueOf()
        let b = moment(departureTime, "DD/MM/YYYY HH:mm").valueOf()
        let c: number = b - a
        let tempTime = moment.duration(c);
        return tempTime.hours() + 'h ' + tempTime.minutes() + 'm'
    }

    ravePay() {
        //test key
        // const PBFKey = "FLWPUBK-6a70c6d8b6ce35128f6f8b91a065abe0-X"
        //live key
        const PBFKey = "FLWPUBK-9cb85e4e284f07ad0e6df07daf188b45-X"
        const ref = this;
        var payResponse = null;
        const phoneNumber = this.contactDetail.phoneNumber.replace('+', '')
        const amount = ref.formatCurrency(this.pricedItinerary.totalFare);
        ref.bookingResponse.paidAmount = ref.pricedItinerary.totalFare

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
