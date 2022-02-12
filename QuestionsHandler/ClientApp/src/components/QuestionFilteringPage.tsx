import {FiltersData, QuestionTopic} from "../Types";
import React, {Component} from "react";
import {act} from "react-dom/test-utils";

interface IProps {
    
}

interface IState {
    questionTopic :QuestionTopic
    filtersData :FiltersData
    loading :boolean,
    selectedFilters :FiltersData
}

interface TopicDisplayProps{
    questionTopic :QuestionTopic
    nestedIndex? :number
    startOpen? :boolean
    parentQuestionTopic? :Topic
}

interface TopicState {
    collapsed :boolean
    refresh :boolean
}

interface ListItemProps {
    text :string
    filterType :ExtraFilterType
}

interface ExtraFilterProps {
    filterType :ExtraFilterType
    items :string[] | number[]
}

enum ExtraFilterType {
    Year,
    Source,
    Difficulty,
    Type,
    Rating
}

export class Topic extends Component<TopicDisplayProps, TopicState> {
    constructor(props :TopicDisplayProps) {
        super(props);
        props.questionTopic.isSelected = props.questionTopic.isSelected ?? false;
        this.state = { collapsed: !props.startOpen ?? true, refresh: true }
        this.toggleCollapse = this.toggleCollapse.bind(this)
        this.areAllSubTopicsSelectedRecursively = this.areAllSubTopicsSelectedRecursively.bind(this)
        this.refresh = this.refresh.bind(this)
    }
    
    toggleCollapse() {
        this.setState({ collapsed: !this.state.collapsed })
    }
    
    refresh(){
        this.setState({ refresh: !this.state.refresh })
        
        if (!this.props.questionTopic.isLast && this.areAllSubTopicsUnselectedRecursively(this.props.questionTopic))
            this.props.questionTopic.isSelected = false;
        
        if (!this.props.questionTopic.isLast && this.areAnySubTopicsSelectedRecursively(this.props.questionTopic))
            this.props.questionTopic.isSelected = true;
    }
    
    toggleSelectTopic(value :boolean) {
        this.setState({ refresh: value })
        this.toggleSelectionRecursively(this.props.questionTopic, value)
        this.refreshTreeRecursively(this)
    }
    
    toggleSelectionRecursively(topic :QuestionTopic, value :boolean) {
        topic.subTopics.forEach(t => this.toggleSelectionRecursively(t, value))
        
        topic.isSelected = value;
    }
    
    areAllSubTopicsSelectedRecursively(topic :QuestionTopic) :boolean {
        if (topic.subTopics.length > 0) {
            let subSelected = topic.subTopics.map(t => this.areAllSubTopicsSelectedRecursively(t))
            if (subSelected.includes(false)) return false
        }
        
        return topic.isSelected
    }
    
    areAnySubTopicsSelectedRecursively(topic :QuestionTopic) :boolean {
        if (topic.subTopics.length > 0) {
            for (let subTopic of topic.subTopics) {
                if (this.areAnySubTopicsSelectedRecursively(subTopic))
                    return true
            }
            
            return false
        }
        
        return topic.isSelected
    }

    areAllSubTopicsUnselectedRecursively(topic :QuestionTopic) :boolean {
        if (topic.subTopics.length > 0) {
            let subSelected = topic.subTopics.map(t => this.areAllSubTopicsSelectedRecursively(t))
            if (subSelected.includes(true)) return false
        }

        return topic.isSelected
    }
    
    refreshTreeRecursively(topic :Topic) {
        topic.refresh()
        
        let parentTopic = topic.props.parentQuestionTopic;
        
        if (parentTopic != null) this.refreshTreeRecursively(parentTopic)
    }
    
