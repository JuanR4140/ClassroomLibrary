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

  socket.emit("get-teacher-picks", {
    username: getCookie("username"),
    token: getCookie("token")
  });

  socket.emit("get-new-acquires", {
    username: getCookie("username"),
    token: getCookie("token")
  });

});

socket.on("get-teacher-picks-result", (data) => {
  console.log(data);
  if(data.results.length == 0){
    document.querySelector("#teacher-picks-text").innerText = "There are no books in the teacher's picks. Check back later!";
  }else{
    document.querySelector("#teacher-picks-text").remove();
  }
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
      // location.href = book.link;
      location.href = `/book?isbn=${book.isbn}`;
    });

    book_container.appendChild(book_div);
      
  });
});

socket.on("get-new-acquires-result", (data) => {
  console.log(data);
  if(data.results.length == 0){
    document.querySelector("#new-acquires-text").innerText = "There are no new books. Check back later!";
  }else{
    document.querySelector("#new-acquires-text").remove();
  }
  data.results.forEach((book) => {
    let book_container = document.querySelector("#new-acquires-book-container");
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
      location.href = `/book?isbn=${book.isbn}`;
    });

    book_container.appendChild(book_div);
  });
});

socket.on("fatal", () => {
  window.location.href = "/";
});
