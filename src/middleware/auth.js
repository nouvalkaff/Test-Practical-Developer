const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { user } = require("../../database/models");

exports.roleUser = async (req, res, next) => {
  try {
    const authHead = req.headers.authorization,
      token = authHead && authHead.split(" ")[1],
      decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (decoded.role !== "user") {
      return res.status(403).json({
        code: 403,
        statusText: "Forbidden",
        sucess: false,
        message: "Only registered users are allowed to access this page",
      });
    }

    next();
  } catch (err) {
    // If error it will make status code 500 (Internal Server Error) and send the error message
    res.status(500).json({
      code: 500,
      statusText: "Internal Server Error",
      success: false,
      message: err,
    });
  }
};

exports.tokenLoginUser = async (req, res) => {
  try {
    //req email from body
    const { email, userName } = req.body;
    const User = await user.findOne({ where: { email: email } });
    const UserN = await user.findOne({ where: { userName: userName } });

    if (User) {
      const token = jwt.sign(
        {
          role: User.dataValues.role,
          user_id: User.dataValues.id,
          email: User.dataValues.email,
          userName: User.dataValues.userName,
          fullName: User.dataValues.fullName,
        },
        process.env.SECRET_KEY,
        { expiresIn: "30m" }
      );

      //if sign up success
      const adminResult = {
        statusCode: 200,
        statusText: "OK",
        message: "Login Success!",
        result: {
          user_token: `Bearer ${token}`,
        },
      };

      return res.status(200).json(adminResult);
    }

    if (UserN) {
      const token = jwt.sign(
        {
          role: UserN.dataValues.role,
          user_id: UserN.dataValues.id,
          email: UserN.dataValues.email,
          userName: UserN.dataValues.userName,
          fullName: UserN.dataValues.fullName,
        },
        process.env.SECRET_KEY,
        { expiresIn: "30m" }
      );

      //if sign up success
      const adminResultN = {
        statusCode: 200,
        statusText: "OK",
        message: "Login Success!",
        result: {
          user_token: `Bearer ${token}`,
        },
      };

      return res.status(200).json(adminResultN);
    }
    //if sign up error
  } catch (err) {
    console.log(err);
    res.status(500).json({
      code: 500,
      statusText: "Internal Server Error",
      success: false,
      message: "Failed to retrieve any data",
    });
  }
};

exports.loginUser = async (req, res, next) => {
  const { userName, email, password } = req.body;

  try {
    const matchEmail = await user.findOne({
      where: { email: email },
    });

    const matchUserName = await user.findOne({
      where: { userName: userName },
    });

    //check email whether exist or not

    if (email == "" && userName == "") {
      res.status(400).json({
        code: 400,
        statustext: "Bad Request",
        success: false,
        message: "Email and username cannot be Empty",
      });
      return;
    }

    if (password == "") {
      res.status(400).json({
        code: 400,
        statustext: "Bad Request",
        success: false,
        message: "Password cannot be Empty",
      });
      return;
    }

    if (email == "") {
      const verifyPassword = await bcrypt.compare(
        password,
        matchUserName.dataValues.password
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
    }

    if (userName == "") {
      const verifyPassword = await bcrypt.compare(
        password,
        matchEmail.dataValues.password
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
    }

    if (email != "") {
      if (!matchEmail) {
        return res.status(404).json({
          code: 404,
          statustext: "Not Found",
          success: false,
          message: "Email does not exist",
        });
      }
    }

    if (userName != "") {
      if (!matchUserName) {
        return res.status(404).json({
          code: 404,
          statustext: "Not Found",
          success: false,
          message: "Username does not exist",
        });
      }
    }

    next();
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
