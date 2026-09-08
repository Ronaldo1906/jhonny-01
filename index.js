require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const miPuerto = process.env.MIPUERTO || 3333;

// Middleware para parsear JSON en el body
app.use(express.json());

const rutaProductos = path.join(__dirname, "datosProductos.json");

// Función auxiliar para leer productos del JSON
const leerProductos = () => {
  const data = fs.readFileSync(rutaProductos, "utf-8");
  return JSON.parse(data);
};

// Función auxiliar para guardar productos en el JSON
const guardarProductos = (data) => {
  fs.writeFileSync(rutaProductos, JSON.stringify(data, null, 2));
};

// Endpoint raíz
app.get("/", (req, res) => {
  res.send("<h1>Api Rest Productos la 80</h1>");
});

// GET /api/productos: Listar todos los productos
app.get("/api/productos", (req, res) => {
  const productos = leerProductos();
  res.json(productos);
});

// GET /api/productos/:id: Obtener un producto por ID
app.get("/api/productos/:id", (req, res) => {
  const productos = leerProductos();
  const idParam = parseInt(req.params.id);
  const producto = productos.find((p) => p.id === idParam);

  if (!producto) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }
  res.json(producto);
});

// POST /api/productos: Crear un producto con validaciones
app.post("/api/productos", (req, res) => {
  const { nombre, precio, stock, categoria } = req.body;

  // Validaciones
  if (
    !nombre ||
    precio === undefined ||
    stock === undefined ||
    !categoria ||
    typeof precio !== "number" ||
    precio <= 0 ||
    typeof stock !== "number" ||
    stock < 0
  ) {
    return res.status(400).json({
      error:
        "Bad Request: Faltan campos obligatorios o no cumplen con el formato correcto.",
    });
  }

  const productos = leerProductos();
  const nuevoId = productos.length > 0 ? productos[productos.length - 1].id + 1 : 1;

  const nuevoProducto = {
    id: nuevoId,
    nombre,
    precio,
    stock,
    categoria,
    imagen: null, // Reservado para Multer
  };

  productos.push(nuevoProducto);
  guardarProductos(productos);

  res.status(201).json({ mensaje: "Producto creado exitosamente", producto: nuevoProducto });
});

// PUT /api/productos/:id: Actualizar un producto
app.put("/api/productos/:id", (req, res) => {
  const idParam = parseInt(req.params.id);
  const { nombre, precio, stock, categoria } = req.body;
  const productos = leerProductos();

  const index = productos.findIndex((p) => p.id === idParam);
  if (index === -1) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }

  // Validaciones
  if (
    !nombre ||
    precio === undefined ||
    stock === undefined ||
    !categoria ||
    typeof precio !== "number" ||
    precio <= 0 ||
    typeof stock !== "number" ||
    stock < 0
  ) {
    return res.status(400).json({
      error: "Bad Request: Datos inválidos o faltantes para actualizar.",
    });
  }

  productos[index] = {
    ...productos[index],
    nombre,
    precio,
    stock,
    categoria,
  };

  guardarProductos(productos);
  res.json({ mensaje: "Producto actualizado", producto: productos[index] });
});

// DELETE /api/productos/:id: Eliminar un producto
app.delete("/api/productos/:id", (req, res) => {
  const idParam = parseInt(req.params.id);
  let productos = leerProductos();

  const existe = productos.some((p) => p.id === idParam);
  if (!existe) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }

  productos = productos.filter((p) => p.id !== idParam);
  guardarProductos(productos);

  res.json({ mensaje: `Producto con id ${idParam} eliminado correctamente` });
});

app.listen(miPuerto, () => {
  console.log(`SERVIDOR: http://localhost:${miPuerto}`);
});