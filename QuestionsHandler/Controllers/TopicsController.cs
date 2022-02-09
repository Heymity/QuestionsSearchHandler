using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace QuestionsHandler.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TopicsController : ControllerBase
{
    private readonly ILogger<QuestionsController> _logger;
    private readonly QuestionTopic _rootTopic;

    public TopicsController(ILogger<QuestionsController> logger)
    {
        _logger = logger;
        
        using var stream = new FileStream(QuestionTopic.TopicsFileName, FileMode.Open);
        using var reader = new StreamReader(stream);
        var jsonFromFile = reader.ReadToEnd();
        var topics = JsonSerializer.Deserialize<QuestionTopic>(jsonFromFile);
        
        if (topics == null) _logger.LogCritical("No question topics precomputed file was found, initializing without it");

        _rootTopic = topics ?? new QuestionTopic(QuestionTopic.RootQuestionsTopic);
    }

    [HttpGet]
    public QuestionTopic GetQuestionTopics()
    {
        _logger.LogInformation($"Returning Topic {_rootTopic.TopicName} with {_rootTopic.SubTopics.Count} subtopics");
        return _rootTopic;
    }
}