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
    div.clickEffect{
        position: fixed;
        box-sizing: border-box;
        border-style: solid;
        border-color: #8E6CF8;
        border-radius: 50%;
        animation:clickEffect 0.4s ease-out;
        z-index: 99999;
    }
    @keyframes clickEffect{
        0%{
            opacity:1;
            width:0.5em; height:0.5em;
            margin:-0.25em;
            border-width:0.5em;
        }
        100%{
            opacity:0.2;
            width:5em; height:5em;
            margin:-2.5em;
            border-width:0.03em;
        }
    }
`;

let styleElement = document.createElement("style");
styleElement.innerHTML = css;
document.head.appendChild(styleElement);

let isLongSelectionActive = true;
let activeSelectionByClick = true;

const onPressOverText = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount < 1) return true;
  const range = selection.getRangeAt(0);
  const node = selection.anchorNode;

  // when is only click over a text
  if (selection.isCollapsed && node && node.length) {
    isLongSelectionActive = false;

    if (isLanguageWithoutSpaces) {
      range.setStart(node, range.startOffset - 1);
      range.setEnd(node, range.endOffset);
    } else {
      // // Extend the range forward until the start word
      while (range.startOffset > 0) {
        range.setStart(node, range.startOffset - 1);
        if (range.toString().includes(" ")) {
          range.setStart(node, range.startOffset + 1);
          break;
        }
      }

      // // Extend the range until the end word
      while (range.endOffset < node.length) {
        range.setEnd(node, range.endOffset + 1);
        if (range.toString().includes(" ")) {
          range.setEnd(node, range.endOffset - 1);
          break;
        }
      }
    }
    //  event selectionchange does not active with this selection in iOS
    const word = range.toString().trim();

    if (word) {
      onMessage(
        JSON.stringify({
          type: "${PostMessageEventsTypes.PRESS_OVER_TEXT}",
          textSelected: word,
          isLongSelectionActive,
        })
      );
    }

    setTimeout(() => {
      selection.removeAllRanges();
      isLongSelectionActive = true;
    }, 200);
  }
};

document.addEventListener("click", function (event) {
  onMessage(
    JSON.stringify({
      type: "${PostMessageEventsTypes.DOCUMENT_CLICK_EVENT}",
    })
  );

  if (PlatformOS === "ios") {
    // This animation only to iOS beacause android alreday have the selection animation
    var clickElemAnimation = document.createElement("div");
    clickElemAnimation.className = "clickEffect";
    clickElemAnimation.style.top = event.clientY + "px";
    clickElemAnimation.style.left = event.clientX + "px";
    document.body.append(clickElemAnimation);
    clickElemAnimation.addEventListener("animationend", () => {
      clickElemAnimation.parentElement.removeChild(clickElemAnimation);
    });
  }
  if (activeSelectionByClick) {
    onPressOverText();
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
  if (selection && selection.toString().length && isLongSelectionActive) {
    onMessage(
      JSON.stringify({
        type: "${PostMessageEventsTypes.PRESS_OVER_TEXT}",
        textSelected: selection.toString().trim(),
        isLongSelectionActive,
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
