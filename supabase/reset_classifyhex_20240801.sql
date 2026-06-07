-- Reset existing color analysis for re-analysis with fixed classifyHex()
-- The new classifyHex() fixes low-saturation colors (e.g. #586049 → Green instead of Gray)
-- Only resets non-manual-override photos.
-- After running this, users can click "Re-analyze all" in the gallery.

UPDATE photos
SET
  dominant_hex = NULL,
  dominant_name = NULL,
  dominant_colors = NULL,
  visual_color = NULL,
  color_tags = NULL
WHERE
  manual_color_override = false;