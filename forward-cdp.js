import net from 'net';

const server = net.createServer((socket) => {
  const client = net.connect(9223, '127.0.0.1');
  
  socket.pipe(client);
  client.pipe(socket);
  
  socket.on('error', (err) => {
    // Silently handle socket errors to prevent crash
  });
  client.on('error', (err) => {
    // Silently handle client errors to prevent crash
  });
});

server.on('error', (err) => {
  console.error("Forwarder server error:", err);
});

server.listen(9222, '127.0.0.1', () => {
  console.log('Forwarding from IPv4 127.0.0.1:9222 to IPv4 127.0.0.1:9223');
});

