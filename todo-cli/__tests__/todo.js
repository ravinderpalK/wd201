/* eslint-disable no-undef */
const todoList = require("../todo");

const { all, markAsComplete, add, overdue, dueToday, dueLater } = todoList();

describe("Todo Test Suite", () => {
  beforeAll(() => {
    add({
      tittle: "Test Todo 1",
      completed: false,
      dueDate: new Date().toISOString().slice(0, 10),
    });
    add({
      tittle: "Test Todo 2",
      completed: false,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1))
        .toISOString()
        .slice(0, 10),
    });
    add({
      tittle: "Test Todo 3",
      completed: false,
      dueDate: new Date(new Date().setDate(new Date().getDate() - 1))
        .toISOString()
        .slice(0, 10),
    });
  });
  test("Should add new todo", () => {
    const todoItemCount = all.length;
    add({
      tittle: "Test Todo 4",
      completed: false,
      dueDate: new Date().toISOString().slice(0, 10),
    });
    expect(all.length).toBe(todoItemCount + 1);
  });

  test("should mark a todo as complete", () => {
    expect(all[0].completed).toBe(false);
    markAsComplete(0);
    expect(all[0].completed).toBe(true);
  });

  test("checks retrieval of overdue items.", () => {
    let item = overdue();
    const overdueItemLength = item.length;
    add({
      tittle: "todo item 5",
      completed: false,
      dueDate: new Date(new Date().setDate(new Date().getDate() - 1))
        .toISOString()
        .slice(0, 10),
    });
    item = overdue();
    expect(item.length).toBe(overdueItemLength + 1);
  });

  test("checks retrieval of due today items.", () => {
    let item = dueToday();
    const dueTodayItemLength = item.length;
    add({
      tittle: "todo item 6",
      completed: false,
      dueDate: new Date().toISOString().slice(0, 10),
    });
    item = dueToday();
    expect(item.length).toBe(dueTodayItemLength + 1);
  });

  test("checks retrieval of due later items.", () => {
    let item = dueLater();
    const dueLaterItemLength = item.length;
    add({
      tittle: "todo item 7",
      completed: false,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1))
        .toISOString()
        .slice(0, 10),
    });
    item = dueLater();
    expect(item.length).toBe(dueLaterItemLength + 1);
  });
});
