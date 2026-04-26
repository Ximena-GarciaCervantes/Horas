#!/bin/bash

# Script para configurar el proyecto Horas
# Este script ayuda a configurar las variables de entorno

echo "================================"
echo "HORAS - Setup Configuration"
echo "================================"
echo ""

# Solicitar valores
read -p "Ingresa tu Supabase URL: " SUPABASE_URL
read -p "Ingresa tu NEXT_PUBLIC_SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
read -p "Ingresa tu SUPABASE_SERVICE_ROLE_KEY: " SUPABASE_SERVICE_ROLE_KEY
read -p "Ingresa tu DATABASE_URL: " DATABASE_URL

# Crear archivo .env.local
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL=$DATABASE_URL
EOF

echo ""
echo "✅ Archivo .env.local creado exitosamente"
echo ""
echo "Pasos siguientes:"
echo "1. Ejecuta el contenido de setup.sql en Supabase SQL Editor"
echo "2. Crea usuarios en Authentication → Users"
echo "3. Ejecuta seed-users.sql (actualiza UUIDs primero)"
echo "4. Ejecuta: npm install"
echo "5. Ejecuta: npm run dev"
echo ""
