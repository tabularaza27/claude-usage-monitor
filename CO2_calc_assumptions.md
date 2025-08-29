# CO₂ Emission Calculation for Claude Sonnet 4 Token Usage

This document provides a conservative calculation method for estimating the carbon emissions from LLM token usage (Claude Sonnet 4).  

---

## Constants (Assumptions)

- **Energy per token**:  
  `energy_per_token_kwh = 0.000002` kWh  
  (~7.2 J per token, based on conservative upper-bound literature estimates)

- **Power Usage Effectiveness (PUE):**  
  `pue = 1.4`  
  (accounts for data center overhead such as cooling and power distribution)

- **Grid Emission Factor:**  
  `emission_factor = 0.6` kg CO₂ per kWh  
  (global average, fossil-heavy electricity mix)


- **Equivalence Conversion Factors:**  
  - `car_kg_per_km = 0.25` kg CO₂/km (average gasoline car)  
  - `tree_absorption_kg_per_year = 22` kg CO₂/year  
  - `electricity_kg_per_kwh = 0.43` kg CO₂/kWh (U.S. grid avg)  
  - `person_kg_per_year = 4700` kg CO₂/year (global per capita avg)  

---

## Inputs

- `total_tokens` = sum of all tokens used (input, output, cache create, cache read)

Example (from provided logs, July–August 2025):  
`total_tokens = 242,571,183`

---

## Formulas

1. **Base energy (kWh)**  

base_energy_kwh = total_tokens * energy_per_token_kwh

2. **Total energy with PUE overhead (kWh)**  

total_energy_kwh = base_energy_kwh * pue

3. **Total CO₂ emissions (kg)**  

co2_kg = total_energy_kwh * emission_factor

4. **CO₂ per token (grams)**  

co2_g_per_token = energy_per_token_kwh * pue * emission_factor * 1000

---

## Example Calculation (Monthly Total)

For `total_tokens = 242,571,183`:

- Base energy:  
`242,571,183 × 0.000002 = 485.14 kWh`

- With PUE overhead:  
`485.14 × 1.4 = 679.20 kWh`

- Total CO₂:  
`679.20 × 0.6 = 407.52 kg CO₂`

- Per token CO₂:  
`0.000002 × 1.4 × 0.6 × 1000 = 0.00168 g CO₂/token`

---

## Python Function Example

```python
def co2_from_tokens(total_tokens: int) -> dict:
 energy_per_token_kwh = 0.000002
 pue = 1.4
 emission_factor = 0.6

 base_energy_kwh = total_tokens * energy_per_token_kwh
 total_energy_kwh = base_energy_kwh * pue
 co2_kg = total_energy_kwh * emission_factor
 co2_g_per_token = energy_per_token_kwh * pue * emission_factor * 1000

 return {
     "total_energy_kwh": total_energy_kwh,
     "co2_kg": co2_kg,
     "co2_g_per_token": co2_g_per_token
 }