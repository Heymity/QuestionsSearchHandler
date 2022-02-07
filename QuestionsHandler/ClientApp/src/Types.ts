export type Question = {
    questionId :number,
    source :string,
    year :number,
    difficulty :string,
    questionType :string,
    mainTopic :string,
    topics :string[][],
    rating :number,
    questionPath :string,
    answerPath :string

    [key :string] :number | string | string[][]
}

export type None = {}