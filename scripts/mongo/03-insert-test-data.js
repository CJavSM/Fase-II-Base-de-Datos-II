// ====================================================
// INSERCIÓN DE DATOS DE PRUEBA
// Base de Datos: pollo_sanjuanero
// ====================================================

print("====================================================");
print("INSERTANDO DATOS DE PRUEBA");
print("====================================================");

db = db.getSiblingDB('pollo_sanjuanero');

// ====================================================
// 1. RUTAS DE ENTREGA
// ====================================================
print("\n1. Insertando rutas de entrega...");

const rutas = [
    {
        _id: "RUTA001",
        fecha: "2025-10-30",
        conductor: "Juan Pérez",
        vehiculo: "Placas P123ABC",
        coordenadas: [
            { lat: 14.6349, lon: -90.5069, hora: "08:00" },
            { lat: 14.6350, lon: -90.5075, hora: "08:30" },
            { lat: 14.6355, lon: -90.5080, hora: "09:00" },
            { lat: 14.6360, lon: -90.5085, hora: "09:30" }
        ],
        estado: "completada"
    },
    {
        _id: "RUTA002",
        fecha: "2025-10-31",
        conductor: "María López",
        vehiculo: "Placas P456DEF",
        coordenadas: [
            { lat: 14.6200, lon: -90.5100, hora: "07:00" },
            { lat: 14.6210, lon: -90.5110, hora: "07:45" },
            { lat: 14.6220, lon: -90.5120, hora: "08:30" }
        ],
        estado: "completada"
    },
    {
        _id: "RUTA003",
        fecha: "2025-11-01",
        conductor: "Carlos Rodríguez",
        vehiculo: "Placas P789GHI",
        coordenadas: [
            { lat: 14.6400, lon: -90.5200, hora: "06:30" },
            { lat: 14.6410, lon: -90.5210, hora: "07:15" }
        ],
        estado: "en_progreso"
    },
    {
        _id: "RUTA004",
        fecha: "2025-11-02",
        conductor: "Ana Martínez",
        vehiculo: "Placas P321JKL",
        coordenadas: [
            { lat: 14.6500, lon: -90.5300, hora: "08:00" },
            { lat: 14.6505, lon: -90.5305, hora: "08:20" },
            { lat: 14.6510, lon: -90.5310, hora: "08:40" },
            { lat: 14.6515, lon: -90.5315, hora: "09:00" },
            { lat: 14.6520, lon: -90.5320, hora: "09:20" }
        ],
        estado: "completada"
    },
    {
        _id: "RUTA005",
        fecha: "2025-11-03",
        conductor: "Luis García",
        vehiculo: "Placas P654MNO",
        coordenadas: [
            { lat: 14.6100, lon: -90.5050, hora: "07:30" }
        ],
        estado: "pendiente"
    },
    {
        _id: "RUTA006",
        fecha: "2025-11-04",
        conductor: "Pedro Hernández",
        vehiculo: "Placas P987PQR",
        coordenadas: [
            { lat: 14.6250, lon: -90.5150, hora: "09:00" },
            { lat: 14.6255, lon: -90.5155, hora: "09:30" },
            { lat: 14.6260, lon: -90.5160, hora: "10:00" }
        ],
        estado: "completada"
    }
];

try {
    // Usar bulkWrite con upsert para evitar errores por duplicados y permitir re-ejecución segura
    const opsRutas = rutas.map(r => ({ replaceOne: { filter: { _id: r._id }, replacement: r, upsert: true } }));
    const resultRutas = db.rutas_entrega.bulkWrite(opsRutas);
    const rutasCount = (resultRutas.nUpserted || 0) + (resultRutas.nModified || 0);
    print(`   ✓ ${rutasCount} rutas insertadas/actualizadas`);
} catch (e) {
    print("   ✗ Error al insertar rutas: " + e.message);
}

// ====================================================
// 2. COMENTARIOS DE CLIENTES
// ====================================================
print("\n2. Insertando comentarios de clientes...");

const comentarios = [
    {
        _id: "COM001",
        cliente_id: "CLI1",
        fecha: "2025-10-29",
        comentario: "Excelente servicio, el producto llegó fresco y a tiempo",
        calificacion: 5
    },
    {
        _id: "COM002",
        cliente_id: "CLI2",
        fecha: "2025-10-30",
        comentario: "Buena calidad pero el tiempo de entrega fue mayor al esperado",
        calificacion: 4
    },
    {
        _id: "COM003",
        cliente_id: "CLI3",
        fecha: "2025-10-30",
        comentario: "Producto de calidad regular, esperaba mejor presentación",
        calificacion: 3
    },
    {
        _id: "COM004",
        cliente_id: "CLI1",
        fecha: "2025-10-31",
        comentario: "Muy satisfechos con la compra, volveremos a ordenar",
        calificacion: 5
    },
    {
        _id: "COM005",
        cliente_id: "CLI4",
        fecha: "2025-11-01",
        comentario: "Buen servicio al cliente y producto fresco",
        calificacion: 5
    },
    {
        _id: "COM006",
        cliente_id: "CLI2",
        fecha: "2025-11-01",
        comentario: "El conductor fue muy amable y profesional",
        calificacion: 4
    },
    {
        _id: "COM007",
        cliente_id: "CLI5",
        fecha: "2025-11-02",
        comentario: "Primera vez que ordenamos y quedamos muy contentos",
        calificacion: 5
    },
    {
        _id: "COM008",
        cliente_id: "CLI3",
        fecha: "2025-11-02",
        comentario: "El empaque podría mejorar, pero el producto es bueno",
        calificacion: 4
    },
    {
        _id: "COM009",
        cliente_id: "CLI1",
        fecha: "2025-11-03",
        comentario: "Siempre confiables, son nuestro proveedor principal",
        calificacion: 5
    },
    {
        _id: "COM010",
        cliente_id: "CLI4",
        fecha: "2025-11-03",
        comentario: "Servicio aceptable, nada extraordinario",
        calificacion: 3
    }
];

