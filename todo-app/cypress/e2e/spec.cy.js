/* eslint-disable no-undef */
let baseUrl = "http://localhost:3000";

const generateRandomEmail = () => {
  const timestamp = new Date().getTime();
  return `user${timestamp}@example.com`;
};

function getCurrentDateFormatted() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const email = generateRandomEmail();

describe("Testing Todo Application", () => {
  it("create an account", () => {
    cy.visit(baseUrl + "/signup");

    cy.get('input[name="firstName"]').type("vivekvivek");
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type("vivekvivek");

    cy.get('input[name="lastName"]').type("vivekvivek");

    cy.get('button[type="submit"]').click();
    cy.wait(500);
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/todos");
    });
  });
  it("should not login with invalid credentials", () => {
    cy.visit(baseUrl + "/login");
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type("inv@lid");
    cy.get('button[type="submit"]').click();
    cy.wait(500);
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/login");
    });
  });
});

describe("Todo App Test,", () => {
  beforeEach(() => {
    cy.visit(baseUrl + "/login");

    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type("vivekvivek");
    cy.get('button[type="submit"]').click();
  });

  it("Create Todo", () => {
    cy.get('input[name="title"]').type("Sample due later item");
    cy.get('input[name="dueDate"]').type(getCurrentDateFormatted());

    cy.get('button[type="submit"]').click();
    cy.wait(500);
    cy.get(".todo-item").should("exist");
    cy.get("#count-duetoday").contains("1");
  });

  it("Delete Todo", () => {
    cy.contains("label", "Sample due later item")
      .next("a")
      .trigger("mouseover", { force: true })
      .click({ force: true });
    cy.get("#count-overdue").contains("0");
  });

  it("Test Logout", () => {
    cy.contains("signout", { matchCase: false }).click({ force: true });
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/");
    });
  });
});
