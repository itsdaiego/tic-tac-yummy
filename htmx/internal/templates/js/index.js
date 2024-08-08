document.addEventListener('DOMContentLoaded', function () {
  const url = new URL(window.loction.href)
  const params = new URLSearchParams(url.search)

  console.log('pparams', params.get('room'))

  const roomIdElement = document.getElementById('room-id');
  const roomId = roomIdElement.textContent.split(': ')[1];
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
