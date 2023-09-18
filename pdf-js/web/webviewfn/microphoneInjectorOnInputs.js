var addTextOnInput = null;
var cleanTextOnInput = null;

const inputToLoadText = document.getElementById("inputToLoadText");
const addTextToInput = document.getElementById("addTextToInput");
addTextToInput.addEventListener("click", (event) => {
  event.stopPropagation();
  const value = inputToLoadText.value;
  addTextOnInput(value);
});

//
//
//
//
//
//
// is the text saved while user is talking
let globalPartialText = null;

// is save the current location of the cursor while user is talking
let globalPartialTextCursor = { start: null, end: null };

let inputMicrophoneActive = null;

const onMessage = (messaje) => {
  console.log(messaje);
};

const addMicrophone = () => {
  //If exist microphones then before creating remove them
  const microphones = document.querySelectorAll(".ks-microphone");
  if (microphones && microphones.length) {
    microphones.forEach((microphone) => {
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

    // Add event click to each icon
    icon.addEventListener("click", (event) => {
      event.stopPropagation();
      const input =
        document.querySelectorAll("input")[i] ||
        document.querySelectorAll("textarea")[i];

      if (input) {
        inputMicrophoneActive = input;
        onMessage(
          JSON.stringify({ type: "${PostMessageEventsTypes.OPEN_MICROPHONE}" })
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
      textareas[i].parentNode.append(Icon(i));
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
        inputs[i].parentNode.append(Icon(i));
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
      JSON.stringify({ type: "${PostMessageEventsTypes.ADDED_MICROPHONES}" })
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

      if (button && button.hasAttribute && button.hasAttribute("disabled")) {
        // El botón tiene el atributo "disabled"
        button.removeAttribute("disabled");
      }

      // simulate interaction with inputs, There are buttons that are not activated if you do not write in the input
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
