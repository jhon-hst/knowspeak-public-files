const onMessage = (messaje) => {
  console.log(messaje);
};

// Get all elements <a> in the page
const links = document.querySelectorAll("a");

if (links && links.length) {
  // remove all attributes "target"
  links.forEach((link) => {
    link.removeAttribute("target");
  });
}

const addPaddingBottom = (size) => {
  document.body.style["padding-bottom"] = `${size}px`;
};
