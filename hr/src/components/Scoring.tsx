import React from "react";
import {DefaultProps, DefaultState, State} from "../state";
import {Table, TableColumn, TableColumnType, TableRow} from "./Table";
import {Developer, developersService, DeveloperTechnology, Score} from "../services/developers-service";
import {ExcelData, ExcelRow} from "../services/excel-service";
import {JobOffer, jobOffersService} from "../services/job-offers-service";
import {Technology} from "../services/technologies-service";
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

        for(let jobOfferTech of jobOfferTechnologies){

            for(let developerTech of developerTechnologies){

                if(jobOfferTech.key === developerTech.key){

                    switch (developerTech.score){
                        case Score.SCORE_NONE:
                            //nothing - zero points
                            break;
                        case Score.SCORE_NO:
                            score -= 2.5;
                            //subtract points for not knowing
                            break;
                        case Score.SCORE_1:
                                score += 1;
                            break;
                        case Score.SCORE_2:
                            score += 2;
                            break;
                        case Score.SCORE_3:
                            score += 3;
                            break;
                        case Score.SCORE_4:
                            score += 4;
                            break;
                        case Score.SCORE_5:
                            score += 5;
                            break;
                    }

                }

            }

        }

        return String(score);

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
