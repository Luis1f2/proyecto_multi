import mqtt from 'mqtt';
import { processAccessRequest } from './employees/services/processAccessRequest';
import * as fs from 'fs';
import * as path from 'path';

const KEY = fs.readFileSync(path.resolve(__dirname, '../certs/private-key.pem.key'));
const CERT = fs.readFileSync(path.resolve(__dirname, '../certs/certificate.pem.crt'));
const CA = fs.readFileSync(path.resolve(__dirname, '../certs/AmazonRootCA1.pem'));

const client = mqtt.connect({
  host: 'your-aws-endpoint.amazonaws.com',
  port: 8883,
  protocol: 'mqtts',
  key: KEY,
  cert: CERT,
  ca: CA,
  clientId: 'your-client-id',
});

client.on('connect', () => {
  console.log('Conectado al broker MQTT de AWS');
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
