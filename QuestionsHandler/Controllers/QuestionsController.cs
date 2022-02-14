using Microsoft.AspNetCore.Mvc;
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
    
    [HttpGet("{qId:int}")]
    public Question GetQuestionOfId(int qId)
    {
        return _questionsCollection.Find(q => q.QuestionId == qId).First();
    }

    [HttpPost("filteredQuestions")]
    public IEnumerable<Question> GetQuestionAccordingToFilter([FromBody] QuestionsFilterRequestData filter)
    {
        _logger.LogInformation($"Year first filter: {filter.AdvancedFilters.Ratings.Count}\nIs root topic selected {filter.TopicFilters.IsSelected}");

        var quest = _questionsCollection
            .AsQueryable()
            .Select(RemoveImageData)
            .Where(q => filter.AdvancedFilters.Years.Count <= 0 || filter.AdvancedFilters.Years.Contains(q.Year))
            .Where(q => filter.AdvancedFilters.Ratings.Count <= 0 || filter.AdvancedFilters.Ratings.Contains(q.Rating))
            .Where(q => filter.AdvancedFilters.Sources.Count <= 0 || filter.AdvancedFilters.Sources.Contains(q.Source))
            .Where(q => filter.AdvancedFilters.Difficulties.Count <= 0 ||
                        filter.AdvancedFilters.Difficulties.Contains(q.Difficulty))
            .Where(q => filter.AdvancedFilters.QuestionTypes.Count <= 0 ||
                        filter.AdvancedFilters.QuestionTypes.Contains(q.QuestionType))
            .Where(q => filter.TopicFilters.Contains(q.Topics));
        
        return quest.ToList();
    }
    
    private static Question RemoveImageData(Question question)
    {
        question.AnswerData = "";
        question.QuestionData = "";
        return question;
    }
}