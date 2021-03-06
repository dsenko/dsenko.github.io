import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import React from "react";
import {Technologies} from "./Technologies";
import {MenuItem} from "primereact/menuitem";
import {TabMenu} from "primereact/tabmenu";
import {DefaultProps, DefaultState, State} from "../state";
import {JobOffers} from './JobOffers';
import {Developers} from "./Developers";
import {Scoring} from "./Scoring";

interface AppState extends DefaultState {
    activeMenuIndex: number;
}

export class App extends State<DefaultProps, AppState> {

    private menuItems: Array<MenuItem> = [
        {label: 'Scoring'},
        {label: 'Developers'},
        {label: 'Job offers'},
        {label: 'Technologies'}
    ];

    state: AppState = {
        activeMenuIndex: 0
    }

    private onActiveMenuItemIndexChange = (index: number): void => {
        this.setSingle('activeMenuIndex', index);
    }

    private renderContent(): JSX.Element {

        switch (this.state.activeMenuIndex) {
            case 0:
                return <Scoring/>;
            case 1:
                return <Developers extendable={true}/>;
            case 2:
                return <JobOffers extendable={true}/>;
            case 3:
                return <Technologies extendable={true}/>;
        }

    }

    render(): JSX.Element {
        return <>
            <TabMenu model={this.menuItems} activeIndex={this.state.activeMenuIndex} onTabChange={(e) => this.onActiveMenuItemIndexChange(e.index)}/>
            <div className="pt-2">
                {this.renderContent()}
            </div>
        </>
    }

}
