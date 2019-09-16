import { User } from './user';
export class RoomDetailList {
    public numberOfAdults: number
    public numberOfChildren: number
    public adultsAgeList: number[] = [];
    public childrenAgeList: number[] = [];
    public adultList: User[] = [];
    public childrenList: User[] = [];

    constructor(
    ) { }
}