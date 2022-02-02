import React from "react";
import {DefaultProps, DefaultState, State} from "../state";
import {technologiesService, Technology} from "../services/technologies-service";
import {MenuItem} from "primereact/menuitem";
import {Utils} from "../utils";
import {DeveloperTechnology, Score} from "../services/developers-service";
import {Dropdown} from "primereact/dropdown";

interface DeveloperTechnologiesProps extends DefaultProps {
    onSelect?: (items: Array<DeveloperTechnology>) => void;
    scoredTechnologies: Array<DeveloperTechnology>;
}

interface DeveloperTechnologiesState extends DefaultState {
    category: MenuItem;
    categories: Array<MenuItem>;
    technologies: Array<DeveloperTechnology>;
}

export class DeveloperTechnologies extends State<DeveloperTechnologiesProps, DeveloperTechnologiesState> {

    private readonly anyCategory: MenuItem = {label: 'Any'};

    private readonly theoryScores: Array<MenuItem> = [
        {label: 'None', value: Score.SCORE_NONE},
        {label: 'Yes', value: Score.SCORE_YES},
        {label: 'No', value: Score.SCORE_NO}
    ]

    private readonly markScores: Array<MenuItem> = [
        {label: 'None', value: Score.SCORE_NONE},
        {label: '1', value: Score.SCORE_1},
        {label: '2', value: Score.SCORE_2},
        {label: '3', value: Score.SCORE_3},
        {label: '4', value: Score.SCORE_4},
        {label: '5', value: Score.SCORE_5}
    ]

    state: DeveloperTechnologiesState = {
        category: this.anyCategory,
        categories: [],
        technologies: []
    }

    componentDidMount(): void {
        this.setSingle('technologies', technologiesService.getImmutableItems());
        this.setCategories();
        this.scoreTechnologies();

        technologiesService.on(this.updateTechnologies);
    }

    componentWillUnmount() {
        technologiesService.off(this.updateTechnologies);
    }

    componentDidUpdate(prevProps: Readonly<DeveloperTechnologiesProps>, prevState: Readonly<DeveloperTechnologiesState>, snapshot?: any) {

        if (!Utils.sameAs(prevProps.scoredTechnologies, this.props.scoredTechnologies)) {
            this.scoreTechnologies();
        }

    }

    private updateTechnologies = (items: Array<Technology>): void => {
        this.setSingle('technologies', items);
        this.setCategories();
        this.scoreTechnologies();
    }

    private scoreTechnologies(): void {

        for (let tech2 of this.props.scoredTechnologies) {
            tech2.theory = Utils.findInArray(this.state.technologies, tech2.key, 'key').theory;
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

    private scoreTechnology = (technology: DeveloperTechnology, score: Score): void => {
        technology.score = score;
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
                {this.state.technologies.map((technology: DeveloperTechnology, index: number) => {

                    if (this.state.category.label === this.anyCategory.label || technology.category === this.state.category.label) {
                        let label: string = `${technology.category}/${technology.name}`;

                        return <div className="p-button p-togglebutton p-component token developer-tech-token mx-1 my-1" key={index}>
                            <div className="flex justify-content-center align-items-center">
                                <div className="mr-2">{label}</div>
                                <Dropdown className={Utils.isNotEmpty(technology.score) && technology.score !== Score.SCORE_NONE ? 'p-button-primary' : ''} value={technology.score} options={technology.theory ? this.theoryScores : this.markScores} onChange={(e) => this.scoreTechnology(technology, e.value)} placeholder="Score"/>
                            </div>
                        </div>

                    }

                    return <React.Fragment key={index}/>

                })}
            </div>

        </div>
    }


}
