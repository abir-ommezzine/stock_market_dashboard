# Software Environment

## 1. Development Environment

### 1.1 Operating System
- **Development OS**: Windows/Linux/macOS (Cross-platform compatible)
- **Deployment OS**: Linux (Docker containers)

### 1.2 Integrated Development Environment (IDE)
- **Backend (Java)**: IntelliJ IDEA / Eclipse / VS Code
- **Frontend (React)**: VS Code / WebStorm
- **Python (ML Service)**: PyCharm / VS Code
- **Version Control**: Git

## 2. Backend Technologies

### 2.1 Java Backend (Spring Boot)
- **Java Version**: 17 (LTS)
- **Spring Boot**: 3.2.2
- **Build Tool**: Apache Maven 3.x
- **Application Server**: Embedded Tomcat (Spring Boot)

#### Core Dependencies:
- **Spring Boot Starter Web**: RESTful API development
- **Spring Boot Starter Data JPA**: Database ORM and persistence
- **Spring Boot Starter Security**: Authentication and authorization
- **Spring Boot Starter Mail**: Email functionality
- **Spring Boot Starter OAuth2 Client**: OAuth2 authentication support
- **Spring Boot Starter WebFlux**: Reactive web client for external API calls

#### Security & Authentication:
- **JWT (JSON Web Tokens)**: 0.11.5
  - jjwt-api
  - jjwt-impl
  - jjwt-jackson

#### Documentation:
- **SpringDoc OpenAPI**: 2.3.0 (Swagger UI for API documentation)

#### Utilities:
- **Lombok**: Code generation and boilerplate reduction
- **Jackson Databind**: JSON serialization/deserialization

#### Testing:
- **Spring Boot Starter Test**: JUnit 5, Mockito, AssertJ
- **Maven Surefire Plugin**: Test execution

## 3. Frontend Technologies

### 3.1 React Application
- **React**: 19.2.3
- **React DOM**: 19.2.3
- **TypeScript**: 5.9.3
- **Build Tool**: Vite 7.3.0
- **Package Manager**: npm

#### UI Framework & Components:
- **Tailwind CSS**: 4.1.18 (Utility-first CSS framework)
- **Radix UI**: Accessible component primitives
  - Dialog, Dropdown Menu, Select, Tabs, Tooltip, etc.
- **Shadcn UI**: Pre-built component library
- **Lucide React**: 0.562.0 (Icon library)

#### Routing & State Management:
- **React Router DOM**: 7.11.0 (Client-side routing)
- **Zustand**: 5.0.9 (State management)

#### Form Handling:
- **React Hook Form**: 7.69.0
- **Zod**: 4.3.2 (Schema validation)
- **@hookform/resolvers**: 5.2.2

#### Data Visualization:
- **Recharts**: 3.6.0 (Chart library for stock data visualization)

#### UI Utilities:
- **class-variance-authority**: 0.7.1 (CSS variant management)
- **clsx**: 2.1.1 (Conditional class names)
- **tailwind-merge**: 3.4.0 (Tailwind class merging)
- **next-themes**: 0.4.6 (Dark/light theme support)
- **date-fns**: 4.1.0 (Date manipulation)
- **sonner**: 2.0.7 (Toast notifications)

#### Drag & Drop:
- **@dnd-kit**: 6.3.1 (Drag and drop functionality)

#### Testing:
- **Vitest**: 4.1.5 (Unit testing framework)
- **@testing-library/react**: 16.3.2 (React component testing)
- **@testing-library/jest-dom**: 6.9.1 (DOM matchers)
- **jsdom**: 29.1.1 (DOM implementation for testing)

#### Development Tools:
- **ESLint**: 9.39.2 (Code linting)
- **TypeScript ESLint**: 8.51.0
- **Vite Plugin React**: 5.1.2

## 4. Machine Learning Service (Python)

### 4.1 Python Backend (FastAPI)
- **Python Version**: 3.11+
- **Web Framework**: FastAPI (Latest)
- **ASGI Server**: Uvicorn (Latest)

#### Data Processing & Analysis:
- **Pandas**: Latest (Data manipulation and analysis)
- **NumPy**: Latest (Numerical computing)

#### Machine Learning & Statistics:
- **Statsmodels**: Latest (Statistical models - ARIMA, ARMA, SARIMA)
- **Scikit-learn**: Latest (Machine learning utilities and metrics)

#### Utilities:
- **python-multipart**: File upload handling
- **joblib**: Model serialization and caching

#### Testing:
- **pytest**: Latest (Python testing framework)

## 5. Database

### 5.1 PostgreSQL
- **Version**: 15 (Alpine Linux distribution)
- **Container**: postgres:15-alpine
- **Port**: 5432
- **Database Name**: stock_market
- **ORM**: Spring Data JPA (Hibernate)

#### Database Tables:
1. **users** - User authentication and profiles
2. **datasets** - Stock data sources
3. **stock_prices** - Historical stock price data
4. **predictions** - ML prediction results
5. **watchlist** - User stock watchlists
6. **conversations** - Support chat conversations
7. **messages** - Support chat messages

## 6. Containerization & Deployment

### 6.1 Docker
- **Docker Engine**: Latest
- **Docker Compose**: 3.x
- **Base Images**:
  - Java Backend: `eclipse-temurin:17-jdk-alpine`
  - Python API: `python:3.11-slim`
  - Frontend: `node:20-alpine` (build) + `nginx:alpine` (serve)
  - Database: `postgres:15-alpine`

