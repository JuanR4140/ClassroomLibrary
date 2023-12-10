let socket = io.connect();

let showDetails = (image, title, author, genre, available, rating, reviews, isbn, type) => {
  document.querySelector("#details-img").src = image;
  document.querySelector("#details-title").innerText = title;
  document.querySelector("#details-author").innerText = author;
  document.querySelector("#details-genre").innerText = genre;

  document.querySelector("#details-title").setAttribute("isbn", isbn);
  document.querySelector("#details-title").setAttribute("type", type);

  switch(type){
    case "book":{
      document.querySelector("#action-btn").value = "Turn In"
      break;
    }
    case "wishlist":{
      document.querySelector("#action-btn").value = "Remove From Wishlist"
      break;
    }
    default:{
      break;
    }
  }

  /*if(available){
    document.querySelector("#available-text").innerText = "This book is available to check out!";
    document.querySelector("#action-btn").value = "Check Out";
  }else{
    document.querySelector("#available-text").innerText = "This book is currently checked out..";
    document.querySelector("#action-btn").value = "Add To Wishlist";
  }*/

  // document.querySelector("#rating-text").innerText = `Rating: ${rating} ${( rating == "1" ? "star" : "stars" )}`;
  // if(rating == "0") document.querySelector("#rating-text").innerText = "This book has no reviews yet. Be the first one!";
  
  /*for(const [key, value] of Object.entries(reviews)){
    // console.log(`${key} -> ${value}`);
    let div = document.createElement("div");
    let h4 = document.createElement("h4");
    div.classList.add("review");

    h4.innerText = `${key} rated ${value.rating} ${( value.rating == 1 ? "star" : "stars")}: ${value.review}`;
    div.appendChild(h4);
    document.querySelector(".reviews").appendChild(div);
  }*/

  document.querySelector(".cover").style.display = "block";
  document.querySelector(".details").style.display = "block";

  document.querySelector("#my-wishlist").style.display = "none";
  // document.querySelector("#removable-notice-checked-out").style.display = "none";
  document.querySelector("#my-books").style.display = "none";
  // document.querySelector("#removable-notice-wishlist").style.display = "none";
  document.querySelector(".wishlist").style.display = "none";
  document.querySelector(".books").style.display = "none";
}

document.querySelector("#back-btn").addEventListener("click", () => {
  document.querySelector("#details-img").src = "";
  document.querySelector("#details-title").innerText = "";
  document.querySelector("#details-author").innerText = "";
  document.querySelector("#details-genre").innerText = "";

  document.querySelector("#details-title").removeAttribute("isbn");

  // document.querySelector("#available-text").innerText = "";
  document.querySelector("#action-btn").value = "";

  // document.querySelector("#rating-text").innerText = "";

  // document.querySelector(".reviews").innerHTML = "";

  document.querySelector(".cover").style.display = "none";
  document.querySelector(".details").style.display = "none";

  document.querySelector("#my-books").style.display = "block";
  // document.querySelector("#removable-notice-checked-out").style.display = "block";
  document.querySelector("#my-wishlist").style.display = "block";
  // document.querySelector("#removable-notice-wishlist").style.display = "block";
  document.querySelector(".wishlist").style.display = "flex";
  document.querySelector(".books").style.display = "flex";
});

document.querySelector("#action-btn").addEventListener("click", () => {
  let action = document.querySelector("#action-btn").value;
  switch(action){
    case "Turn In":{
      socket.emit("turn-in", {
        username: getCookie("username"),
        token: getCookie("token"),

        isbn: document.querySelector("#details-title").getAttribute("isbn")
      });
      break;
    }
    case "Remove From Wishlist":{
      socket.emit("remove-wishlist", {
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

socket.emit("ping", {
  username: getCookie("username"),
  token: getCookie("token")
});

socket.on("success", () => {
  socket.emit("get-checked-out-books", {
    username: getCookie("username"),
    token: getCookie("token")
  });
  socket.emit("get-wishlist", {
    username: getCookie("username"),
    token: getCookie("token")
  });
});

socket.on("checked-out-books-results", (data) => {
  console.log(data);
  if(data.length == 0){
    document.querySelector("#removable-notice-checked-out").innerText = "You do not have any books checked out.";
    return;
  }
  let id = 0;

  document.querySelector("#removable-notice-checked-out").remove();
  data.forEach((book) => {
    let div = document.createElement("div");
    let img = document.createElement("img");
    let span = document.createElement("span");
    
    div.setAttribute("id", book.isbn);
    div.classList.add("book");
    
    img.src = book.image;
    
    span.innerText = book.title;
    
    div.appendChild(img);
    div.appendChild(span);
    
    div.addEventListener("click", () => {
      showDetails(book.image, book.title, book.author, book.genre, book.available, book.rating, book.reviews, book.isbn, "book");
    });

    document.body.querySelector(".books").appendChild(div);
    id++;
  });
});

socket.on("wishlist-results", (data) => {
  console.log(data);
  if(data.length == 0){
    document.querySelector("#removable-notice-wishlist").innerText = "You do not have any books on your wishlist.";
    return;
  }
  let id = 0;
  
  document.querySelector("#removable-notice-wishlist").remove();
  data.forEach((book) => {
    let div = document.createElement("div");
    let img = document.createElement("img");
    let span = document.createElement("span");

    if(book == null || book == undefined){
      div.setAttribute("id", 0);
      div.classList.add("book");
      span.innerText = "Error!";
      div.appendChild(img);
      div.appendChild(span);
      document.body.querySelector(".wishlist").appendChild(div);
      return;
    }
    
    div.setAttribute("id", book.isbn);
    div.classList.add("book");
    
    img.src = book.image;
    
    span.innerText = book.title;
    
    div.appendChild(img);
    div.appendChild(span);
    
    div.addEventListener("click", () => {
      showDetails(book.image, book.title, book.author, book.genre, book.available, book.rating, book.reviews, book.isbn, "wishlist");
    });
    
    document.body.querySelector(".wishlist").appendChild(div);
    id++;
  });
});

socket.on("fatal", () => {
  window.location.href = "/";
});