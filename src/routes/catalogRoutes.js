const express = require("express");

const router = express.Router();

const {
  createCatalog,
  getAllCatalog,
  getCatalog,
  updateCatalog,
  deleteCatalog,
} = require("../controllers/catalogControllers");

const { roleUser } = require("../middleware/auth");

router.post("/catalog/create", roleUser, createCatalog);

router.get("/catalog/all", getAllCatalog);

router.get("/catalog", getCatalog);

router.put("/catalog/update", roleUser, updateCatalog);

router.delete("/catalog/delete", roleUser, deleteCatalog);

module.exports = router;
