import { Component } from '@angular/core';
import { User } from '../../models/user';
import { Service } from '../../provider/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertComponent } from 'ngx-bootstrap';

@Component({
    moduleId: module.id,
    selector: 'password_change',
    templateUrl: 'password-change.component.html',
    styleUrls: []
})
export class PasswordChangeComponent {
    user: User
    currentPassword: string
    newPassword: string
    confirmPassword: string
    alerts: any[] = [];

    constructor(private service: Service, private spinnerService: NgxSpinnerService) {
        this.user = JSON.parse(sessionStorage.getItem("user"));
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

    changePassword() {
        if (this.newPassword != this.confirmPassword) {
            this.add('danger', "New password and confirm password did not match. Please try again!")
            return
        }

        let requestData = { "currentPassword": this.currentPassword, "newPassword": this.newPassword, "email": this.user.email }

        this.spinnerService.show();
        this.service.callAPII(requestData, this.service.CHANGEPASSWORD).subscribe(
            data => {
                if (data.status == "success") {
                    this.spinnerService.hide();
                    this.add('success', "Password Change was successful")
                }
                if (data.status == "failure") {
                    this.spinnerService.hide();
                    this.add('danger', data.message)
                }
            },
            error => {
                console.log(error);
                this.spinnerService.hide();
                this.add('danger', "Password Change was not successful")
            });

    }
}
