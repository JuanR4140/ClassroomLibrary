socket = io.connect();
let finishedLoading = false;
let queryFinished = false;

socket.emit("admin-ping", {
  username: getCookie("username"),
  token: getCookie("token")
});

let showDetails = (image, title, author, genre, available, reviews, isbn) => {
  // Load all data first before switching screens
  document.querySelector("#details-img").src = image;
  document.querySelector("#details-title").innerText = toTitleCase(title);
  document.querySelector("#details-author").innerHTML = `Author:<br>` + toTitleCase(author);
  document.querySelector("#details-genre").innerHTML = `Genre:<br>` + toTitleCase(genre);

  document.querySelector("#details-title").setAttribute("isbn", isbn);

  // Maybe add available stock number?

  const ratings_count = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  }

  let sum = 0;
  let len = 0;

  let root_reviews_div = document.querySelector("#root-reviews-div");
  for(const [key, value] of Object.entries(reviews)){

    let stars_div = document.createElement("div");
    stars_div.classList.add("flex", "items-center");
    let star_svg_icons = [];
    for(let i = 0; i < 5; i++){
      star_svg_icons[i] = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      star_svg_icons[i].classList.add("w-4", "h-4", "me-1", "text-gray-300", "dark:text-gray-500");
      star_svg_icons[i].setAttribute("aria-hidden", "true");
      star_svg_icons[i].setAttribute("xmlns", "http://www.w3.org/2000/svg");
      star_svg_icons[i].setAttribute("fill", "currentColor");
      star_svg_icons[i].setAttribute("viewBox", "0 0 22 20");

      let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttributeNS(null, "d", "M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z");

      star_svg_icons[i].appendChild(path);

      stars_div.appendChild(star_svg_icons[i]);

      root_reviews_div.appendChild(stars_div);
    }

    let pre_colored_stars = stars_div.querySelectorAll("svg");
    for(let i = 0; i < value.rating; i++){
      pre_colored_stars[i].classList.remove("text-gray-300", "dark:text-gray-500")
      pre_colored_stars[i].classList.add("text-yellow-300");
    }

    let username = document.createElement("h1");
    let review = document.createElement("h1");
    let delete_review_btn = document.createElement("button");
    let br = document.createElement("br");
    username.classList.add("text-md", "dark:text-white", "mb-2", "mt-2");
    username.innerText = key;
    review.classList.add("text-sm", "dark:text-white");
    review.innerText = value.review;
    delete_review_btn.classList.add("cursor-pointer", "focus:outline-none", "text-white", "bg-red-700", "hover:bg-red-800", "focus:ring-4", "focus:ring-red-300", "font-medium", "rounded-lg", "text-sm", "px-5", "py-2.5", "me-2", "mb-2", "dark:bg-red-600", "dark:hover:bg-red-700", "dark:focus:ring-red-900");
    delete_review_btn.innerText = "Delete this review";
    delete_review_btn.addEventListener("click", () => {
      socket.emit("admin-delete-book-review", {
        username: getCookie("username"),
        token: getCookie("token"),

        isbn: document.querySelector("#details-title").getAttribute("isbn"),
        user: key
      });
    });

    root_reviews_div.appendChild(username);
    root_reviews_div.appendChild(review);
    root_reviews_div.appendChild(document.createElement("br"));
    root_reviews_div.appendChild(delete_review_btn);
    root_reviews_div.appendChild(br);
    root_reviews_div.appendChild(document.createElement("br"));

    ratings_count[value.rating]++;
    sum += parseFloat(value.rating);
    len++;
  }

  if(len != 0){
    console.log(`Average rating: ${Math.floor(sum / len)}`);
  }else{
    console.log("No reviews!");
    let notice = document.createElement("h1");
    notice.innerText = "No reviews :(";
    notice.classList.add("text-md", "dark:text-white");
    root_reviews_div.appendChild(notice);
  }

  const percentages = {};
  for(let i = 1; i <= 5; i++){
    percentages[i] = ((ratings_count[i] / len) * 100).toFixed(2) + '%';
    percentages[i] = ( percentages[i] == "NaN%" ? "0%" : percentages[i] );

    document.querySelector(`#bar-${6 - i}`).style.width = percentages[i];
    document.querySelector(`#number-${6 - i}`).innerText = percentages[i];
  }

  let total_ratings = document.querySelector("#total-ratings").querySelectorAll("svg");
  for(let i = 0; i < 5; i++){
    total_ratings[i].classList.remove("text-yellow-300");
    total_ratings[i].classList.add("text-gray-300", "dark:text-gray-500");
  }
  for(let i = 0; i < Math.floor(sum / len); i++){
    total_ratings[i].classList.remove("text-gray-300", "dark:text-gray-500");
    total_ratings[i].classList.add("text-yellow-300")
  }

  document.querySelector("#total-ratings-text").innerText = `${sum / len} out of 5`;
  if(!len) document.querySelector("#total-ratings-text").innerText = `No reviews :(`;
  document.querySelector("#total-ratings-2-text").innerText = `${numberWithCommas(len)} total reviews!`;

  // NOW we can switch screens :)
  document.querySelector("#main").classList.remove("block");
  document.querySelector("#main").classList.add("hidden");

  document.querySelector("#details-screen").classList.remove("hidden");
  document.querySelector("#details-screen").classList.add("block");
}

