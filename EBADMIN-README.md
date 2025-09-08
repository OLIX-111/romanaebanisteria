# 🏭 Romana Ebanistería - Panel de Administración

## 🚀 Inicio Rápido

### 1. Acceso al Admin
```
URL: http://localhost:3000/ebadmin
Login: admin@romanaebanisteria.com
```

### 2. Credenciales de Admin
El sistema tiene **un solo usuario administrador** con credenciales fijas:
- **Email:** `admin@romanaebanisteria.com`
- **Contraseña:** `admin123`

**Nota:** Estas son las credenciales únicas del sistema. No hay múltiples usuarios, solo un admin lineal.

### 3. Funcionalidades Principales

## 📊 Dashboard
- **Estadísticas en tiempo real**: Total órdenes, ingresos, valor promedio
- **Estado de órdenes**: Visión general por estado (procesando, enviadas, entregadas)
- **Actividad reciente**: Últimas acciones del sistema
- **Acciones rápidas**: Crear orden, gestionar clientes

## 👥 Gestión de Clientes
- **Lista completa** de todos los clientes
- **Estadísticas detalladas**:
  - Total clientes, clientes activos
  - Ingresos totales y promedio por cliente
  - Tasa de actividad de clientes
- **Búsqueda avanzada** por nombre, email o teléfono
- **Filtros por estado** (activos/inactivos)
- **Vista detallada** con información completa de contacto
- **Estadísticas individuales** (órdenes, gasto total, última orden)

## 📦 Gestión de Órdenes
- **Lista completa** de todas las órdenes
- **Filtros avanzados**:
  - Por estado (22 estados especializados)
  - Por prioridad (normal, alta, urgente)
  - Por fecha (hoy, semana, mes)
  - Búsqueda por cliente/email/número

### Estados Disponibles:
- ✅ **Iniciales**: Cotización solicitada, enviada, esperando aprobación
- 🛠️ **Producción**: Diseño, preparación materiales, corte, ebanistería, ensamblaje, acabados
- 📦 **Envío**: Listo para envío, en tránsito, entregado
- 🎯 **Especiales**: Instalación completa, cancelaciones, devoluciones

## 🔍 Vista Detallada de Órdenes
- **Información completa del cliente**
- **Estado actual** con posibilidad de cambio
- **Lista de productos** con precios y cantidades
- **Totales detallados** (subtotal, ITBIS, envío)
- **Historial de fechas** (creada, estimada, actual entrega)
- **Descarga de PDF** (próximamente)

## 🎨 Características Técnicas

### Diseño Responsive
- **Desktop**: Layout completo con sidebar
- **Mobile**: Menú hamburguesa y navegación adaptada
- **Tablet**: Diseño híbrido optimizado

### Sistema de Estados
- **22 estados especializados** para ebanistería
- **Estados duales**: Específico + General (pending, processing, shipped, delivered)
- **Automatizaciones** por estado (emails, asignaciones, checklists)
- **Colores únicos** por estado para identificación rápida

### Filtros y Búsqueda
- **Búsqueda en tiempo real** por múltiples campos
- **Filtros combinables** (estado + prioridad + fecha)
- **Etiquetas de filtros activos** con opción de quitar
- **Resultados paginados** para mejor rendimiento

### Seguridad
- **Usuario único** con credenciales fijas
- **Protección de rutas** admin-only
- **Sesión almacenada** en localStorage
- **Expiración automática** de sesión (24 horas)
- **Logout automático** al cerrar sesión

## 📱 Uso Móvil

### Navegación
1. **Menú hamburguesa** (≡) en la parte superior
2. **Sidebar deslizable** desde la izquierda
3. **Toque en overlay** para cerrar menú

### Funcionalidades Móviles
- **Scroll horizontal** en tablas de órdenes
- **Selects optimizados** para touch
- **Botones de acción** espaciados para dedos
- **Modales adaptados** a pantalla pequeña

## 🎯 Próximos Pasos

### Funcionalidades Pendientes
- [x] **Gestión de clientes** (Vista completa implementada)
- [ ] **Crear nueva orden** desde admin
- [ ] **Editar clientes** desde la interfaz
- [ ] **Sistema de reportes** avanzados
- [ ] **Exportación de datos** (Excel, PDF)
- [ ] **Notificaciones push** para estados críticos
- [ ] **Historial completo** de cambios por orden
- [ ] **Asignación automática** de órdenes
- [ ] **Dashboard de producción** en tiempo real

### Integraciones Futuras
- [ ] **WhatsApp API** para comunicación con clientes
- [ ] **Email templates** personalizados
- [ ] **Sistema de inventario** integrado
- [ ] **Financiamiento** integrado con bancos
- [ ] **Google Maps** para seguimiento GPS
- [ ] **QR codes** para verificación de entrega

## 🔧 Configuración de Producción

### Variables de Entorno
```bash
# Base de datos
DATABASE_URL=postgresql://...

# Autenticación
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-domain.com

# Emails
SENDGRID_API_KEY=SG.your-key
FROM_EMAIL=admin@romanaebanisteria.com

# Pagos
CARDNET_MERCHANT_ID=your-merchant-id
CARDNET_TERMINAL_ID=your-terminal-id
```

### Base de Datos
El sistema incluye **scripts SQL completos** para:
- Crear todas las tablas
- Índices optimizados
- Vistas para reporting
- Funciones automáticas
- Datos iniciales

---

## 📞 Soporte

**¿Necesitas ayuda?**
- 📧 Email: admin@romanaebanisteria.com
- 📱 WhatsApp: +1 (809) 000-0000
- 📍 Ubicación: La Romana, República Dominicana

---

*Sistema de administración creado específicamente para Romana Ebanistería - Gestión profesional de órdenes desde 1976* 🏭✨