    render() {
        let nestedIndex = this.props.nestedIndex ?? 0;

        let dashes = '\u00A0'.repeat(6 * nestedIndex) + "∟";

        if (this.props.questionTopic.topicName === "Biologia") console.log(this.areAllSubTopicsSelectedRecursively(this.props.questionTopic))
        return (
            <div>
                <div className="questionTopic">
                    {dashes}
                    <div className="questionTopicExpandDiv">
                        {!this.props.questionTopic.isLast &&
                            <button className="questionTopicExpandBtn" onClick={this.toggleCollapse}>{this.state.collapsed ? "►" : "▼"}</button>
                        }
                    </div>
                    <input type="checkbox" className={(this.areAllSubTopicsSelectedRecursively(this.props.questionTopic) ? "" : "greyCheckBox ") + "form-check-input me-1"} checked={this.props.questionTopic.isSelected} onChange={event => this.toggleSelectTopic(event.target.checked)}/>
                    <h6>&nbsp;{this.props.questionTopic.topicName}</h6>
                </div>
                {
                    !this.props.questionTopic.isLast && !this.state.collapsed && 
                    this.props.questionTopic.subTopics.map(t => <Topic questionTopic={t} nestedIndex={nestedIndex + 1} parentQuestionTopic={this} key={t.topicName}/>)
                }
            </div>
        )
    }
    
    
    getQuestionTopicRecursively() :QuestionTopic {
        let qTopic :QuestionTopic;
        qTopic = { ...this.props.questionTopic };
        qTopic = this.uncheckTopicsForAPIRequest(qTopic)
        
        return qTopic;
    }
    
    uncheckTopicsForAPIRequest(topic :QuestionTopic) :QuestionTopic {
        if (topic.isLast) return topic
        
        if (!this.areAllSubTopicsSelectedRecursively(topic)) topic.isSelected = false;
        
        topic.subTopics.forEach(t => this.uncheckTopicsForAPIRequest(t))
        
        return topic;
    }
}


export class QuestionFilteringPage extends Component<IProps, IState> {
    RootTopic :React.RefObject<Topic>;
    
    constructor(props :IProps) {
        super(props);
        this.state = { 
            questionTopic: { topicName: "Loading...", isLast: true, subTopics: [], isSelected: false }, 
            filtersData: { questionTypes: [], difficulties: [], ratings: [], sources: [], years:[] }, 
            loading: true,
            selectedFilters: { questionTypes: [], difficulties: [], ratings: [], sources: [], years:[] }
        }
        this.ExtraFilter = this.ExtraFilter.bind(this)
        this.SubmitFiltersAndGetQuestions = this.SubmitFiltersAndGetQuestions.bind(this)
        
        this.RootTopic = React.createRef();
    }
    
    async componentDidMount() {
        await this.refreshQuestionTopics()
        await this.refreshFiltersData()
        this.setState({ loading: false });
    }

    async refreshQuestionTopics() {
        let response = await fetch("api/Filters/topics");
        let data = await response.json();
        this.setState({ questionTopic: data });
    }

    async refreshFiltersData() {
        let response = await fetch("api/Filters/advFilters");
        let data = await response.json();
        this.setState({ filtersData: data });
    }

