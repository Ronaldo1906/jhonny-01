const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres', // Cambia por el nombre de tu base de datos
  password: 'tu_contraseña', // Pon tu contraseña aquí
  port: 5432,
});

// Probar conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error conectando a PostgreSQL:', err.stack);
  } else {
    console.log('Conexión exitosa a PostgreSQL:', res.rows[0].now);
  }
});

module.exports = pool;