import amqp from 'amqplib';
import { processAccessRequest } from './employees/services/processAccessRequest';

const RABBITMQ_URL = 'amqp://guest:guest@3.92.131.250:5672';
const QUEUE_NAME = 'esp32/access';
const TOPIC_KEY = 'esp32Cam.mqtt';

let channel: amqp.Channel | null = null; // Inicializar como null para indicar que puede estar no inicializado

const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        await channel.bindQueue(QUEUE_NAME, 'amq.topic', TOPIC_KEY); 
        console.log('Connected to RabbitMQ and queue bound to topic');
        listenForMessages();  
    } catch (error) {
        console.error('Failed to connect to RabbitMQ', error);
    }
};

const listenForMessages = () => {
    if (!channel) {
        console.error('Channel is not initialized');
        return;
    }

    channel.consume(QUEUE_NAME, async (msg) => {
        if (msg !== null) {
            const messageContent = msg.content.toString();
            console.log('Received message:', messageContent);

           
            try {
                const data = JSON.parse(messageContent);
                if (data.idCard && data.action) {
                    await processAccessRequest(data);
                } else {
                    console.log('Invalid message format');
                }
            } catch (error) {
                console.error('Failed to process message:', error);
            }

            channel?.ack(msg); 
        }
    }, { noAck: false });
};

const getChannel = () => channel;

export { connectRabbitMQ, getChannel };

connectRabbitMQ();
