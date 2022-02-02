import React from "react";
import {DefaultProps, DefaultState, State} from "../state";
import {Table, TableColumn, TableColumnType, TableRow} from "./Table";
import {technologiesService, Technology, TechnologyExcelRow} from "../services/technologies-service";
import {ExcelData, ExcelRow} from "../services/excel-service";
import {JobOffer, jobOffersService} from "../services/job-offers-service";
import {Checkbox} from "primereact/checkbox";
import {Button} from "primereact/button";
import {Utils} from "../utils";

interface TechnologiesProps extends DefaultProps {
    extendable?: boolean;
}

interface TechnologiesState extends DefaultState {
    technologies: Array<Technology>;
    cols: Array<TableColumn>;
}

export class Technologies extends State<TechnologiesProps, TechnologiesState> {

    state: TechnologiesState = {
        technologies: [],
        cols: [
            {
                header: 'Category',
                field: 'category',
                editable: true,
                sortable: true,
                type: TableColumnType.TEXT
            },
            {
                header: 'Name',
                field: 'name',
                editable: true,
                sortable: true,
                type: TableColumnType.TEXT
            },
            {
                header: 'Just theory',
                field: 'theory',
                editable: true,
                sortable: true,
                type: TableColumnType.CHECKBOX
            }
        ],

    }

    private customTemplates: Record<string, ((row: TableRow) => JSX.Element)> = {
        'theory': (row: TableRow) => {
          return  <div>
                <Checkbox checked={(row as Technology).theory} onChange={(e) => this.onCheckboxValueChange.bind(this, e.checked, row as Technology)}/>
            </div>;
        }
    }

    private onCheckboxValueChange = (checked: boolean, row: Technology): void => {
        row.theory = checked;
    }

    componentDidMount(): void {
        this.setSingle('technologies', technologiesService.getImmutableItems());
        technologiesService.on(this.updateTechnologies);
    }

    componentWillUnmount() {
        technologiesService.off(this.updateTechnologies);
    }

    private updateTechnologies = (items: Array<Technology>) => {
        this.setSingle('technologies', items);
    }

    private onDataUpdate = (items: Array<TableRow>): void => {
        technologiesService.replaceItems(items as Array<Technology>);
    }

    private prepareRowsToExport(rows: Array<TableRow>): Array<TechnologyExcelRow> {

        let exportRows: Array<TechnologyExcelRow> = [];
        for (let technology of rows as Array<Technology>) {

            exportRows.push({
                category: technology.category,
                name: technology.name,
                theory: technology.theory ? 'YES' : 'NO'
            });

        }

        exportRows.sort((a1, a2) => {
            if (a1.category < a2.category) {
                return -1;
            }
            if (a1.category > a2.category) {
                return 1;
            }
            return 0;
        });

        return exportRows;

    }

    private prepareRowsToImport = (excelData: ExcelData): Array<TableRow> => {

        let rows: Array<Technology> = [];
        for(let row of (excelData.importedRows[0] as ExcelRow).rows){

            let technology: Technology = {
                category: row['category'],
                name: row['name'],
                theory: row['theory'] === 'YES'
            };

            rows.push(technology);

        }

        return technologiesService.regenerateKeys(rows);

    }

    render(): JSX.Element {
        return <Table name="technologies" rows={this.state.technologies} cols={this.state.cols} extendable={this.props.extendable} customTemplates={this.customTemplates}
                      onDataUpdate={this.onDataUpdate} prepareRowsToExport={this.prepareRowsToExport} prepareRowsToImport={this.prepareRowsToImport}/>;
    }


}
