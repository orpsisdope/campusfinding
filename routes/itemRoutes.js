const express = require("express");
const controller = require("../controllers/itemController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", controller.getItems);

router.post(
  "/",
  authenticate,
  controller.createItem
);

router.patch(
  "/:id/resolve",
  authenticate,
  controller.resolveItem
);

module.exports = router;