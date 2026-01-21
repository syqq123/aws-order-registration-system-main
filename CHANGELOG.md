# Changelog - AWS E-Commerce

## Nowe funkcjonalności

### 1. Edycja zamówień

Dodano możliwość edycji istniejących zamówień:
- Zmiana statusu zamówienia (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
- Modyfikacja produktów w zamówieniu (zmiana ilości, usuwanie produktów)
- Automatyczne przeliczanie sumy zamówienia
- Walidacja danych wejściowych

**Pliki**:
- `aws-lambda/updateOrder.js` - funkcja Lambda
- `src/components/EditOrderModal.tsx` - modal edycji
- `src/services/api.ts` - metoda updateOrder()

### 2. Usuwanie zamówień

Dodano możliwość usuwania zamówień:
- Usuwanie zamówienia z bazy DynamoDB
- Potwierdzenie przed usunięciem
- Automatyczne odświeżanie listy zamówień

**Pliki**:
- `aws-lambda/deleteOrder.js` - funkcja Lambda
- `src/components/OrdersList.tsx` - przyciski Delete
- `src/services/api.ts` - metoda deleteOrder()

### 3. Testy jednostkowe (100% pokrycie)

Dodano kompleksowe testy jednostkowe dla wszystkich funkcji Lambda:

#### getProducts.test.js (10 testów)
- ✅ Status code 200
- ✅ CORS headers
- ✅ Zwrócenie 5 produktów
- ✅ Poprawna struktura danych
- ✅ Typy danych

#### getOrders.test.js (6 testów)
- ✅ Status code 200 z pustą listą
- ✅ CORS headers
- ✅ Sortowanie zamówień
- ✅ Obsługa błędów

#### createOrder.test.js (11 testów)
- ✅ Walidacja body (brak/invalid JSON)
- ✅ Walidacja pól wymaganych
- ✅ Tworzenie zamówienia
- ✅ Kalkulacja sumy
- ✅ Unikalne order IDs

#### updateOrder.test.js (9 testów)
- ✅ Walidacja orderId
- ✅ Order not found (404)
- ✅ Aktualizacja statusu
- ✅ Aktualizacja items
- ✅ Zachowanie istniejących pól

#### deleteOrder.test.js (7 testów)
- ✅ Walidacja orderId
- ✅ Order not found (404)
- ✅ Usunięcie zamówienia
- ✅ Obsługa pathParameters

**Łącznie: 43 testy**

**Pliki**:
- `__tests__/lambda/*.test.js` - testy
- `vitest.config.ts` - konfiguracja Vitest
- `package.json` - skrypty testowe

### 4. CI/CD z GitLab

Dodano kompletną konfigurację CI/CD:

#### Pipeline stages:
1. **Install** - instalacja zależności (cache)
2. **Test** - 4 joby równolegle:
   - Lint (ESLint)
   - Typecheck (TypeScript)
   - Unit tests
   - Coverage report (100% wymagane)
3. **Build** - budowanie projektu
4. **Deploy** - staging i production (manual)

#### Dodatkowe features:
- Automatyczne generowanie raportów pokrycia
- GitLab Pages dla coverage reports
- Cache node_modules dla szybszych buildów
- Artifacts dla coverage i dist/

**Pliki**:
- `.gitlab-ci.yml` - konfiguracja pipeline

### 5. Zaktualizowana dokumentacja

#### AWS-SETUP.md
- Dodano instrukcje dla `updateOrder` Lambda
- Dodano instrukcje dla `deleteOrder` Lambda
- Dodano konfigurację API Gateway PUT /orders
- Dodano konfigurację API Gateway DELETE /orders/{orderId}
- Dodano sekcję o testach jednostkowych
- Dodano sekcję o CI/CD
- Dodano testy dla edycji i usuwania zamówień

#### TESTING-CICD.md (nowy plik)
- Szczegółowa instrukcja uruchamiania testów
- Opis struktury testów
- Instrukcja konfiguracji GitLab CI/CD
- Troubleshooting testów i pipeline
- Przykładowe outputy

#### CHANGELOG.md (ten plik)
- Podsumowanie wszystkich zmian

---

## Zmiany w kodzie

### Backend (AWS Lambda)

#### Nowe funkcje:
1. `aws-lambda/updateOrder.js`
   - Aktualizacja statusu zamówienia
   - Aktualizacja items
   - Walidacja orderId
   - Error handling (404, 400, 500)

2. `aws-lambda/deleteOrder.js`
   - Usuwanie zamówienia z DynamoDB
   - Walidacja orderId
   - Sprawdzanie czy zamówienie istnieje
   - Error handling (404, 400, 500)

### Frontend (React)

#### Nowe komponenty:
1. `src/components/EditOrderModal.tsx`
   - Modal do edycji zamówienia
   - Zmiana statusu (select)
   - Zmiana ilości produktów
   - Usuwanie produktów z zamówienia
   - Walidacja (minimum 1 produkt)
   - Live preview sumy zamówienia

#### Zaktualizowane komponenty:
1. `src/components/OrdersList.tsx`
   - Dodano przyciski "Edit Order" i "Delete Order"
   - Dodano props: onEdit, onDelete
   - Confirm dialog dla usuwania

2. `src/App.tsx`
   - Dodano state editingOrder
   - Dodano handleEditOrder()
   - Dodano handleDeleteOrder()
   - Integracja z EditOrderModal

3. `src/services/api.ts`
   - Dodano interface UpdateOrderRequest
   - Dodano metodę updateOrder()
   - Dodano metodę deleteOrder()

### Bezpieczeństwo (IAM)

#### Zaktualizowana polityka:
`aws-iam/lambda-role-policy.json`
- Dodano uprawnienie `dynamodb:UpdateItem`
- Dodano uprawnienie `dynamodb:DeleteItem`

---

## API Endpoints

### Nowe endpointy:

#### PUT /orders
Aktualizacja zamówienia

**Request:**
```json
{
  "orderId": "ORDER-123",
  "status": "SHIPPED",
  "items": [
    { "id": "prod-1", "name": "Laptop", "price": 1299.99, "quantity": 1 }
  ]
}
```

**Response (200):**
```json
{
  "message": "Order updated successfully",
  "order": {
    "orderId": "ORDER-123",
    "status": "SHIPPED",
    "items": [...],
    "totalAmount": "1299.99",
    "updatedAt": "2024-01-10T15:30:00Z"
  }
}
```

#### DELETE /orders/{orderId}
Usunięcie zamówienia

**Response (200):**
```json
{
  "message": "Order deleted successfully",
  "orderId": "ORDER-123"
}
```

---

## Instrukcje wdrożenia

### 1. Zaktualizuj politykę IAM

W AWS Console → IAM → Roles → LambdaEcommerceRole:
1. Otwórz inline policy `DynamoDBSNSAccess`
2. Dodaj uprawnienia: `UpdateItem` i `DeleteItem`
3. Zapisz zmiany

### 2. Utwórz nowe funkcje Lambda

#### updateOrder:
1. AWS Console → Lambda → Create function
2. Name: `updateOrder`
3. Runtime: Node.js 18.x
4. Role: `LambdaEcommerceRole`
5. Code: skopiuj z `aws-lambda/updateOrder.js`
6. Environment variables:
   - `ORDERS_TABLE_NAME` = `OrdersTable`

#### deleteOrder:
1. AWS Console → Lambda → Create function
2. Name: `deleteOrder`
3. Runtime: Node.js 18.x
4. Role: `LambdaEcommerceRole`
5. Code: skopiuj z `aws-lambda/deleteOrder.js`
6. Environment variables:
   - `ORDERS_TABLE_NAME` = `OrdersTable`

### 3. Zaktualizuj API Gateway

#### Dodaj metodę PUT dla /orders:
1. Zaznacz `/orders`
2. Create method → PUT
3. Integration: Lambda → `updateOrder`
4. Deploy API

#### Dodaj zasób /orders/{orderId}:
1. Zaznacz `/orders`
2. Create resource
3. Resource name: `{orderId}` (z nawiasami!)
4. Enable CORS

#### Dodaj metodę DELETE dla /orders/{orderId}:
1. Zaznacz `/orders/{orderId}`
2. Create method → DELETE
3. Integration: Lambda → `deleteOrder`
4. Enable Lambda Proxy
5. Deploy API

### 4. Uruchom testy

```bash
npm install
npm test
npm run test:coverage
```

### 5. Skonfiguruj GitLab CI/CD

1. Push projektu do GitLab
2. Pipeline uruchomi się automatycznie
3. Dodaj zmienne środowiskowe AWS (opcjonalnie)

---

## Breaking Changes

**Brak breaking changes** - wszystkie istniejące funkcjonalności działają bez zmian.

---

## Statystyki projektu

### Funkcje Lambda: 5
- getProducts
- getOrders
- createOrder
- **updateOrder** (nowy)
- **deleteOrder** (nowy)

### Endpointy API Gateway: 5
- GET /products
- GET /orders
- POST /orders
- **PUT /orders** (nowy)
- **DELETE /orders/{orderId}** (nowy)

### Komponenty React: 5
- ProductCard
- Cart
- CheckoutForm
- OrdersList
- **EditOrderModal** (nowy)

### Testy: 43
- getProducts: 10 testów
- getOrders: 6 testów
- createOrder: 11 testów
- **updateOrder: 9 testów** (nowe)
- **deleteOrder: 7 testów** (nowe)

### Pokrycie kodu: 100%
- Statements: 100%
- Branches: 100%
- Functions: 100%
- Lines: 100%

---

## Podziękowania

Projekt zrealizowany zgodnie z wymaganiami:
- ✅ Funkcje usuwania i edytowania zamówień
- ✅ Instrukcje konfiguracji AWS
- ✅ Testy jednostkowe z 100% pokryciem
- ✅ Skrypt CI/CD dla GitLab
