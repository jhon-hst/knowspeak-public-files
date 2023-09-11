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

//
//
//
//
//
//
//
//
//
//
//
//
//

// ---------**** Send messages to react-native ****----------------
const onMessage = (messaje) => {
  console.log(messaje);
  // window.ReactNativeWebView.postMessage(messaje)
};

// ---------**** Start loadPdfOnWebView ****----------------
const loadPdfOnWebView = (base64) => {
  PDFViewerApplicationOptions.set("defaultUrl", null);

  function convertDataURIToBinary(pdfAsDataUri) {
    const raw = window.atob(pdfAsDataUri);
    const rawLength = raw.length;

    const array = new Uint8Array(new ArrayBuffer(rawLength));
    for (i = 0; i < rawLength; i++) {
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
};
// ---------**** End loadPdfOnWebView ****----------------

// ---------**** Start press over text ****----------------

// change selection text color
// span is to pdf.js
var css = `
    ::selection {
        background-color: #3EE8B5;
    }
    span::selection {
        background-color: #3EE8B5 !important;
    }
`;

var styleElement = document.createElement("style");
styleElement.innerHTML = css;
document.head.appendChild(styleElement);

const onPressOverText = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount < 1) return true;
  const range = selection.getRangeAt(0);
  const node = selection.anchorNode;

  // when is only click over a text
  if (range.startOffset === range.endOffset) {
    // Extend the range forward until the start word
    while (range.startOffset > 0) {
      range.setStart(node, range.startOffset - 1);
      if (range.toString().includes(" ")) {
        range.setStart(node, range.startOffset + 1);
        break;
      }
    }

    // Extend the range until the end word
    while (range.endOffset < node.length) {
      range.setEnd(node, range.endOffset + 1);
      if (range.toString().includes(" ")) {
        range.setEnd(node, range.endOffset - 1);
        break;
      }
    }

    const word = range.toString().trim();

    if (word) {
      /* 
      This is because in iOS does not work with ::selection style to show 
      the selected text with background  #3EE8B5 and color #263859 
    */

      let partialSpan = document.createElement("span");
      partialSpan.textContent = word;
      partialSpan.style.backgroundColor = "#3EE8B5";

      let isPdfViewer = document.querySelector(".pdfViewer") !== null;
      /* 
      changing the color of the text in the pdf viewer makes 
      it look weird the text is because of the pdf viewer styles 
    */

      if (!isPdfViewer) {
        partialSpan.style.color = "#263859";
      }
      range.deleteContents();
      range.insertNode(partialSpan);

      onMessage(
        JSON.stringify({
          type: "${PostMessageEventsTypes.PRESS_OVER_TEXT}",
          word,
        })
      );

      // clean text selected
      setTimeout(() => {
        let textContent = document.createTextNode(word);
        partialSpan.parentNode.replaceChild(textContent, partialSpan);
      }, 200);
    } else {
      selection.removeAllRanges();
    }
  } else {
    // when select a long text
    let selection = document.getSelection();

    onMessage(
      JSON.stringify({
        type: "${PostMessageEventsTypes.PRESS_OVER_TEXT}",
        word: selection.toString(),
      })
    );
  }
};

document.addEventListener("pointerup", function () {
  onPressOverText();
});

// ---------**** End press over text ****----------------

// ---------**** Start select long text ****----------------

// document.addEventListener("selectionchange", function () {
//   console.log("me llaman 2");
//   // onPressOverText();
//   let selection = document.getSelection();

//   console.log(selection.toString());
// });

// ---------**** End select long text ****----------------

