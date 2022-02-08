using System.Text.Json;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;

namespace QuestionsHandler;

public static class DatabaseSeeder
{
    private const string QuestionsRootFolderPath = @"D:/Coding/SuperProfRE/QuestionsDB";
    
    public static void LoadAllQuestionsToDBAndPrecomputeTopics()
    {
        var questionsToAdd = new List<Question>();

        var client = new MongoClient("mongodb://localhost:27017/local");
        var collection = client.GetDatabase("local").GetCollection<Question>("questions");
        
        // ReSharper disable once StringLiteralTypo
        var rootTopic = new QuestionTopic(QuestionTopic.RootQuestionsTopic);
        
        foreach (var topicDirName in Directory.GetDirectories(QuestionsRootFolderPath))
        {
            foreach (var questionIdDirName in Directory.GetDirectories(topicDirName))
            {
                var q = LoadQuestionFromFolder(questionIdDirName);
                if (!collection.Find(question => question.QuestionId == q.QuestionId).Any())
                {
                    questionsToAdd.Add(q);
                    Console.WriteLine($"Question [{q.QuestionId}] ({q.Source}) loaded and added to list");
                }
                else
                    Console.WriteLine($"Question [{q.QuestionId}] ({q.Source}) already added");
                
                // ReSharper disable once StringLiteralTypo
                var qTopic = QuestionTopic.FromStringMatrix(q.Topics);
                rootTopic.MergeTopic(qTopic);
            }
        }

        if (questionsToAdd.Count > 0)
            collection.InsertMany(questionsToAdd);

        WriteTopicsToFile(rootTopic);
    }

    private static async void WriteTopicsToFile(QuestionTopic topic)
    {
        await using var createStream = File.Create(QuestionTopic.TopicsFileName);
        
        var options = new JsonSerializerOptions { WriteIndented = true };
        await JsonSerializer.SerializeAsync(createStream, topic, options);
        await createStream.DisposeAsync();
    }

    private static Question LoadQuestionFromFolder(string folder)
    {
        var files = Directory.GetFiles(folder);

        var jsonMetadataFilePath = files.ToList().Find(f => Path.GetExtension(f) == ".json");

        var jsonMetadata = File.ReadAllText(jsonMetadataFilePath);
        
        var bsonDocument = BsonDocument.Parse(jsonMetadata);
        var question = BsonSerializer.Deserialize<Question>(bsonDocument);

        //Console.WriteLine($"Question [{question.QuestionId}] ({question.Source}) loaded");
        return question;
        
    }
}