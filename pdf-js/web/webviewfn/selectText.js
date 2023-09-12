import onMessage from "/pdf-js/web/webviewfn/message.js";

// change selection text color
// span is to pdf.js
var css = `
    ::selection {
        background-color: #3EE8B5;
        color: #263859
    }
    span::selection {
        background-color: #3EE8B5 !important;
        color: #263859
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
