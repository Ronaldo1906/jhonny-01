const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuariosController");
const ormprisma = require("../config/conexion");

router.get("/listar", usuariosController.listarUsuarios);
router.get("/obtener/:id", usuariosController.obtenerUsuario);
router.post("/crear", usuariosController.crearUsuario);
router.put("/actualizar/:id", usuariosController.actualizarUsuario);
router.delete("/eliminar/:id", usuariosController.eliminarUsuario);
router.post("/ingresar", usuariosController.ingresarUsuario);

router.get("/ping", (req, res) => res.json({ ok: true }));

router.get("/test-db", async (req, res) => {
    console.log("1. entró a test-db");
    try {
        const datos = await ormprisma.usuarios.findMany();
        console.log("2. consulta lista:", datos.length);
        res.json(datos);
    } catch (e) {
        console.error("3. error:", e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;