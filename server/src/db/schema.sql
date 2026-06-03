-- ═══════════════════════════════════════════════════════════════════════════
-- አለም ባንክ ገነት ቤተ ክርስቲያን - Database Schema
-- Run this file once to set up your Railway PostgreSQL database
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username      VARCHAR(50)  UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(100) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'teacher'
                CHECK (role IN ('superadmin', 'pastor', 'teacher')),
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login    TIMESTAMPTZ
);

-- ── REFRESH TOKENS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── CHURCH INFO ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS church_info (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(200) NOT NULL DEFAULT 'አለም ባንክ ገነት ቤተ ክርስቲያን',
  short_name    VARCHAR(100) DEFAULT 'አለም ባንክ ገነት',
  tagline       TEXT,
  description   TEXT,
  pastor_name   VARCHAR(100),
  pastor_message TEXT,
  address       TEXT,
  phone         VARCHAR(50),
  email         VARCHAR(255),
  facebook_url  TEXT,
  instagram_url TEXT,
  youtube_url   TEXT,
  telegram_url  TEXT,
  map_embed_url TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by    UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default church info row
INSERT INTO church_info (name) VALUES ('አለም ባንክ ገነት ቤተ ክርስቲያን')
ON CONFLICT DO NOTHING;

-- ── HERO ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hero (
  id                    SERIAL PRIMARY KEY,
  title                 VARCHAR(200) DEFAULT 'አለም ባንክ ገነት',
  subtitle              VARCHAR(200) DEFAULT 'ቤተ ክርስቲያን',
  primary_button_text   VARCHAR(100) DEFAULT 'Join Us This Sunday',
  primary_button_link   VARCHAR(200) DEFAULT '#contact',
  secondary_button_text VARCHAR(100) DEFAULT 'Watch Live',
  secondary_button_link VARCHAR(200) DEFAULT '#',
  background_type       VARCHAR(20)  DEFAULT 'gradient'
                        CHECK (background_type IN ('gradient','image','video')),
  background_image      TEXT,
  background_video      TEXT,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by            UUID REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO hero (title) VALUES ('አለም ባንክ ገነት') ON CONFLICT DO NOTHING;

-- ── ABOUT ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS about_sections (
  id          SERIAL PRIMARY KEY,
  section_key VARCHAR(20) NOT NULL UNIQUE
              CHECK (section_key IN ('mission','vision','story')),
  title       VARCHAR(200),
  description TEXT,
  icon        VARCHAR(10) DEFAULT '✝️',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO about_sections (section_key, title, icon) VALUES
  ('mission', 'Our Mission', '✝️'),
  ('vision',  'Our Vision',  '👁️'),
  ('story',   'Our Story',   '📖')
ON CONFLICT DO NOTHING;

-- ── SERMONS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sermons (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       VARCHAR(300) NOT NULL,
  series      VARCHAR(200),
  pastor      VARCHAR(100),
  description TEXT,
  youtube_url TEXT,
  thumbnail   VARCHAR(20) DEFAULT '🎥',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ── EVENTS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       VARCHAR(300) NOT NULL,
  description TEXT,
  event_date  DATE,
  event_time  VARCHAR(50),
  location    VARCHAR(300),
  image       VARCHAR(20) DEFAULT '📅',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ── MINISTRIES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ministries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  icon        VARCHAR(20) DEFAULT '🔥',
  color       VARCHAR(100) DEFAULT 'from-subtle-gold/20 to-deep-blue/20',
  sort_order  INTEGER DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ── GALLERY ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  src        VARCHAR(20) DEFAULT '🖼️',
  alt        VARCHAR(300),
  category   VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ── PRAYER REQUESTS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prayer_requests (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255),
  request    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── UPDATED_AT TRIGGER ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at          BEFORE UPDATE ON users          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER church_info_updated_at    BEFORE UPDATE ON church_info    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER hero_updated_at           BEFORE UPDATE ON hero           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER about_sections_updated_at BEFORE UPDATE ON about_sections FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER sermons_updated_at        BEFORE UPDATE ON sermons        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER events_updated_at         BEFORE UPDATE ON events         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER ministries_updated_at     BEFORE UPDATE ON ministries     FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── MEDIA UPLOADS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  public_id    TEXT NOT NULL,          -- Cloudinary public_id
  url          TEXT NOT NULL,          -- Cloudinary secure_url
  thumbnail_url TEXT,                  -- Cloudinary thumbnail (for videos)
  resource_type VARCHAR(10) NOT NULL   -- 'image' or 'video'
               CHECK (resource_type IN ('image','video')),
  original_name TEXT,
  width        INTEGER,
  height       INTEGER,
  duration     NUMERIC,               -- seconds, for video
  size_bytes   INTEGER,
  folder       VARCHAR(100),          -- e.g. 'gallery', 'hero', 'sermons'
  uploaded_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add pastor_id to prayer_requests
ALTER TABLE prayer_requests
  ADD COLUMN IF NOT EXISTS pastor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT true;

-- Add media_url columns to gallery (real images alongside emoji)
ALTER TABLE gallery
  ADD COLUMN IF NOT EXISTS media_url   TEXT,
  ADD COLUMN IF NOT EXISTS media_type  VARCHAR(10) DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS cloudinary_id TEXT;

-- Add media columns to hero
ALTER TABLE hero
  ADD COLUMN IF NOT EXISTS background_cloudinary_id TEXT;

-- Add thumbnail_url to sermons (real image)
ALTER TABLE sermons
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_cloudinary_id TEXT;
