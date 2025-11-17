// ====================================================
// SCRIPT DE VALIDACIÓN FINAL DEL PROYECTO
// Verifica que todos los componentes estén correctos
// ====================================================

print("====================================================");
print("VALIDACIÓN FINAL DEL PROYECTO");
print("Proyecto MongoDB Replica Set - Fase 2");
print("====================================================");
print("");

let errores = 0;
let advertencias = 0;
let exitosos = 0;

// ====================================================
// 1. VALIDAR REPLICA SET
// ====================================================
print("1. VALIDANDO REPLICA SET");
print("   ----------------------------------------");

try {
    const status = rs.status();
    
    // Verificar número de miembros
    if (status.members.length === 3) {
        print("   ✓ Número de nodos correcto: 3");
        exitosos++;
    } else {
        print(`   ✗ ERROR: Se esperaban 3 nodos, se encontraron ${status.members.length}`);
        errores++;
    }
    
    // Verificar que hay exactamente un primario
    const primarios = status.members.filter(m => m.stateStr === "PRIMARY");
    if (primarios.length === 1) {
        print(`   ✓ Nodo primario: ${primarios[0].name}`);
        exitosos++;
    } else {
        print(`   ✗ ERROR: Se esperaba 1 primario, se encontraron ${primarios.length}`);
        errores++;
    }
    
    // Verificar secundarios
    const secundarios = status.members.filter(m => m.stateStr === "SECONDARY");
    if (secundarios.length === 2) {
        print(`   ✓ Nodos secundarios: ${secundarios.length}`);
        exitosos++;
    } else {
        print(`   ⚠ ADVERTENCIA: Se esperaban 2 secundarios, se encontraron ${secundarios.length}`);
        advertencias++;
    }
    
    // Verificar salud de nodos
    const nodosSaludables = status.members.filter(m => m.health === 1);
    if (nodosSaludables.length === status.members.length) {
        print(`   ✓ Todos los nodos están saludables`);
        exitosos++;
    } else {
        print(`   ⚠ ADVERTENCIA: ${status.members.length - nodosSaludables.length} nodos no saludables`);
        advertencias++;
    }
    
} catch (e) {
    print(`   ✗ ERROR: No se pudo validar replica set: ${e.message}`);
    errores++;
}

// ====================================================
// 2. VALIDAR COLECCIONES
// ====================================================
print("\n2. VALIDANDO COLECCIONES");
print("   ----------------------------------------");

db = db.getSiblingDB('pollo_sanjuanero');

const coleccionesEsperadas = [
    'rutas_entrega',
    'comentarios_clientes',
    'historial_fallas'
];

const coleccionesExistentes = db.getCollectionNames();

coleccionesEsperadas.forEach(col => {
    if (coleccionesExistentes.includes(col)) {
        print(`   ✓ Colección '${col}' existe`);
        exitosos++;
    } else {
        print(`   ✗ ERROR: Colección '${col}' NO existe`);
        errores++;
    }
});

// ====================================================
// 3. VALIDAR SCHEMA VALIDATION
// ====================================================
print("\n3. VALIDANDO SCHEMA VALIDATION");
print("   ----------------------------------------");

coleccionesEsperadas.forEach(col => {
    const info = db.getCollectionInfos({name: col});
    if (info.length > 0 && info[0].options && info[0].options.validator) {
        print(`   ✓ Schema validation configurado en '${col}'`);
        exitosos++;
    } else {
        print(`   ✗ ERROR: Schema validation falta en '${col}'`);
        errores++;
    }
});

// ====================================================
// 4. VALIDAR DATOS
// ====================================================
print("\n4. VALIDANDO DATOS INSERTADOS");
print("   ----------------------------------------");

const conteoRutas = db.rutas_entrega.countDocuments();
const conteoComentarios = db.comentarios_clientes.countDocuments();
const conteoFallas = db.historial_fallas.countDocuments();

if (conteoRutas >= 6) {
    print(`   ✓ Rutas insertadas: ${conteoRutas}`);
    exitosos++;
} else {
    print(`   ⚠ ADVERTENCIA: Solo ${conteoRutas} rutas (se esperaban al menos 6)`);
    advertencias++;
}

