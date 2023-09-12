const onMessage = (messaje) => {
  console.log(messaje);
  // window.ReactNativeWebView.postMessage(messaje)
};

// change selection text color
// span is to pdf.js
var css = `
    ::selection {
        background-color: #3EE8B5;
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

    let isPdfViewer = document.querySelector(".pdfViewer") !== null;
    /* changing the color of the text in the pdf viewer makes it look weird the text
        is because of the pdf viewer styles */

    if (!isPdfViewer) {
      let styleElementToColorText = document.createElement("style");
      styleElementToColorText.innerHTML = css;
      document.head.appendChild(styleElementToColorText);
      styleElementToColorText.innerHTML = `
                ::selection {
                    background-color: #3EE8B5;
                    color: #263859
                }
            `;
    }

    const word = range.toString().trim();

    if (word) {
      onMessage(
        JSON.stringify({
          type: "${PostMessageEventsTypes.PRESS_OVER_TEXT}",
          word,
        })
      );
      setTimeout(() => {
        selection.removeAllRanges();
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

document.addEventListener("click", function (e) {
  var clickElemAnimation = document.createElement("div");
  clickElemAnimation.className = "clickEffect";
  clickElemAnimation.style.top = e.clientY + "px";
  clickElemAnimation.style.left = e.clientX + "px";
  document.body.appendChild(clickElemAnimation);
  clickElemAnimation.addEventListener("animationend", () => {
    clickElemAnimation.parentElement.removeChild(clickElemAnimation);
  });
  onPressOverText();
});
