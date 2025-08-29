# Claude Usage & Environmental Impact Monitor

A comprehensive monitoring dashboard for Claude AI usage with real-time environmental impact tracking. Provides both personal and team-level insights into token usage, CO2 emissions, and environmental equivalents based on research-validated calculations.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          Frontend (React)                      │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   PersonalTab   │    │    TeamTab      │                    │
│  │                 │    │                 │                    │
│  │ • Usage Stats   │    │ • Team Config   │                    │
│  │ • CO2 Impact    │    │ • Projections   │                    │
│  │ • Projections   │    │ • Equivalents   │                    │
│  │ • Charts        │    │ • Budget %      │                    │
│  └─────────────────┘    └─────────────────┘                    │
│                                   │                            │
│  ┌─────────────────────────────────────────────────────────────┐
│  │                 Shared Components                           │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │  │ UsageChart  │ │  StatCard   │ │  TeamConfigForm     │   │
│  │  │ (Recharts)  │ │             │ │                     │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘   │
│  └─────────────────────────────────────────────────────────────┘
├───────────────────────────────────┼────────────────────────────┤
│                                   │                            │
│                      HTTP API + WebSocket                      │
│                       (Real-time Updates)                      │
│                                   │                            │
├───────────────────────────────────┼────────────────────────────┤
│                                   │                            │
│                       Backend (Node.js/Express)                │
│  ┌─────────────────────────────────────────────────────────────┐
│  │                    API Routes                               │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │  │Usage Stats  │ │Team Config  │ │ Health & System     │   │
│  │  │/api/usage/* │ │/api/team/*  │ │ /health, /api/co2/* │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘   │
│  └─────────────────────────────────────────────────────────────┘
│                                   │                            
│  ┌─────────────────────────────────────────────────────────────┐
│  │                   Core Services                             │
│  │  ┌──────────────┐ ┌──────────────┐ ┌─────────────────────┐ │
│  │  │ClaudeMonitor │ │CO2Calculator │ │ DataCollector       │ │
│  │  │Parser        │ │(Research-    │ │(Cron Scheduler)     │ │
│  │  │              │ │ based calc)  │ │                     │ │
│  │  └──────────────┘ └──────────────┘ └─────────────────────┘ │
│  │  ┌──────────────┐                   ┌─────────────────────┐ │
│  │  │ WebSocket    │                   │ Database Manager    │ │
│  │  │ Service      │                   │ (SQLite)            │ │
│  │  └──────────────┘                   └─────────────────────┘ │
│  └─────────────────────────────────────────────────────────────┘
│                                   │                            
│  ┌─────────────────────────────────────────────────────────────┐
│  │                    Data Layer                               │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │  │   SQLite    │ │ Parsed Log  │ │     Emission        │   │
│  │  │  Database   │ │   Files     │ │     Factors         │   │
│  │  │             │ │             │ │   (Configurable)    │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘   │
│  └─────────────────────────────────────────────────────────────┘
│                                   │                            
│  ┌─────────────────────────────────────────────────────────────┐
│  │               External Integration                          │
│  │  ┌─────────────────────────────────────────────────────────┐ │
│  │  │              claude-monitor CLI                         │ │
│  │  │        (Automated every 5 minutes)                     │ │
│  │  │   claude-monitor --view daily > logfile.log            │ │
│  │  └─────────────────────────────────────────────────────────┘ │
│  └─────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Tech Stack

### Frontend
- **React 18** - UI framework with hooks and modern patterns
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first styling framework
- **Recharts** - Data visualization and charting library
- **Vite** - Fast development build tool and bundler

### Backend  
- **Node.js 18+** - JavaScript runtime environment
- **Express.js** - Web framework for RESTful API endpoints
- **TypeScript** - Type-safe server-side development
- **SQLite** - Lightweight embedded database with migrations
- **WebSocket (ws)** - Real-time bidirectional communication
- **node-cron** - Scheduled task execution

### Infrastructure & Tooling
- **claude-monitor** - Official Claude usage monitoring CLI tool
- **Docker & Docker Compose** - Containerization and orchestration
- **tsx** - TypeScript execution for development
- **Database Migrations** - Schema versioning and evolution

## 📊 Key Features

### Personal Usage Dashboard
- **Real-time Metrics**: Daily token usage, CO2 emissions, carbon budget percentage
- **Historical Charts**: 30-day usage trends with dual-axis (tokens/CO2) visualization
- **Environmental Impact**: Research-based CO2 equivalents (car km, electricity, trees)
- **Yearly Projections**: Extrapolated annual usage and environmental footprint
- **Sustainability Insights**: Carbon offset recommendations and efficiency tips

### Team Usage Dashboard
- **Dynamic Team Configuration**: Configurable team size and usage multipliers
- **Scaled Analytics**: Team-level usage projections and collective impact
- **Per-Person Breakdowns**: Individual impact analysis within team context
- **Budget Tracking**: Team carbon budget as percentage of individual allowances
- **Collective Equivalents**: Scaled environmental impact comparisons

### Core System Capabilities
- **Automated Data Pipeline**: Scheduled parsing of `claude-monitor` CLI output
- **Research-Based Calculations**: Validated CO2 emission factors (1.68g per token)
- **Real-Time Synchronization**: WebSocket-powered live data updates
- **Responsive Design**: Mobile-friendly interface with adaptive layouts
- **Type Safety**: End-to-end TypeScript for robust development

## 🔧 Installation & Setup

### Prerequisites
- **Node.js 18+** - JavaScript runtime
- **npm or yarn** - Package manager  
- **claude-monitor CLI** - Installed and configured with Claude access

### Quick Start with Docker (Recommended)

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd llm_usage_dashboard
   
   # Create required directories
   mkdir -p data logs
   ```

2. **Start the stack:**
   ```bash
   docker-compose up -d
   ```
   
3. **Access the application:**
   - **Frontend Dashboard**: http://localhost:3000
   - **Backend API**: http://localhost:3001  
   - **Health Check**: http://localhost:3001/health

### Development Setup

#### Backend Development
```bash
cd backend
npm install                    # Install dependencies
npm run db:migrate            # Initialize database
npm run db:seed              # Seed with initial data
npm run dev                  # Start development server with hot reload
```

#### Frontend Development  
```bash
cd frontend
npm install                  # Install dependencies  
npm run dev                 # Start development server with HMR
```

### Manual Data Import (Optional)
If you have existing claude-monitor logs:
```bash
# Copy your existing log file to the backend/logs/ directory
cp /path/to/your/daily-usage.log backend/logs/

# The system will automatically parse and import the data
```

## 📁 Project Structure

```
llm_usage_dashboard/
├── backend/                          # Node.js/Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   └── api.ts               # REST API endpoints
│   │   ├── services/
│   │   │   ├── claudeMonitorParser.ts   # CLI output parsing
│   │   │   ├── co2Calculator.ts         # Research-based CO2 calculations  
│   │   │   ├── dataCollector.ts         # Automated data collection
│   │   │   └── webSocketService.ts      # Real-time communication
│   │   ├── models/                   # TypeScript data models
│   │   ├── config/                   # Database configuration
│   │   └── utils/                    # Helper utilities
│   ├── database/
│   │   ├── migrations/              # Database schema evolution
│   │   └── seeds/                   # Initial data setup
│   └── logs/                        # Claude monitor output storage
├── frontend/                        # React/TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── tabs/               # PersonalTab, TeamTab main views
│   │   │   ├── charts/             # Recharts data visualizations
│   │   │   ├── common/             # Reusable UI components
│   │   │   └── forms/              # TeamConfigForm
│   │   ├── hooks/                  # Custom React hooks for API
│   │   ├── utils/                  # Formatting and utility functions
│   │   └── types/                  # TypeScript interfaces
├── CO2_calc_assumptions.md          # Research methodology documentation
├── docker-compose.yml               # Container orchestration
└── README.md                        # This documentation
```

## 🌍 Environmental Impact Methodology

The application implements research-validated CO2 emission calculations:

### Core Calculation Parameters
- **Energy per token**: 0.000002 kWh (~7.2J, conservative upper-bound estimate)
- **Power Usage Effectiveness (PUE)**: 1.4 (data center overhead factor)
- **Grid emission factor**: 0.6 kg CO₂/kWh (global average fossil-heavy mix)  
- **Final factor**: 0.00168g CO₂ per token (1.68g per 1000 tokens)

### Environmental Equivalence Factors
- **Automotive emissions**: 0.25 kg CO₂/km (average gasoline vehicle)
- **Carbon sequestration**: 22 kg CO₂/year per mature tree
- **Electricity generation**: 0.43 kg CO₂/kWh (U.S. grid average)
- **Personal carbon budget**: 4700 kg CO₂/year (global per capita target)

**Detailed methodology**: See `CO2_calc_assumptions.md` for complete research sources and validation.

## 🔌 API Reference

### Usage Analytics
- **`GET /api/usage/stats`** - Personal statistics with yearly projections
- **`GET /api/usage/summary?days=30`** - Daily usage summaries and trends  
- **`GET /api/usage/daily`** - Raw usage records

### Team Management  
- **`GET /api/team/config`** - Current team configuration settings
- **`POST /api/team/config`** - Update team size and usage multipliers
- **`GET /api/team/projection`** - Team usage projections and environmental impact

### System Administration
- **`GET /api/co2/factors`** - CO2 emission factors and calculation parameters
- **`POST /api/data/collect`** - Manually trigger data collection cycle
- **`GET /health`** - System health and component status
- **`WebSocket /ws`** - Real-time data updates and system heartbeat

### Request/Response Examples

**Team Configuration Update:**
```javascript
POST /api/team/config
Content-Type: application/json

{
  "team_size": 5,
  "usage_multiplier": 1.2
}
```

**Usage Statistics Response:**
```javascript
{
  "today": { "tokens": 15420, "co2": 25.9, "cost": 0.14 },
  "yesterday": { "tokens": 8930, "co2": 15.0, "cost": 0.08 },
  "yearlyProjection": { 
    "tokens": 5236207, 
    "co2": 8796.8, 
    "cost": 487.32 
  }
}
```

## 🔄 Data Processing Pipeline

1. **Automated Collection**: Cron scheduler triggers `claude-monitor --view daily` every 5 minutes
2. **Output Parsing**: Extract structured data from CLI table output with ANSI code handling
3. **CO2 Calculation**: Apply research-based emission factors to token usage data
4. **Data Persistence**: Store processed records in SQLite with proper indexing
5. **Real-time Broadcasting**: WebSocket notifications update all connected clients
6. **Statistical Analysis**: Generate personal and team projections with environmental context

## 🛠️ Development Commands

### Backend Development
```bash
cd backend

# Development
npm run dev              # Hot-reload development server
npm run build           # Production build compilation
npm run start          # Production server

# Database Management  
npm run db:migrate     # Apply schema migrations
npm run db:seed       # Load initial data
npm run db:reset      # Reset and reinitialize database

# Testing & Quality
npm run test          # Run test suite
npm run lint         # Code quality checks
```

### Frontend Development
```bash  
cd frontend

# Development & Build
npm run dev          # Development server with HMR
npm run build       # Production build optimization
npm run preview     # Preview production build locally

# Quality Assurance
npm run lint        # ESLint code quality
npm run type-check  # TypeScript validation
```

## 🐳 Docker Deployment

### Production Deployment
```bash
# Build and deploy complete stack
docker-compose up -d --build

# View logs
docker-compose logs -f

# Scale services (if needed)
docker-compose up -d --scale backend=2

# Update and redeploy
git pull origin main
docker-compose up -d --build
```

### Environment Configuration
Create `.env` files for customization:

**Backend Configuration:**
```env
NODE_ENV=production
PORT=3001
DB_PATH=./data/usage.db
CLAUDE_MONITOR_PATH=/usr/local/bin/claude-monitor
DATA_COLLECTION_INTERVAL=300000
```

**Frontend Configuration:**
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001/ws
VITE_REFRESH_INTERVAL=30000
```

## 🚨 Troubleshooting

### Common Issues & Solutions

**❌ No usage data appearing**
```bash
# Check if claude-monitor is accessible
claude-monitor --help

# Verify data collection
curl -X POST http://localhost:3001/api/data/collect

# Check backend logs
docker-compose logs backend | grep -E "(error|Error)"
```

**❌ WebSocket connection failures**  
```bash
# Test WebSocket connectivity
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Key: test" -H "Sec-WebSocket-Version: 13" \
     http://localhost:3001/ws

# Check proxy configuration in browser dev tools
```

**❌ Database corruption or migration issues**
```bash
# Backup and reset database
cp data/usage.db data/usage.db.backup
rm data/usage.db
docker-compose restart backend
```

**❌ High memory usage or performance issues**
```bash
# Monitor resource usage
docker stats

# Check database size and optimize
sqlite3 data/usage.db "VACUUM;"
sqlite3 data/usage.db "ANALYZE;"
```

### Development Debugging

**Backend debugging:**
```bash
# Enable verbose logging
NODE_ENV=development DEBUG=* npm run dev

# Database inspection
sqlite3 data/usage.db
.schema
SELECT COUNT(*) FROM usage_records;
SELECT * FROM usage_records ORDER BY date DESC LIMIT 5;
```

**Frontend debugging:**
```bash
# Build analysis
npm run build -- --analyze

# Network request monitoring
# Open browser dev tools → Network tab → filter by 'localhost:3001'
```

## 📈 Performance Optimization

### Database Optimization
- **Indexing**: Automatic indexes on date and model columns
- **Cleanup**: Periodic old record cleanup (configurable retention)
- **Vacuum**: Regular SQLite optimization and compaction

### Frontend Performance
- **Code Splitting**: React lazy loading for tab components
- **Memoization**: React.memo for expensive chart computations  
- **WebSocket Throttling**: Batched updates to prevent UI flooding

### Backend Efficiency
- **Connection Pooling**: SQLite connection optimization
- **Caching**: In-memory caching for frequently accessed emission factors
- **Batch Processing**: Grouped database operations for better throughput

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow
1. **Fork** the repository and clone locally
2. **Create branch**: `git checkout -b feature/your-feature-name`
3. **Install dependencies**: `npm install` in both `/backend` and `/frontend`
4. **Make changes** with proper TypeScript types
5. **Test locally**: Ensure both backend and frontend work correctly
6. **Commit changes**: Use conventional commit messages
7. **Push branch**: `git push origin feature/your-feature-name`
8. **Open PR**: Create detailed pull request with description

### Code Standards
- **TypeScript**: Maintain strict type safety throughout
- **ESLint**: Follow existing linting configuration
- **Testing**: Add tests for new functionality
- **Documentation**: Update README and inline comments as needed

### Issue Reporting
When reporting bugs, please include:
- Operating system and Node.js version
- Steps to reproduce the issue
- Expected vs actual behavior
- Relevant logs or error messages
- Browser console output (for frontend issues)

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for full details.

## 🙋‍♀️ Support & Community

- **Documentation**: Review this README and `CO2_calc_assumptions.md`
- **API Reference**: See the API endpoints section above
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

---

**Built with ❤️ for sustainable AI usage monitoring**