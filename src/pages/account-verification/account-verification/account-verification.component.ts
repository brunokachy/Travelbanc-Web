import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Service } from '../../../provider/api.service';
import { AlertComponent } from 'ngx-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    moduleId: module.id,
    selector: 'account_verification',
    templateUrl: 'account-verification.component.html',
    styleUrls: []
})
export class AccountVerificationComponent {
    alerts: any[] = [];


    constructor(private router: Router, private route: ActivatedRoute, private service: Service, private spinnerService: NgxSpinnerService) {
        this.route.params.subscribe(params => {
            this.confirmAccount(params['token'])
        });
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

    confirmAccount(token) {
        if (token == null) {
            this.add('danger', "Account was activation was not successful")
        } else {
            this.spinnerService.show();
            this.service.callAPII({ "token": token }, this.service.CONFIRMREGISTRATION).subscribe(
                data => {
                    this.spinnerService.hide();
                    if (data.status == 'success') {
                        this.add('success', data.message)
                        sessionStorage.setItem("user", JSON.stringify(data.data))
                        window.location.reload();
                    }

                    if (data.status == 'failure') {
                        this.add('danger', data.message)
                    }
                },
                error => {
                    console.log(error);
                    this.spinnerService.hide();
                    this.add('danger', "Account verification was unsuccessful. Please contact admin")
                });
        }


    }

}
