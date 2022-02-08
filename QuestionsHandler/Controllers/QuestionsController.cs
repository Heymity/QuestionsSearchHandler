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
    
    [HttpGet]
    public IEnumerable<Question> Index()
    {
        return _questionsCollection.Find(q => true).ToList();

    }
    
    [HttpGet("{qId:int}")]
    public Question GetQuestionOfId(int qId)
    {
        return _questionsCollection.Find(q => q.QuestionId == qId).First();
    }
}