try {
    const opsComentarios = comentarios.map(c => ({ replaceOne: { filter: { _id: c._id }, replacement: c, upsert: true } }));
    const resultComentarios = db.comentarios_clientes.bulkWrite(opsComentarios);
    const comentariosCount = (resultComentarios.nUpserted || 0) + (resultComentarios.nModified || 0);
    print(`   ✓ ${comentariosCount} comentarios insertados/actualizados`);
} catch (e) {
    print("   ✗ Error al insertar comentarios: " + e.message);
}

// ====================================================
// 3. HISTORIAL DE FALLAS
// ====================================================
print("\n3. Insertando historial de fallas...");

const fallas = [
    {
        _id: "FALLA001",
        fecha_reporte: "2025-10-28",
        area: "Transporte",
        descripcion: "Falla en sistema de refrigeración del vehículo P123ABC, temperatura subió a 15°C",
        resuelto: true,
        fecha_resolucion: "2025-10-28",
        responsable: "Mantenimiento - Jorge Díaz"
    },
    {
        _id: "FALLA002",
        fecha_reporte: "2025-10-29",
        area: "Producción",
        descripcion: "Retraso en línea de empaque por falla en máquina selladora automática",
        resuelto: true,
        fecha_resolucion: "2025-10-30",
        responsable: "Producción - Sandra Ruiz"
    },
    {
        _id: "FALLA003",
        fecha_reporte: "2025-10-30",
        area: "Almacén",
        descripcion: "Sistema de inventario mostró discrepancias con stock físico en cámara fría 2",
        resuelto: false
    },
    {
        _id: "FALLA004",
        fecha_reporte: "2025-10-31",
        area: "Distribución",
        descripcion: "Vehículo P456DEF presentó falla en motor durante ruta de entrega",
        resuelto: true,
        fecha_resolucion: "2025-11-01",
        responsable: "Mantenimiento - Mario Castro"
    },
    {
        _id: "FALLA005",
        fecha_reporte: "2025-11-01",
        area: "Sistemas",
        descripcion: "Caída temporal del sistema de facturación, duración aproximada 2 horas",
        resuelto: true,
        fecha_resolucion: "2025-11-01",
        responsable: "TI - Laura Méndez"
    },
    {
        _id: "FALLA006",
        fecha_reporte: "2025-11-02",
        area: "Mantenimiento",
        descripcion: "Compresor de cámara fría 1 presenta ruidos anormales, requiere revisión preventiva",
        resuelto: false
    },
    {
        _id: "FALLA007",
        fecha_reporte: "2025-11-03",
        area: "Transporte",
        descripcion: "GPS del vehículo P789GHI dejó de transmitir ubicación durante 3 horas",
        resuelto: true,
        fecha_resolucion: "2025-11-03",
        responsable: "Sistemas - Carlos Vega"
    },
    {
        _id: "FALLA008",
        fecha_reporte: "2025-11-03",
        area: "Producción",
        descripcion: "Detector de metales requiere calibración, activación de falsas alarmas",
        resuelto: false
    }
];

try {
    const opsFallas = fallas.map(f => ({ replaceOne: { filter: { _id: f._id }, replacement: f, upsert: true } }));
    const resultFallas = db.historial_fallas.bulkWrite(opsFallas);
    const fallasCount = (resultFallas.nUpserted || 0) + (resultFallas.nModified || 0);
    print(`   ✓ ${fallasCount} fallas insertadas/actualizadas`);
} catch (e) {
    print("   ✗ Error al insertar fallas: " + e.message);
}

// ====================================================
// RESUMEN Y ESTADÍSTICAS
// ====================================================
print("\n====================================================");
print("RESUMEN DE DATOS INSERTADOS:");
print("====================================================");

print("\nEstadísticas por colección:");
print(`  - rutas_entrega: ${db.rutas_entrega.countDocuments()} documentos`);
print(`  - comentarios_clientes: ${db.comentarios_clientes.countDocuments()} documentos`);
print(`  - historial_fallas: ${db.historial_fallas.countDocuments()} documentos`);

print("\nEstadísticas de rutas:");
const estadosRutas = db.rutas_entrega.aggregate([
    { $group: { _id: "$estado", total: { $sum: 1 } } },
    { $sort: { total: -1 } }
]).toArray();
estadosRutas.forEach(e => print(`  - ${e._id}: ${e.total} rutas`));

print("\nPromedio de calificaciones:");
const avgCalificacion = db.comentarios_clientes.aggregate([
    { $group: { _id: null, promedio: { $avg: "$calificacion" } } }
]).toArray();
print(`  - Calificación promedio: ${avgCalificacion[0].promedio.toFixed(2)} / 5.0`);

print("\nFallas por área:");
const fallasPorArea = db.historial_fallas.aggregate([
    { $group: { _id: "$area", total: { $sum: 1 }, resueltas: { $sum: { $cond: ["$resuelto", 1, 0] } } } },
    { $sort: { total: -1 } }
]).toArray();
fallasPorArea.forEach(f => print(`  - ${f._id}: ${f.total} fallas (${f.resueltas} resueltas)`));

print("\n====================================================");
print("DATOS DE PRUEBA INSERTADOS CORRECTAMENTE");
print("====================================================");