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

  document.querySelector("#toggle-pin-status-btn").addEventListener("click", () => {
      socket.emit("admin-set-pin-status", {
          username: getCookie("username"),
          token: getCookie("token"),

          action: "toggle"
      });
  });

  document.querySelector("#get-new-pin-btn").addEventListener("click", () => {
      socket.emit("admin-set-pin-status", {
          username: getCookie("username"),
          token: getCookie("token"),

          action: "refresh"
      });
  });

  socket.emit("admin-get-teacher-picks", {
      username: getCookie("username"),
      token: getCookie("token")
  });

  socket.emit("admin-get-pin-status", {
      username: getCookie("username"),
      token: getCookie("token")
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

socket.on("admin-get-teacher-picks-result", (data) => {
    console.log(data);
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

        book_div.setAttribute("id", `isbn-${book.isbn}`);

        book_div.addEventListener("click", () => {
            if(confirm(`Are you sure you want to remove the book "${toTitleCase(book.title)}" from Teacher's Picks?`)){
                socket.emit("admin-remove-from-teacher-picks", {
                    username: getCookie("username"),
                    token: getCookie("token"),

                    isbn: book.isbn
                });
                document.querySelector(`#isbn-${book.isbn}`).remove();
            }
        });

        book_container.appendChild(book_div);
    });

});

socket.on("admin-remove-from-teacher-picks-result", (data) => {
    createSnackbar(data.msg, data.bgColor, data.txColor);
});

socket.on("admin-get-pin-status-result", (data) => {
    console.log(data);
    document.querySelector("#pin").innerText = `Pin: ${data.pin}`;
    document.querySelector("#pin-status").innerText = `Status: ${( data.enabled ? "On" : "Off" )}`;
});

socket.on("fatal", () => {
  window.location.href = "/";
});
