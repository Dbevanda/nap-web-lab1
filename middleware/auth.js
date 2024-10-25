const { auth } = require("express-oauth2-jwt-bearer");
const {
  auth: auth0Middleware,
  requiresAuth,
} = require("express-openid-connect");
require("dotenv").config();

// JWT authentication for protected routes
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
});

// Auth0 middleware configuration
const auth0Config = auth0Middleware({
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
});

module.exports = { checkJwt, auth0Middleware: auth0Config, requiresAuth };
