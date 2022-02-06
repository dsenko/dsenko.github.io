import {DataItem, DataService} from "./data-service";
import {MenuItem} from "primereact/menuitem";
import {Score} from "./developers-service";

export enum YesNo {
    YES = 'YES',
    NO = 'NO'
}

export const yesNoToBool = (value: YesNo) : boolean => {
    return value === YesNo.YES;
}

export const boolToYesNo = (value: boolean) : YesNo => {
    return value ? YesNo.YES : YesNo.NO;
}

export enum Importance {
    MUST_HAVE = 'MUST_HAVE',
    NICE_TO_HAVE = 'NICE_TO_HAVE',
    NOT_APPLICABLE = 'NOT_APPLICABLE'
}

export interface Technology extends DataItem {
    category?: string;
    name?: string;
    theory?: YesNo | boolean;
    importance?: Importance;
    score?: Score;
}

export class TechnologiesService extends DataService<Technology> {

     getCategories(): Array<MenuItem> {

        let categoriesSet: Set<string> = new Set();

        for (let technology of this.getItems()) {
            categoriesSet.add(technology.category);
        }

        let categoriesArr: Array<string> = Array.from(categoriesSet);
        categoriesArr.unshift('Any');

        return categoriesArr.map((category: string) => {
            return {
                label: category
            }
        });

    }

}

export const technologiesService = new TechnologiesService('technologies', ['category', 'name']);
window['technologiesService'] = technologiesService;
