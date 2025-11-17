// ====================================================
// CREACIÓN DE COLECCIONES CON SCHEMA VALIDATION
// Base de Datos: pollo_sanjuanero
// ====================================================

print("====================================================");
print("CREANDO COLECCIONES CON SCHEMA VALIDATION");
print("====================================================");

// Cambiar a la base de datos
db = db.getSiblingDB('pollo_sanjuanero');

print("\n1. Creando colección: rutas_entrega");
print("   Schema: _id, fecha, conductor, vehiculo, coordenadas[], estado");

try {
    db.createCollection("rutas_entrega", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["_id", "fecha", "conductor", "vehiculo", "coordenadas", "estado"],
                properties: {
                    _id: {
                        bsonType: "string",
                        description: "ID único de la ruta (requerido)"
                    },
                    fecha: {
                        bsonType: "string",
                        pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$",
                        description: "Fecha en formato YYYY-MM-DD (requerido)"
                    },
                    conductor: {
                        bsonType: "string",
                        minLength: 3,
                        description: "Nombre del conductor (requerido)"
                    },
                    vehiculo: {
                        bsonType: "string",
                        description: "Placas del vehículo (requerido)"
                    },
                    coordenadas: {
                        bsonType: "array",
                        minItems: 1,
                        items: {
                            bsonType: "object",
                            required: ["lat", "lon", "hora"],
                            properties: {
                                lat: {
                                    bsonType: "double",
                                    minimum: -90,
                                    maximum: 90,
                                    description: "Latitud (requerido)"
                                },
                                lon: {
                                    bsonType: "double",
                                    minimum: -180,
                                    maximum: 180,
                                    description: "Longitud (requerido)"
                                },
                                hora: {
                                    bsonType: "string",
                                    pattern: "^[0-9]{2}:[0-9]{2}$",
                                    description: "Hora en formato HH:MM (requerido)"
                                }
                            }
                        },
                        description: "Array de coordenadas GPS (requerido)"
                    },
                    estado: {
                        enum: ["pendiente", "en_progreso", "completada", "cancelada"],
                        description: "Estado de la ruta (requerido)"
                    }
                }
            }
        },
        validationLevel: "strict",
        validationAction: "error"
    });
    print("   ✓ Colección 'rutas_entrega' creada");
} catch (e) {
    if (e.message.includes("already exists")) {
        print("   ⚠ Colección 'rutas_entrega' ya existe");
    } else {
        print("   ✗ Error: " + e.message);
    }
}

print("\n2. Creando colección: comentarios_clientes");
print("   Schema: _id, cliente_id, fecha, comentario, calificacion");

try {
    db.createCollection("comentarios_clientes", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["_id", "cliente_id", "fecha", "comentario", "calificacion"],
                properties: {
                    _id: {
                        bsonType: "string",
                        description: "ID único del comentario (requerido)"
                    },
                    cliente_id: {
                        bsonType: "string",
                        pattern: "^CLI[0-9]+$",
                        description: "ID del cliente en formato CLIxx (requerido)"
                    },
                    fecha: {
                        bsonType: "string",
                        pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$",
                        description: "Fecha en formato YYYY-MM-DD (requerido)"
                    },
                    comentario: {
                        bsonType: "string",
                        minLength: 5,
                        maxLength: 500,
                        description: "Texto del comentario (requerido, 5-500 caracteres)"
                    },
                    calificacion: {
                        bsonType: "int",
                        minimum: 1,
                        maximum: 5,
                        description: "Calificación del 1 al 5 (requerido)"
                    },
                    nombre_cliente: {
                        bsonType: "string",
                        description: "Nombre del cliente (opcional, integrado desde PostgreSQL)"
                    },
                    telefono_cliente: {
                        bsonType: "string",
                        description: "Teléfono del cliente (opcional, integrado desde PostgreSQL)"
                    }
                }
            }
        },
        validationLevel: "strict",
        validationAction: "error"
    });
    print("   ✓ Colección 'comentarios_clientes' creada");
} catch (e) {
    if (e.message.includes("already exists")) {
        print("   ⚠ Colección 'comentarios_clientes' ya existe");
    } else {
        print("   ✗ Error: " + e.message);
    }
}

print("\n3. Creando colección: historial_fallas");
print("   Schema: _id, fecha_reporte, area, descripcion, resuelto");

try {
    db.createCollection("historial_fallas", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["_id", "fecha_reporte", "area", "descripcion", "resuelto"],
                properties: {
                    _id: {
                        bsonType: "string",
                        description: "ID único de la falla (requerido)"
                    },
                    fecha_reporte: {
                        bsonType: "string",
                        pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$",
                        description: "Fecha del reporte en formato YYYY-MM-DD (requerido)"
                    },
                    area: {
                        enum: ["Transporte", "Producción", "Almacén", "Distribución", "Mantenimiento", "Sistemas"],
                        description: "Área donde ocurrió la falla (requerido)"
                    },
                    descripcion: {
                        bsonType: "string",
                        minLength: 10,
                        maxLength: 1000,
                        description: "Descripción detallada de la falla (requerido, 10-1000 caracteres)"
                    },
                    resuelto: {
                        bsonType: "bool",
                        description: "Indica si la falla fue resuelta (requerido)"
                    },
                    fecha_resolucion: {
                        bsonType: "string",
                        pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$",
                        description: "Fecha de resolución (opcional)"
                    },
                    responsable: {
                        bsonType: "string",
                        description: "Persona responsable de resolver la falla (opcional)"
                    }
                }
            }
        },
        validationLevel: "strict",
        validationAction: "error"
    });
    print("   ✓ Colección 'historial_fallas' creada");
} catch (e) {
    if (e.message.includes("already exists")) {
        print("   ⚠ Colección 'historial_fallas' ya existe");
    } else {
        print("   ✗ Error: " + e.message);
    }
}

print("\n4. Creando índices para optimización");

// Índices para rutas_entrega
db.rutas_entrega.createIndex({ fecha: 1 });
db.rutas_entrega.createIndex({ conductor: 1 });
db.rutas_entrega.createIndex({ estado: 1 });
print("   ✓ Índices creados en 'rutas_entrega'");

// Índices para comentarios_clientes
db.comentarios_clientes.createIndex({ cliente_id: 1 });
db.comentarios_clientes.createIndex({ fecha: -1 });
db.comentarios_clientes.createIndex({ calificacion: 1 });
print("   ✓ Índices creados en 'comentarios_clientes'");

// Índices para historial_fallas
db.historial_fallas.createIndex({ fecha_reporte: -1 });
db.historial_fallas.createIndex({ area: 1 });
db.historial_fallas.createIndex({ resuelto: 1 });
print("   ✓ Índices creados en 'historial_fallas'");

print("\n====================================================");
print("RESUMEN DE COLECCIONES CREADAS:");
print("====================================================");

const collections = db.getCollectionNames();
print("\nColecciones en base de datos 'pollo_sanjuanero':");
collections.forEach(col => print("  - " + col));

print("\n====================================================");
print("SCHEMA VALIDATION CONFIGURADO CORRECTAMENTE");
print("====================================================");