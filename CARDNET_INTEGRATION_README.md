# Integración CardNET - Romana Ebanistería

Esta guía documenta la integración completa de la API de tokenización de CardNET para procesar pagos seguros en la tienda en línea.

## 🚀 Características Implementadas

- ✅ **Tokenización segura** de datos de tarjeta
- ✅ **Flujo de dos pasos**: Información del cliente → Pago seguro
- ✅ **Validación de formularios** con Zod
- ✅ **Manejo de estados** de transacción (Approved, Declined, Pending)
- ✅ **Idempotencia** con UniqueID
- ✅ **API server-side** segura con autenticación Basic Auth
- ✅ **Componente React** para captura de tarjetas
- ✅ **Manejo de errores** y feedback al usuario

## 📋 Requisitos Previos

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# CardNET Configuration
NEXT_PUBLIC_CARDNET_PUBLIC_KEY=tu_clave_publica_de_cardnet
CARDNET_PRIVATE_KEY=tu_clave_privada_de_cardnet

# Supabase (ya configurado)
NEXT_PUBLIC_SUPABASE_URL=https://xllyqmmzuymgnlfwsslu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_lJeJrQwpoyxJIDACZKF9-g_PasT39pB
```

### Claves de CardNET

1. **PublicAccountKey**: Se usa en el cliente para cargar la librería de captura
2. **PrivateAccountKey**: Se usa en el servidor para llamadas API (nunca expongas al cliente)

## 🏗️ Arquitectura

### Estructura de Archivos

```
src/
├── lib/
│   └── cardnet.ts              # Módulo principal con helpers y tipos
├── components/
│   └── store/
│       └── CardnetPaymentForm.tsx  # Componente de formulario de pago
├── pages/
│   ├── api/cardnet/
│   │   ├── purchase.ts         # Endpoint para procesar pagos
│   │   ├── customer.ts         # Endpoint para gestión de clientes
│   │   └── activate.ts         # Endpoint para activación de tarjetas
│   └── store/
│       └── checkout.tsx        # Página de checkout actualizada
```

### Flujo de Pago

1. **Usuario completa formulario** → Información personal + dirección
2. **Usuario hace clic en "Continuar al pago"** → Valida datos
3. **Se muestra formulario de CardNET** → Captura segura de tarjeta
4. **CardNET genera token** → Se envía al servidor
5. **Servidor procesa pago** → Llama a API de CardNET
6. **Resultado** → Redirige a página de éxito o muestra error

## 🔧 Configuración

### 1. Instalar Dependencias

```bash
npm install zod
```

### 2. Configurar Variables de Entorno

Asegúrate de tener las claves correctas de CardNET para el ambiente correspondiente:

- **Desarrollo**: Usa claves de LAB
- **Producción**: Usa claves de producción

### 3. Verificar Conexión

La integración detecta automáticamente el ambiente basado en `NODE_ENV`:

```typescript
const baseUrl = process.env.NODE_ENV === 'production'
  ? 'https://cardnet.com.do'
  : 'https://lab.cardnet.com.do'
```

## 📡 API Endpoints

### POST `/api/cardnet/purchase`

Procesa un pago con token de CardNET.

**Request Body:**
```json
{
  "trxToken": "token_generado_por_cardnet",
  "amount": 1500.00,
  "currency": "DOP",
  "invoice": "ORD123456",
  "tax": "0"
}
```

**Response:**
```json
{
  "success": true,
  "purchaseId": "PUR123456",
  "approvalCode": "123456",
  "status": "approved",
  "message": "Pago aprobado exitosamente"
}
```

### POST `/api/cardnet/customer`

Crea un cliente para pagos recurrentes.

**Request Body:**
```json
{
  "email": "cliente@email.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phoneNumber": "8091234567"
}
```

### POST `/api/cardnet/activate`

Activa una tarjeta guardada (requiere código de microcargo).

**Request Body:**
```json
{
  "customerId": "CUS123456",
  "token": "token_de_tarjeta",
  "activationCode": "123456"
}
```

## 🎨 Componentes

### CardnetPaymentForm

Componente principal para captura de datos de tarjeta.

```tsx
<CardnetPaymentForm
  amount={1500.00}
  currency="DOP"
  invoice="ORD123456"
  onTokenCreated={(token) => console.log('Token:', token)}
  onError={(error) => console.log('Error:', error)}
  isProcessing={false}
/>
```

**Props:**
- `amount`: Monto a cobrar
- `currency`: Moneda (DOP para RD)
- `invoice`: Número de factura
- `onTokenCreated`: Callback cuando se genera el token
- `onError`: Callback para errores
- `isProcessing`: Estado de procesamiento

## 🔒 Seguridad

### Medidas Implementadas

1. **Separación de claves**: Pública en cliente, privada en servidor
2. **HTTPS obligatorio**: Todas las llamadas usan TLS 1.2
3. **Autenticación Basic Auth**: Para llamadas server-to-server
4. **Validación de datos**: Con Zod schemas
5. **Idempotencia**: UniqueID para evitar duplicaciones
6. **No almacenamos datos sensibles**: Solo tokens temporales

### Mejores Prácticas

- Nunca expongas `CARDNET_PRIVATE_KEY` al navegador
- Usa HTTPS en producción
- Implementa rate limiting en los endpoints
- Registra auditoría de transacciones
- Maneja errores gracefully sin exponer detalles internos

## 🧪 Testing

### Ambiente LAB

Para testing, usa las claves de LAB y el endpoint `https://lab.cardnet.com.do`.

### Tarjetas de Prueba

CardNET proporciona tarjetas de prueba para diferentes escenarios:

- **Aprobada**: 4111111111111111
- **Declinada**: 4000000000000002
- **Fondos insuficientes**: 4000000000009995

## 🚨 Manejo de Errores

### Estados de Transacción

- **Approved**: Pago exitoso
- **Declined**: Pago rechazado
- **Pending**: Pago pendiente (requiere acción adicional)

### Códigos de Error Comunes

- `400`: Datos inválidos
- `401`: Error de autenticación
- `500`: Error interno del servidor

## 📊 Monitoreo

### Logs Recomendados

```typescript
// En cada endpoint, registra:
{
  orderId: "ORD123456",
  purchaseId: "PUR123456",
  amount: 1500.00,
  status: "approved",
  timestamp: Date.now(),
  customerEmail: "cliente@email.com"
}
```

### Métricas

- Tasa de conversión de pagos
- Tiempo promedio de procesamiento
- Tipos de errores más comunes

## 🔄 Próximos Pasos

### Funcionalidades Avanzadas

1. **Pagos recurrentes** con Customer + PaymentProfile
2. **Webhooks** para conciliación automática
3. **Reintentos automáticos** para pagos pendientes
4. **3DS** para autenticación avanzada

### Mejoras de UX

1. **Guardar tarjetas** para compras futuras
2. **Pago en cuotas** (si aplica)
3. **Notificaciones por email** de estado de pago
4. **Dashboard de pedidos** para clientes

## 🆘 Soporte

Para issues relacionados con CardNET:

1. Revisa la documentación oficial
2. Verifica las claves de API
3. Revisa los logs del servidor
4. Contacta al soporte de CardNET si es necesario

---

## 📝 Checklist de Producción

- [ ] Variables de entorno configuradas
- [ ] Claves de CardNET válidas
- [ ] HTTPS habilitado
- [ ] Testing en LAB completado
- [ ] Manejo de errores implementado
- [ ] Logs de auditoría configurados
- [ ] Monitoreo de transacciones activo
