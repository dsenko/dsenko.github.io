import {TableRow} from "../components/Table";
import {copy, isNotEmpty, removeFromArray} from "../utilities";

export interface DataItem extends TableRow {
    key?: string;
}

export class DataService<T extends DataItem> {

    private readonly name: string;
    private readonly compositeKeyFields: Array<string>;
    private listeners: Array<Function> = [];
    private items: Array<T> = [];

    constructor(name: string, compositeKeyFields: Array<string>) {
        this.name = name;
        this.compositeKeyFields = compositeKeyFields;
        this.loadFromStorage();
    }

    getItems(): Array<T> {
        return copy(this.items);
    }

    getByKey(key: string): T {

        for (let item of this.items) {
            if (item.key === key) {
                return copy(item);
            }
        }

        return null;

    }

    off(fn: (items: Array<T>) => void): void {
        removeFromArray(this.listeners, fn);
    }

    on(fn: (items: Array<T>) => void): void {
        this.listeners.push(fn);
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

    regenerateKeys(_items: Array<T>): Array<T> {

        let items: Array<T> = copy(_items);

        for (let item of items) {
            item.key = this.createKey(item);
        }

        return items;

    }

    private createKey(item: DataItem): string {

        console.log('creating key from '+JSON.stringify(item));
        let key: string = '';

        for (let field of this.compositeKeyFields) {
            key += JSON.stringify(item[field] === undefined || item[field] === null ? 'null' : item[field]).trim().replace(/\s/g, '').split('"').join('');
        }

        console.log('key is '+key);

        return key;

    }

    add(_item: T): T {
        let item: T = copy(_item);
        item.key = this.createKey(item);
        this.items.unshift(item);
        this.onChange();
        return item;
    }

    remove(item: T): void {
        this.items.splice(this.items.indexOf(item), 1);
        this.onChange();
    }

    replaceItems(items: Array<T>): void {
        this.items = this.regenerateKeys(items);
        this.onChange();
    }

}
