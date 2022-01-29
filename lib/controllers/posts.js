const { ObjectId } = require("mongodb");
const { authenticateToken } = require("../utils/auth_utils");

const get_post = (get_db, category) => {
  return async function (req, res) {
    const db = get_db();
    const posts = await db
      .collection("blog_posts")
      .find({ category: category })
      .toArray();

    if (posts) {
      return res.json(posts);
    }

    res.status(201);
    return res.json({
      error: "No posts.",
    });
  };
};

const get_post_by_id = (get_db) => {
  return async function (req, res) {
    const { id } = req.params;
    const db = get_db();
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
  };
};

const add_view = (get_db) => {
  return async function (req, res) {
    const { id } = req.body;
    const db = get_db();

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
  };
};

const add_post = (get_db) => {
  return async function (req, res) {
    // console.log(req.body)
    if (req.body && authenticateToken(req.body.token)) {
      const db = get_db();
      const { post } = req.body;

      try {
        var add = await db.collection("blog_posts").insertOne({
          category: post.category,
          author: post.author,
          heading: post.heading,
          img_url: post.img_url,
          markdown: post.markdown,
          created_at: new Date(),
          updated_at: new Date(),
        });

        res.json(add);
      } catch (error) {
        res.status(201);
        return res.json({
          error: `${error}`,
        });
      }
    } else {
      return res.json({
        error: "unauthenticated",
      });
    }
  };
};

const update_post = (get_db) => {
  return async function (req, res) {
    // console.log(req.body)
    if (req.body && authenticateToken(req.body.token)) {
      const post = req.body;
      const db = get_db();

      id = post._id;
      delete post._id;

      post.updated_at = new Date();

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
    } else {
      return res.json({
        error: "unauthenticated",
      });
    }
  };
};

const delete_post = (get_db) => {
  return async function (req, res) {
    // console.log(req.body)
    if (req.body && authenticateToken(req.body.token)) {
      const { id } = req.body;
      const db = get_db();

      try {
        await db.collection("blog_posts").deleteOne({ _id: ObjectId(id) });

        return res.send("Updated successfully");
      } catch (error) {
        res.status(201);
        return res.json({
          error: `${error}`,
        });
      }
    } else {
      return res.json({
        error: "unauthenticated",
      });
    }
  };
};

module.exports = {
  get_post,
  get_post_by_id,
  add_view,
  add_post,
  update_post,
  delete_post,
};
