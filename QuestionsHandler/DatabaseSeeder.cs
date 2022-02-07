using Microsoft.Extensions.Localization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;

namespace QuestionsHandler;

public static class DatabaseSeeder
{
    private const string QuestionsRootFolderPath = @"D:/Coding/SuperProfRE/QuestionsDB";
    
    public static void LoadAllQuestionsToDB()
    {
        var questionsToAdd = new List<Question>();

        var client = new MongoClient("mongodb://localhost:27017/local");
        var collection = client.GetDatabase("local").GetCollection<Question>("questions");
        
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
                
                Console.WriteLine($"Question [{q.QuestionId}] ({q.Source}) already added");
            }
        }

        collection.InsertMany(questionsToAdd);
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