import React from "react";
import {DefaultProps, DefaultState, State} from "../state";
import {technologiesService, Technology} from "../services/technologies-service";
import {MenuItem} from "primereact/menuitem";
import {Dropdown} from "primereact/dropdown";
import {InputText} from "primereact/inputtext";
import {copy, isEmpty, replaceInArray, sameAs} from "../utilities";

interface TechnologiesOptionsProps extends DefaultProps {
    onChange?: (items: Array<Technology>) => void;
    optionValue: string;
    renderOption: (technology: Technology, setOptionValue: (technology: Technology, value: any) => void) => JSX.Element;
    technologies: Array<Technology>;
}

interface TechnologiesOptionsState extends DefaultState {
    category: MenuItem;
    categories: Array<MenuItem>;
    allTechnologies: Array<Technology>;
    filter: string;
}

export class TechnologiesOptions extends State<TechnologiesOptionsProps, TechnologiesOptionsState> {

    private readonly anyCategory: MenuItem = {label: 'Any'};

    state: TechnologiesOptionsState = {
        category: this.anyCategory,
        categories: [],
        allTechnologies: [],
        filter: ''
    }

    componentDidMount(): void {
        technologiesService.on(this.onUpdateTechnologies);
    }

    componentWillUnmount() {
        technologiesService.off(this.onUpdateTechnologies);
    }

    componentDidUpdate(prevProps: Readonly<TechnologiesOptionsProps>, prevState: Readonly<TechnologiesOptionsState>, snapshot?: any) {

        if (!sameAs(prevProps.technologies, this.props.technologies)) {
            this.onUpdateTechnologies(technologiesService.getItems());
        }

    }

    private onUpdateTechnologies = (items: Array<Technology>): void => {

        for (let tech of this.props.technologies) {
            items = replaceInArray(items, tech, 'key');
        }

        this.setMany({
            allTechnologies: items,
            categories: technologiesService.getCategories()
        });

    }

    private setOptionValue = (technology: Technology, value: any): void => {
        technology[this.props.optionValue] = value;
        this.setSelf('allTechnologies');
        this.props.onChange(copy(this.state.allTechnologies));
    }

    private onChangeFilter = (value: string): void => {
        this.setSingle('filter', isEmpty(value) ? '' : value);
    }

    private onCategoryChange = (value: MenuItem): void => {

        if (value === null) {
            value = this.anyCategory;
        }

        this.setSingle('category', value);
    }

    render(): JSX.Element {

        return <div>

            <div className="flex card mb-2">
                <div className="flex align-items-center">
                    <label htmlFor="dfilter" className="filter-label mr-2">Search in category</label>
                    <InputText id="dfilter" className="flex-1" value={this.state.filter} onChange={(e) => this.onChangeFilter(e.target.value)}/>
                </div>
                <div className="flex align-items-center flex-1 ml-2">
                    <label htmlFor="dcategory" className="filter-label mr-2">Category</label>
                    <Dropdown id="dcategory" className="flex-1" options={this.state.categories} value={this.state.category} onChange={(e) => this.onCategoryChange(e.value)}/>
                </div>
            </div>

            <div className="tech-list">
                {this.state.allTechnologies.map((technology: Technology, index: number) => {

                    if (this.state.category.label === this.anyCategory.label || technology.category === this.state.category.label) {
                        let label: string = `${technology.category}/${technology.name}`;

                        if (label.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1) {

                            return <div className="flex p-button p-togglebutton p-component developer-tech-token" key={index}>
                                <div className="flex-1 text-left pr-2">{label}</div>
                                {this.props.renderOption(technology, this.setOptionValue)}
                            </div>
                        }

                        return <React.Fragment key={index}/>
                    }

                    return <React.Fragment key={index}/>

                })}
            </div>

        </div>
    }


}
