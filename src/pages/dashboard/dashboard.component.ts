import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Service } from '../../provider/api.service';
import { User } from '../../models/user';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
    moduleId: module.id,
    selector: 'dashboard',
    templateUrl: 'dashboard.component.html',
    styleUrls: []
})
export class DashboardComponent {
    user: User;
    flightCount: number = 0;
    hotelCount: number = 0;
    bookingCount: number = 0;
    bookings: any

    constructor(private service: Service, private router: Router) {
        this.user = JSON.parse(sessionStorage.getItem("user"));
        this.getBookings()
    }

    getBookings() {
        this.service.callAPI(this.user, this.service.GETBOOKINGS)
            .subscribe(data => {
                this.bookings = data.data
                for (let b of data.data) {
                    if (b.reservationType == 'FLIGHT') {
                        this.flightCount++
                    }

                    if (b.reservationType == 'HOTEL') {
                        this.hotelCount++
                    }
                    this.bookingCount++
                }
            }, error => {
                console.log(error);
            });

    }

    goToBookingPage(booking) {
        if (booking == 'flight') {
            this.router.navigate(['/home'], { fragment: "tab2" });

        }

        if (booking == 'hotel') {
            this.router.navigate(['/home'], { fragment: "tab1" });
        }

        window.location.reload();
    }

    formatCurrency(amount: number) {
        if (amount == 0) {
            return 0;
        }
        var str = amount.toString();
        var result = str.slice(0, -2) + "." + str.slice(-2);
        return parseInt(result);
    }
}
