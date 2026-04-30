# Stock Market Prediction Dashboard - Project Summary

## Project Overview
A full-stack web application for stock market time-series forecasting using machine learning models (ARIMA, ARMA, SARIMA). The system allows users to upload datasets, select prediction models, configure parameters, visualize predictions, and save experiment history.

---

## System Architecture

### Architecture Type
**3-Tier Client-Server with Microservices**

```
Browser
  └─► React Frontend (Port 5173)
        └─► Java Spring Boot Backend (Port 8083)
              ├─► PostgreSQL Database (Port 5432)
              └─► Python FastAPI ML Service (Port 8000)
```

### Technology Stack

#### Frontend (Presentation Layer)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7 with lazy loading
- **State Management**: React Context API (auth, theme, sidebar)
- **Charts**: Recharts
- **HTTP Client**: Native Fetch API
- **Deployment**: Nginx in Docker

**Architecture Pattern**: Feature-Sliced Design (FSD)
```
frontend/src/
├── app/              # Pages organized by route
├── features/         # Self-contained feature modules (prediction, auth)
├── components/       # Shared reusable UI components
├── lib/api/          # API client layer (one file per domain)
├── contexts/         # Global state via React Context
├── hooks/            # Custom React hooks
└── utils/            # Helper utilities
```

#### Backend (Business Logic Layer)
- **Framework**: Spring Boot 3.2.2 (Java)
- **Security**: Spring Security + JWT authentication
- **Database**: Spring Data JPA + Hibernate
- **API Documentation**: Swagger/OpenAPI
- **Build Tool**: Maven
- **Server**: Embedded Tomcat

**Architecture Pattern**: Layered MVC
```
backend/src/main/java/com/stockproject/experiment_service/
├── controller/       # REST endpoints
├── service/          # Business logic
├── repository/       # Data access (Spring Data JPA)
├── model/            # JPA entities
├── dto/              # Data transfer objects
├── provider/         # Strategy pattern for data sources
├── factory/          # Factory pattern for provider selection
├── auth/             # JWT authentication module
└── exception/        # Global exception handling
```

#### ML Service (Intelligence Layer)
- **Framework**: FastAPI (Python)
- **ML Libraries**: 
  - statsmodels (ARIMA, ARMA, SARIMA)
  - pandas (data manipulation)
  - numpy (numerical operations)
- **Models**: Time-series forecasting with auto-optimization via AIC/BIC grid search

#### Database
- **DBMS**: PostgreSQL 15
- **ORM**: Hibernate (via Spring Data JPA)
- **Schema Management**: Hibernate DDL auto-update

#### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Services**: 4 containers (frontend, backend, ML service, database)
- **Networking**: Docker bridge network for inter-service communication
- **Volumes**: Persistent storage for PostgreSQL data and file uploads

---

## Core Features

### 1. Authentication & Authorization
- **JWT-based authentication** with Spring Security
- User registration and login
- Protected routes on frontend
- Role-based access control (USER role)
- Token stored in localStorage and sent via Authorization header

### 2. Data Source Management
Users can create datasets from multiple sources:
- **CSV File Upload**: Upload local CSV files with stock data
- **URL Dataset**: Link external CSV files via URL
- **Yahoo Finance API**: Real-time stock data fetching
- **Alpha Vantage API**: Alternative real-time data source

**Strategy Pattern Implementation**:
```java
DataSourceProvider (interface)
├── CsvProvider
├── UrlDatasetProvider
├── YahooProvider
└── AlphaVantageProvider
```

### 3. Stock Price Visualization
- Interactive line charts with Recharts
- Historical price data display
- Prediction overlay on the same chart
- Date range filtering
- Responsive design

### 4. ML Model Configuration
**Three Time-Series Models**:
1. **ARIMA** (AutoRegressive Integrated Moving Average)
   - Best for non-stationary data with trends
   - Parameters: p (AR order), d (differencing), q (MA order)

2. **ARMA** (AutoRegressive Moving Average)
   - Best for stationary data
   - Parameters: p (AR order), q (MA order)

3. **SARIMA** (Seasonal ARIMA)
   - Best for seasonal patterns
   - Parameters: p, d, q + seasonal components

**Configuration Modes**:
- **Auto Mode**: Automatic parameter optimization via AIC/BIC grid search
- **Custom Mode**: Manual parameter specification

**Prediction Workflow**:
1. User selects model type (ARIMA/ARMA/SARIMA)
2. Chooses Auto or Custom parameter mode
3. Runs prediction
4. Backend fetches data from selected dataset
5. Java backend forwards data to Python FastAPI
6. Python trains model and returns predictions
7. Frontend displays predictions overlaid on historical data

### 5. Metrics & Evaluation
After prediction, the system displays:
- **MAE** (Mean Absolute Error)
- **RMSE** (Root Mean Squared Error)
- **MAPE** (Mean Absolute Percentage Error)
- **R²** (Coefficient of Determination)
- Optimal parameters (if auto-optimized)

### 6. Experiment History
- Save prediction experiments (model, parameters, results)
- View saved experiments in a paginated table
- Re-run past experiments with same configuration
- Delete experiments
- Search and filter by stock name or model type

