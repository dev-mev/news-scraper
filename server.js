const express = require("express");
const logger = require("morgan");
const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");

const db = require("./models");

const PORT = 3000;

const app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/newsScraper", { useNewUrlParser: true });

// A GET route for scraping the site
app.get("/scrape", function (req, res) {
  db.News.remove({}).catch(function (err) {
    res.json(err);
  });

  axios.get("https://wwd.com").then(function (response) {
    const $ = cheerio.load(response.data);

    $(".hp-card__story-card-post").each(function (i, element) {
      const result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.headline = $(this).children(".hp-card__story-card-article").children(".hp-card__story-card-header").text();
      result.url = $(this).children(".hp-card__story-card-article").children(".hp-card__story-card-header").children("a").attr("href");
      result.blurb = $(this).children(".hp-card__story-card-article").children(".hp-card__story-card-intro").text();
      result.image = $(this).children(".hp-card__story-card-photo").children("img").attr("data-lazy-src");
      console.log(JSON.stringify(result));

      if (result.headline && result.url && result.image) {
        db.News.create(result)
          .then(function (dbNews) {
            console.log(dbNews);
          })
          .catch(function (err) {
            console.log(err);
          });
      }
    });
    // Send a message to the client
    res.send("Scrape Complete");
  });
  res.redirect("/");
});

// Route for getting all news from the db
app.get("/news", function (req, res) {
  db.News.find({})
    .then(function (dbNews) {
      res.json(dbNews);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's comment
app.get("/news/:id", function (req, res) {
  db.News.findOne({ _id: req.params.id })
    .populate("comment")
    .then(function (dbNews) {
      res.json(dbNews);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated comment
app.post("/news/:id", function (req, res) {
  console.log(req.body);
  db.Comment.create(req.body)
    .then(function (dbComment) {
      return db.News.findOneAndUpdate({ _id: req.params.id }, { comment: dbComment._id }, { new: true });
    })
    .then(function (dbNews) {
      res.json(dbNews);
    })
    .catch(function (err) {
      res.json(err);
    });
});


// Listen on port 3000
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
