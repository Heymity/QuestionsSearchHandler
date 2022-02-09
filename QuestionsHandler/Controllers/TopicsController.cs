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
        var topics = JsonSerializer.Deserialize<QuestionTopic>(QuestionTopic.TopicsFileName);
        if (topics == null) logger.LogCritical("No question topics precomputed file was found, initializing without it");

        _rootTopic = topics ?? new QuestionTopic(QuestionTopic.RootQuestionsTopic);
    }

    [HttpGet]
    public QuestionTopic GetQuestionTopics()
    {
        return _rootTopic;
    }
}