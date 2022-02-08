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
        _logger.Log(LogLevel.Information, $"Querying Questions from {from} to {to}");
        
        var queryFrom = from ?? 0;
        var queryTo = (to ?? 1000) < queryFrom ? new Index(0, true) : to ?? 1000;
        return _questionsCollection
            .AsQueryable()
            .Select(RemoveImageData)
            .OrderByDescending(q => q.Year)
            .Take(new Range(queryFrom, queryTo));

        Question RemoveImageData(Question question)
        {
            question.AnswerData = "";
            question.QuestionData = "";
            return question;
        }
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
}