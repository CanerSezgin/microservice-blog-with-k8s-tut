const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios")

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

const handleEvent = (type, data) => {
  if (type === "PostCreated") {
    const { id, title } = data;
    posts[id] = { id, title, comments: [] };
  }

  if (type === "CommentCreated") {
    const { id, content, postId, status } = data;
    const post = posts[postId];
    post.comments.push({ id, content, status });
  }

  if (type === "CommentUpdated") {
    const { id, content, postId, status } = data;
    const post = posts[postId];
    const comment = post.comments.find((c) => c.id === id);

    comment.status = status;
    comment.content = content;
  }
};

app.get("/posts", (req, res) => {
  console.log("GET Posts", Object.keys(posts).length);
  res.send(posts);
});

app.post("/events", (req, res) => {
  const event = req.body;
  const { type, data } = event;

  handleEvent(type, data);

  console.log("Received Event", event.type);
  res.status(204);
});

app.listen(4002, async () => {
  console.log("QUERY | listening on 4002");

  try {
    const res = await axios.get("http://event-bus-srv:4005/events")
    res.data.forEach(event => {
      console.log("Processing event:", event)
      handleEvent(event.type, event.data)
    });
  } catch (error) {
    console.log(error)
  }
});
