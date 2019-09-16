import { Component } from '@angular/core';
import { Service } from '../../provider/api.service';
import { Router } from '@angular/router';
import { User } from '../../models/user';
import { Country } from '../../models/country';
import { AlertComponent } from 'ngx-bootstrap';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    moduleId: module.id,
    selector: 'profile',
    templateUrl: 'profile.component.html',
    styleUrls: []
})


export class ProfileComponent {
    user: User
    contactPhoneNumber: string
    countryName: string = "";
    countries: Country[] = [];
    maxAdultBday: Date;
    alerts: any[] = [];

    constructor(private service: Service, private spinnerService: NgxSpinnerService) {
        this.formatBday()
        this.getCountries()
    }

    add(type, message): void {
        this.alerts.push({
            type: type,
            msg: message,
            timeout: 5000
        });
    }

    onClosed(dismissedAlert: AlertComponent): void {
        this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
    }

    formatBday() {
        let d = new Date();
        let year = d.getFullYear();
        let month = d.getMonth();
        let day = d.getDate();
        this.maxAdultBday = new Date(year - 18, month, day)
    }

    getCountries() {
        if (localStorage.getItem('token') != null) {
            this.spinnerService.show();
            this.service.callAPI('', this.service.GETCOUNTRIES)
                .subscribe(data => {
                    this.countries = data.data
                    this.user = JSON.parse(sessionStorage.getItem("user"));
                    this.getTitlename(this.user.title)
                    this.contactPhoneNumber = this.user.phoneNumber
                    this.spinnerService.hide();
                }, error => {
                    console.log(error);
                });
        }
    }

    updateProfile() {
        if (this.contactPhoneNumber.indexOf("+") > -1) {
            this.user.phoneNumber = this.contactPhoneNumber;
        } else {
            for (let c of this.countries) {
                if (this.user.countryName == c.name) {
                    this.user.countryCode = c.code

                    if (!(c.dialingCode.indexOf("+") > -1)) {
                        this.user.phoneNumber = '+' + c.dialingCode + '' + this.contactPhoneNumber;
                    } else {
                        this.user.phoneNumber = c.dialingCode + '' + this.contactPhoneNumber;
                    }
                }
            }
        }
        this.user.dateOfBirth = moment(this.user.dateOfBirth).format('DD/MM/YYYY');
        this.user.titleCode = this.user.title
        this.spinnerService.show();
        this.service.callAPII(this.user, this.service.UPDATEPROFILE).subscribe(
            data => {
                if (data.status == "success") {
                    this.spinnerService.hide();
                    this.add('success', "Profile Update was successful")
                    sessionStorage.setItem("user", JSON.stringify(this.user))
                }
                if (data.status == "failure") {
                    this.spinnerService.hide();
                    this.add('danger', data.message)
                }
            },
            error => {
                console.log(error);
                this.spinnerService.hide();
                this.add('danger', "Profile Update was not successful")
            });
    }

    getTitlename(title) {
        if (title != null) {
            if (title == 'MISS') {
                this.user.title = 1
            }
            if (title == "MASTER") {
                this.user.title = 2
            }
            if (title == "MRS") {
                this.user.title = 3
            }
            if (title == "MR") {
                this.user.title = 0
            }
        }
    }
}
