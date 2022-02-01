import {DataItem, DataService} from "./data-service";
import {Technology} from "./technologies-service";
import {ExcelRow} from "./excel-service";

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

export function mapFromNumericScore(score: number | string) : Score {
    return Score['SCORE_'+score];
}

export interface DeveloperExcelRow extends ExcelRow {
    firstName: string;
    lastName: string;
    technologies: string;
}

export interface DeveloperTechnologyExcelRow extends ExcelRow {
    category: string;
    name: string;
    score: string;
}

export interface DeveloperTechnology extends Technology {
    score: Score;
}

export interface Developer extends DataItem {
    firstName: string;
    lastName: string;
    technologies: Array<DeveloperTechnology>;
}

export class DevelopersService extends DataService<Developer> {
}

export const developersService = new DevelopersService('developers', ['firstName', 'lastName']);
