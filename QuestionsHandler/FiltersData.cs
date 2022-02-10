namespace QuestionsHandler;

public class FiltersData
{
    public const string TopicsFileName = "QuestionFilters.precomp.json";
    
    public int[] Years { get; set; }
    public string[] Sources { get; set; }
    public string[] Difficulties { get; set; }
    public string[] QuestionTypes { get; set; }
    public int[] Ratings { get; } = {1, 2, 3, 4, 5};
}