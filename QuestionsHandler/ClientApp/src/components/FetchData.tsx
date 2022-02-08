import React, { Component } from 'react';
import { Question } from "../Types";
import { QuestionDisplay } from "./QuestionRendering";

interface IProps {
}

interface IState {
  questions :Question[],
  loading :boolean,
  
  sortedField :string
  sortingDirection :number
  
  renderingQuestion :boolean
  selectedQuestionIndex :number
}

export class FetchData extends Component<IProps, IState> {
  static displayName = FetchData.name;

  constructor(props :IProps) {
    super(props);
    this.state = { questions: [], loading: true, sortedField: "year", sortingDirection: -1, renderingQuestion: false, selectedQuestionIndex: 0 };
  }

  componentDidMount() {
    this.populateQuestionsData();
  }

  render() {
    const QuestionsTable = () => {
      let sortedQuestions = this.state.questions
      
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
              <th>Question ID</th>
              <th><button type="button" onClick={() => requestSort('rating')} className="transparentButton">Rating {getSortingSymbol('rating')} </button></th>
              <th><button type="button" onClick={() => requestSort('source')} className="transparentButton">Source {getSortingSymbol('source')}</button></th>
              <th><button type="button" onClick={() => requestSort('year')} className="transparentButton">Year {getSortingSymbol('year')}</button></th>
            </tr>
            </thead>
            <tbody>
            {sortedQuestions.map((question, index) =>
                <tr key={question.questionId} onClick={() => renderQuestion(index)} className="questions-row">
                  <td>{question.questionId}</td>
                  <td>{index}</td>
                  <td>{question.rating}</td>
                  <td>{question.source}</td>
                  <td>{question.year}</td>
                </tr>
            )}
            </tbody>
          </table>
      );
    }
    
    const renderQuestion = (qIndex :number) => {
      if (qIndex < 0 || qIndex >= this.state.questions.length) return
      this.setState({ renderingQuestion: true, selectedQuestionIndex: qIndex })
    }
    
    const goOneQuestionBack = () => {
      if (this.state.selectedQuestionIndex > 0)
        this.setState({ selectedQuestionIndex: this.state.selectedQuestionIndex - 1 })
    }

    const goOneQuestionForwards = () => {
      if (this.state.selectedQuestionIndex < this.state.questions.length - 1)
        this.setState({ selectedQuestionIndex: this.state.selectedQuestionIndex + 1 })
    }
    
    if (!this.state.renderingQuestion ) {
      let contents = this.state.loading
          ? <p><em>Loading...</em></p>
          : <QuestionsTable/>

      return (
          <div>
            <h1 id="tableLabel">Questions List</h1>
            <p>A list of all the questions ({this.state.questions.length})</p>
            {contents}
          </div>
      );
    }
    else {
      return (
          <div>
            <button className="btn btn-outline-info" onClick={() => this.setState({ renderingQuestion: false })}>← Go back to list</button>
            <button className="btn btn-warning" onClick={goOneQuestionBack}>← Questão anterior</button>
            <input type="text" value={this.state.selectedQuestionIndex} onChange={(event) => renderQuestion(+event.target.value)}/>
            <button className="btn btn-warning" onClick={goOneQuestionForwards}>Próxima questão →</button>
            <QuestionDisplay question={this.state.questions[this.state.selectedQuestionIndex]}/>
          </div>
      )
    }
  }

  async populateQuestionsData() {
    const response = await fetch('api/Questions');
    const data = await response.json();
    this.setState({ questions: data, loading: false });
  }
}
