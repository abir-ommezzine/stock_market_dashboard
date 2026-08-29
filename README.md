# 📈 StockAI — Stock Market Prediction Dashboard

A full-stack web application for stock market time-series forecasting. Upload or connect a dataset, choose a forecasting model (ARIMA, ARMA, or SARIMA), tune or auto-optimize its parameters, and visualize predictions overlaid on historical prices — complete with accuracy metrics, saved experiment history, watchlists, and a built-in support chat.

![Bloomberg-style terminal view](Bloomberg%20Terminal.png)

## Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Run with Docker (recommended)](#run-with-docker-recommended)
  - [Run services locally](#run-services-locally)
- [Configuration](#configuration)
- [API Overview](#api-overview)
- [Diagrams](#diagrams)

## Features

- **Authentication & authorization** — JWT-based login/registration with Spring Security, protected routes, and role-based access (`USER` / `ADMIN`).
- **Flexible data sources** — build a dataset from a CSV upload, an external CSV URL, or live data from Yahoo Finance / Alpha Vantage.
- **Forecasting models** — ARIMA, ARMA, and SARIMA via `statsmodels`, with either automatic parameter selection (AIC/BIC grid search) or manual `(p, d, q)` / seasonal configuration.
- **Interactive visualization** — historical prices and forecasted values plotted together with Recharts, plus MAE, RMSE, MAPE, and R² metrics for every run.
- **Experiment history** — save, search, filter, re-run, and delete past prediction experiments.
- **Watchlist** — track favorite symbols.
- **Admin dashboard** — user management and oversight.
- **Support chat** — users message "Customer Support"; admins see and respond to every conversation, all persisted to the database.
- **Email notifications** — account verification and notifications sent via Gmail SMTP.
- **Dark/light theme**, responsive layout, and a component library built on shadcn/ui + Radix primitives.

## Architecture

A 3-tier, containerized microservice setup: a React SPA talks to a Java Spring Boot API, which owns the database and proxies model-training requests to a Python FastAPI ML service.

```
 Browser
   │
   ▼
 React Frontend  (Vite + TS, served by Nginx)  — :5173
   │  REST / JWT
   ▼
 Spring Boot Backend  (auth, datasets, predictions, chat, admin) — :8083
   │                                   │
   ▼                                   ▼
 PostgreSQL 15  — :5432        FastAPI ML Service (ARIMA/ARMA/SARIMA) — :8000
```

- The **backend** owns all business logic, persistence, and auth; it fetches/stores stock data and forwards model-training requests to the ML service.
- The **ML service** is stateless — it receives a time series + model config, trains the model, and returns predictions and metrics.
- Data source selection uses a **Strategy + Factory** pattern (`CsvProvider`, `UrlDatasetProvider`, `YahooProvider`, `AlphaVantageProvider`).

See [Diagrams](#diagrams) below for the full class, package, sequence, and deployment views.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui (Radix), React Router v7, Recharts, Zustand |
| Backend | Java 17, Spring Boot 3.2, Spring Security + JWT, Spring Data JPA/Hibernate, springdoc-openapi |
| ML Service | Python, FastAPI, statsmodels, pandas, numpy, scikit-learn |
| Database | PostgreSQL 15 |
| Infra | Docker, Docker Compose, Nginx |

## Project Structure

```
.
├── backend/            # Spring Boot API (auth, datasets, predictions, chat, admin, watchlist)
├── fast-api/            # FastAPI ML service (ARIMA/ARMA/SARIMA training & prediction)
├── frontend/            # React + Vite SPA (feature-sliced design)
├── compose.yaml         # Docker Compose orchestration for all 4 services
├── *.puml               # PlantUML source for the architecture/sequence diagrams
└── *.png / *.gif        # Rendered diagrams and product screenshots
```

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose — for the containerized setup
- Node.js 18+ — for local frontend development
- Java 17+ and Maven — for local backend development
- Python 3.9+ — for local ML service development

### Run with Docker (recommended)

```bash
git clone https://github.com/abir-ommezzine/stock_market_dashboard.git
cd stock_market_dashboard

# optional: set GMAIL_APP_PASSWORD for email features, see .env.example
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API (Swagger UI at `/swagger-ui.html`) | http://localhost:8083 |
| ML API | http://localhost:8000 |
| PostgreSQL | localhost:5432 |

### Run services locally

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend (requires a running PostgreSQL instance)
cd backend
mvn spring-boot:run

# ML service
cd fast-api
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Configuration

Email features (account verification, notifications) require a Gmail app password:

1. Copy the example env file: `cp .env.example .env`
2. Enable 2‑Step Verification on the sending Gmail account, then generate an [app password](https://myaccount.google.com/apppasswords).
3. Set `GMAIL_APP_PASSWORD` in `.env`. See [EMAIL_SETUP.md](EMAIL_SETUP.md) for the full walkthrough.

Database connection and other service settings are configured via environment variables in [compose.yaml](compose.yaml).

## API Overview

| Domain | Base path | Notes |
|---|---|---|
| Auth | `/api/auth` | Register, login (JWT) |
| Datasets | `/api/datasets` | Upload CSV, link URL/API source, list symbols & prices |
| Stocks | `/api/stocks` | Fetch stock data for a dataset |
| ML / Predictions | `/api/ml` | Train a model from a dataset and return forecasts + metrics |
| Prediction history | `/api/predictions` | Save, list, delete saved experiments |
| Chat | `/api/chat` | Support conversations between users and admins |
| Watchlist | `/api/watchlist` | Manage tracked symbols |
| Admin | `/api/admin` | User management |

Full interactive documentation is available via Swagger UI once the backend is running: `http://localhost:8083/swagger-ui.html`.

## Diagrams

Rendered diagrams (PlantUML sources are included alongside them for editing):

| Diagram | File |
|---|---|
| Global use case | [Global use case diagram.png](Global%20use%20case%20diagram.png) |
| Backend class diagram | [Backend class diagram.png](Backend%20class%20diagram.png) |
| Package diagram | [Package diagram.png](Package%20diagram.png) |
| Deployment diagram | [Deployment diagram.png](Deployment%20diagram.png) |
| Authentication sequence | [Sequence diagram for authentication.png](Sequence%20diagram%20for%20authentication.png) |
| "Launch a Prediction" sequence | [Sequence diagram for "Launch a Prediction".png](Sequence%20diagram%20for%20%E2%80%9CLaunch%20a%20Prediction%E2%80%9D.png) |
