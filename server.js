const express = require("express");
const functions = require("firebase-functions");
require("dotenv").config();
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo").default; // Importa connect-mongo
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

app.use(express.json());
app.use(express.static("public"));

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
  admin: Boolean,
};

const Registro = mongoose.model("Registro", registroSchema);

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }), // Configura el almacenamiento de sesiones con connect-mongo
  })
);

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
    admin: req.body.admin,
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

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Registro.findOne({ email });
    if (!user) {
      return res.status(200).json({
        login: false,
        message: "Usuario no existe",
        token: null,
      });
    }
    const isCorrectPassword = bcrypt.compareSync(password, user.password);
    if (isCorrectPassword) {
      const payload = {
        user: {
          id: user.id,
          email: user.email,
          admin: user.admin,
        },
      };
      jwt.sign(
        payload,
        process.env.SECRET_PASS,
        {
          expiresIn: 3600,
        },
        (error, token) => {
          if (error) throw error;
          res.status(200).json({
            token,
            login: true,
            message: "Login correcto",
          });
        }
      );
    } else {
      return res.status(200).json({
        login: false,
        message: "La contraseña es invalida.",
        token: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error al iniciar sesión.",
      login: false,
      token: null,
    });
  }
});

app.get("/getUser");

// Productos

const productosSchema = {
  title: String,
  precio: Number,
  id: Number,
};

const Productos = mongoose.model("Productos", productosSchema);

app.post("/guardarProducto", async (req, res) => {
  try {
    const { title } = req.body;
    const product = await Productos.findOne({ title });
    if (product) {
      return res.status(200).json({
        message: "Producto ya existe",
      });
    }
    const newRegistro = new Productos(req.body);
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
  } catch (error) {
    return res.status(500).json({
      message: "Error al guardar producto.",
    });
  }
});

app.get("/obtenerProductos", async (_, res) => {
  try {
    const products = await Productos.find();
    return res.status(200).json({
      products,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener producto.",
      error,
    });
  }
});

app.post("/modificarProducto", async (req, res) => {
  try {
    const { id, title, precio } = req.body;
    let product = await Productos.findOne({ id });
    product.title = title;
    product.precio = precio;
    await product.save();
    return res.status(200).json({
      message: "Producto modificado correctamente.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al modificar producto.",
      error,
    });
  }
});

app.listen(3000, function () {
  console.log("Servidor en ejecución en el puerto 3000");
});

exports.webApp = functions.https.onRequest(app);
