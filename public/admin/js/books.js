socket = io.connect();

socket.emit("admin-ping", {
  username: getCookie("username"),
  token: getCookie("token")
});

document.querySelector("#add-book-screen-btn").addEventListener("click", () => {
  document.querySelector("#add-book-screen").classList.remove("hidden");
  document.querySelector("#add-book-screen").classList.add("block");

  document.querySelector("#main").classList.remove("block");
  document.querySelector("#main").classList.add("hidden");
});

document.querySelector("#add-book-back-btn").addEventListener("click", () => {
  document.querySelector("#main").classList.remove("hidden");
  document.querySelector("#main").classList.add("block");

  document.querySelector("#add-book-screen").classList.remove("block");
  document.querySelector("#add-book-screen").classList.add("hidden");
});

document.querySelector("#add-book-btn-final").addEventListener("click", () => {

  const image = document.querySelector("#add-book-img");
  console.log(image.width);
  console.log(image.height);
  image.setAttribute("crossorigin", "anonymous");

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0, image.width, image.height);
  const bytes = canvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "");

  socket.emit("admin-add-book", {
    username: getCookie("username"),
    token: getCookie("token"),

    isbn: document.querySelector("#add-book-title").getAttribute("isbn"),
    title: document.querySelector("#add-book-title").innerText,
    author: document.querySelector("#add-book-author").innerText,
    genre: document.querySelector("#dropdown-genre-button").innerText,
    cover: bytes
  });
});

socket.on("admin-add-book-result", (data) => {
  createSnackbar(data.msg, data.bgColor, data.txColor);
});

socket.on("fatal", () => {
  window.location.href = "/";
});
