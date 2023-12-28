socket = io.connect();

socket.emit("ping", {
  username: getCookie("username"),
  token: getCookie("token")
});

socket.on("success", () => {
  document.querySelector('#greeting').innerText = `Happy reading, ${getCookie("username")}!`;
});

socket.on("fatal", () => {
  window.location.href = "/";
});
