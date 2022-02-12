namespace QuestionsHandler;

public class FiltersData
{
    public const string FiltersFileName = "QuestionFilters.precomp.json";
    
    public List<int> Years { get; set; }
    public List<string> Sources { get; set; }
    public List<string> Difficulties { get; set; }
    public List<string> QuestionTypes { get; set; }
    public  List<int> Ratings  { get; set; }
    
    public FiltersData()
    {
        Years = new List<int>();
        Sources = new List<string>();
        Difficulties = new List<string>();
        QuestionTypes = new List<string>();
        Ratings = new List<int> {1, 2, 3, 4, 5};
    }

    public void Sort()
    {
        Years.Sort();
        Sources.Sort();
        Difficulties.Sort();
        QuestionTypes.Sort();
    }
    
    public void LoadQuestion(Question question)
    {
        if (!Years.Contains(question.Year)) Years.Add(question.Year);
        if (!Sources.Contains(question.Source)) Sources.Add(question.Source);
        if (!Difficulties.Contains(question.Difficulty)) Difficulties.Add(question.Difficulty);
        if (!QuestionTypes.Contains(question.QuestionType)) QuestionTypes.Add(question.QuestionType);
    }
}