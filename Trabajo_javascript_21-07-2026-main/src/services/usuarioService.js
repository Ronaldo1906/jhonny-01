const bcrypt = require("bcryptjs");
const usuariosModel = require("../models/usuariosModel");

const crearError = (mensaje, status) => {
    const error = new Error(mensaje);
    error.status = status;
    return error;
};

const sinClave = (usuario) => {
    const { clave, ...resto } = usuario;
    return resto;
};

const validarId = (id) => {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0) {
        throw crearError("El id debe ser un número entero positivo", 400);
    }
    return numero;
};

const listarUsuarios = async () => {
    const usuarios = await usuariosModel.listarUsuarios();
    return usuarios.map(sinClave);
};

const obtenerUsuario = async (id) => {
    const idNumero = validarId(id);
    const usuario = await usuariosModel.buscarPorId(idNumero);
    if (!usuario) {
        throw crearError("Usuario no encontrado", 404);
    }
    return sinClave(usuario);
};

const crearUsuario = async ({ email, name, clave }) => {
    if (!email || !clave) {
        throw crearError("email y clave son obligatorios", 400);
    }

    const existe = await usuariosModel.buscarPorEmail(email);
    if (existe) {
        throw crearError("Ya existe un usuario con ese email", 409);
    }

    const claveEncriptada = await bcrypt.hash(clave, 10);
    const usuario = await usuariosModel.crearUsuario({
        email,
        name,
        clave: claveEncriptada,
    });

    return sinClave(usuario);
};

const actualizarUsuario = async (id, { email, name, clave }) => {
    const idNumero = validarId(id);

    const actual = await usuariosModel.buscarPorId(idNumero);
    if (!actual) {
        throw crearError("Usuario no encontrado", 404);
    }

    const data = {};

    if (email !== undefined && email !== actual.email) {
        const otro = await usuariosModel.buscarPorEmail(email);
        if (otro) {
            throw crearError("Ya existe un usuario con ese email", 409);
        }
        data.email = email;
    }

    if (name !== undefined) {
        data.name = name;
    }

    if (clave !== undefined) {
        data.clave = await bcrypt.hash(clave, 10);
    }

    if (Object.keys(data).length === 0) {
        throw crearError("No hay datos para actualizar", 400);
    }

    const usuario = await usuariosModel.actualizarUsuario(idNumero, data);
    return sinClave(usuario);
};

const eliminarUsuario = async (id) => {
    const idNumero = validarId(id);

    const existe = await usuariosModel.buscarPorId(idNumero);
    if (!existe) {
        throw crearError("Usuario no encontrado", 404);
    }

    await usuariosModel.eliminarUsuario(idNumero);
    return { mensaje: "Usuario eliminado correctamente" };
};

const ingresarUsuario = async ({ email, clave }) => {
    if (!email || !clave) {
        throw crearError("email y clave son obligatorios", 400);
    }

    const usuario = await usuariosModel.buscarPorEmail(email);
    if (!usuario) {
        throw crearError("Credenciales inválidas", 401);
    }

    const claveValida = await bcrypt.compare(clave, usuario.clave);
    if (!claveValida) {
        throw crearError("Credenciales inválidas", 401);
    }

    return sinClave(usuario);
};

module.exports = {
    listarUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    ingresarUsuario,
};