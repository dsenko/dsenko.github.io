import {saveAs} from 'file-saver';
import {TableRow} from "../components/Table";
import {FileUploadHandlerParam} from "primereact/fileupload";

export interface ExcelRow {
    sheet?: string;
    rows?: Array<ExcelRow>;
}

export interface ExcelColumn {
    field: string;
    header: string;
}

export interface ExcelData {
    importedCols: Array<ExcelColumn>;
    importedRows: Array<TableRow>;
}

export class ExcelService {

   public importExcel = async (e, fn: (excelData: ExcelData) => Array<TableRow>) : Promise<Array<TableRow>> => {

        return new Promise((resolve) => {

            const file = e.files[0];

            import('xlsx').then(xlsx => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const wb = xlsx.read(e.target.result, { type: 'array' });
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    const data = xlsx.utils.sheet_to_json(ws, { header: 1 });

                    // Prepare DataTable
                    const cols: any = data[0];
                    data.shift();

                    let importedCols = cols.map(col => ({ field: col, header: this.toCapitalize(col) }));
                    let importedRows = data.map(d => {
                        return cols.reduce((obj, c, i) => {
                            obj[c] = d[i];
                            return obj;
                        }, {});
                    });

                    resolve(fn({
                        importedCols: importedCols,
                        importedRows: importedRows
                    }));

                };

                reader.readAsArrayBuffer(file);
            });

        });


    }

    private toCapitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    public exportExcel = (name: string, data: Array<ExcelRow>) => {

        import('xlsx').then(xlsx => {

            console.log('data', data);

            if(data.length > 0){

                let sheets = {};
                let sheetsNames = [];

                if(data[0].sheet !== undefined){
                    for(let data1 of data){
                        sheetsNames.push(data1['sheet']);
                        sheets[data1['sheet']] = xlsx.utils.json_to_sheet(data1['rows']);
                    }
                }else{
                    sheetsNames = ['data'];
                    sheets['data'] = xlsx.utils.json_to_sheet(data);
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

    async importSingleExcel(e: FileUploadHandlerParam, prepareSingleRowToImport: (excelData: ExcelData) => TableRow) {

       let rows: Array<TableRow> = await this.importExcel(e, (excelData: ExcelData) => {
           return [prepareSingleRowToImport(excelData)];
       });

       return rows[0];

    }

    exportSingleExcel(name: string, row: any) {
        this.exportExcel(name, [row]);
    }

}

export const excelService = new ExcelService();
