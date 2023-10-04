const fileInput = document.getElementById("fileInputWebPageAdobe");

fileInput.addEventListener("change", (event) => {
  const selectedFile = event.target.files[0]; // Obtener el archivo seleccionado
  const reader = new FileReader();

  reader.onload = function () {
    const base64String = reader.result.split(",")[1]; // Obtener la parte Base64 del resultado

    loadPdfOnWebView(base64String);
  };

  reader.readAsDataURL(selectedFile);
});

//
//
//
//
//
//

const loadPdfOnWebView = (base64str) => {
  const style = document.createElement("style");
  style.innerHTML = `
            body {
              margin: 0;
            }
            .sdk-HeaderView-header {
              display: none;
            }
          `;
  document.head.appendChild(style);

  // const base64str = "${base64}";

  function base64ToArrayBuffer(base64) {
    var bin = window.atob(base64);
    var len = bin.length;
    var uInt8Array = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      uInt8Array[i] = bin.charCodeAt(i);
    }
    return uInt8Array.buffer;
  }

  const adobeDCView = new AdobeDC.View({
    clientId: "6c6b9f28f9524992a3fc18d6ebb4aeef",
    divId: "adobe-dc-view",
  });

  const previewFilePromise = adobeDCView.previewFile(
    {
      content: {
        promise: Promise.resolve(base64ToArrayBuffer(base64str)),
      },
      metaData: { fileName: "${pdfData.pdfInfo.name}" },
    },
    {
      // defaultViewMode: "FIT_WIDTH",
      showAnnotationTools: false,
      showDownloadPDF: false,
      showPrintPDF: false,
      embedMode: "FULL_WINDOW",
    }
  );

  const eventOptions = {
    listenOn: [AdobeDC.View.Enum.FilePreviewEvents.PREVIEW_SELECTION_END],
    enableFilePreviewEvents: true,
  };

  const allowTextSelection = true;

  adobeDCView.registerCallback(
    AdobeDC.View.Enum.CallbackType.EVENT_LISTENER,
    function (event) {
      if (event.type === "PREVIEW_SELECTION_END") {
        previewFilePromise.then((adobeViewer) => {
          adobeViewer.getAPIs().then((apis) => {
            apis
              .enableTextSelection(allowTextSelection)
              .then(() => {
                apis.getSelectedContent().then((result) => {
                  console.log(result);
                  //   window.ReactNativeWebView.postMessage(JSON.stringify(result));
                });
              })
              .catch((error) => console.log(error));
          });
        });
      }
    },
    eventOptions
  );
};
