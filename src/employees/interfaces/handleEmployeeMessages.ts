import { WebSocketServer, WebSocket } from 'ws';
import { handleEmployeeMessages } from './employee_controller'; 

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (message: string) => {
    handleEmployeeMessages(message, ws); 
  });
});

console.log('WebSocket server running on ws://localhost:8080');
