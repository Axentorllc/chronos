# Chronos

A Frappe-UI timeline and resource management application for workload scheduling.


## Project Structure

```
chronos/
├── frontend/                 # Frappe-UI application
│   ├── src/
│   │   ├── components/       
│   │   ├── pages/           # Application pages
│   │   └── services/        # API services
│   └── package.json
├── chronos/                 # Python backend
│   ├── api/                 # API endpoints
│   └── public/              # Static files
└── pyproject.toml
```

## Installation

Install frontend dependencies:
   ```bash
   cd frontend
   yarn install
   ```

```

## Build

   ```bash
   cd frontend
   bench build --app chronos
   ```
```
