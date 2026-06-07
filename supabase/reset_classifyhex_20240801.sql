-- Reset existing color analysis for re-analysis with fixed classifyHex()
-- Column names match the actual DB schema: dominant_color, dominant_colors, visual_color, color_tags

UPDATE photos
SET
  dominant_color = NULL,
  dominant_colors = NULL,
  visual_color = NULL,
  color_tags = NULL
WHERE
  manual_color_override = false OR manual_color_override IS NULL;