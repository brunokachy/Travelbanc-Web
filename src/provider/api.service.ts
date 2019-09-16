import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
//import CryptoJS from 'crypto-js';
import * as sha1 from 'js-sha1';
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

@Injectable()
export class Service {

  //Affliate Test
  // private BASEURL = 'http://139.162.210.123:8086/v1/';
  // private BASEURLI = 'http://localhost:8080/';
  // private publicKey = 'D4071DA79A7C79CD9A099A1C36CAEAB6';
  // public secretKey = 'DBB049465F3F79176658A7F77C05D8A0';
  // private affiliateCode = 'TBAF0000000059';

  //Affilate Live
  private BASEURL = 'https://api.travelbeta.com/v1/';
  private BASEURLI = 'https://mytravelbanc.com/';
  private publicKey = '80A9BE4C9DAAB845FA19E8FA79A6C0A4';
  public secretKey = 'E08137513A794B957AE97DEA4CA717CD';
  private affiliateCode = 'TBAF0000004385';

  public RESENDACTIVATIONCODE = this.BASEURL + 'create-account/resend-activation-code';
  public CONFIRMREGISTRATION = this.BASEURLI + 'confirm_registration';
  public CREATEACCOUNT = this.BASEURLI + 'create_account';
  public LOGIN = this.BASEURLI + 'sign_in';
  public BOOK = this.BASEURLI + 'booking';
  public PAYMENTVERIFICATION = this.BASEURLI + 'payment_verification'
  public GETBOOKINGS = this.BASEURLI + 'get_booking'
  public UPDATEPROFILE = this.BASEURLI + 'update_profile'
  public CHANGEPASSWORD = this.BASEURLI + 'change_password'
  public RESETPASSWORD = this.BASEURLI + 'reset_password'
  public SENDAPPDOWNLOADLINK = this.BASEURLI + 'send_app_download_link'

  public GETAIRPORTBYSEARCHTERM = this.BASEURL + 'flight/get-airports-by-search-term';
  public GETCITY = this.BASEURL + 'flight/get-city';
  public GETAIRPORT = this.BASEURL + 'flight/get-airport';
  public GETC0UNTRY = this.BASEURL + 'get-country';
  public GETCOUNTRIES = this.BASEURL + 'get-countries';
  public PROCESSFLIGHTSEARCH = this.BASEURL + 'flight/process-flight-search';
  public GETLOCATIONS = this.BASEURL + 'hotel/get-locations'
  public SEARCHHOTELS = this.BASEURL + 'hotel/search-hotels'
  public SEARCHHOTELOFFERS = this.BASEURL + 'hotel/search-hotel-offers'
  public CHECKOFFERAVAILABILITY = this.BASEURL + 'hotel/check-offer-availability'
  public CREATEAFILLIATEHOTELBOOKING = this.BASEURL + 'hotel/create-affiliate-booking'
  public CREATEAFILLIATEFLIGHTBOOKING = this.BASEURL + 'flight/create-affiliate-booking'
  constructor(public http: Http) { }

  callAPI(requestData: any, url: string) {
    return this.http
      .post(url, requestData, this.header(this.getAccessToken()))
      .map((response: Response) => response.json());
  }

  callAPII(requestData: any, url: string) {
    return this.http
      .post(url, requestData, this.headerI())
      .map((response: Response) => response.json());
  }

  search(terms: Observable<string>) {
    return terms.debounceTime(400)
      .distinctUntilChanged()
      .switchMap(term => this.searchEntries(term));
  }

  searchEntries(term) {
    let requestData = JSON.stringify({ "searchTerm": term, "limit": 10 });

    return this.http
      .post(this.GETAIRPORTBYSEARCHTERM, requestData, this.header(this.getAccessToken()))
      .map((response: Response) => response.json());
  }



  generateNewToken() {
    let token = { "expirationTime": "", "token": "" }
   // var hash = CryptoJS.SHA1(this.affiliateCode + this.secretKey);
	var hash = sha1(this.affiliateCode + this.secretKey).toString();
	
    this.http
      .post(this.BASEURL + 'auth/verify-affiliate', JSON.stringify({
        "affiliateCode": this.affiliateCode,
        "key": this.publicKey, "hash": hash.toString()
      }), this.header(''))
      .map((response: Response) => response.json())
      .subscribe(
        data => {
          token.expirationTime = data.data.expirationTime
          token.token = data.data.token
          localStorage.setItem('token', JSON.stringify(token));
        },
        error => {
          console.log(error);
        });
  }

  getSavedToken() {
    let token = JSON.parse(localStorage.getItem('token'));
    return token;
  }

  validateToken(token): Boolean {
    if (token == null) {
      return false;
    }
    var currentTime = new Date();
    var tokenExpirationTime = new Date(token.expirationTime);
    var isValid = currentTime.getTime() <= tokenExpirationTime.getTime();
    return isValid;
  }

  getAccessToken(): string {
    var token = this.getSavedToken();
    var isValid = this.validateToken(token);
    if (isValid) {
      return this.getSavedToken().token;
    } else {
      this.generateNewToken();
      return this.getSavedToken().token;
    }
  }
  private header(token: string) {
    //  console.log(token)
    let headers = new Headers({ 'Content-Type': 'application/json' });
    headers.append('Authorization', token)
    return new RequestOptions({ headers: headers });
  }

  private headerI() {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    return new RequestOptions({ headers: headers });
  }
}