### 7. Historic Experiments Page
- Dedicated page (`/historic`) accessible from header
- Table with columns: Stock Name, Model Used, Parameters, Date
- Color-coded badges per model type
- Pagination (6 rows per page)
- Search filtering
- Export options (CSV, Excel, PDF - UI only)

---

## Design Patterns Used

### Backend
1. **Strategy Pattern**: Data source providers (CSV, URL, Yahoo, Alpha Vantage)
2. **Factory Pattern**: `ProviderFactory` for provider selection
3. **Repository Pattern**: Spring Data JPA repositories
4. **Filter Chain Pattern**: JWT authentication filter
5. **Proxy/Gateway Pattern**: Java backend proxies ML requests to Python
6. **DTO Pattern**: Separate DTOs for request/response
7. **Builder Pattern**: Lombok `@Builder` for entity construction

### Frontend
1. **Feature-Sliced Design**: Module organization by feature
2. **Protected Routes**: Auth-gated navigation
3. **Context API**: Global state management
4. **Lazy Loading**: Code splitting with React.lazy()
5. **Compound Components**: shadcn/ui component composition

---

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login (returns JWT)

### Datasets (`/api/datasets`)
- `POST /upload` - Upload CSV file
- `POST /link-source` - Register API data source (Yahoo/Alpha Vantage)
- `POST /link-url` - Link external CSV via URL
- `GET /{userId}` - Get user's datasets
- `GET /{datasetId}/symbols` - Get available stock symbols
- `GET /{datasetId}/prices` - Get stock prices for dataset

### Stock Data (`/api/stocks`)
- `POST /fetch` - Fetch stock data from dataset

### ML Predictions (`/api/ml`)
- `POST /train-from-dataset` - Train model and get predictions
  - Supports both file-based and API-based datasets
  - Auto-fetches live data for Yahoo/Alpha Vantage sources
  - Parameters: datasetId, model_type, symbol, p, d, q, steps

### Prediction History (`/api/predictions`)
- `POST /` - Save prediction experiment
- `GET /user/{userId}` - Get user's saved predictions
- `DELETE /{id}` - Delete prediction

---

## Database Schema

### Tables
1. **users**
   - id (PK)
   - email (unique)
   - password (hashed)
   - firstName
   - lastName
   - role (enum: USER, ADMIN)
   - createdAt

2. **datasets**
   - id (PK)
   - userId (FK)
   - displayName
   - sourceType (enum: FILE, URL, YAHOO, ALPHAVANTAGE)
   - filePath (for FILE type)
   - apiUrl (for URL type)
   - createdAt

3. **stock_prices**
   - id (PK)
   - datasetId (FK)
   - symbol
   - date
   - open
   - high
   - low
   - close
   - volume

4. **saved_predictions** (prediction history)
   - id (PK)
   - userId (FK)
   - company (stock symbol)
   - datasetId (FK)
   - modelType (ARIMA/ARMA/SARIMA)
   - parameters (JSON string)
   - resultJson (JSON string of predictions)
   - createdAt

---

## Security Implementation

### Backend Security
- **Spring Security** with JWT filter chain
- Password hashing with BCrypt
- JWT token generation with HMAC-SHA256
- Token expiration: 24 hours
- CORS configuration for frontend origin
- Protected endpoints require valid JWT in Authorization header

### Frontend Security
- JWT stored in localStorage
- Automatic token attachment to API requests
- Protected routes redirect to login if unauthenticated
- Auth context provides `isAuthenticated`, `user`, `login`, `logout`

---

## Docker Deployment

### Services Configuration
```yaml
services:
  db:           # PostgreSQL 15
  java-api:     # Spring Boot (8082 → 8083)
  python-api:   # FastAPI (8000)
  frontend:     # React + Nginx (80 → 5173)
```

### Volumes
- `postgres_data`: Database persistence
- `uploads_data`: Shared file storage for CSV uploads

### Networks
- `app-network`: Bridge network for inter-service communication

### Service Communication
- Frontend → Java Backend: `http://localhost:8083`
- Java Backend → Python ML: `http://python-api:8000` (Docker service name)
- Java Backend → PostgreSQL: `jdbc:postgresql://db:5432/stock_market`

---

## Key Workflows

### 1. User Registration & Login
1. User submits registration form
2. Backend hashes password with BCrypt
3. User record saved to database
4. JWT token generated and returned
5. Frontend stores token in localStorage
6. Token sent with all subsequent API requests

### 2. Dataset Creation
**CSV Upload**:
1. User uploads CSV file
2. Backend saves file to `/app/uploads`
3. CSV parsed and stock prices extracted
4. Dataset record + stock_prices records saved to DB

**API Source**:
1. User selects Yahoo Finance or Alpha Vantage
2. Backend creates dataset record with sourceType
3. No data stored initially (fetched on-demand)

