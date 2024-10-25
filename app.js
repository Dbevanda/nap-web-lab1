/*const express = require("express");
const dotenv = require("dotenv");
const { auth0Middleware } = require("./middleware/auth");
const ticketRoutes = require("./routes/tickets");

dotenv.config();
const app = express();
app.use(express.json());

// Apply Auth0 middleware
app.use(auth0Middleware);

// Use the ticket routes
app.use("/", ticketRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});*/
const express = require("express");
const { Pool } = require("pg");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const { auth } = require("express-oauth2-jwt-bearer");
require("dotenv").config();

// Import Auth0 SDK for Express
const {
  auth: auth0Middleware,
  requiresAuth,
} = require("express-openid-connect");

const app = express();
app.use(express.json());

// PostgreSQL konekcija
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

// Auth0 konfiguracija
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

// Ruta za prikaz broja generiranih ulaznica
app.get("/", async (req, res) => {
  try {
    const { rowCount } = await pool.query("SELECT * FROM tickets");

    // Render a simple HTML page
    res.send(`
            <html>
                <head>
                    <title>Generated Tickets</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 50px;
                            padding: 0;
                            background-color: #f4f4f9;
                        }
                        h1 {
                            color: #333;
                        }
                        .container {
                            background-color: #fff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                            text-align: center;
                        }
                        .ticket-count {
                            font-size: 24px;
                            margin-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Welcome to the Ticket System</h1>
                        <div class="ticket-count">
                            <p>Number of generated tickets: <strong>${rowCount}</strong></p>
                        </div>
                    </div>
                </body>
            </html>
        `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Ruta za generiranje ulaznice (i dalje koristi Auth0 JWT autentifikaciju)
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
});

app.post("/generate-ticket", checkJwt, async (req, res) => {
  const { vatin, firstName, lastName } = req.body;
  if (!vatin || !firstName || !lastName) {
    return res.status(400).send("Missing required fields");
  }

  try {
    const result = await pool.query(
      "SELECT COUNT(*) FROM tickets WHERE vatin = $1",
      [vatin]
    );
    if (parseInt(result.rows[0].count) >= 3) {
      return res.status(400).send("Maximum of 3 tickets allowed per VATIN");
    }

    const ticketId = uuidv4();
    const ticketUrl = `${process.env.BASE_URL}/ticket/${ticketId}`;
    const qrCode = await QRCode.toDataURL(ticketUrl);

    await pool.query(
      "INSERT INTO tickets (id, vatin, first_name, last_name, created_at) VALUES ($1, $2, $3, $4, NOW())",
      [ticketId, vatin, firstName, lastName]
    );

    res.json({ ticketId, qrCode });
  } catch (error) {
    res.status(500).send("Server error");
  }
});

app.get("/ticket/:id", requiresAuth(), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM tickets WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).send("Ticket not found");
    }

    const ticket = result.rows[0];
    const username = req.oidc.user.nickname || req.oidc.user.name || "User";

    // Render a simple HTML page
    res.send(`
            <html>
                <head>
                    <title>Ticket Information</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 50px;
                            padding: 0;
                            background-color: #f4f4f9;
                        }
                        h1 {
                            color: #333;
                        }
                        .container {
                            background-color: #fff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        }
                        .ticket-info {
                            margin-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Hello, ${username}!</h1>
                        <div class="ticket-info">
                            <p><strong>VATIN:</strong> ${ticket.vatin}</p>
                            <p><strong>First Name:</strong> ${ticket.first_name}</p>
                            <p><strong>Last Name:</strong> ${ticket.last_name}</p>
                            <p><strong>Created At:</strong> ${ticket.created_at}</p>
                        </div>
                    </div>
                </body>
            </html>
        `);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Pokreni server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
