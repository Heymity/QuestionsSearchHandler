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
  
  expandedQuestion :number
}

export class ListQuestions extends Component<IProps, IState> {
  static displayName = ListQuestions.name;

  constructor(props :IProps) {
    super(props);
    this.state = { 
      questions: [], 
      loading: true, 
      sortedField: "year",
      sortingDirection: -1, 
      renderingQuestion: false, 
      selectedQuestionIndex: 0, 
      expandedQuestion: -1
    };
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
              <th onClick={() => requestSort('rating')}>Rating {getSortingSymbol('rating')}</th>
              <th onClick={() => requestSort('source')}>Source {getSortingSymbol('source')}</th>
              <th onClick={() => requestSort('topics')}>Topics {getSortingSymbol('topics')}</th>
              <th onClick={() => requestSort('year')}>Year {getSortingSymbol('year')}</th>
            </tr>
            </thead>
            <tbody>
            {sortedQuestions.map((question, index) =>
                <tr key={question.questionId} onClick={() => renderQuestion(index)} className="questions-row">
                  <td>{question.questionId}</td>
                  <td>{question.rating}</td>
                  <td>{question.source}</td>
                  <td>{question.topics[0].join(' → ')}</td>
                  <td>{question.year}</td>
                </tr>
            )}
            </tbody>
          </table>
      );
    }
    
    const renderQuestion = (qIndex :number) => {
      if (qIndex < 0 || qIndex >= this.state.questions.length) return
      this.setState({ renderingQuestion: true, selectedQuestionIndex: qIndex, expandedQuestion: qIndex })
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
            <div className="btn-group question-page-nav">
              <button className="btn btn-warning" onClick={goOneQuestionBack}>← Questão anterior</button>
              <input type="text" className="question-nav-input" value={this.state.selectedQuestionIndex} onChange={(event) => renderQuestion(+event.target.value)}/>
              <button className="btn btn-warning" onClick={goOneQuestionForwards}>Próxima questão →</button>
            </div>
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
