// ===============================================================
// Caso de uso: Gestión de préstamos de una biblioteca de barrio
// Base de datos: biblioteca_barrio
// Colecciones: libros (35), socios (30), prestamos (120)
// Se pueden pegar una por una en MONGOSH (la terminal integrada
// de Compass, pestaña ">_MONGOSH") y tomar captura de cada resultado.
// ===============================================================

use("biblioteca_barrio");

// ---------------------------------------------------------------
// 0. VERIFICAR LA IMPORTACIÓN
// ---------------------------------------------------------------
db.libros.countDocuments();     // esperado: 35
db.socios.countDocuments();     // esperado: 30
db.prestamos.countDocuments();  // esperado: 120

// ---------------------------------------------------------------
// 1. CONSULTAS BÁSICAS (CRUD)
// ---------------------------------------------------------------

// 1.1 INSERCIÓN: registrar un nuevo préstamo
db.prestamos.insertOne({
  _id: "P121",
  libro_id: "L001",
  socio_id: "S001",
  fecha_prestamo: new Date("2026-11-17"),
  estado: "activo"
});

// 1.1b INSERCIÓN: registrar varios libros nuevos
db.libros.insertMany([
  { _id: "L036", titulo: "Cuentos del páramo", autor: "Laura Rojas", categoria: "Cuento", anio: 2023, copias_disponibles: 3 },
  { _id: "L037", titulo: "Redes para todos", autor: "Sergio Mesa", categoria: "Técnico", anio: 2022, copias_disponibles: 2, edicion: 2, area: "Informática" }
]);

// 1.2 SELECCIÓN: libros de la categoría Novela
db.libros.find({ categoria: "Novela" });

// 1.2b SELECCIÓN: un préstamo por su id, mostrando solo algunos campos
db.prestamos.find({ _id: "P121" }, { _id: 1, libro_id: 1, socio_id: 1, estado: 1 });

// 1.3 ACTUALIZACIÓN: marcar el préstamo P121 como devuelto
db.prestamos.updateOne(
  { _id: "P121" },
  { $set: { estado: "devuelto", fecha_devolucion: new Date("2026-11-20") } }
);

// 1.3b ACTUALIZACIÓN: restar una copia disponible al libro L001
db.libros.updateOne({ _id: "L001" }, { $inc: { copias_disponibles: -1 } });

// 1.3c ACTUALIZACIÓN MASIVA: subir 1000 a todas las multas de préstamos atrasados
db.prestamos.updateMany({ estado: "atrasado" }, { $inc: { multa: 1000 } });

// 1.4 ELIMINACIÓN: borrar el préstamo P121 (el que insertamos)
db.prestamos.deleteOne({ _id: "P121" });

// 1.4b ELIMINACIÓN: borrar todos los préstamos cancelados
db.prestamos.deleteMany({ estado: "cancelado" });

// Verificar cuántos quedaron
db.prestamos.countDocuments();

// ---------------------------------------------------------------
// 2. FILTROS CON OPERADORES
// ---------------------------------------------------------------

// 2.1 $gt: libros publicados después del 2010
db.libros.find({ anio: { $gt: 2010 } });

// 2.2 $in: préstamos en estado activo o atrasado
db.prestamos.find({ estado: { $in: ["activo", "atrasado"] } });

// 2.3 $and: libros técnicos con más de 2 copias disponibles
db.libros.find({ $and: [ { categoria: "Técnico" }, { copias_disponibles: { $gt: 2 } } ] });

// 2.4 $or: socios de Sogamoso o con membresía Premium
db.socios.find({ $or: [ { ciudad: "Sogamoso" }, { membresia: "Premium" } ] });

// 2.5 $exists: préstamos que tienen multa
db.prestamos.find({ multa: { $exists: true } });

// 2.6 $gte + ordenamiento: multas de 5000 o más, de mayor a menor
db.prestamos.find({ multa: { $gte: 5000 } }).sort({ multa: -1 });

// ---------------------------------------------------------------
// 3. JOIN CON $lookup
// ---------------------------------------------------------------

// 3.1 Préstamos con los datos del libro prestado
db.prestamos.aggregate([
  { $lookup: { from: "libros", localField: "libro_id", foreignField: "_id", as: "libro" } },
  { $unwind: "$libro" },
  { $project: { _id: 1, estado: 1, "libro.titulo": 1, "libro.categoria": 1 } },
  { $limit: 10 }
]);

// 3.2 Préstamos atrasados con nombre del socio y título del libro
db.prestamos.aggregate([
  { $match: { estado: "atrasado" } },
  { $lookup: { from: "socios", localField: "socio_id", foreignField: "_id", as: "socio" } },
  { $lookup: { from: "libros", localField: "libro_id", foreignField: "_id", as: "libro" } },
  { $unwind: "$socio" },
  { $unwind: "$libro" },
  { $project: { _id: 1, multa: 1, socio: "$socio.nombre", ciudad: "$socio.ciudad", libro: "$libro.titulo" } },
  { $limit: 10 }
]);

// ---------------------------------------------------------------
// 4. AGREGACIONES (contar, sumar, promediar)
// ---------------------------------------------------------------

// 4.1 CONTAR: número de préstamos por estado
db.prestamos.aggregate([
  { $group: { _id: "$estado", total: { $sum: 1 } } },
  { $sort: { total: -1 } }
]);

// 4.2 CONTAR: préstamos por categoría de libro (usa $lookup)
db.prestamos.aggregate([
  { $lookup: { from: "libros", localField: "libro_id", foreignField: "_id", as: "libro" } },
  { $unwind: "$libro" },
  { $group: { _id: "$libro.categoria", total_prestamos: { $sum: 1 } } },
  { $sort: { total_prestamos: -1 } }
]);

// 4.3 SUMAR: total de multas
db.prestamos.aggregate([
  { $match: { multa: { $exists: true } } },
  { $group: { _id: null, total_multas: { $sum: "$multa" } } }
]);

// 4.4 PROMEDIAR: promedio de multa de los préstamos atrasados
db.prestamos.aggregate([
  { $match: { estado: "atrasado" } },
  { $group: { _id: null, promedio_multa: { $avg: "$multa" } } }
]);

// 4.5 MÁXIMO y MÍNIMO: multa mayor y menor
db.prestamos.aggregate([
  { $match: { estado: "atrasado" } },
  { $group: { _id: null, multa_maxima: { $max: "$multa" }, multa_minima: { $min: "$multa" } } }
]);

// 4.6 CONTAR: socios por ciudad
db.socios.aggregate([
  { $group: { _id: "$ciudad", total_socios: { $sum: 1 } } },
  { $sort: { total_socios: -1 } }
]);

// 4.7 PROMEDIAR: promedio de copias disponibles por categoría
db.libros.aggregate([
  { $group: { _id: "$categoria", promedio_copias: { $avg: "$copias_disponibles" }, libros: { $sum: 1 } } },
  { $sort: { promedio_copias: -1 } }
]);

// 4.8 TOP 5 socios con más préstamos (con nombre)
db.prestamos.aggregate([
  { $group: { _id: "$socio_id", total: { $sum: 1 } } },
  { $sort: { total: -1 } },
  { $limit: 5 },
  { $lookup: { from: "socios", localField: "_id", foreignField: "_id", as: "socio" } },
  { $unwind: "$socio" },
  { $project: { _id: 0, socio: "$socio.nombre", ciudad: "$socio.ciudad", total: 1 } }
]);
