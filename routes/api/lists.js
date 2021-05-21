const express = require("express");
const app = express();
const keys = require("../../config/keys");

const bodyParser = require("body-parser");

// Load in the mongoose models
const { List } = require("../../models/ListSchema");

const jwt = require("jsonwebtoken");

/* MIDDLEWARE  */

// Load middleware
app.use(bodyParser.json());
app.get("/lists", (req, res) => {
  // We want to return an array of all the lists that belong to the authenticated user
  List.find()
    .then((lists) => {
      res.send(lists);
    })
    .catch((e) => {
      res.send(e);
    });
});

/**
 * POST /lists
 * Purpose: Create a list
 */
app.post("/addlists", (req, res) => {
  // We want to create a new list and return the new list document back to the user (which includes the id)
  // The list information (fields) will be passed in via the JSON request body
  let title = req.body.title;
  let isbn = req.body.isbn;
  let author = req.body.author;
  let description = req.body.description;
  let newList = new List({
    title,
    isbn,
    author,
    description,
  });
  newList.save().then((listDoc) => {
    // the full list document is returned (incl. id)
    res.send(listDoc);
  });
});

app.get("/:id", (req, res) => {
  List.findById(req.params.id)
    .then((list) => res.json(list))
    .catch((err) => res.status(404).json({ nobookfound: "No Book found" }));
});

/**
 * PATCH /lists/:id
 * Purpose: Update a specified list
 */
app.patch("/:id", (req, res) => {
  // We want to update the specified list (list document with id in the URL) with the new values specified in the JSON body of the request
  List.findOneAndUpdate(
    { _id: req.params.id, _userId: req.user_id },
    {
      $set: req.body,
    }
  ).then(() => {
    res.send({ message: "updated successfully" });
  });
});

/**
 * DELETE /lists/:id
 * Purpose: Delete a list
 */
app.delete("/:id", (req, res) => {
  // We want to delete the specified list (document with id in the URL)
  List.findOneAndRemove({
    _id: req.params.id,
    _userId: req.user_id,
  }).then((removedListDoc) => {
    res.send(removedListDoc);

    // delete all the tasks that are in the deleted list
    deleteTasksFromList(removedListDoc._id);
  });
});
module.exports = app;
