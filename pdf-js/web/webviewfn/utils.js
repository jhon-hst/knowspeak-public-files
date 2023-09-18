const onMessage = (messaje) => {
  console.log(messaje);
};

document.addEventListener("scroll", () => {
  onMessage(
    JSON.stringify({
      type: "${PostMessageEventsTypes.PRESS_OVER_TEXT}",
      scrollTop: document.documentElement.scrollTop || document.body.scrollTop,
    })
  );
});
