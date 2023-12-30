socket = io.connect();

socket.emit("ping", {
  username: getCookie("username"),
  token: getCookie("token")
});

socket.on("success", (data) => {
  document.querySelector('#greeting').innerText = `Happy reading, ${getCookie("username")}!`;

  if(data.unread > 0){
    document.querySelector("#mail-unread-indicator").classList.remove("hidden");
    document.querySelector("#mail-unread-indicator").innerText = `${data.unread}`;
    document.querySelector("#mail-unread-indicator").classList.add("block");
  }
});

socket.on("fatal", () => {
  window.location.href = "/";
});
