require("dotenv/config");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../generated/prisma");

console.log("DATABASE_URL cargada:", process.env.DATABASE_URL ? "sí" : "NO");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const ormprisma = new PrismaClient({ adapter });

ormprisma.$connect()
    .then(() => console.log("Conectado a Postgres"))
    .catch((e) => console.error("Error de conexión:", e));

module.exports = ormprisma;