# Wallet Module

The Wallet module provides a full personal finance management API. Users can manage bank accounts, track income/expense transactions (with automatic balance updates), manage recurring subscriptions, set monthly budgets, and visualize monthly spending through a chart endpoint.

---

## Architecture

```
server/
├── api/wallet/
│   ├── bank-accounts/
│   │   ├── index.ts          # GET /api/wallet/bank-accounts, POST /api/wallet/bank-accounts
│   │   └── [id].ts           # GET, PUT, DELETE /api/wallet/bank-accounts/:id
│   ├── subscriptions/
│   │   ├── index.ts          # GET /api/wallet/subscriptions?bankAccountId=, POST
│   │   └── [id].ts           # GET, PUT, DELETE /api/wallet/subscriptions/:id
│   ├── transactions/
│   │   ├── index.ts          # GET /api/wallet/transactions?bankAccountId=, POST
│   │   └── [id].ts           # GET, PUT, DELETE /api/wallet/transactions/:id
│   └── budget/
│       ├── index.ts          # GET /api/wallet/budget, POST /api/wallet/budget
│       ├── month.ts          # GET /api/wallet/budget/month?month=&year=, DELETE
│       └── chart.ts          # GET /api/wallet/budget/chart?months=
├── controller/wallet.controller.ts
├── service/
│   ├── bankAccount.service.ts
│   ├── subscription.service.ts
│   ├── transaction.service.ts
│   └── budget.service.ts
├── repository/
│   ├── bankAccount.repository.ts
│   ├── subscription.repository.ts
│   ├── transaction.repository.ts
│   └── budget.repository.ts
├── dao/
│   ├── bankAccount.dao.ts
│   ├── subscription.dao.ts
│   ├── transaction.dao.ts
│   └── budget.dao.ts
├── dto/wallet.dto.ts
└── validations/wallet.zod.ts
```

**All wallet routes require authentication** via `Authorization: Bearer <accessToken>` header.

---

## Prisma Models

### BankAccount
| Field         | Type     | Notes                        |
|---------------|----------|------------------------------|
| id            | String   | cuid, primary key            |
| name          | String   |                              |
| bankName      | String?  |                              |
| accountNumber | String?  | unique                       |
| balance       | Float    | default 0, auto-updated      |
| currency      | String   | default "MAD", 3-letter code |
| userId        | String   | FK → User                    |

### Transaction
| Field         | Type              | Notes                      |
|---------------|-------------------|----------------------------|
| id            | String            | cuid                       |
| status        | TransactionStatus | INCOME \| EXPENSE          |
| amount        | Float             | positive                   |
| category      | String            |                            |
| description   | String?           |                            |
| date          | DateTime          | default now()              |
| bankAccountId | String            | FK → BankAccount (Cascade) |

### Subscription
| Field         | Type              | Notes                      |
|---------------|-------------------|----------------------------|
| id            | String            | cuid                       |
| name          | String            |                            |
| status        | TransactionStatus | INCOME \| EXPENSE          |
| amount        | Float             |                            |
| category      | String            |                            |
| paymentMethod | String            |                            |
| isPaid        | Boolean           | default false              |
| startDate     | DateTime          | default now()              |
| endDate       | DateTime?         |                            |
| bankAccountId | String            | FK → BankAccount (Cascade) |

### Budget
| Field   | Type    | Notes                        |
|---------|---------|------------------------------|
| id      | String  | cuid                         |
| amount  | Float   | positive                     |
| month   | Int     | 1–12                         |
| year    | Int     |                              |
| userId  | String  | FK → User (Cascade)          |
|         |         | unique(userId, month, year)  |

---

## API Reference

### Bank Accounts

| Method | Endpoint                          | Description                        |
|--------|-----------------------------------|------------------------------------|
| POST   | `/api/wallet/bank-accounts`       | Create a new bank account          |
| GET    | `/api/wallet/bank-accounts`       | List all accounts for current user |
| GET    | `/api/wallet/bank-accounts/:id`   | Get a single account               |
| PUT    | `/api/wallet/bank-accounts/:id`   | Update an account                  |
| DELETE | `/api/wallet/bank-accounts/:id`   | Delete an account (cascades)       |

