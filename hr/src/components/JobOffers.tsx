import React from "react";
import {DefaultProps, DefaultState, State} from "../state";
import {Table, TableColumn, TableColumnType, TableRow} from "./Table";
import {JobOffer, JobOfferExcelRow, jobOffersService} from "../services/job-offers-service";
import {Button} from "primereact/button";
import {Dialog} from "primereact/dialog";
import {Technologies} from "./Technologies";
import {JobOfferTechnologies} from "./JobOfferTechnologies";
import {technologiesService, Technology, TechnologyExcelRow} from "../services/technologies-service";
import {Utils} from "../utils";
import {ExcelData, ExcelRow} from "../services/excel-service";
import {DeveloperTechnology, DeveloperTechnologyExcelRow, Score} from "../services/developers-service";

interface JobOffersProps extends DefaultProps {
    extendable: boolean;
}

interface JobOffersState extends DefaultState {
    jobOffers: Array<JobOffer>;
    row: JobOffer;
    selectedTechnologies: Array<Technology>;
    showChooseTechnologyDialog: boolean;
}

export class JobOffers extends State<JobOffersProps, JobOffersState> {

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
        selectedTechnologies: [],
        showChooseTechnologyDialog: false
    }

    componentDidMount(): void {

        this.setSingle('jobOffers', jobOffersService.getImmutableItems());
        jobOffersService.on((items: Array<JobOffer>) => {
            this.setSingle('jobOffers', items);
        });

    }

    private openChooseTechnologyDialog = (row: JobOffer): void => {

        this.setMany({
            showChooseTechnologyDialog: true,
            row: row,
            selectedTechnologies: Utils.copy(row.technologies)
        });

    }

    private onHideChooseTechnologyDialog = (): void => {

        this.setMany({
            showChooseTechnologyDialog: false,
            row: null,
            selectedTechnologies: []
        });

    }

    private onSubmitChooseTechnology = (): void => {
        this.state.row.technologies = this.state.selectedTechnologies;
        this.state.jobOffers = Utils.replaceInArray(this.state.jobOffers, this.state.row, 'key');
        jobOffersService.replaceItems(this.state.jobOffers);
        this.onHideChooseTechnologyDialog();
    }

    onDataUpdate = (items: Array<TableRow>): void => {
        jobOffersService.replaceItems(items as Array<JobOffer>);
    }

    private onTechnologiesSelect = (items: Array<Technology>): void => {

        let selectedTechnologies: Array<Technology> = [];
        for (let technology of items) {
            if (technology.checked) {
                selectedTechnologies.push(technology);
            }
        }

        this.setSingle('selectedTechnologies', selectedTechnologies);

    }




    private prepareRowsToExport(rows: Array<TableRow>): Array<ExcelRow> {

        let allTechnologies: Array<Technology> = technologiesService.getImmutableItems();

        let exportRows: Array<ExcelRow> = [];

        for (let jobOffer of rows as Array<JobOffer>) {

            let technologiesRows: Array<TechnologyExcelRow> = allTechnologies.map((technology: Technology) => {

                return {
                    category: technology.category,
                    name: technology.name,
                    required: (() => {

                        for(let tech of jobOffer.technologies){
                            if(tech.key === technology.key){
                                return 'YES';
                            }
                        }

                        return 'NO';

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
                sheet: jobOffer.name,
                rows: technologiesRows
            });

        }

        return exportRows;

    }

    //TODO make import each job offer separately as separate TAB in sheet!
    private prepareRowsToImport = (excelData: ExcelData): Array<TableRow> => {

        let rows: Array<JobOffer> = [];
        for(let row of excelData.importedRows){

            let jobOffer: JobOffer = {
                name: row['name'],
                technologies: row['technologies'] ? row['technologies'].split(';').map((technology: string) => {
                    return {
                        category: technology.split('/')[0],
                        name: technology.split('/')[1]
                    }
                }) : []
            };

            jobOffer.technologies = technologiesService.regenerateKeys(jobOffer.technologies);
            technologiesService.mergeNotExisting(jobOffer.technologies);

            rows.push(jobOffer);

        }

        return jobOffersService.regenerateKeys(rows);
    }

    private prepareSingleRowToExport = (item: TableRow): Array<ExcelRow> => {
        return [];
    }

    private prepareSingleRowToImport = (excelData: ExcelData): TableRow => {
        return null;
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

    render(): JSX.Element {
        return <>

            <Table name="job-offers" rows={this.state.jobOffers} cols={this.cols} extendable={this.props.extendable}
                   onDataUpdate={this.onDataUpdate} customTemplates={this.customTemplates}
                   prepareRowsToExport={this.prepareRowsToExport} prepareRowsToImport={this.prepareRowsToImport}
                   prepareSingleRowToExport={this.prepareSingleRowToExport} prepareSingleRowToImport={this.prepareSingleRowToImport}/>

            <Dialog visible={this.state.showChooseTechnologyDialog} style={{width: '800px'}} header="Selecting" modal className="p-fluid" footer={this.chooseTechnologyDialogFooter} onHide={this.onHideChooseTechnologyDialog}>
                <JobOfferTechnologies onSelect={this.onTechnologiesSelect} selectedTechnologies={this.state.row ? this.state.row.technologies : []}/>
            </Dialog>
        </>;
    }

}
