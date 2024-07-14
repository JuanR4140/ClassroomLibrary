socket = io.connect();
let lastResult;
let finishedLoading = false;
let queryFinished = false;

socket.emit("ping", {
  username: getCookie("username"),
  token: getCookie("token")
});

socket.on("success", (data) => {
  if(data.unread > 0){
    document.querySelector("#mail-unread-indicator").classList.remove("hidden");
    document.querySelector("#mail-unread-indicator").innerText = `${data.unread}`;
    document.querySelector("#mail-unread-indicator").classList.add("block");
  }

  socket.emit("get-all-books", {
    username: getCookie("username"),
    token: getCookie("token")
  });

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

socket.on("get-all-books-result", (data) => {
  lastResult = data.lastResult;
  finishedLoading = true;

  console.log(data);
  console.log(data.lastResult);
  console.log(data.results);

  if(data.results.length == 0){
    document.querySelector("#fetch-more-results-btn").remove();
    document.querySelector("#no-more-results").innerText = "No more results!";
    queryFinished = true;
    return;
  }

  document.querySelector("#fetch-more-results-btn").classList.remove("hidden");
  document.querySelector("#fetch-more-results-btn").classList.add("inline-block");

  document.querySelector("#no-more-results").innerText = "";

  data.results.forEach((book) => {
    let book_container = document.querySelector("#book-container");

    let book_div = document.createElement("div");
    let book_img = document.createElement("img");
    let book_br = document.createElement("br");
    let book_span = document.createElement("span");

    book_div.classList.add("h-48", "w-24", "shadow-2xl", "shadow-black", "shrink-0", "flex-wrap", "cursor-pointer", "flex", "justify-center", "items-center", "text-center");
    book_img.src = book.image;
    book_img.classList.add("h-48", "w-24", "mb-5");
    book_span.innerText = toTitleCase(book.title);
    book_span.classList.add("dark:text-white");

    book_div.appendChild(book_img);
    book_div.appendChild(book_br);
    book_div.appendChild(book_span);

    book_div.addEventListener("click", () => {
      // const encodedUrl = encodeURI(book.title.toLowerCase());
      // const link = `search?query=${encodedUrl}&filter=title`;
      // location.href = link;
      window.open(`/book?isbn=${book.isbn}`, '_blank').focus();
    });

    book_container.appendChild(book_div);
  });
});

window.addEventListener("scroll", () => {
  const content = document.querySelector("#book-container");
  // Only fetch more content when
  // a) the window scroll is further down than the book container's height
  // b) the query has finished loading (fetching and loading content)
  // c) the query itself hasn't finished (i.e a search returned one or more matches)
  if(window.innerHeight + window.scrollY >= content.offsetHeight && finishedLoading && !queryFinished){
    finishedLoading = false;
    document.querySelector("#no-more-results").innerText = "Fetching more results..";
    document.querySelector("#fetch-more-results-btn").classList.remove("inline-block");
    document.querySelector("#fetch-more-results-btn").classList.add("hidden");
    socket.emit("get-all-books", {
      username: getCookie("username"),
      token: getCookie("token"),

      lastResult: lastResult
    });
  }
});

document.querySelector("#fetch-more-results-btn").addEventListener("click", () => {
  if(finishedLoading && !queryFinished){
    finishedLoading = false;
    document.querySelector("#no-more-results").innerText = "Fetching more results..";
    document.querySelector("#fetch-more-results-btn").classList.remove("inline-block");
    document.querySelector("#fetch-more-results-btn").classList.add("hidden");
    socket.emit("get-all-books", {
      username: getCookie("username"),
      token: getCookie("token"),

      lastResult: lastResult
    });
  }
});

