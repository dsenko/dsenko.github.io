import lodashIsFunction from 'lodash.isfunction';

export const sortBy = (arr: Array<any>, key: string | ((item: any) => string)): void => {

    if (isString(key)) {

        arr.sort((a1, a2) => {

            if (a1[key as string] < a2[key as string]) {
                return -1;
            }

            if (a1[key as string] > a2[key as string]) {
                return 1;
            }

            return 0;

        });

    } else {

        arr.sort((_a1, _a2) => {

            let a1: string = (key as Function)(_a1);
            let a2: string = (key as Function)(_a2);

            if (a1 < a2) {
                return -1;
            }

            if (a1 > a2) {
                return 1;
            }

            return 0;

        });

    }


}

export const collectProperties = (_obj: any, props: Array<string | Array<string | Function>>): any => {

    let obj = {};

    for (let prop of props) {

        if (isString(prop)) {

            if (_obj.hasOwnProperty(prop as string)) {
                obj[prop as string] = _obj[prop as string];
            }

        } else {
            obj[prop[0] as string] = (prop[1] as Function)(_obj[prop[0] as string]);
        }

    }

    return obj;

}

export const copy = (obj: any): any => {
    return JSON.parse(JSON.stringify(obj));
}

export const removeFromArray = (arr: Array<any>, item: any): void => {
    arr.splice(arr.indexOf(item), 1);
}

export const arrayToMap = (arr: Array<any>, field: string): any => {
    return arr.reduce(function (map, item) {
        map[item[field]] = item;
        return map;
    }, {})
}

export const replaceInArray = (arr: Array<any>, item: any, key: string): Array<any> => {

    for (let i = 0; i < arr.length; i++) {

        if (arr[i][key] === item[key]) {
            arr[i] = item;
            break;
        }

    }

    return arr;

}

export const sameAs = (obj1: any, obj2: any): boolean => {

    if (obj1 === null && obj2 === null) {
        return true;
    }

    if ((obj1 === null || obj1 === undefined) || (obj2 === null || obj2 === undefined)) {
        return false;
    }

    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

export const uniq = (arr: Array<any>): Array<any> => {

    let seen: Record<string, boolean> = {};

    return arr.filter(function (item) {

        if (seen[JSON.stringify(item)] === true) {
            return false;
        }

        seen[JSON.stringify(item)] = true;

        return true;

    });

}

export const isNotEmpty = (obj: any): boolean => {
    return !isEmpty(obj);
}

export const isEmpty = (obj: any): boolean => {

    if (obj === undefined || obj === null) {
        return true;
    }

    if (isFunction(obj) && obj.length === 0) {
        return true;
    }

    if (isString(obj) && obj.trim().length === 0) {
        return true;
    }

    return obj.hasOwnProperty('length') && isNotNull(obj['length']) && obj.length == 0;

}

export const isFunction = (obj: any): boolean => {
    return lodashIsFunction(obj);
}

export const isNotNull = (obj: any): boolean => {
    return !isNull(obj);
}

export const isNull = (obj: any): boolean => {
    return obj === null || obj === undefined;
}

export const isString = (obj: any): boolean => {
    return typeof obj === 'string' || obj instanceof String;
}

export const findInArray = (items: Array<any>, value: string | number, field: string): any => {

    for (let item of items) {
        if (item[field] === value) {
            return item;
        }
    }

    return null;

}
