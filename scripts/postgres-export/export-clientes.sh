#!/bin/bash
# ====================================================
# SCRIPT DE EXPORTACIÓN DE DATOS DESDE POSTGRESQL
# Exporta tabla 'clientes' a formato JSON para MongoDB
# ====================================================

set -e

echo "======================================================"
echo "EXPORTANDO DATOS DESDE POSTGRESQL"
echo "======================================================"

# Configuración
PG_HOST="postgres-primary"
PG_PORT="5432"
PG_USER="postgres"
PG_DB="pollo_sanjuanero"
export PGPASSWORD="postgres123"

OUTPUT_DIR="/backups/integration"
OUTPUT_FILE="${OUTPUT_DIR}/clientes_export.json"

# Crear directorio de salida si no existe
mkdir -p "$OUTPUT_DIR"

echo ""
echo "1. Verificando conexión a PostgreSQL..."
if psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -c "SELECT 1" > /dev/null 2>&1; then
    echo "   ✓ Conexión exitosa a PostgreSQL"
else
    echo "   ✗ Error: No se pudo conectar a PostgreSQL"
    exit 1
fi

echo ""
echo "2. Verificando tabla 'clientes'..."
TABLE_EXISTS=$(psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clientes');")

if [ "$TABLE_EXISTS" = "t" ]; then
    echo "   ✓ Tabla 'clientes' encontrada"
    
    # Contar registros
    TOTAL_REGISTROS=$(psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -tAc "SELECT COUNT(*) FROM clientes;")
    echo "   ℹ Total de registros: $TOTAL_REGISTROS"
else
    echo "   ✗ Error: Tabla 'clientes' no existe"
    exit 1
fi

echo ""
echo "3. Exportando datos a JSON..."

# Generar JSON compatible con MongoDB
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -tA << 'EOF' > "$OUTPUT_FILE"
SELECT json_agg(
    json_build_object(
        '_id', CONCAT('CLI', id),
        'id_postgresql', id,
        'nombre', nombre,
        'telefono', telefono,
        'direccion', direccion,
        'fecha_registro', TO_CHAR(fecha_registro, 'YYYY-MM-DD'),
        'activo', true,
        'origen', 'PostgreSQL',
        'fecha_migracion', TO_CHAR(CURRENT_TIMESTAMP, 'YYYY-MM-DD HH24:MI:SS')
    )
)::text
FROM clientes;
EOF

# Verificar que el archivo se creó correctamente
if [ -f "$OUTPUT_FILE" ]; then
    FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo "   ✓ Exportación completada"
    echo "   ℹ Archivo generado: $OUTPUT_FILE"
    echo "   ℹ Tamaño: $FILE_SIZE"
else
    echo "   ✗ Error al generar archivo JSON"
    exit 1
fi

echo ""
echo "4. Vista previa del JSON generado:"
echo "   ----------------------------------------"
head -n 20 "$OUTPUT_FILE"
echo "   ..."
echo "   ----------------------------------------"

echo ""
echo "======================================================"
echo "EXPORTACIÓN COMPLETADA EXITOSAMENTE"
echo "======================================================"
echo ""
echo "Siguiente paso:"
echo "  Ejecutar: docker exec mongo-primary mongosh pollo_sanjuanero /backups/integration/import-clientes.js"
echo ""