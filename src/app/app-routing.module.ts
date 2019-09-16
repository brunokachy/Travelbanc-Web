import { HomeComponent } from './../pages/home/home.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from '../pages/page-not-found/page-not-found.component';
import { FlightSearchResultComponent } from '../pages/flight-search-result/flight-search-result.component';
import { AuthGuard } from '../provider/auth-guard.service';
import { FlightDetailComponent } from '../pages/flight-details/flight-detail/flight-detail.component';
import { HotelSearchResultComponent } from '../pages/hotel-search-result/hotel-search-result/hotel-search-result.component';
import { HotelRoomComponent } from '../pages/hotel-room/hotel-room/hotel-room.component';
import { HotelDetailsComponent } from '../pages/hotel-details/hotel-details/hotel-details.component';
import { HotelPaymentComponent } from '../pages/hotel-payment/hotel-payment/hotel-payment.component';
import { FlightPaymentComponent } from '../pages/flight-payment/flight-payment/flight-payment.component';
import { AboutComponent } from '../pages/about/about/about.component';
import { LoginComponent } from '../pages/login/login/login.component';
import { RegisterComponent } from '../pages/register/register/register.component';
import { AccountVerificationComponent } from '../pages/account-verification/account-verification/account-verification.component';
import { ContactusComponent } from '../pages/contactus/contactus.component';
import { DashboardComponent } from '../pages/dashboard/dashboard.component';
import { ProfileComponent } from '../pages/profile/profile.component';
import { PasswordChangeComponent } from '../pages/password-change/password-change.component';
import { PaymentResponseComponent } from '../pages/payment-response/payment-response.component';




const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contactus', component: ContactusComponent },
  { path: 'signin', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'account_verification/:token', component: AccountVerificationComponent },
  { path: 'flight_search_result', component: FlightSearchResultComponent, canActivate: [AuthGuard] },
  { path: 'flight_detail', component: FlightDetailComponent, canActivate: [AuthGuard] },
  { path: 'flight_payment', component: FlightPaymentComponent, canActivate: [AuthGuard] },
  { path: 'hotel_search_result', component: HotelSearchResultComponent, canActivate: [AuthGuard] },
  { path: 'hotel_room', component: HotelRoomComponent, canActivate: [AuthGuard] },
  { path: 'hotel_details', component: HotelDetailsComponent, canActivate: [AuthGuard] },
  { path: 'hotel_payment', component: HotelPaymentComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'password_change', component: PasswordChangeComponent, canActivate: [AuthGuard] },
  { path: 'payment_response', component: PaymentResponseComponent, canActivate: [AuthGuard] },
  //{ path: '', redirectTo: 'home', pathMatch: 'full'  },
  { path: '**', redirectTo: '', pathMatch: 'full'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false, useHash: false } // <-- debugging purposes only
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }

