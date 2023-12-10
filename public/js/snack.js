let createSnackbar = (content, bgColor, txColor) => {
    let div = document.createElement("div");
  
    div.innerHTML = content;
    div.style.backgroundColor = bgColor;
    div.style.color = txColor;
    div.classList.add("snackbar");
    // div.className = "show";
    div.classList.add("show");
  
    document.body.appendChild(div);
  
    /*setTimeout(() => div.className = div.className.replace("show", ""), 3000);*/
    setTimeout(() => {
      // div.className = div.className.replace("show", "");
      div.remove();
    }, 3000);
}
  