**Create payload:**
```json
{
  "name": "CIH Main",
  "bankName": "CIH Bank",
  "accountNumber": "CIH-001",
  "balance": 5000,
  "currency": "MAD"
}
```

---

### Subscriptions

| Method | Endpoint                            | Description                                   |
|--------|-------------------------------------|-----------------------------------------------|
| POST   | `/api/wallet/subscriptions`         | Create a subscription                         |
| GET    | `/api/wallet/subscriptions`         | List subscriptions (`?bankAccountId=` required) |
| GET    | `/api/wallet/subscriptions/:id`     | Get a single subscription                     |
| PUT    | `/api/wallet/subscriptions/:id`     | Update a subscription                         |
| DELETE | `/api/wallet/subscriptions/:id`     | Delete a subscription                         |

**Create payload:**
```json
{
  "name": "Netflix",
  "status": "EXPENSE",
  "amount": 99,
  "category": "Entertainment",
  "paymentMethod": "Credit Card",
  "isPaid": false,
  "startDate": "2026-01-01T00:00:00.000Z",
  "endDate": "2027-01-01T00:00:00.000Z",
  "bankAccountId": "<id>"
}
```

---

### Transactions

| Method | Endpoint                            | Description                                   |
|--------|-------------------------------------|-----------------------------------------------|
| POST   | `/api/wallet/transactions`          | Create a transaction (updates balance atomically) |
| GET    | `/api/wallet/transactions`          | List transactions (`?bankAccountId=` required) |
| GET    | `/api/wallet/transactions/:id`      | Get a single transaction                      |
| PUT    | `/api/wallet/transactions/:id`      | Update transaction (auto-corrects balance)    |
| DELETE | `/api/wallet/transactions/:id`      | Delete transaction (rolls back balance)       |

**Create payload:**
```json
{
  "status": "INCOME",
  "amount": 15000,
  "category": "Salary",
  "description": "Monthly salary",
  "date": "2026-06-01T00:00:00.000Z",
  "bankAccountId": "<id>"
}
```

**Balance Logic:**
- `INCOME` → `balance += amount`
- `EXPENSE` → `balance -= amount`
- On update: `balance += (newDelta - oldDelta)`
- On delete: `balance -= delta` (full rollback)
- All balance mutations are wrapped in a Prisma `$transaction` for atomicity.

---

### Budget

| Method | Endpoint                                        | Description                         |
|--------|-------------------------------------------------|-------------------------------------|
| POST   | `/api/wallet/budget`                            | Set/upsert budget for a month       |
| GET    | `/api/wallet/budget`                            | List all budgets for current user   |
| GET    | `/api/wallet/budget/month?month=&year=`         | Get budget for a specific month     |
| DELETE | `/api/wallet/budget/month?month=&year=`         | Delete budget for a specific month  |
| GET    | `/api/wallet/budget/chart?months=6`             | Monthly spending chart (default: 6) |

**Set budget payload:**
```json
{ "amount": 5000, "month": 6, "year": 2026 }
```

**Chart response shape:**
```json
{
  "chart": [
    {
      "month": 6,
      "year": 2026,
      "transactions": 2300,
      "subscriptions": 200,
      "totalSpending": 2500,
      "budget": 5000,
      "alert": null
    }
  ]
}
```

**Alert thresholds:**
- `totalSpending >= budget` → `"⚠️ Budget limit reached ..."`
- `totalSpending >= budget * 0.9` → `"🔔 Warning: 90% of budget used ..."`
- Otherwise → `null`

**Chart spending sources:**
- `transactions`: sum of `EXPENSE` transactions in the month
- `subscriptions`: sum of `EXPENSE` subscriptions whose `startDate <= end of month` AND (`endDate IS NULL` OR `endDate >= start of month`)
- `INCOME` entries are never counted in spending

---

## Validation Rules

| Field          | Rule                                  |
|----------------|---------------------------------------|
| currency       | exactly 3 letters, uppercased         |
| amount         | positive number                       |
| status         | `"INCOME"` or `"EXPENSE"` only        |
| month          | integer 1–12                          |
| year           | integer 2000–2100                     |
| months (chart) | integer 1–24, default 6               |
| dates          | ISO 8601 datetime string              |

