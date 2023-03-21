/* eslint-disable no-undef */
const todoList = require("../todo");

const { all, markAsComplete, add } = todoList();

describe("Todo Test Suite", () => {
  beforeAll(() => {
    add({
      tittle: "Test Todo",
      completed: false,
      dueDate: new Date().toISOString().slice(0, 10),
    });
  });
  test("Should add new todo", () => {
    const todoItemCount = all.length;
    add({
      tittle: "Test Todo",
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
});
