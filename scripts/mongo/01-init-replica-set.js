// ====================================================
// SCRIPT DE INICIALIZACIÓN DEL REPLICA SET
// ====================================================

print("====================================================");
print("INICIALIZANDO REPLICA SET: rs0");
print("====================================================");

try {
    // Configuración del Replica Set
    const config = {
        _id: "rs0",
        members: [
            {
                _id: 0,
                host: "mongo-primary:27017",
                priority: 3  // Mayor prioridad para ser primario
            },
            {
                _id: 1,
                host: "mongo-secondary1:27017",
                priority: 2
            },
            {
                _id: 2,
                host: "mongo-secondary2:27017",
                priority: 1
            }
        ]
    };

    // Inicializar el replica set
    const result = rs.initiate(config);
    
    if (result.ok === 1) {
        print("✓ Replica Set inicializado correctamente");
        print("");
        print("Esperando que los nodos se sincronicen...");
        
        // Esperar a que el replica set esté listo
        sleep(5000);
        
        print("");
        print("====================================================");
        print("ESTADO DEL REPLICA SET:");
        print("====================================================");
        printjson(rs.status());
        
    } else {
        print("✗ Error al inicializar Replica Set");
        printjson(result);
    }
    
} catch (e) {
    if (e.message.includes("already initialized")) {
        print("⚠ Replica Set ya está inicializado");
        print("");
        print("Estado actual:");
        printjson(rs.status());
    } else {
        print("✗ Error: " + e.message);
    }
}

print("");
print("====================================================");
print("INICIALIZACIÓN COMPLETADA");
print("====================================================");