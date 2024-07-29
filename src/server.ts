import { WebSocketServer, WebSocket } from 'ws';
import { connectRabbitMQ, getChannel } from './rabbitmqClient';
import dotenv from 'dotenv';
import { handleAdminMessages } from './admin/interfaces/admin_controller';
import { handleEmployeeMessages } from './employees/interfaces/employee_controller';
import { Channel, ConsumeMessage } from 'amqplib';
import { processAccessRequest } from './employees/services/processAccessRequest';

dotenv.config();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const wss = new WebSocketServer({ port });

connectRabbitMQ().then(() => {
  console.log('RabbitMQ connection established');

  const channel = getChannel();
  if (channel) {
    channel.consume('esp32/access', async (msg: ConsumeMessage | null) => {
      if (msg) {
        const data = JSON.parse(msg.content.toString());
        await processAccessRequest(data);
        channel.ack(msg);
      }
    });
  }

  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', async (message: string) => {
      const data = JSON.parse(message);
      const channel = getChannel();

      if (!channel) {
        ws.send(JSON.stringify({ status: 'error', message: 'RabbitMQ channel not available' }));
        return;
      }

      if (data.action === 'publishMessage') {
        try {
          await channel.assertQueue(data.topic, { durable: true });
          channel.sendToQueue(data.topic, Buffer.from(data.message));
          ws.send(JSON.stringify({ action: 'publishMessage', status: 'success' }));
        } catch (error) {
          const err = error as Error;
          ws.send(JSON.stringify({ action: 'publishMessage', status: 'error', message: err.message }));
        }
      } else if (data.action === 'subscribeTopic') {
        try {
          await channel.assertQueue(data.topic, { durable: true });
          channel.consume(data.topic, (msg: ConsumeMessage | null) => {
            if (msg !== null) {
              ws.send(JSON.stringify({ action: 'message', topic: data.topic, message: msg.content.toString() }));
              channel.ack(msg);
            }
          });
          ws.send(JSON.stringify({ action: 'subscribeTopic', status: 'success' }));
        } catch (error) {
          const err = error as Error;
          ws.send(JSON.stringify({ action: 'subscribeTopic', status: 'error', message: err.message }));
        }
      } else if (data.action.startsWith('admin')) {
        handleAdminMessages(message, ws);
      } else if (data.action.startsWith('employee')) {
        handleEmployeeMessages(message, ws);
      } else {
        ws.send(JSON.stringify({ status: 'error', message: 'Acción no reconocida' }));
      }
    });
  });

  console.log(`WebSocket corriendo en ws://localhost:${port}`);
}).catch(error => {
  console.error('Failed to establish RabbitMQ connection', error);
});
