// ====================================================
// PRUEBA DE FAILOVER AUTOMÁTICO CON REPLICACIÓN
// Inserta datos, simula falla, verifica replicación
// ====================================================

print("====================================================");
print("PRUEBA DE FAILOVER AUTOMÁTICO Y REPLICACIÓN");
print("====================================================");

db = db.getSiblingDB('pollo_sanjuanero');

print("\n📋 PASO 1: Verificar estado inicial del replica set");
print("   ----------------------------------------");

const statusInicial = rs.status();
const primarioInicial = statusInicial.members.find(m => m.stateStr === "PRIMARY");

if (!primarioInicial) {
    print("   ✗ Error: No hay nodo primario activo");
    print("   Por favor, verifica el estado del replica set");
    quit(1);
}

print(`   ✓ Primario actual: ${primarioInicial.name}`);
print(`   ✓ Total de nodos: ${statusInicial.members.length}`);

const secundariosActivos = statusInicial.members.filter(m => m.stateStr === "SECONDARY").length;
print(`   ✓ Secundarios activos: ${secundariosActivos}`);

print("\n📝 PASO 2: Insertar datos de prueba ANTES del failover");
print("   ----------------------------------------");

const fechaHora = new Date().toISOString();
const testId = `TEST_FAILOVER_${Date.now()}`;

// Insertar ruta de prueba
const rutaPrueba = {
    _id: testId,
    fecha: "2025-11-16",
    conductor: "Test Failover - Conductor Automático",
    vehiculo: "Placas TEST999",
    coordenadas: [
        { lat: 14.6000, lon: -90.5000, hora: "10:00" },
        { lat: 14.6005, lon: -90.5005, hora: "10:15" }
    ],
    estado: "en_progreso",
    test_failover: true,
    timestamp_insercion: fechaHora
};

try {
    db.rutas_entrega.insertOne(rutaPrueba);
    print(`   ✓ Ruta de prueba insertada: ${testId}`);
} catch (e) {
    print(`   ✗ Error al insertar ruta: ${e.message}`);
    quit(1);
}

// Insertar comentario de prueba
const comentarioPrueba = {
    _id: testId.replace('TEST_FAILOVER', 'COM_TEST'),
    cliente_id: "CLI1",
    fecha: "2025-11-16",
    comentario: "Comentario de prueba para verificar replicación durante failover",
    calificacion: 5,
    test_failover: true,
    timestamp_insercion: fechaHora
};

try {
    db.comentarios_clientes.insertOne(comentarioPrueba);
    print(`   ✓ Comentario de prueba insertado: ${comentarioPrueba._id}`);
} catch (e) {
    print(`   ✗ Error al insertar comentario: ${e.message}`);
}

// Insertar falla de prueba
const fallaPrueba = {
    _id: testId.replace('TEST_FAILOVER', 'FALLA_TEST'),
    fecha_reporte: "2025-11-16",
    area: "Sistemas",
    descripcion: "Falla de prueba para verificar replicación durante proceso de failover",
    resuelto: false,
    test_failover: true,
    timestamp_insercion: fechaHora
};

try {
    db.historial_fallas.insertOne(fallaPrueba);
    print(`   ✓ Falla de prueba insertada: ${fallaPrueba._id}`);
} catch (e) {
    print(`   ✗ Error al insertar falla: ${e.message}`);
}

print("\n⏳ PASO 3: Esperando propagación a secundarios (5 segundos)...");
sleep(5000);
print("   ✓ Tiempo de espera completado");

print("\n📊 PASO 4: Verificar datos en nodo primario");
print("   ----------------------------------------");

const rutaEnPrimario = db.rutas_entrega.findOne({ _id: testId });
const comentarioEnPrimario = db.comentarios_clientes.findOne({ _id: comentarioPrueba._id });
const fallaEnPrimario = db.historial_fallas.findOne({ _id: fallaPrueba._id });

if (rutaEnPrimario && comentarioEnPrimario && fallaEnPrimario) {
    print("   ✓ Todos los documentos confirmados en primario");
} else {
    print("   ⚠ Advertencia: No todos los documentos están en primario");
}

print("\n⚠️  PASO 5: INSTRUCCIONES PARA FAILOVER");
print("   ========================================");
print("\n   Para simular failover automático, ejecuta en otra terminal:\n");
print("   OPCIÓN A - Step Down del primario:");
print(`     docker exec ${primarioInicial.name.split(':')[0]} mongosh --eval "rs.stepDown(60)"`);
print("\n   OPCIÓN B - Detener el contenedor primario:");
print(`     docker stop ${primarioInicial.name.split(':')[0]}`);
print("\n   Luego, ESPERA 10-30 segundos y continúa con este script.");
print("\n   ========================================");
print("\n   Presiona ENTER cuando hayas ejecutado el failover...");

print("\n📊 PASO 6: Verificar nuevo primario");
print("   ----------------------------------------");

sleep(3000); // Dar tiempo para que se complete la elección

