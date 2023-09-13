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

let modifyCurrentText = true;

const onPressOverText = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount < 1) return true;
  const range = selection.getRangeAt(0);
  const node = selection.anchorNode;

  // when is only click over a text
  if (selection.isCollapsed) {
    modifyCurrentText = false;

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

    setTimeout(() => {
      selection.removeAllRanges();
      modifyCurrentText = true;
    }, 200);
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

document.addEventListener("selectionchange", function (e) {
  // when select a long text
  let selection = document.getSelection();
  if (selection && selection.toString().length) {
    onMessage(
      JSON.stringify({
        type: "${PostMessageEventsTypes.PRESS_OVER_TEXT}",
        textSelected: selection.toString().trim(),
        modifyCurrentText,
      })
    );
  }
});
