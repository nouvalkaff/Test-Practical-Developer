const { catalog } = require("../../database/models");

exports.createCatalog = async (req, res, next) => {
  try {
    const marker = req.body;
    const checkCatalog = await catalog.findOne({ where: marker });

    if (checkCatalog) {
      return res.status(409).json({
        code: 409,
        statustext: "Conflict",
        success: false,
        message: "Same marker data already exist",
      });
    }
    const data = await catalog.create(marker);
    res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: "New marker data has been created",
      result: data,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Sorry, we failed to create a new marker data",
    });
  }
};

exports.getAllCatalog = async (req, res) => {
  try {
    const allCatalog = await catalog.findAll({
      attributes: {
        exclude: ["createdAt"],
      },
      order: [["id", "ASC"]],
    });
    res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: "Catalog data have been retrieved succesfully",
      result: allCatalog,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to get data",
    });
  }
};

exports.getCatalog = async (req, res) => {
  try {
    const id = req.query.id;

    const findACatalog = await catalog.findOne({
      where: {
        id: id,
      },
    });

    if (!findACatalog) {
      res.status(404).json({
        code: 404,
        statustext: "Not Found",
        success: false,
        message: `Marker data with ID ${id} is not found`,
      });
    }

    const data = `You clicked marker: ${findACatalog.dataValues.marker}`;

    res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: "Catalog data have been retrieved succesfully",
      result: data,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to get data",
    });
  }
};

exports.updateCatalog = async (req, res) => {
  try {
    const marker = req.body,
      id = req.query.id;

    const findOneCatalog = await catalog.findOne({
      where: {
        id: id,
      },
    });

    await catalog.update(marker, { where: { id: id } });

    const updatedData = await catalog.findOne({
      where: { id: id },
    });

    return res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: "Catalog data have been updated succesfully",
      result_update: updatedData,
      result_previous: findOneCatalog,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to get data",
    });
  }
};

exports.deleteCatalog = async (req, res) => {
  try {
    const idInput = req.query.id;
    const findCatalog = await catalog.findOne({
      where: {
        id: idInput,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (!findCatalog) {
      res.status(404).json({
        code: 404,
        statustext: "Not Found",
        success: false,
        message: `The catalog with ID ${idInput} is not found`,
      });
      return;
    }

    await catalog.destroy({
      where: {
        id: idInput,
      },
    });

    const marker = findCatalog.dataValues.marker;

    return res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: `The catalog ID ${idInput} with name '${marker}' is deleted`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to get data",
    });
  }
};
