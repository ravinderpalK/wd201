const express = require("express");
const app = express();
const { Todo, User } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
var csrf = require("tiny-csrf");
var cookieParser = require("cookie-parser");

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const seesion = require("express-session");
const LocalStratergy = require("passport-local");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const flash = require("connect-flash");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf("123456789iamasecret987654321look", ["POST", "PUT", "DELETE"]));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(
  seesion({
    secret: "my-super-secret-key-23458730948391274",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.set("views", path.join(__dirname, "views"));
app.use(flash());
app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

passport.use(
  new LocalStratergy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async function (user) {
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch((error) => {
          console.log(error);
          return done(null, false, { message: "Invalid email" });
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

app.get("/", async (request, response) => {
  if (request.isAuthenticated()) {
    return response.redirect("/todos");
  }
  response.render("index", {
    title: "Todo application",
    csrfToken: request.csrfToken(),
  });
});

app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const loggedInUser = request.user.id;
    const completedTodos = await Todo.getCompletedTodos(loggedInUser);
    const overdueTodos = await Todo.getOverdueTodos(loggedInUser);
    const dueTodayTodos = await Todo.getDueTodayTodos(loggedInUser);
    const dueLaterTodos = await Todo.getDueLaterTodos(loggedInUser);
    if (request.accepts("html")) {
      response.render("todos", {
        title: "My Todo Application",
        overdueTodos,
        dueTodayTodos,
        dueLaterTodos,
        completedTodos,
        csrfToken: request.csrfToken(),
        user: request.user.firstName,
      });
    } else {
      response.json({
        overdueTodos,
        dueTodayTodos,
        dueLaterTodos,
        completedTodos,
      });
    }
  }
);

app.get("/signup", (request, response) => {
  response.render("signup", {
    title: "Signup",
    csrfToken: request.csrfToken(),
  });
});

app.post("/users", async (request, response) => {
  let hashedPwd = "";
  if (request.body.password)
    hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
  const firstName = request.body.firstName;
  const lastName = request.body.lastName;
  const email = request.body.email;
  const password = request.body.password;
  try {
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPwd,
    });
    request.login(user, (err) => {
      if (err) {
        console.log(err);
      }
      response.redirect("/todos");
    });
  } catch (err) {
    if (err.name == "SequelizeValidationError") {
      if (!firstName) request.flash("firstName", "First Name cannot be empty");
      if (!email) request.flash("email", "Email cannot be empty");
      if (!password) request.flash("password", "Password cannot be empty");
      response.redirect("/signup");
    } else if (err.name == "SequelizeUniqueConstraintError") {
      request.flash("email", "email is already used");
      response.redirect("/signup");
    }
  }
});

app.get("/login", (request, response) => {
  response.render("login", { title: "Login", csrfToken: request.csrfToken() });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (request, response) {
    console.log(request.user);
    response.redirect("/todos");
  }
);

app.get("/signout", (request, response, next) => {
  request.logout((err) => {
    if (err) return next(err);
    response.redirect("/");
  });
});

app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    const title = request.body.title;
    const dueDate = request.body.dueDate;
    try {
      await Todo.addTodo({
        title,
        dueDate,
        userId: request.user.id,
      });
      return response.redirect("/todos");
    } catch (err) {
      if (err.name == "SequelizeValidationError") {
        if (!title) request.flash("title", "Title cannot be empty");
        if (!dueDate) request.flash("dueDate", "Date cannot be empty");
        response.redirect("/todos");
      } else return response.status(422).json(err);
    }
  }
);

app.put(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      const todo = await Todo.findOne({
        where: { userId: request.user.id, id: request.params.id },
      });
      const updatedTodo = await todo.setCompletionStatus(
        request.body.completed
      );
      return response.json(updatedTodo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      const res = await Todo.remove(request.params.id, request.user.id);
      if (res) return response.json({ success: true });
      else return response.json({ success: false });
    } catch (error) {
      return response.status(422).json(error);
    }
  }
);

module.exports = app;
