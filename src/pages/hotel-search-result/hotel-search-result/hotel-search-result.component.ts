import { Component, TemplateRef, ViewChild } from '@angular/core';
import { HotelLocation } from '../../../models/hotelLocation';
import { Hotels } from '../../../models/hotels';
import { HotelList } from '../../../models/hotelList';
import * as moment from 'moment';
import { BsModalRef, BsModalService, TypeaheadMatch, ModalDirective } from 'ngx-bootstrap';
import { Service } from '../../../provider/api.service';
import { Router } from '@angular/router';
import { RoomDetailList } from '../../../models/roomDetailList';
import { Observable } from 'rxjs/Observable';
import { HotelSearch } from '../../../models/hotelSearch';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    moduleId: module.id,
    selector: 'hotel_search_result',
    templateUrl: 'hotel-search-result.component.html',
    styleUrls: []
})
export class HotelSearchResultComponent {
    hotels: Hotels
    hotelSearch: HotelSearch
    hotelList: HotelList[] = []

    modalRef: BsModalRef;

    noOfRooms: number = 1;
    hotelLocation: HotelLocation;
    hotel: string
    roomDetailLists: RoomDetailList[] = [];
    checkinDate: string = ''
    checkoutDate: string = ''
    minCheckinDate: Date;
    maxCheckinDate: Date;
    minCheckoutDate: Date;
    maxCheckoutDate: Date;
    hotelLocations: HotelLocation[] = [];
    hotelDatasource: Observable<any> = Observable.of([]);

    sortValue: string = 'Lowest Price'
    rating: string = '0'
    ratingList: { "rating": string, "size": number }[] = []
    facilities: { "name": string, "realname": string, "checked": boolean }[] = []

    constructor(private modalService: BsModalService, private service: Service, private router: Router, private spinnerService: NgxSpinnerService) {
        this.hotels = JSON.parse(localStorage.getItem('hotels'))
        this.hotelSearch = JSON.parse(localStorage.getItem('hotelSearch'));
        this.populateHotels()
        this.populateRatingList()
        this.populateFacilities()
    }

    populateHotels() {
        this.hotelList = this.hotels.hotelList
        this.sort()
    }

    populateRatingList() {
        let rating: { "rating": string, "size": number }[] = []

        for (let r of this.hotelList) {
            rating.push({ "rating": r.starRating, "size": 0 })
        }
        this.ratingList = this.removeDuplicates(rating, "rating")
        for (let r of this.hotelList) {
            for (let l of this.ratingList) {
                if (r.starRating == l.rating) {
                    l.size++
                }
            }
        }
        this.ratingList.pop()
        this.ratingList.sort(function (obj1, obj2) {
            return parseInt(obj2.rating) - parseInt(obj1.rating);
        });
    }

