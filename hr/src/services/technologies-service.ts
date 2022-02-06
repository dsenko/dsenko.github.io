import {DataItem, DataService} from "./data-service";

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
}

export class TechnologiesService extends DataService<Technology> {

    mergeNotExisting(technologies: Array<Technology>): void {

        for (let technology of technologies) {

            if (this.getByKey(technology.key) === null) {
                this.add(technology);
            }

        }

    }

}

export const technologiesService = new TechnologiesService('technologies', ['category', 'name']);
