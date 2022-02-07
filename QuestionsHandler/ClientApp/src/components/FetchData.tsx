import React, { Component } from 'react';
import { Question } from "../Types";

interface IProps {
}

interface QuestionTableProps {
  questions: Question[]
}

interface IState {
  questions: [],
  loading: boolean,
  sortedField: string
  sortingDirection: number
}

export class FetchData extends Component<IProps, IState> {
  static displayName = FetchData.name;

  constructor(props :IProps) {
    super(props);
    this.state = { questions: [], loading: true, sortedField: "year", sortingDirection: 1 };
  }

  componentDidMount() {
    this.populateQuestionsData();
  }

  render() {
    const QuestionsTable = (props :QuestionTableProps) => {
      const { questions } = props

      let sortedQuestions = [...questions]
      
      sortedQuestions.sort((a, b) => {
        if (a[this.state.sortedField] < b[this.state.sortedField]) {
          return -1 * this.state.sortingDirection
        }
        if (a[this.state.sortedField] > b[this.state.sortedField]) {
          return this.state.sortingDirection;
        }
        return 0
      })
      
      const requestSort = (key :string) => {
        this.setState({ sortingDirection: -this.state.sortingDirection })
        this.setState({ sortedField: key })
      }

      const getSortingSymbol = (key :string) => {
        return this.state.sortedField === key ? this.state.sortingDirection === -1 ? "↑" : "↓" : ""
      }
      
      return (
          <table className='table table-striped' aria-labelledby="tabelLabel">
            <thead>
            <tr>
              <th>Question ID</th>
              <th><button type="button" onClick={() => requestSort('rating')} className="transparentButton">Rating {getSortingSymbol('rating')} </button></th>
              <th><button type="button" onClick={() => requestSort('source')} className="transparentButton">Source {getSortingSymbol('source')}</button></th>
              <th><button type="button" onClick={() => requestSort('year')} className="transparentButton">Year {getSortingSymbol('year')}</button></th>
            </tr>
            </thead>
            <tbody>
            {sortedQuestions.map(question =>
                <tr key={question.questionId}>
                  <td><button className="transparentButton">{question.questionId}</button></td>
                  <td><button className="transparentButton">{question.rating}</button></td>
                  <td><button className="transparentButton">{question.source}</button></td>
                  <td><button className="transparentButton">{question.year}</button></td>
                </tr>
            )}
            </tbody>
          </table>
      );
    }
    
    let contents = this.state.loading
      ? <p><em>Loading...</em></p>
        : <QuestionsTable questions={this.state.questions}/>

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
