using System.Text;
using UnidecodeSharpFork;

namespace QuestionsHandler;

public class QuestionTopic
{
    // ReSharper disable once StringLiteralTypo
    public const string RootQuestionsTopic = "Ensino Médio";
    //TODO for the next seeding, change the file extension to .precomp.json
    public const string TopicsFileName = "QuestionTopics.json";
    
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
        //Console.WriteLine(topic.TopicName.Unidecode());
        //the match is not with the child to child, but rather parent with child (EM->Fis) - (Fis->...)
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

        bool AreOfSameTopic(QuestionTopic a, QuestionTopic b) => a.TopicName.Unidecode().Replace('ç', 'c').Replace('ã', 'a') == b.TopicName.Unidecode().Replace('ç', 'c').Replace('ã', 'a');
    }

    public static List<QuestionTopic> TopicsListFromStringMatrix(string[][] topics)
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