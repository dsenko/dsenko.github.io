import React from "react";
import {DefaultProps, DefaultState, State} from "../state";
import {DataTable} from "primereact/datatable";
import {Column, ColumnProps} from "primereact/column";
import {InputText} from "primereact/inputtext";
import {Utils} from "../utils";
import {Button} from "primereact/button";
import {Dialog} from "primereact/dialog";
import {confirmDialog} from "primereact/confirmdialog";
import {ExcelData, ExcelRow, excelService} from "../services/excel-service";
import {FileUpload, FileUploadHandlerParam} from "primereact/fileupload";
import {Checkbox} from "primereact/checkbox";

export enum EditMode {
    EDIT,
    ADD
}

export enum TableColumnType {
    TEXT,
    SELECT,
    BUTTON,
    CHECKBOX
}

export interface TableColumn extends ColumnProps {
    editable: boolean;
    type: TableColumnType;
}

export interface TableRow {
}

interface TableProps extends DefaultProps {
    name: string;
    extendable: boolean;
    rows: Array<TableRow>;
    cols: Array<TableColumn>;
    customTemplates: Record<string, ((row: TableRow) => JSX.Element)>;
    onDataUpdate: (items: Array<TableRow>) => void;
    prepareRowsToImport: (excelData: ExcelData) => Array<TableRow>;
    prepareRowsToExport: (items: Array<TableRow>) => Array<ExcelRow>;
    prepareSingleRowToImport: (excelData: ExcelData) => TableRow;
    prepareSingleRowToExport: (item: TableRow) => Array<ExcelRow>;
}

interface TableState extends DefaultState {
    showEditDialog: boolean;
    showChooseTechnologyDialog: boolean;
    row: TableRow;
    rows: Array<TableRow>;
    cols: Record<string, TableColumn>;
    selection: Array<TableRow>;
    editMode: EditMode;
}

export class Table extends State<TableProps, TableState> {

    static defaultProps: TableProps = {
        name: '',
        rows: [],
        cols: [],
        extendable: false,
        customTemplates: {},
        onDataUpdate: () => {
        },
        prepareRowsToExport: null,
        prepareRowsToImport: null,
        prepareSingleRowToExport: null,
        prepareSingleRowToImport: null
    }
    state: TableState = {
        showEditDialog: false,
        showChooseTechnologyDialog: false,
        row: {},
        rows: [],
        cols: {},
        selection: [],
        editMode: EditMode.ADD
    }
    private emptyRow: TableRow = {};

    componentDidMount() {
        this.setSingle('cols', Utils.arrayToMap(this.props.cols, 'field'));
        this.initEmptyRow();
        this.setEmptyRow();
    }

    componentDidUpdate(prevProps: Readonly<TableProps>, prevState: Readonly<TableState>, snapshot?: any) {

        if (prevProps.rows.length !== this.props.rows.length) {
            this.setSingle('rows', this.props.rows);
        }

    }

    private exportExcel = () => {
        excelService.exportExcel(this.props.name, this.props.prepareRowsToExport ? this.props.prepareRowsToExport(this.state.rows) : this.state.rows);
    }

    private importExcel = async (e): Promise<void> => {
        this.setSingle('rows', await excelService.importExcel(e, this.props.prepareRowsToImport));
        this.props.onDataUpdate(this.state.rows);
    }


    private exportSingleRowExcel(row: TableRow) : void {
        excelService.exportSingleExcel(this.props.name, this.props.prepareSingleRowToExport ? this.props.prepareSingleRowToExport(row) : row);
    }

    private async importSingleRowExcel(e: FileUploadHandlerParam): Promise<void> {
        this.state.rows.push(await excelService.importSingleExcel(e, this.props.prepareSingleRowToImport));
        this.props.onDataUpdate(this.state.rows);
    }

