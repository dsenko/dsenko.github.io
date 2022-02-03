import React from "react";
import {DefaultProps, DefaultState, State} from "../state";
import {Table, TableColumn, TableColumnType, TableRow} from "./Table";
import {Developer, developersService, DeveloperTechnology, Score} from "../services/developers-service";
import {ExcelRow} from "../services/excel-service";
import {JobOffer, jobOffersService} from "../services/job-offers-service";
import {Importance, Technology} from "../services/technologies-service";
import {Utils} from "../utils";

interface DeveloperScore extends TableRow, ExcelRow {
    developer: string;
    jobOffer: string;
    score: string;
}

interface ScoringProps extends DefaultProps {
}

interface ScoringState extends DefaultState {
    scores: Array<DeveloperScore>;
    developers: Array<Developer>;
    jobOffers: Array<JobOffer>;
}

export class Scoring extends State<ScoringProps, ScoringState> {

    private cols: Array<TableColumn> = [
        {
            header: 'Developer',
            field: 'developer',
            editable: false,
            sortable: true,
            type: TableColumnType.TEXT
        },
        {
            header: 'Job offer',
            field: 'jobOffer',
            editable: false,
            sortable: true,
            type: TableColumnType.TEXT
        },
        {
            header: 'Score',
            field: 'score',
            editable: false,
            sortable: true,
            type: TableColumnType.TEXT
        },

    ]

    state: ScoringState = {
        scores: [],
        developers: [],
        jobOffers: []
    }

    componentDidMount(): void {

        this.setSingle('developers', developersService.getImmutableItems());
        this.setSingle('jobOffers', jobOffersService.getImmutableItems());
        this.prepareScores();

        developersService.on((items: Array<Developer>) => {
            this.setSingle('developers', items);
            this.prepareScores();
        });

        jobOffersService.on((items: Array<JobOffer>) => {
            this.setSingle('jobOffers', items);
            this.prepareScores();
        });

    }

    private prepareScores(): void {

        this.state.scores = [];

        for (let developer of this.state.developers) {

            for (let jobOffer of this.state.jobOffers) {

                this.state.scores.push({
                    developer: developer.firstName + ' ' + developer.lastName,
                    jobOffer: jobOffer.name,
                    score: this.calculateScore(jobOffer.technologies, developer.technologies)
                });

            }

        }

        this.setSelf('scores');

    }

    private calculateScore(jobOfferTechnologies: Array<Technology>, developerTechnologies: Array<DeveloperTechnology>) : string {

        let score: number = 0;

        function calcForImportance(developerScore: Score, givenScore: number, importance: Importance) {


            if(importance === Importance.MUST_HAVE && (developerScore === Score.SCORE_NO || developerScore === Score.SCORE_NONE || Utils.isEmpty(developerScore))){
                score = -999;
            }else if(importance === Importance.MUST_HAVE && developerScore !== Score.SCORE_NO && developerScore !== Score.SCORE_NONE && Utils.isNotEmpty(developerScore)){
                score += givenScore*2;
            }else {
                score += givenScore;
            }

        }

        for(let jobOfferTech of jobOfferTechnologies){

            if(jobOfferTech.importance === Importance.MUST_HAVE || jobOfferTech.importance === Importance.NICE_TO_HAVE){

                let developerTech: DeveloperTechnology = Utils.findInArray(developerTechnologies, jobOfferTech.key, 'key') || {
                    score: Score.SCORE_NO
                };

                switch (developerTech.score){
                    case Score.SCORE_NONE:
                        calcForImportance(developerTech.score, 0, jobOfferTech.importance);
                        break;
                    case Score.SCORE_NO:
                        calcForImportance(developerTech.score,-2.5, jobOfferTech.importance);
                        break;
                    case Score.SCORE_1:
                        calcForImportance(developerTech.score,1, jobOfferTech.importance);
                        break;
                    case Score.SCORE_2:
                        calcForImportance(developerTech.score,2, jobOfferTech.importance);
                        break;
                    case Score.SCORE_3:
                        calcForImportance(developerTech.score,3, jobOfferTech.importance);
                        break;
                    case Score.SCORE_4:
                        calcForImportance(developerTech.score,4, jobOfferTech.importance);
                        break;
                    case Score.SCORE_5:
                        calcForImportance(developerTech.score,5, jobOfferTech.importance);
                        break;
                }

            }

        }

        return String(score > 0 ? score : 0);

    }

    private prepareRowsToExport(rows: Array<TableRow>): Array<ExcelRow> {

        (rows as Array<DeveloperScore>).sort((a1, a2) => {
            if (a1.developer < a2.developer) {
                return -1;
            }
            if (a1.developer > a2.developer) {
                return 1;
            }
            return 0;
        });

        return [{
            sheet: 'Scoring',
            rows: rows
        }];

    }

    render(): JSX.Element {
        return <>
            <Table name="scores" rows={this.state.scores} cols={this.cols} extendable={false} actions={false} prepareRowsToExport={this.prepareRowsToExport}/>
        </>;
    }


}
