# Punktacja Projektu - AWS Mini E-Commerce

## Szczegółowe zestawienie punktów

### 1. Compute Service (1 pkt) ✅

**AWS Lambda + API Gateway**

Funkcje Lambda:
- `getProducts` - zwraca katalog produktów
- `getOrders` - pobiera zamówienia z DynamoDB
- `createOrder` - tworzy nowe zamówienie i wysyła powiadomienie SNS

API Gateway:
- REST API z 3 endpointami
- Integracja Lambda Proxy
- CORS skonfigurowany dla wszystkich endpointów

**Pliki**: `aws-lambda/*.js`

---

### 2. Data Storage (1 pkt) ✅

**Amazon DynamoDB**

Tabela `OrdersTable`:
- Partition key: `orderId` (String)
- Przechowuje wszystkie zamówienia klientów
- Automatyczne sortowanie po `createdAt`

Przykładowa struktura danych:
```json
{
  "orderId": "ORDER-1234567890-abc123",
  "customerName": "Jan Kowalski",
  "email": "jan@example.com",
  "items": [...],
  "totalAmount": "1299.99",
  "status": "PENDING",
  "createdAt": "2024-01-10T12:00:00.000Z"
}
```

---

### 3. Third AWS Service (0.5 pkt) ✅

**Amazon SNS (Simple Notification Service)**

- Topic: `OrderNotifications`
- Wysyła powiadomienia email przy każdym nowym zamówieniu
- Integracja w funkcji `createOrder`
- Subskrypcje email (opcjonalne)

Logika biznesowa:
- Klient składa zamówienie
- Zamówienie zapisywane w DynamoDB
- SNS automatycznie wysyła email z potwierdzeniem

**Kod**: `aws-lambda/createOrder.js:28-37`

---

### 4. IAM Security (0.5 pkt) ✅

**Role + Policies (Principle of Least Privilege)**

Rola: `LambdaEcommerceRole`

Uprawnienia:
1. CloudWatch Logs (AWSLambdaBasicExecutionRole)
   - `logs:CreateLogGroup`
   - `logs:CreateLogStream`
   - `logs:PutLogEvents`

2. DynamoDB (Custom inline policy)
   - `dynamodb:PutItem` - tworzenie zamówień
   - `dynamodb:GetItem` - pobieranie zamówień
   - `dynamodb:Scan` - listowanie zamówień
   - `dynamodb:Query` - zapytania

3. SNS (Custom inline policy)
   - `sns:Publish` - wysyłanie powiadomień

**Pliki**: `aws-iam/*.json`

---

### 5. Logging & Monitoring (0.5 pkt) ✅

**Amazon CloudWatch**

Automatyczne logowanie:
- `/aws/lambda/getProducts`
- `/aws/lambda/getOrders`
- `/aws/lambda/createOrder`

Przykładowe logi:
```
START RequestId: abc-123-def
Received event: {...}
Order created successfully: ORDER-1234567890
SNS notification sent successfully
END RequestId: abc-123-def
REPORT Duration: 145.23 ms Memory Used: 85 MB
```

Każda funkcja Lambda loguje:
- Przychodzące eventy
- Status operacji
- Błędy (jeśli wystąpią)
- Czas wykonania i zużycie pamięci

**Kod**: Wszystkie funkcje Lambda używają `console.log()` i `console.error()`

---

### 6. Error Handling (0.5 pkt) ✅

**Sensowne odpowiedzi HTTP i obsługa błędów**

Status codes:
- `200` - Sukces (GET)
- `201` - Created (POST)
- `400` - Bad Request (brakujące dane)
- `500` - Internal Server Error

Przykłady:

**Walidacja danych wejściowych:**
```javascript
if (!body.customerName || !body.email || !body.items) {
  return {
    statusCode: 400,
    body: JSON.stringify({
      error: 'Missing required fields: customerName, email, or items'
    })
  };
}
```

**Obsługa błędów:**
```javascript
try {
  // operacja DynamoDB
} catch (error) {
  console.error('Error creating order:', error);
  return {
    statusCode: 500,
    body: JSON.stringify({
      error: 'Internal server error',
      message: error.message
    })
  };
}
```

