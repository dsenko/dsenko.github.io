import {TableRow} from "../components/Table";
import {copy, isNotEmpty, isNotNull, isNull, removeFromArray} from "../utilities";

export interface DataItem extends TableRow {
    key?: string;
}

export class DataService<T extends DataItem> {

    private readonly name: string;
    private listeners: Array<Function> = [];
    private items: Array<T> = [];
    private readonly compositeKeyFields: Array<string>;

    constructor(name: string, compositeKeyFields: Array<string>) {
        this.name = name;
        this.compositeKeyFields = compositeKeyFields
        this.loadFromStorage();
    }

    getItems(): Array<T> {
        return copy(this.items);
    }

    off(fn: (items: Array<T>) => void): void {
        removeFromArray(this.listeners, fn);
    }

    on(fn: (items: Array<T>) => void): void {
        this.listeners.push(fn);
        fn(this.getItems());
    }

    add(_item: T, onChange: boolean = true): void {

        if (isNotNull(_item.key) || this.exist(_item)) {
            console.warn('Adding item with existing key', JSON.stringify(_item));
        }

        let item: T = copy(_item);
        item.key = this.createKey(item);
        this.items.unshift(item);

        if (onChange) {
            this.onChange();
        }

    }

    addAll(_items: Array<T>): void {

        for (let _item of _items) {
            this.add(_item, false);
        }

        this.onChange();

    }

    supplyWithKeys(_items: Array<T>): Array<T> {

        let items: Array<T> = [];

        for (let item of _items) {
            let _item: T = copy(item);
            _item.key = this.createKey(_item);
            items.push(_item);
        }

        return items

    }

    mergeItems(items: Array<T>): void {
        let _items: Array<T> = this.supplyWithKeys(items);
        let uniqArr: Array<T> = this.uniq(this.items.concat(_items));
        this.supplyWithKeys(uniqArr);
        this.replaceItems(uniqArr);
    }

    remove(item: T): void {
        this.items.splice(this.indexOf(item), 1);
        this.onChange();
    }

    replace(item: T): void {
        this.validate(item);
        this.items[this.indexOf(item)] = item;
        this.onChange();
    }

    private async loadFromStorage(): Promise<void> {

        return new Promise((resolve) => {

            if (isNotEmpty(localStorage.getItem(this.name))) {

                try {
                    this.items = JSON.parse(localStorage.getItem(this.name));
                } catch (e) {
                    console.warn(e);
                }

            }

            resolve();

        });

    }

    private async sync(): Promise<void> {

        return new Promise((resolve) => {
            localStorage.setItem(this.name, JSON.stringify(this.items));
            resolve();
        });

    }

    private onChange(): void {

        let items: Array<T> = this.getItems();

        for (let listener of this.listeners) {
            listener(items);
        }

        this.sync();

    }

    private exist(_item: T): boolean {

        for (let item of this.items) {
            if (item.key === _item.key) {
                return true;
            }
        }

        return false;

    }

    private uniq(_items: Array<T>): Array<T> {

        let uniqKeys: Record<string, boolean> = {};
        let items: Array<T> = [];
        for (let _item of _items) {

            if (!uniqKeys[this.createKey(_item)]) {
                items.push(_item);
                uniqKeys[this.createKey(_item)] = true;
            }

        }

        return items;

    }

    private createKey(item: T): string {

        let key: string = '';

        for (let field of this.compositeKeyFields) {
            key += JSON.stringify(item[field] === undefined || item[field] === null ? 'null' : item[field]).trim().replace(/\s/g, '').split('"').join('');
        }

        return key;

    }

    private replaceItems(items: Array<T>): void {

        for (let item of items) {
            this.validate(item);
        }

        this.items = copy(items);
        this.onChange();
    }

    private validate(item: T): void {

        if (isNull(item.key)) {
            throw new Error(`Data service item has no key`);
        }

    }

    private indexOf(item: T): number {

        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].key === item.key) {
                return i;
            }
        }

        return -1;

    }

}
