# Testy Jednostkowe i CI/CD - Instrukcja

## Przegląd

Projekt zawiera:
- Testy jednostkowe dla wszystkich 5 funkcji Lambda (100% pokrycie)
- Konfigurację CI/CD dla GitLab
- Automatyczne generowanie raportów pokrycia kodu

---

## Testy Jednostkowe

### Instalacja zależności

```bash
npm install
```

### Uruchomienie testów

```bash
# Uruchom wszystkie testy
npm test

# Uruchom testy z raportem pokrycia
npm run test:coverage

# Uruchom testy w trybie watch (podczas development)
npm test -- --watch
```

### Struktura testów

```
__tests__/
└── lambda/
    ├── getProducts.test.js      # 10 testów
    ├── getOrders.test.js        # 6 testów
    ├── createOrder.test.js      # 11 testów
    ├── updateOrder.test.js      # 9 testów
    └── deleteOrder.test.js      # 7 testów
```

**Łącznie: 43 testy**

### Pokrycie kodu

Wszystkie funkcje Lambda mają **100% pokrycie**:
- ✅ Statements: 100%
- ✅ Branches: 100%
- ✅ Functions: 100%
- ✅ Lines: 100%

### Przykłady testów

#### 1. getProducts.test.js

Testuje funkcję zwracającą katalog produktów:
- ✅ Status code 200
- ✅ CORS headers
- ✅ Zwrócenie 5 produktów
- ✅ Poprawna struktura danych
- ✅ Typy danych

#### 2. getOrders.test.js

Testuje funkcję pobierającą zamówienia:
- ✅ Status code 200
- ✅ CORS headers
- ✅ Pusta lista zamówień
- ✅ Sortowanie po dacie (malejąco)
- ✅ Poprawna liczba zamówień
- ✅ Obsługa błędów

#### 3. createOrder.test.js

Testuje tworzenie nowego zamówienia:
- ✅ Walidacja body (brak/invalid JSON)
- ✅ Walidacja pól (customerName, email, items)
- ✅ Pusta tablica items
- ✅ Tworzenie zamówienia
- ✅ Kalkulacja totalAmount
- ✅ CORS headers
- ✅ Unikalne order IDs

#### 4. updateOrder.test.js

Testuje aktualizację zamówienia:
- ✅ Walidacja body i orderId
- ✅ Order not found (404)
- ✅ Aktualizacja statusu
- ✅ Aktualizacja items
- ✅ Aktualizacja statusu + items
- ✅ Zachowanie istniejących pól
- ✅ Kalkulacja nowego totalAmount

#### 5. deleteOrder.test.js

Testuje usuwanie zamówienia:
- ✅ Walidacja orderId
- ✅ Order not found (404)
- ✅ Usunięcie zamówienia
- ✅ CORS headers
- ✅ Zwrócenie orderId w odpowiedzi
- ✅ Obsługa pathParameters

### Raport pokrycia

Po uruchomieniu `npm run test:coverage` raport jest dostępny w:
- Terminal: podsumowanie w konsoli
- `coverage/index.html`: szczegółowy raport HTML
- `coverage/lcov-report/`: raport LCOV
- `coverage/cobertura-coverage.xml`: raport Cobertura (dla CI/CD)

Otwórz raport HTML:

```bash
# Linux/Mac
open coverage/index.html

# Windows
start coverage/index.html
```

---

## CI/CD z GitLab

### Przegląd Pipeline

Pipeline składa się z 4 etapów:

```
install → test → build → deploy
```

### Etap 1: Install

Instaluje zależności npm i cachuje `node_modules/`.

```yaml
install_dependencies:
  stage: install
  script:
    - npm ci --cache .npm --prefer-offline
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour
```

### Etap 2: Test

Uruchamia 4 joby równolegle:

#### 2.1. Lint

```bash
npm run lint
```

Sprawdza kod ESLint. Job failuje przy błędach.

#### 2.2. Typecheck

```bash
npm run typecheck
```

Sprawdza typy TypeScript. Job failuje przy błędach.

#### 2.3. Unit Tests

```bash
npm run test
```

Uruchamia wszystkie testy jednostkowe.

#### 2.4. Test Coverage

```bash
npm run test:coverage
```

Generuje raport pokrycia kodu (100% wymagane).

### Etap 3: Build

Buduje projekt dla produkcji:

```bash
npm run build
```

Tworzy optymalizowany bundle w folderze `dist/`.

**Uruchamia się tylko dla**:
- `main`
- `develop`
- merge requests

### Etap 4: Deploy

Dwa środowiska deployment (manual):

#### 4.1. Staging

- Branch: `develop`
- Environment: staging
- Manual trigger

