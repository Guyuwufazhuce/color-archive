-- Add manual_color_override column to photos table
-- This allows users to manually correct auto-classified visual colors
-- and prevents re-analysis of manually overridden images.

ALTER TABLE photos
ADD COLUMN IF NOT EXISTS manual_color_override BOOLEAN NOT NULL DEFAULT false;
