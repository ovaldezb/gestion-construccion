#!/bin/bash

BASE_URL="http://localhost:3000/dev"

echo "Testing Locations..."
echo "1. Create Location"
curl -X POST "$BASE_URL/locations" -H "Content-Type: application/json" -d '{"nombre": "Obra Centro", "ubicacion": "Av. Reforma 123"}'
echo -e "\n"

echo "Testing Employees..."
echo "2. Create Employee"
curl -X POST "$BASE_URL/employees" -H "Content-Type: application/json" -d '{"nombre": "Juan", "apellidoPaterno": "Perez", "apellidoMaterno": "Lopez", "tipoEmpleado": "FIJO"}'
echo -e "\n"

echo "Testing Tools..."
echo "3. Create Tool"
curl -X POST "$BASE_URL/tools" -H "Content-Type: application/json" -d '{"descripcion": "Taladro Percutor", "tipo": "Electrica"}'
echo -e "\n"

echo "Testing Products..."
echo "4. Create Product"
curl -X POST "$BASE_URL/products" -H "Content-Type: application/json" -d '{"nombre": "Cemento Gris", "descripcion": "Saco 50kg", "cantidad": 100}'
echo -e "\n"
