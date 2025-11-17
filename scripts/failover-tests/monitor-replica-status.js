// ====================================================
// MONITOR DE ESTADO DEL REPLICA SET
// Muestra el estado actual de todos los nodos
// ====================================================

print("====================================================");
print("MONITOR DEL REPLICA SET - rs0");
print("====================================================");
print(`Fecha/Hora: ${new Date().toISOString()}`);

try {
    const status = rs.status();
    
    print("\n1. INFORMACIÓN GENERAL:");
    print(`   Replica Set: ${status.set}`);
    print(`   Heartbeat Interval: ${status.heartbeatIntervalMillis || 2000} ms`);
    print(`   Total de miembros: ${status.members.length}`);
    
    print("\n2. ESTADO DE LOS NODOS:");
    print("   ----------------------------------------");
    
    status.members.forEach((m, index) => {
        print(`\n   Nodo ${index + 1}: ${m.name}`);
        print(`   -------------------`);
        print(`   Estado: ${m.stateStr}`);
        print(`   Health: ${m.health === 1 ? "✓ SALUDABLE" : "✗ NO SALUDABLE"}`);
        print(`   Uptime: ${Math.floor(m.uptime / 60)} minutos`);
        
        if (m.stateStr === "PRIMARY") {
            print(`   🔴 PRIMARIO ACTIVO`);
            print(`   Optime: ${m.optimeDate || 'N/A'}`);
        } else if (m.stateStr === "SECONDARY") {
            print(`   🟢 SECUNDARIO`);
            if (m.optimeDate) {
                print(`   Última replicación: ${m.optimeDate}`);
            }
            if (m.syncSourceHost) {
                print(`   Sincronizando desde: ${m.syncSourceHost}`);
            }
        } else if (m.stateStr === "ARBITER") {
            print(`   ⚪ ÁRBITRO`);
        } else {
            print(`   ⚠ ESTADO: ${m.stateStr}`);
        }
        
        if (m.lastHeartbeat) {
            print(`   Último heartbeat: ${m.lastHeartbeat}`);
        }
        
        if (m.pingMs !== undefined) {
            print(`   Ping: ${m.pingMs} ms`);
        }
    });
    
    print("\n3. CONFIGURACIÓN DEL REPLICA SET:");
    print("   ----------------------------------------");
    
    const config = rs.conf();
    print(`   Version: ${config.version}`);
    print(`   Configuración de miembros:`);
    
    config.members.forEach(m => {
        const priority = m.priority !== undefined ? m.priority : 1;
        const votes = m.votes !== undefined ? m.votes : 1;
        print(`   - ${m.host}:`);
        print(`     ID: ${m._id}`);
        print(`     Prioridad: ${priority}`);
        print(`     Votos: ${votes}`);
    });
    
    print("\n4. VERIFICACIÓN DE REPLICACIÓN:");
    print("   ----------------------------------------");
    
    // Cambiar a base de datos y verificar
    db = db.getSiblingDB('pollo_sanjuanero');
    
    const collections = {
        rutas_entrega: db.rutas_entrega.countDocuments(),
        comentarios_clientes: db.comentarios_clientes.countDocuments(),
        historial_fallas: db.historial_fallas.countDocuments()
    };
    
    print("   Documentos por colección:");
    Object.keys(collections).forEach(col => {
        print(`   - ${col}: ${collections[col]} documentos`);
    });
    
    print("\n5. MÉTRICAS DE SALUD:");
    print("   ----------------------------------------");
    
    const primaryCount = status.members.filter(m => m.stateStr === "PRIMARY").length;
    const secondaryCount = status.members.filter(m => m.stateStr === "SECONDARY").length;
    const healthyCount = status.members.filter(m => m.health === 1).length;
    
    print(`   Nodos PRIMARIOS: ${primaryCount} ${primaryCount === 1 ? "✓" : "⚠"}`);
    print(`   Nodos SECUNDARIOS: ${secondaryCount}`);
    print(`   Nodos SALUDABLES: ${healthyCount}/${status.members.length}`);
    
    if (primaryCount !== 1) {
        print("\n   ⚠ ADVERTENCIA: No hay exactamente un nodo primario");
        print("     El replica set podría estar en proceso de elección");
    }
    
    if (healthyCount < status.members.length) {
        print("\n   ⚠ ADVERTENCIA: Algunos nodos no están saludables");
    }
    
    if (primaryCount === 1 && secondaryCount >= 1 && healthyCount === status.members.length) {
        print("\n   ✓ ESTADO GENERAL: ÓPTIMO");
    } else {
        print("\n   ⚠ ESTADO GENERAL: REQUIERE ATENCIÓN");
    }
    
} catch (e) {
    print("\n✗ ERROR al obtener estado del replica set:");
    print("  " + e.message);
    print("\nPosibles causas:");
    print("  1. No estás conectado al replica set");
    print("  2. El replica set no está inicializado");
    print("  3. Problemas de red entre nodos");
}

print("\n====================================================");
print("MONITOREO COMPLETADO");
print("====================================================");
print("\nPara monitoreo continuo, ejecutar:");
print("  while true; do docker exec mongo-primary mongosh pollo_sanjuanero --quiet /scripts/failover-tests/monitor-replica-status.js; sleep 5; done\n");