    render(): JSX.Element {

        return <div>

            <div className="flex card mb-2">
                <Button type="button" className="p-button-primary" icon="pi pi-plus" label="Add" onClick={this.openEditDialog}/>
                {this.props.prepareSingleRowToImport ?
                    <FileUpload chooseOptions={{label: 'Import single row', icon: 'pi pi-file-excel', className: 'p-button-primary ml-2'}} mode="basic" name="excel[]" auto
                                customUpload={true} accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" uploadHandler={(e) => this.importSingleRowExcel(e)}/> :''}
                <FileUpload chooseOptions={{label: 'Import all', icon: 'pi pi-file-excel', className: 'p-button-primary ml-2'}} mode="basic" name="excel[]" auto
                            customUpload={true} accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" uploadHandler={this.importExcel}/>
                <Button type="button" className="p-button-primary ml-2" label="Export all" icon="pi pi-file-excel" onClick={this.exportExcel}/>
            </div>

            <div className="card">
                <DataTable value={this.props.rows} responsiveLayout="scroll">
                    {this.renderColumns()}
                </DataTable>
            </div>

            <Dialog visible={this.state.showEditDialog} style={{width: '450px'}} header={this.state.editMode === EditMode.ADD ? 'Adding' : 'Editing'} modal className="p-fluid" footer={this.editDialogFooter} onHide={this.onHideEditDialog}>

                {this.props.cols.map((col: TableColumn, index: number) => {

                    return col.editable ? <div className={`field type-${col.type}`} key={index}>
                        <label htmlFor={col.field}>{col.header}</label>
                        {this.renderField(col)}
                    </div> : '';

                })}

            </Dialog>


        </div>

    }

    private renderField(col: TableColumn): JSX.Element {

        switch (col.type) {
            case TableColumnType.TEXT:
                return <>
                    <InputText id={col.field} value={this.state.row[col.field]} onChange={(e) => this.onNewRowFieldChange(e.target.value, col.field)} required autoFocus/>
                </>
            case TableColumnType.CHECKBOX:
                return <>
                    <Checkbox className="ml-2" checked={this.state.row[col.field]} onChange={(e) => this.onNewRowFieldChange(e.checked, col.field)}/>
                </>
        }

        return <></>

    }

    private initEmptyRow(): void {

        this.emptyRow = {};

        for (let col of this.props.cols) {
            this.emptyRow[col.field] = '';
        }

    }

    private setEmptyRow(): void {
        this.setSingle('row', Utils.copy(this.emptyRow));
    }

    private actionsTemplate = (row: TableRow): JSX.Element => {
        return <div className="flex">
            <Button type="button" icon="pi pi-pencil" className="p-button-primary mr-1" onClick={this.openEditDialog.bind(this, null, row)}/>
            <Button type="button" icon="pi pi-trash" className="p-button-primary mr-1"  onClick={this.openRemoveDialog.bind(this, null, row)}/>
                {this.props.prepareSingleRowToExport ? <Button type="button" icon="pi pi-file-excel" className="p-button-primary" onClick={(e) => this.exportSingleRowExcel(row)}/> : ''}

        </div>;
    }

    private getBodyTemplate = (col: TableColumn): ((row: TableRow) => JSX.Element) => {

        if (this.props.customTemplates[col.field]) {
            return this.props.customTemplates[col.field];
        }

        return null;

    }

    private renderColumns(): Array<JSX.Element> {

        let columns: Array<JSX.Element> = [];

        columns.push(<Column key={-2} field="actions" header="Actions" body={this.actionsTemplate}/>);

        columns = columns.concat(this.props.cols.map((col: TableColumn, index: number) => {
            return <Column key={index} field={col.field} header={col.header} sortable={col.sortable} body={this.getBodyTemplate(col)}/>
        }));

        return columns;

    }

    private openRemoveDialog = (e: React.MouseEvent<HTMLButtonElement>, row?: TableRow): void => {

        confirmDialog({
            header: 'Removal',
            message: 'Are you sure?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Remove',
            rejectLabel: 'Cancel',
            accept: async () => {
                Utils.removeFromArray(this.state.rows, row);
                this.setEmptyRow();
                this.props.onDataUpdate(Utils.copy(this.state.rows));
            },
        });

    }

    private openEditDialog = (e: React.MouseEvent<HTMLButtonElement>, row?: TableRow): void => {

        this.setMany({
            editMode: row ? EditMode.EDIT : EditMode.ADD,
            showEditDialog: true
        });

        if (row) {
            this.setSingle('row', Utils.copy(row));
        } else {
            this.setEmptyRow()
        }

    }

    private onHideEditDialog = (): void => {
        this.setSingle('showEditDialog', false);
    }

    private onSubmitChooseTechnology = (): void => {
        this.props.onDataUpdate(Utils.copy(this.state.rows));
    }

    private onSubmitEdit = (): void => {

        if (this.state.editMode === EditMode.ADD) {
            this.state.rows.push(Utils.copy(this.state.row));
        } else {
            this.state.rows = Utils.replaceInArray(this.state.rows, this.state.row, 'key');
        }

        this.setEmptyRow();
        this.props.onDataUpdate(Utils.copy(this.state.rows));
        this.onHideEditDialog();

    }

    private editDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={this.onHideEditDialog}/>
            <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={this.onSubmitEdit}/>
        </React.Fragment>
    );

    private onNewRowFieldChange = (value: any, field: string): void => {
        this.state.row[field] = value;
        this.setSelf('row');
    }

}

