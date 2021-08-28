const express = require("express");

const router = express.Router();

const {
  registerUser,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/userControllers");

const { roleUser, tokenLoginUser, loginUser } = require("../middleware/auth");

router.post("/user/regis", registerUser);

router.post("/user/login", loginUser, tokenLoginUser);

router.get("/user", getUser);

router.put("/user/update", roleUser, updateUser);

router.delete("/user/delete", roleUser, deleteUser);

module.exports = router;
