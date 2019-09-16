import { Component, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { HotelList } from '../../../models/hotelList';
import { Service } from '../../../provider/api.service';
import { HotelOffer } from '../../../models/hotelOffer';
import { } from '@types/googlemaps';
import { HotelSearch } from '../../../models/hotelSearch';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap';
import { HotelOfferList } from '../../../models/hotelOfferList';
import { NgxSpinnerService } from 'ngx-spinner';
import { GoogleMapsAPIWrapper, AgmMap, LatLngBounds, LatLngBoundsLiteral } from '@agm/core';

@Component({
    moduleId: module.id,
    selector: 'hotel_room',
    templateUrl: 'hotel-room.component.html',
    styleUrls: []
})
export class HotelRoomComponent {
    hotel: HotelList
    hotelOffer: HotelOffer
    hotelSearch: HotelSearch
    room: HotelOfferList
    childCount: number = 0
    adultCount: number = 0
    modalRef: BsModalRef;

    // google maps
    zoom: number = 14;
    title: string = '';
    lat: number = 0;
    lng: number = 0;

    @ViewChild('map') gmapElement: AgmMap;
    map: google.maps.Map;

    constructor(private router: Router, private service: Service, private modalService: BsModalService, private spinnerService: NgxSpinnerService) {
        this.hotel = JSON.parse(localStorage.getItem('hotel'))
        this.hotelSearch = JSON.parse(localStorage.getItem('hotelSearch'));
        this.getHotelOffers()
        this.getGuestCount()
        this.createMap()
    }

    createMap() {
        this.title = this.hotel.description
        this.lat = parseFloat(this.hotel.hotelCoordinate.latitude)
        this.lng = parseFloat(this.hotel.hotelCoordinate.longitude)

    }

    getGuestCount() {
        for (let c of this.hotelSearch.roomDetailList) {
            this.childCount = c.numberOfChildren + this.childCount
            this.adultCount = c.numberOfAdults + this.adultCount
        }
    }



    formatCurrency(amount: number) {
        var str = amount.toString();
        var result = str.slice(0, -2) + "." + str.slice(-2);
        return parseInt(result);
    }

    formatHotelAddress(name) {
        name = name.substring(name.indexOf(";") + 1);
        return name
    }

    getHalfHotelImageList(): number {
        let n = (this.hotel.imageList.length) / 2
        return n;
    }

    getHotelOffers() {
        let hotelSignature = localStorage.getItem("hotelsSignature")
        let requestData = {
            "hotelId": this.hotel.hotelId,
            "searchSignature": hotelSignature
        }
        this.spinnerService.show();
        this.service.callAPI(requestData, this.service.SEARCHHOTELOFFERS).subscribe(
            hotelOffer => {
                if (hotelOffer.status == 0) {
                    this.hotelOffer = hotelOffer.data
                }
                this.spinnerService.hide()
            },
            error => {
                console.log(error);
                this.spinnerService.hide()
            });

    }

    chooseIcon(facility) {
        if (facility == 'PARKING') {
            return 'im-parking'
        }
        if (facility == 'FITNESS_FACILITY') {
            return 'im-fitness'
        }
        if (facility == 'RESTAURANT') {
            return 'im-restaurant'
        }
        if (facility == 'BAR') {
            return 'im-bar'
        }
        if (facility == 'MEETING_FACILITY') {
            return 'im-business-person'
        }
        if (facility == 'BREAKFAST') {
            return 'im-restaurant'
        }
        if (facility == 'ROOM_SERVICE') {
            return 'im-spa'
        }
        if (facility == 'AIR_CONDITIONING') {
            return 'im-bed'
        }
        if (facility == 'INTERNET') {
            return 'im-wi-fi'
        }
        if (facility == 'LIFT') {
            return 'im-wheel-chair'
        }
        if (facility == 'WHEEL_CHAIR') {
            return 'im-wheel-chair'
        }
        if (facility == 'CHILD_CARE') {
            return 'im-children'
        }
    }

    selectRoom(offer: HotelOfferList) {
        localStorage.setItem('room', JSON.stringify(offer))
        let requestData = {
            "hotelId": this.hotelOffer.hotelId,
            "offerId": offer.offerId,
            "offerSignature": offer.offerSignature,
            "searchSignature": this.hotelOffer.searchSignature
        }
        this.spinnerService.show()
        this.service.callAPI(requestData, this.service.CHECKOFFERAVAILABILITY).subscribe(
            hotelOffer => {
                if (hotelOffer.status == 0) {
                    if (hotelOffer.data.available == true) {
                        localStorage.setItem('availabilitySignature', hotelOffer.data.signature)
                        this.spinnerService.hide()
                        localStorage.setItem("viewHotelDetails", "true")
                        this.router.navigate(['/hotel_details']);
                    } else {
                        this.spinnerService.hide()
                        this.showModal()
                    }
                }
            },
            error => {
                console.log(error);
                this.spinnerService.hide()
                this.showModal()
            });
    }

    @ViewChild('autoShownModal') autoShownModal: ModalDirective;
    isModalShown: boolean = false;

    showModal(): void {
        this.isModalShown = true;
    }

    hideModal(): void {
        this.autoShownModal.hide();
    }

    onHidden(): void {
        this.isModalShown = false;
    }

    openSearchModal(template: TemplateRef<any>, room: HotelOfferList) {
        this.room = room
        this.modalRef = this.modalService.show(template);
    }


}
