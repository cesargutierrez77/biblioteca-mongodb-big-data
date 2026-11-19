# Gestión de préstamos de una biblioteca de barrio con MongoDB

Trabajo de la **Tarea 4 – Almacenamiento y Consultas de Datos en Big Data**
Curso: Big Data (202016911) – Universidad Nacional Abierta y a Distancia (UNAD)

Autor: [Nombre completo del estudiante]

## Descripción

Caso de uso de una biblioteca de barrio que administra libros, socios y préstamos.
Los datos no son uniformes: los libros tienen campos distintos según su categoría y los
préstamos cambian según su estado (devuelto, activo, atrasado o cancelado). Por eso se
utiliza MongoDB, una base de datos NoSQL documental.

## Base de datos

- **Base de datos:** `biblioteca_barrio`
- **Datos de prueba:** 185 documentos

| Colección   | Documentos | Campos |
|-------------|-----------:|--------|
| `libros`    | 35  | `_id`, `titulo`, `autor`, `categoria`, `anio`, `copias_disponibles`. Opcionales: `genero` (novelas); `edicion` y `area` (libros técnicos) |
| `socios`    | 30  | `_id`, `nombre`, `ciudad`, `fecha_inscripcion`, `membresia` |
| `prestamos` | 120 | `_id`, `libro_id`, `socio_id`, `fecha_prestamo`, `estado`. Según el estado: `fecha_devolucion`, `multa` o `motivo_cancelacion` |

La colección `prestamos` se relaciona con `libros` y `socios` mediante `libro_id` y `socio_id`.

## Archivos

| Archivo         | Contenido |
|-----------------|-----------|
| `libros.json`   | Datos de prueba de la colección `libros` |
| `socios.json`   | Datos de prueba de la colección `socios` |
| `prestamos.json`| Datos de prueba de la colección `prestamos` |
| `consultas.js`  | Consultas de MongoDB: CRUD, filtros con operadores, `$lookup` y agregaciones |

## Cómo reproducirlo con MongoDB Compass

1. Conectarse a `mongodb://localhost:27017`.
2. Crear la base de datos `biblioteca_barrio` con la colección `libros`.
3. En cada colección usar **Add Data → Import JSON or CSV file** e importar el archivo
   correspondiente (`libros.json`, `socios.json`, `prestamos.json`). Crear primero las
   colecciones `socios` y `prestamos`.
4. Abrir la terminal MongoDB Shell y verificar:

```js
use("biblioteca_barrio")
db.libros.countDocuments()     // 35
db.socios.countDocuments()     // 30
db.prestamos.countDocuments()  // 120
```

5. Ejecutar las consultas de `consultas.js` una por una.

## Consultas incluidas

- **Básicas:** `insertOne`, `insertMany`, `find`, `updateOne`, `updateMany`, `deleteOne`, `deleteMany`.
- **Filtros con operadores:** `$gt`, `$gte`, `$in`, `$and`, `$or`, `$exists`.
- **Join:** `$lookup` entre `prestamos`, `libros` y `socios`.
- **Agregaciones:** conteo, suma, promedio, máximo y mínimo con `$group`, `$match` y `$sort`.

> Nota: las consultas de eliminación y la actualización masiva modifican los datos.
> Si se necesita repetirlas, volver a importar el archivo JSON de la colección.
