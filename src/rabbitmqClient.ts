import amqp from 'amqplib';

const RABBITMQ_URL = 'amqp://guest:guest@34.228.216.244:5672';

let channel: amqp.Channel;

const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue('esp32/access', { durable: true });
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('Failed to connect to RabbitMQ', error);
    }
};

const getChannel = () => channel;

export { connectRabbitMQ, getChannel };
