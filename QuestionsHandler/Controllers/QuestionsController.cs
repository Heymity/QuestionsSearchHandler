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
    private readonly QuestionTopic _rootTopic;
    private readonly FiltersData _filtersData;

    public QuestionsController(ILogger<QuestionsController> logger, IMongoClient client, QuestionTopic topics, FiltersData filters)
    {
        _logger = logger;
        _questionsCollection = client.GetDatabase("local").GetCollection<Question>("questions");
        _rootTopic = topics;
        _filtersData = filters;
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
    [ProducesResponseType(200)]
    [ProducesResponseType(409)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> AddQuestionFromRaw()
    {
        // TODO: when this is done, the topics need to be updated and when the app quits saved to the precomputed file
        // TODO: when this is done, the filters need to be updated and when the app quits saved to the precomputed file (This is not very important as almost all filters are already loaded)
        string rawQuestionsJson;
        using (var reader = new StreamReader(Request.Body, Encoding.UTF8))
        {
            rawQuestionsJson = await reader.ReadToEndAsync();
        }
        
        if (string.IsNullOrEmpty(rawQuestionsJson)) return BadRequest(@"{""error"": ""No data was provided""}");
        
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

        var questionTopics = QuestionTopic.TopicsListFromStringMatrix(question.Topics);
        questionTopics.ForEach(t => _rootTopic.MergeTopic(t));
        
        _filtersData.LoadQuestion(question);
        

        return Ok();
    }

    [HttpPost("adm/saveTopicsAndFilters")]
    public IActionResult SaveQuestionTopicsAndFiltersToPrecomputedFiles()
    {
        try
        {
            _rootTopic.SortTopicsRecursively();
            DatabaseSeeder.WriteToJsonFile(_rootTopic, QuestionTopic.TopicsFileName);
            DatabaseSeeder.WriteToJsonFile(_filtersData, FiltersData.FiltersFileName);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "An error occurred saving the files");
            return Problem("An error occurred saving the files");
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