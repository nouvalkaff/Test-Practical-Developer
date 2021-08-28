const { user } = require("../../database/models");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    const { password, email, fullName, userName } = req.body;
    const matchEmail = await user.findOne({
      where: { email: email },
    });

    if (fullName == "" || userName == "" || email == "" || password == "") {
      res.status(400).json({
        code: 400,
        statustext: "Bad Request",
        success: false,
        message: "Full Name, Username, Email, or Password cannot be Empty",
      });
      return;
    }

    if (matchEmail) {
      res.status(409).json({
        code: 409,
        statustext: "Conflict",
        success: false,
        message: "Email already exist, please use unregistered email",
      });

      return;

      // Else untuk input dan encrypt data yg di masukkan
    } else {
      await user.create({
        role: "user",
        ...req.body,
        password: bcrypt.hashSync(password, 12),
      });

      const dataCreated = await user.findOne({
        where: { email: email },
        attributes: {
          exclude: ["password", "createdAt", "updatedAt"],
        },
      });

      return res.status(201).json({
        code: 201,
        statustext: "Created",
        success: true,
        message: "User data is created successfully",
        result: dataCreated,
      });
    }
  } catch (err) {
    res.status(500).send({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to get data",
    });
    console.log(err);
  }
};

exports.getUser = async (req, res) => {
  const userName = req.query.userName;
  try {
    const oneUser = await user.findOne({
      where: {
        userName: { [Op.iLike]: "%" + userName + "%" },
      },
      attributes: {
        exclude: ["password", "createdAt", "updatedAt"],
      },
    });

    if (!oneUser) {
      res.status(404).json({
        code: 404,
        statustext: "Not Found",
        success: false,
        message: "User data is not found",
      });
    }

    if (userName == "") {
      res.status(200).json({
        code: 200,
        statustext: "OK",
        success: true,
        message: "Successfully retrieve user data",
        result: {},
      });
    }

    res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: "Successfully retrieve user data",
      result: oneUser,
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

exports.updateUser = async (req, res) => {
  const idInput = req.query.id;

  const authHead = req.headers.authorization,
    token = authHead && authHead.split(" ")[1],
    decoded = jwt.verify(token, process.env.SECRET_KEY);

  let { password, fullName, userName } = req.body,
    email = decoded.email;

  const findOneUser = await user.findOne({
    where: {
      id: idInput,
    },
  });

  const matchFullName = await findOneUser.dataValues.fullName,
    matchUserName = await findOneUser.dataValues.userName;

  const previousData = await user.findOne({
    where: { email: email, id: idInput },
    attributes: {
      exclude: ["password", "createdAt", "updatedAt"],
    },
  });

  if (!previousData) {
    res.status(409).json({
      code: 409,
      statustext: "Conflict",
      success: false,
      message: "Email data is not match with user ID, update failed",
    });
    return;
  }

  if (email == "") {
    res.status(400).json({
      code: 400,
      statustext: "Bad Request",
      success: false,
      message: "Email cannot be Empty",
    });
    return;
  }

  if (!findOneUser) {
    res.status(404).json({
      code: 404,
      statustext: "Not Found",
      success: false,
      message: `The user with ID ${idInput} is not found`,
    });
    return;
  }

  try {
    if (!password) {
      await user.update(
        {
          ...req.body,
          password: previousData.dataValues.password,
        },
        {
          where: {
            id: idInput,
            email: email,
          },
        }
      );
    }

    if (password) {
      await user.update(
        {
          ...req.body,
          password: bcrypt.hashSync(password, 10),
        },
        {
          where: {
            id: idInput,
            email: email,
          },
        }
      );
    }

    if (fullName == matchFullName) {
      res.status(409).json({
        code: 409,
        statustext: "Conflict",
        success: false,
        message: `Full name is already exist`,
      });
      return;
    }

    if (userName == matchUserName) {
      res.status(409).json({
        code: 409,
        statustext: "Conflict",
        success: false,
        message: `Username is already exist`,
      });
      return;
    }

    if (fullName == "") {
      await user.update(
        {
          fullName: previousData.dataValues.fullName,
        },
        {
          where: {
            id: idInput,
          },
        }
      );
    }

    if (userName == "") {
      await user.update(
        {
          userName: previousData.dataValues.userName,
        },
        {
          where: {
            id: idInput,
          },
        }
      );
    }

    const updatedData = await user.findOne({
      where: {
        id: idInput,
      },
      attributes: {
        exclude: ["password", "createdAt", "updatedAt"],
      },
    });

    return res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: `The user with ID ${idInput} is updated`,
      result_update: updatedData,
      result_previous: previousData,
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

exports.deleteUser = async (req, res) => {
  try {
    const idInput = req.query.id;
    const password = req.body.password;
    const findOneUser = await user.findOne({
      where: {
        id: idInput,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (!findOneUser) {
      res.status(404).json({
        code: 404,
        statustext: "Not Found",
        success: false,
        message: `The user with ID ${idInput} is not found`,
      });
      return;
    }

    const verifyPassword = await bcrypt.compare(
      password,
      findOneUser.dataValues.password
    );

    // if password doesn't match
    if (!verifyPassword) {
      return res.status(401).json({
        Code: 401,
        statustext: "Unauthorized",
        success: false,
        message: "Wrong Password, please try again",
      });
    }

    await user.destroy({
      where: {
        id: idInput,
        password: findOneUser.dataValues.password,
      },
    });

    const fullName = findOneUser.dataValues.fullName;

    return res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: `The user ID ${idInput} with name '${fullName}' is deleted`,
      result: findOneUser,
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
