socket = io.connect();

socket.emit("ping", {
  username: getCookie("username"),
  token: getCookie("token")
});

socket.on("success", () => {
  createSnackbar("Success!", "#55FF55", "#000000");
});

socket.on("fatal", () => {
  createSnackbar("Failed.", "#FF5555", "#FFFFFF");
  window.location.href = "/";
});

document.querySelector("#search-button").addEventListener("click", (e) => {
  e.preventDefault();
  let url = "";

  if(document.querySelector("#dropdown-button").innerHTML.includes("Genre")){
    url = `search?query=${document.querySelector("#dropdown-genre-button").innerHTML.split(" ")[0].toLowerCase()}&filter=genre`;
  }else{
    url = `search?query=${document.querySelector("#search-dropdown").value}&filter=${document.querySelector("#dropdown-button").innerHTML.split(" ")[0].toLowerCase()}`;
  }

  const encodedUrl = encodeURI(url);
  window.location.href = encodedUrl;

});

/*document.querySelector("#filter").addEventListener("change", () => {
  document.querySelector("#search-bar").placeholder = `Enter ${document.querySelector("#filter").value.replace("-", " ")}..`
});

document.querySelector("#search-btn").addEventListener("click", () => {
  let url = "";

  if(document.querySelector("#filter").value == "genre"){
    url = `search?query=${document.querySelector("#genre").value}&filter=${document.querySelector("#filter").value}`;
  }else{
    url = `search?query=${document.querySelector("#search-bar").value}&filter=${document.querySelector("#filter").value}`;
  }

  const encodedUrl = encodeURI(url);
  window.location.href = encodedUrl;

});*/
