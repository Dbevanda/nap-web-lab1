const express = require("express");
const {
  getTicketCount,
  generateTicket,
  getTicketById,
} = require("../controllers/ticketController");
const { checkJwt, requiresAuth } = require("../middleware/auth");

const router = express.Router();

// Route to display the number of generated tickets
router.get("/", getTicketCount);

// Route to generate a new ticket (originally /generate-ticket)
router.post("/generate-ticket", checkJwt, generateTicket);

// Route to view ticket details by ID (originally /ticket/:id)
router.get("/ticket/:id", requiresAuth, getTicketById);

module.exports = router;
