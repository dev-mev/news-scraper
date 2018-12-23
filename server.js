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

mongoose.connect("mongodb://localhost/newsScraper", { useNewUrlParser: true });

// A GET route for scraping the site
app.get("/", function (req, res, next) {
  axios.get("https://wwd.com").then(function (response) {
    const $ = cheerio.load(response.data);

    $(".hp-card__story-card-post").each(function () {
      const result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.headline = $(this).children(".hp-card__story-card-article").children(".hp-card__story-card-header").text();
      result.url = $(this).children(".hp-card__story-card-article").children(".hp-card__story-card-header").children("a").attr("href");
      result.blurb = $(this).children(".hp-card__story-card-article").children(".hp-card__story-card-intro").text();
      result.image = $(this).children(".hp-card__story-card-photo").children("img").attr("data-lazy-src");

      if (result.headline && result.url && result.image) {
        db.News.create(result)
          .catch(function (err) {
            console.log(err);
          });
      }
    });
    next();
  });
});

// Make public a static folder
app.use("/", express.static("public"));

// Route for getting all news from the db
app.get("/news", function (req, res) {
  db.News.find({}).sort({ created_at: -1 })
    .then(function (dbNews) {
      res.json(dbNews);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with its comment
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
app.post("/comment/:newsId", function (req, res) {
  console.log(req.body);
  db.Comment.create(req.body)
    .then(function (dbComment) {
      return db.News.findOneAndUpdate({ _id: req.params.newsId }, { comment: dbComment._id }, { new: true });
    })
    .then(function (dbNews) {
      res.json(dbNews);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for deleting an Article's associated comment
app.delete("/comment/:id", function (req, res) {
  db.Comment.findByIdAndDelete(req.params.id)
    .then(function () {
      res.status(200).end();
    })
    .catch(function (err) {
      res.status(500).json(err);
    });
});

// Listen on port 3000
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
