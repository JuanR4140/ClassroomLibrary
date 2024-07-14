let socket = io.connect();
let params = {};

let showDetails = (image, title, author, genre, available, reviews, isbn) => {

  // Reset form confirmation modal screen
  document.querySelector("#check-out-form").classList.add("inline-block");
  document.querySelector("#check-out-form").classList.remove("hidden");

  document.querySelector("#check-out-confirmation").classList.add("hidden");
  document.querySelector("#check-out-confirmation").classList.remove("inline-block");

  // Load all data first before switching screens
  document.querySelector("#details-img").src = image;
  document.querySelector("#details-title").innerText = toTitleCase(title);
  document.querySelector("#details-author").innerHTML = `Author:<br>` + toTitleCase(author);
  document.querySelector("#details-genre").innerHTML = `Genre:<br>` + toTitleCase(genre);

  document.querySelector("#checking-out-modal-text").innerText = `Checking out "${toTitleCase(title)}"`; 

  document.querySelector("#details-title").setAttribute("isbn", isbn);

  if(available){
    document.querySelector("#check-out-btn").classList.remove("hidden");
    document.querySelector("#check-out-btn").classList.add("inline-block");
  }else{
    document.querySelector("#check-out-btn").classList.remove("inline-block");
    document.querySelector("#check-out-btn").classList.add("hidden");
  }

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
    let br = document.createElement("br");
    username.classList.add("text-md", "dark:text-white", "mb-2", "mt-2");
    username.innerText = key;
    review.classList.add("text-sm", "dark:text-white");
    review.innerText = value.review;

    root_reviews_div.appendChild(username);
    root_reviews_div.appendChild(review);
    root_reviews_div.appendChild(br);

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

  const urlParams = new URLSearchParams(location.search);
  for(const [key, value] of urlParams){
    params[key] = value;
  }
  socket.emit("get-book-details", {
    username: getCookie("username"),
    token: getCookie("token"),

    isbn: params.isbn
  });
});

socket.on("get-book-details-result", (data) => {
    if(data.code == 200){
        let details = data.details;
        showDetails(details.image, details.title, details.author, details.genre, details.available, details.reviews, details.isbn);
    }else{
        location.href = "/home";
    }
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

document.querySelector("#check-out-btn-final").addEventListener("click", () => {
  // Spooky QR Code generation stuff goes here

  if(!document.querySelector("#datepicker").value){
    createSnackbar("Date can not be left blank!", "#ff5555", "#ffffff");
    return;
  }

  let username = getCookie("username");
  let title = document.querySelector("#details-title").innerText;
  let isbn = document.querySelector("#details-title").getAttribute("isbn");
  let return_date = document.querySelector("#datepicker").value;

  let qrCode = new QRCode("qr-code-img");
  const text = `CHECK-OUT+++---===${username}+++---===${title}+++---===${isbn}+++---===${return_date}`;
  const encoded = btoa(text);
  qrCode.makeCode(encoded);

  document.querySelector("#check-out-form").classList.remove("inline-block");
  document.querySelector("#check-out-form").classList.add("hidden");

  document.querySelector("#check-out-confirmation").classList.remove("hidden");
  document.querySelector("#check-out-confirmation").classList.add("inline-block");

  /*
  socket.emit("check-out", {
    username: getCookie("username"),
    token: getCookie("token"),

    isbn: document.querySelector("#details-title").getAttribute("isbn"),
    return_date: document.querySelector("#datepicker").value
  });
  */
});

document.querySelector("#add-wishlist-btn").addEventListener("click", () => {
  socket.emit("add-wishlist", {
    username: getCookie("username"),
    token: getCookie("token"),

    isbn: document.querySelector("#details-title").getAttribute("isbn")
  });
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
