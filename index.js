const app = require("./app");

const dotenv = require("dotenv");

dotenv.config();

const portNumber = process.env.PORT;

app.listen(portNumber, () => {
  console.log(`Started express server at port ${portNumber}`);
});

// fsdf

// Path: app.js
