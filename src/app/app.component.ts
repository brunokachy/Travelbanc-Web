import { Component } from '@angular/core';
import { Service } from '../provider/api.service';
import { User } from '../models/user';
import { Country } from '../models/country';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent {
  title = 'app';
  user: User
  isLogin: boolean = false
  interval: any;
  firstname: string
  countryCode: string
  phoneNumber: string
  countries: Country[] = []
  userAPK: User = new User()

  constructor(private service: Service) {
    this.service.generateNewToken()
    this.checkUserLogin()
    this.getCountries()
  }

  getCountries() {
    if (localStorage.getItem('token') != null) {
      this.service.callAPI('', this.service.GETCOUNTRIES)
        .subscribe(data => {
          localStorage.setItem('countries', JSON.stringify(data.data))
          this.countries = data.data
          for (let u of data.data) {
            if (u.name == 'NIGERIA') {
              this.countryCode = u.dialingCode
              break
            }
          }
        }, error => {
          console.log(error);
        });
    }
  }

  sendApk() {
    this.userAPK.phoneNumber = this.countryCode + "" + this.phoneNumber
    this.service.callAPII(this.userAPK, this.service.SENDAPPDOWNLOADLINK).subscribe(
      data => {
        if (data.status == "success") {
          this.getCountries()
          this.phoneNumber = ""
        }
        if (data.status == "failure") {
          console.log(data.message)
        }
      },
      error => {
        console.log(error);
      });
  }

  signOut() {
    sessionStorage.clear()
    this.user = null
    this.isLogin = false
    window.location.reload();
  }

  checkUserLogin() {
    if (JSON.parse(sessionStorage.getItem('user')) == null) {
      this.user = null
    }
    if (JSON.parse(sessionStorage.getItem('user')) != null) {
      this.user = JSON.parse(sessionStorage.getItem('user'))
      this.firstname = this.user.firstName
      this.isLogin = true
    }
  }

  home() {
    window.location.reload()
  }


}
