using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace QuestionsHandler;

[BsonIgnoreExtraElements]
public class Question
{
    [BsonId]
    public ObjectId ObjectId { get; set; }
    
    [BsonElement("ID")]
    public int QuestionId { get; set; }

    [BsonElement("Source")]
    public string Source { get; set; }

    [BsonElement("Year")]
    public int Year { get; set; }
    
    [BsonElement("Difficulty")]
    public string Difficulty { get; set; }
    
    [BsonElement("Type")]
    public string QuestionType { get; set; }
    
    [BsonElement("MainTopic")]
    public string MainTopic { get; set; }
    
    [BsonElement("Topics")]
    public string[][] Topics { get; set; }
    
    [BsonElement("Rating")]
    public int Rating { get; set; }
    
    [BsonElement("QuestionData")]
    public string QuestionData { get; set; }
    
    [BsonElement("AnswerData")]
    public string AnswerData { get; set; }
}