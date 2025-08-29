-- CO2 emission factors based on research-backed assumptions
-- Source: CO2_calc_assumptions.md - Conservative calculation method
-- Formula: 0.000002 kWh/token × 1.4 PUE × 0.6 kg CO₂/kWh × 1000 = 1.68g per 1k tokens

INSERT OR REPLACE INTO emission_factors (model_pattern, emissions_per_1k_tokens, description, source, effective_from) VALUES
-- All Claude models use unified research-based factor
('claude-sonnet*', 1.68, 'Claude Sonnet family - research-based calculation', 'CO2_calc_assumptions.md - Energy-based method', '2025-01-01'),
('claude-haiku*', 1.68, 'Claude Haiku family - research-based calculation', 'CO2_calc_assumptions.md - Energy-based method', '2025-01-01'),
('claude-opus*', 1.68, 'Claude Opus family - research-based calculation', 'CO2_calc_assumptions.md - Energy-based method', '2025-01-01'),
('claude-sonnet-4*', 1.68, 'Claude Sonnet 4 family - research-based calculation', 'CO2_calc_assumptions.md - Energy-based method', '2025-01-01'),

-- Other models for reference (using same conservative factor)
('gpt-4*', 1.68, 'GPT-4 family - conservative research-based estimate', 'CO2_calc_assumptions.md - Energy-based method', '2025-01-01'),
('gpt-3.5*', 1.68, 'GPT-3.5 family - conservative research-based estimate', 'CO2_calc_assumptions.md - Energy-based method', '2025-01-01'),

-- Default fallback using research-based factor
('*', 1.68, 'Default research-based factor for all models', 'CO2_calc_assumptions.md - Conservative energy-based method', '2025-01-01');