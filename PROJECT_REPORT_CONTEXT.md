# Stock Market Prediction Dashboard — Project Context for Report

## 1. Project Overview

**StockAI** is a full-stack web application for stock market time-series forecasting using statistical machine learning models. Users can load stock data from multiple sources, configure and run prediction models (ARIMA, ARMA, SARIMA), visualize results on interactive charts, and save their experiment history. The system is designed as a multi-container application deployed with Docker Compose.

---

## 2. System Architecture

**Pattern:** 3-Tier Client-Server with Microservices

```
Browser
  └─► React Frontend          (Port 5173 — Nginx)
        └─► Spring Boot Backend  (Port 8083 — Java 17)
              ├─► PostgreSQL DB     (Port 5432)
              └─► FastAPI ML Service (Port 8000 — Python)
```

All four services run as Docker containers on a shared bridge network (`app-network`). The frontend communicates with the backend via HTTP REST + JWT. The backend proxies ML requests to the Python service internally using the Docker service name (`http://python-api:8000`). The backend also calls external APIs (Yahoo Finance, Alpha Vantage) directly.

---

## 3. Technology Stack

### Frontend
| Concern | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 7 |
| UI components | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 (lazy loading) |
| State management | React Context API |
| Charts | Recharts |
| HTTP client | Native Fetch API (JWT wrapper) |
| Deployment | Nginx (Docker) |

### Backend
| Concern | Technology |
|---|---|
| Framework | Spring Boot 3.2.2 (Java 17) |
| Security | Spring Security + JWT (JJWT 0.11.5) |
| ORM | Spring Data JPA + Hibernate |
| Database driver | PostgreSQL JDBC |
| API docs | Swagger / SpringDoc OpenAPI 2.3 |
| Reactive HTTP | Spring WebFlux (WebClient) |
| Email | Spring Mail (Gmail SMTP) |
| Build tool | Maven |

### ML Service
| Concern | Technology |
|---|---|
| Framework | FastAPI (Python 3.11) |
| Time-series models | statsmodels (ARIMA, ARMA, SARIMA) |
| Data manipulation | pandas, numpy |
| Model caching | joblib |
| Server | Uvicorn |

### Infrastructure
| Concern | Technology |
|---|---|
| Containerization | Docker + Docker Compose |
| Database | PostgreSQL 15 Alpine |
| Shared storage | Docker named volume (`uploads_data`) |
| Networking | Docker bridge network |

---

## 4. Core Features

### 4.1 Authentication & Authorization
- JWT-based authentication with Spring Security
- User registration and login with BCrypt password hashing
- JWT token expiration: 24 hours
- Role-based access control: `USER` and `ADMIN` roles
- Password reset via email token (1-hour expiry)
- Welcome email sent on registration via Gmail SMTP
- Frontend stores JWT in `localStorage` and attaches it to every request via an `apiFetch` wrapper
- Protected routes redirect unauthenticated users to login

### 4.2 Data Source Management
Users can create datasets from four source types:

| Source Type | Description |
|---|---|
| `FILE` | Upload a local CSV file |
| `URL` | Link an external CSV via URL |
| `YAHOO` | Fetch live data from Yahoo Finance API |
| `ALPHAVANTAGE` | Fetch live data from Alpha Vantage API |

The backend uses the **Strategy Pattern** to handle each source type:
```
DataSourceProvider (interface)
├── CsvProvider
├── UrlDatasetProvider
├── YahooProvider
└── AlphaVantageProvider
```
A `ProviderFactory` (Factory Pattern) selects the correct provider at runtime based on the dataset's `SourceType` enum.

For FILE and URL datasets, stock prices are parsed and stored in the database. For YAHOO and ALPHAVANTAGE datasets, data is fetched live on demand when a prediction is requested.

### 4.3 Stock Price Visualization
- Interactive line charts (Recharts) showing historical OHLCV data
- Prediction overlay on the same chart (backtest + future forecast)
- 95% confidence interval bands for future predictions
- Responsive design

### 4.4 ML Prediction Pipeline
Three time-series models are supported:

