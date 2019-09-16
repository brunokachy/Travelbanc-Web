import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { TypeaheadOptions } from 'ngx-bootstrap';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        let url: string = state.url;
        if (url == '/flight_search_result') {
            return this.canViewFlightSearchResultPage(url)
        }
        if (url == '/flight_detail') {
            return this.canViewFlightDetailPage(url)
        }

        if (url == '/flight_payment') {
            return this.canViewFlightPaymentPage(url)
        }

        if (url == '/hotel_payment') {
            return this.canViewHotelPaymentPage(url)
        }

        if (url == '/hotel_search_result') {
            return this.canViewHotelSearchResultPage(url)
        }

        if (url == '/hotel_room') {
            return this.canViewHotelRoomPage(url)
        }

        if (url == '/hotel_details') {
            return this.canViewHotelDetailsPage(url)
        }

        if (url == '/payment_response') {
            return this.canViewPaymentResponsePage(url)
        }

        if (url == '/dashboard') {
            return this.IsUserLoggedIn()
        }

        if (url == '/profile') {
            return this.IsUserLoggedIn()
        }

        if (url == '/password_change') {
            return this.IsUserLoggedIn()
        }
    }

    canViewFlightSearchResultPage(url: string): boolean {
        let canView = localStorage.getItem("viewFlightSearchResult")
        if (canView == 'true') { return true; }
        this.router.navigate(['/home']);
        return false;
    }

    canViewFlightDetailPage(url: string): boolean {
        let canView = localStorage.getItem("viewFlightDetail")
        if (canView == 'true') { return true; }
        // Navigate to the home page with extras
        this.router.navigate(['/home']);
        return false;
    }

    canViewFlightPaymentPage(url: string): boolean {
        let canView = localStorage.getItem("viewFlightPayment")
        if (canView == 'true') { return true; }
        this.router.navigate(['/home']);
        return false;
    }

    canViewHotelPaymentPage(url: string): boolean {
        let canView = localStorage.getItem("viewHotelPayment")
        if (canView == 'true') { return true; }
        this.router.navigate(['/home']);
        return false;
    }

    canViewHotelSearchResultPage(url: string): boolean {
        let canView = localStorage.getItem("viewHotelSearchResult")
        if (canView == 'true') { return true; }
        this.router.navigate(['/home']);
        return false;
    }

    canViewHotelRoomPage(url: string): boolean {
        let canView = localStorage.getItem("viewHotelRoom")
        if (canView == 'true') { return true; }
        this.router.navigate(['/home']);
        return false;
    }

    canViewHotelDetailsPage(url: string): boolean {
        let canView = localStorage.getItem("viewHotelDetails")
        if (canView == 'true') { return true; }
        this.router.navigate(['/home']);
        return false;
    }

    canViewPaymentResponsePage(url: string): boolean {
        let canView = localStorage.getItem("viewPaymentResponse")
        if (canView == 'true') { return true; }
        this.router.navigate(['/home']);
        return false;
    }

    IsUserLoggedIn(): boolean {
        let user = sessionStorage.getItem("user")
        if (user != null) { return true }
        this.router.navigate(['/home']);
        return false;
    }
}