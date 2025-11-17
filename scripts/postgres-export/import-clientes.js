// ====================================================
// IMPORTACIÓN DE DATOS DESDE POSTGRESQL A MONGODB
// Integración SQL → NoSQL
// ====================================================

print("====================================================");
print("IMPORTANDO DATOS DE CLIENTES DESDE POSTGRESQL");
print("====================================================");

db = db.getSiblingDB('pollo_sanjuanero');

print("\n1. Verificando archivo de exportación...");

const fs = require('fs');
const filePath = '/backups/integration/clientes_export.json';

try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const clientesData = JSON.parse(fileContent);
    
    if (!Array.isArray(clientesData) || clientesData.length === 0) {
        print("   ✗ Error: El archivo no contiene datos válidos");
        quit(1);
    }
    
    print(`   ✓ Archivo leído correctamente`);
    print(`   ℹ Total de clientes a importar: ${clientesData.length}`);
    
    print("\n2. Creando colección 'clientes_integracion' (si no existe)...");
    
    // Crear colección con schema validation
    try {
        db.createCollection("clientes_integracion", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["_id", "nombre"],
                    properties: {
                        _id: {
                            bsonType: "string",
                            description: "ID del cliente en formato CLIxx"
                        },
                        id_postgresql: {
                            bsonType: "int",
                            description: "ID original de PostgreSQL"
                        },
                        nombre: {
                            bsonType: "string",
                            description: "Nombre del cliente"
                        },
                        telefono: {
                            bsonType: "string",
                            description: "Teléfono del cliente"
                        },
                        direccion: {
                            bsonType: "string",
                            description: "Dirección del cliente"
                        },
                        fecha_registro: {
                            bsonType: "string",
                            description: "Fecha de registro en PostgreSQL"
                        },
                        activo: {
                            bsonType: "bool",
                            description: "Estado del cliente"
                        },
                        origen: {
                            bsonType: "string",
                            description: "Sistema de origen"
                        },
                        fecha_migracion: {
                            bsonType: "string",
                            description: "Fecha y hora de migración"
                        }
                    }
                }
            }
        });
        print("   ✓ Colección 'clientes_integracion' creada");
    } catch (e) {
        if (e.message.includes("already exists")) {
            print("   ⚠ Colección 'clientes_integracion' ya existe");
        } else {
            print("   ✗ Error al crear colección: " + e.message);
        }
    }
    
    print("\n3. Insertando datos en MongoDB...");
    
    // Usar bulkWrite con upsert para evitar duplicados
    const bulkOps = clientesData.map(cliente => ({
        replaceOne: {
            filter: { _id: cliente._id },
            replacement: cliente,
            upsert: true
        }
    }));
    
    const result = db.clientes_integracion.bulkWrite(bulkOps);
    
    const totalInsertado = (result.nUpserted || 0) + (result.nModified || 0);
    print(`   ✓ Datos insertados: ${totalInsertado} documentos`);
    print(`   ℹ Nuevos: ${result.nUpserted || 0} | Actualizados: ${result.nModified || 0}`);
    
    print("\n4. Actualizando comentarios con información de clientes...");
    
    // Actualizar comentarios_clientes con datos de PostgreSQL
    let comentariosActualizados = 0;
    
    clientesData.forEach(cliente => {
        const updateResult = db.comentarios_clientes.updateMany(
            { cliente_id: cliente._id },
            {
                $set: {
                    nombre_cliente: cliente.nombre,
                    telefono_cliente: cliente.telefono
                }
            }
        );
        comentariosActualizados += updateResult.modifiedCount;
    });
    
    print(`   ✓ Comentarios actualizados: ${comentariosActualizados}`);
    
    print("\n5. Creando índices...");
    db.clientes_integracion.createIndex({ id_postgresql: 1 });
    db.clientes_integracion.createIndex({ nombre: 1 });
    db.clientes_integracion.createIndex({ activo: 1 });
    print("   ✓ Índices creados");
    
    print("\n====================================================");
    print("RESUMEN DE IMPORTACIÓN:");
    print("====================================================");
    print(`\nTotal de clientes en MongoDB: ${db.clientes_integracion.countDocuments()}`);
    print(`Clientes activos: ${db.clientes_integracion.countDocuments({ activo: true })}`);
    
    print("\nPrimeros 5 clientes importados:");
    db.clientes_integracion.find().limit(5).forEach(c => {
        print(`  - ${c._id}: ${c.nombre}`);
        print(`    PostgreSQL ID: ${c.id_postgresql} | Tel: ${c.telefono}`);
    });
    
    print("\nComentarios enriquecidos con datos de clientes:");
    const comentariosEnriquecidos = db.comentarios_clientes.find({ 
        nombre_cliente: { $exists: true } 
    }).toArray();
    print(`  Total: ${comentariosEnriquecidos.length} comentarios`);
    
    if (comentariosEnriquecidos.length > 0) {
        print("\n  Ejemplos:");
        comentariosEnriquecidos.slice(0, 3).forEach(c => {
            print(`  - ${c._id}: ${c.nombre_cliente} (${c.cliente_id})`);
            print(`    "${c.comentario}"`);
        });
    }
    
    print("\n====================================================");
    print("INTEGRACIÓN SQL → NoSQL COMPLETADA EXITOSAMENTE");
    print("====================================================");
    
} catch (e) {
    print("\n✗ Error durante la importación:");
    print("  " + e.message);
    quit(1);
}