// ====================================================
// CONFIGURACIÓN DE AUTENTICACIÓN SCRAM-SHA-1
// ====================================================

print("====================================================");
print("CONFIGURANDO SEGURIDAD Y AUTENTICACIÓN");
print("====================================================");

// Cambiar a base de datos admin
db = db.getSiblingDB('admin');

print("\n1. Creando usuario administrador...");

try {
    db.createUser({
        user: "admin_pollo",
        pwd: "admin_pollo_2025",
        roles: [
            { role: "userAdminAnyDatabase", db: "admin" },
            { role: "readWriteAnyDatabase", db: "admin" },
            { role: "dbAdminAnyDatabase", db: "admin" },
            { role: "clusterAdmin", db: "admin" }
        ],
        mechanisms: ["SCRAM-SHA-1", "SCRAM-SHA-256"]
    });
    print("   ✓ Usuario 'admin_pollo' creado exitosamente");
} catch (e) {
    if (e.message.includes("already exists")) {
        print("   ⚠ Usuario 'admin_pollo' ya existe");
    } else {
        print("   ✗ Error: " + e.message);
    }
}

print("\n2. Creando usuario específico para base de datos 'pollo_sanjuanero'...");

db = db.getSiblingDB('pollo_sanjuanero');

try {
    db.createUser({
        user: "usuario_app",
        pwd: "app_password_2025",
        roles: [
            { role: "readWrite", db: "pollo_sanjuanero" },
            { role: "dbAdmin", db: "pollo_sanjuanero" }
        ],
        mechanisms: ["SCRAM-SHA-1", "SCRAM-SHA-256"]
    });
    print("   ✓ Usuario 'usuario_app' creado para base de datos 'pollo_sanjuanero'");
} catch (e) {
    if (e.message.includes("already exists")) {
        print("   ⚠ Usuario 'usuario_app' ya existe");
    } else {
        print("   ✗ Error: " + e.message);
    }
}

print("\n3. Creando usuario de solo lectura para reportes...");

try {
    db.createUser({
        user: "usuario_reportes",
        pwd: "reportes_2025",
        roles: [
            { role: "read", db: "pollo_sanjuanero" }
        ],
        mechanisms: ["SCRAM-SHA-1", "SCRAM-SHA-256"]
    });
    print("   ✓ Usuario 'usuario_reportes' creado (solo lectura)");
} catch (e) {
    if (e.message.includes("already exists")) {
        print("   ⚠ Usuario 'usuario_reportes' ya existe");
    } else {
        print("   ✗ Error: " + e.message);
    }
}

print("\n====================================================");
print("USUARIOS CREADOS:");
print("====================================================");
print("\nUsuario Administrador Global:");
print("  Usuario: admin_pollo");
print("  Password: admin_pollo_2025");
print("  Permisos: Administración total del cluster");
print("\nUsuario de Aplicación:");
print("  Usuario: usuario_app");
print("  Password: app_password_2025");
print("  Permisos: Lectura/Escritura en 'pollo_sanjuanero'");
print("\nUsuario de Reportes:");
print("  Usuario: usuario_reportes");
print("  Password: reportes_2025");
print("  Permisos: Solo lectura en 'pollo_sanjuanero'");

print("\n====================================================");
print("CADENAS DE CONEXIÓN:");
print("====================================================");
print("\nConexión con autenticación:");
print("  mongosh 'mongodb://admin_pollo:admin_pollo_2025@localhost:27017/admin?authSource=admin&replicaSet=rs0'");
print("\nConexión para aplicación:");
print("  mongodb://usuario_app:app_password_2025@localhost:27017/pollo_sanjuanero?authSource=pollo_sanjuanero&replicaSet=rs0");

print("\n====================================================");
print("AUTENTICACIÓN CONFIGURADA CORRECTAMENTE");
print("====================================================");