# (Deprecated) CardNet Payment Integration

La integración con la pasarela de pagos CardNet fue eliminada del proyecto. Este archivo se conserva únicamente como referencia histórica y para evitar confusiones sobre variables de entorno antiguas.

## Estado Actual

- Ya NO existe flujo de pago en línea.
- El checkout solo crea la orden internamente (flujo manual / pago fuera de línea).
- Los endpoints `/api/payments/cardnet/*` responden 410 (Gone).
- Las páginas de depuración y retorno (`/debug/*`, `/notify/*`) relacionadas a CardNet fueron reemplazadas por stubs o removidas.

## Qué Debes Hacer

1. Eliminar cualquier variable de entorno `CARDNET_*` de tus archivos `.env` si ya no se usarán para otros fines.
2. Verificar que no existan automatizaciones externas apuntando a URLs antiguas de retorno.
3. Comunicar a los usuarios (si aplica) que los pagos ahora se coordinan manualmente tras colocar la orden.

## Restaurar (Opcional / Futuro)

Si en el futuro se desea reintroducir pagos en línea:

- Implementar nuevamente un módulo de pasarela (recomendado hacerlo desacoplado detrás de una interfaz `PaymentProvider`).
- Añadir pruebas unitarias para normalización de respuestas y validaciones de montos.
- Usar variables de entorno namespaced (ej: `PAYMENTS_CARDNET_*`) para aislar configuraciones.

## Historial Breve

La antigua versión incluía:
- Creación de sesión con parámetros 3DS
- Normalización de respuesta y polling de estado
- Páginas de notificación `/notify/success` y `/notify/cancelled`
- Emails diferenciados para pago aprobado

Todo esto ha sido eliminado para simplificar el flujo comercial actual.

---

Si encuentras referencias residuales a "CardNet" en el código, realiza un grep global y elimínalas. Cualquier duda: documentar en README principal.

### Shipping Fields (usually same as billing)
- `3DS_shipAddr_line1`: Shipping address line 1
- `3DS_shipAddr_line2`: Shipping address line 2
- `3DS_shipAddr_line3`: Shipping address line 3
- `3DS_shipAddr_city`: Shipping city
- `3DS_shipAddr_state`: Shipping province code
- `3DS_shipAddr_country`: Shipping country code
- `3DS_shipAddr_postcode`: Shipping postal code

### Province Codes
- Distrito Nacional: "01"
- Santo Domingo: "32"  
- Santiago: "25"
- La Romana: "12"
- Puerto Plata: "18"
- (See `/debug/3ds-format` for complete mapping)

## Payment Flow

1. **Customer fills checkout form** → Required for 3DS data
2. **Session creation** → POST to CardNet with 3DS info
3. **Gateway redirect** → Auto-POST to CardNet payment page
4. **Customer pays** → Enters card details on CardNet
5. **Return handling** → CardNet redirects back with SESSION
6. **Status verification** → Verify payment result via API
7. **Order processing** → Send confirmations, clear cart

## Response Codes

- `00` - Approved ✅
- `04`, `05`, `07` - Declined ❌  
- `33` - Card expired ❌
- `51` - Insufficient funds ❌
- `TF` - 3DS authentication failed ❌
- `94` - Duplicate transaction ❌

## Troubleshooting

### Common Issues

1. **Session not found (404)**
   - Sessions expire after 30 minutes
   - Create new session and retry

2. **3DS validation errors**
   - Ensure all required 3DS fields are provided
   - Phone numbers should be numeric only
   - Addresses should not exceed field limits

3. **Amount formatting errors**
   - Amounts must be in minor units (centavos)
   - 12-digit zero-padded format required

4. **Merchant configuration errors**
   - Verify merchant credentials with CardNet
   - Ensure terminal IDs are correct
   - Check environment settings

### Logs

Check your application logs for:
- `[CardNet]` prefixed messages for payment flow
- `[Order]` prefixed messages for order processing
- Error details and response codes

## Support

For CardNet-specific issues, contact CardNet support with:
- Your merchant number
- Transaction ID or session ID
- Timestamp of the issue
- Response codes received

For implementation issues, check:
- Environment variable configuration
- Network connectivity to CardNet endpoints
- TLS 1.2+ support in your hosting environment
