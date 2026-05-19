# Gestor de Pedidos - MVP 🚀

Aplicación móvil para gestión de pedidos. Construida con **Expo**, **React Native**, **TypeScript** y **Supabase**.

## ✨ Características (MVP)

- 📊 Dashboard: Resumen de pedidos por estado
- 📝 Crear Pedido: Selecciona cliente, descripción y monto
- 👥 Crear Cliente: Registra nuevos clientes
- 📋 Listar Pedidos: Todos los pedidos con filtro por estado
- 🔍 Detalle del Pedido: Ver info completa y cambiar estado
- 🎯 Estados: Pendiente → En proceso → Entregado

## 🛠 Stack

- Expo 54
- React Native 0.81
- TypeScript 5.9
- Supabase (PostgreSQL)
- Expo Router 6

## 🚀 Quick Start

```bash
npm install
npm start
```

## 📱 Pantallas

1. Dashboard - Resumen y botones rápidos
2. Pedidos - Listado filtrable
3. Clientes - Gestión de clientes
4. Crear Pedido - Modal nuevo pedido
5. Crear Cliente - Modal nuevo cliente
6. Detalle - Ver y cambiar estado

## ✅ Validaciones

- Cliente: nombre mín 2 caracteres
- Pedido: descripción mín 5 caracteres, monto > 0
- Todos los campos obligatorios marcados con *

## 🔐 Seguridad

- RLS habilitado en Supabase
- Preparado para autenticación futura
- Validaciones en cliente y servidor
