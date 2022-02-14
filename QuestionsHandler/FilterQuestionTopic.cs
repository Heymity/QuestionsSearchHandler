namespace QuestionsHandler;

public class FilterQuestionTopic : QuestionTopic
{
    public bool IsSelected { get; set; }
    
    public FilterQuestionTopic(string topicName) : base(topicName)
    {
        
    }

    public bool Contains(string[][] topics)
    {
        var selectedTopics = TopicsListFromStringMatrix(topics);
        Console.WriteLine($"Topics Size: {selectedTopics[0].TopicName + selectedTopics[0].SubTopics.Aggregate("", (f, s) => f + "->" + s.TopicName)}");
//TODO: print entire tree
        selectedTopics.ForEach(qTopic => ContainsTopic(this, qTopic));
        
        return true;
    }

    private static bool ContainsTopic(QuestionTopic topic1, QuestionTopic topic2)
    {
        if (topic1.TopicName != topic2.TopicName) return false;
        if (topic1.IsLast || topic2.IsLast) return topic1.TopicName == topic2.TopicName;

        return (
            from st1 in topic1.SubTopics 
            from st2 in topic2.SubTopics 
            where st1.TopicName == st2.TopicName 
            where ContainsTopic(st1, st2) 
            select st1).Any();
    }
}