using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace QuestionsHandler.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuestionsController : ControllerBase
{
    private readonly ILogger<QuestionsController> _logger;

    public QuestionsController(ILogger<QuestionsController> logger)
    {
        _logger = logger;
    }
    
    [HttpGet]
    public IEnumerable<Question> Index()
    {
        var client = new MongoClient("mongodb://localhost:27017/local");
        var collection = client.GetDatabase("local").GetCollection<Question>("questions");

        return collection.Find(q => true).ToList();

    }
    
    [HttpGet("{qId:int}")]
    public Question GetQuestionOfId(int qId)
    {
        var client = new MongoClient("mongodb://localhost:27017/local");
        var collection = client.GetDatabase("local").GetCollection<Question>("questions");

        return collection.Find(q => q.QuestionId == qId).First();
    }
}