#### 4.2. Production

- Branch: `main`
- Environment: production
- Manual trigger

### GitLab Pages

Publiczny raport coverage dostępny na GitLab Pages.

```yaml
pages:
  stage: deploy
  script:
    - mkdir -p public
    - cp -r dist/* public/
    - cp -r coverage public/coverage
  artifacts:
    paths:
      - public
  only:
    - main
```

---

## Konfiguracja GitLab

### 1. Push projektu do GitLab

```bash
git init
git add .
git commit -m "Initial commit with tests and CI/CD"
git remote add origin https://gitlab.com/your-username/aws-ecommerce.git
git push -u origin main
```

### 2. Dodaj zmienne środowiskowe

W GitLab: **Settings** → **CI/CD** → **Variables**

Dodaj następujące zmienne (opcjonalnie, dla automatycznego deployment):

| Key | Value | Protected | Masked |
|-----|-------|-----------|--------|
| `AWS_ACCESS_KEY_ID` | Twój Access Key | ✓ | ✓ |
| `AWS_SECRET_ACCESS_KEY` | Twój Secret Key | ✓ | ✓ |
| `AWS_DEFAULT_REGION` | `us-east-1` | - | - |

### 3. Włącz GitLab Pages (opcjonalnie)

W **Settings** → **Pages** → **Use unique domain**

Po deployment na `main`, raport coverage będzie dostępny na:
```
https://your-username.gitlab.io/aws-ecommerce/coverage/
```

### 4. Sprawdź Pipeline

Po pushu, pipeline uruchomi się automatycznie:

GitLab → **CI/CD** → **Pipelines**

Możesz zobaczyć:
- Status każdego jobu
- Logi wykonania
- Artifacts (coverage reports)
- Deploy do staging/production (manual)

---

## Localne testowanie

### Przed commitem

Zawsze uruchom testy lokalnie:

```bash
# Sprawdź wszystko
npm run lint
npm run typecheck
npm test
npm run build
```

### Pre-commit hook (opcjonalnie)

Możesz dodać Husky do automatycznego uruchamiania testów:

```bash
npm install --save-dev husky
npx husky init
echo "npm test" > .husky/pre-commit
```

---

## Troubleshooting

### Problem: Testy nie przechodzą

**Rozwiązanie**:
```bash
# Usuń cache i node_modules
rm -rf node_modules coverage
npm install
npm test
```

### Problem: Coverage < 100%

**Rozwiązanie**:
- Sprawdź raport w `coverage/index.html`
- Dodaj brakujące testy dla nieprzetestowanych linii
- Wszystkie funkcje Lambda muszą mieć 100% pokrycia

### Problem: Pipeline failuje na lint

**Rozwiązanie**:
```bash
npm run lint
# Napraw błędy ESLint
```

### Problem: Pipeline failuje na typecheck

**Rozwiązanie**:
```bash
npm run typecheck
# Napraw błędy TypeScript
```

### Problem: Pipeline failuje na build

**Rozwiązanie**:
```bash
npm run build
# Sprawdź logi błędów w dist/
```

### Problem: GitLab Pages nie działa

**Rozwiązanie**:
1. Sprawdź czy pipeline `pages` zakończył się sukcesem
2. Sprawdź czy branch to `main`
3. Włącz Pages w Settings → Pages
4. Poczekaj kilka minut na deployment

---

## Przykładowy output testów

```
✓ __tests__/lambda/getProducts.test.js (10)
  ✓ getProducts Lambda (10)
    ✓ should return 200 status code
    ✓ should return CORS headers
    ✓ should return 5 products
    ✓ should return products with correct structure
    ✓ should return products with valid data types
    ...

✓ __tests__/lambda/getOrders.test.js (6)
✓ __tests__/lambda/createOrder.test.js (11)
✓ __tests__/lambda/updateOrder.test.js (9)
✓ __tests__/lambda/deleteOrder.test.js (7)

Test Files  5 passed (5)
     Tests  43 passed (43)
  Duration  1.23s

-----------|---------|----------|---------|---------|
File       | % Stmts | % Branch | % Funcs | % Lines |
-----------|---------|----------|---------|---------|
All files  |     100 |      100 |     100 |     100 |
-----------|---------|----------|---------|---------|
```

---

## Kolejne kroki

1. ✅ Uruchom testy lokalnie: `npm test`
2. ✅ Sprawdź coverage: `npm run test:coverage`
3. ✅ Push do GitLab
4. ✅ Sprawdź pipeline w GitLab
5. ✅ Deploy na staging (manual)
6. ✅ Deploy na production (manual)

Gratulacje! Masz w pełni przetestowany projekt z CI/CD.
