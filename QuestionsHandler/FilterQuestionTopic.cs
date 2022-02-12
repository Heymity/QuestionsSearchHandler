namespace QuestionsHandler;

public class FilterQuestionTopic : QuestionTopic
{
    public bool IsSelected { get; set; }
    
    public FilterQuestionTopic(string topicName) : base(topicName)
    {
        
    }
}