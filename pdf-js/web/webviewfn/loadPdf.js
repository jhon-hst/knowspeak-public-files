import onMessage from "/pdf-js/web/webviewfn/message.js";

document.getElementById("outerContainer").style.display = "none";
document.getElementById("web-page").style.backgroundColor = "#fff";
const fileInput = document.getElementById("fileInputWebPage");

fileInput.addEventListener("change", (event) => {
  const selectedFile = event.target.files[0]; // Obtener el archivo seleccionado
  const reader = new FileReader();

  reader.onload = function () {
    const base64String = reader.result.split(",")[1]; // Obtener la parte Base64 del resultado
    document.getElementById("outerContainer").style.display = "";
    document.getElementById("web-page").style.display = "none";
    loadPdfOnWebView(base64String);
  };

  reader.readAsDataURL(selectedFile);
});

function loadPdfOnWebView(base64) {
  PDFViewerApplicationOptions.set("defaultUrl", null);

  function convertDataURIToBinary(pdfAsDataUri) {
    const raw = window.atob(pdfAsDataUri);
    const rawLength = raw.length;

    const array = new Uint8Array(new ArrayBuffer(rawLength));
    for (let i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i) & 0xff;
    }
    return array;
  }
  // const pdfAsArray = convertDataURIToBinary("${base64}");
  const pdfAsArray = convertDataURIToBinary(base64);

  (async () => {
    try {
      await PDFViewerApplication.open({ data: pdfAsArray });
    } catch (e) {
      onMessage(JSON.stringify({ type: "${PostMessageEventsTypes.ERROR}", e }));
    } finally {
      onMessage(
        JSON.stringify({
          type: "${PostMessageEventsTypes.LOADING_FINALIZED}",
        })
      );
    }
  })();
}