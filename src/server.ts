import { WebSocketServer, WebSocket } from 'ws';
import mqttClient from './mqttclient';
import dotenv from 'dotenv';
import { handleAdminMessages } from './admin/interfaces/admin_controller';
import { handleEmployeeMessages } from './employees/interfaces/employee_controller';

dotenv.config();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const wss = new WebSocketServer({ port });

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (message: string) => {
    const data = JSON.parse(message);

    if (data.action === 'publishMessage') {
      mqttClient.publish(data.topic, data.message, (err) => {
        if (err) {
          ws.send(JSON.stringify({ action: 'publishMessage', status: 'error', message: err.message }));
        } else {
          ws.send(JSON.stringify({ action: 'publishMessage', status: 'success' }));
        }
      });
    } else if (data.action === 'subscribeTopic') {
      mqttClient.subscribe(data.topic, (err) => {
        if (err) {
          ws.send(JSON.stringify({ action: 'subscribeTopic', status: 'error', message: err.message }));
        } else {
          ws.send(JSON.stringify({ action: 'subscribeTopic', status: 'success' }));
        }
      });
    } else if (data.action.startsWith('admin')) {
      handleAdminMessages(message, ws);
    } else if (data.action.startsWith('employee')) {
      handleEmployeeMessages(message, ws);
    } else {
      ws.send(JSON.stringify({ status: 'error', message: 'Acción no reconocida' }));
    }
  });
});

console.log(`WebSocket server is running on port ${port}`);
