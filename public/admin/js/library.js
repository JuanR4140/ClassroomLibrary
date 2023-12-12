socket = io.connect();

socket.emit("admin-ping", {
  username: getCookie("username"),
  token: getCookie("token")
});

socket.on("admin-success", () => {
  createSnackbar("Success!", "#55FF55", "#000000");
});

let scanner = false;
document.querySelector("#open-scanner").addEventListener("click", () => {
    let video = document.querySelector("#video");
    if(!scanner){
        scanner = true;
        if(navigator.mediaDevices.getUserMedia){
            navigator.mediaDevices.getUserMedia({video: { width: 200, height: 300, facingMode: "environment" }}).then((stream) => {
                video.srcObject = stream;
            }).catch((err)=> {
                alert(`Error! ${err}`);
                return;
            });

            if(!("BarcodeDetector" in globalThis)){
                alert("Can not detect barcodes with this browser!");
            }else{
                const barcodeDetector = new BarcodeDetector({
                    formats: ["ean_13"]
                });
                
                window.setInterval(async () => {
                    const barcodes = await barcodeDetector.detect(video);
                    if(barcodes.length <= 0) return;

                    barcodes.map(async (barcode) => {

                        try{
                            let isbn = barcode.rawValue;
                            let request_url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
                            
                            const response = await fetch(request_url);
                            const book_data = await response.json();
                            console.log(book_data);
                            
                            document.querySelector("#isbn").value = isbn;

                            const bookInfo = book_data[`ISBN:${isbn}`];
                            if (bookInfo) {
                                document.querySelector("#title").value = bookInfo.title || "No title";
                                document.querySelector("#author").value = (bookInfo.authors && bookInfo.authors[0] && bookInfo.authors[0].name) || "No author";
                                // document.querySelector("#cover").src = (bookInfo.covers && `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`) || "../admin/media/default_cover.png";
                                if(bookInfo.covers){
                                    document.querySelector("#cover").src = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
                                }else{
                                    document.querySelector("#cover").src = "../admin/media/default_cover.png";
                                    const fileInput = document.querySelector("#file-input");
                                    fileInput.addEventListener("change", (event) => {
                                        const file = event.target.files[0];
                                        const reader = new FileReader();

                                        reader.addEventListener("load", () => {
                                            const img = new Image();
                                            img.src = reader.result;

                                            img.onload = () => {
                                                const MAX_WIDTH = 100;
                                                const MAX_HEIGHT = 200;

                                                let width = img.width;
                                                let height = img.height;

                                                if(width > height){
                                                    if(width > MAX_WIDTH){
                                                        height *= MAX_WIDTH / width;
                                                        width = MAX_WIDTH;
                                                    }
                                                }else{
                                                    if(height > MAX_HEIGHT){
                                                        width *= MAX_HEIGHT / height;
                                                        height = MAX_HEIGHT;
                                                    }
                                                }

                                                const canvas = document.createElement("canvas");
                                                const ctx = canvas.getContext("2d");
                                                canvas.width = width;
                                                canvas.height = height;
                                                
                                                ctx.drawImage(img, 0, 0, width, height);
    
                                                const resizedDataUrl = canvas.toDataURL(file.type);
                                                
                                                document.querySelector("#cover").src = resizedDataUrl;
                                            };
                                        });
                                        
                                        reader.readAsDataURL(file);
                                    });
                                    fileInput.style.display = "block";
                                }
                            } else {
                                document.querySelector("#title").value = "No title";
                                document.querySelector("#author").value = "No author";
                                document.querySelector("#cover").src = "../admin/media/default_cover.png";
                            }

                        }catch(err){
                            alert(`Error! ${err}`);
                        }

                        scanner = false;
                        let tracks = document.querySelector("#video").srcObject.getTracks();

                        for(let i = 0; i < tracks.length; i++){
                            tracks[i].stop();
                        }
                
                        document.querySelector("#video").srcObject = null;

                    })
                    // alert(barcodes.map(barcode => barcode.rawValue));
                });

                /*barcodeDetector.detect(video).then((barcodes) => {
                    barcodes.forEach((barcode) => document.querySelector("#isbn").innerText = barcode );
                }).catch((err) => {
                    alert(`Error! ${err}`);
                });*/
            }

        }
    }else{
        scanner = false;
        let tracks = document.querySelector("#video").srcObject.getTracks();

        for(let i = 0; i < tracks.length; i++){
            tracks[i].stop();
        }

        document.querySelector("#video").srcObject = null;
    }

    /*if(!("BarcodeDetector" in globalThis)){
        alert("Can not detect barcodes with this browser!");
    }else{
        const barcodeDetector = new barcodeDetector({
            formats: ["ean_13"]
        });
    }*/
});

document.querySelector("#add-book").addEventListener("click", () => {

    const image = document.querySelector("#cover");
    image.width = 100;
    image.height = 200;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    const bytes = canvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "");

    socket.emit("admin-add-book", {
        username: getCookie("username"),
        token: getCookie("token"),

        isbn: document.querySelector("#isbn").value,
        title: document.querySelector("#title").value,
        author: document.querySelector("#author").value,
        genre: document.querySelector("#genre").value,
        cover: bytes
    });
    
});

socket.on("admin-add-book-result", (data) => {
    createSnackbar(data.msg, data.bgColor, data.txColor);
});

document.querySelector("#remove-book").addEventListener("click", () => {
    socket.emit("admin-remove-book", {
        username: getCookie("username"),
        token: getCookie("token"),

        isbn: document.querySelector("#isbn").value
    });
});

socket.on("admin-remove-book-result", (data) => {
    createSnackbar(data.msg, data.bgColor, data.txColor);
});

socket.on("fatal", () => {
  createSnackbar("Failed.", "#FF5555", "#FFFFFF");
  window.location.href = "/";
});


window.onerror = (error) => {
  alert(error);
}