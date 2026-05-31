import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import express from 'express';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const server = createServer(expressApp);
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // WebSocket Logic: Simulation of 1Win data stream
  io.on('connection', (socket) => {
    console.log('Client connected to Signal Socket:', socket.id);

    // Send initial status
    socket.emit('system:status', { 
      status: 'online', 
      engine: 'Spribe Aviator v4.2', 
      instance: '20488266' 
    });

    // Simulate real-time game updates every few seconds
    const interval = setInterval(() => {
      const type = Math.random() > 0.5 ? 'mines' : 'aviator';
      const reliability = 85 + Math.floor(Math.random() * 14);
      
      socket.emit('game:update', {
        type,
        reliability,
        timestamp: Date.now(),
        node: 'MX-CMX-110'
      });
    }, 5000);

    socket.on('disconnect', () => {
      clearInterval(interval);
      console.log('Client disconnected:', socket.id);
    });
  });

  // Handle all other routes with Next.js
  expressApp.all(/.*/, (req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