| Model | Description | Parameters |
|---|---|---|
| **ARIMA** | AutoRegressive Integrated Moving Average — for non-stationary data with trends | p, d, q |
| **ARMA** | AutoRegressive Moving Average — for stationary data | p, q |
| **SARIMA** | Seasonal ARIMA — for data with seasonal patterns | p, d, q + seasonal |

**Two configuration modes:**
- **Auto Mode:** Parameters p, d, q are automatically optimized. `d` is found via the Augmented Dickey-Fuller stationarity test. `p` and `q` are selected via AIC/BIC grid search.
- **Custom Mode:** User manually specifies p, d, q, and the number of forecast steps.

**Prediction workflow (end-to-end):**
1. User selects model type and parameters on the frontend
2. Frontend calls `POST /api/ml/train-from-dataset` on the Java backend
3. Java backend fetches stock prices (from DB or live API depending on source type)
4. Java backend formats data and forwards it to `POST /train` on the FastAPI service
5. FastAPI pipeline:
   - Preprocesses data (percentage change transform)
   - Finds optimal `d` via Dickey-Fuller test (if auto mode)
   - Selects `p`, `q` via AIC/BIC grid search (if auto mode)
   - Splits data 80/20 for backtesting
   - Trains model on 80%, generates backtest predictions on 20%
   - Trains on full dataset, generates future forecast with 95% confidence intervals
   - Checks residuals for model diagnostics
   - Computes evaluation metrics
   - Caches trained model (joblib) to avoid retraining on identical configs
6. Results returned to frontend: predictions, metrics, optimal params, residuals
7. Frontend renders chart overlay and metrics cards

### 4.5 Evaluation Metrics
After each prediction, the system displays:
- **MAE** — Mean Absolute Error
- **RMSE** — Root Mean Squared Error
- **MAPE** — Mean Absolute Percentage Error
- **AIC** — Akaike Information Criterion
- **BIC** — Bayesian Information Criterion

### 4.6 Experiment History
- Authenticated users can save prediction experiments to the database
- Saved data includes: stock symbol, model type, parameters (JSON), full result JSON, timestamp
- History page (`/historic`) shows a paginated table (6 rows/page) with search and filtering
- Users can delete saved experiments
- If a user clicks "Save" while unauthenticated, the app stores a pending-save flag in `sessionStorage`, redirects to login, and auto-saves after successful login

### 4.7 Admin Panel
- View all registered users
- View all saved predictions across all users
- System statistics

### 4.8 Watchlist
- Authenticated users can add/remove stock symbols to a personal watchlist

---

## 5. Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Auto-generated |
| email | VARCHAR | Unique |
| password | VARCHAR | BCrypt hashed |
| firstName | VARCHAR | |
| lastName | VARCHAR | |
| role | ENUM | USER, ADMIN |
| createdAt | TIMESTAMP | |
| resetToken | VARCHAR | Nullable |
| resetTokenExpiry | TIMESTAMP | Nullable |

### `datasets`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | |
| userId | BIGINT | FK → users |
| fileName | VARCHAR | Display name |
| filePath | VARCHAR | Nullable (FILE type) |
| apiUrl | VARCHAR | Nullable (URL type) |
| sourceType | ENUM | FILE, URL, YAHOO, ALPHAVANTAGE |
| temporary | BOOLEAN | Default true |
| createdAt | TIMESTAMP | |

### `stock_prices`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | |
| datasetId | BIGINT | FK → datasets |
| symbol | VARCHAR | e.g. AAPL |
| date | DATE | |
| open | DOUBLE | |
| high | DOUBLE | |
| low | DOUBLE | |
| close | DOUBLE | |
| volume | DOUBLE | |

### `predictions`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | |
| userId | BIGINT | FK → users |
| company | VARCHAR | Stock symbol |
| datasetId | BIGINT | FK → datasets |
| modelType | VARCHAR | ARIMA / ARMA / SARIMA |
| parameters | TEXT | JSON string: `{"p":1,"d":1,"q":1,"steps":10}` |
| resultJson | TEXT | Full prediction result JSON |
| createdAt | TIMESTAMP | |

---

## 6. API Endpoints

