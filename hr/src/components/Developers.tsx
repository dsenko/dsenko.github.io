import React from "react";
import {DefaultProps, DefaultState, State} from "../state";
import {Table, TableColumn, TableColumnType, TableRow} from "./Table";
import {Developer, developersService, mapFromNumericScore, Score} from "../services/developers-service";
import {Button} from "primereact/button";
import {Dialog} from "primereact/dialog";
import {collectProperties, findInArray, isEmpty, isNotEmpty, sortBy} from "../utilities";
import {boolToYesNo, technologiesService, Technology, YesNo, yesNoToBool} from "../services/technologies-service";
import {ExcelData, ExcelRow} from "../services/excel-service";
import {TechnologiesOptions} from "./TechnologiesOptions";
import {MenuItem} from "primereact/menuitem";
import {Dropdown} from "primereact/dropdown";

interface DevelopersProps extends DefaultProps {
    extendable: boolean;
}

interface DevelopersState extends DefaultState {
    developers: Array<Developer>;
    row: Developer;
    showChooseTechnologyDialog: boolean;
}

export class Developers extends State<DevelopersProps, DevelopersState> {

    private readonly theoryScores: Array<MenuItem> = [
        {label: 'None', value: Score.SCORE_NONE},
        {label: 'Yes', value: Score.SCORE_YES},
        {label: 'No', value: Score.SCORE_NO}
    ]

    private readonly markScores: Array<MenuItem> = [
        {label: 'None', value: Score.SCORE_NONE},
        {label: '1', value: Score.SCORE_1},
        {label: '2', value: Score.SCORE_2},
        {label: '3', value: Score.SCORE_3},
        {label: '4', value: Score.SCORE_4},
        {label: '5', value: Score.SCORE_5}
    ]

    private cols: Array<TableColumn> = [
        {
            header: 'Full name',
            field: 'fullName',
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
        showChooseTechnologyDialog: false
    }

    componentDidMount(): void {
        developersService.on(this.onDevelopersUpdate);
    }

    componentWillUnmount() {
        developersService.off(this.onDevelopersUpdate);
    }

    private onDevelopersUpdate = (items: Array<Developer>): void => {
        this.setSingle('developers', items);
    }

    private openChooseTechnologyDialog = (row: Developer): void => {

        this.setMany({
            showChooseTechnologyDialog: true,
            row: row
        });

    }

    private onHideChooseTechnologyDialog = (): void => {

        this.setMany({
            showChooseTechnologyDialog: false,
            row: null
        });

    }

    private onSubmitChooseTechnology = (): void => {
        developersService.replace(this.state.row);
        this.onHideChooseTechnologyDialog();
    }

    private onChange = (items: Array<Technology>): void => {
        this.state.row.technologies = items;
        this.setSelf('row');
    }

    private prepareRowsToExport(rows: Array<Developer>): Array<ExcelRow> {

        let allTechnologies: Array<Technology> = technologiesService.getItems();

        let exportRows: Array<ExcelRow> = [];
        for (let developer of rows) {

            if (isEmpty(developer.technologies)) {
                developer.technologies = [];
            }

            let technologiesRows: Array<Technology> = allTechnologies.map((technology: Technology) => {

                return collectProperties(technology, ['category', 'name', ['theory', (theory: boolean) => {
                    return boolToYesNo(theory);
                }], ['score', () => {
                    let developerTech: Technology = findInArray(developer.technologies, technology.key, 'key') || {};
                    return developerTech.score || Score.SCORE_NONE;
                }]]);

            });

            sortBy(technologiesRows, (developerTech: Technology) => {
                return `${developerTech.category}/${developerTech.name}`
            });

            exportRows.push({
                sheet: developer.fullName,
                rows: technologiesRows
            });

        }

        return exportRows;

    }

    private prepareRowsToImport = (excelData: ExcelData): Array<Developer> => {

        let rows: Array<Developer> = [];
        for (let row of excelData.importedRows) {

            let developer: Developer = {
                fullName: row['sheet'],
                technologies: row['rows'] ? row['rows'].map((technology: Technology) => {

                    if (technology.score === Score.SCORE_NONE) {
                        return null;
                    }

                    return collectProperties(technology, ['category', 'name', ['theory', (theory: YesNo) => {
                        return yesNoToBool(theory);
                    }], ['score', (score: number) => {
                        return mapFromNumericScore(score);
                    }]]);

                }).filter((t) => {
                    return t !== null;
                }) : []
            };

            developer.technologies = technologiesService.supplyWithKeys(developer.technologies);

            technologiesService.mergeItems(developer.technologies.map((technology: Technology) => {
                return collectProperties(technology, ['category', 'name', 'theory']);
            }));

            rows.push(developer);

        }

        return rows;

    }

    private prepareSingleRowToExport = (item: Developer): Array<ExcelRow> => {

        let rows: Array<ExcelRow> = this.prepareRowsToExport(this.state.developers);

        for (let row of rows) {
            if (row.sheet === item['fullName']) {
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

    private renderTechnologyOption = (technology: Technology, setOptionValue: (technology: Technology, value: any) => void): JSX.Element => {

        return <Dropdown className={isNotEmpty(technology.score) && technology.score !== Score.SCORE_NONE ? 'p-button-primary' : ''}
                         value={technology.score} options={technology.theory ? this.theoryScores : this.markScores}
                         onChange={(e) => setOptionValue(technology, e.value)} placeholder="Score"/>

    }

    render(): JSX.Element {
        return <>

            <Table name="developers" rows={this.state.developers} cols={this.cols} extendable={this.props.extendable}
                   dataService={developersService} customTemplates={this.customTemplates}
                   prepareRowsToExport={this.prepareRowsToExport} prepareRowsToImport={this.prepareRowsToImport}
                   prepareSingleRowToExport={this.prepareSingleRowToExport}/>

            <Dialog visible={this.state.showChooseTechnologyDialog} style={{width: '800px'}} header="Scoring" modal className="p-fluid" footer={this.chooseTechnologyDialogFooter} onHide={this.onHideChooseTechnologyDialog}>
                <TechnologiesOptions onChange={this.onChange} technologies={this.state.row ? this.state.row.technologies : []}
                                     optionValue={'score'} renderOption={this.renderTechnologyOption}/>
            </Dialog>

        </>;
    }


}
