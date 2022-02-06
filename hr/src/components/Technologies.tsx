import React from "react";
import {DefaultProps, DefaultState, State} from "../state";
import {Table, TableColumn, TableColumnType, TableRow} from "./Table";
import {boolToYesNo, technologiesService, Technology, YesNo, yesNoToBool} from "../services/technologies-service";
import {ExcelData, ExcelRow} from "../services/excel-service";
import {Checkbox} from "primereact/checkbox";
import {collectProperties, sortBy} from "../utilities";

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
            return <div>
                <Checkbox checked={(row as Technology).theory} onChange={(e) => this.onCheckboxValueChange.bind(this, e.checked, row as Technology)}/>
            </div>;
        }
    }

    private onCheckboxValueChange = (checked: boolean, row: Technology): void => {
        row.theory = checked;
    }

    componentDidMount(): void {
        technologiesService.on(this.onUpdateTechnologies);
    }

    componentWillUnmount() {
        technologiesService.off(this.onUpdateTechnologies);
    }

    private onUpdateTechnologies = (items: Array<Technology>) => {
        this.setSingle('technologies', items);
    }

    private prepareRowsToExport(rows: Array<Technology>): Array<ExcelRow> {

        let exportRows: Array<ExcelRow> = [{
            sheet: 'Technologies',
            rows: rows.map((technology: Technology) => {
                return collectProperties(technology, ['category', 'name', ['theory', (theory: boolean) => {
                    return boolToYesNo(theory);
                }]])
            })
        }];

        sortBy(exportRows[0].rows, 'category');

        return exportRows;

    }

    private prepareRowsToImport = (excelData: ExcelData): Array<Technology> => {

        let rows: Array<Technology> = [];
        for (let row of (excelData.importedRows[0] as ExcelRow).rows) {
            rows.push(collectProperties(row, ['category', 'name', ['theory', (theory: YesNo) => {
                return yesNoToBool(theory);
            }]]));
        }

        return rows;

    }

    render(): JSX.Element {
        return <Table name="technologies"
                      rows={this.state.technologies}
                      cols={this.state.cols}
                      extendable={this.props.extendable}
                      customTemplates={this.customTemplates}
                      dataService={technologiesService}
                      prepareRowsToExport={this.prepareRowsToExport}
                      prepareRowsToImport={this.prepareRowsToImport}/>;
    }


}
