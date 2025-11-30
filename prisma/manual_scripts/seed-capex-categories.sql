-- Seed default CAPEX categories
-- This inserts the 4 standard categories matching the CapExCategoryType enum

INSERT INTO "CapExCategory" (id, type, name, "usefulLife", "reinvestFrequency", "reinvestAmount", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'IT_EQUIPMENT', 'IT Equipment', 5, NULL, NULL, NOW(), NOW()),
  (gen_random_uuid(), 'FURNITURE', 'Furniture', 10, NULL, NULL, NOW(), NOW()),
  (gen_random_uuid(), 'EDUCATIONAL_EQUIPMENT', 'Educational Equipment', 7, NULL, NULL, NOW(), NOW()),
  (gen_random_uuid(), 'BUILDING', 'Building', 40, NULL, NULL, NOW(), NOW())
ON CONFLICT (type) DO UPDATE
SET
  name = EXCLUDED.name,
  "usefulLife" = EXCLUDED."usefulLife",
  "updatedAt" = NOW();
