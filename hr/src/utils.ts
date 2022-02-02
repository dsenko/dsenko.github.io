import lodashIsFunction from 'lodash.isfunction';

export class Utils {

    static copy(obj: any): any {
        return JSON.parse(JSON.stringify(obj));
    }

    static removeFromArray(arr: Array<any>, item: any): void {
        arr.splice(arr.indexOf(item), 1);
    }

    static arrayToMap(arr: Array<any>, field: string) {
        return arr.reduce(function (map, item) {
            map[item[field]] = item;
            return map;
        }, {})
    }

    static replaceInArray(arr: Array<any>, item: any, key: string): Array<any> {

        for (let i = 0; i < arr.length; i++) {

            if (arr[i][key] === item.key) {
                arr[i] = item;
                break;
            }

        }

        return arr;

    }


    static sameAs(obj1: any, obj2: any): boolean {

        if (obj1 === null && obj2 === null) {
            return true;
        }

        if ((obj1 === null || obj1 === undefined) || (obj2 === null || obj2 === undefined)) {
            return false;
        }

        return JSON.stringify(obj1) === JSON.stringify(obj2);
    }

    static uniqBy(arr: Array<any>, key: string): Array<any> {

        let seen: Record<string, boolean> = {};

        return arr.filter(function (item) {

            if (seen[item[key]] === true) {
                return false;
            }

            seen[item[key]] = true;
            return true;

        });

    }

    public static isNotEmpty(obj: any): boolean {
        return !this.isEmpty(obj);
    }

    public static isEmpty(obj: any): boolean {

        if (obj === undefined || obj === null) {
            return true;
        }

        if (this.isFunction(obj) && obj.length === 0) {
            return true;
        }

        if (this.isString(obj) && obj.trim().length === 0) {
            return true;
        }

        if (obj.hasOwnProperty('length') && this.isNotNull(obj['length']) && obj.length == 0) {
            return true;
        }

        return false;

    }

    public static isFunction(obj: any): boolean {
        return lodashIsFunction(obj);
    }

    public static isNotNull(obj: any) {
        return !this.isNull(obj);
    }

    public static isNull(obj: any) {
        return obj === null || obj === undefined;
    }

    public static isString(obj: any): boolean {
        return typeof obj === 'string' || obj instanceof String;
    }

}
