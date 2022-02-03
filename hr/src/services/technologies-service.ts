import {DataItem, DataService} from "./data-service";
import {ExcelRow} from "./excel-service";

export enum Importance{
    MUST_HAVE = 'MUST_HAVE',
    NICE_TO_HAVE = 'NICE_TO_HAVE',
    NOT_APPLICABLE = 'NOT_APPLICABLE'
}

export interface TechnologyExcelRow extends ExcelRow {
    category: string;
    name: string;
    theory?: string;
    importance?: Importance;
}

export interface Technology extends DataItem {
    category: string;
    name: string;
    theory: boolean;
    checked?: boolean;
    importance?: Importance;
}

export class TechnologiesService extends DataService<Technology> {

    mergeNotExisting(technologies: Array<Technology>) : void {

        for(let technology of technologies){

            if(this.getByKey(technology.key) === null){
                this.add(technology);
            }

        }

    }

}

export const technologiesService = new TechnologiesService('technologies', ['category', 'name']);
