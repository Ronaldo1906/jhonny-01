const ormprisma = require("../config/conexion");

const listarUsuarios = async () => {
    return await ormprisma.usuarios.findMany();
};

const buscarPorId = async (id) => {
    return await ormprisma.usuarios.findUnique({ where: { id } });
};

const buscarPorEmail = async (email) => {
    return await ormprisma.usuarios.findUnique({ where: { email } });
};

const crearUsuario = async ({ email, name, clave }) => {
    return await ormprisma.usuarios.create({
        data: { email, name, clave },
    });
};

const actualizarUsuario = async (id, data) => {
    return await ormprisma.usuarios.update({
        where: { id },
        data,
    });
};

const eliminarUsuario = async (id) => {
    return await ormprisma.usuarios.delete({ where: { id } });
};

module.exports = {
    listarUsuarios,
    buscarPorId,
    buscarPorEmail,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
};