# Claude Code Usage Dashboard - Detailed Implementation Plan

## Project Overview
Create a local monitoring dashboard for Claude Code usage with environmental impact tracking, parsing actual data from `claude-monitor` with modular CO2 calculations.

## Technology Stack & Architecture

### Backend Stack
- **Runtime:** Node.js 18+ with TypeScript
- **Framework:** Express.js with cors, helmet security
- **Database:** SQLite3 with better-sqlite3 driver
- **Real-time:** ws (WebSocket) library
- **Process Management:** node-cron for scheduling
- **Data Validation:** Zod for type-safe parsing

### Frontend Stack
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS + HeadlessUI components
- **Charts:** Recharts for responsive visualizations
- **State Management:** React Query for server state + Zustand for client state
- **WebSocket:** Native WebSocket API with reconnection logic
- **Build:** Vite for fast development and building

## Detailed Implementation Plan

### 1. Project Structure Setup
```
llm-usage-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts          # SQLite connection & migrations
│   │   │   └── environment.ts       # Environment variables
│   │   ├── services/
│   │   │   ├── claudeMonitorParser.ts    # Parse claude-monitor output
│   │   │   ├── co2Calculator.ts          # Modular CO2 calculation engine
│   │   │   ├── dataCollector.ts          # Scheduled data collection
│   │   │   └── websocketService.ts       # WebSocket server management
│   │   ├── models/
│   │   │   ├── Usage.ts             # Usage data models & validation
│   │   │   └── EmissionFactor.ts    # CO2 calculation models
│   │   ├── routes/
│   │   │   ├── api.ts               # REST API endpoints
│   │   │   └── websocket.ts         # WebSocket route handlers
│   │   ├── utils/
│   │   │   ├── logger.ts            # Structured logging
│   │   │   └── dateUtils.ts         # Date manipulation helpers
│   │   └── server.ts                # Express server setup
│   ├── database/
│   │   ├── migrations/              # SQL migration files
│   │   └── seeds/                   # Initial data (emission factors)
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Layout.tsx       # Main app layout
│   │   │   │   ├── StatCard.tsx     # Reusable stat display card
│   │   │   │   └── LoadingSpinner.tsx
│   │   │   ├── charts/
│   │   │   │   ├── UsageChart.tsx   # Token usage trend chart
│   │   │   │   ├── CO2Chart.tsx     # CO2 emissions chart
│   │   │   │   └── ModelBreakdown.tsx # Model usage pie chart
│   │   │   ├── tabs/
│   │   │   │   ├── PersonalTab.tsx  # Personal usage dashboard
│   │   │   │   └── TeamTab.tsx      # Team projections dashboard
│   │   │   └── forms/
│   │   │       └── TeamConfig.tsx   # Team size configuration
│   │   ├── services/
│   │   │   ├── api.ts               # REST API client
│   │   │   ├── websocket.ts         # WebSocket client with reconnection
│   │   │   └── calculations.ts      # Frontend calculation helpers
│   │   ├── stores/
│   │   │   ├── usageStore.ts        # Usage data state management
│   │   │   └── teamStore.ts         # Team configuration state
│   │   ├── types/
│   │   │   ├── usage.ts             # TypeScript interfaces
│   │   │   └── api.ts               # API response types
│   │   ├── utils/
│   │   │   ├── formatters.ts        # Number/date formatting
│   │   │   └── constants.ts         # App constants
│   │   ├── hooks/
│   │   │   ├── useUsageData.ts      # Custom hook for usage data
│   │   │   └── useWebSocket.ts      # WebSocket connection hook
│   │   └── App.tsx
│   ├── public/
│   └── package.json
├── docker-compose.yml
├── PROJECT_PLAN.md
└── README.md
```

### 2. Database Schema Design
```sql
-- Usage tracking table
CREATE TABLE usage_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    model_name TEXT NOT NULL,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    cache_create_tokens INTEGER DEFAULT 0,
    cache_read_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER NOT NULL,
    cost_usd REAL NOT NULL,
    co2_emissions_grams REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, model_name)
);

-- CO2 emission factors (configurable)
CREATE TABLE emission_factors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_pattern TEXT NOT NULL, -- e.g., "claude-sonnet*"
    emissions_per_1k_tokens REAL NOT NULL,
    description TEXT,
    source TEXT,
    effective_from DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Team configurations
CREATE TABLE team_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_size INTEGER NOT NULL DEFAULT 1,
    usage_multiplier REAL NOT NULL DEFAULT 1.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Claude Monitor Parser (Detailed)
```typescript
// claudeMonitorParser.ts
interface ClaudeMonitorRow {
  date: string;
  models: string;
  input: number;
  output: number;
  cacheCreate: number;
  cacheRead: number;
  totalTokens: number;
  costUsd: number;
}

