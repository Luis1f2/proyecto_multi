import { WebSocketServer } from 'ws';
import { handleAdminMessages } from './admin/interfaces/admin_controller';
import { handleEmployeeMessages } from './employees/interfaces/employee_controller';
import { handleHistoryMessages } from './history/interfaces/history_controller';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const wss = new WebSocketServer({ port });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message.toString());

        if (data.action.startsWith('createAdmin') || data.action.startsWith('getAdminByEmail') || data.action.startsWith('loginAdmin')) {
            handleAdminMessages(message, ws);
        } else if (data.action.startsWith('createEmployee') || data.action.startsWith('getEmployeeById') || data.action.startsWith('deleteEmployee')) {
            handleEmployeeMessages(message, ws);
        } else if (data.action.startsWith('logHistory') || data.action.startsWith('getHistory')) {
            handleHistoryMessages(message, ws);
        } else {
            ws.send(JSON.stringify({ status: 'error', message: 'Acción no reconocida' }));
        }
    });
});

console.log(`WebSocket conexione en ws://localhost:8080${port}`);
