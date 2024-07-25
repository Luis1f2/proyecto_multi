module.exports = {
    apps: [
      {
        name: 'my-api',          // Nombre de tu aplicación
        script: './src/server.ts',  // Ruta al archivo de entrada de tu aplicación
        instances: 1,             // Número de instancias (1 es suficiente para desarrollo, puede ser más en producción)
        autorestart: true,        // Reiniciar automáticamente si la aplicación falla
        watch: false,             // Configurar para "true" si deseas reiniciar la aplicación al cambiar los archivos (útil en desarrollo)
        max_memory_restart: '1G', // Reiniciar si la aplicación usa más de 1GB de memoria
        env: {
          NODE_ENV: 'development', // Variables de entorno para el entorno de desarrollo
        },
        env_production: {
          NODE_ENV: 'production',  // Variables de entorno para el entorno de producción
        },
        exec_mode: 'cluster',      // Ejecutar en modo cluster para aprovechar múltiples núcleos de CPU
        interpreter: 'node',       // Intérprete de Node.js, puede ser necesario especificar el intérprete de TypeScript
        interpreter_args: '-r ts-node/register', // Argumentos del intérprete para ejecutar TypeScript
      },
    ],
  };
  