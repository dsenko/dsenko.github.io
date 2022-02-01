import {DataItem, DataService} from "./data-service";
import {ExcelRow} from "./excel-service";

export enum Required {
    YES = 'YES',
    NO = 'NO'
}

export interface TechnologyExcelRow extends ExcelRow {
    category: string;
    name: string;
    theory?: string;
    required?: Required;
}

export interface Technology extends DataItem {
    category: string;
    name: string;
    theory: boolean;
    checked?: boolean;
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
