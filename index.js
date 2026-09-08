import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const miPuerto = process.env.MIPUERTO || 3333;

app.use(express.json());

// Obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rutaProductos = path.join(__dirname, "datosProductos.json");

const leerProductos = () => JSON.parse(fs.readFileSync(rutaProductos, "utf-8"));
const guardarProductos = (data) => fs.writeFileSync(rutaProductos, JSON.stringify(data, null, 2));

app.get("/", (req, res) => res.send("<h1>Api Rest Productos la 80 (ES Modules)</h1>"));

app.get("/api/productos", (req, res) => res.json(leerProductos()));

app.get("/api/productos/:id", (req, res) => {
  const productos = leerProductos();
  const producto = productos.find((p) => p.id === parseInt(req.params.id));
  if (!producto) return res.status(404).json({ mensaje: "Producto no encontrado" });
  res.json(producto);
});

app.post("/api/productos", (req, res) => {
  const { nombre, precio, stock, categoria } = req.body;
  if (!nombre || precio === undefined || stock === undefined || !categoria || precio <= 0 || stock < 0) {
    return res.status(400).json({ error: "Bad Request: Validación fallida." });
  }
  const productos = leerProductos();
  const nuevoProducto = {
    id: productos.length > 0 ? productos[productos.length - 1].id + 1 : 1,
    nombre,
    precio,
    stock,
    categoria,
    imagen: null,
  };
  productos.push(nuevoProducto);
  guardarProductos(productos);
  res.status(201).json(nuevoProducto);
});

app.put("/api/productos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, precio, stock, categoria } = req.body;
  const productos = leerProductos();
  const idx = productos.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ mensaje: "Producto no encontrado" });

  if (!nombre || precio === undefined || stock === undefined || !categoria || precio <= 0 || stock < 0) {
    return res.status(400).json({ error: "Bad Request: Validación fallida." });
  }

  productos[idx] = { ...productos[idx], nombre, precio, stock, categoria };
  guardarProductos(productos);
  res.json(productos[idx]);
});

app.delete("/api/productos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let productos = leerProductos();
  if (!productos.some((p) => p.id === id)) return res.status(404).json({ mensaje: "Producto no encontrado" });

  productos = productos.filter((p) => p.id !== id);
  guardarProductos(productos);
  res.json({ mensaje: "Eliminado con éxito" });
});

app.listen(miPuerto, () => {
  console.log(`SERVIDOR ES MODULES: http://localhost:${miPuerto}`);
});