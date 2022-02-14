namespace QuestionsHandler;

public class FilterQuestionTopic : QuestionTopic
{
    public bool IsSelected { get; set; }
    
    public FilterQuestionTopic(string topicName) : base(topicName)
    {
        
    }

    public bool Contains(IEnumerable<string[]> topics)
    {
        var selectedTopics = TopicsListFromStringMatrix(topics);

        return selectedTopics.Any(qTopic => ContainsTopic(this, qTopic));
    }

    private static bool ContainsTopic(QuestionTopic topic1, QuestionTopic topic2)
    {
        if (topic1.TopicName != topic2.TopicName) return false;
        switch (topic1.IsLast)
        {
            case true when topic2.IsLast:
                return topic1.TopicName == topic2.TopicName;
            
            case true when !topic2.IsLast:
            case false when topic2.IsLast:
                return false;
            
            default:
                return (
                    from st1 in topic1.SubTopics 
                    from st2 in topic2.SubTopics 
                    where st1.TopicName == st2.TopicName 
                    where ContainsTopic(st1, st2) 
                    select st1).Any();
        }
    }
}