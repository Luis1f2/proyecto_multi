import mqtt from 'mqtt';
import { processAccessRequest } from './employees/services/processAccessRequest';

const client = mqtt.connect('mqtt://localhost:1883'); // Reemplaza con la URL de tu broker MQTT

client.on('connect', () => {
  console.log('Conectado al broker MQTT');
  client.subscribe('esp32/access', (err) => {
    if (!err) {
      console.log('Suscrito al tema esp32/access');
    }
  });
});

client.on('error', (err) => {
  console.error('Error al conectar al broker MQTT:', err);
});

client.on('message', (topic, message) => {
  if (topic === 'esp32/access') {
    const data = JSON.parse(message.toString());
    processAccessRequest(data);
  }
});

export default client;
