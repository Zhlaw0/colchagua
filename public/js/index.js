const btnClose = document.querySelector("#btnClose");

const localData = localStorage.getItem("token");
if (localData === null) btnClose.remove();

btnClose.addEventListener("click", () => {
  localStorage.removeItem("dataSend");
  localStorage.removeItem("token");
  window.location.assign("/");
});
