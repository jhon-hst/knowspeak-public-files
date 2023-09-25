let PlatformOS = "ios";
const LANGUAGES_WITHOUT_SPACE = ["zh", "zh-tw", "zh-cn", "ja"];
const languageToLearn = "en";
let isLanguageWithoutSpaces = LANGUAGES_WITHOUT_SPACE.includes(
  languageToLearn.toLowerCase()
);
const onMessage = (messaje) => {
  console.log(messaje);
  // window.ReactNativeWebView.postMessage(messaje)
};

// change selection text color
// span is to pdf.js
let isPdfViewer = document.querySelector(".pdfViewer") !== null;
let color = isPdfViewer ? "" : "#263859";

var css = `
	::selection {
		background-color: #3EE8B5;
		color: ${color} ;
    }
    span::selection {
        background-color: #3EE8B5 !important;
    }
    .textSelectActive {
        background-color: #3EE8B5;
        color: ${color};
        border-radius: 5px;
        animation: textSelectActiveEffect 0.7s ease-out;
    }

    @keyframes textSelectActiveEffect {
        0%{
            background-color: transparent;
        }
        30%{
            background-color: #3EE8B5;
        }
        80%{
            background-color: #3EE8B5;
        }
        100%{
            background-color: transparent;
        }
       
    }
`;

let styleElement = document.createElement("style");
styleElement.innerHTML = css;
document.head.appendChild(styleElement);

let activeSelectionByClick = true;

document.addEventListener("click", function (event) {
  onMessage(
    JSON.stringify({
      type: "${PostMessageEventsTypes.DOCUMENT_CLICK_EVENT}",
    })
  );

  if (
    activeSelectionByClick &&
    event.target &&
    event.target.classList &&
    event.target.classList.contains("textSpan")
  ) {
    const word = event.target.textContent;
    if (word) {
      onMessage(
        JSON.stringify({
          type: "${PostMessageEventsTypes.PRESS_OVER_TEXT}",
          textSelected: word,
          isLongSelectionActive: false,
        })
      );
    }
    if (!event.target.classList.contains("textSelectActive")) {
      event.target.classList.add("textSelectActive");
      setTimeout(() => {
        event.target.classList.remove("textSelectActive");
      }, 500);
    }
  }

  // to it does not select text when there is long selection
  let selection = document.getSelection();
  if (selection.toString().split(" ").length > 1) {
    activeSelectionByClick = false;
  } else {
    activeSelectionByClick = true;
  }
});

document.addEventListener("selectionchange", function (e) {
  // when select a long text
  let selection = document.getSelection();
  if (selection && selection.toString().length) {
    onMessage(
      JSON.stringify({
        type: "${PostMessageEventsTypes.PRESS_OVER_TEXT}",
        textSelected: selection.toString().trim(),
        isLongSelectionActive: true,
      })
    );
    if (selection.toString().split(" ").length > 1) {
      activeSelectionByClick = false;
    }
  }
});

function removeAllSelections() {
  let selection = document.getSelection();
  if (selection && selection.toString().length) {
    selection.removeAllRanges();
  }
  activeSelectionByClick = true;
}

const wrapTextNodesWithSpan = (node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    let spannedNodeText = "";
    if (isLanguageWithoutSpaces) {
      const text = node.textContent;
      spannedNodeText = Array.from(text)
        .map((char) => {
          if (char.trim() === "") {
            return char; // Mantener espacios en blanco sin cambios
          } else {
            return `<span class="textSpan">${char}</span>`;
          }
        })
        .join("");
    } else {
      const words = node.textContent.split(" ");
      spannedNodeText = words
        .map((word) => {
          if (word.trim() === "") {
            return word; // Mantener espacios en blanco sin cambios
          } else {
            return `<span class="textSpan">${word}</span>`;
          }
        })
        .join(" ");
    }

    const spanContainer = document.createElement("span");
    spanContainer.innerHTML = spannedNodeText;
    node.parentNode.replaceChild(spanContainer, node);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    for (let i = 0; i < node.childNodes.length; i++) {
      wrapTextNodesWithSpan(node.childNodes[i]);
    }
  }
};
wrapTextNodesWithSpan(document.body);