    ExtraFilter = (props :ExtraFilterProps) => {
        const getNameFromType = (fType :ExtraFilterType) :string => {
            switch (fType) {
                case ExtraFilterType.Type:
                    return "Tipo"
                case ExtraFilterType.Rating:
                    return "Avaliação"
                case ExtraFilterType.Source:
                    return "Fonte"
                case ExtraFilterType.Difficulty:
                    return "Dificuldade"
                case ExtraFilterType.Year:
                    return "Ano"
            }
        }
        
        const ListItem = (props :ListItemProps) => {
            const filterSelected = (active :boolean, fType :ExtraFilterType) => {
                let sFilters = this.state.selectedFilters;
                let index = 0;
                switch (fType) {
                    case ExtraFilterType.Year:
                        index = sFilters.years.indexOf(+props.text)
                        if (index > -1) {
                            if (!active)
                                sFilters.years = sFilters.years.filter(f => f !== +props.text)
                        }
                        else {
                            if (active)
                                sFilters.years.push(+props.text)
                        }
                        break;
                    case ExtraFilterType.Difficulty:
                        index = sFilters.difficulties.indexOf(props.text)
                        if (index > -1) {
                            if (!active)
                                sFilters.difficulties = sFilters.difficulties.filter(f => f !== props.text)
                        }
                        else {
                            if (active)
                                sFilters.difficulties.push(props.text)
                        }
                        break;
                    case ExtraFilterType.Rating:
                        index = sFilters.ratings.indexOf(+props.text)
                        if (index > -1) {
                            if (!active)
                                sFilters.ratings = sFilters.ratings.filter(f => f !== +props.text)
                        }
                        else {
                            if (active)
                                sFilters.ratings.push(+props.text)
                        }
                        break;
                    case ExtraFilterType.Source:
                        index = sFilters.sources.indexOf(props.text)
                        if (index > -1) {
                            if (!active)
                                sFilters.sources = sFilters.sources.filter(f => f !== props.text)
                        }
                        else {
                            if (active)
                                sFilters.sources.push(props.text)
                        }
                        break;
                    case ExtraFilterType.Type:
                        index = sFilters.questionTypes.indexOf(props.text)
                        if (index > -1) {
                            if (!active)
                                sFilters.questionTypes = sFilters.questionTypes.filter(f => f !== props.text)
                        }
                        else {
                            if (active)
                                sFilters.questionTypes.push(props.text)
                        }
                        break;
                }

                this.setState({ selectedFilters: sFilters })
            }
            
            const isFilterActive = (type :ExtraFilterType) :boolean => {
                switch (type) {
                    case ExtraFilterType.Year:
                        return this.state.selectedFilters.years.includes(+props.text)
                    case ExtraFilterType.Difficulty:
                        return this.state.selectedFilters.difficulties.includes(props.text)
                    case ExtraFilterType.Rating:
                        return this.state.selectedFilters.ratings.includes(+props.text)
                    case ExtraFilterType.Source:
                        return this.state.selectedFilters.sources.includes(props.text)
                    case ExtraFilterType.Type:
                        return this.state.selectedFilters.questionTypes.includes(props.text);
                }
                
                return false;
            }
            
            let id = props.text.replace(" ", "-") + "-" + props.filterType.toString()
            
            return (
                <div>
                    <input type="checkbox" className={"form-check-input me-2"} checked={isFilterActive(props.filterType)} onChange={event => filterSelected(event.target.checked, props.filterType)} id={id}/>
                    <label htmlFor={id}>{props.text}</label>
                </div>
            )
        }
        
        return (
            <div className="extraFilter">
                <h5>{getNameFromType(props.filterType)}</h5>
                <div className="extraFiltersContainer">
                    {props.items.map(i => <ListItem text={i.toString()} filterType={props.filterType}/>)}
                </div>
            </div>)
    }
    
    SubmitFiltersAndGetQuestions = async () => {
        let rootTopic = this.RootTopic.current;
        if (rootTopic === null) {
            console.error("Root topic is null!")
            return
        }
        
        let tFilters = rootTopic.getQuestionTopicRecursively()
        
        let requestBody = {
            AdvancedFilters: this.state.selectedFilters,
            TopicFilters: tFilters
        }
        
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        };
        
        let response = await fetch('api/Questions/filteredQuestions', requestOptions)
        let data = await response.json()
        console.log(data)
    }
    
    render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : (<div>
                <Topic questionTopic={this.state.questionTopic} startOpen={true} ref={this.RootTopic}/>
                <div className="extraFiltersDiv">
                    <this.ExtraFilter filterType={ExtraFilterType.Source} items={this.state.filtersData.sources}/>
                    <this.ExtraFilter filterType={ExtraFilterType.Year} items={this.state.filtersData.years}/>
                    <this.ExtraFilter filterType={ExtraFilterType.Type} items={this.state.filtersData.questionTypes}/>
                    <this.ExtraFilter filterType={ExtraFilterType.Difficulty} items={this.state.filtersData.difficulties}/>
                    <this.ExtraFilter filterType={ExtraFilterType.Rating} items={this.state.filtersData.ratings}/>
                </div>
            </div>)
        
        return (
            <div>
                <h1>Question Filtering</h1>
                <p>A place to filter the questions</p>
                {contents}
                <br/>
                <br/>
                <div>
                    <button className="btn btn-success" onClick={this.SubmitFiltersAndGetQuestions}>See Questions</button>
                </div>
            </div>
        )
    }
}