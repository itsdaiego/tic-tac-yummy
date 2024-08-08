document.addEventListener('DOMContentLoaded', function () {
  const url = new URL(window.location.href)
  const parts = url.pathname.split('/')

  const roomId = parts[2]
  const socket = new WebSocket(`ws://localhost:8080/ws?id=${roomId}`);

  socket.onopen = function () {
    console.log('WebSocket connection established');
  };

  socket.onmessage = function (event) {
    console.log('Message from server:', event.data);
  };

  socket.onclose = function () {
    console.log('WebSocket connection closed');
  };

  socket.onerror = function (error) {
    console.error('WebSocket error:', error);
  };
});
