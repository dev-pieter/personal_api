const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const cors = require("cors");
const { connect_db, get_db } = require("./lib/utils/db_utils");
const { author, register, login } = require("./lib/controllers/users");
const {
  get_post,
  get_post_by_id,
  add_view,
  add_post,
  update_post,
  delete_post,
} = require("./lib/controllers/posts");

app.use(cors());
app.use(bodyParser.json());

// Make db conncection
connect_db();

//Returns my details for blog use
app.post("/author", author(get_db));

//Register user (will mainly be for blog comments)
app.post("/register", register(get_db));

//Login and generate token
app.post("/login", login(get_db));

//Get posts from daily category
app.get("/get_daily", get_post(get_db, "daily"));

//Get posts from tutorial category
app.get("/get_tutorial", get_post(get_db, "tutorial"));

//Get single post
app.get("/post/:id", get_post_by_id(get_db));

app.post("/add_view", add_view(get_db));

app.post("/add_post", add_post(get_db));

app.post("/update_post", update_post(get_db));

app.post("/delete_post", delete_post(get_db));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
