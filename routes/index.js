const express = require("express");
const { pool } = require("../db");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { rowCount } = await pool.query("SELECT * FROM tickets");
    res.send(`
      <html>
        <head>
          <title>Generated Tickets</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 50px; padding: 0; background-color: #f4f4f9; }
            h1 { color: #333; }
            .container { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); text-align: center; }
            .ticket-count { font-size: 24px; margin-top: 20px; }
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

module.exports = router;
