# AWS Mini E-Commerce

System rejestracji zamówień wykorzystujący AWS Lambda, API Gateway, DynamoDB i SNS.

## Architektura

### Usługi AWS (4.5/5 punktów)

✅ **Compute** (1 pkt): AWS Lambda + API Gateway
- `getProducts` - pobieranie listy produktów
- `getOrders` - pobieranie zamówień z DynamoDB
- `createOrder` - tworzenie nowego zamówienia

✅ **Storage** (1 pkt): Amazon DynamoDB
- Tabela `OrdersTable` przechowująca zamówienia

✅ **Third Service** (0.5 pkt): Amazon SNS
- Wysyłanie powiadomień email o nowych zamówieniach

✅ **IAM** (0.5 pkt): Role i polityki bezpieczeństwa
- Minimalne uprawnienia dla Lambda
- Dostęp tylko do wymaganych zasobów

✅ **Monitoring** (0.5 pkt): CloudWatch Logs
- Automatyczne logowanie wszystkich wywołań Lambda

✅ **Error Handling** (0.5 pkt): Obsługa błędów
- Walidacja danych wejściowych
- Sensowne kody HTTP i komunikaty błędów

✅ **Frontend** (0.5 pkt): React + TypeScript
- Komunikacja z AWS API Gateway
- Responsywny interfejs użytkownika

## Funkcjonalności

- 📦 Przeglądanie katalogu produktów
- 🛒 Dodawanie produktów do koszyka
- 💳 Składanie zamówień
- 📧 Automatyczne powiadomienia email (SNS)
- 📊 Historia zamówień
- 🔒 Bezpieczne API z IAM

## Instalacja lokalna

### 1. Klonowanie i instalacja zależności

```bash
npm install
```

### 2. Konfiguracja AWS

Wykonaj wszystkie kroki z pliku **`AWS-SETUP.md`**

### 3. Konfiguracja środowiska

Utwórz plik `.env` w głównym katalogu:

```bash
VITE_AWS_API_GATEWAY_URL=https://your-api-id.execute-api.region.amazonaws.com/prod
```

Zamień URL na swój adres API Gateway (bez `/prod` na końcu).

### 4. Uruchomienie aplikacji

```bash
npm run dev
```

Aplikacja dostępna na: `http://localhost:5173`

## Struktura projektu

```
.
├── src/
│   ├── components/          # Komponenty React
│   │   ├── ProductCard.tsx  # Karta produktu
│   │   ├── Cart.tsx         # Koszyk zakupowy
│   │   ├── CheckoutForm.tsx # Formularz zamówienia
│   │   └── OrdersList.tsx   # Lista zamówień
│   ├── services/
│   │   └── api.ts           # Klient API AWS
│   └── App.tsx              # Główny komponent
├── aws-lambda/              # Funkcje Lambda
│   ├── getProducts.js       # Pobieranie produktów
│   ├── getOrders.js         # Pobieranie zamówień
│   └── createOrder.js       # Tworzenie zamówienia
├── aws-iam/                 # Polityki IAM
│   ├── lambda-role-policy.json
│   └── lambda-trust-policy.json
└── AWS-SETUP.md             # Szczegółowa instrukcja AWS
```

## Endpointy API

### GET /products
Zwraca listę dostępnych produktów

**Response:**
```json
{
  "products": [
    {
      "id": "prod-1",
      "name": "Laptop Dell XPS 15",
      "price": 1299.99,
      "description": "High-performance laptop",
      "category": "Electronics"
    }
  ],
  "count": 5
}
```

### GET /orders
Zwraca wszystkie zamówienia z DynamoDB

**Response:**
```json
{
  "orders": [
    {
      "orderId": "ORDER-1234567890",
      "customerName": "Jan Kowalski",
      "email": "jan@example.com",
      "items": [...],
      "totalAmount": "1299.99",
      "status": "PENDING",
      "createdAt": "2024-01-10T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

### POST /orders
Tworzy nowe zamówienie

**Request:**
```json
{
  "customerName": "Jan Kowalski",
  "email": "jan@example.com",
  "items": [
    {
      "id": "prod-1",
      "name": "Laptop",
      "price": 1299.99,
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "message": "Order created successfully",
  "order": {
    "orderId": "ORDER-1234567890",
    "customerName": "Jan Kowalski",
    "email": "jan@example.com",
    "items": [...],
    "totalAmount": "1299.99",
    "status": "PENDING",
    "createdAt": "2024-01-10T12:00:00.000Z"
  }
}
```

## Monitoring

### CloudWatch Logs

Logi dostępne w AWS Console → CloudWatch → Log groups:
- `/aws/lambda/getProducts`
- `/aws/lambda/getOrders`
- `/aws/lambda/createOrder`

### Przykładowe logi

```
Received event: {...}
Order created successfully: ORDER-1234567890
SNS notification sent successfully
```

## Bezpieczeństwo

### IAM Role
- Lambda ma minimalne uprawnienia (least privilege)
- Dostęp tylko do DynamoDB i SNS
- Automatyczne logi w CloudWatch

### API Gateway
- CORS skonfigurowany dla bezpiecznych żądań
- Wszystkie endpointy z obsługą błędów

## Troubleshooting

### Problem: "Failed to load products"
- Sprawdź czy Lambda funkcje są wdrożone
- Sprawdź czy API Gateway ma poprawne endpointy
- Sprawdź czy `.env` ma poprawny URL

### Problem: "Failed to create order"
- Sprawdź uprawnienia IAM dla Lambda
- Sprawdź czy DynamoDB tabela istnieje
- Sprawdź logi CloudWatch

### Problem: Brak powiadomień email
- Sprawdź czy SNS topic jest utworzony
- Sprawdź czy potwierdziłeś subskrypcję email
- Sprawdź folder SPAM

## Koszty AWS

Projekt wykorzystuje AWS Free Tier:
- Lambda: 1M wywołań/miesiąc (free)
- API Gateway: 1M wywołań/miesiąc (free)
- DynamoDB: 25 GB storage (free)
- SNS: 1000 emaili/miesiąc (free)

## Dokumentacja AWS

- [AWS Lambda](https://docs.aws.amazon.com/lambda/)
- [API Gateway](https://docs.aws.amazon.com/apigateway/)
- [DynamoDB](https://docs.aws.amazon.com/dynamodb/)
- [SNS](https://docs.aws.amazon.com/sns/)

## Licencja

MIT
