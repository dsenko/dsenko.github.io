import {saveAs} from 'file-saver';
import {FileUploadHandlerParam} from "primereact/fileupload";
import {copy} from "../utilities";

export interface ExcelRow {
    sheet?: string;
    rows?: Array<any>;
}

export interface ExcelData {
    importedRows: Array<ExcelRow>;
}

export class ExcelService {

    private importSheet(sheetName: string, data: any, importedRows: Array<ExcelRow>) {

        const cols: any = data[0];
        data.shift();

        importedRows.push({
            sheet: sheetName,
            rows: data.map(d => {
                return cols.reduce((obj, c, i) => {
                    obj[c] = d[i];
                    return obj;
                }, {});
            })
        });

    }

    importExcel = async (event: FileUploadHandlerParam, prepareRowsToImport: (excelData: ExcelData) => Array<any>): Promise<Array<ExcelRow>> => {

        return new Promise((resolve) => {

            const file = event.files[0];

            import('xlsx').then(xlsx => {

                const reader = new FileReader();
                reader.onload = (e) => {

                    try {

                        const wb = xlsx.read(e.target.result, {type: 'array'});

                        let importedRows: Array<ExcelRow> = [];

                        for (let sheetName of wb.SheetNames) {
                            const ws = wb.Sheets[sheetName];
                            const data = xlsx.utils.sheet_to_json(ws, {header: 1});
                            this.importSheet(sheetName, data, importedRows);
                        }

                        resolve(prepareRowsToImport({
                            importedRows: importedRows
                        }));

                    } catch (err) {
                        console.warn(err);
                        resolve(null);
                    }

                    event.options.clear();

                };

                reader.readAsArrayBuffer(file);

            });

        });

    }

    exportExcel = (name: string, inputData: Array<ExcelRow>) : void => {

        let data: Array<ExcelRow> = copy(inputData);

        import('xlsx').then(xlsx => {

            if (data.length > 0) {

                let sheets = {};
                let sheetsNames = [];

                for (let data1 of data) {
                    sheetsNames.push(data1['sheet']);
                    sheets[data1['sheet']] = xlsx.utils.json_to_sheet(data1['rows']);
                }

                const workbook = {Sheets: sheets, SheetNames: sheetsNames};
                const excelBuffer = xlsx.write(workbook, {bookType: 'xlsx', type: 'array'});
                this.saveAsExcelFile(excelBuffer, name);

            }


        });
    }

    private saveAsExcelFile = (buffer, fileName) => {
        let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        let EXCEL_EXTENSION = '.xlsx';
        const data = new Blob([buffer], {
            type: EXCEL_TYPE
        });
        saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
    }

    exportSingleExcel(name: string, row: Array<ExcelRow>) {
        this.exportExcel(name, row);
    }

}

export const excelService = new ExcelService();
