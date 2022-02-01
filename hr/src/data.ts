import {technologiesService, Technology} from "./services/technologies-service";
import {jobOffersService} from "./services/job-offers-service";
import {developersService, DeveloperTechnology, Score} from "./services/developers-service";

//TODO lock storage (load from it even) when is not empty (all data sources like technology, joboffers, developers - if there is lack of one of them then clear)
export function prepareData(): void {

    function addTechToDev(tech: Technology, score: Score) {
        (tech as DeveloperTechnology).score = score;
        return tech as DeveloperTechnology
    }

    let t1: Technology = technologiesService.add({category: 'Cloud', name: 'Google Cloud', theory: false});
    let t2: Technology = technologiesService.add({category: 'Cloud', name: 'AWS', theory: false});
    let t3: Technology = technologiesService.add({category: 'Cloud', name: 'Oracle Cloud', theory: false});
    let t4: Technology = technologiesService.add({category: 'Cloud', name: 'Azure', theory: false});

    let t5: Technology = technologiesService.add({category: 'Java', name: 'Spring', theory: false});
    let t6: Technology = technologiesService.add({category: 'Java', name: 'Spring Boot', theory: false});
    let t7: Technology = technologiesService.add({category: 'Java', name: 'Spark', theory: false});
    let t8: Technology = technologiesService.add({category: 'Big Data', name: 'Apache Spark', theory: false});
    let t9: Technology = technologiesService.add({category: 'General', name: 'TDD', theory: true});

    jobOffersService.add({name: 'Java Developer', technologies: [t5, t6, t7, t8, t9]});
    jobOffersService.add({name: 'DevOps', technologies: [t1, t2, t3, t4]});


    developersService.add({firstName: 'John', lastName: 'Devops', technologies: [
            addTechToDev(t1, Score.SCORE_5),
            addTechToDev(t2, Score.SCORE_5),
            addTechToDev(t3, Score.SCORE_5),
            addTechToDev(t4, Score.SCORE_5)
        ]});

    developersService.add({firstName: 'John', lastName: 'Java', technologies: [
            addTechToDev(t5, Score.SCORE_5),
            addTechToDev(t6, Score.SCORE_5),
            addTechToDev(t7, Score.SCORE_5),
            addTechToDev(t8, Score.SCORE_NO),
            addTechToDev(t9, Score.SCORE_5)
        ]});

}

