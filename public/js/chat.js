const socket = io();

const $messageForm = document.querySelector("#messageForm");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormBtn = $messageForm.querySelector("button");
const $locationBtn = document.querySelector("#sendLocation");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;

// Options

const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true}) // extract query string 

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (url) => {
  console.log(url);
  const html = Mustache.render(locationTemplate, { url: url.url, createdAt: moment(url.createdAt).format('h:mm a') });
  $messages.insertAdjacentHTML("beforeend", html);
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFormBtn.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, (error) => {
    // emit message from here to server
    $messageFormBtn.removeAttribute("disabled");

    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log("Message delivered!");
  });
});

$locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }
  $locationBtn.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      { lat: position.coords.latitude, long: position.coords.longitude },
      () => {
        // emit location from here to server
        $locationBtn.removeAttribute("disabled");
        console.log("Location Shared!");
      }
    );
  });
});

socket.emit('join', { username, room }) // emit object from query string to server