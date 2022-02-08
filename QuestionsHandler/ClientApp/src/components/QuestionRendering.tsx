import React, { Component } from 'react';
import { Question } from "../Types";

interface IState {
    question :Question,
}

interface IProps {
    question :Question
}

interface QuestionProps {
    question :Question
}

const QuestionRenderer = (props :QuestionProps) => {
    return (
        <div>
            <p><em>Question</em></p>
            <div className="questionImageContainer">
                <img src={props.question.questionData} alt="Question Image"/>
                <div className="button"><button className="btn btn-dark">Donwload</button></div>
            </div>
            <hr/>
            <p><em>Answer</em></p>
            <div className="questionImageContainer">
                <img src={props.question.answerData} alt="Answer Image"/>
                <div className="button"><button className="btn btn-dark">Donwload</button></div>
            </div>
        </div>
    )
}

export const QuestionDisplay = (props :IProps) => {
    return (
        <div>
            <br/>
            <h2>[{props.question.questionId}] {props.question.source} ({props.question.year}) - Dificuldade {props.question.difficulty} - Avaliação {props.question.rating}/5</h2>
            {props.question.topics.map(t => 
                <h6>{t.join(' → ')}</h6>
            )}
            <br/>
            <QuestionRenderer question={props.question}/>
        </div>
    );
}
