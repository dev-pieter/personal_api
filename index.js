const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const { ObjectId } = require("mongodb");
const cors = require("cors");
const { connect_db, get_db } = require("./lib/utils/db_utils");
const {
  authenticateToken,
  hashpassword,
  validatepassword,
} = require("./lib/utils/auth_utils");
const { author, register, login } = require("./lib/controllers/users");

app.use(cors());
app.use(bodyParser.json());

// Make db conncection
connect_db();

//Returns my details for blog use
app.post("/author", author(authenticateToken, get_db));

//Register user (will mainly be for blog comments)
app.post("/register", register(hashpassword, get_db));

//Login and generate token
app.post("/login", login(validatepassword, get_db));

//Get posts from daily category
app.get("/get_daily", async function (req, res) {
  const db = get_db();
  const posts = await db
    .collection("blog_posts")
    .find({ category: "daily" })
    .toArray();

  if (posts) {
    return res.json(posts);
  }

  res.status(201);
  return res.json({
    error: "No posts.",
  });
});

//Get posts from tutorial category
app.get("/get_tutorial", async function (req, res) {
  const posts = await db
    .collection("blog_posts")
    .find({ category: "tutorial" })
    .toArray();

  if (posts) {
    return res.json(posts);
  }

  res.status(201);
  return res.json({
    error: "No posts.",
  });
});

//Get single post
app.get("/post/:id", async function (req, res) {
  const { id } = req.params;
  // console.log(id)
  const posts = await db
    .collection("blog_posts")
    .find({ _id: ObjectId(id) })
    .toArray();
  // console.log(posts)

  if (posts) {
    return res.json(posts);
  }

  res.status(201);
  return res.json({
    error: "No posts.",
  });
});

app.post("/add_view", async function (req, res) {
  const { id } = req.body;
  // console.log(id)
  const posts = await db
    .collection("blog_posts")
    .findOne({ _id: ObjectId(id) });
  // console.log(posts)
  // console.log(posts)

  if (posts) {
    const views = posts.views + 1 || 1;
    const update = await db
      .collection("blog_posts")
      .updateOne({ _id: ObjectId(id) }, { $set: { views: views } });
    res.status(200);
    return res.send("views updated");
  }

  res.status(201);
  return res.json({
    error: "No posts.",
  });
});

app.post("/add_post", async function (req, res) {
  // console.log(req.body)
  if (req.body) {
    const { post } = req.body;

    try {
      var add = await db.collection("blog_posts").insertOne({
        category: post.category,
        author: post.author,
        heading: post.heading,
        img_url: post.img_url,
        markdown: post.markdown,
      });

      res.json(add);
    } catch (error) {
      res.status(201);
      return res.json({
        error: `${error}`,
      });
    }
  }
});

app.post("/update_post", async function (req, res) {
  // console.log(req.body)
  if (req.body) {
    const post = req.body;

    id = post._id;
    delete post._id;

    try {
      await db
        .collection("blog_posts")
        .updateOne({ _id: ObjectId(id) }, { $set: post });

      return res.send("Updated successfully");
    } catch (error) {
      res.status(201);
      return res.json({
        error: `${error}`,
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
