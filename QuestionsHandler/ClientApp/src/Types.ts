﻿export type Question = {
    questionId :number,
    source :string,
    year :number,
    difficulty :string,
    questionType :string,
    mainTopic :string,
    topics :string[][],
    rating :number,
    questionData :string,
    answerData :string

    [key :string] :number | string | string[][]
}

export type None = {}