socket = io.connect();

socket.emit("admin-ping", {
  username: getCookie("username"),
  token: getCookie("token")
});

socket.on("admin-success", () => {
  document.querySelector("#greeting").innerText = `Welcome, ADMIN ${getCookie("username")}!`;

  document.querySelector("#clear-logs-btn").addEventListener("click", () => {
    socket.emit("admin-clear-logs", {
      username: getCookie("username"),
      token: getCookie("token")
    });
    document.querySelector("#logs-content").innerHTML = "";
  });

});

document.querySelector("#view-logs-btn").addEventListener("click", () => {
  socket.emit("admin-view-logs", {
    username: getCookie("username"),
    token: getCookie("token")
  });
  document.querySelector("#logs-content").innerHTML = "Fetching system logs..";
});

socket.on("admin-view-logs-results", (log) => {
  document.querySelector("#logs-content").innerHTML = log;
});

socket.on("fatal", () => {
  window.location.href = "/";
});
