const WebSocket = require('ws');
const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: PORT });

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Client connected');

  ws.on('message', (message) => {
    // Make sure the message is a string before forwarding
    let msg = message;

    if (typeof msg !== 'string') {
      try {
        msg = JSON.stringify(msg);
      } catch (err) {
        console.error('Could not stringify message:', err);
        return;
      }
    }

    // Relay the message to all *other* clients
    for (let client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

console.log(`WebSocket signaling server is running on port ${PORT}`);
