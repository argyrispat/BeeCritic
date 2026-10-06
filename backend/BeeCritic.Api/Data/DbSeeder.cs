using BeeCritic.Api.Data;
using BeeCritic.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BeeCritic.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.MigrateAsync();

        if (await db.Users.AnyAsync())
            return;

        var now = DateTime.UtcNow;

        var demo = CreateUser("demo", "demo@beecritic.com", "Demo1234!", now.AddMonths(-8));
        var maya = CreateUser("maya_films", "maya@beecritic.com", "Demo1234!", now.AddMonths(-6));
        var leo = CreateUser("leo_reels", "leo@beecritic.com", "Demo1234!", now.AddMonths(-5));
        var nora = CreateUser("nora_cinema", "nora@beecritic.com", "Demo1234!", now.AddMonths(-4));
        var kai = CreateUser("kai_watches", "kai@beecritic.com", "Demo1234!", now.AddMonths(-3));

        db.Users.AddRange(demo, maya, leo, nora, kai);
        await db.SaveChangesAsync();

        // Well-known TMDB movie IDs
        var inception = 27205;
        var parasite = 496243;
        var interstellar = 157336;
        var whiplash = 244786;
        var arrival = 329865;
        var getOut = 419430;
        var hereditary = 493922;
        var dune = 438631;
        var everything = 545611;
        var portrait = 505832;

        var reviews = new List<Review>
        {
            CreateReview(demo.Id, inception, 9,
                "A precision-engineered puzzle that somehow still feels emotional. The hallway fight alone is worth the rewatch.",
                now.AddDays(-40), now.AddDays(-40)),
            CreateReview(maya.Id, inception, 8,
                "Ambitious and stylish. The final image still sits with me years later.",
                now.AddDays(-35), now.AddDays(-35)),
            CreateReview(leo.Id, parasite, 10,
                "Not a wasted frame. Shifts tone so smoothly you barely notice until you're already unsettled.",
                now.AddDays(-30), now.AddDays(-28)),
            CreateReview(nora.Id, parasite, 9,
                "Class commentary that never lectures. The basement reveal is unforgettable.",
                now.AddDays(-25), now.AddDays(-25)),
            CreateReview(kai.Id, interstellar, 9,
                "Spectacle with a beating heart. The docking sequence still raises my pulse.",
                now.AddDays(-22), now.AddDays(-22)),
            CreateReview(demo.Id, interstellar, 8,
                "Occasionally over-explains, but the emotional core lands hard. That score does half the work.",
                now.AddDays(-20), now.AddDays(-18)),
            CreateReview(maya.Id, whiplash, 10,
                "Relentless. One of the best performances I've seen about obsession and mentorship gone wrong.",
                now.AddDays(-18), now.AddDays(-18)),
            CreateReview(leo.Id, arrival, 9,
                "Quiet, patient science fiction that trusts the audience. The structure rewards a second viewing.",
                now.AddDays(-15), now.AddDays(-15)),
            CreateReview(nora.Id, getOut, 9,
                "Horror that stays sharp because it's also funny and precise. The sunken place still haunts.",
                now.AddDays(-12), now.AddDays(-12)),
            CreateReview(kai.Id, hereditary, 8,
                "Atmosphere first, jump scares second. That dinner scene is pure dread.",
                now.AddDays(-10), now.AddDays(-10)),
            CreateReview(demo.Id, dune, 8,
                "Immersive world-building without rushing. Villeneuve lets the sand and silence speak.",
                now.AddDays(-8), now.AddDays(-8)),
            CreateReview(maya.Id, everything, 9,
                "Joyful chaos with a surprisingly tender thesis. The hot dog fingers scene lives rent-free.",
                now.AddDays(-6), now.AddDays(-6)),
            CreateReview(leo.Id, portrait, 10,
                "Every frame could hang in a gallery. A love story told through light, fabric, and glances.",
                now.AddDays(-4), now.AddDays(-4)),
            CreateReview(nora.Id, inception, 7,
                "Technically dazzling, emotionally a bit distant for me. Still an impressive construction.",
                now.AddDays(-3), now.AddDays(-3)),
            CreateReview(kai.Id, parasite, 9,
                "Rewatched it recently and noticed even more visual rhymes. Peak craft.",
                now.AddDays(-2), now.AddDays(-2)),
            CreateReview(demo.Id, whiplash, 9,
                "Left the theater exhausted in the best way. Jazz as bloodsport.",
                now.AddDays(-1), now.AddDays(-1)),
        };

        db.Reviews.AddRange(reviews);
        await db.SaveChangesAsync();

        var comments = new List<Comment>
        {
            CreateComment(reviews[0].Id, maya.Id, "The practical effects still look better than most CGI today.", now.AddDays(-39)),
            CreateComment(reviews[0].Id, leo.Id, "Agree — and Hans Zimmer's score is doing serious lifting.", now.AddDays(-38)),
            CreateComment(reviews[2].Id, demo.Id, "The peach scene is somehow funnier and darker every rewatch.", now.AddDays(-29)),
            CreateComment(reviews[2].Id, nora.Id, "Bong Joon-ho makes genre feel effortless.", now.AddDays(-28)),
            CreateComment(reviews[4].Id, maya.Id, "That docking scene paired with the score is cinema.", now.AddDays(-21)),
            CreateComment(reviews[6].Id, demo.Id, "J.K. Simmons is terrifying and magnetic at once.", now.AddDays(-17)),
            CreateComment(reviews[6].Id, kai.Id, "I still flinch at the chair throw.", now.AddDays(-16)),
            CreateComment(reviews[7].Id, nora.Id, "One of the rare sci-fi films that feels genuinely literary.", now.AddDays(-14)),
            CreateComment(reviews[11].Id, leo.Id, "The bagel everything still makes me laugh.", now.AddDays(-5)),
            CreateComment(reviews[12].Id, maya.Id, "That beach scene is permanently etched in my mind.", now.AddDays(-3)),
            CreateComment(reviews[15].Id, maya.Id, "The final drum battle is perfect editing.", now.AddHours(-10)),
        };

        db.Comments.AddRange(comments);
        await db.SaveChangesAsync();
    }

    private static User CreateUser(string username, string email, string password, DateTime createdAt) => new()
    {
        Id = Guid.NewGuid(),
        Username = username,
        Email = email,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
        CreatedAt = createdAt
    };

    private static Review CreateReview(Guid userId, int movieId, int rating, string content, DateTime created, DateTime updated) => new()
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        TmdbMovieId = movieId,
        Rating = rating,
        Content = content,
        CreatedAt = created,
        UpdatedAt = updated
    };

    private static Comment CreateComment(Guid reviewId, Guid userId, string content, DateTime created) => new()
    {
        Id = Guid.NewGuid(),
        ReviewId = reviewId,
        UserId = userId,
        Content = content,
        CreatedAt = created,
        UpdatedAt = created
    };
}
