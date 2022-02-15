#undef SEEDING

using System.Text.Json;
using MongoDB.Driver;
using QuestionsHandler;

#if SEEDING

DatabaseSeeder.LoadAllQuestionsAndPrecomputeTopics();

#else

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddSingleton<IMongoClient, MongoClient>(s =>
{
    var uri = s.GetRequiredService<IConfiguration>()["MongoUri"];
    return new MongoClient(uri);
});

builder.Services.AddSingleton<QuestionTopic>(_ =>
    GetFromJsonFile<QuestionTopic>(QuestionTopic.TopicsFileName) ??
    new QuestionTopic(QuestionTopic.RootQuestionsTopic));

builder.Services.AddSingleton<FiltersData>(_ =>
    GetFromJsonFile<FiltersData>(FiltersData.FiltersFileName) ??
    new FiltersData());


static T? GetFromJsonFile<T>(string fileName)
{
    using var stream = new FileStream(fileName, FileMode.Open);
    using var reader = new StreamReader(stream);
    var jsonFromFile = reader.ReadToEnd();
    var data = JsonSerializer.Deserialize<T>(jsonFromFile);
    if (data == null) Console.Error.WriteLine($"No correctly arranged json file found at {fileName} to load");
    return data;
}

builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();


app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html");

app.Run();

#endif