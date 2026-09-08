require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const miPuerto = process.env.MIPUERTO || 3333;
const rutaProductos = path.join(__dirname, "datosProductos.json");

// ==========================================
// MIDDLEWARES GLOBALES
// ==========================================

// 1. Middleware para procesar JSON en el req.body
app.use(express.json());

// 2. Middleware Custom: Logger de peticiones a la consola
app.use((req, res, next) => {
  const fecha = new Date().toISOString();
  console.log(`[${fecha}] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// FUNCIONES AUXILIARES DE ARCHIVO (JSON)
// ==========================================
const leerProductos = () => {
  const data = fs.readFileSync(rutaProductos, "utf-8");
  return JSON.parse(data);
};

const guardarProductos = (data) => {
  fs.writeFileSync(rutaProductos, JSON.stringify(data, null, 2));
};

// ==========================================
// MIDDLEWARE CUSTOM DE VALIDACIÓN DE PRODUCTO
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
      mensaje:
        "Campos obligatorios requeridos: 'nombre' (string), 'precio' (number > 0), 'stock' (entero positivo >= 0) y 'categoria' (string).",
    });
  }

  next(); // Si la validación pasa, continúa al siguiente handler
};

// ==========================================
// ENDPOINTS DE LA API
// ==========================================

// Endpoint raíz
app.get("/", (req, res) => {
  res.send("<h1>Api Rest Productos la 80</h1>");
});

// GET /api/productos: Listar todos
app.get("/api/productos", (req, res) => {
  const productos = leerProductos();
  res.json(productos);
});

// GET /api/productos/:id: Obtener por ID
app.get("/api/productos/:id", (req, res) => {
  const productos = leerProductos();
  const idParam = parseInt(req.params.id);
  const producto = productos.find((p) => p.id === idParam);

  if (!producto) {
    return res.status(404).json({ error: "404 Not Found", mensaje: "Producto no encontrado" });
  }
  res.json(producto);
});

// POST /api/productos: Crear (Usa el middleware de validación)
app.post("/api/productos", validarProductoBody, (req, res) => {
  const { nombre, precio, stock, categoria } = req.body;
  const productos = leerProductos();
  
  const nuevoId = productos.length > 0 ? productos[productos.length - 1].id + 1 : 1;

  const nuevoProducto = {
    id: nuevoId,
    nombre: nombre.trim(),
    precio,
    stock,
    categoria: categoria.trim(),
    imagen: null, // Asignado temporalmente según requisitos del taller
  };

  productos.push(nuevoProducto);
  guardarProductos(productos);

  res.status(201).json({
    mensaje: "Producto creado correctamente",
    producto: nuevoProducto,
  });
});

// PUT /api/productos/:id: Actualizar (Usa el middleware de validación)
app.put("/api/productos/:id", validarProductoBody, (req, res) => {
  const idParam = parseInt(req.params.id);
  const { nombre, precio, stock, categoria } = req.body;
  const productos = leerProductos();

  const index = productos.findIndex((p) => p.id === idParam);
  if (index === -1) {
    return res.status(404).json({ error: "404 Not Found", mensaje: "Producto no encontrado" });
  }

  productos[index] = {
    ...productos[index],
    nombre: nombre.trim(),
    precio,
    stock,
    categoria: categoria.trim(),
  };

  guardarProductos(productos);
  res.json({ mensaje: "Producto actualizado con éxito", producto: productos[index] });
});

// DELETE /api/productos/:id: Eliminar por ID
app.delete("/api/productos/:id", (req, res) => {
  const idParam = parseInt(req.params.id);
  let productos = leerProductos();

  const existe = productos.some((p) => p.id === idParam);
  if (!existe) {
    return res.status(404).json({ error: "404 Not Found", mensaje: "Producto no encontrado" });
  }

  productos = productos.filter((p) => p.id !== idParam);
  guardarProductos(productos);

  res.json({ mensaje: `Producto con ID ${idParam} eliminado correctamente` });
});

// ==========================================
// MIDDLEWARES FINALIZADORES Y DE MANEJO DE ERRORES
// ==========================================

// Middleware para capturar rutas 404 no existentes
app.use((req, res) => {
  res.status(404).json({
    error: "404 Not Found",
    mensaje: `La ruta o recurso '${req.originalUrl}' no existe en este servidor.`,
  });
});

// Middleware Global de Manejo de Errores (4 argumentos obligatorios)
app.use((err, req, res, next) => {
  console.error("Error interno del servidor:", err.stack);
  res.status(500).json({
    error: "500 Internal Server Error",
    mensaje: "Ocurrió un error inesperado en el servidor.",
  });
});

// Iniciar Servidor
app.listen(miPuerto, () => {
  console.log(`SERVIDOR COMMONJS: http://localhost:${miPuerto}`);
});