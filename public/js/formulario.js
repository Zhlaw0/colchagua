const nameUser = document.querySelector("#nombre");
const telefono = document.querySelector("#telefono");
const direccion = document.querySelector("#direccion");
const email = document.querySelector("#email");
const username = document.querySelector("#username");
const password = document.querySelector("#password");
const btnRegister = document.querySelector("#btnRegister");

const token = localStorage.getItem("token");
const { user } = parseJwt(token);
if (!user.admin || token === null) {
  window.location.assign("/shop.html");
}

btnRegister.addEventListener("click", async () => {
  const dataObj = {
    nombre: nameUser.value,
    telefono: telefono.value,
    direccion: direccion.value,
    email: email.value,
    password: password.value,
    username: username.value,
    admin: false,
  };
  const urlApiLogin = "http://localhost:3000/guardar";
  const res = await fetch(urlApiLogin, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataObj),
  });
  const response = await res.json();
  if (response.message) {
    window.location.assign("/");
  } else {
    //alert("Error al registrar usuario");
  }
});
/*
 */
