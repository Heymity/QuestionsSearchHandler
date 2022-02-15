using System.Text;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;

namespace QuestionsHandler.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuestionsController : ControllerBase
{
    private readonly ILogger<QuestionsController> _logger;
    private readonly IMongoCollection<Question> _questionsCollection;

    public QuestionsController(ILogger<QuestionsController> logger, IMongoClient client)
    {
        _logger = logger;
        _questionsCollection = client.GetDatabase("local").GetCollection<Question>("questions");
    }
    
    [HttpGet("{from:int?}/{to:int?}")]
    public IEnumerable<Question> Index(int? from = 0, int? to = -1)
    {
        var queryFrom = from ?? 0;
        var queryTo = (to ?? 1000) < queryFrom ? new Index(0, true) : to ?? 1000;
        return _questionsCollection
            .AsQueryable()
            .Select(RemoveImageData)
            .OrderByDescending(q => q.Year)
            .Take(new Range(queryFrom, queryTo));
    }

    [HttpGet("count")]
    public long GetQuestionsCount()
    {
        return _questionsCollection.CountDocuments(_ => true);
    }
    
    [HttpPost("filteredQuestions")]
    public IEnumerable<Question> GetQuestionAccordingToFilter([FromBody] QuestionsFilterRequestData filter)
    {
        var quests = _questionsCollection
            .AsQueryable()
            .Select(RemoveImageData)
            .Where(q => filter.AdvancedFilters.Years.Count <= 0 || filter.AdvancedFilters.Years.Contains(q.Year))
            .Where(q => filter.AdvancedFilters.Ratings.Count <= 0 || filter.AdvancedFilters.Ratings.Contains(q.Rating))
            .Where(q => filter.AdvancedFilters.Sources.Count <= 0 || filter.AdvancedFilters.Sources.Contains(q.Source))
            .Where(q => filter.AdvancedFilters.Difficulties.Count <= 0 ||
                        filter.AdvancedFilters.Difficulties.Contains(q.Difficulty))
            .Where(q => filter.AdvancedFilters.QuestionTypes.Count <= 0 ||
                        filter.AdvancedFilters.QuestionTypes.Contains(q.QuestionType))
            .Where(q => filter.TopicFilters.Contains(q.Topics))
            .OrderByDescending(q => q.Year);
        
        return quests.ToList();
    }

    [HttpGet("{qId:int}")]
    public Question GetQuestionOfId(int qId)
    {
        return _questionsCollection.Find(q => q.QuestionId == qId).First();
    }
    
    [HttpPost("addQuestion")]
    public async Task<IActionResult> AddQuestionFromRaw()
    {
        // TODO: when this is done, the topics need to be updated and when the app quits saved to the precomputed file
        // TODO: when this is done, the filters need to be updated and when the app quits saved to the precomputed file (This is not very important as almost all filters are already loaded)
        string rawQuestionsJson;
        using (var reader = new StreamReader(Request.Body, Encoding.UTF8))
        {
            rawQuestionsJson = await reader.ReadToEndAsync();
        }
        
        var bsonDocument = BsonDocument.Parse(rawQuestionsJson);
        var question = BsonSerializer.Deserialize<Question>(bsonDocument);

        if (await (await _questionsCollection.FindAsync(q => q.QuestionId == question.QuestionId)).AnyAsync())
            return Conflict(@"{""error"": ""The provided question is already present in the database""}");
                
        try
        {
            await _questionsCollection.InsertOneAsync(question);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "An error occurred while trying to add the question");
            return BadRequest(e.Message);
        }

        return Ok();
    }
    
    private static Question RemoveImageData(Question question)
    {
        question.AnswerData = "";
        question.QuestionData = "";
        return question;
    }
}