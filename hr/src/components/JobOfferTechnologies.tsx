import React from "react";
import {DefaultProps, DefaultState, State} from "../state";
import {technologiesService, Technology} from "../services/technologies-service";
import {ToggleButton} from "primereact/togglebutton";
import {MenuItem} from "primereact/menuitem";
import {Utils} from "../utils";
import {Dropdown} from "primereact/dropdown";

interface JobOfferTechnologiesProps extends DefaultProps {
    onSelect?: (items: Array<Technology>) => void;
    selectedTechnologies: Array<Technology>;
}

interface JobOfferTechnologiesState extends DefaultState {
    category: MenuItem;
    categories: Array<MenuItem>;
    technologies: Array<Technology>;
}

export class JobOfferTechnologies extends State<JobOfferTechnologiesProps, JobOfferTechnologiesState> {

    private readonly anyCategory: MenuItem = {label: 'Any'};

    state: JobOfferTechnologiesState = {
        category: this.anyCategory,
        categories: [],
        technologies: []
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

    private onCategoryChange = (value: MenuItem): void => {

        if (value === null) {
            value = this.anyCategory;
        }

        this.setSingle('category', value);
    }

    render(): JSX.Element {
        return <div>

            <div className="card mb-2">
                <Dropdown options={this.state.categories} value={this.state.category} onChange={(e) => this.onCategoryChange(e.value)}/>
            </div>

            <div className="block">
                {this.state.technologies.map((technology: Technology, index: number) => {

                    if (this.state.category.label === this.anyCategory.label || technology.category === this.state.category.label) {
                        let label: string = `${technology.category}/${technology.name}`;
                        return <ToggleButton className="token mx-1 my-1 flex justify-content-center align-items-center" key={index} onLabel={label} offLabel={label}
                                             checked={technology.checked} onChange={(e) => this.checkTechnology(technology, e.value)}/>;

                    }

                    return <React.Fragment key={index}/>

                })}
            </div>

        </div>
    }


}
