// // Obtener el elemento body
// var body = document.body;

// // Obtener todos los nodos de texto dentro del body
// var textNodes = getTextNodes(body);

// // Función para dividir un nodo de texto en letras individuales y envolverlas en spans
// function wrapLettersInSpans(node) {
//   var text = node.nodeValue;
//   var parent = node.parentNode;

//   // Verificar si el nodo de texto contiene letras
//   if (/[a-zA-Z]/.test(text)) {
//     var textContent = text.split(/\b/); // Dividir el texto en palabras y caracteres individuales

//     // Eliminar el nodo de texto original
//     parent.removeChild(node);

//     // Recorrer el contenido dividido y crear spans
//     textContent.forEach(function (content) {
//       // Verificar si el contenido debe envolverse en un span o mantenerse sin cambios
//       var wrapper = /[a-zA-Z]/.test(content)
//         ? document.createElement("span")
//         : document.createTextNode(content);
//       wrapper.textContent = content;
//       parent.appendChild(wrapper);
//     });
//   }
// }

// // Función para obtener todos los nodos de texto dentro de un elemento y sus descendientes
// function getTextNodes(element) {
//   var textNodes = [];
//   var walker = document.createTreeWalker(
//     element,
//     NodeFilter.SHOW_TEXT,
//     null,
//     false
//   );

//   while (walker.nextNode()) {
//     textNodes.push(walker.currentNode);
//   }

//   return textNodes;
// }

// // Envolver letras en spans sin afectar otros elementos
// textNodes.forEach(function (node) {
//   wrapLettersInSpans(node);
// });

document.addEventListener("click", function (event) {
  var clickedElement = event.target;

  // Verificar si el elemento en el que se hizo clic es un elemento de texto
  var textContent = clickedElement.textContent;

  // Limpiar el contenido original
  clickedElement.textContent = "";

  // Dividir el contenido en palabras teniendo en cuenta signos gramaticales y etiquetas
  var words = textContent.split(/([\s.,;!?()[\]<>"'{}|])/);

  // Recorrer el contenido dividido y agregar cada parte como texto o elemento
  words.forEach(function (part) {
    if (part.trim() !== "") {
      // Crear un span para las palabras
      var span = document.createElement("span");
      span.textContent = part;
      span.style.backgroundColor = "red";

      // Verificar si la parte es un signo gramatical o una etiqueta y aplicar un estilo diferente
      if (/[\s.,;!?()[\]<>"'{}|]/.test(part)) {
        span.className = "signo"; // Aplicar una clase CSS para estilizar los signos gramaticales
      }

      clickedElement.appendChild(span);
    } else {
      // Mantener los espacios en blanco sin cambios
      clickedElement.appendChild(document.createTextNode(part));
    }
  });
});

// var elementsWithText = document.querySelectorAll("a, p, h1, h2, h3, strong");
// for (var i = 0; i < elementsWithText.length; i++) {
//   var element = elementsWithText[i];
//   var text = element.textContent.trim();
//   if (text !== "") {
//     var textWithSpans = "";
//     for (var j = 0; j < text.length; j++) {
//       textWithSpans += '<span class="textSpan">' + text[j] + "</span>";
//     }
//     element.innerHTML = textWithSpans;
//   }
// }
