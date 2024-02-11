const express = require("express");
const app = express();
const { Todo, User } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const localStrategey = require("passport-local");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");

const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "this-is-my-secrete-key",
    cookie: {
      maxAge: 24 * 60 * 60 * 100,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new localStrategey(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (username, password, done) => {
      try {
        User.findOne({ where: { email: username } })
          .then(async function (user) {
            const result = await bcrypt.compare(password, user.password);
            if (result) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Invalid password" });
            }
          })
          .catch((err) => {
            return done(err);
          });
      } catch (err) {
        console.log(err);
      }
    },
  ),
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

app.use(flash());

app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

app.set("views", path.join(__dirname, "views"));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async function (request, response) {
  if (request.isAuthenticated()) {
    return response.redirect("/todos");
  }

  response.render("index", {
    title: "Todo application",
  });
});

app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    console.log("Processing list of all Todos ...");
    // FILL IN YOUR CODE HERE
    try {
      const overdues = await Todo.overdue(request.user.id);
      const todaydues = await Todo.todaydue(request.user.id);
      const laterdues = await Todo.laterdue(request.user.id);
      const comptodos = await Todo.completedtodos(request.user.id);
      console.log(overdues, todaydues, laterdues, comptodos);
      if (request.accepts("html")) {
        response.render("todos", { overdues, todaydues, laterdues, comptodos });
      } else {
        return response.json({ overdues, todaydues, laterdues, comptodos });
      }
    } catch (err) {
      console.log(err);
      response.status(422).send(err);
    }
  },
);

app.get(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      const todo = await Todo.findByPk(request.params.id);
      return response.json(todo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);

app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    console.log("hii", request.user);
    try {
      const todo = await Todo.addTodo(request.body, request.user.id);
      if (request.accepts("html")) {
        return response.redirect("/todos");
      } else {
        return response.json(todo);
      }
    } catch (error) {
      console.error(error); // Log the error for debugging

      // Flash an error message
      request.flash("error", "Failed to add todo. Please try again.");

      // Redirect to the same page or a designated error page
      return response.redirect("/todos"); // You can customize the redirect URL
    }
  },
);

app.put(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    const todo = await Todo.findByPk(request.params.id);
    try {
      const updatedTodo = await todo.setCompletionStatus(
        request.body.completed,
      );
      return response.json(updatedTodo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);

app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    console.log("We have to delete a Todo with ID: ", request.params.id);

    try {
      const deleteTodo = await Todo.deleteTodo(
        request.params.id,
        request.user.id,
      );
      response.send(deleteTodo ? true : false);
    } catch (err) {
      console.log(err);
      return response.status(422).json(err);
    }
  },
);

app.get("/signup", async function (request, response) {
  response.render("signup", { title: "signup" });
});
app.post("/users", async function (request, response) {
  const { firstName, lastName, email, password } = request.body;

  // Check if the password is empty
  if (!password) {
    // Flash an error message
    request.flash("error", "Password is required.");

    // Redirect to the same page or a designated error page
    return response.redirect("/signup"); // You can customize the redirect URL
  }

  const hashpass = await bcrypt.hash(password, saltRounds);

  try {
    const user = await User.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashpass,
    });

    console.log("User created:", user);

    request.login(user, (err) => {
      if (err) {
        console.log(err);
      }

      console.log("User logged in:", user);

      response.redirect("/todos");
    });
  } catch (err) {
    console.log(err);

    // Flash an error message
    request.flash("error", "Failed to create user. Please try again.");

    // Redirect to the same page or a designated error page
    return response.redirect("/signup"); // You can customize the redirect URL
  }
});

app.get("/login", (request, response) => {
  response.render("login", { title: "Login" });
});

app.post(
  "/sessions",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (request, response) {
    console.log(request.user);
    console.log(request.flash("error")); // Print out flash messages
    response.redirect("/todos");
  },
);

app.get("/signout", (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
module.exports = app;
