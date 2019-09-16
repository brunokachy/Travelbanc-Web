import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Service } from '../../../provider/api.service';
import { AlertComponent } from 'ngx-bootstrap/alert/alert.component';
import { User } from '../../../models/user';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    moduleId: module.id,
    selector: 'signin',
    templateUrl: 'login.component.html',
    styleUrls: []
})
export class LoginComponent {
    user: User = new User()
    alerts: any[] = [];
    forgotPassword: boolean = false
    constructor(private router: Router, private service: Service, private spinnerService: NgxSpinnerService) {

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

    resetPassword() {
        this.forgotPassword = true
    }

    signin() {
        this.forgotPassword = false
    }


    logging() {
        this.spinnerService.show();

        if (this.forgotPassword) {
            this.service.callAPII(this.user, this.service.RESETPASSWORD).subscribe(
                data => {
                    if (data.status == 'failure') {
                        this.add('danger', data.message)
                        this.spinnerService.hide();
                    }
                    if (data.status == 'success') {
                        this.add('success', "Check your mail to retrieve your new password!")
                        this.user = new User()
                        this.spinnerService.hide();
                    }

                },
                error => {
                    console.log(error);
                    this.add('danger', "Problem reseting password")
                    this.spinnerService.hide();
                });
        }

        if (!this.forgotPassword) {
            this.service.callAPII(this.user, this.service.LOGIN).subscribe(
                data => {
                    if (data.status == 'failure') {
                        this.add('danger', data.message)
                        this.spinnerService.hide();
                    }
                    if (data.status == 'success') {
                        sessionStorage.setItem("user", JSON.stringify(data.data))
                        this.spinnerService.hide();
                        this.router.navigate(['/dashboard']);
                        window.location.reload();
                    }

                },
                error => {
                    console.log(error);
                    this.add('danger', "Problem signing in")
                    this.spinnerService.hide();
                });
        }

    }

}
