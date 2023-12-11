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
            navigator.mediaDevices.getUserMedia({video: { width: 350, height: 250, facingMode: "environment" }}).then((stream) => {
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
                        document.querySelector("#isbn").innerText = `ISBN read: ${barcode.rawValue}`;

                        let isbn = barcode.rawValue;
                        let request_url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;

                        const response = await fetch(request_url);
                        const book_data = response.json();
                        console.log(book_data);

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

socket.on("fatal", () => {
  createSnackbar("Failed.", "#FF5555", "#FFFFFF");
  window.location.href = "/";
});
