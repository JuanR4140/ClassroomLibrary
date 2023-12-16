let socket = io.connect();
let params = {};

let showDetails = (image, title, author, genre, available, reviews, isbn) => {
  document.querySelector("#details-img").src = image;
  document.querySelector("#details-title").innerText = toTitleCase(title);
  document.querySelector("#details-author").innerText = toTitleCase(author);
  document.querySelector("#details-genre").innerText = toTitleCase(genre);

  document.querySelector("#details-title").setAttribute("isbn", isbn);

  if(available){
    document.querySelector("#available-text").innerText = "This book is available to check out!";
    document.querySelector("#action-btn").value = "Check Out";
  }else{
    document.querySelector("#available-text").innerText = "This book is currently checked out..";
    document.querySelector("#action-btn").value = "Add To Wishlist";
  }

/*   document.querySelector("#rating-text").innerText = `Rating: ${rating} ${( rating == "1" ? "star" : "stars" )}`;
  if(rating == "0") document.querySelector("#rating-text").innerText = "This book has no reviews yet. Be the first one!";
 */

  let sum = 0;
  let len = 0;

  for(const [key, value] of Object.entries(reviews)){
    // console.log(`${key} -> ${value}`);
    let div = document.createElement("div");
    let h4 = document.createElement("h4");
    div.classList.add("review");

    h4.innerText = `${key} rated ${value.rating} ${( value.rating == 1 ? "star" : "stars")}: ${value.review}`;
    sum += parseFloat(value.rating);
    len++;
    div.appendChild(h4);
    document.querySelector(".reviews").appendChild(div);
  }

  if(len != 0){
    document.querySelector("#rating-text").innerText = `Average Rating: ${sum / len}`;
  }else{
    document.querySelector("#rating-text").innerText = `This book has no reviews yet. Be the first one!`;
  }

  document.querySelector(".cover").style.display = "block";
  document.querySelector(".details").style.display = "block";

  document.querySelector("#search-result-text").style.display = "none";
  document.querySelector("#search-result-amnt").style.display = "none";
  document.querySelector(".books").style.display = "none";
}

document.querySelector("#back-btn").addEventListener("click", () => {
  document.querySelector("#details-img").src = "";
  document.querySelector("#details-title").innerText = "";
  document.querySelector("#details-author").innerText = "";
  document.querySelector("#details-genre").innerText = "";

  document.querySelector("#details-title").removeAttribute("isbn");

  document.querySelector("#available-text").innerText = "";
  document.querySelector("#action-btn").value = "";

  document.querySelector("#rating-text").innerText = "";

  document.querySelector(".reviews").innerHTML = "";

  document.querySelector(".cover").style.display = "none";
  document.querySelector(".details").style.display = "none";

  document.querySelector("#search-result-text").style.display = "block";
  document.querySelector("#search-result-amnt").style.display = "block";
  document.querySelector(".books").style.display = "flex";
});

socket.emit("ping", {
  username: getCookie("username"),
  token: getCookie("token")
});

socket.on("success", () => {
  const urlParams = new URLSearchParams(location.search);
  for(const [key, value] of urlParams){
    params[key] = value;
  }
  socket.emit("search-query", {
    username: getCookie("username"),
    token: getCookie("token"),

    query: params.query,
    filter: params.filter
  });
});

socket.on("search-query-results", (data) => {
  console.log(data);
  document.querySelector("#search-result-text").innerText = `Results for ${params.filter} "${params.query}"`;
  document.querySelector("#search-result-amnt").innerText = `Fetched ${data.length} ${(data.length == 1 ? "book" : "books" )}`;

  if(data.length == 0) return;
  
  let id = 0;
  data.forEach((book) => {
    let div = document.createElement("div");
    let img = document.createElement("img");
    let span = document.createElement("span");
    
    div.setAttribute("id", id.toString());
    div.classList.add("book");

    img.src = book.image;

    span.innerText = toTitleCase(book.title);

    div.appendChild(img);
    div.appendChild(span);

    div.addEventListener("click", () => {
      showDetails(book.image, book.title, book.author, book.genre, book.available, book.reviews, book.isbn);
    });

    document.body.querySelector(".books").appendChild(div);
    id++;
  });
});

document.querySelector("#action-btn").addEventListener("click", () => {
  let action = document.querySelector("#action-btn").value;
  switch(action){
    case "Check Out":{
      socket.emit("check-out", {
        username: getCookie("username"),
        token: getCookie("token"),

        isbn: document.querySelector("#details-title").getAttribute("isbn")
      });
      break;
    }
    case "Add To Wishlist":{
      socket.emit("add-wishlist", {
        username: getCookie("username"),
        token: getCookie("token"),

        isbn: document.querySelector("#details-title").getAttribute("isbn")
      });
      break;
    }
    default:{
      createSnackbar(`Could not perform action: ${action}`, "#FF5555", "#FFFFFF");
      break;
    }
  }
});

socket.on("check-out-result", (data) => {
  createSnackbar(data.message, data.bgColor, data.txColor);
});

socket.on("add-wishlist-result", (data) => {
  createSnackbar(data.message, data.bgColor, data.txColor);
});

socket.on("fatal", () => {
  window.location.href = "/";
});