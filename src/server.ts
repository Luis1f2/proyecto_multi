import { WebSocketServer } from 'ws';
import { handleAuthMessages } from './admin/interfaces/auth_controller';
import { handleEmployeeMessages } from './employees/interfaces/employee_controller';
import { handleHistoryMessages } from './history/interfaces/history_controller';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const wss = new WebSocketServer({ port });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message.toString());

        if (data.action.startsWith('createEmployee') || data.action.startsWith('deleteEmployee') || data.action.startsWith('getEmployeeById') || data.action.startsWith('getAllEmployees')) {
            handleEmployeeMessages(message, ws);
        } else if (data.action.startsWith('logHistory') || data.action.startsWith('getHistory')) {
            handleHistoryMessages(message, ws);
        } else {
            handleAuthMessages(message, ws);
        }
    });
});

console.log(`WebSocket server is running on port ${port}`);
