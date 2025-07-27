# Minsk Housing Maintenance Contracts Service

This repository contains a simple example of a web service for storing and managing housing maintenance contracts for the municipal districts of Minsk.

The project is split into two parts:

- `backend/` – a small Node.js HTTP server that serves contract data and a basic dashboard. It stores data in JSON files for each of the 9 districts and a city-wide file for the supervisor.
- `frontend/` – a very small React demo (loaded from a CDN) that interacts with the backend API and displays a basic dashboard per district.

## Running locally

1. Start the backend server:
   ```bash
   node backend/index.js
   ```
   The server listens on `http://localhost:3000`.

2. Open the dashboard in a browser at `http://localhost:3000`.

This is just a minimal demonstration to illustrate the project layout.
