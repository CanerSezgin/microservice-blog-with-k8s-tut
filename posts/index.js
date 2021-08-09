const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const { randomBytes } = require("crypto");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get("/posts", (req, res) => {
  res.status(200).json(posts);
});

app.post("/posts/create", async (req, res) => {
  const { title } = req.body;
  const id = randomBytes(4).toString("hex");
  posts[id] = {
    id,
    title,
  };

  await axios.post('http://event-bus-srv:4005/events', {
    type: "PostCreated",
    data: {
      id,
      title
    }
  })

  res.status(201).json(posts[id]);
});

app.post("/events", (req, res) => {
  const event = req.body;
  console.log("Received Event", event.type)
  res.status(204)
})

app.listen(4000, () => {
  console.log("v1001");
  console.log("POSTS | listening on 4000");
});
