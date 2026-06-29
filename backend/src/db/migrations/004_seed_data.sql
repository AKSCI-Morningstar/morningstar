INSERT INTO nodes (id, name, type, attributes) VALUES
  ('StellarMet_t', 'StellarMet', 'supplier', '{"risk":68,"contract_value":4700000,"location":"USA","email":"orders@stellarmet.com"}'),
  ('AMETEK_t', 'AMETEK', 'supplier', '{"risk":15,"contract_value":2100000,"location":"USA","creditScore":82}'),
  ('CeramicTech_t', 'CeramicTech', 'supplier', '{"risk":42,"contract_value":1800000,"location":"USA","email":"procurement@ceramictech.com"}'),
  ('Aerocast_Inc_t', 'Aerocast Inc', 'supplier', '{"risk":85,"contract_value":3100000,"location":"USA","creditScore":45}'),
  ('FluidLogic_t', 'FluidLogic', 'supplier', '{"risk":15,"contract_value":1200000,"location":"USA"}'),
  ('NanoAlloy_t', 'NanoAlloy Ltd', 'supplier', '{"risk":55,"contract_value":2500000,"location":"UK"}'),
  ('Baoji_Smelter_t', 'Baoji Smelter', 'supplier', '{"risk":85,"location":"China","output_reduction":23}'),
  ('QualiMet_t', 'QualiMet', 'supplier', '{"risk":40,"contract_value":800000,"location":"USA"}'),
  ('Titanium_Casting_t', 'Titanium Casting', 'component', '{"lead_time":26,"stock":0,"status":"STOCKOUT","qty":120,"reorder":200}'),
  ('Valve_Group_t', 'Valve Group', 'component', '{"lead_time":14,"stock":4,"status":"CRITICAL","qty":450,"reorder":100}'),
  ('Composite_PrePreg_t', 'Composite Pre-Preg', 'component', '{"lead_time":8,"stock":12,"status":"LOW","qty":30,"reorder":100}'),
  ('Fastener_Kit_t', 'Fastener Kit #8847', 'component', '{"lead_time":2,"stock":847,"status":"OK","qty":600,"reorder":200}'),
  ('F-35_Program_t', 'F-35 Lot 17', 'program', '{"budget":47000000,"risk":85,"revenue":47000000}'),
  ('Artemis_Program_t', 'Artemis Program', 'program', '{"budget":128000000,"risk":55,"revenue":500000}'),
  ('Orion_Capsule_t', 'Orion Capsule', 'program', '{"budget":72000000,"risk":35,"revenue":320000}')
ON CONFLICT (id) DO UPDATE SET attributes = EXCLUDED.attributes;

INSERT INTO edges (source_id, target_id, relationship, lag_days, probability) VALUES
  ('StellarMet_t', 'Titanium_Casting_t', 'supplies', 26, 68),
  ('AMETEK_t', 'Titanium_Casting_t', 'supplies', 14, 12),
  ('CeramicTech_t', 'F-35_Program_t', 'supplies', 14, 42),
  ('Aerocast_Inc_t', 'F-35_Program_t', 'supplies', 18, 85),
  ('FluidLogic_t', 'Orion_Capsule_t', 'supplies', 6, 15),
  ('NanoAlloy_t', 'Artemis_Program_t', 'supplies', 30, 55),
  ('Baoji_Smelter_t', 'StellarMet_t', 'sources_from', 60, 85),
  ('QualiMet_t', 'F-35_Program_t', 'supplies', 10, 40),
  ('Titanium_Casting_t', 'F-35_Program_t', 'part_of', 26, 68),
  ('Titanium_Casting_t', 'Artemis_Program_t', 'part_of', 26, 68),
  ('Valve_Group_t', 'F-35_Program_t', 'part_of', 14, 55),
  ('Valve_Group_t', 'Orion_Capsule_t', 'part_of', 14, 30),
  ('Composite_PrePreg_t', 'Artemis_Program_t', 'part_of', 8, 40),
  ('Fastener_Kit_t', 'F-35_Program_t', 'part_of', 2, 5),
  ('Fastener_Kit_t', 'Orion_Capsule_t', 'part_of', 2, 5),
  ('Fastener_Kit_t', 'Artemis_Program_t', 'part_of', 2, 5)
ON CONFLICT (source_id, target_id, relationship) DO NOTHING;