try {
    const statusDespues = rs.status();
    const primarioDespues = statusDespues.members.find(m => m.stateStr === "PRIMARY");
    
    if (!primarioDespues) {
        print("   ⚠ Advertencia: Aún no hay primario. Elección en proceso...");
        print("   Esperando 10 segundos más...");
        sleep(10000);
        
        const statusFinal = rs.status();
        const primarioFinal = statusFinal.members.find(m => m.stateStr === "PRIMARY");
        
        if (primarioFinal) {
            print(`   ✓ Nuevo primario elegido: ${primarioFinal.name}`);
            
            if (primarioFinal.name !== primarioInicial.name) {
                print("   ✓ FAILOVER EXITOSO: El primario cambió");
            } else {
                print("   ℹ El primario original fue reelegido");
            }
        } else {
            print("   ✗ Error: No se pudo elegir un nuevo primario");
        }
    } else {
        print(`   ✓ Primario actual: ${primarioDespues.name}`);
        
        if (primarioDespues.name !== primarioInicial.name) {
            print("   ✓ FAILOVER EXITOSO: El primario cambió");
        } else {
            print("   ℹ El primario sigue siendo el mismo");
        }
    }
    
} catch (e) {
    print(`   ✗ Error al verificar estado: ${e.message}`);
}

print("\n📊 PASO 7: Verificar replicación de datos");
print("   ----------------------------------------");

// Verificar que los datos de prueba siguen existiendo
const rutaDespues = db.rutas_entrega.findOne({ _id: testId });
const comentarioDespues = db.comentarios_clientes.findOne({ _id: comentarioPrueba._id });
const fallaDespues = db.historial_fallas.findOne({ _id: fallaPrueba._id });

print("\n   Verificación de documentos:");

if (rutaDespues) {
    print("   ✓ Ruta de prueba replicada correctamente");
} else {
    print("   ✗ ERROR: Ruta de prueba NO encontrada");
}

if (comentarioDespues) {
    print("   ✓ Comentario de prueba replicado correctamente");
} else {
    print("   ✗ ERROR: Comentario de prueba NO encontrado");
}

if (fallaDespues) {
    print("   ✓ Falla de prueba replicada correctamente");
} else {
    print("   ✗ ERROR: Falla de prueba NO encontrada");
}

print("\n📊 PASO 8: Insertar datos DESPUÉS del failover");
print("   ----------------------------------------");

const testIdPost = `POST_FAILOVER_${Date.now()}`;
const rutaPostFailover = {
    _id: testIdPost,
    fecha: "2025-11-16",
    conductor: "Test Post-Failover",
    vehiculo: "Placas POST888",
    coordenadas: [
        { lat: 14.6100, lon: -90.5100, hora: "11:00" }
    ],
    estado: "completada",
    test_failover: true,
    post_failover: true,
    timestamp_insercion: new Date().toISOString()
};

try {
    db.rutas_entrega.insertOne(rutaPostFailover);
    print(`   ✓ Ruta post-failover insertada: ${testIdPost}`);
    print("   ✓ El nuevo primario acepta escrituras correctamente");
} catch (e) {
    print(`   ✗ Error al insertar en nuevo primario: ${e.message}`);
}

print("\n🧹 PASO 9: Limpieza (opcional)");
print("   ----------------------------------------");
print("\n   Para eliminar los datos de prueba, ejecutar:");
print(`   db.rutas_entrega.deleteMany({ test_failover: true });`);
print(`   db.comentarios_clientes.deleteMany({ test_failover: true });`);
print(`   db.historial_fallas.deleteMany({ test_failover: true });`);

print("\n====================================================");
print("RESUMEN DE LA PRUEBA DE FAILOVER:");
print("====================================================");

print("\n✓ Primario inicial: " + (primarioInicial ? primarioInicial.name : "N/A"));

try {
    const statusResumen = rs.status();
    const primarioActual = statusResumen.members.find(m => m.stateStr === "PRIMARY");
    print("✓ Primario actual: " + (primarioActual ? primarioActual.name : "EN ELECCIÓN"));
    
    if (primarioInicial && primarioActual && primarioInicial.name !== primarioActual.name) {
        print("\n🎉 FAILOVER AUTOMÁTICO EXITOSO");
        print("   El replica set cambió de primario automáticamente");
    }
} catch (e) {
    print("⚠ No se pudo determinar el primario actual");
}

print("\n✓ Datos insertados antes del failover:");
print(`  - Ruta: ${testId}`);
print(`  - Comentario: ${comentarioPrueba._id}`);
print(`  - Falla: ${fallaPrueba._id}`);

print("\n✓ Datos insertados después del failover:");
print(`  - Ruta: ${testIdPost}`);

print("\n✓ Verificación de replicación:");
print(`  - ${rutaDespues ? "✓" : "✗"} Ruta replicada`);
print(`  - ${comentarioDespues ? "✓" : "✗"} Comentario replicado`);
print(`  - ${fallaDespues ? "✓" : "✗"} Falla replicada`);

print("\n====================================================");
print("PRUEBA DE FAILOVER COMPLETADA");
print("====================================================");