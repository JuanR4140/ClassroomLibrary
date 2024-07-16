let socket = io.connect();

let showDetails = (title, message, id) => {
  // Load all data first before switching screens
  document.querySelector("#details-title").innerText = title;
  // Replace newlines with <br>
  message = message.replace(/\n/g, "<br>");
  document.querySelector("#details-message").innerHTML = message;

  document.querySelector("#details-title").setAttribute("identifier", id);

    // NOW we can switch screens :)
  document.querySelector("#inbox-menu").classList.remove("block");
  document.querySelector("#inbox-menu").classList.add("hidden");

  document.querySelector("#inbox-details").classList.remove("hidden");
  document.querySelector("#inbox-details").classList.add("block");
}

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

    socket.emit("get-mail", {
        username: getCookie("username"),
        token: getCookie("token")
    });

});

socket.on("get-mail-results", (data) => {
    console.log(data);
    if(data.length == 0){
        document.querySelector("#removable-notice").innerText = "You have no mail!";
        return;
    }

    document.querySelector("#removable-notice").remove();

    data.forEach(mail => {
        console.log(mail);
        let mail_root_div = document.querySelector("#mail-root-div");

        let mail_div = document.createElement("div");
        let mail_title = document.createElement("h1");
        let mail_author = document.createElement("h1");
        let mail_date = document.createElement("h1");
        let mail_break = document.createElement("br");

        mail_div.classList.add("w-full", "p-4", "border-4", "rounded-md", "border-black", "dark:border-slate-500", "bg-slate-200", "dark:bg-gray-700", "cursor-pointer");
        
        mail_title.classList.add("text-xl", "underline");
        if(mail.unread){
            mail_title.classList.add("text-sky-500", "dark:text-sky-600", "font-bold");
        }else{
            mail_title.classList.add("dark:text-white");
        }
        mail_title.innerText = mail.title;

        mail_author.classList.add("text-lg", "dark:text-white");
        mail_author.innerText = `FROM ${mail.author}`;

        mail_date.classList.add("text-md", "dark:text-white");

        let date = new Date(mail.date * 1000);
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let year = date.getFullYear();
        mail_date.innerText = `${month}/${day}/${year}`;

        mail_div.appendChild(mail_title);
        mail_div.appendChild(mail_author);
        mail_div.appendChild(mail_date);

        mail_div.setAttribute("id", `mail-id-${mail.id}`);
        mail_break.setAttribute("id", `mail-id-${mail.id}-br`);

        mail_root_div.appendChild(mail_break);

        mail_div.addEventListener("click", () => {
            showDetails(mail.title, mail.message, mail.id);

            if(mail.unread){

                socket.emit("mark-read", {
                    username: getCookie("username"),
                    token: getCookie("token"),

                    id: mail.id
                });

                mail_title.classList.remove("text-sky-500", "dark:text-sky-600", "font-bold");
                mail_title.classList.add("dark:text-white");

                let unread_indicator_value = document.querySelector("#mail-unread-indicator").innerText;
                unread_indicator_value = parseInt(unread_indicator_value);
                unread_indicator_value--;
                if(unread_indicator_value <= 0){
                    document.querySelector("#mail-unread-indicator").classList.remove("block");
                    document.querySelector("#mail-unread-indicator").classList.add("hidden");
                }else{
                    document.querySelector("#mail-unread-indicator").innerText = `${unread_indicator_value}`;
                }

            }

        });

        mail_root_div.appendChild(mail_div);

    });

});

document.querySelector("#back-btn").addEventListener("click", () => {
  // Switch screens!
  document.querySelector("#inbox-menu").classList.remove("hidden");
  document.querySelector("#inbox-menu").classList.add("block");

  document.querySelector("#inbox-details").classList.remove("block");
  document.querySelector("#inbox-details").classList.add("hidden");

  // Unload all data
  document.querySelector("#details-title").innerText = "";
  document.querySelector("#details-message").innerHTML = "";

  document.querySelector("#details-title").removeAttribute("identifier");
});

document.querySelector("#delete-mail-btn").addEventListener("click", () => {
    socket.emit("delete-mail", {
        username: getCookie("username"),
        token: getCookie("token"),

        id: document.querySelector("#details-title").getAttribute("identifier")
    });
    document.querySelector(`#mail-id-${document.querySelector("#details-title").getAttribute("identifier")}`).remove();
    document.querySelector(`#mail-id-${document.querySelector("#details-title").getAttribute("identifier")}-br`).remove();
    document.querySelector("#back-btn").click();
});

socket.on("delete-mail-results", (data) => {
    createSnackbar(data.message, data.bgColor, data.txColor);
});

socket.on("fatal", () => {
    location.href = "/";
})

/*socket.on("checked-out-books-results", (data) => {
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
  });*/
