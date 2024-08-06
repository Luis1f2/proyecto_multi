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

// Utility function to check if a string is valid JSON
const isJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
};

// Function to set up RabbitMQ consumer
const setupRabbitMQConsumer = async () => {
  try {
    await connectRabbitMQ();
    console.log('RabbitMQ connection established');

    const channel = getChannel();
    if (channel) {
      channel.consume('esp32/access', async (msg: ConsumeMessage | null) => {
        if (msg) {
          const messageContent = msg.content.toString();
          console.log('Received message:', messageContent);

          if (isJSON(messageContent)) {
            const data = JSON.parse(messageContent);
            try {
              await processAccessRequest(data);
            } catch (error) {
              console.error('Error processing access request:', error);
            }
          } else {
            console.log('Received message is not valid JSON:', messageContent);
          }
          channel.ack(msg);
        }
      });
    } else {
      console.error('Failed to create RabbitMQ channel');
    }
  } catch (error) {
    console.error('Failed to establish RabbitMQ connection', error);
    setTimeout(setupRabbitMQConsumer, 5000); // Retry connection after 5 seconds
  }
};

// Initialize RabbitMQ consumer
setupRabbitMQConsumer();

// WebSocket connection handler
wss.on('connection', (ws: WebSocket) => {
  ws.on('message', async (message: string) => {
    if (!isJSON(message)) {
      ws.send(JSON.stringify({ status: 'error', message: 'Received message is not valid JSON' }));
      return;
    }

    try {
      const data: { action: string; payload: any } = JSON.parse(message);

      // Connect and get a new RabbitMQ channel for each message
      await connectRabbitMQ(); // Ensure connection is established
      const channel = getChannel();
      if (!channel) {
        ws.send(JSON.stringify({ status: 'error', message: 'RabbitMQ channel not available' }));
        return;
      }

      switch (data.action) {
        case 'publishMessage':
          try {
            await channel.assertQueue(data.payload.topic, { durable: true });
            channel.sendToQueue(data.payload.topic, Buffer.from(data.payload.message));
            ws.send(JSON.stringify({ action: 'publishMessage', status: 'success' }));
          } catch (error) {
            console.error('Error publishing message:', error);
            ws.send(JSON.stringify({ action: 'publishMessage', status: 'error', message: 'Failed to publish message' }));
          }
          break;

        case 'subscribeTopic':
          try {
            await channel.assertQueue(data.payload.topic, { durable: true });
            channel.consume(data.payload.topic, (msg: ConsumeMessage | null) => {
              if (msg) {
                ws.send(JSON.stringify({ action: 'message', topic: data.payload.topic, message: msg.content.toString() }));
                channel.ack(msg);
              }
            });
            ws.send(JSON.stringify({ action: 'subscribeTopic', status: 'success' }));
          } catch (error) {
            console.error('Error subscribing to topic:', error);
            ws.send(JSON.stringify({ action: 'subscribeTopic', status: 'error', message: 'Failed to subscribe to topic' }));
          }
          break;

        default:
          if (data.action.startsWith('admin')) {
            handleAdminMessages(message, ws);
          } else if (data.action.startsWith('employee')) {
            handleEmployeeMessages(message, ws);
          } else {
            ws.send(JSON.stringify({ status: 'error', message: 'Acción no reconocida' }));
            console.log(`Unrecognized action: ${data.action}`);
          }
          break;
      }
    } catch (error) {
      console.error('Failed to process message:', error);
      ws.send(JSON.stringify({ status: 'error', message: 'Failed to process message' }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Start WebSocket server
wss.on('listening', () => {
  console.log(`WebSocket server running on ws://localhost:${port}`);
});
