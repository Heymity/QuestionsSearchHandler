import {FiltersData, QuestionTopic} from "../Types";
import React, {Component} from "react";
import {QueueStoreEntry} from "workbox-background-sync/lib/QueueStore";

interface IProps {
    
}

interface IState {
    questionTopic :QuestionTopic
    filtersData :FiltersData
    loading :boolean
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
    filterName :string
}

interface ExtraFilterProps {
    filterName :string
    items :string[] | number[]
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
}


export class QuestionFilteringPage extends Component<IProps, IState> {
    constructor(props :IProps) {
        super(props);
        this.state = { 
            questionTopic: { topicName: "Loading...", isLast: true, subTopics: [], isSelected: false }, 
            filtersData: {questionTypes: [], difficulties: [], ratings: [], sources: [], years:[]}, 
            loading: true 
        }
        this.ExtraFilter = this.ExtraFilter.bind(this)
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
        const ListItem = (props :ListItemProps) => {
            let id = props.text.replace(" ", "-") + "-" + props.filterName
            
            return (
                <div>
                    <input type="checkbox" className={"form-check-input me-2"} /*checked={} onChange={}*/ id={id}/>
                    <label htmlFor={id}>{props.text}</label>
                </div>
            )
        }
        
        return (
            <div className="extraFilter">
                <h5>{props.filterName}</h5>
                <div className="extraFiltersContainer">
                    {props.items.map(i => <ListItem text={i.toString()} filterName={props.filterName}/>)}
                </div>
            </div>)
    }
    
    render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : <Topic questionTopic={this.state.questionTopic} startOpen={true}/>
        
        return (
            <div>
                <h1>Question Filtering</h1>
                <p>A place to filter the questions</p>
                {contents}
                <div className="extraFiltersDiv">
                    <this.ExtraFilter filterName="Fonte" items={this.state.filtersData.sources}/>
                    <this.ExtraFilter filterName="Ano" items={this.state.filtersData.years}/>
                    <this.ExtraFilter filterName="Tipo" items={this.state.filtersData.questionTypes}/>
                    <this.ExtraFilter filterName="Dificuldade" items={this.state.filtersData.difficulties}/>
                    <this.ExtraFilter filterName="Avaliação" items={this.state.filtersData.ratings}/>
                </div>
                <br/>
                <br/>
                <div>
                    <button className="btn btn-success">See Questions</button>
                </div>
            </div>
        )
    }
}