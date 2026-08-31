const express = require("express");
const controller = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", controller.signup);
router.post("/login", controller.login);
router.get("/me", authenticate, controller.me);

module.exports = router;