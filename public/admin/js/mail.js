socket = io.connect();

socket.emit("admin-ping", {
  username: getCookie("username"),
  token: getCookie("token")
});

socket.on("admin-success", () => {
  document.querySelector("#send").addEventListener("click", () => {
    let recipients = document.querySelector("#recipients").value;
    let subject = document.querySelector("#subject").value;
    let email = document.querySelector("#email").value;

    socket.emit("admin-send-mail", {
      username: getCookie("username"),
      token: getCookie("token"),

      recipients: recipients,
      subject: subject,
      email: email
    });
  });
});

socket.on("admin-send-mail-results", (data) => {
  createSnackbar(data.message, data.bgColor, data.txColor);
  if(data.code == 200 || data.code == 201) {
    document.querySelector("#recipients").value = "";
    document.querySelector("#subject").value = "";
    document.querySelector("#email").value = "";

    if(data.code == 200){
      document.querySelector("#results").innerText = `Results:\n\nThe following recipients got mail delivered:\n${data.exists.join("\n")}\n\nThe following recipients were not found:\n${data.not_exists.join("\n")}`;
    }
  }
});

socket.on("fatal", () => {
  window.location.href = "/";
});
