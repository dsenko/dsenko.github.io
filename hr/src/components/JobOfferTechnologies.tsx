import React from "react";
import {DefaultProps, DefaultState, State} from "../state";
import {Importance, technologiesService, Technology} from "../services/technologies-service";
import {MenuItem} from "primereact/menuitem";
import {Utils} from "../utils";
import {Dropdown} from "primereact/dropdown";
import {InputText} from "primereact/inputtext";

interface JobOfferTechnologiesProps extends DefaultProps {
    onSelect?: (items: Array<Technology>) => void;
    selectedTechnologies: Array<Technology>;
}

interface JobOfferTechnologiesState extends DefaultState {
    category: MenuItem;
    categories: Array<MenuItem>;
    technologies: Array<Technology>;
    filter: string;
}

export class JobOfferTechnologies extends State<JobOfferTechnologiesProps, JobOfferTechnologiesState> {

    private readonly anyCategory: MenuItem = {label: 'Any'};
    private readonly importances: Array<MenuItem> = [
        {label: 'Not applicable', value: 'NOT_APPLICABLE'},
        {label: 'Must have', value: 'MUST_HAVE'},
        {label: 'Nice to have', value: 'NICE_TO_HAVE'}
    ]

    state: JobOfferTechnologiesState = {
        category: this.anyCategory,
        categories: [],
        technologies: [],
        filter: ''
    }

    componentDidMount(): void {
        this.setSingle('technologies', technologiesService.getImmutableItems());
        this.setCategories();
        this.checkTechnologies();
        technologiesService.on(this.updateTechnologies);
    }

    componentWillUnmount() {
        technologiesService.off(this.updateTechnologies);
    }

    componentDidUpdate(prevProps: Readonly<JobOfferTechnologiesProps>, prevState: Readonly<JobOfferTechnologiesState>, snapshot?: any) {

        if(!Utils.sameAs(prevProps.selectedTechnologies, this.props.selectedTechnologies)){
            this.checkTechnologies();
        }

    }

    private updateTechnologies = (items: Array<Technology>): void => {
        this.setSingle('technologies', items);
        this.setCategories();
        this.checkTechnologies();
    }

    private checkTechnologies() : void {

        for(let tech2 of this.props.selectedTechnologies){
            tech2.checked = true;
            Utils.replaceInArray(this.state.technologies, tech2, 'key');
        }

        this.setSelf('technologies');

    }

    private setCategories(): void {
        this.setSingle('categories', this.getCategories());
    }

    private getCategories(): Array<MenuItem> {

        let categoriesSet: Set<string> = new Set();

        for (let technology of this.state.technologies) {
            categoriesSet.add(technology.category);
        }

        let categoriesArr: Array<string> = Array.from(categoriesSet);
        categoriesArr.unshift('Any');

        return categoriesArr.map((category: string) => {
            return {
                label: category
            }
        });

    }

    private checkTechnology = (technology: Technology, checked: boolean): void => {
        technology.checked = checked;
        this.setSelf('technologies');
        this.props.onSelect(Utils.copy(this.state.technologies));
    }

    private onChangeFilter = (value: string): void => {
        this.setSingle('filter', Utils.isEmpty(value) ? '' : value);
    }

    private onCategoryChange = (value: MenuItem): void => {

        if (value === null) {
            value = this.anyCategory;
        }

        this.setSingle('category', value);
    }

    private scoreTechnology = (technology: Technology, importance: Importance): void => {
        technology.importance = importance;
        this.setSelf('technologies');
        this.props.onSelect(Utils.copy(this.state.technologies));
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

            <div className="block">
                {this.state.technologies.map((technology: Technology, index: number) => {

                    if (this.state.category.label === this.anyCategory.label || technology.category === this.state.category.label) {
                        let label: string = `${technology.category}/${technology.name}`;

                        if(label.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1){
                            return <div className="p-button p-togglebutton p-component token developer-tech-token mx-1 my-1" key={index}>
                                <div className="flex justify-content-center align-items-center">
                                    <div className="mr-2">{label}</div>
                                    <Dropdown className={Utils.isNotEmpty(technology.importance) && technology.importance !== Importance.NOT_APPLICABLE ? 'p-button-primary' : ''} value={technology.importance} options={this.importances} onChange={(e) => this.scoreTechnology(technology, e.value)} placeholder="Importance"/>
                                </div>
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
