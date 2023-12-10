document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const { user } = parseJwt(token);
  if (!user.admin || token === null) {
    window.location.assign("/shop.html");
  }
  const { title, precio, id } = JSON.parse(localStorage.getItem("dataSend"));
  const titleInput = document.querySelector("#titulo");
  const precioInput = document.querySelector("#precio");
  const formatPrecio = precio.replace("$", "").replace(".", "");
  titleInput.value = title;
  precioInput.value = formatPrecio;

  const btnUpdate = document.querySelector("#btnUpdate");

  btnUpdate.addEventListener("click", async () => {
    const urlApiLogin = "https://brasas-colchagua.onrender.com/modificarProducto";
    const res = await fetch(urlApiLogin, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        title: titleInput.value,
        precio: parseInt(precioInput.value),
      }),
    });
    await res.json();
    alert("Producto modificado Correctamente");
    window.location.assign("/shop.html");
  });
});

const parseJwt = (token) => {
  let base64Url = token.split(".")[1];
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  let jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  return JSON.parse(jsonPayload);
};

const btnClose = document.querySelector("#btnClose");
const localData = localStorage.getItem("token");
if (localData === null) btnClose.remove();
btnClose.addEventListener("click", () => {
  localStorage.removeItem("dataSend");
  localStorage.removeItem("token");
  window.location.assign("/");
});