const microphoneInjectorOnInputs = () => {
  /*
      These variables (addTextOnInput cleanTextOnInput) will be assigned a function that
      will later be called from react-native, which is why it needs to be in the global scope
    */
  var addTextOnInput = null;
  var cleanTextOnInput = null;

  // is the text saved while user is talking
  let globalPartialText = null;

  // is save the current location of the cursor while user is talking
  let globalPartialTextCursor = { start: null, end: null };

  let inputMicrophoneActive = null;

  const addMicrophone = () => {
    //If exist microphones then before creating remove them
    const microphones = document.querySelectorAll(".ks-microphone");
    if (microphones && microphones.length) {
      microphones.forEach(function (microphone) {
        microphone.remove();
      });
    }

    // Create icon element
    const Icon = (i) => {
      const icon = document.createElement("span");
      icon.className = "ks-microphone"; // Establece la clase del icono

      // Establece la posición y el estilo del icono
      icon.style.position = "absolute";
      icon.style.top = "50%";
      icon.style.transform = "translateY(-50%)";
      icon.style.left = "5px";
      icon.style.height = "30px";
      icon.style.width = "30px";
      icon.style.background = "#263859";
      icon.style["border-radius"] = "50%";
      icon.style.padding = "5px";
      icon.style.background = "#263859";
      icon.style["z-index"] = 999999;
      icon.style.display = "flex";
      icon.style["justify-content"] = "center";
      icon.style["align-items"] = "center";

      icon.innerHTML = ` <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="#3EE8B5"
              viewBox="0 0 256 256">
              <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,143.6V232a8,8,0,0,1-16,0V207.6A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64,64,0,0,0,128,0,8,8,0,0,1,16,0A80.11,80.11,0,0,1,136,207.6Z"></path>
            </svg>
            `;

      // Add click event to icon
      icon.addEventListener("click", () => {
        event.stopPropagation();
        const input =
          document.querySelectorAll("input")[i] ||
          document.querySelectorAll("textarea")[i];

        if (input) {
          inputMicrophoneActive = input;
          onMessage(
            JSON.stringify({
              type: "${PostMessageEventsTypes.OPEN_MICROPHONE}",
            })
          );
        }
      });
      return icon;
    };

    // get all textareas
    const textareas = document.querySelectorAll("textarea");

    if (textareas && textareas.length) {
      for (let i = 0; i < textareas.length; i++) {
        // add icon
        textareas[i].parentNode.style.position = "relative";
        textareas[i].style["padding-left"] = "50px";
        textareas[i].parentNode.appendChild(Icon(i));
      }
    }

    // get all inputs
    const inputs = document.querySelectorAll("input");

    if (inputs && inputs.length) {
      for (let i = 0; i < inputs.length; i++) {
        // add icon in input type text or number
        const inputType = inputs[i].type;
        if (inputType === "text" || inputType === "search") {
          inputs[i].parentNode.style.position = "relative";
          inputs[i].style["padding-left"] = "50px";
          inputs[i].parentNode.appendChild(Icon(i));
        }
      }
    }
  };

  addMicrophone();

  // In page like chat gpt some component are updated without updated page, so Microphone losses with this interval check if is necesary to create microphones other time
  setInterval(() => {
    const elements = document.querySelectorAll(".ks-microphone");
    const textareas = document.querySelectorAll("textarea");
    const inputs = document.querySelectorAll("input");

    if (!elements.length && (textareas.length || inputs.length)) {
      addMicrophone();
      onMessage(
        JSON.stringify({
          type: "${PostMessageEventsTypes.ADDED_MICROPHONES}",
        })
      );
    }
  }, 2000);

  addTextOnInput = (text, isPartialText) => {
    if (inputMicrophoneActive && text) {
      const currentHeight = inputMicrophoneActive.style.height;

      if (isPartialText) {
        globalPartialText = globalPartialText ?? inputMicrophoneActive.value;
        if (
          globalPartialTextCursor.start === null &&
          globalPartialTextCursor.end === null
        ) {
          globalPartialTextCursor = {
            start: inputMicrophoneActive.selectionStart,
            end: inputMicrophoneActive.selectionEnd,
          };
        }
      }

      let currentValue = globalPartialText ?? inputMicrophoneActive.value;

      if (document.activeElement === inputMicrophoneActive) {
        const startPosition =
          globalPartialTextCursor.start ?? inputMicrophoneActive.selectionStart;
        const endPosition =
          globalPartialTextCursor.end ?? inputMicrophoneActive.selectionEnd;

        let firstPart = currentValue.substring(0, startPosition);
        let secondPart = currentValue.substring(endPosition);

        //handler text spaces
        const newText =
          (firstPart.charAt(firstPart.length - 1) &&
          firstPart.charAt(firstPart.length - 1) !== " "
            ? " "
            : "") +
          text +
          (secondPart.charAt(0) === " " ? "" : " ");

        inputMicrophoneActive.value = firstPart + newText + secondPart;

        // Establece la posición del cursor después del texto agregado
        inputMicrophoneActive.selectionStart = startPosition + newText.length;
        inputMicrophoneActive.selectionEnd = startPosition + newText.length;
      } else {
        inputMicrophoneActive.value =
          currentValue + (currentValue.length ? " " : "") + text;
      }

      if (!isPartialText) {
        globalPartialText = null;
        globalPartialTextCursor = { start: null, end: null };

        // remove Attribute disabled in buttons and actived them in pages like chagpt
        const button = inputMicrophoneActive.nextSibling;
        button.removeAttribute("disabled");
        // simulate typing on the keyboard
        const event = new Event("input", { bubbles: true });
        inputMicrophoneActive.dispatchEvent(event);
      }

      // Show all text in the input (TEXTAREA)
      if (inputMicrophoneActive.tagName === "TEXTAREA") {
        inputMicrophoneActive.style.height = "auto";
        inputMicrophoneActive.style.height =
          inputMicrophoneActive.scrollHeight + "px";
        if (currentHeight !== inputMicrophoneActive.style.height) {
          setTimeout(() => {
            inputMicrophoneActive.style.height =
              inputMicrophoneActive.scrollHeight + "px";
          }, 0);
        }
      }
    }
  };

  cleanTextOnInput = () => {
    if (inputMicrophoneActive) {
      inputMicrophoneActive.value = "";
    }
  };
};
