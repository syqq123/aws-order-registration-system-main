# Szybki Start - AWS Mini E-Commerce

## Co zostało stworzone?

Kompletny system e-commerce z integracją AWS, który zdobywa **4.5/5 punktów**.

### Architektura

```
Frontend (React)
    ↓
API Gateway
    ↓
Lambda Functions (3 funkcje)
    ↓
DynamoDB (zamówienia) + SNS (powiadomienia)
    ↓
CloudWatch (logi)
```

---

## Pliki projektu

### Frontend (React + TypeScript)
- `src/App.tsx` - główna aplikacja
- `src/components/` - komponenty UI
- `src/services/api.ts` - klient API AWS

### Backend (AWS Lambda)
- `aws-lambda/getProducts.js` - lista produktów
- `aws-lambda/getOrders.js` - pobieranie zamówień
- `aws-lambda/createOrder.js` - tworzenie zamówienia + SNS

### Security (IAM)
- `aws-iam/lambda-role-policy.json` - uprawnienia Lambda
- `aws-iam/lambda-trust-policy.json` - trust relationship

### Dokumentacja
- `AWS-SETUP.md` - **GŁÓWNA INSTRUKCJA** (krok po kroku)
- `PUNKTACJA.md` - szczegółowa punktacja projektu
- `README.md` - dokumentacja techniczna

---

## Implementacja (3 kroki)

### Krok 1: Skonfiguruj AWS

Otwórz **`AWS-SETUP.md`** i wykonaj wszystkie kroki:

1. Stwórz tabelę DynamoDB
2. Stwórz topic SNS
3. Stwórz rolę IAM
4. Wdróż 3 funkcje Lambda
5. Skonfiguruj API Gateway

**Czas: ~30 minut**

### Krok 2: Skonfiguruj frontend

```bash
# 1. Utwórz plik .env
echo "VITE_AWS_API_GATEWAY_URL=https://YOUR_API_ID.execute-api.REGION.amazonaws.com/prod" > .env

# 2. Zamień YOUR_API_ID i REGION na swoje wartości z AWS Console

# 3. Zainstaluj zależności
npm install
```

### Krok 3: Uruchom aplikację

```bash
npm run dev
```

Otwórz: http://localhost:5173

---

## Testowanie

### Test 1: Produkty ✅
- Otwórz aplikację
- Powinieneś zobaczyć 5 produktów

### Test 2: Koszyk ✅
- Dodaj produkty do koszyka
- Zmień ilość
- Usuń produkty

### Test 3: Zamówienie ✅
- Kliknij "Proceed to Checkout"
- Wypełnij formularz
- Kliknij "Place Order"
- Zobacz potwierdzenie

### Test 4: Historia zamówień ✅
- Kliknij zakładkę "Orders"
- Zobacz listę zamówień

### Test 5: Email (opcjonalnie) ✅
- Jeśli skonfigurowałeś SNS
- Sprawdź email po złożeniu zamówienia

---

## Punktacja

| Wymaganie | Punkty | Status |
|-----------|--------|--------|
| Lambda + API Gateway | 1.0 | ✅ |
| DynamoDB | 1.0 | ✅ |
| SNS | 0.5 | ✅ |
| IAM | 0.5 | ✅ |
| CloudWatch | 0.5 | ✅ |
| Error Handling | 0.5 | ✅ |
| Frontend | 0.5 | ✅ |
| **RAZEM** | **4.5/5** | ✅ |

---

## Monitoring

### CloudWatch Logs
```
AWS Console → CloudWatch → Log groups
```

Znajdziesz logi dla:
- `/aws/lambda/getProducts`
- `/aws/lambda/getOrders`
- `/aws/lambda/createOrder`

### DynamoDB
```
AWS Console → DynamoDB → Tables → OrdersTable
```

Możesz przeglądać wszystkie zamówienia.

---

## Najczęstsze problemy

### Aplikacja nie ładuje produktów

**Przyczyna**: Źle skonfigurowany URL API Gateway

**Rozwiązanie**:
1. Sprawdź plik `.env`
2. Upewnij się, że URL kończy się na `/prod`
3. Sprawdź czy API Gateway jest wdrożone

### Nie można utworzyć zamówienia

**Przyczyna**: Brak uprawnień IAM

**Rozwiązanie**:
1. Sprawdź czy Lambda ma rolę `LambdaEcommerceRole`
2. Sprawdź polityki IAM
3. Zobacz logi w CloudWatch

### Brak emaili SNS

**Przyczyna**: Nieaktywna subskrypcja

**Rozwiązanie**:
1. Sprawdź czy potwierdziłeś email w SNS
2. Sprawdź folder SPAM
3. Sprawdź zmienne środowiskowe w Lambda

---

## Użyte technologie

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Vite
- Lucide React (ikony)

### Backend (AWS)
- Lambda (Node.js 18+)
- API Gateway (REST)
- DynamoDB
- SNS
- CloudWatch
- IAM

---

## Struktura endpointów

```
https://YOUR_API_ID.execute-api.REGION.amazonaws.com/prod
│
├── GET  /products    → Lista produktów
├── GET  /orders      → Lista zamówień
└── POST /orders      → Nowe zamówienie
```

---

## Koszty

Wszystko w ramach AWS Free Tier:
- Lambda: 1M wywołań/miesiąc
- API Gateway: 1M żądań/miesiąc
- DynamoDB: 25 GB storage
- SNS: 1000 emaili/miesiąc

**Koszt: 0 zł** (przez 12 miesięcy)

---

## Czyszczenie (po projekcie)

Aby uniknąć kosztów:

```bash
# 1. Usuń API Gateway
AWS Console → API Gateway → EcommerceAPI → Delete

# 2. Usuń funkcje Lambda (wszystkie 3)
AWS Console → Lambda → (wybierz) → Delete

# 3. Usuń tabelę DynamoDB
AWS Console → DynamoDB → OrdersTable → Delete

# 4. Usuń topic SNS
AWS Console → SNS → OrderNotifications → Delete

# 5. Usuń rolę IAM
AWS Console → IAM → Roles → LambdaEcommerceRole → Delete
```

---

## Pomoc

### Główna instrukcja
Czytaj **`AWS-SETUP.md`** - wszystko jest tam opisane krok po kroku.

### Dokumentacja techniczna
Czytaj **`README.md`** - dokumentacja API i architektury.

### Punktacja
Czytaj **`PUNKTACJA.md`** - szczegółowe uzasadnienie punktów.

---

## Sukces!

Po skonfigurowaniu AWS i uruchomieniu `npm run dev` powinieneś mieć w pełni działający system e-commerce z integracją AWS.

Powodzenia! 🚀
