const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}
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

  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    const res = await agent.get("/");
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
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy Choclate",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    let groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    let parsedTodoResponse = JSON.parse(groupedTodosResponse.text);
    let dueTodayCount = parsedTodoResponse.dueTodayTodos.length;
    let latestTodo = parsedTodoResponse.dueTodayTodos[dueTodayCount - 1];
    res = await agent.get("/");
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
      .get("/")
      .set("Accept", "application/json");
    parsedTodoResponse = JSON.parse(groupedTodosResponse.text);
    let completedTodosCount = parsedTodoResponse.completedTodos.length;
    latestTodo = parsedTodoResponse.completedTodos[completedTodosCount - 1];
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    completionStatusResponse = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
      completed: latestTodo.completed,
    });

    parsedUpdatedResponse = JSON.parse(completionStatusResponse.text);
    expect(parsedUpdatedResponse.completed).toBe(false);
  });

  test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy ps5",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");

    const parsedTodoResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedTodoResponse.dueTodayTodos.length;
    const latestTodo = parsedTodoResponse.dueTodayTodos[dueTodayCount - 1];
    res = await agent.get("/");
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
