// ====================================================
// PRUEBA DE FAILOVER MANUAL
// Simula la caída del nodo primario
// ====================================================

print("====================================================");
print("PRUEBA DE FAILOVER MANUAL");
print("====================================================");

print("\n⚠ ADVERTENCIA: Este script simulará la caída del nodo primario");
print("   El replica set elegirá automáticamente un nuevo primario\n");

print("1. Estado ANTES del failover:");
print("   ----------------------------------------");
const statusBefore = rs.status();
print(`   Replica Set: ${statusBefore.set}`);
print(`   Fecha: ${statusBefore.date}`);
print("\n   Miembros:");
statusBefore.members.forEach(m => {
    print(`   - ${m.name}:`);
    print(`     Estado: ${m.stateStr}`);
    print(`     Health: ${m.health === 1 ? "✓ OK" : "✗ ERROR"}`);
    print(`     Uptime: ${m.uptime} segundos`);
    if (m.stateStr === "PRIMARY") {
        print(`     >>> PRIMARIO ACTUAL <<<`);
    }
});

print("\n2. Configuración del replica set:");
const conf = rs.conf();
print("   Prioridades de los nodos:");
conf.members.forEach(m => {
    const priority = m.priority || 1;
    print(`   - ${m.host}: Prioridad ${priority}`);
});

print("\n====================================================");
print("INSTRUCCIONES PARA FAILOVER MANUAL:");
print("====================================================");

print("\nPara simular failover manual, ejecuta estos comandos:\n");

print("OPCIÓN 1: Step Down (hacer que el primario renuncie)");
print("  En el nodo primario, ejecutar:");
print("    rs.stepDown(60)");
print("  Esto hace que el primario renuncie por 60 segundos\n");

print("OPCIÓN 2: Detener el contenedor primario (failover real)");
print("  En la terminal del host:");
print("    docker stop mongo-primary");
print("  Esperar 10-30 segundos");
print("    docker exec mongo-secondary1 mongosh --eval 'rs.status()'");
print("  Para restaurar:");
print("    docker start mongo-primary\n");

print("OPCIÓN 3: Cambiar prioridades y forzar elección");
print("  En mongosh:");
print("    cfg = rs.conf()");
print("    cfg.members[1].priority = 5  // Aumentar prioridad de secondary1");
print("    rs.reconfig(cfg)");
print("    rs.stepDown(60)\n");

print("====================================================");
print("PARA MONITOREAR EL FAILOVER:");
print("====================================================");
print("\nEjecuta en otra terminal:");
print("  watch -n 2 'docker exec mongo-primary mongosh --quiet --eval \"rs.status().members.forEach(m => print(m.name + ': ' + m.stateStr))\"'\n");

print("O ejecuta este script de monitoreo:");
print("  docker exec mongo-primary mongosh pollo_sanjuanero /scripts/failover-tests/monitor-replica-status.js\n");

print("====================================================");
print("SCRIPT DE PRUEBA COMPLETADO");
print("====================================================");
print("\n⚠ IMPORTANTE: Este script solo muestra instrucciones.");
print("   Para ejecutar el failover, usar los comandos indicados arriba.\n");