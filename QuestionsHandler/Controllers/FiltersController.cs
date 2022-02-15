using Microsoft.AspNetCore.Mvc;

namespace QuestionsHandler.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FiltersController : ControllerBase
{
    private readonly ILogger<FiltersController> _logger;
    private readonly QuestionTopic _rootTopic;
    private readonly FiltersData _filtersData;

    public FiltersController(ILogger<FiltersController> logger, QuestionTopic topics, FiltersData filters)
    {
        _logger = logger;
        _rootTopic = topics;
        _filtersData = filters;
    }
    
    [HttpGet("topics")]
    public QuestionTopic GetQuestionTopics()
    {
        //_logger.LogInformation($"Returning Topic {_rootTopic.TopicName} with {_rootTopic.SubTopics.Count} subtopics");
        return _rootTopic;
    }
    
    [HttpGet("advFilters")]
    public FiltersData GetFilters()
    {
        //_logger.LogInformation($"Returning Topic {_rootTopic.TopicName} with {_rootTopic.SubTopics.Count} subtopics");
        return _filtersData;
    } 
}