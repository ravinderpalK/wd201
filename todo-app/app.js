const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get("/todos", (request, response) => {
  response.send("hello world");
  console.log("Todo List");
});

app.post("/todos", async (request, response) => {
  console.log("Creating a todo", request.body);
  try {
    const todo = await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      completed: request.body.dueDate,
    });
    return response.json(todo);
  } catch (error) {
    console.error(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async (request, response) => {
  console.log("We have to update a todo with ID: ", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.error(error);
    return response.status(422).json(error);
  }
});

// eslint-disable-next-line no-unused-vars
app.delete("/todos/:id", (request, response) => {
  console.log("Delete a todo by ID: ", request.params.id);
});

module.exports = app;
