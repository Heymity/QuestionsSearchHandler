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
}

const Topic = (props :TopicDisplayProps) => {
    return (
        <div>
            <h6>{props.questionTopic.topicName}</h6>
            {/*!props.questionTopic.IsLast && props.questionTopic.SubTopics.map(p => <Topic questionTopic={p}/>)*/}
        </div>
    )
}


export class QuestionFilteringPage extends Component<IProps, IState> {
    constructor(props :IProps) {
        super(props);
        this.state = { questionTopic: { topicName: "Hello", isLast: true, subTopics: [] }, loading: true }
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
            : <Topic questionTopic={this.state.questionTopic}/>
        
        return (
            <div>
                <h1>Question Filtering</h1>
                <p>A place to filter the questions</p>
                {contents}
            </div>
        )
    }
}