class ClaudeMonitorParser {
  async parseDaily(): Promise<ClaudeMonitorRow[]> {
    // Execute: claude-monitor --view daily --log-file daily-usage.log
    // Parse table output using regex patterns
    // Handle model name extraction and token parsing
    // Return structured data array
  }

  private parseTableRow(row: string): ClaudeMonitorRow | null {
    // Regex patterns for each column
    // Handle number formatting (commas, ellipsis)
    // Extract model names from complex strings
  }

  private normalizeModelName(model: string): string {
    // Convert "claude-sonnet..." to "claude-sonnet-3.5"
    // Handle different model name formats
  }
}
```

### 4. Modular CO2 Calculator System
```typescript
// co2Calculator.ts
interface EmissionFactor {
  modelPattern: string;
  emissionsPerK: number; // grams CO2 per 1000 tokens
  source: string;
}

class CO2Calculator {
  private factors: Map<string, EmissionFactor> = new Map();

  async loadEmissionFactors(): Promise<void> {
    // Load from database or config file
    // Support pattern matching for model names
  }

  calculateEmissions(modelName: string, tokens: number): number {
    const factor = this.getFactorForModel(modelName);
    return (tokens / 1000) * factor.emissionsPerK;
  }

  private getFactorForModel(modelName: string): EmissionFactor {
    // Pattern matching logic
    // Fallback to default factor if no match
  }

  // Environmental context conversions
  convertToMilesDriven(co2Grams: number): number {
    return co2Grams / 404; // Average grams CO2 per mile
  }

  convertToTreesNeeded(co2Grams: number): number {
    return co2Grams / 21772; // Average tree CO2 absorption per year
  }
}
```

### 5. API Endpoints Design
```typescript
// routes/api.ts
app.get('/api/usage/daily', async (req, res) => {
  // Return daily usage for last 30 days
  // Include calculated CO2 emissions
});

app.get('/api/usage/trends', async (req, res) => {
  // Return aggregated trends (weekly, monthly)
  // Moving averages and projections
});

app.get('/api/team/projections', async (req, res) => {
  // Team scaling calculations
  // Environmental impact projections
});

app.put('/api/team/config', async (req, res) => {
  // Update team size and multipliers
});

app.get('/api/co2/factors', async (req, res) => {
  // Return current emission factors
});

app.put('/api/co2/factors', async (req, res) => {
  // Update emission factors (admin)
});
```

### 6. Real-time Data Flow
```typescript
// websocketService.ts
class WebSocketService {
  private clients: Set<WebSocket> = new Set();

  broadcast(data: any): void {
    // Send updates to all connected clients
  }

  async startDataCollection(): void {
    // Every 5 minutes: run claude-monitor
    // Parse new data
    // Calculate CO2 emissions
    // Store in database
    // Broadcast updates to clients
  }
}
```

### 7. Frontend State Management
```typescript
// stores/usageStore.ts
interface UsageState {
  dailyUsage: DailyUsage[];
  trends: TrendData;
  isLoading: boolean;
  lastUpdate: Date;
}

// hooks/useUsageData.ts
export function useUsageData() {
  return useQuery({
    queryKey: ['usage', 'daily'],
    queryFn: () => api.getDailyUsage(),
    refetchInterval: 30000, // 30 seconds
  });
}
```

### 8. Configuration & Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
      - ~/.claude:/root/.claude:ro
    environment:
      - NODE_ENV=production
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

### 9. Testing Strategy
- **Unit Tests:** CO2 calculator, parser functions
- **Integration Tests:** API endpoints, database operations
- **E2E Tests:** Full dashboard functionality with mock data

### 10. Future Extensibility
- **Plugin System:** Custom CO2 calculation modules
- **Data Export:** CSV/JSON export functionality
- **Alerts:** Usage/CO2 threshold notifications
- **Multi-user:** Team member individual tracking

## Implementation Steps

1. **Write detailed plan to PROJECT_PLAN.md** ✓
2. **Initialize project structure** - Create backend/frontend directories with package.json
3. **Backend foundation** - Express server, SQLite database, TypeScript setup
4. **Claude monitor parser** - Parse actual usage data from claude-monitor command
5. **Modular CO2 calculator** - Flexible emissions calculation with configurable factors
6. **REST API development** - Usage endpoints, team projections, real-time data
7. **Frontend React app** - Two-tab dashboard with charts and real-time updates
8. **WebSocket integration** - Live data streaming between backend and frontend
9. **Docker deployment** - Local hosting setup with docker-compose
10. **Testing & refinement** - Validate with actual Claude usage data

This plan provides implementation-ready detail while maintaining modularity for future enhancements and CO2 calculation updates.