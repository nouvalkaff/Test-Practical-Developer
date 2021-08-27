/*
Buat design arsitektur dan prosesnya berupa flow gambar dari konsep microservices di dalam docker container yang terdiri dari database dan aplikasi.

Kasus: Kita akan deploy beberapa aplikasi terdiri dari frontend & backend (API), di dalam backend terdiri 2 service yaitu service users & Katalog.

Semua services di protect dengan token JWT untuk mengambil datanya.

Notes: Jangan lupa memberikan keterangan dari masing2 service dan databasenya.

Contoh DB = MongoDB/PostgreSql/MySql,Lang Program = nodejs/php/java/python
*/

const express = require("express");
const cors = require("cors");

require("dotenv").config();
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors({ origin: "*" }));

app.use("/api");

app.all("/", (req, res) => {
  res.status(200).json({
    code: 200,
    statusText: "OK",
    success: true,
    mesage: "This is the simple-app-ptbvt API",
  });
});

app.all("*", (req, res) => {
  res.status(404).json({
    code: 404,
    statusText: "Not Found",
    success: false,
    message: "Wrong route. Please change to the right one",
  });
});

app.listen(process.env.PORT, (req, res) => {
  console.log(`Now listening on port ${process.env.PORT}`);
});
