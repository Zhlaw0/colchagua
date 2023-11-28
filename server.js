const express = require("express");
const functions = require("firebase-functions");
require("dotenv").config();
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcryptjs");

app.use(express.json());
app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: true,
  })
);

mongoose.connect(process.env.MONGO_DB, {
  useNewUrlParser: true,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 5000,
  useUnifiedTopology: true,
});

const registroSchema = {
  nombre: String,
  telefono: String,
  direccion: String,
  email: String,
  password: String,
  username: String,
};

const Registro = mongoose.model("Registro", registroSchema);

app.use(express.static(__dirname));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/Formulario.html");
});

app.post("/guardar", async (req, res) => {
  const user = await Registro.findOne({ email: req.body.email });
  if (user) {
    return res.status(200).json({
      message: "El usuario ya existe.",
    });
  }
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hashSync(req.body.password, salt);
  const dataInsert = {
    nombre: req.body.nombre,
    telefono: req.body.telefono,
    direccion: req.body.direccion,
    email: req.body.email,
    password: hashPassword,
    username: req.body.username,
  };
  const newRegistro = new Registro(dataInsert);
  newRegistro
    .save()
    .then(() => {
      res.status(200).json({
        message: "Registro guardado en la base de datos",
      });
    })
    .catch((err) => {
      res.status(200).json({
        messageError: `Error al guardar el registro en la base de datos: ${err}`,
      });
    });
});

app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.post("/login", function (req, res) {
  const { username, password } = req.body;
  Registro.findOne({ username: username })
    .then((user) => {
      if (password !== user.password) {
        res.status(200).json({
          login: true,
          message: "Contraseña incorrecto",
        });
        return;
      }
      if (user && password === user.password) {
        req.session.user = user;
        res.status(200).json({
          login: true,
          message: "Login correcto",
        });
      } else {
        res.status(500).json({
          login: false,
          message: "Login incorrecto",
        });
      }
    })
    .catch((err) => {
      console.error(err);
      res.redirect("/login");
    });
});

app.listen(3000, function () {
  console.log("Servidor en ejecución en el puerto 3000");
});

exports.webApp = functions.https.onRequest(app);
