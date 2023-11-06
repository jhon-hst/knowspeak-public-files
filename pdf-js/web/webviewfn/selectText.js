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
var onToggleTranslator = null;
var onRemoveAllSelections = null;
var onWrapEachTextWithSpan = null;
let isTranslatorActive = true;

//
//
//
//
//
//
//

let activeSelectionByClick = true;
// change selection text color
// span is to pdf.js
let isPdfViewer = document.querySelector(".pdfViewer") !== null;
let color = isPdfViewer ? "" : "#263859";

var css = `

    // .textLayer span {
    //   color: #000 !important;
    //   background-color: #FFF !important;
    // }
    // .textLayer {
    //   opacity: 1 !important;
    // }

    em {
      font-style: normal;
    }
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
          background-color: #3EE8B5;
      }
      30%{
          background-color: #3EE8B5;
      }
      60%{
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

document.addEventListener("click", function (event) {
  var textIslink = event.target.closest("a");

  if (textIslink && textIslink.href && textIslink.href.startsWith("http")) {
    event.preventDefault();
    onMessage(
      JSON.stringify({
        type: "${PostMessageEventsTypes.CLICK_IN_LINK}",
        href: textIslink.href,
      })
    );
  }

  onMessage(
    JSON.stringify({
      type: "${PostMessageEventsTypes.DOCUMENT_CLICK_EVENT}",
    })
  );

  if (
    isTranslatorActive &&
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
  if (isTranslatorActive && selection && selection.toString().length) {
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

onRemoveAllSelections = () => {
  let selection = document.getSelection();
  if (selection && selection.toString().length) {
    selection.removeAllRanges();
  }
  activeSelectionByClick = true;
};

onWrapEachTextWithSpan = () => {
  // Recursive function to traverse descendant nodes and find text nodes
  const getTextNodes = (element, textNodeArray) => {
    if (
      !["script", "style", "code", "pre"].includes(
        element.nodeName.toLowerCase()
      )
    ) {
      for (var i = 0; i < element.childNodes.length; i++) {
        var node = element.childNodes[i];
        if (node.nodeType === Node.TEXT_NODE) {
          // If the node is a text node, add it to the array
          if (node.textContent) {
            textNodeArray.push(node);
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // If the node is an element, call the function recursively

          if (
            !node.classList ||
            (!node.classList.contains("textSpan") &&
              !node.classList.contains("containerTextSpan"))
          ) {
            getTextNodes(node, textNodeArray);
          }
        }
      }
    }
  };

  // Create an empty array to store the text nodes
  const textNodeArray = [];

  // Call the function to get text nodes within the element
  getTextNodes(document.body, textNodeArray);

  const wrapTextNodesWithSpan = (node) => {
    const tag = isPdfViewer ? "em" : "span";
    let spannedNodeText = "";
    if (isLanguageWithoutSpaces) {
      const text = node.textContent;
      spannedNodeText = Array.from(text)
        .map((char) => {
          if (char.trim() === "") {
            return char; // Mantener espacios en blanco sin cambios
          } else {
            return `<${tag} class="textSpan">${char}</${tag}>`;
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
            return `<${tag} class="textSpan">${word}</${tag}>`;
          }
        })
        .join(" ");
    }
    const spanContainer = document.createElement(`${tag}`);
    spanContainer.className = "containerTextSpan";
    spanContainer.innerHTML = spannedNodeText;

    // I can't remove o replace child because there are pages that show errors when don't find the original node
    node.textContent = "";
    node.parentNode.insertBefore(spanContainer, node.nextSibling);
  };

  textNodeArray.forEach((node) => {
    wrapTextNodesWithSpan(node);
  });
};

let bodySaved = null;
let timeoutId;

const onSetSpanInIntervals = () => {
  const currentBody = document.body.innerHTML;
  if (isTranslatorActive) {
    /* if currentBody is differnt is because the body is updating, only wraps in span 
            when the body finish the updating */
    if (bodySaved === currentBody) {
      onWrapEachTextWithSpan(currentBody);
      timeoutId = setTimeout(onSetSpanInIntervals, 5000);
    } else {
      bodySaved = currentBody;
      timeoutId = setTimeout(onSetSpanInIntervals, 2000);
    }
  }
};

onWrapEachTextWithSpan(document.body);
onSetSpanInIntervals();

onToggleTranslator = () => {
  isTranslatorActive = !isTranslatorActive;

  if (!isTranslatorActive && timeoutId) {
    clearTimeout(timeoutId);
  }
};
