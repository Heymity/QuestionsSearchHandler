import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { ListQuestions } from './components/ListQuestions';

import './custom.css'
import {QuestionFilteringPage} from "./components/QuestionFilteringPage";

export default class App extends Component {
  static displayName = App.name;

  render () {
    return (
      <Layout>
        <Route exact path='/' component={Home} />
        <Route path='/list-questions' component={ListQuestions} />
        <Route path='/filter-questions' component={QuestionFilteringPage} />
      </Layout>
    );
  }
}
