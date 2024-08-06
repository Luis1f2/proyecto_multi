import amqp from 'amqplib';
import { processAccessRequest } from './employees/services/processAccessRequest';

const RABBITMQ_URL = 'amqp://Admin:0000@3.92.131.250:5672';
const QUEUE_NAME = 'esp32/access';
const TOPIC_KEY = 'esp32.mqtt';

let channel: amqp.Channel;

// Función para conectar a RabbitMQ y establecer el canal y la cola
const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        await channel.bindQueue(QUEUE_NAME, 'amq.topic', TOPIC_KEY);
        console.log('Connected to RabbitMQ and queue bound to topic');
        listenForMessages();  
    } catch (error) {
        if (error instanceof Error) {
            console.error('Failed to connect to RabbitMQ:', error.message);
        } else {
            console.error('Unexpected error:', error);
        }
        setTimeout(connectRabbitMQ, 5000); // Reintentar la conexión después de 5 segundos
    }
};

// Función para escuchar mensajes de la cola y procesarlos
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

                // Verificar la acción y procesar el mensaje si es necesario
                if (data.action === 'validateAccessKey' && data.payload && data.payload.idCard && data.payload.accessKey) {
                    await processAccessRequest(data);
                } else {
                    console.log('Ignoring non-validateAccessKey message or message with missing required fields.');
                    console.log(`Non-critical message received: ${messageContent}`);
                }

                // Acknowledge el mensaje después de procesarlo correctamente
                channel.ack(msg);
            } catch (error) {
                if (error instanceof SyntaxError) {
                    console.error('JSON parse error:', error.message);
                } else if (error instanceof Error) {
                    console.error('Failed to process message:', error.message);
                } else {
                    console.error('Unexpected error:', error);
                }
                console.error('Invalid message content:', messageContent);

                // Opcional: puedes manejar el nack si es necesario, dependiendo del manejo de errores deseado
                // channel.nack(msg, false, false);
            }
        }
    }, { noAck: false }); // Asegurar que noAck es false para manejar acks manuales
};

// Función para obtener el canal actual
const getChannel = () => channel;

// Exportar las funciones necesarias
export { connectRabbitMQ, getChannel };

// Establecer la conexión inicial a RabbitMQ
connectRabbitMQ();
