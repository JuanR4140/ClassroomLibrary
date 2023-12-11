socket = io.connect();

socket.emit("admin-ping", {
  username: getCookie("username"),
  token: getCookie("token")
});

socket.on("admin-success", () => {
  document.querySelector("#greeting").innerText = `Welcome, ADMIN ${getCookie("username")}!`;
});

socket.on("fatal", () => {
  window.location.href = "/";
});