**Kod**: Wszystkie funkcje Lambda mają try-catch i zwracają odpowiednie kody HTTP

---

### 7. Frontend (0.5 pkt) ✅

**React + TypeScript**

Komponenty:
- `ProductCard` - wyświetlanie produktów
- `Cart` - koszyk zakupowy
- `CheckoutForm` - formularz zamówienia z walidacją
- `OrdersList` - historia zamówień

Funkcjonalności:
- Pobieranie produktów z API Gateway
- Dodawanie do koszyka
- Składanie zamówień (POST)
- Wyświetlanie historii zamówień
- Obsługa błędów z backendu
- Loading states
- Responsywny design

Integracja z AWS:
```typescript
const API_BASE_URL = import.meta.env.VITE_AWS_API_GATEWAY_URL;

// GET /products
await fetch(`${API_BASE_URL}/products`);

// POST /orders
await fetch(`${API_BASE_URL}/orders`, {
  method: 'POST',
  body: JSON.stringify(orderData)
});
```

**Pliki**: `src/components/*`, `src/services/api.ts`, `src/App.tsx`

---

### 8. Element dodatkowy (0 pkt)

Nie zaimplementowano, aby osiągnąć cel 4.5/5 punktów.

Możliwe rozszerzenia:
- AWS Cognito (autentykacja użytkowników)
- CloudFormation / Terraform (IaC)
- CodePipeline (CI/CD)
- EventBridge (event-driven patterns)
- Step Functions (orkiestracja)

---

## Podsumowanie

| Element | Punkty | Status |
|---------|--------|--------|
| Compute (Lambda + API Gateway) | 1.0 | ✅ |
| Storage (DynamoDB) | 1.0 | ✅ |
| Third Service (SNS) | 0.5 | ✅ |
| IAM Security | 0.5 | ✅ |
| Logging (CloudWatch) | 0.5 | ✅ |
| Error Handling | 0.5 | ✅ |
| Frontend (React) | 0.5 | ✅ |
| Element dodatkowy | 0.0 | - |
| **RAZEM** | **4.5 / 5** | ✅ |

---

## Logika biznesowa (nie na siłę)

Wszystkie usługi AWS mają realne zastosowanie:

1. **Lambda + API Gateway** - backend API (konieczne do działania aplikacji)
2. **DynamoDB** - przechowywanie zamówień (musi być persystencja danych)
3. **SNS** - powiadomienia email (standardowa funkcjonalność e-commerce)
4. **IAM** - bezpieczeństwo (wymagane dla wszystkich usług AWS)
5. **CloudWatch** - debugging i monitoring (niezbędne w produkcji)

Żadna usługa nie jest dodana "na siłę" - każda spełnia konkretną rolę w systemie.

---

## Weryfikacja działania

### 1. Frontend (lokalne)
```bash
npm run dev
```
Otwórz http://localhost:5173

### 2. Produkty (API)
```bash
curl https://YOUR_API_GATEWAY_URL/prod/products
```

### 3. Zamówienia (API)
```bash
curl https://YOUR_API_GATEWAY_URL/prod/orders
```

### 4. Tworzenie zamówienia (API)
```bash
curl -X POST https://YOUR_API_GATEWAY_URL/prod/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Test","email":"test@example.com","items":[{"id":"prod-1","name":"Laptop","price":1299.99,"quantity":1}]}'
```

### 5. CloudWatch Logs
AWS Console → CloudWatch → Log groups → `/aws/lambda/createOrder`

### 6. DynamoDB
AWS Console → DynamoDB → Tables → OrdersTable → Explore items

### 7. SNS (jeśli skonfigurowano)
Sprawdź email po utworzeniu zamówienia

---

## Dokumentacja

Szczegółowa instrukcja implementacji znajduje się w pliku **`AWS-SETUP.md`**

Zawiera:
- Krok po kroku konfigurację wszystkich usług AWS
- Screenshoty i przykłady
- Troubleshooting
- Testowanie
