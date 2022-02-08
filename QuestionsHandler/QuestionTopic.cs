namespace QuestionsHandler;

public class QuestionTopic
{
    // ReSharper disable once StringLiteralTypo
    public const string RootQuestionsTopic = "Ensino Médio";
    public const string TopicsFileName = "QuestionTopics.json";
    
    public string TopicName { get; init; }
    public List<QuestionTopic> subTopics { get; set; }
    public bool isLast => !subTopics.Any();

    public QuestionTopic(string topicName)
    {
        TopicName = topicName;
        subTopics = new List<QuestionTopic>();
    }

    public bool MergeTopic(QuestionTopic topic)
    {
        foreach (var questionSubTopic in subTopics)
        {
            foreach (var mergeTopicSubTopic in topic.subTopics.Where(mergeTopicSubTopic => questionSubTopic.TopicName == mergeTopicSubTopic.TopicName))
            {
                if (questionSubTopic.isLast && mergeTopicSubTopic.isLast) return true;

                return questionSubTopic.MergeTopic(mergeTopicSubTopic);
            }
        }
        
        if (TopicName == topic.TopicName)
            subTopics.AddRange(topic.subTopics);
        else
            subTopics.Add(topic);
        return true;

    }

    public static QuestionTopic FromStringMatrix(string[][] topics)
    {
        var rootTopic = new QuestionTopic(RootQuestionsTopic);
        foreach (var topicArray in topics)
        {
            rootTopic.subTopics.Add(FromStringArray(topicArray));
        }

        return rootTopic;
    }
    
    public static QuestionTopic FromStringArray(string[] topics)
    {
        var rootTopic = new QuestionTopic(topics[0]);
        
        if (topics.Length > 1)
            rootTopic.subTopics.Add(FromStringArray(topics[1..]));
        else
            rootTopic.subTopics.Add(new QuestionTopic(topics[0]));
        
        return rootTopic;
    }
}