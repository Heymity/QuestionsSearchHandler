using System.Text.Json;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;

namespace QuestionsHandler;

public static class DatabaseSeeder
{
    private const string QuestionsRootFolderPath = @"D:/Coding/SuperProfRE/QuestionsDB";
    
    public static void LoadAllQuestionsAndPrecomputeTopics()
    {
        var questionsToAdd = new List<Question>();

        var client = new MongoClient("mongodb://localhost:27017/local");
        var collection = client.GetDatabase("local").GetCollection<Question>("questions");
        
        var rootTopic = new QuestionTopic(QuestionTopic.RootQuestionsTopic);
        var questionFilters = new FiltersData();
   
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

                AddQuestionFiltersToFiltersList(questionFilters, q);
                
                var qTopics = QuestionTopic.TopicsListFromStringMatrix(q.Topics);
                qTopics.ForEach(t => rootTopic.MergeTopic(t));
            }
        }
        
        Console.WriteLine("Adding Questions to DB");
        
        if (questionsToAdd.Count > 0)
            collection.InsertMany(questionsToAdd);
        
        Console.WriteLine("Questions Added");
        
        Console.WriteLine("Saving Topics");
        
        rootTopic.SortTopicsRecursively();
        WriteTopicsToFile(rootTopic);

        Console.WriteLine("Saving Filters Data");
        
        questionFilters.Sort();
        WriteFiltersToFile(questionFilters);
    }

    private static void WriteTopicsToFile(QuestionTopic topic)
    {
        WriteToJsonFile(topic, QuestionTopic.TopicsFileName);
    }
    
    private static void WriteFiltersToFile(FiltersData filtersData)
    {
        WriteToJsonFile(filtersData, FiltersData.FiltersFileName);
    }

    public static async void WriteToJsonFile<T>(T data, string path)
    {
        await using var createStream = File.Create(path);
        
        var options = new JsonSerializerOptions { WriteIndented = true };
        await JsonSerializer.SerializeAsync(createStream, data, options);
        await createStream.DisposeAsync();
    }

    private static void AddQuestionFiltersToFiltersList(FiltersData filtersData, Question question)
    {
        filtersData.LoadQuestion(question);
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