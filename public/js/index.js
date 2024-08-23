let socket = io.connect();

document.querySelector("#log-in-btn").addEventListener("click", () => {
  let email = document.querySelector("#log-in-email").value;
  let password = document.querySelector("#log-in-password").value;
  socket.emit("sign-in", {
    email: email,
    password: password,

    action: "log-in",
  });
});

document.querySelector("#sign-up-btn").addEventListener("click", () => {
  let email = document.querySelector("#sign-up-email").value;
  let password = document.querySelector("#sign-up-password").value;
  let password_confirm = document.querySelector("#sign-up-password-confirm").value;
  if(!passwordsMatch(password, password_confirm)){
    createSnackbar("Passwords don't match!", "#FF5555", "#FFFFFF");
    return;
  }
  socket.emit("sign-in", {
    email: email,
    password: password,

    action: "sign-up",
  });
});

let passwordsMatch = (password, password_confirm) => {
  return password === password_confirm;
}

document.querySelector("#log-in-tab").addEventListener("click", () => {
    document.querySelector("#log-in-tab").classList.remove("hover:text-gray-600", "hover:bg-gray-50", "dark:hover:bg-gray-800", "dark:hover:text-gray-300");
    document.querySelector("#log-in-tab").classList.add("text-blue-600", "bg-gray-100", "active", "dark:bg-gray-800", "dark:text-blue-500");
    document.querySelector("#sign-up-tab").classList.add("hover:text-gray-600", "hover:bg-gray-50", "dark:hover:bg-gray-800", "dark:hover:text-gray-300");
    document.querySelector("#sign-up-tab").classList.remove("text-blue-600", "bg-gray-100", "active", "dark:bg-gray-800", "dark:text-blue-500");

    document.querySelector("#log-in-content").classList.add("block");
    document.querySelector("#log-in-content").classList.remove("hidden");
    document.querySelector("#sign-up-content").classList.add("hidden");
    document.querySelector("#sign-up-content").classList.remove("block");
});

document.querySelector("#sign-up-tab").addEventListener("click", () => {
document.querySelector("#sign-up-tab").classList.remove("hover:text-gray-600", "hover:bg-gray-50", "dark:hover:bg-gray-800", "dark:hover:text-gray-300");
    document.querySelector("#sign-up-tab").classList.add("text-blue-600", "bg-gray-100", "active", "dark:bg-gray-800", "dark:text-blue-500");
    document.querySelector("#log-in-tab").classList.add("hover:text-gray-600", "hover:bg-gray-50", "dark:hover:bg-gray-800", "dark:hover:text-gray-300");
    document.querySelector("#log-in-tab").classList.remove("text-blue-600", "bg-gray-100", "active", "dark:bg-gray-800", "dark:text-blue-500");

    document.querySelector("#sign-up-content").classList.add("block");
    document.querySelector("#sign-up-content").classList.remove("hidden");
    document.querySelector("#log-in-content").classList.add("hidden");
    document.querySelector("#log-in-content").classList.remove("block");
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
    if(document.querySelector("#log-in-content").classList.contains("block")){
      let email = document.querySelector("#log-in-email").value;
      let password = document.querySelector("#log-in-password").value;
      socket.emit("sign-in", {
        email: email,
        password: password,

        action: "log-in",
      });
    }else{
      let email = document.querySelector("#sign-up-email").value;
      let password = document.querySelector("#sign-up-password").value;
      let password_confirm = document.querySelector("#sign-up-password-confirm").value;
      if(!passwordsMatch(password, password_confirm)){
        createSnackbar("Passwords don't match!", "#FF5555", "#FFFFFF");
        return;
      }

      socket.emit("sign-in", {
        email: email,
        password: password,

        action: "sign-up",
      });
    }
  }
});