if (conteoComentarios >= 10) {
    print(`   ✓ Comentarios insertados: ${conteoComentarios}`);
    exitosos++;
} else {
    print(`   ⚠ ADVERTENCIA: Solo ${conteoComentarios} comentarios (se esperaban al menos 10)`);
    advertencias++;
}

if (conteoFallas >= 8) {
    print(`   ✓ Fallas insertadas: ${conteoFallas}`);
    exitosos++;
} else {
    print(`   ⚠ ADVERTENCIA: Solo ${conteoFallas} fallas (se esperaban al menos 8)`);
    advertencias++;
}

// ====================================================
// 5. VALIDAR ÍNDICES
// ====================================================
print("\n5. VALIDANDO ÍNDICES");
print("   ----------------------------------------");

const indicesRutas = db.rutas_entrega.getIndexes();
const indicesComentarios = db.comentarios_clientes.getIndexes();
const indicesFallas = db.historial_fallas.getIndexes();

if (indicesRutas.length >= 4) {
    print(`   ✓ Índices en 'rutas_entrega': ${indicesRutas.length}`);
    exitosos++;
} else {
    print(`   ⚠ ADVERTENCIA: Pocos índices en 'rutas_entrega': ${indicesRutas.length}`);
    advertencias++;
}

if (indicesComentarios.length >= 4) {
    print(`   ✓ Índices en 'comentarios_clientes': ${indicesComentarios.length}`);
    exitosos++;
} else {
    print(`   ⚠ ADVERTENCIA: Pocos índices en 'comentarios_clientes': ${indicesComentarios.length}`);
    advertencias++;
}

if (indicesFallas.length >= 4) {
    print(`   ✓ Índices en 'historial_fallas': ${indicesFallas.length}`);
    exitosos++;
} else {
    print(`   ⚠ ADVERTENCIA: Pocos índices en 'historial_fallas': ${indicesFallas.length}`);
    advertencias++;
}

// ====================================================
// 6. VALIDAR USUARIOS
// ====================================================
print("\n6. VALIDANDO USUARIOS");
print("   ----------------------------------------");

db = db.getSiblingDB('admin');

try {
    const usuarios = db.system.users.find({}, {user: 1}).toArray();
    const nombresUsuarios = usuarios.map(u => u.user);
    
    const usuariosEsperados = ['admin_pollo'];
    
    usuariosEsperados.forEach(user => {
        if (nombresUsuarios.includes(user)) {
            print(`   ✓ Usuario '${user}' existe`);
            exitosos++;
        } else {
            print(`   ✗ ERROR: Usuario '${user}' NO existe`);
            errores++;
        }
    });
    
    db = db.getSiblingDB('pollo_sanjuanero');
    const usuariosDB = db.system.users.find({}, {user: 1}).toArray();
    const nombresUsuariosDB = usuariosDB.map(u => u.user);
    
    const usuariosDBEsperados = ['usuario_app', 'usuario_reportes'];
    
    usuariosDBEsperados.forEach(user => {
        if (nombresUsuariosDB.includes(user)) {
            print(`   ✓ Usuario '${user}' existe`);
            exitosos++;
        } else {
            print(`   ⚠ ADVERTENCIA: Usuario '${user}' podría no estar creado en esta DB`);
            advertencias++;
        }
    });
    
} catch (e) {
    print(`   ⚠ ADVERTENCIA: No se pudieron verificar usuarios: ${e.message}`);
    advertencias++;
}

// ====================================================
// 7. VALIDAR REPLICACIÓN
// ====================================================
print("\n7. VALIDANDO REPLICACIÓN");
print("   ----------------------------------------");

db = db.getSiblingDB('pollo_sanjuanero');

try {
    // Insertar documento de prueba
    const testId = `VALIDACION_${Date.now()}`;
    db.validacion_test.insertOne({
        _id: testId,
        timestamp: new Date(),
        test: true
    });
    
    print(`   ✓ Documento de prueba insertado: ${testId}`);
    exitosos++;
    
    // Esperar replicación
    sleep(2000);
    
    // Verificar que existe
    const doc = db.validacion_test.findOne({_id: testId});
    if (doc) {
        print(`   ✓ Documento recuperado correctamente`);
        exitosos++;
        
        // Limpiar
        db.validacion_test.deleteOne({_id: testId});
    } else {
        print(`   ✗ ERROR: No se pudo recuperar el documento de prueba`);
        errores++;
    }
    
} catch (e) {
    print(`   ✗ ERROR: Fallo la prueba de replicación: ${e.message}`);
    errores++;
}

