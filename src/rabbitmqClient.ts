import amqp from 'amqplib';
import { processAccessRequest } from './employees/services/processAccessRequest';

const RABBITMQ_URL = 'amqp://guest:guest@3.92.131.250:5672';

let channel: amqp.Channel;

const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue('esp32/access', { durable: true });
        console.log('Connected to RabbitMQ');
        listenForMessages();  // Start listening for messages
    } catch (error) {
        console.error('Failed to connect to RabbitMQ', error);
    }
};

const listenForMessages = () => {
    if (!channel) {
        console.error('Channel is not initialized');
        return;
    }

    channel.consume('esp32/access', async (msg) => {
        if (msg !== null) {
            const messageContent = msg.content.toString();
            console.log('Received message:', messageContent);

            // Assuming the messageContent is a JSON string with idCard and imagePath
            try {
                const data = JSON.parse(messageContent);
                if (data.idCard && data.imagePath && data.action) {
                    await processAccessRequest(data);
                } else {
                    console.log('Invalid message format');
                }
            } catch (error) {
                console.error('Failed to process message:', error);
            }

            channel.ack(msg);
        }
    }, { noAck: false });
};

const getChannel = () => channel;

export { connectRabbitMQ, getChannel };

// Call connectRabbitMQ to establish the connection
connectRabbitMQ();
