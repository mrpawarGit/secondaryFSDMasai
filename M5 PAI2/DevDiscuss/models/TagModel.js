const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const TagModel = mongoose.model("Post", postSchema);

module.exports = TagModel;
