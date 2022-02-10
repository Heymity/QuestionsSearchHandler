using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace QuestionsHandler.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FiltersController : ControllerBase
{
    private readonly ILogger<QuestionsController> _logger;
    private readonly QuestionTopic _rootTopic;
    private readonly FiltersData _filtersData;

    public FiltersController(ILogger<QuestionsController> logger)
    {
        _logger = logger;

        var topics = GetFromJsonFile<QuestionTopic>(QuestionTopic.TopicsFileName);
        
        if (topics == null) _logger.LogCritical("No question topics precomputed file was found, initializing without it");
        _rootTopic = topics ?? new QuestionTopic(QuestionTopic.RootQuestionsTopic);
        
        var filters = GetFromJsonFile<FiltersData>(FiltersData.FiltersFileName);
        
        if (filters == null) _logger.LogCritical("No filters precomputed file was found, initializing without it");
        _filtersData = filters ?? new FiltersData();
    }

    private static T? GetFromJsonFile<T>(string fileName)
    {
        using var stream = new FileStream(fileName, FileMode.Open);
        using var reader = new StreamReader(stream);
        var jsonFromFile = reader.ReadToEnd();
        return JsonSerializer.Deserialize<T>(jsonFromFile);
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