import React from "react";
import lodashGet from 'lodash.get';
import lodashSet from 'lodash.set';

export class State<P extends DefaultProps, S extends DefaultState> extends React.Component<P, S> {

    setMany<K extends keyof S>(state: (Pick<S, K> | S | null | any)): void {

        for (let path in state) {
            if (state.hasOwnProperty(path)) {
                this.index(this.state, path, state[path])
            }
        }

        this.setState(this.state);

    }

    setSingle<E>(propPath: string, propValue: E): void {
        this.index(this.state, propPath, propValue as E)
        this.setState(this.state);
    }

    setSelf(propPath: string): void {
        this.setSingle(propPath, lodashGet(this.state, propPath));
    }

    setSelfMany(propPath: Array<string>): void {

        let state: Record<string, any> = {};

        for (let path of propPath) {
            lodashSet(state, path, lodashGet(this.state, path));
        }

        this.setMany(state);

    }

    private index = (obj: any, propPath: any, value: any): void => {
        lodashSet(obj, propPath, value);
    }

}

export type DefaultState = {};
export type DefaultProps = {};
