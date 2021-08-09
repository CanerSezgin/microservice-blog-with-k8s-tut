const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const { randomBytes } = require("crypto");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  const { id: postId } = req.params;
  const comments = commentsByPostId[postId] || [];
  res.status(200).json(comments);
});

app.post("/posts/:id/comments", async (req, res) => {
  const { id: postId } = req.params;
  const { content } = req.body;
  const commentId = randomBytes(4).toString("hex");
  const comments = commentsByPostId[postId] || [];

  const newComment = { id: commentId, content, status: "pending" }
  comments.push(newComment);
  commentsByPostId[postId] = comments;
  console.log("comment created", newComment)

  await axios.post("http://event-bus-srv:4005/events", {
    type: "CommentCreated",
    data: {
      postId,
      ...newComment
    }
  })

  res.status(201).json(comments);
});

app.post("/events", async (req, res) => {
  const event = req.body;
  const { type, data } = event;
  console.log("Received Event", event.type)
  
  if(type === 'CommentModerated') {
    const { postId, id, content, status } = data;
    const comments = commentsByPostId[postId]
    const comment = comments.find(c => c.id === id)
    comment.status = status
    await axios.post("http://event-bus-srv:4005/events", {
      type: "CommentUpdated",
      data: {
        postId,
        ...comment
      }
    })
  }

  res.status(204)
})

app.listen(4001, () => {
  console.log("COMMENTS | listening on 4001");
});
