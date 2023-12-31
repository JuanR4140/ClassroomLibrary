socket = io.connect();

socket.emit("admin-ping", {
  username: getCookie("username"),
  token: getCookie("token")
});

socket.on("fatal", () => {
  window.location.href = "/";
});