### 6.2 Container Architecture
- **Network**: Bridge network (app-network)
- **Volumes**:
  - `postgres_data`: Database persistence
  - `uploads_data`: Shared file storage

### 6.3 Port Mapping
- Frontend: 5173 → 80 (Nginx)
- Java Backend: 8083 → 8082
- Python API: 8000 → 8000
- PostgreSQL: 5432 → 5432

## 7. External Services & APIs

### 7.1 Email Service
- **Provider**: Gmail SMTP
- **Protocol**: SMTP over TLS
- **Port**: 587
- **Authentication**: App-specific password

### 7.2 Stock Data APIs
- **Alpha Vantage API**: Real-time and historical stock data
- **Custom URL Sources**: CSV data import from external URLs

## 8. Development Tools

### 8.1 Version Control
- **Git**: Distributed version control
- **Repository Structure**: Monorepo (backend, frontend, fast-api)

### 8.2 API Documentation
- **Swagger UI**: Interactive API documentation (SpringDoc OpenAPI)
- **Endpoint**: http://localhost:8083/swagger-ui.html

### 8.3 Build Tools
- **Maven**: Java dependency management and build automation
- **npm**: Node.js package management
- **pip**: Python package management
- **Vite**: Frontend build tool and dev server

## 9. Security Features

### 9.1 Authentication & Authorization
- **JWT Tokens**: Stateless authentication
- **Spring Security**: Role-based access control (USER, ADMIN)
- **Password Encryption**: BCrypt hashing
- **Email Verification**: Token-based email confirmation
- **Password Reset**: Secure token-based password recovery

### 9.2 API Security
- **CORS**: Cross-Origin Resource Sharing configuration
- **CSRF Protection**: Cross-Site Request Forgery prevention
- **Input Validation**: Request validation and sanitization
- **SQL Injection Prevention**: Parameterized queries (JPA)

## 10. Testing Environment

### 10.1 Backend Testing
- **Framework**: JUnit 5
- **Mocking**: Mockito
- **Test Coverage**: Unit tests for services and controllers
- **Test Database**: H2 in-memory database (optional)

### 10.2 Frontend Testing
- **Framework**: Vitest
- **Component Testing**: React Testing Library
- **Test Types**: Unit tests, component tests
- **Coverage**: 30 tests across 5 test suites

### 10.3 Python Testing
- **Framework**: pytest
- **Test Coverage**: 19 tests for ML services
- **Test Types**: Unit tests for preprocessing, stationarity, residuals

## 11. System Requirements

### 11.1 Minimum Hardware Requirements
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 10 GB free space
- **Network**: Internet connection for API access

### 11.2 Recommended Hardware Requirements
- **CPU**: 4+ cores
- **RAM**: 8+ GB
- **Storage**: 20+ GB SSD
- **Network**: Broadband internet connection

### 11.3 Software Prerequisites
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Node.js**: 20+ (for local development)
- **Java JDK**: 17+ (for local development)
- **Python**: 3.11+ (for local development)
- **Maven**: 3.6+ (for local development)

## 12. Environment Configuration

### 12.1 Environment Variables
- `GMAIL_APP_PASSWORD`: Gmail app-specific password for email service
- `SPRING_DATASOURCE_URL`: PostgreSQL connection string
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password
- `DATABASE_URL`: Python service database connection
- `UPLOAD_DIR`: File upload directory path

### 12.2 Configuration Files
- `backend/src/main/resources/application.yaml`: Spring Boot configuration
- `frontend/.env`: Frontend environment variables
- `compose.yaml`: Docker Compose orchestration
- `backend/pom.xml`: Maven dependencies
- `frontend/package.json`: npm dependencies
- `fast-api/requirements.txt`: Python dependencies

## 13. Performance Optimization

### 13.1 Backend Optimization
- **Connection Pooling**: HikariCP (default in Spring Boot)
- **JPA Caching**: Second-level cache support
- **Async Processing**: WebFlux for non-blocking operations

### 13.2 Frontend Optimization
- **Code Splitting**: Vite automatic code splitting
- **Lazy Loading**: React lazy loading for routes
- **Asset Optimization**: Minification and compression
- **CDN Ready**: Static asset serving via Nginx

### 13.3 Database Optimization
- **Indexing**: Primary keys and foreign keys indexed
- **Query Optimization**: JPA query optimization
- **Connection Pooling**: Efficient database connections

## 14. Monitoring & Logging

### 14.1 Application Logging
- **Backend**: SLF4J with Logback
- **Frontend**: Console logging (development)
- **Python**: Uvicorn access logs

### 14.2 Error Handling
- **Global Exception Handlers**: Centralized error handling
- **Custom Error Responses**: Structured error messages
- **Validation Errors**: Detailed validation feedback

## 15. Browser Compatibility

### 15.1 Supported Browsers
- **Chrome**: 90+ (Recommended)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+

## 16. Accessibility

### 16.1 Standards Compliance
- **WCAG 2.1**: Level AA compliance target
- **Semantic HTML**: Proper HTML5 semantics
- **ARIA Labels**: Accessible Rich Internet Applications support
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Compatible with major screen readers

---

## Summary

This stock market prediction platform is built using a modern, scalable microservices architecture with:
- **Backend**: Java 17 + Spring Boot 3.2.2
- **Frontend**: React 19 + TypeScript + Vite
- **ML Service**: Python + FastAPI + Statsmodels
- **Database**: PostgreSQL 15
- **Deployment**: Docker + Docker Compose
- **Testing**: Comprehensive test coverage across all layers

The system is designed for high performance, security, and maintainability, with support for real-time stock data analysis and machine learning-based predictions.
