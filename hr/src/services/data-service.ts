import {Utils} from "../utils";
import {TableRow} from "../components/Table";

export class DataService<T extends DataItem> {

    private readonly name: string;
    private readonly compositeKeyFields: Array<string>;
    private listeners: Array<Function> = [];
    private items: Array<T> = [];

    constructor(name: string, compositeKeyFields: Array<string>) {
        this.name = name;
        this.compositeKeyFields = compositeKeyFields;
    }

    getImmutableItems(): Array<T> {
        return Utils.copy(this.items);
    }

    getByKey(key: string) : T {

        for(let item of this.items){
            if(item.key === key){
                return Utils.copy(item);
            }
        }

        return null;

    }

    off(fn: (items: Array<T>) => void): void {
        Utils.removeFromArray(this.listeners, fn);
    }

    on(fn: (items: Array<T>) => void): void {
        this.listeners.push(fn);
    }

    private async sync() : Promise<void> {

        return new Promise((resolve) => {
            localStorage.setItem(this.name, JSON.stringify(this.items));
            resolve();
        });

    }

    private onChange() : void {

        let items: Array<T> = this.getImmutableItems();

        for(let listener of this.listeners){
            listener(items);
        }

        this.sync();

    }

    regenerateKeys(items: Array<T>) : Array<T> {

        for(let item of items){
            item.key = this.createKey(item);
        }

        return Utils.copy(items);

    }

    private createKey(item: DataItem): string {

        let key: string = '';

        for(let field of this.compositeKeyFields){
            key += JSON.stringify(item[field] === undefined || item[field] === null ? 'null' : item[field]).trim().replace(/\s/g, '').split('"').join('');
        }

        return key;

    }

    add(item: T): T {
        item.key = this.createKey(item);
        this.items.unshift(Utils.copy(item));
        this.onChange();
        return Utils.copy(item);
    }

    private remove(item: T): void {
        this.items.splice(this.items.indexOf(item), 1);
        this.onChange();
    }

    replaceItems(items: Array<T>): void {
        this.items = this.regenerateKeys(items);
        this.onChange();
    }

}

export interface DataItem extends TableRow {
    key?: string;
}

//
// export interface DeveloperTechnology {
//     developer: string;
//     technology: string;
//     know: boolean;
//     score: number;
// }
//
//
//
// export interface Developer extends DataItem{
//     firstName: string;
//     lastName: string;
//     technologies: Array<DeveloperTechnology>;
// }
