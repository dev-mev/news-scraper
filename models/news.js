const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const NewsSchema = new Schema({
  headline: {
    type: String,
    trim: true,
    required: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String,
    required: true
  },
  blurb: {
    type: String
  },
  comment: {
    type: Schema.Types.ObjectId,
    ref: "Comment"
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now
  }
});

const News = mongoose.model("News", NewsSchema);

module.exports = News;
