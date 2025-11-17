// ====================================================
// CONSULTAS EN MONGODB - DEMOSTRACIÓN
// Base de Datos: pollo_sanjuanero
// ====================================================

print("====================================================");
print("EJECUTANDO CONSULTAS EN MONGODB");
print("====================================================");

db = db.getSiblingDB('pollo_sanjuanero');

// ====================================================
// CONSULTAS SOBRE RUTAS DE ENTREGA
// ====================================================
print("\n========== CONSULTAS: RUTAS DE ENTREGA ==========\n");

print("1. Listar todas las rutas completadas:");
const rutasCompletadas = db.rutas_entrega.find({ estado: "completada" }).toArray();
print(`   Total de rutas completadas: ${rutasCompletadas.length}`);
rutasCompletadas.forEach(r => print(`   - ${r._id}: ${r.conductor} - ${r.vehiculo}`));

print("\n2. Buscar rutas por conductor específico:");
const rutasJuan = db.rutas_entrega.find({ conductor: "Juan Pérez" }).toArray();
print(`   Total de rutas de Juan Pérez: ${rutasJuan.length}`);
rutasJuan.forEach(r => print(`   - ${r._id}: ${r.fecha} - Estado: ${r.estado}`));

print("\n3. Contar rutas por estado:");
const rutasPorEstado = db.rutas_entrega.aggregate([
    { $group: { _id: "$estado", cantidad: { $sum: 1 } } },
    { $sort: { cantidad: -1 } }
]).toArray();
print("   Distribución de rutas por estado:");
rutasPorEstado.forEach(e => print(`   - ${e._id}: ${e.cantidad} rutas`));

print("\n4. Rutas con más de 3 coordenadas registradas:");
const rutasDetalladas = db.rutas_entrega.find({
    $expr: { $gt: [{ $size: "$coordenadas" }, 3] }
}).toArray();
print(`   Total de rutas con más de 3 puntos: ${rutasDetalladas.length}`);
rutasDetalladas.forEach(r => print(`   - ${r._id}: ${r.coordenadas.length} puntos registrados`));

print("\n5. Obtener primera y última coordenada de cada ruta:");
const coordenadasExtremas = db.rutas_entrega.aggregate([
    {
        $project: {
            conductor: 1,
            primera_coordenada: { $arrayElemAt: ["$coordenadas", 0] },
            ultima_coordenada: { $arrayElemAt: ["$coordenadas", -1] },
            total_puntos: { $size: "$coordenadas" }
        }
    }
]).toArray();
print("   Coordenadas extremas por ruta:");
coordenadasExtremas.forEach(r => {
    print(`   - ${r._id} (${r.conductor}):`);
    print(`     Inicio: ${r.primera_coordenada.hora} (${r.primera_coordenada.lat}, ${r.primera_coordenada.lon})`);
    print(`     Fin: ${r.ultima_coordenada.hora} (${r.ultima_coordenada.lat}, ${r.ultima_coordenada.lon})`);
});

// ====================================================
// CONSULTAS SOBRE COMENTARIOS DE CLIENTES
// ====================================================
print("\n\n========== CONSULTAS: COMENTARIOS DE CLIENTES ==========\n");

print("1. Comentarios con calificación 5 estrellas:");
const comentarios5Estrellas = db.comentarios_clientes.find({ calificacion: 5 }).toArray();
print(`   Total de comentarios con 5 estrellas: ${comentarios5Estrellas.length}`);
comentarios5Estrellas.forEach(c => print(`   - ${c._id} (${c.cliente_id}): "${c.comentario}"`));

print("\n2. Promedio de calificación por cliente:");
const promediosPorCliente = db.comentarios_clientes.aggregate([
    {
        $group: {
            _id: "$cliente_id",
            promedio_calificacion: { $avg: "$calificacion" },
            total_comentarios: { $sum: 1 }
        }
    },
    { $sort: { promedio_calificacion: -1 } }
]).toArray();
print("   Promedio de calificaciones por cliente:");
promediosPorCliente.forEach(p => {
    print(`   - ${p._id}: ${p.promedio_calificacion.toFixed(2)} estrellas (${p.total_comentarios} comentarios)`);
});

print("\n3. Comentarios recientes (últimos 5):");
const comentariosRecientes = db.comentarios_clientes.find()
    .sort({ fecha: -1 })
    .limit(5)
    .toArray();
print("   Últimos 5 comentarios:");
comentariosRecientes.forEach(c => {
    print(`   - ${c.fecha} (${c.cliente_id}): ${c.calificacion} estrellas`);
    print(`     "${c.comentario}"`);
});

print("\n4. Distribución de calificaciones:");
const distribucionCalificaciones = db.comentarios_clientes.aggregate([
    { $group: { _id: "$calificacion", cantidad: { $sum: 1 } } },
    { $sort: { _id: 1 } }
]).toArray();
print("   Calificaciones recibidas:");
distribucionCalificaciones.forEach(d => {
    const estrellas = "★".repeat(d._id);
    print(`   ${estrellas} (${d._id} estrellas): ${d.cantidad} comentarios`);
});

print("\n5. Buscar comentarios que mencionen palabras clave:");
const comentariosPositivos = db.comentarios_clientes.find({
    comentario: { $regex: /excelente|bueno|satisfecho/i }
}).toArray();
print(`   Comentarios con palabras positivas: ${comentariosPositivos.length}`);
comentariosPositivos.forEach(c => print(`   - ${c._id}: "${c.comentario}"`));

// ====================================================
// CONSULTAS SOBRE HISTORIAL DE FALLAS
// ====================================================
print("\n\n========== CONSULTAS: HISTORIAL DE FALLAS ==========\n");

