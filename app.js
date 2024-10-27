const express = require("express");
const { createTable } = require("./db");
const indexRouter = require("./routes/index");
const ticketsRouter = require("./routes/tickets");
const { auth: auth0Middleware } = require("express-openid-connect");
require("dotenv").config();

const app = express();
app.use(express.json());

createTable();

// Auth0 configuration
app.use(
  auth0Middleware({
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  })
);

app.use("/", indexRouter);
app.use("/", ticketsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
