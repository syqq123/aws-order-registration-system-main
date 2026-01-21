# AWS Mini E-Commerce - Instrukcja Implementacji

## Spis treści
1. [Wymagania wstępne](#wymagania-wstępne)
2. [Krok 1: DynamoDB - Baza danych](#krok-1-dynamodb---baza-danych)
3. [Krok 2: SNS - Powiadomienia](#krok-2-sns---powiadomienia)
4. [Krok 3: IAM - Role i uprawnienia](#krok-3-iam---role-i-uprawnienia)
5. [Krok 4: Lambda Functions](#krok-4-lambda-functions)
6. [Krok 5: API Gateway](#krok-5-api-gateway)
7. [Krok 6: Frontend](#krok-6-frontend)
8. [Testowanie](#testowanie)
9. [Monitoring i logi](#monitoring-i-logi)

---

## Ważna uwaga: Nowa wersja AWS Console

AWS Console został niedawno zaktualizowany. Instrukcje poniżej zostały zaktualizowane dla nowej wersji, ale niektóre elementy UI mogą się nieco różnić:

- **Resource Path** w API Gateway ustawia się teraz **automatycznie** - nie musisz go wpisywać ręcznie
- **Security Policy** - jeśli pojawi się to pole, zostawiaj **Default**
- Przyciski mogą mieć nazwy: **Create resource**, **Create method** zamiast **Actions**
- Wszystkie kroki działają tak samo, tylko UI jest inny

Jeśli któryś krok nie zgadza się z tym co widzisz, patrz sekcję **Troubleshooting** na końcu instrukcji.

## Wymagania wstępne

- Konto AWS (free tier wystarczy)
- AWS CLI zainstalowane (opcjonalnie)
- Node.js zainstalowane lokalnie

---

## Krok 1: DynamoDB - Baza danych

### 1.1 Tworzenie tabeli Orders

1. Zaloguj się do **AWS Console**
2. Wejdź w **DynamoDB**
3. Kliknij **Create table**
4. Wypełnij dane:
   - **Table name**: `OrdersTable`
   - **Partition key**: `orderId` (String)
   - **Table settings**: Default settings
5. Kliknij **Create table**

### 1.2 Weryfikacja

- Tabela powinna być w stanie `Active` po kilku sekundach
- Zanotuj **ARN** tabeli (będzie potrzebny w IAM)

---

## Krok 2: SNS - Powiadomienia

### 2.1 Tworzenie SNS Topic

1. Wejdź w **SNS** (Simple Notification Service)
2. Kliknij **Topics** → **Create topic**
3. Wypełnij:
   - **Type**: Standard
   - **Name**: `OrderNotifications`
4. Kliknij **Create topic**
5. **Zanotuj ARN** (np. `arn:aws:sns:us-east-1:123456789:OrderNotifications`)

### 2.2 Tworzenie subskrypcji (opcjonalnie)

1. W szczegółach topicu kliknij **Create subscription**
2. Wybierz **Protocol**: Email
3. **Endpoint**: Twój email
4. Kliknij **Create subscription**
5. Potwierdź subskrypcję poprzez link w emailu

> **Uwaga**: Możesz pominąć subskrypcję - SNS i tak będzie działać, po prostu nie dostaniesz emaili.

---

## Krok 3: IAM - Role i uprawnienia

### 3.1 Tworzenie roli dla Lambda

1. Wejdź w **IAM**
2. Kliknij **Roles** → **Create role**
3. **Trusted entity type**: AWS service
4. **Use case**: Lambda
5. Kliknij **Next**

### 3.2 Dodawanie polityk

1. Wyszukaj i zaznacz: `AWSLambdaBasicExecutionRole` (dla CloudWatch)
2. Kliknij **Next**
3. **Role name**: `LambdaEcommerceRole`
4. Kliknij **Create role**

### 3.3 Dodawanie inline policy dla DynamoDB i SNS

1. Otwórz utworzoną rolę `LambdaEcommerceRole`
2. Kliknij **Add permissions** → **Create inline policy**
3. Wybierz **JSON** i wklej zawartość z pliku `aws-iam/lambda-role-policy.json`
4. **WAŻNE**: Zamień region i account ID w ARN na swoje dane:
   ```json
   "Resource": "arn:aws:dynamodb:us-east-1:YOUR_ACCOUNT_ID:table/OrdersTable"
   "Resource": "arn:aws:sns:us-east-1:YOUR_ACCOUNT_ID:OrderNotifications"
   ```
5. **Policy name**: `DynamoDBSNSAccess`
6. Kliknij **Create policy**

---

## Krok 4: Lambda Functions

### 4.1 Tworzenie funkcji: getProducts

1. Wejdź w **Lambda**
2. Kliknij **Create function**
3. Wypełnij:
   - **Function name**: `getProducts`
   - **Runtime**: Node.js 18.x lub nowszy
   - **Architecture**: x86_64
   - **Permissions**: Use an existing role → `LambdaEcommerceRole`
4. Kliknij **Create function**
5. W edytorze kodu wklej zawartość z `aws-lambda/getProducts.js`
6. Kliknij **Deploy**

### 4.2 Tworzenie funkcji: getOrders

1. Powtórz kroki jak wyżej
2. **Function name**: `getOrders`
3. Użyj roli: `LambdaEcommerceRole`
4. Wklej kod z `aws-lambda/getOrders.js`
5. W zakładce **Configuration** → **Environment variables**:
   - Klucz: `ORDERS_TABLE_NAME`, Wartość: `OrdersTable`
6. Kliknij **Deploy**

### 4.3 Tworzenie funkcji: createOrder

1. Powtórz kroki jak wyżej
2. **Function name**: `createOrder`
3. Użyj roli: `LambdaEcommerceRole`
4. Wklej kod z `aws-lambda/createOrder.js`
5. W zakładce **Configuration** → **Environment variables** dodaj:
   - Klucz: `ORDERS_TABLE_NAME`, Wartość: `OrdersTable`
   - Klucz: `SNS_TOPIC_ARN`, Wartość: `arn:aws:sns:REGION:ACCOUNT_ID:OrderNotifications` (Twój ARN z kroku 2)
6. Kliknij **Deploy**

### 4.4 Testowanie Lambda (opcjonalnie)

Możesz przetestować każdą funkcję:
1. Kliknij **Test** w funkcji
2. Dla `createOrder` użyj test event:
```json
{
  "body": "{\"customerName\":\"Jan Kowalski\",\"email\":\"jan@example.com\",\"items\":[{\"id\":\"prod-1\",\"name\":\"Laptop\",\"price\":1299.99,\"quantity\":1}]}"
}
```

---

## Krok 5: API Gateway

### 5.1 Tworzenie REST API

1. Wejdź w **API Gateway**
2. Kliknij **Create API** (lub **APIs** jeśli masz nową wersję)
3. Wybierz **REST API** (nie private) → **Build**
4. Wypełnij:
   - **API name**: `EcommerceAPI`
   - **Endpoint Type**: Regional
   - **Resource Policy**: Leave empty (lub **Default** - wciśnij **Create API**)
5. Kliknij **Create API**

> **WAŻNE**: Jeśli pojawi się dodatkowe okno z Security Policy, po prostu pozostaw domyślne ustawienia i kliknij dalej.

### 5.2 Tworzenie zasobów i metod

#### Resource: /products

1. Zaznacz **/** (root resource) w drzewie z lewej strony
2. Kliknij **Create resource** (lub **Actions** → **Create Resource**)
3. Wypełnij:
   - **Resource name**: `products` (będzie się zmienić w **Resource path** na `/products`)
   - **Enable API Gateway CORS**: ✓ (zaznacz!)
4. Kliknij **Create resource**

> **WAŻNE**: Resource Path powinien być automatycznie ustawiony na `/products`. Jeśli nie widać tego pola, nie musisz go wypełniać - będzie ustawiony automatycznie!

#### Metoda GET dla /products

1. Zaznacz `/products` w drzewie z lewej
2. Kliknij **Create method** (lub **Actions** → **Create Method**)
3. Wybierz **GET** z dropdown menu
4. Wypełnij:
   - **Integration type**: AWS Lambda
   - **Lambda function**: `getProducts` (zacznij pisać nazwę, powinno się pojawić w dropdown)
   - **Use Lambda Proxy integration**: ✓ (zaznacz, jeśli istnieje opcja)
5. Kliknij **Create method**
6. Jeśli pojawi się okno potwierdzenia uprawnień → **OK**

#### Resource: /orders

1. Zaznacz **/** (root resource) w drzewie z lewej
2. Kliknij **Create resource**
3. Wypełnij:
   - **Resource name**: `orders`
   - **Enable API Gateway CORS**: ✓
4. Kliknij **Create resource**

#### Metoda GET dla /orders

1. Zaznacz `/orders`
2. Kliknij **Create method** → **GET**
3. Wypełnij:
   - **Integration type**: AWS Lambda
   - **Lambda function**: `getOrders`
4. Kliknij **Create method**

#### Metoda POST dla /orders

1. Zaznacz `/orders` (powinna być już zaznaczona)
2. Kliknij **Create method** → **POST**
3. Wypełnij:
   - **Integration type**: AWS Lambda
   - **Lambda function**: `createOrder`
4. Kliknij **Create method**

### 5.3 Włączanie CORS (WAŻNE!)

CORS powinien być już włączony, jeśli zaznaczyłeś **Enable API Gateway CORS** przy tworzeniu zasobów.

Aby sprawdzić/włączyć CORS ręcznie:

Dla każdego zasobu (/products i /orders):
1. Zaznacz zasób
2. Kliknij na **OPTIONS** (jeśli istnieje, to CORS jest włączony)
3. Jeśli OPTIONS nie istnieje:
   - Kliknij **Create method** → **OPTIONS**
   - **Integration type**: Mock
   - Kliknij **Create method**
4. Zaznacz znowu zasób
5. Kliknij **CORS** lub **Enable CORS** (jeśli jest przycisk)
6. Zaznacz wszystkie headery
7. Kliknij **Save and create CORS headers**

### 5.4 Deploy API

1. Kliknij przycisk **Deploy** (u góry) lub **Actions** → **Deploy API**
2. Wybierz:
   - **Stage**: Create new stage
   - **Stage name**: `prod`
3. Kliknij **Deploy**

Jeśli pojawi się okno z opcjami, po prostu potwierdź defaults i deploy.

### 5.5 Zanotuj URL

Po deploymencie zobaczysz **Invoke URL**, np.:
```
https://abc123def.execute-api.us-east-1.amazonaws.com/prod
```

**Zanotuj ten URL - będzie potrzebny w frontend!**

---

## Krok 6: Frontend

### 6.1 Konfiguracja zmiennych środowiskowych

1. W głównym katalogu projektu utwórz plik `.env`:
```bash
VITE_AWS_API_GATEWAY_URL=https://YOUR_API_GATEWAY_URL/prod
```

Zamień `YOUR_API_GATEWAY_URL` na URL z kroku 5.5 (BEZ `/prod` na końcu - dodamy go w kodzie).

### 6.2 Instalacja zależności

```bash
npm install
```

### 6.3 Uruchomienie aplikacji

```bash
npm run dev
```

Aplikacja powinna być dostępna na `http://localhost:5173`

---

## Testowanie

### Test 1: Pobieranie produktów
1. Otwórz aplikację
2. Powinieneś zobaczyć listę 5 produktów

### Test 2: Tworzenie zamówienia
1. Dodaj produkty do koszyka
2. Wypełnij formularz zamówienia
3. Kliknij "Place Order"
4. Powinieneś zobaczyć potwierdzenie

### Test 3: Przeglądanie zamówień
1. Kliknij zakładkę "Orders"
2. Powinieneś zobaczyć listę utworzonych zamówień

### Test 4: SNS (jeśli skonfigurowałeś subskrypcję)
1. Po utworzeniu zamówienia powinieneś dostać email

---

## Monitoring i logi

### CloudWatch Logs

1. Wejdź w **CloudWatch**
2. Kliknij **Log groups**
3. Znajdź grupy:
   - `/aws/lambda/getProducts`
   - `/aws/lambda/getOrders`
   - `/aws/lambda/createOrder`
4. Kliknij na grupę → **Log streams**
5. Przeglądaj logi wykonania funkcji

### Metryki API Gateway

1. W **API Gateway** → Twoje API
2. Kliknij **Dashboard**
3. Zobacz statystyki: wywołania, błędy, latencję

---

## Punktacja projektu

✅ **1 pkt** - Lambda Functions + API Gateway (compute)
✅ **1 pkt** - DynamoDB (storage)
✅ **0.5 pkt** - SNS (third service)
✅ **0.5 pkt** - IAM role + policies (security)
✅ **0.5 pkt** - CloudWatch logs (monitoring)
✅ **0.5 pkt** - Error handling w Lambda (error handling)
✅ **0.5 pkt** - React frontend (frontend)

**Razem: 4.5 / 5 punktów**

---

## Troubleshooting

### Problem: API Gateway - nie mogę wpisać Resource Path

**Przyczyna**: Nowa wersja AWS Console - Resource Path ustawia się automatycznie

**Rozwiązanie**:
- Jeśli nie widzisz pola Resource Path, to normalne - będzie ustawione automatycznie
- Wpisz tylko **Resource name** (np. `products`)
- Kliknij **Create resource**
- System automatycznie ustawi path na `/products`

### Problem: API Gateway - Security Policy

**Przyczyna**: Nowa wersja AWS Console wyświetla dodatkowe opcje

**Rozwiązanie**:
- Jeśli pojawi się Security Policy - zostaw go jako **Default** lub **empty**
- Kliknij **Create API**

### Problem: CORS errors
- Sprawdź czy CORS jest włączony w API Gateway
- Sprawdź czy Lambda zwraca odpowiednie headery CORS
- Zrób ponowny deploy API Gateway

### Problem: 403 Forbidden
- Sprawdź uprawnienia IAM roli Lambda
- Upewnij się że Lambda ma dostęp do DynamoDB i SNS

### Problem: Brak logów
- Sprawdź czy rola Lambda ma `AWSLambdaBasicExecutionRole`

### Problem: SNS nie wysyła emaili
- Sprawdź czy potwierdziłeś subskrypcję email
- Sprawdź folder SPAM
- Sprawdź ARN topicu w zmiennych środowiskowych Lambda

### Problem: Lambda integration error

**Błąd**: "Could not connect to the endpoint URL"

**Rozwiązanie**:
- Upewnij się że Lambda jest w tej samej **Regii** co API Gateway
- Sprawdź czy nazwa funkcji Lambda jest poprawna (dokładnie: `getProducts`, `getOrders`, `createOrder`)
- Zrób ponowny deploy API Gateway

---

## Czyszczenie zasobów (po zakończeniu projektu)

Aby uniknąć kosztów:
1. Usuń API Gateway
2. Usuń funkcje Lambda
3. Usuń tabelę DynamoDB
4. Usuń topic SNS
5. Usuń rolę IAM

---

## Dodatkowe informacje

- Wszystkie kody Lambda znajdują się w folderze `aws-lambda/`
- Polityki IAM znajdują się w folderze `aws-iam/`
- Frontend automatycznie integruje się z AWS po ustawieniu `.env`