### Authentication — `/api/auth`
| Method | Path | Description |
|---|---|---|
| POST | `/register` | Register new user, returns JWT |
| POST | `/login` | Login, returns JWT |
| POST | `/forgot-password` | Send password reset email |
| POST | `/reset-password` | Reset password with token |
| POST | `/change-password/{userId}` | Change password (authenticated) |
| PUT | `/update-profile/{userId}` | Update user profile |

### Datasets — `/api/datasets`
| Method | Path | Description |
|---|---|---|
| POST | `/upload` | Upload CSV file |
| POST | `/link-source` | Register Yahoo/Alpha Vantage source |
| POST | `/link-url` | Link external CSV via URL |
| GET | `/{userId}` | Get all datasets for a user |
| GET | `/{datasetId}/symbols` | Get available stock symbols |
| GET | `/{datasetId}/prices` | Get all stock prices for a dataset |
| GET | `/sources` | Get list of available API sources |

### ML — `/api/ml`
| Method | Path | Description |
|---|---|---|
| POST | `/train-from-dataset` | Main prediction endpoint — fetches data, trains model, returns predictions |
| POST | `/train` | Direct train (raw data payload) |
| POST | `/metrics` | Compute evaluation metrics |

### Predictions (History) — `/api/predictions`
| Method | Path | Description |
|---|---|---|
| POST | `/` | Save a prediction experiment |
| GET | `/user/{userId}` | Get all saved predictions for a user |
| DELETE | `/{id}` | Delete a saved prediction |

### Stocks — `/api/stocks`
| Method | Path | Description |
|---|---|---|
| POST | `/fetch` | Fetch stock prices from a dataset by symbol |

---

## 7. Design Patterns

### Backend
| Pattern | Where Used |
|---|---|
| Strategy | `DataSourceProvider` interface + 4 implementations (CSV, URL, Yahoo, AlphaVantage) |
| Factory | `ProviderFactory` / `DataSourceFactory` selects the right provider at runtime |
| Repository | Spring Data JPA repositories for all entities |
| Filter Chain | `JwtAuthFilter` intercepts requests and validates JWT |
| Proxy / Gateway | `MlClientService` proxies all ML requests to the Python service |
| DTO | Separate request/response DTOs for all controllers |
| Builder | Lombok `@Builder` on `User` and `Prediction` entities |

### Frontend
| Pattern | Where Used |
|---|---|
| Feature-Sliced Design | Source organized by feature (`features/`, `components/`, `lib/api/`) |
| Protected Routes | Auth-gated navigation with redirect to login |
| Context API | Global state for auth, theme, sidebar |
| Lazy Loading | `React.lazy()` + `Suspense` for route-level code splitting |

---

## 8. Security

- Passwords hashed with **BCrypt**
- JWT signed with **HMAC-SHA256**, 24-hour expiry
- Spring Security filter chain validates JWT on every protected request
- CORS configured to allow only `http://localhost:5173`
- Email credentials stored as environment variable (`GMAIL_APP_PASSWORD`), never hardcoded
- Non-root Docker user for the backend container
- `.env` file excluded from version control via `.gitignore`

---

## 9. Deployment

### Docker Compose Services
```yaml
db:         PostgreSQL 15 Alpine       → port 5432
java-api:   Spring Boot (Java 17)      → port 8083 (internal 8082)
python-api: FastAPI (Python 3.11)      → port 8000
frontend:   React + Nginx Alpine       → port 5173 (internal 80)
```

### Volumes
- `postgres_data` — PostgreSQL data persistence
- `uploads_data` — Shared CSV file storage (mounted in both `java-api` and `python-api`)

### Build Strategy
- **Backend:** Multi-stage Maven build (build stage: `maven:3.9.6-eclipse-temurin-17`, runtime: `eclipse-temurin:17-jre-jammy`)
- **Frontend:** Multi-stage Node build (build stage: `node:20-alpine`, runtime: `nginx:alpine`)
- **ML Service:** Single-stage `python:3.11-slim`

### Quick Start
```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with your Gmail app password

# Start all services
docker compose up --build

# Access
# Frontend:  http://localhost:5173
# Backend:   http://localhost:8083
# ML API:    http://localhost:8000
# Swagger:   http://localhost:8083/swagger-ui.html
```

---

## 10. Frontend Structure

