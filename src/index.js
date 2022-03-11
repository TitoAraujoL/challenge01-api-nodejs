const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const res = require("express/lib/response");

const app = express();

app.use(cors());
app.use(express.json());

const users = [
  // {
  //   "id": "b8817aac-fd6f-40d9-acaa-5f0fc146cd4c",
  //   "name": "Vitor Araujo",
  //   "username": "tito",
  //   "todos": []
  // }
];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userData = users.find((user) => user.username === username);

  if (!userData) {
    return response.status(404).json({
      error: "Sorry, User not found!",
    });
  }

  request.user = userData;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({
      error: "User already exists",
    });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newToDo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newToDo);

  return response.status(201).json(newToDo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  const taskById = user.todos.find((task) => String(task.id) === String(id));

  if (!taskById) {
    return response.status(404).json({
      error: "Task not found!",
    });
  }

  taskById.title = title;
  taskById.deadline = new Date(deadline);

  return response.status(201).json(taskById);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {user} = request
  const {done} = request.body


  const taskById = user.todos.find((task) => String(task.id) === String(id));

  if (!taskById) {
    return response.status(404).json({
      error: "Task not found!",
    });
  }

  taskById.done = done

  return response.status(201).json(taskById)

});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params

  const indexTask = user.todos.findIndex(task => task.id === id)

  if(indexTask <= -1 ){
    return response.status(404).json({
      error:"Task not found"
    })
  }
  user.todos.splice(indexTask,1)

  return response.status(204)
});

module.exports = app;
