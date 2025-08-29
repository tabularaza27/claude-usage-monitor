-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage_records (
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, model_name)
);

-- CO2 emission factors (configurable)
CREATE TABLE IF NOT EXISTS emission_factors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_pattern TEXT NOT NULL UNIQUE,
    emissions_per_1k_tokens REAL NOT NULL,
    description TEXT,
    source TEXT,
    effective_from DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Team configurations
CREATE TABLE IF NOT EXISTS team_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_size INTEGER NOT NULL DEFAULT 1,
    usage_multiplier REAL NOT NULL DEFAULT 1.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_date ON usage_records(date);
CREATE INDEX IF NOT EXISTS idx_usage_model ON usage_records(model_name);
CREATE INDEX IF NOT EXISTS idx_usage_date_model ON usage_records(date, model_name);