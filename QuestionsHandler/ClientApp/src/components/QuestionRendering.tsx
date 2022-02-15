import { Question } from "../Types";
import { copyImageToClipboard, canCopyImagesToClipboard } from 'copy-image-clipboard'

interface IProps {
    question :Question
}

interface QuestionProps {
    question :Question
}

const QuestionRenderer = (props :QuestionProps) => {
    const copyImage = async (img :string) => {
        console.log("Can copy Images to clipboard: " + canCopyImagesToClipboard())
        await copyImageToClipboard(img)
    }
    
    return (
        <div>
            <p><em>Questão</em></p>
            <div className="questionImageContainer">
                <img src={props.question.questionData} alt="Question Image"/>
                <div className="button"><button className="btn btn-dark" onClick={() => copyImage(props.question.questionData)}>Copiar</button></div>
            </div>
            <hr/>
            <p><em>Resposta</em></p>
            <div className="questionImageContainer">
                <img src={props.question.answerData} alt="Answer Image"/>
                <div className="button"><button className="btn btn-dark">Copiar</button></div>
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
