import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Service } from '../../provider/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HotelOfferList } from '../../models/hotelOfferList';
import { BookingResponse } from '../../models/bookingResponse';

@Component({
    moduleId: module.id,
    selector: 'payment_response',
    templateUrl: 'payment-response.component.html',
    styleUrls: []
})
export class PaymentResponseComponent {
    paymentRef: string
    totalAmount: number = 0
    txFee: number = 0.00
    fare: number = 0.00
    bookingResponse: BookingResponse
    alerts: any[] = [];

    constructor(private router: Router, private service: Service, private spinner: NgxSpinnerService) {
        this.bookingResponse = JSON.parse(localStorage.getItem("bookingResponse"))
        this.paymentRef = localStorage.getItem("paymentRef")
        this.totalAmount = JSON.parse(localStorage.getItem("totalAmount"))
        this.txFee = JSON.parse(localStorage.getItem("txFee"))
        this.fare = this.totalAmount - this.txFee
        this.paymentVerification()
    }

    add(type, message): void {
        this.alerts.push({
            type: type,
            msg: message,
            timeout: 5000
        });
    }

    paymentVerification() {
        //test key
        // const SECKKey = "FLWSECK-1b58418c24909e64c469f9ac6c50a002-X"
        //live key
        const SECKKey = "FLWSECK-a300c1366e3a49b3bcdedc97f4129767-X"
        let requestData = JSON.stringify({
            "flwRef": this.bookingResponse.referenceNumber,
            "secret": SECKKey,
            "amount": this.fare,
            "paymententity": 1,
            "paymentRef": this.paymentRef,
            "paymentCode": 'F03'
        });

        this.spinner.show()
        this.service.callAPII(requestData, this.service.PAYMENTVERIFICATION).subscribe(
            data => {
                if (data.status == 'success') {
                    this.spinner.hide()
                    this.add("success", "Payment Verification was successfully")
                }
                if (data.status == 'failure') {
                    this.spinner.hide()
                    this.add("danger", "Payment Verification was not successfully. Please contact admin.")
                }
            },
            error => {
                console.log(error);
                this.spinner.hide()
                this.add("danger", "Payment Verification was not successfully. Please contact admin.")
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
