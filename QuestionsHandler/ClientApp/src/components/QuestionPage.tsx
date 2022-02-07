import React, { Component } from 'react';
import { None } from "../Types";

interface IState {
    questions: [],
    loading: boolean,
    sortedField: string
    sortingDirection: number
}

export class QuestionDisplay extends Component<None, IState> {
    static displayName = QuestionDisplay.name;

    constructor(props :None) {
        super(props);
        this.state = { questions: [], loading: true, sortedField: "year", sortingDirection: 1 };
    }

    componentDidMount() {
        this.populateQuestionsData();
    }

    render() {
        
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : <p>Hi</p>

        return (
            <div>
                <h1 id="tabelLabel" >Questions List</h1>
        <p>A list of all the questions data</p>
        {contents}
        </div>
    );
    }

    async populateQuestionsData() {
        const response = await fetch('api/Questions');
        const data = await response.json();
        this.setState({ questions: data, loading: false });
    }
}
