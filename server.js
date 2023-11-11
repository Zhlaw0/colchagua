const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: "mysecretkey", resave: true, saveUninitialized: true }));

mongoose.connect("mongodb+srv://mauricio:Santiago241@usuarios.kb2i0sp.mongodb.net/Usuarios", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const registroSchema = {
  nombre: String,
  telefono: String,
  direccion: String,
  email: String,
  password: String,
  username: String
};

const Registro = mongoose.model("Registro", registroSchema);

app.use(express.static(__dirname));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/Formulario.html");
});

app.post("/guardar", function(req, res) {
  const newRegistro = new Registro({
    nombre: req.body.nombre,
    telefono: req.body.telefono,
    direccion: req.body.direccion,
    email: req.body.email,
    password: req.body.password,
    username: req.body.username
  });

  newRegistro
    .save()
    .then(() => {
      console.log("Registro guardado en la base de datos");
      res.redirect("/login");
    })
    .catch((err) => {
      console.log("Error al guardar el registro en la base de datos: " + err);
      // Puedes agregar una respuesta de error aquí si es necesario
    });
});

app.get("/login", function(req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.post("/login", function(req, res) {
  const { username, password } = req.body;

  Registro.findOne({ username: username, password: password })
    .then((user) => {
      if (user) {
        req.session.user = user;
        res.redirect("/");
      } else {
        res.redirect("/login?error=1");
      }
    })
    .catch((err) => {
      console.error(err);
      res.redirect("/login");
    });
});

app.listen(3000, function() {
  console.log("Servidor en ejecución en el puerto 3000");
});




