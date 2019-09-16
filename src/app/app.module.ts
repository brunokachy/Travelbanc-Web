import { Service } from './../provider/api.service';
import { PageNotFoundComponent } from './../pages/page-not-found/page-not-found.component';
import { HomeComponent } from './../pages/home/home.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { RatingModule } from 'ngx-bootstrap/rating';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FlightSearchResultComponent } from '../pages/flight-search-result/flight-search-result.component';
import { AuthGuard } from '../provider/auth-guard.service';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { FlightDetailComponent } from '../pages/flight-details/flight-detail/flight-detail.component';
import { HotelSearchResultComponent } from '../pages/hotel-search-result/hotel-search-result/hotel-search-result.component';
import { HotelRoomComponent } from '../pages/hotel-room/hotel-room/hotel-room.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { HotelDetailsComponent } from '../pages/hotel-details/hotel-details/hotel-details.component';
import { HotelPaymentComponent } from '../pages/hotel-payment/hotel-payment/hotel-payment.component';
import { FlightPaymentComponent } from '../pages/flight-payment/flight-payment/flight-payment.component';
import { AboutComponent } from '../pages/about/about/about.component';
import { LoginComponent } from '../pages/login/login/login.component';
import { RegisterComponent } from '../pages/register/register/register.component';
import { AlertModule } from 'ngx-bootstrap/alert';
import { AgmCoreModule } from '@agm/core';
import { AccountVerificationComponent } from '../pages/account-verification/account-verification/account-verification.component';
import { ContactusComponent } from '../pages/contactus/contactus.component';
import { DashboardComponent } from '../pages/dashboard/dashboard.component';
import { ProfileComponent } from '../pages/profile/profile.component';
import { PasswordChangeComponent } from '../pages/password-change/password-change.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PaymentResponseComponent } from '../pages/payment-response/payment-response.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PageNotFoundComponent,
    FlightSearchResultComponent,
    FlightDetailComponent,
    FlightPaymentComponent,
    HotelPaymentComponent,
    HotelSearchResultComponent,
    HotelRoomComponent,
    HotelDetailsComponent,
    AboutComponent,
    RegisterComponent,
    LoginComponent,
    AccountVerificationComponent,
    ContactusComponent,
    DashboardComponent,
    ProfileComponent,
    PasswordChangeComponent,
    PaymentResponseComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    AppRoutingModule,
    FormsModule,
    NgxSpinnerModule,
    BsDatepickerModule.forRoot(),
    TabsModule.forRoot(),
    TypeaheadModule.forRoot(),
    ModalModule.forRoot(),
    RatingModule.forRoot(),
    PopoverModule.forRoot(),
    CollapseModule.forRoot(),
    CarouselModule.forRoot(),
    AlertModule.forRoot(),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDlKw8SYI0QykbQL02oZ_dAwmjeITq1k0w'
    })
  ],
  providers: [Service, AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
