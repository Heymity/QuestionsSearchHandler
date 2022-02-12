import React, {Component} from 'react';
import {Question} from "../Types";
import {QuestionDisplay} from "./QuestionRendering";
import {RouteComponentProps} from "react-router-dom";

interface IProps extends RouteComponentProps {
}

interface IState {
  questions :Question[],
  questionsCount :number
  loading :boolean

  questionsPerPage :number
  page :number
  
  sortedField :string
  sortingDirection :number
  
  renderingQuestion :boolean
  selectedQuestionIndex :number
  selectedQuestion? :Question
  
  expandedQuestion :number
}

export class ListQuestions extends Component<IProps, IState> {
  static displayName = ListQuestions.name;

  constructor(props :IProps) {
    super(props);
    this.state = { 
      questions: [],
      questionsCount: 0,
      loading: true, 
      
      questionsPerPage: 50,
      page: 1,
      
      sortedField: "year",
      sortingDirection: -1, 
      
      renderingQuestion: false, 
      selectedQuestionIndex: 0,
      
      expandedQuestion: -1
    };
    this.props.history.location.state // access state to get questions
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
    
    const renderQuestion = async (qIndex :number) => {
      if (qIndex < 0 || qIndex >= this.state.questions.length) return
      let question = await getQuestionOfId(this.state.questions[qIndex].questionId)
      this.setState({ renderingQuestion: true, selectedQuestionIndex: qIndex, expandedQuestion: qIndex, selectedQuestion: question })
    }

    const getQuestionOfId = async (id :number) :Promise<Question> => {
      let response = await fetch(`api/Questions/${id}`)
      return await response.json()
    }
    
    const goOneQuestionBack = async () => {
      if (this.state.selectedQuestionIndex <= 0) return

      let qIndex = this.state.selectedQuestionIndex - 1
      let question = await getQuestionOfId(this.state.questions[qIndex].questionId)
      this.setState({ selectedQuestionIndex: qIndex, selectedQuestion: question })
    }

    const goOneQuestionForwards = async () => {
      if (this.state.selectedQuestionIndex >= this.state.questions.length - 1) return

      let qIndex = this.state.selectedQuestionIndex + 1
      let question = await getQuestionOfId(this.state.questions[qIndex].questionId)
      this.setState({ selectedQuestionIndex: qIndex, selectedQuestion: question })
    }
    
    if (!this.state.renderingQuestion ) {
      let contents = this.state.loading
          ? <p><em>Loading...</em></p>
          : <QuestionsTable/>
      
      return (
          <div>
            <h1 id="tableLabel">Questions List {this.state.page}</h1>
            <p>A list of all the questions ({this.state.questionsCount})</p>
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
            <QuestionDisplay question={this.state.selectedQuestion as Question}/>
          </div>
      )
    }
  }

  async populateQuestionsData() {
    const qCountResponse = await fetch('api/Questions/count');
    const qCountData = await qCountResponse.json();
    this.setState({ questionsCount: qCountData, loading: false });
    
    await this.refreshQuestions();
  }
  
  async refreshQuestions() {
    this.setState({ loading: true })
    const questionsResponse = await fetch(`api/Questions/0/${this.state.questionsCount}`);
    const questionsData = await questionsResponse.json();
    this.setState({ questions: questionsData, loading: false });
  }
}