document.querySelector("#back-btn").addEventListener("click", () => {
  // Switch screens!
  document.querySelector("#main").classList.remove("hidden");
  document.querySelector("#main").classList.add("block");

  document.querySelector("#details-screen").classList.remove("block");
  document.querySelector("#details-screen").classList.add("hidden");

  // Unload all data
  document.querySelector("#details-img").src = "";
  document.querySelector("#details-title").innerText = "";
  document.querySelector("#details-author").innerHTML = `Author:<br>`;
  document.querySelector("#details-genre").innerHTML = `Genre:<br>`;

  document.querySelector("#checking-out-modal-text").innerText = `........`; 

  document.querySelector("#details-title").removeAttribute("isbn");

  let reviews = document.querySelector("#root-reviews-div");
  while(reviews.firstChild){
    reviews.removeChild(reviews.lastChild);
  }
});

socket.on("admin-success", () => {
  socket.emit("admin-get-all-books", {
    username: getCookie("username"),
    token: getCookie("token")
  });
});

socket.on("admin-get-all-books-results", (data) => {
  lastResult = data.lastResult;
  finishedLoading = true;   // query result finished

  console.log(data);
  console.log(data.lastResult);
  console.log(data.results);
  if(data.results.length == 0){
    document.querySelector("#fetch-more-results-btn").remove();
    document.querySelector("#no-more-results").innerText = "No more results!";
    queryFinished = true;
    return;
  }else{
    document.querySelector("#book-container").innerHTML = "";
    document.querySelector("#no-more-results").innerText = "";
    document.querySelector("#fetch-more-results-btn").classList.remove("hidden");
    document.querySelector("#fetch-more-results-btn").classList.add("inline-block");

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
        showDetails(book.image, book.title, book.author, book.genre, book.available, book.reviews, book.isbn);
      });

      book_container.appendChild(book_div);
    });
  }
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
    socket.emit("admin-get-all-books", {
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
    socket.emit("admin-get-all-books", {
      username: getCookie("username"),
      token: getCookie("token"),

      lastResult: lastResult
    });
  }
});

document.querySelector("#remove-book-btn-final").addEventListener("click", () => {
  socket.emit("admin-remove-book", {
    username: getCookie("username"),
    token: getCookie("token"),

    isbn: document.querySelector("#details-title").getAttribute("isbn")
  });
});

socket.on("admin-remove-book-result", (data) => {
  createSnackbar(data.msg, data.bgColor, data.txColor);
});

socket.on("admin-delete-book-review-result", (data) => {
  createSnackbar(data.msg, data.bgColor, data.txColor);
});

document.querySelector("#add-book-screen-btn").addEventListener("click", () => {
  document.querySelector("#add-book-screen").classList.remove("hidden");
  document.querySelector("#add-book-screen").classList.add("block");

  document.querySelector("#main").classList.remove("block");
  document.querySelector("#main").classList.add("hidden");
});

document.querySelector("#add-book-back-btn").addEventListener("click", () => {
  document.querySelector("#main").classList.remove("hidden");
  document.querySelector("#main").classList.add("block");

  document.querySelector("#add-book-screen").classList.remove("block");
  document.querySelector("#add-book-screen").classList.add("hidden");
});

document.querySelector("#add-book-btn-final").addEventListener("click", () => {

  const image = document.querySelector("#add-book-img");
  console.log(image.width);
  console.log(image.height);
  image.setAttribute("crossorigin", "anonymous"); // Keep an eye on how this affects the website

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0, image.width, image.height);
  const bytes = canvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "");

  socket.emit("admin-add-book", {
    username: getCookie("username"),
    token: getCookie("token"),

    isbn: document.querySelector("#add-book-title").getAttribute("isbn"),
    title: document.querySelector("#add-book-title").innerText,
    author: document.querySelector("#add-book-author").innerText,
    genre: document.querySelector("#dropdown-genre-button").innerText,
    cover: bytes
  });
});

socket.on("admin-add-book-result", (data) => {
  createSnackbar(data.msg, data.bgColor, data.txColor);
});

socket.on("fatal", () => {
  window.location.href = "/";
});
