import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const miPuerto = process.env.MIPUERTO || 3333;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rutaProductos = path.join(__dirname, "datosProductos.json");

// ==========================================
// MIDDLEWARES GLOBALES
// ==========================================
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// FUNCIONES AUXILIARES DE ARCHIVO
// ==========================================
const leerProductos = () => JSON.parse(fs.readFileSync(rutaProductos, "utf-8"));
const guardarProductos = (data) => fs.writeFileSync(rutaProductos, JSON.stringify(data, null, 2));

// ==========================================
// MIDDLEWARE DE VALIDACIÓN
// ==========================================
const validarProductoBody = (req, res, next) => {
  const { nombre, precio, stock, categoria } = req.body;

  if (
    !nombre ||
    typeof nombre !== "string" ||
    nombre.trim() === "" ||
    precio === undefined ||
    typeof precio !== "number" ||
    precio <= 0 ||
    stock === undefined ||
    typeof stock !== "number" ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    !categoria ||
    typeof categoria !== "string" ||
    categoria.trim() === ""
  ) {
    return res.status(400).json({
      status: 400,
      error: "Bad Request",
      mensaje: "Verifique que 'nombre', 'precio', 'stock' y 'categoria' cumplan con el formato correcto.",
    });
  }

  next();
};

// ==========================================
// RUTAS DE LA API
// ==========================================
app.get("/", (req, res) => res.send("<h1>Api Rest Productos la 80 (ES Modules)</h1>"));

app.get("/api/productos", (req, res) => {
  res.json(leerProductos());
});

app.get("/api/productos/:id", (req, res) => {
  const productos = leerProductos();
  const producto = productos.find((p) => p.id === parseInt(req.params.id));
  if (!producto) return res.status(404).json({ error: "404 Not Found", mensaje: "Producto no encontrado" });
  res.json(producto);
});

app.post("/api/productos", validarProductoBody, (req, res) => {
  const { nombre, precio, stock, categoria } = req.body;
  const productos = leerProductos();

  const nuevoProducto = {
    id: productos.length > 0 ? productos[productos.length - 1].id + 1 : 1,
    nombre: nombre.trim(),
    precio,
    stock,
    categoria: categoria.trim(),
    imagen: null,
  };

  productos.push(nuevoProducto);
  guardarProductos(productos);
  res.status(201).json({ mensaje: "Producto creado exitosamente", producto: nuevoProducto });
});

app.put("/api/productos/:id", validarProductoBody, (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, precio, stock, categoria } = req.body;
  const productos = leerProductos();

  const index = productos.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ error: "404 Not Found", mensaje: "Producto no encontrado" });

  productos[index] = { ...productos[index], nombre: nombre.trim(), precio, stock, categoria: categoria.trim() };
  guardarProductos(productos);

  res.json({ mensaje: "Producto actualizado correctamente", producto: productos[index] });
});

app.delete("/api/productos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let productos = leerProductos();

  if (!productos.some((p) => p.id === id)) {
    return res.status(404).json({ error: "404 Not Found", mensaje: "Producto no encontrado" });
  }

  productos = productos.filter((p) => p.id !== id);
  guardarProductos(productos);
  res.json({ mensaje: `Producto con ID ${id} eliminado con éxito` });
});

// ==========================================
// MIDDLEWARES DE MANEJO DE RUTAS NO ENCONTRADAS Y ERRORES
// ==========================================
app.use((req, res) => {
  res.status(404).json({ error: "404 Not Found", mensaje: "La ruta solicitada no existe." });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "500 Internal Server Error", mensaje: "Error interno del servidor." });
});

app.listen(miPuerto, () => {
  console.log(`SERVIDOR ES MODULES: http://localhost:${miPuerto}`);
});