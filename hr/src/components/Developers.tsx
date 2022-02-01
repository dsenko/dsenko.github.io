import React from "react";
import {DefaultProps, DefaultState, State} from "../state";
import {Table, TableColumn, TableColumnType, TableRow} from "./Table";
import {Developer, developersService, DeveloperTechnology, DeveloperTechnologyExcelRow, mapFromNumericScore, Score} from "../services/developers-service";
import {Button} from "primereact/button";
import {Dialog} from "primereact/dialog";
import {Technologies} from "./Technologies";
import {technologiesService, Technology} from "../services/technologies-service";
import {Utils} from "../utils";
import {ExcelData, ExcelRow} from "../services/excel-service";
import {DeveloperTechnologies} from "./DeveloperTechnologies";

interface DevelopersProps extends DefaultProps {
    extendable: boolean;
}

interface DevelopersState extends DefaultState {
    developers: Array<Developer>;
    row: Developer;
    scoredTechnologies: Array<DeveloperTechnology>;
    showChooseTechnologyDialog: boolean;
}

export class Developers extends State<DevelopersProps, DevelopersState> {

    private cols: Array<TableColumn> = [
        {
            header: 'First name',
            field: 'firstName',
            editable: true,
            sortable: true,
            type: TableColumnType.TEXT
        },
        {
            header: 'Last name',
            field: 'lastName',
            editable: true,
            sortable: true,
            type: TableColumnType.TEXT
        },
        {
            header: 'Technologies',
            field: 'technologies',
            editable: false,
            sortable: false,
            type: TableColumnType.BUTTON
        },

    ]

    state: DevelopersState = {
        developers: [],
        row: null,
        scoredTechnologies: [],
        showChooseTechnologyDialog: false
    }

    componentDidMount(): void {

        this.setSingle('developers', developersService.getImmutableItems());
        developersService.on((items: Array<Developer>) => {
            this.setSingle('developers', items);
        });

    }

    private openChooseTechnologyDialog = (row: Developer): void => {

        console.log(row);

        this.setMany({
            showChooseTechnologyDialog: true,
            row: row,
            scoredTechnologies: Utils.copy(row.technologies)
        });

    }

    private onHideChooseTechnologyDialog = (): void => {

        this.setMany({
            showChooseTechnologyDialog: false,
            row: null,
            scoredTechnologies: []
        });

    }

    private onSubmitChooseTechnology = (): void => {
        this.state.row.technologies = this.state.scoredTechnologies;
        this.state.developers = Utils.replaceInArray(this.state.developers, this.state.row, 'key');
        developersService.replaceItems(this.state.developers);
        this.onHideChooseTechnologyDialog();
    }

    onDataUpdate = (items: Array<TableRow>): void => {
        developersService.replaceItems(items as Array<Developer>);
    }

    private onTechnologiesSelect = (items: Array<DeveloperTechnology>): void => {

        let scoredTechnologies: Array<DeveloperTechnology> = [];
        for (let technology of items) {
            if (technology.score !== Score.SCORE_NONE && technology.score !== null) {
                scoredTechnologies.push(technology);
            }
        }

        this.setSingle('scoredTechnologies', scoredTechnologies);

    }

    private prepareRowsToExport(rows: Array<TableRow>): Array<ExcelRow> {

        let allTechnologies: Array<Technology> = technologiesService.getImmutableItems();

        let exportRows: Array<ExcelRow> = [];
        for (let developer of rows as Array<Developer>) {

            developer.technologies = developer.technologies === undefined || developer.technologies === null ? [] : developer.technologies;

            let technologiesRows: Array<DeveloperTechnologyExcelRow> = allTechnologies.map((technology: Technology) => {

                return {
                    category: technology.category,
                    name: technology.name,
                    score: (() => {

                        for (let tech of developer.technologies) {
                            if (tech.key === technology.key) {
                                return tech.score || Score.SCORE_NONE;
                            }
                        }

                        return Score.SCORE_NONE;

                    })()
                }

            });

            technologiesRows.sort((a1, a2) => {

                let a1Name: string = `${a1.category}/${a1.name}`;
                let a2Name: string = `${a2.category}/${a2.name}`;

                if (a1Name < a2Name) {
                    return -1;
                }
                if (a1Name > a2Name) {
                    return 1;
                }
                return 0;
            });

            exportRows.push({
                sheet: developer.firstName + ' ' + developer.lastName,
                rows: technologiesRows
            })

        }

        return exportRows;

    }

    private prepareRowsToImport = (excelData: ExcelData): Array<TableRow> => {

        let rows: Array<Developer> = [];
        for (let row of excelData.importedRows) {

            let firstName: string = row['sheet'].split(' ')[0];
            let lastName: string = row['sheet'].split(' ')[1];

            let developer: Developer = {
                firstName: firstName,
                lastName: lastName,
                technologies: row['rows'] ? row['rows'].map((technology: DeveloperTechnologyExcelRow) => {

                    if (technology.score === Score.SCORE_NONE) {
                        return null;
                    }

                    return {
                        category: technology.category,
                        name: technology.name,
                        score: mapFromNumericScore(technology.score)
                    }

                }).filter((t) => {
                    return t !== null;
                }) : []
            };

            developer.technologies = technologiesService.regenerateKeys(developer.technologies as Array<Technology>) as Array<DeveloperTechnology>;
            technologiesService.mergeNotExisting(developer.technologies);

            console.log(developer.technologies);

            rows.push(developer);

        }

        return developersService.regenerateKeys(rows);

    }

    private prepareSingleRowToExport = (item: TableRow): Array<ExcelRow> => {

        let rows: Array<ExcelRow> = this.prepareRowsToExport(this.state.developers);

        for (let row of rows) {
            if (row.sheet === `${item['firstName']} ${item['lastName']}`) {
                return [row];
            }
        }

        return [];
    }

    private customTemplates: Record<string, ((row: TableRow) => JSX.Element)> = {
        'technologies': (row: TableRow) => {
            return <div>
                <Button type="button" className="p-button-primary" label="Choose" onClick={this.openChooseTechnologyDialog.bind(this, row as Developer)}/>
            </div>;
        }
    }

    private chooseTechnologyDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={this.onHideChooseTechnologyDialog}/>
            <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={this.onSubmitChooseTechnology}/>
        </React.Fragment>
    );

    render(): JSX.Element {
        return <>

            <Table name="developers" rows={this.state.developers} cols={this.cols} extendable={this.props.extendable}
                   onDataUpdate={this.onDataUpdate} customTemplates={this.customTemplates}
                   prepareRowsToExport={this.prepareRowsToExport} prepareRowsToImport={this.prepareRowsToImport}
                   prepareSingleRowToExport={this.prepareSingleRowToExport}/>

            <Dialog visible={this.state.showChooseTechnologyDialog} style={{width: '800px'}} header="Scoring" modal className="p-fluid" footer={this.chooseTechnologyDialogFooter} onHide={this.onHideChooseTechnologyDialog}>
                <DeveloperTechnologies onSelect={this.onTechnologiesSelect} scoredTechnologies={this.state.row ? this.state.row.technologies : []}/>
            </Dialog>
        </>;
    }


}
