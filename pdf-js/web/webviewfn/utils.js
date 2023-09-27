const onMessage = (messaje) => {
  console.log(messaje);
};

// Get all elements <a> in the page
const links = document.querySelectorAll("a");

if (links && links.length) {
  // remove all attributes "target"
  // links.forEach((link) => {
  //   link.removeAttribute("target");
  // });
}

window.onbeforeunload = function () {
  return "There are unsaved changes. Leave now?";
};
