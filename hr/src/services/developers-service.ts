import {DataItem, DataService} from "./data-service";
import {Technology} from "./technologies-service";

export interface Developer extends DataItem {
    fullName: string;
    technologies: Array<Technology>;
}

export enum Score {
    SCORE_NONE = 'NONE',
    SCORE_YES = 'YES',
    SCORE_NO = 'NO',
    SCORE_1 = '1',
    SCORE_2 = '2',
    SCORE_3 = '3',
    SCORE_4 = '4',
    SCORE_5 = '5',
}

export const mapFromNumericScore = (score: number | string): Score => {
    return Score['SCORE_' + score];
}

export class DevelopersService extends DataService<Developer> {
}

export const developersService = new DevelopersService('developers', ['fullName']);
