#undef SEEDING

using MongoDB.Driver;

#if SEEDING

using QuestionsHandler;
DatabaseSeeder.LoadAllQuestionsAndPrecomputeTopics();

#else

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddSingleton<IMongoClient, MongoClient>(s =>
{
    var uri = s.GetRequiredService<IConfiguration>()["MongoUri"];
    return new MongoClient(uri);
});
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