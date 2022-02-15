using System.Text;

namespace QuestionsHandler;

public class QuestionTopic
{
    // ReSharper disable once StringLiteralTypo
    public const string RootQuestionsTopic = "Ensino Médio";
    public const string TopicsFileName = "QuestionTopics.precomp.json";
    
    public string TopicName { get; init; }
    public List<QuestionTopic> SubTopics { get; set; }
    public bool IsLast => !SubTopics.Any();

    public QuestionTopic(string topicName)
    {
        TopicName = topicName;
        SubTopics = new List<QuestionTopic>();
    }

    public bool MergeTopic(QuestionTopic topic)
    {
        foreach (var questionSubTopic in SubTopics)
        {
            foreach (var mergeTopicSubTopic in topic.SubTopics.Where(mergeTopicSubTopic => AreOfSameTopic(questionSubTopic, mergeTopicSubTopic)))
            {
                if (questionSubTopic.IsLast && mergeTopicSubTopic.IsLast) return true;

                return questionSubTopic.MergeTopic(mergeTopicSubTopic);
            }
        }
        
        if (AreOfSameTopic(this, topic))
            SubTopics.AddRange(topic.SubTopics);
        else
            SubTopics.Add(topic);
        return true;

        bool AreOfSameTopic(QuestionTopic? a, QuestionTopic? b)
        {
            if (a is null || b is null) return false;
            return a.TopicName == b.TopicName;
        }
    }

    public override string ToString()
    {
        var builder = new StringBuilder();

        builder.Append(TopicName);
        if (IsLast) return builder.ToString();
        
        builder.AppendLine(":");
        builder.Append("  ");
        SubTopics.ForEach(st =>
        {
            builder.Append(' ');
            builder.Append('└');
            builder.Append(st);
            builder.AppendLine();
        });

        return builder.ToString();
    }

    public void SortTopicsRecursively()
    {
        if (IsLast) return;
        
        SubTopics = SubTopics.OrderBy(t => t.TopicName).ToList();
        SubTopics.ForEach(t => t.SortTopicsRecursively());
    }

    public static List<QuestionTopic> TopicsListFromStringMatrix(IEnumerable<string[]> topics)
    {
        var topicsList = topics.Select(FromStringArray).ToList();

        return topicsList;
    }
    
    public static QuestionTopic FromStringArray(string[] topics)
    {
        var rootTopic = new QuestionTopic(RootQuestionsTopic);

        var lastTopic = rootTopic;
        foreach (var topic in topics)
        {
            var qTopic = new QuestionTopic(topic);
            lastTopic.SubTopics.Add(qTopic);

            lastTopic = qTopic;
        }

        //Console.WriteLine("Root Topic from array: " + rootTopic.subTopics.Aggregate(rootTopic.TopicName, (f, s) => f + "->" + s.TopicName) + " | Array: " + topics.Aggregate((f, s) => f + "|" + s));
        return rootTopic;
    }
}