let socket = io.connect();

let showDetails = (image, title, author, genre, isbn, return_date_epoch, type) => {
  // Load all data first before switching screens
  document.querySelector("#details-img").src = image;
  document.querySelector("#details-title").innerText = toTitleCase(title);
  document.querySelector("#details-author").innerHTML = `Author:<br>` + toTitleCase(author);
  document.querySelector("#details-genre").innerHTML = `Genre:<br>` + toTitleCase(genre);

  document.querySelector("#returning-modal-text").innerText = `Returning "${toTitleCase(title)}"`; 
  document.querySelector("#extending-modal-text").innerText = `Extending "${toTitleCase(title)}"`;

  document.querySelector("#details-title").setAttribute("isbn", isbn);

  if(type == "book"){
    document.querySelector("#return-date-text").classList.remove("hidden");
    document.querySelector("#return-date-text").classList.add("block");
    
    let return_date = new Date(return_date_epoch * 1000);
    let month = return_date.getMonth() + 1;
    let day = return_date.getDate();
    let year = return_date.getFullYear();
    document.querySelector("#return-date-text").style.color = ""; // Reset text color to defaults
    document.querySelector("#return-date-text").innerText = `This book is due on ${month}/${day}/${year}!`;

    if(return_date_epoch < Date.now() / 1000){
      document.querySelector("#return-date-text").style.color = "#bf180f";
      document.querySelector("#return-date-text").innerText += "\n\nThis book has been marked as overdue. Please return it as soon as possible.";
    }

    document.querySelector("#return-book-btn").classList.remove("hidden");
    document.querySelector("#return-book-btn").classList.add("inline-block");
    document.querySelector("#extend-book-btn").classList.remove("hidden");
    document.querySelector("#extend-book-btn").classList.add("inline-block");

    document.querySelector("#remove-wishlist-btn").classList.remove("inline-block");
    document.querySelector("#remove-wishlist-btn").classList.add("hidden");
  }else if(type == "wishlist"){
    document.querySelector("#return-date-text").classList.remove("block");
    document.querySelector("#return-date-text").classList.add("hidden");

    document.querySelector("#return-book-btn").classList.remove("inline-block");
    document.querySelector("#return-book-btn").classList.add("hidden");
    document.querySelector("#extend-book-btn").classList.remove("inline-block");
    document.querySelector("#extend-book-btn").classList.add("hidden");

    document.querySelector("#remove-wishlist-btn").classList.remove("hidden");
    document.querySelector("#remove-wishlist-btn").classList.add("inline-block");
  }

  // NOW we can switch screens :)
  document.querySelector("#books-screen").classList.remove("block");
  document.querySelector("#books-screen").classList.add("hidden");

  document.querySelector("#details-screen").classList.remove("hidden");
  document.querySelector("#details-screen").classList.add("block");
}

document.querySelector("#back-btn").addEventListener("click", () => {
  // Switch screens!
  document.querySelector("#books-screen").classList.remove("hidden");
  document.querySelector("#books-screen").classList.add("block");

  document.querySelector("#details-screen").classList.remove("block");
  document.querySelector("#details-screen").classList.add("hidden");

  // Unload all data
  document.querySelector("#details-img").src = "";
  document.querySelector("#details-title").innerText = "";
  document.querySelector("#details-author").innerHTML = `Author:<br>`;
  document.querySelector("#details-genre").innerHTML = `Genre:<br>`;

  document.querySelector("#returning-modal-text").innerText = `........`; 

  document.querySelector("#details-title").removeAttribute("isbn");
});

document.querySelector("#return-book-btn-final").addEventListener("click", () => {
  socket.emit("turn-in", {
    username: getCookie("username"),
    token: getCookie("token"),

    isbn: document.querySelector("#details-title").getAttribute("isbn"),

    stars: document.querySelector("#rating-dropdown-button").innerHTML.slice(0, 1),
    review: document.querySelector("#rating-input").value
  });
});

document.querySelector("#remove-wishlist-btn").addEventListener("click", () => {
  socket.emit("remove-wishlist", {
    username: getCookie("username"),
    token: getCookie("token"),

    isbn: document.querySelector("#details-title").getAttribute("isbn")
  });
});

document.querySelector("#extend-book-btn-final").addEventListener("click", () => {
  socket.emit("extend-return-date", {
    username: getCookie("username"),
    token: getCookie("token"),

    isbn: document.querySelector("#details-title").getAttribute("isbn"),
    return_date: document.querySelector("#datepicker").value
  });
});

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

  document.querySelector("#removable-notice-checked-out").remove();
  data.forEach((book) => {
    let checked_out_book_container = document.querySelector("#checked-out-book-container");

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
      showDetails(book.image, book.title, book.author, book.genre, book.isbn, book.return_date, "book");
    });

    checked_out_book_container.appendChild(book_div);
  });
});

socket.on("wishlist-results", (data) => {
  console.log(data);
  if(data.length == 0){
    document.querySelector("#removable-notice-wishlist").innerText = "You do not have any books in your wishlist.";
    return;
  }
  
  document.querySelector("#removable-notice-wishlist").remove();
  data.forEach((book) => {
    let wishlist_container = document.querySelector("#wishlist-container");

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
      showDetails(book.image, book.title, book.author, book.genre, book.isbn, null, "wishlist");
    });

    wishlist_container.appendChild(book_div);
  });
});

socket.on("modify-results", (data) => {
  createSnackbar(data.message, data.bgColor, data.txColor);
});

socket.on("fatal", () => {
  window.location.href = "/";
});

/*let socket = io.connect();

let showDetails = (image, title, author, genre, available, rating, reviews, isbn, type) => {
  document.querySelector("#details-img").src = image;
  document.querySelector("#details-title").innerText = toTitleCase(title);
  document.querySelector("#details-author").innerText = toTitleCase(author);
  document.querySelector("#details-genre").innerText = toTitleCase(genre);

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

  // document.querySelector("#rating-text").innerText = `Rating: ${rating} ${( rating == "1" ? "star" : "stars" )}`;
  // if(rating == "0") document.querySelector("#rating-text").innerText = "This book has no reviews yet. Be the first one!";


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

        isbn: document.querySelector("#details-title").getAttribute("isbn"),

        stars: document.querySelector("#user-rating").value,
        review: document.querySelector("#review-input").value
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
    
    span.innerText = toTitleCase(book.title);
    
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
    
    span.innerText = toTitleCase(book.title);
    
    div.appendChild(img);
    div.appendChild(span);
    
    div.addEventListener("click", () => {
      showDetails(book.image, book.title, book.author, book.genre, book.available, book.rating, book.reviews, book.isbn, "wishlist");
    });
    
    document.body.querySelector(".wishlist").appendChild(div);
    id++;
  });
});

socket.on("modify-results", (data) => {
  createSnackbar(data.message, data.bgColor, data.txColor);
});

socket.on("fatal", () => {
  window.location.href = "/";
});
*/