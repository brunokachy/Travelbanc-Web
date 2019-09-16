import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Service } from '../../../provider/api.service';
import { AlertComponent } from 'ngx-bootstrap/alert/alert.component';
import { User } from '../../../models/user';
import { Country } from '../../../models/country';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    moduleId: module.id,
    selector: 'register',
    templateUrl: 'register.component.html',
    styleUrls: []
})
export class RegisterComponent {
    user: User = new User()
    contactPhoneNumber: string
    countryName: string = "";
    countries: Country[] = [];
    maxAdultBday: Date;
    alerts: any[] = [];


    constructor(private router: Router, private service: Service, private spinnerService: NgxSpinnerService) {
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
                    for (let u of data.data) {
                        if (u.name == 'NIGERIA') {
                            this.user.countryName = u.name
                            break
                        }
                    }
                    this.spinnerService.hide();
                }, error => {
                    console.log(error);
                });
        }
    }


    register() {
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
        this.user.titleCode = this.user.title
        this.user.dateOfBirth = moment(this.user.dateOfBirth).format('DD/MM/YYYY');
        this.user.platform = 'Web'
        this.spinnerService.show();
        this.service.callAPII(this.user, this.service.CREATEACCOUNT).subscribe(
            data => {
                if (data.status == "success") {
                    this.spinnerService.hide();
                    this.add('success', "Account Registration was successful")
                    this.user = new User()
                    this.contactPhoneNumber = ""
                }
                if (data.status == "failure") {
                    this.spinnerService.hide();
                    this.add('danger', data.message)
                }
            },
            error => {
                console.log(error);
                this.spinnerService.hide();
                this.add('danger', "Account Registration was not successful")
            });
    }
}
