let socket = io.connect();

document.querySelector("#sign-in").addEventListener("click", () => {
  let email = document.querySelector("#email").value;
  let password = document.querySelector("#password").value;
  let pin = document.querySelector("#pin").value;
  socket.emit("sign-in", {
    email: email,
    password: password,

    pin: pin
  });
});

document.querySelector("#pin-btn").addEventListener("click", () => {
    document.querySelector("#pin-btn").remove();
    document.querySelector("#pin").classList.remove("hidden");
    document.querySelector("#pin").classList.add("block");
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

window.addEventListener("keypress", (key) => {
  if(key.key === "Enter"){
    let email = document.querySelector("#email").value;
    let password = document.querySelector("#password").value;
    let pin = document.querySelector("#pin").value;
    socket.emit("sign-in", {
      email: email,
      password: password,
      pin: pin
    });
  }
});
