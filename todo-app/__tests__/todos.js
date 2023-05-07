const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Sign up", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/users").send({
      firstName: "Test",
      lastName: "User A",
      email: "user.a@gmail.com",
      password: "12345678",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  test("Sign out", async () => {
    let res = await agent.get("/todos");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/todos");
    expect(res.statusCode).toBe(302);
  });

  test("Creates a todo ", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@gmail.com", "12345678");
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: true,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("set completion status of todo as true or false ", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@gmail.com", "12345678");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy Choclate",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    let groupedTodosResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    let parsedTodoResponse = JSON.parse(groupedTodosResponse.text);
    let dueTodayCount = parsedTodoResponse.dueTodayTodos.length;
    let latestTodo = parsedTodoResponse.dueTodayTodos[dueTodayCount - 1];
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);
    let completionStatusResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
        completed: latestTodo.completed,
      });
    let parsedUpdatedResponse = JSON.parse(completionStatusResponse.text);
    expect(parsedUpdatedResponse.completed).toBe(true);

    groupedTodosResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    parsedTodoResponse = JSON.parse(groupedTodosResponse.text);
    let completedTodosCount = parsedTodoResponse.completedTodos.length;
    latestTodo = parsedTodoResponse.completedTodos[completedTodosCount - 1];
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);
    completionStatusResponse = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
      completed: latestTodo.completed,
    });

    parsedUpdatedResponse = JSON.parse(completionStatusResponse.text);
    expect(parsedUpdatedResponse.completed).toBe(false);
  });

  test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@gmail.com", "12345678");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy ps5",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodosResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");

    const parsedTodoResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedTodoResponse.dueTodayTodos.length;
    const latestTodo = parsedTodoResponse.dueTodayTodos[dueTodayCount - 1];
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);
    const deleteStatusResponse = await agent
      .delete(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
      });

    const parsedDeletedResponse = JSON.parse(deleteStatusResponse.text);
    expect(parsedDeletedResponse.success).toBe(true);
  });
});
