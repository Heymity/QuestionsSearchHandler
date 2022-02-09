import { QuestionTopic } from "../Types";
import React, {Component} from "react";

interface IProps {
    
}

interface IState {
    questionTopic :QuestionTopic
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
                    this.props.questionTopic.subTopics.map(t => <Topic questionTopic={t} nestedIndex={nestedIndex + 1} parentQuestionTopic={this}/>)
                }
            </div>
        )
    }
}


export class QuestionFilteringPage extends Component<IProps, IState> {
    constructor(props :IProps) {
        super(props);
        this.state = { questionTopic: { topicName: "Hello", isLast: true, subTopics: [], isSelected: false }, loading: true }
    }
    
    componentDidMount() {
        this.refreshQuestionTopics()
    }

    async refreshQuestionTopics() {
        let response = await fetch("api/Topics");
        let data = await response.json();
        console.log(data)
        this.setState({ questionTopic: data, loading: false });
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
            </div>
        )
    }
}