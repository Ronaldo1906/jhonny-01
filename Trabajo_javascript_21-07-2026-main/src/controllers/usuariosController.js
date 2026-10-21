const usuarioService = require("../services/usuarioService");

const manejarError = (res, error) => {
    res.status(error.status || 500).json({ error: error.message });
};

const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await usuarioService.listarUsuarios();
        res.status(200).json(usuarios);
    } catch (error) {
        manejarError(res, error);
    }
};

const obtenerUsuario = async (req, res) => {
    try {
        const usuario = await usuarioService.obtenerUsuario(req.params.id);
        res.status(200).json(usuario);
    } catch (error) {
        manejarError(res, error);
    }
};

const crearUsuario = async (req, res) => {
    try {
        const usuario = await usuarioService.crearUsuario(req.body);
        res.status(201).json(usuario);
    } catch (error) {
        manejarError(res, error);
    }
};

const actualizarUsuario = async (req, res) => {
    try {
        const usuario = await usuarioService.actualizarUsuario(req.params.id, req.body);
        res.status(200).json(usuario);
    } catch (error) {
        manejarError(res, error);
    }
};

const eliminarUsuario = async (req, res) => {
    try {
        const resultado = await usuarioService.eliminarUsuario(req.params.id);
        res.status(200).json(resultado);
    } catch (error) {
        manejarError(res, error);
    }
};

const ingresarUsuario = async (req, res) => {
    try {
        const usuario = await usuarioService.ingresarUsuario(req.body);
        res.status(200).json(usuario);
    } catch (error) {
        manejarError(res, error);
    }
};

module.exports = {
    listarUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    ingresarUsuario,
};