### 3. Prediction Execution
1. User navigates to prediction page with dataset + symbol
2. Selects model type (ARIMA/ARMA/SARIMA)
3. Chooses Auto or Custom parameters
4. Clicks "Run Prediction"
5. Frontend sends request to `/api/ml/train-from-dataset`
6. Java backend:
   - Fetches stock prices (from DB or live API)
   - Formats data for Python
   - Forwards to FastAPI
7. Python FastAPI:
   - Trains selected model
   - Auto-optimizes parameters if requested
   - Generates predictions
   - Computes metrics
8. Results returned to frontend
9. Chart updated with prediction overlay
10. Metrics displayed
11. User can save experiment to history

### 4. Save Prediction (with Auth Guard)
1. User clicks "Save" button
2. If not authenticated:
   - Pending save flag stored in sessionStorage
   - Redirect to login with return path
   - After login, auto-save triggered
3. If authenticated:
   - Prediction saved to database
   - Success toast displayed

---

## Frontend State Management

### React Context Providers
1. **AuthContext**: User authentication state
   - `user`, `isAuthenticated`, `login()`, `logout()`, `getToken()`

2. **ThemeContext**: Dark/light mode
   - `theme`, `setTheme()`

3. **SidebarContext**: Sidebar collapse state
   - `isOpen`, `toggle()`

### Local Component State
- Prediction results (predictions, metrics, params)
- Form inputs (model selection, parameters)
- UI state (loading, errors, modals)

---

## Error Handling

### Backend
- Global exception handler (`@ControllerAdvice`)
- Custom exceptions: `FileStorageException`
- HTTP status codes: 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Internal Server Error)
- Detailed error messages in response body

### Frontend
- Try-catch blocks in async functions
- Error state in components
- Toast notifications for user feedback
- Fallback UI for failed requests

---

## Performance Optimizations

### Frontend
- Lazy loading of routes with React.lazy()
- Code splitting by route
- Memoization with useMemo/useCallback where needed
- Debounced search inputs
- Pagination for large datasets

### Backend
- Connection pooling with HikariCP
- JPA query optimization
- Indexed database columns (email, datasetId)
- Lazy loading of JPA relationships

---

## Testing Considerations

### Backend Testing (Recommended)
- Unit tests: Service layer with JUnit + Mockito
- Integration tests: Controller layer with MockMvc
- Repository tests: Spring Data JPA test slices

### Frontend Testing (Recommended)
- Unit tests: Component logic with Vitest
- Integration tests: User flows with React Testing Library
- E2E tests: Full workflows with Playwright/Cypress

---

## Future Enhancements

### Planned Features
1. **Admin Dashboard**: User management, system stats
2. **Real-time Predictions**: WebSocket updates
3. **Model Comparison**: Side-by-side model performance
4. **Advanced Metrics**: Sharpe ratio, volatility analysis
5. **Export Reports**: PDF/Excel export of predictions
6. **Notification System**: Email alerts for prediction completion
7. **Multi-user Collaboration**: Share experiments with team
8. **Model Versioning**: Track model iterations
9. **A/B Testing**: Compare model variants
10. **API Rate Limiting**: Prevent abuse of external APIs

### Technical Improvements
1. **Database Migrations**: Switch from Hibernate DDL to Flyway/Liquibase
2. **Caching**: Redis for frequently accessed data
3. **Message Queue**: RabbitMQ/Kafka for async ML jobs
4. **Monitoring**: Prometheus + Grafana
5. **Logging**: ELK stack (Elasticsearch, Logstash, Kibana)
6. **CI/CD**: GitHub Actions for automated testing and deployment
7. **Load Balancing**: Nginx reverse proxy for multiple backend instances
8. **API Gateway**: Spring Cloud Gateway for unified entry point

---

## Development Setup

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local frontend development)
- Java 17+ (for local backend development)
- Python 3.9+ (for local ML service development)

### Quick Start
```bash
# Clone repository
git clone <repo-url>
cd stock_market_dashboard

# Start all services
docker compose up --build

# Access application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8083
# ML API: http://localhost:8000
# Database: localhost:5432
```

### Local Development
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
mvn spring-boot:run

# ML Service
cd fast-api
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## Project Statistics

### Codebase Size
- **Frontend**: ~50 components, ~15 pages, ~10 API clients
- **Backend**: ~20 controllers/services, ~10 entities, ~5 providers
- **ML Service**: 3 models, 2 services, 2 schemas

### Dependencies
- **Frontend**: 60+ npm packages
- **Backend**: 20+ Maven dependencies
- **ML Service**: 5+ Python packages

### Docker Images
- Frontend: ~200MB (Nginx + static build)
- Backend: ~400MB (OpenJDK + Spring Boot)
- ML Service: ~800MB (Python + ML libraries)
- Database: ~200MB (PostgreSQL Alpine)

---

## Conclusion

This project demonstrates a production-ready full-stack application with:
- Modern frontend architecture (React + TypeScript)
- Robust backend design (Spring Boot + layered architecture)
- Machine learning integration (FastAPI + statsmodels)
- Containerized deployment (Docker Compose)
- Security best practices (JWT authentication)
- Scalable design patterns (Strategy, Factory, Repository)

The system successfully combines web development, data engineering, and machine learning to deliver a comprehensive stock market prediction platform.