```
frontend/src/
├── app/              # Route-level pages
├── features/         # Self-contained feature modules
│   ├── prediction/   # Model selection, chart, metrics, CSV upload
│   ├── auth/         # Login, register, password reset forms
│   └── historic/     # Experiment history table
├── components/       # Shared reusable UI components
├── lib/api/          # API client layer (one file per domain)
│   ├── api.ts        # apiFetch wrapper (JWT injection)
│   ├── auth.api.ts
│   ├── prediction.api.ts
│   ├── dataset.api.ts
│   ├── stock.api.ts
│   └── prediction_history.api.ts
├── contexts/         # AuthContext, ThemeContext, SidebarContext
├── hooks/            # Custom React hooks
└── utils/            # Helper utilities
```

**Key pages:**
- `/` or `/landing` — Public landing page
- `/auth/sign-in`, `/auth/sign-up` — Authentication
- `/auth/forgot-password`, `/auth/reset-password` — Password recovery
- `/dashboard-2` — Main dashboard with stock chart and prediction panel
- `/historic` — Saved experiment history
- `/watchlist` — Personal stock watchlist
- `/admin` — Admin statistics and user management
- `/settings/*` — Account, appearance, notifications

---

## 11. ML Service Internal Pipeline

```
POST /train (FastAPI)
  │
  ├─ 1. Preprocess data (pct_change transform)
  ├─ 2. Find optimal d (Augmented Dickey-Fuller test)
  ├─ 3. Auto-select p, q (AIC/BIC grid search) — if auto mode
  ├─ 4. Split 80/20 for backtesting
  ├─ 5. Train on 80% → backtest predictions on 20%
  ├─ 6. Check model cache (joblib) → train on full data if not cached
  ├─ 7. Generate future forecast (n steps) with 95% confidence intervals
  ├─ 8. Check residuals (Ljung-Box test, normality)
  ├─ 9. Compute metrics (MSE, RMSE, MAE, MAPE, AIC, BIC)
  └─ 10. Return PredictionResponse
         ├─ predictions: [{date, value, type, lower, upper}]
         ├─ metrics: {aic, bic, mse, rmse, mae, mape}
         ├─ optimal_params: {p, d, q}
         └─ residuals: {ljung_box, normality, ...}
```

---

## 12. Sequence Diagrams (Summary)

### Authentication Flow
1. User fills registration form → backend checks email uniqueness → hashes password → saves user → generates JWT → sends welcome email → returns token
2. Login: backend validates credentials → generates JWT → frontend stores in localStorage
3. Protected action: if no token → redirect to login → after login → redirect back → complete action
4. Logout: frontend clears localStorage → redirects to login

### Prediction Flow
1. User selects model + parameters → clicks "Run Prediction"
2. System fetches stock data (DB or live API)
3. System trains model, generates forecast, computes metrics
4. Chart updated with historical + prediction overlay + confidence bands
5. Metrics displayed (RMSE, MAE, MAPE, AIC, BIC, optimal params)
6. User can save experiment (auth guard applies)

---

## 13. Use Cases by Actor

### Guest User (unauthenticated)
- Register / Login
- Upload CSV, link URL, link Yahoo Finance, link Alpha Vantage
- Select stock symbol
- View chart
- Run prediction

### Authenticated User (extends Guest)
- Logout
- Save experiment
- View experiment history
- Search / delete experiments

### Admin (extends Authenticated User)
- View all users
- View all predictions
- View system statistics

---

## 14. Project Statistics

| Layer | Count |
|---|---|
| Frontend components | ~50 |
| Frontend pages | ~15 |
| API client files | ~10 |
| Backend controllers | ~7 |
| Backend services | ~8 |
| JPA entities | ~5 |
| Data providers | 4 |
| ML models supported | 3 |
| npm dependencies | 60+ |
| Maven dependencies | 20+ |
| Python packages | 8 |
| Docker containers | 4 |

---

## 15. Email Configuration

- **Provider:** Gmail SMTP (`smtp.gmail.com:587`, TLS)
- **From address:** `stocky.entreprise@gmail.com`
- **Credential:** Gmail App Password stored in `.env` as `GMAIL_APP_PASSWORD`
- **Triggers:**
  - Welcome email on successful registration
  - Password reset email with a 1-hour expiry token link