    populateFacilities() {
        let facilities: { "name": string, "realname": string, "checked": boolean }[] = []

        for (let h of this.hotelList) {
            for (let f of h.facilityList) {
                facilities.push({ "name": f.type.replace(/_/g, " "), "realname": f.type, "checked": false })
            }
        }
        this.facilities = this.removeDuplicates(facilities, 'name')
        this.facilities.pop()

        this.facilities.sort(function (a, b) {
            var textA = a.name.toUpperCase();
            var textB = b.name.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
    }

    removeDuplicates(originalArray, prop) {
        var newArray = [];
        var lookupObject = {};

        for (var i in originalArray) {
            lookupObject[originalArray[i][prop]] = originalArray[i];
        }

        for (i in lookupObject) {
            newArray.push(lookupObject[i]);
        }
        return newArray;
    }

    filter() {
        let filtered1: HotelList[] = []
        let filtered2: HotelList[] = []

        this.populateHotels()
        for (let f of this.hotelList) {
            for (let ff of f.facilityList) {
                for (let fff of this.facilities) {
                    if (ff.type == fff.realname && fff.checked == true) {
                        filtered1.push(f)
                    }
                }
            }
        }

        if (filtered1.length == 0) {
            filtered1 = this.hotelList
        } else {
            filtered1 = this.removeDuplicates(filtered1, "hotelName")
            filtered1.pop()
        }


        if (this.rating == "0") {
            filtered2 = filtered1
        } else {
            for (let f of filtered1) {
                if (f.starRating == this.rating) {
                    filtered2.push(f)
                }
            }
        }
        this.hotelList = filtered2
    }



    selectRating(rating) {
        this.rating = rating
        this.filter()
    }

    selectFacility(event, i) {
        if (event.target.checked) {
            this.facilities[i].checked = true
        } else {
            this.facilities[i].checked = false
        }
        this.filter()
    }

    sort() {
        if (this.sortValue == 'Lowest Price') {
            this.hotelList.sort(function (obj1, obj2) {
                return obj1.minimumPrice - obj2.minimumPrice;
            });
        }
        if (this.sortValue == 'Highest Price') {
            this.hotelList.sort(function (obj1, obj2) {
                return obj2.minimumPrice - obj1.minimumPrice;
            });
        }
        if (this.sortValue == 'Highest Rating') {
            this.hotelList.sort(function (obj1, obj2) {
                return parseFloat(obj2.starRating) - parseFloat(obj1.starRating);
            });
        }
    }

    selectHotel(hotel: HotelList) {
        localStorage.setItem('hotel', JSON.stringify(hotel))
        localStorage.setItem('hotelsSignature', JSON.stringify(this.hotels.searchSignature))
        localStorage.setItem("viewHotelRoom", "true")
        this.router.navigate(['/hotel_room']);
    }

    formatCurrency(amount: number) {
        var str = amount.toString();
        var result = str.slice(0, -2) + "." + str.slice(-2);
        return parseInt(result);
    }

    formateDate3(date) {
        let a = moment(date, "DD/MM/YYYY").valueOf()
        let d = moment(a).format('MMM DD, YYYY');
        return d
    }

    formateDate2(date) {
        let a = moment(date, "DD/MM/YYYY").valueOf()
        let d = moment(a).format('ddd Do MMM, YYYY');
        return d
    }

    formateDate(date) {
        let a = moment(date, "ddd Do MMM, YYYY").valueOf()
        let d = moment(a).format('DD/MM/YYYY');
        return d
    }

    formatCheckinDate() {
        var d = new Date();
        var year = d.getFullYear();
        var month = d.getMonth();
        var day = d.getDate();
        this.minCheckinDate = d
        this.minCheckoutDate = d
        this.maxCheckinDate = new Date(year + 2, month, day)
        this.maxCheckoutDate = new Date(year + 2, month, day)
    }

    formateCheckoutDate(checkinDate) {
        var msec = Date.parse(checkinDate);
        var dd = new Date(msec);
        var year = dd.getFullYear();
        var month = dd.getMonth();
        var day = dd.getDate();
        this.minCheckoutDate = new Date(year, month, day + 1)
        this.maxCheckoutDate = new Date(year + 2, month, day)
    }

    checkInputH(e) {
        if (e.length > 1) {
            this.getLocationsBySearchTerm(e)
        }
    }

    getLocationsBySearchTerm(searchValue: string) {
        let requestData = JSON.stringify({ "searchTerm": searchValue, "maxLimit": 10 });
        this.service.callAPI(requestData, this.service.GETLOCATIONS).subscribe(
            data => {
                if (data.status == 0) {
                    this.hotelLocations = [];
                    this.hotelLocations = data.data
                }
            },
            error => {
                console.log(error);
            });
    }

    checkRooms(e) {
        if (e > this.roomDetailLists.length) {
            for (var i = this.roomDetailLists.length; i < e; i++) {
                let roomDetail = new RoomDetailList()
                roomDetail.adultsAgeList = [20]
                roomDetail.childrenAgeList = []
                roomDetail.numberOfAdults = 1
                roomDetail.numberOfChildren = 0
                this.roomDetailLists.push(roomDetail)
            }
        }

        if (e < this.roomDetailLists.length) {
            let newValue = this.roomDetailLists.length - e
            for (var i = 0; i < newValue; i++) {
                this.roomDetailLists.pop()
            }
        }
    }

    setRooms() {
        let roomDetail = new RoomDetailList()
        roomDetail.adultsAgeList = [20]
        roomDetail.childrenAgeList = []
        roomDetail.numberOfAdults = 1
        roomDetail.numberOfChildren = 0
        this.roomDetailLists.push(roomDetail)
    }

    setChildrenAge(e, o) {
        if (e > this.roomDetailLists[o].childrenAgeList.length) {
            for (var i = 0; i < e; i++) {
                this.roomDetailLists[o].childrenAgeList[i] = 0
            }
        }

        if (e < this.roomDetailLists[o].childrenAgeList.length) {
            let newValue = this.roomDetailLists[o].childrenAgeList.length - e
            for (var i = 0; i < newValue; i++) {
                this.roomDetailLists[o].childrenAgeList.pop()
            }
        }

    }

    setAdultAge(e, o) {
        if (e > this.roomDetailLists[o].adultsAgeList.length) {
            for (var i = 0; i < e; i++) {
                this.roomDetailLists[o].adultsAgeList[i] = 20
            }
        }

        if (e < this.roomDetailLists[o].adultsAgeList.length) {
            let newValue = this.roomDetailLists[o].adultsAgeList.length - e
            for (var i = 0; i < newValue; i++) {
                this.roomDetailLists[o].adultsAgeList.pop()
            }
        }
    }

    formatHotelAddress(name) {
        name = name.substring(name.indexOf(";") + 1);
        return name
    }

    typeaheadOnSelectH(e: TypeaheadMatch): void {
        this.hotelLocation = e.item;
    }

    searchHotel() {
        this.hotelSearch.checkInDate = this.formateDate(this.checkinDate)
        this.hotelSearch.checkOutDate = this.formateDate(this.checkoutDate)
        this.hotelSearch.location = this.hotelLocation
        this.hotelSearch.numberOfRooms = this.noOfRooms
        this.hotelSearch.resultLimit = 100
        this.hotelSearch.roomDetailList = this.roomDetailLists
        this.spinnerService.show();
        this.service.callAPI(this.hotelSearch, this.service.SEARCHHOTELS).subscribe(
            hotel => {
                if (hotel.status == 0) {
                    localStorage.setItem('hotels', JSON.stringify(hotel.data));
                    localStorage.setItem('hotelSearch', JSON.stringify(this.hotelSearch))
                    this.hotels = hotel.data
                    this.populateHotels()
                    this.populateRatingList()
                    this.populateFacilities()
                    this.spinnerService.hide()
                    this.modalRef.hide()
                }
            },
            error => {
                console.log(error);
                this.spinnerService.hide()
                this.showModal()
            });

    }

    openSearchModal(template: TemplateRef<any>) {
        this.formatCheckinDate()
        this.hotelSearch = JSON.parse(localStorage.getItem('hotelSearch'));
        this.hotel = this.hotelSearch.location.name
        this.hotelLocation = this.hotelSearch.location
        this.checkinDate = this.formateDate2(this.hotelSearch.checkInDate)
        this.checkoutDate = this.formateDate2(this.hotelSearch.checkOutDate)
        this.noOfRooms = this.hotelSearch.numberOfRooms
        this.roomDetailLists = []
        this.roomDetailLists = this.hotelSearch.roomDetailList

        this.hotelDatasource = Observable.create((observer: any) => {
            observer.next(this.hotelLocations);
        }).mergeMap((token: string) => Observable.of(this.hotelLocations));

        this.modalRef = this.modalService.show(template);
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


}