print("1. Fallas no resueltas:");
const fallasNoResueltas = db.historial_fallas.find({ resuelto: false }).toArray();
print(`   Total de fallas pendientes: ${fallasNoResueltas.length}`);
fallasNoResueltas.forEach(f => {
    print(`   - ${f._id} (${f.area}): ${f.descripcion}`);
});

print("\n2. Fallas por área:");
const fallasPorArea = db.historial_fallas.aggregate([
    {
        $group: {
            _id: "$area",
            total_fallas: { $sum: 1 },
            resueltas: { $sum: { $cond: ["$resuelto", 1, 0] } },
            pendientes: { $sum: { $cond: ["$resuelto", 0, 1] } }
        }
    },
    { $sort: { total_fallas: -1 } }
]).toArray();
print("   Estadísticas de fallas por área:");
fallasPorArea.forEach(a => {
    print(`   - ${a._id}:`);
    print(`     Total: ${a.total_fallas} | Resueltas: ${a.resueltas} | Pendientes: ${a.pendientes}`);
});

print("\n3. Fallas resueltas en el mismo día:");
const fallasResueltasRapido = db.historial_fallas.find({
    $expr: { $eq: ["$fecha_reporte", "$fecha_resolucion"] }
}).toArray();
print(`   Fallas resueltas el mismo día: ${fallasResueltasRapido.length}`);
fallasResueltasRapido.forEach(f => {
    print(`   - ${f._id} (${f.area}): Resuelta por ${f.responsable}`);
});

print("\n4. Fallas más recientes:");
const fallasRecientes = db.historial_fallas.find()
    .sort({ fecha_reporte: -1 })
    .limit(5)
    .toArray();
print("   Últimas 5 fallas reportadas:");
fallasRecientes.forEach(f => {
    const estado = f.resuelto ? "✓ Resuelta" : "✗ Pendiente";
    print(`   - ${f._id} (${f.fecha_reporte}) - ${estado}`);
    print(`     ${f.area}: ${f.descripcion}`);
});

print("\n5. Tasa de resolución por área:");
const tasaResolucion = db.historial_fallas.aggregate([
    {
        $group: {
            _id: "$area",
            total: { $sum: 1 },
            resueltas: { $sum: { $cond: ["$resuelto", 1, 0] } }
        }
    },
    {
        $project: {
            area: "$_id",
            total: 1,
            resueltas: 1,
            tasa_resolucion: {
                $multiply: [
                    { $divide: ["$resueltas", "$total"] },
                    100
                ]
            }
        }
    },
    { $sort: { tasa_resolucion: -1 } }
]).toArray();
print("   Tasa de resolución por área:");
tasaResolucion.forEach(t => {
    print(`   - ${t.area}: ${t.tasa_resolucion.toFixed(1)}% (${t.resueltas}/${t.total})`);
});

// ====================================================
// CONSULTAS AGREGADAS Y COMPLEJAS
// ====================================================
print("\n\n========== CONSULTAS AGREGADAS Y COMPLEJAS ==========\n");

print("1. Resumen general de la base de datos:");
const totalRutas = db.rutas_entrega.countDocuments();
const totalComentarios = db.comentarios_clientes.countDocuments();
const totalFallas = db.historial_fallas.countDocuments();
print("   Resumen de documentos:");
print(`   - Rutas de entrega: ${totalRutas}`);
print(`   - Comentarios de clientes: ${totalComentarios}`);
print(`   - Historial de fallas: ${totalFallas}`);
print(`   - Total de documentos: ${totalRutas + totalComentarios + totalFallas}`);

print("\n2. Análisis de satisfacción del cliente:");
const analisisSatisfaccion = db.comentarios_clientes.aggregate([
    {
        $group: {
            _id: null,
            promedio_general: { $avg: "$calificacion" },
            calificacion_maxima: { $max: "$calificacion" },
            calificacion_minima: { $min: "$calificacion" },
            total_comentarios: { $sum: 1 }
        }
    }
]).toArray();
if (analisisSatisfaccion.length > 0) {
    const stats = analisisSatisfaccion[0];
    print("   Estadísticas de satisfacción:");
    print(`   - Promedio general: ${stats.promedio_general.toFixed(2)} / 5.0`);
    print(`   - Calificación máxima: ${stats.calificacion_maxima}`);
    print(`   - Calificación mínima: ${stats.calificacion_minima}`);
    print(`   - Total de evaluaciones: ${stats.total_comentarios}`);
}

print("\n3. Rendimiento operacional:");
const rutasCompletadasCount = db.rutas_entrega.countDocuments({ estado: "completada" });
const rutasTotales = db.rutas_entrega.countDocuments();
const tasaCompletitud = (rutasCompletadasCount / rutasTotales * 100).toFixed(1);
print("   Métricas de entregas:");
print(`   - Rutas completadas: ${rutasCompletadasCount}`);
print(`   - Rutas totales: ${rutasTotales}`);
print(`   - Tasa de completitud: ${tasaCompletitud}%`);

const fallasResueltasCount = db.historial_fallas.countDocuments({ resuelto: true });
const fallasTotales = db.historial_fallas.countDocuments();
const tasaResolucionGeneral = (fallasResueltasCount / fallasTotales * 100).toFixed(1);
print("\n   Métricas de mantenimiento:");
print(`   - Fallas resueltas: ${fallasResueltasCount}`);
print(`   - Fallas totales: ${fallasTotales}`);
print(`   - Tasa de resolución: ${tasaResolucionGeneral}%`);

print("\n====================================================");
print("CONSULTAS COMPLETADAS EXITOSAMENTE");
print("====================================================");