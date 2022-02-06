import {DataItem, DataService} from "./data-service";
import {Technology} from "./technologies-service";

export interface JobOffer extends DataItem {
    name: string;
    technologies: Array<Technology>;
}

export class JobOffersService extends DataService<JobOffer> {
}

export const jobOffersService = new JobOffersService('job-offers', ['name']);