// ====================================================
// 8. VERIFICAR INTEGRACIÓN (OPCIONAL)
// ====================================================
print("\n8. VERIFICANDO INTEGRACIÓN SQL → NoSQL (Opcional)");
print("   ----------------------------------------");

const tieneIntegracion = db.getCollectionNames().includes('clientes_integracion');

if (tieneIntegracion) {
    const conteoClientes = db.clientes_integracion.countDocuments();
    if (conteoClientes > 0) {
        print(`   ✓ Integración completada: ${conteoClientes} clientes importados`);
        exitosos++;
    } else {
        print(`   ⚠ ADVERTENCIA: Colección existe pero sin datos`);
        advertencias++;
    }
} else {
    print(`   ℹ Integración SQL → NoSQL no realizada (OPCIONAL)`);
}

// ====================================================
// RESUMEN FINAL
// ====================================================
print("\n====================================================");
print("RESUMEN DE VALIDACIÓN");
print("====================================================");
print("");
print(`✓ Validaciones exitosas: ${exitosos}`);
print(`⚠ Advertencias: ${advertencias}`);
print(`✗ Errores: ${errores}`);
print("");

if (errores === 0 && advertencias === 0) {
    print("🎉 ¡EXCELENTE! El proyecto está completamente configurado");
    print("   Todos los componentes funcionan correctamente");
} else if (errores === 0 && advertencias > 0) {
    print("✓ BIEN - El proyecto funciona correctamente");
    print("  Hay algunas advertencias menores que revisar");
} else if (errores <= 2) {
    print("⚠ ATENCIÓN - El proyecto tiene algunos errores");
    print("  Revisa los errores indicados arriba");
} else {
    print("✗ PROBLEMAS DETECTADOS - Revisa la configuración");
    print("  Hay varios errores que corregir");
}

print("\n====================================================");
print("COMPONENTES DEL PROYECTO:");
print("====================================================");

const status = rs.status();
print("\n📊 Replica Set:");
print(`   - Nodos: ${status.members.length}`);
print(`   - Primario: ${status.members.filter(m => m.stateStr === "PRIMARY").map(m => m.name).join(", ") || "N/A"}`);
print(`   - Secundarios: ${status.members.filter(m => m.stateStr === "SECONDARY").length}`);

db = db.getSiblingDB('pollo_sanjuanero');
print("\n📁 Colecciones:");
print(`   - rutas_entrega: ${db.rutas_entrega.countDocuments()} documentos`);
print(`   - comentarios_clientes: ${db.comentarios_clientes.countDocuments()} documentos`);
print(`   - historial_fallas: ${db.historial_fallas.countDocuments()} documentos`);

if (tieneIntegracion) {
    print(`   - clientes_integracion: ${db.clientes_integracion.countDocuments()} documentos`);
}

print("\n👥 Usuarios:");
db = db.getSiblingDB('admin');
const allUsers = db.system.users.find({}, {user: 1, db: 1}).toArray();
allUsers.forEach(u => {
    print(`   - ${u.user} (${u.db || "N/A"})`);
});

print("\n====================================================");
print("SIGUIENTE PASO:");
print("====================================================");

if (errores === 0) {
    print("\n✅ Tu proyecto está listo para:");
    print("   1. Tomar capturas de pantalla");
    print("   2. Probar el failover");
    print("   3. Ejecutar las consultas de demostración");
    print("   4. Preparar tu informe técnico");
} else {
    print("\n⚠️ Primero corrige los errores encontrados:");
    print("   1. Revisa los errores marcados con ✗");
    print("   2. Ejecuta los scripts de inicialización faltantes");
    print("   3. Vuelve a ejecutar esta validación");
}

print("\n====================================================");
print("VALIDACIÓN COMPLETADA");
print("====================================================");
print("");