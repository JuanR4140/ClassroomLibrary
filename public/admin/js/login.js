let socket = io.connect();

document.querySelector("#sign-in").addEventListener("click", () => {
  let email = document.querySelector("#email").value;
  let password = document.querySelector("#password").value;
  socket.emit("admin-sign-in", {
    email: email,
    password: password
  });
});

socket.emit("admin-ping", {
  username: getCookie("username"),
  token: getCookie("token")
});

socket.on("admin-success", () => {
  window.location.href = "dashboard";
});

socket.on("admin-sign-in-result", (message) => {
  createSnackbar(message.message, message.bgColor, message.txColor);
  if(message.code == 200){
    document.cookie = message.cookie_name;
    document.cookie = message.cookie_token;
    window.location.href = "dashboard";
  }
});
