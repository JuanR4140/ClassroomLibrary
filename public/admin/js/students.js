socket = io.connect();
let finishedLoading = false;
let queryFinished = false;

socket.emit("admin-ping", {
  username: getCookie("username"),
  token: getCookie("token")
});

socket.on("admin-success", () => {
  document.querySelector("#export-to-xlsx-btn").addEventListener("click", () => {
    let table = document.querySelector(".student-table");
    TableToExcel.convert(table, {
      name: "Students.xlsx",
      sheet: {
        name: "Students"
      }
    })
  });

  socket.emit("admin-view-students", {
    username: getCookie("username"),
    token: getCookie("token")
  });
});

socket.on("admin-view-students-results", (data) => {
  lastResult = data.lastResult;
  finishedLoading = true;

  console.log(data.data.length);
  if(data.data.length == 0) {
    document.querySelector("#fetch-more-results-btn").remove();
    document.querySelector("#no-more-results").innerText = "No more results!";
    queryFinished = true;
    return;
  }else{
    document.querySelector("#no-more-results").innerText = "";
    document.querySelector("#fetch-more-results-btn").classList.remove("hidden");
    document.querySelector("#fetch-more-results-btn").classList.add("inline-block");
  
    // Sort the data in alphabetical order
    data.data.sort((a, b) => a.username.localeCompare(b.username));
    let table = document.querySelector(".student-table tbody");
    console.log(data);
    for(const user of data.data) {
      let tr = document.createElement("tr");
      let user_td = document.createElement("td");
      user_td.classList.add("name", "dark:text-white");
      user_td.innerText = user.username;
      user_td.addEventListener("click", () => {
        if(confirm(`Are you sure you want to delete student ${user.username}?\n\nThis action cannot be undone.`)) {
          socket.emit("admin-delete-student", {
            username: getCookie("username"),
            token: getCookie("token"),
            
            student: user.username
          });
        }
      });
      tr.appendChild(user_td);

      for(const book of user.books) {
        let checked_out = new Date(book.checked_out * 1000);
        let return_date = new Date(book.return_date * 1000);

        let title = toTitleCase(book.title);
        let isbn = book.isbn;
        let title_td = document.createElement("td");
        let checked_out_td = document.createElement("td");
        let return_date_td = document.createElement("td");

        title_td.innerText = title;
        title_td.setAttribute("isbn", isbn);
        title_td.classList.add("title", "dark:text-white");
        title_td.addEventListener("click", () => {
          if(confirm(`Are you sure you want to force return the book ${title} from student ${user.username}?`)) {
            socket.emit("admin-force-return-book", {
              username: getCookie("username"),
              token: getCookie("token"),

              student: user.username,
              isbn: isbn
            });
          }
        });

        checked_out_td.innerText = `${checked_out.getMonth() + 1}/${checked_out.getDate()}/${checked_out.getFullYear()}`;
        checked_out_td.classList.add("dark:text-white");

        return_date_td.innerText = `${return_date.getMonth() + 1}/${return_date.getDate()}/${return_date.getFullYear()}`;
        return_date_td.classList.add("dark:text-white");
        return_date_td.style = ( book.return_date < Date.now() / 1000 ? "background-color: red;" : "" );

        tr.appendChild(title_td);
        tr.appendChild(checked_out_td);
        tr.appendChild(return_date_td);
      }
      table.appendChild(tr);
    }
  }
});

window.addEventListener("scroll", () => {
  const content = document.querySelector(".student-table");
  // Only fetch more content when
  // a) the window scroll is further down than the book container's height
  // b) the query has finished loading (fetching and loading content)
  // c) the query itself hasn't finished (i.e a search returned one or more matches)
  if(window.innerHeight + window.scrollY >= content.offsetHeight && finishedLoading && !queryFinished){
    finishedLoading = false;
    document.querySelector("#no-more-results").innerText = "Fetching more results..";
    document.querySelector("#fetch-more-results-btn").classList.remove("inline-block");
    document.querySelector("#fetch-more-results-btn").classList.add("hidden");
    socket.emit("admin-view-students", {
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
    socket.emit("admin-view-students", {
      username: getCookie("username"),
      token: getCookie("token"),

      lastResult: lastResult
    });
  }
});

socket.on("admin-delete-student-result", (data) => {
  createSnackbar(data.msg, data.bgColor, data.txColor);
});

socket.on("admin-force-return-book-result", (data) => {
  createSnackbar(data.msg, data.bgColor, data.txColor);
});

socket.on("fatal", () => {
  window.location.href = "/";
});
