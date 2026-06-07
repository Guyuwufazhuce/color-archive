-- Reset existing color analysis for re-analysis with fixed classifyHex()
-- Columns have NOT NULL constraints, so use defaults instead of NULL

UPDATE photos
SET
  dominant_color = '#cccccc',
  dominant_colors = '[]'::jsonb,
  visual_color = '',
  color_tags = '{}'::text[]
WHERE
  manual_color_override = false OR manual_color_override IS NULL;