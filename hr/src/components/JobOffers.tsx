import React from "react";
import {DefaultProps, DefaultState, State} from "../state";
import {Table, TableColumn, TableColumnType, TableRow} from "./Table";
import {JobOffer, jobOffersService} from "../services/job-offers-service";
import {Button} from "primereact/button";
import {Dialog} from "primereact/dialog";
import {boolToYesNo, Importance, technologiesService, Technology, YesNo, yesNoToBool} from "../services/technologies-service";
import {collectProperties, findInArray, isEmpty, isNotEmpty, sortBy} from "../utilities";
import {ExcelData, ExcelRow} from "../services/excel-service";
import {MenuItem} from "primereact/menuitem";
import {Dropdown} from "primereact/dropdown";
import {TechnologiesOptions} from "./TechnologiesOptions";

interface JobOffersProps extends DefaultProps {
    extendable: boolean;
}

interface JobOffersState extends DefaultState {
    jobOffers: Array<JobOffer>;
    row: JobOffer;
    showChooseTechnologyDialog: boolean;
}

export class JobOffers extends State<JobOffersProps, JobOffersState> {

    private readonly importances: Array<MenuItem> = [
        {label: 'Not applicable', value: 'NOT_APPLICABLE'},
        {label: 'Must have', value: 'MUST_HAVE'},
        {label: 'Nice to have', value: 'NICE_TO_HAVE'}
    ]

    private cols: Array<TableColumn> = [
        {
            header: 'Name',
            field: 'name',
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

    state: JobOffersState = {
        jobOffers: [],
        row: null,
        showChooseTechnologyDialog: false
    }

    componentDidMount(): void {
        jobOffersService.on(this.onJobOffersUpdate);
    }

    componentWillUnmount() {
        jobOffersService.off(this.onJobOffersUpdate);
    }

    private onJobOffersUpdate = (items: Array<JobOffer>): void => {
        this.setSingle('jobOffers', items);
    }

    private openChooseTechnologyDialog = (row: JobOffer): void => {

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
        jobOffersService.replace(this.state.row);
        this.onHideChooseTechnologyDialog();
    }

    private onChange = (items: Array<Technology>): void => {
        this.state.row.technologies = items;
        this.setSelf('row');
    }

    private prepareRowsToExport(rows: Array<JobOffer>): Array<ExcelRow> {

        let allTechnologies: Array<Technology> = technologiesService.getItems();

        let exportRows: Array<ExcelRow> = [];
        for (let jobOffer of rows) {

            if (isEmpty(jobOffer.technologies)) {
                jobOffer.technologies = [];
            }

            let technologiesRows: Array<Technology> = allTechnologies.map((technology: Technology) => {

                return collectProperties(technology, ['category', 'name', ['theory', (theory: boolean) => {
                    return boolToYesNo(theory);
                }], ['importance', () => {
                    let jobOfferTech: Technology = findInArray(jobOffer.technologies, technology.key, 'key') || {};
                    return jobOfferTech.importance || Importance.NOT_APPLICABLE;
                }]]);

            });

            sortBy(technologiesRows, (developerTech: Technology) => {
                return `${developerTech.category}/${developerTech.name}`
            });

            exportRows.push({
                sheet: jobOffer.name,
                rows: technologiesRows
            });

        }

        return exportRows;

    }

    private prepareRowsToImport = (excelData: ExcelData): Array<JobOffer> => {

        let rows: Array<JobOffer> = [];
        for (let row of excelData.importedRows) {

            let jobOffer: JobOffer = {
                name: row['sheet'],
                technologies: row['rows'] ? row['rows'].map((technology: Technology) => {

                    return collectProperties(technology, ['category', 'name', ['theory', (theory: YesNo) => {
                        return yesNoToBool(theory);
                    }], 'importance']);

                }) : []
            };

            jobOffer.technologies = technologiesService.supplyWithKeys(jobOffer.technologies);

            technologiesService.mergeItems(jobOffer.technologies.map((technology: Technology) => {
                return collectProperties(technology, ['category', 'name', 'theory']);
            }));

            rows.push(jobOffer);

        }

        return rows;

    }

    private prepareSingleRowToExport = (item: JobOffer): Array<ExcelRow> => {

        let rows: Array<ExcelRow> = this.prepareRowsToExport(this.state.jobOffers);

        for (let row of rows) {
            if (row.sheet === item['name']) {
                return [row];
            }
        }

        return [];

    }

    private customTemplates: Record<string, ((row: TableRow) => JSX.Element)> = {
        'technologies': (row: TableRow) => {
            return <div>
                <Button type="button" className="p-button-primary" label="Choose" onClick={this.openChooseTechnologyDialog.bind(this, row as JobOffer)}/>
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

        return <Dropdown className={isNotEmpty(technology.importance) && technology.importance !== Importance.NOT_APPLICABLE ? 'p-button-primary' : ''}
                         value={technology.importance} options={this.importances}
                         onChange={(e) => setOptionValue(technology, e.value)}
                         placeholder="Importance"/>

    }


    render(): JSX.Element {
        return <>

            <Table name="job-offers" rows={this.state.jobOffers} cols={this.cols} extendable={this.props.extendable}
                   dataService={jobOffersService} customTemplates={this.customTemplates}
                   prepareRowsToExport={this.prepareRowsToExport} prepareRowsToImport={this.prepareRowsToImport}
                   prepareSingleRowToExport={this.prepareSingleRowToExport}/>

            <Dialog visible={this.state.showChooseTechnologyDialog} style={{width: '800px'}} header="Choosing technologies" modal className="p-fluid" footer={this.chooseTechnologyDialogFooter} onHide={this.onHideChooseTechnologyDialog}>
                <TechnologiesOptions onChange={this.onChange} technologies={this.state.row ? this.state.row.technologies : []}
                                     renderOption={this.renderTechnologyOption} optionValue={'importance'}/>
            </Dialog>
        </>;
    }

}