---

## Error Responses

| Code | Meaning                                              |
|------|------------------------------------------------------|
| 400  | Missing required query param (e.g. `bankAccountId`) |
| 401  | Missing or invalid authentication token              |
| 404  | Resource not found or belongs to another user        |
| 409  | Conflict — duplicate account number                  |
| 422  | Validation failed — see `errors` field in response   |

All error responses follow:
```json
{ "success": false, "message": "...", "errors": { "field": ["message"] } }
```

---

## Test Suite

Tests are located in `server/test/wallet/` and cover **79 test cases** across 4 files.

### Files

| File                     | Tests | Coverage                                              |
|--------------------------|-------|-------------------------------------------------------|
| `bank-accounts.test.ts`  | 17    | CRUD, auth, validation, cross-user isolation          |
| `subscriptions.test.ts`  | 19    | CRUD, auth, validation, cross-user isolation          |
| `transactions.test.ts`   | 23    | CRUD, balance updates, correction on update, rollback |
| `budget.test.ts`         | 20    | Upsert, chart, alert logic, spending sources          |

### Running the Tests

**Inside Docker (recommended):**
```bash
docker compose exec -T app npx vitest run server/test/wallet --reporter=verbose
```

**Full test suite:**
```bash
docker compose exec -T app npx vitest run
```

### Test Coverage Areas

**Bank Accounts:**
- ✅ Create with all optional fields
- ✅ Duplicate account number → 409
- ✅ Missing name → 422
- ✅ Invalid currency length → 422
- ✅ Unauthenticated → 401
- ✅ List returns only own accounts
- ✅ Get own account by id
- ✅ Get another user's account → 404
- ✅ Get non-existent id → 404
- ✅ Update name and currency
- ✅ Update to duplicate account number → 409
- ✅ Update another user's account → 404
- ✅ Delete own account
- ✅ Delete another user's account → 404

**Subscriptions:**
- ✅ Create EXPENSE and INCOME subscriptions
- ✅ Create with endDate
- ✅ Cross-user bankAccountId → 404
- ✅ Missing fields → 422, negative amount → 422, invalid status → 422
- ✅ Unauthenticated → 401
- ✅ List by bankAccountId, missing param → 400, cross-user → 404
- ✅ Get by id, non-existent → 404, cross-user → 404
- ✅ Update name/amount/isPaid
- ✅ Update cross-user → 404, invalid amount → 422
- ✅ Delete own, delete cross-user → 404

**Transactions (+ balance atomicity):**
- ✅ INCOME increases balance
- ✅ EXPENSE decreases balance
- ✅ Create with description and date
- ✅ Cross-user bankAccountId → 404
- ✅ Missing fields → 422, zero amount → 422
- ✅ Unauthenticated → 401
- ✅ List, missing param → 400, cross-user → 404
- ✅ Get by id, non-existent → 404, cross-user → 404
- ✅ Update amount → balance corrected
- ✅ Update status INCOME→EXPENSE → balance corrected
- ✅ Update description only → balance unchanged
- ✅ Update cross-user → 404
- ✅ Delete EXPENSE → balance rolled back
- ✅ Delete INCOME → balance rolled back
- ✅ Delete cross-user → 404

**Budget & Chart:**
- ✅ Create budget
- ✅ Upsert same month → amount updated
- ✅ Multiple months independently
- ✅ Invalid month (0, 13) → 422, negative amount → 422
- ✅ Unauthenticated → 401
- ✅ Get by month/year, not found → 404, missing param → 422
- ✅ List all, empty → []
- ✅ Delete budget, not found → 404
- ✅ Chart shape (6 entries, all fields present)
- ✅ No budget → alert null
- ✅ Spending = budget → ⚠️ alert
- ✅ Spending > budget → ⚠️ alert
- ✅ Spending 90–100% → 🔔 alert
- ✅ Spending < 90% → null alert
- ✅ Subscriptions counted in totalSpending
- ✅ INCOME transactions NOT counted in totalSpending
- ✅ months=99 → 422
- ✅ Default months=6 when param omitted
