const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const moderateComment = (comment) => {
  const BANNED_WORD = "orange";
  comment.status = comment.content.includes(BANNED_WORD)
    ? "rejected"
    : "approved";
  return comment;
};

app.post("/events", async (req, res) => {
  const event = req.body;
  const { type, data } = event;

  if (type === "CommentCreated") {
    setTimeout(async () => {
      const comment = data;
      const moderatedComment = moderateComment(comment);
      await axios.post("http://event-bus-srv:4005/events", {
        type: "CommentModerated",
        data: {
          ...moderatedComment,
        },
      });
    }, 5000);
  }

  console.log("Received Event", event.type);
  res.status(204);
});

app.listen(4003, () => {
  console.log("MODERATION | listening on 4003");
});
