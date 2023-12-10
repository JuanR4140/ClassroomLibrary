let socket = io.connect();

document.querySelector("#sign-in").addEventListener("click", () => {
  let email = document.querySelector("#email").value;
  let password = document.querySelector("#password").value;
  socket.emit("sign-in", {
    email: email,
    password: password
  });
});

socket.emit("ping", {
  username: getCookie("username"),
  token: getCookie("token")
});

socket.on("success", () => {
  window.location.href = "home";
});

socket.on("sign-in-result", (message) => {
  createSnackbar(message.message, message.bgColor, message.txColor);
  if(message.code == 200){
    document.cookie = message.cookie_name;
    document.cookie = message.cookie_token;
    window.location.href = "home";
  }
});
