-- ============================================
-- TIME CAPSULE DATABASE SCHEMA
-- Supabase PostgreSQL Setup
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Capsules table
CREATE TABLE capsules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    unlock_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_group BOOLEAN DEFAULT FALSE,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_email_sent_at TIMESTAMPTZ,
    reminder_email_sent_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT unlock_date_future CHECK (unlock_date > created_at)
);

-- Media table
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Index for faster queries
    CONSTRAINT media_capsule_fk FOREIGN KEY (capsule_id) REFERENCES capsules(id) ON DELETE CASCADE
);

-- Capsule members table (for group capsules)
CREATE TABLE capsule_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique membership
    UNIQUE(capsule_id, user_id)
);

-- ============================================
-- INDEXES for Performance
-- ============================================

CREATE INDEX idx_capsules_owner ON capsules(owner_id);
CREATE INDEX idx_capsules_unlock_date ON capsules(unlock_date);
CREATE INDEX idx_capsules_reminder_sent ON capsules(reminder_email_sent_at);
CREATE INDEX idx_media_capsule ON media(capsule_id);
CREATE INDEX idx_capsule_members_user ON capsule_members(user_id);
CREATE INDEX idx_capsule_members_capsule ON capsule_members(capsule_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsule_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CAPSULES POLICIES
-- ============================================

-- Users can view their own capsules
CREATE POLICY "Users can view own capsules"
    ON capsules FOR SELECT
    USING (auth.uid() = owner_id);

-- Users can view capsules they are members of
CREATE POLICY "Users can view shared capsules"
    ON capsules FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM capsule_members
            WHERE capsule_members.capsule_id = capsules.id
            AND capsule_members.user_id = auth.uid()
        )
    );

-- Users can create their own capsules
CREATE POLICY "Users can create capsules"
    ON capsules FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- Users can update their own capsules (only before unlock)
CREATE POLICY "Users can update own capsules"
    ON capsules FOR UPDATE
    USING (auth.uid() = owner_id AND unlock_date > NOW())
    WITH CHECK (auth.uid() = owner_id);

-- Users can delete their own capsules
CREATE POLICY "Users can delete own capsules"
    ON capsules FOR DELETE
    USING (auth.uid() = owner_id);

-- ============================================
-- MEDIA POLICIES
-- ============================================

-- Users can view media in capsules they have access to
CREATE POLICY "Users can view accessible media"
    ON media FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM capsules
            WHERE capsules.id = media.capsule_id
            AND (
                capsules.owner_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM capsule_members
                    WHERE capsule_members.capsule_id = capsules.id
                    AND capsule_members.user_id = auth.uid()
                )
            )
        )
    );

-- Users can add media to capsules they own (before unlock)
CREATE POLICY "Users can add media to own capsules"
    ON media FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM capsules
            WHERE capsules.id = media.capsule_id
            AND capsules.owner_id = auth.uid()
            AND capsules.unlock_date > NOW()
        )
    );

-- Users can delete media from their own capsules (before unlock)
CREATE POLICY "Users can delete own media"
    ON media FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM capsules
            WHERE capsules.id = media.capsule_id
            AND capsules.owner_id = auth.uid()
            AND capsules.unlock_date > NOW()
        )
    );

-- ============================================
-- CAPSULE MEMBERS POLICIES
-- ============================================

-- Users can view members of capsules they own or are members of
CREATE POLICY "Users can view capsule members"
    ON capsule_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM capsules
            WHERE capsules.id = capsule_members.capsule_id
            AND (
                capsules.owner_id = auth.uid()
                OR capsule_members.user_id = auth.uid()
            )
        )
    );

-- Only capsule owners can add members
CREATE POLICY "Owners can add members"
    ON capsule_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM capsules
            WHERE capsules.id = capsule_members.capsule_id
            AND capsules.owner_id = auth.uid()
        )
    );

-- Only capsule owners can remove members
CREATE POLICY "Owners can remove members"
    ON capsule_members FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM capsules
            WHERE capsules.id = capsule_members.capsule_id
            AND capsules.owner_id = auth.uid()
        )
    );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if a capsule is unlocked
CREATE OR REPLACE FUNCTION is_capsule_unlocked(capsule_unlock_date TIMESTAMPTZ)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN capsule_unlock_date <= NOW();
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- STORAGE BUCKET SETUP (Run in Supabase Dashboard)
-- ============================================

-- Create storage bucket for capsule media
-- This should be done via Supabase Dashboard:
-- 1. Go to Storage
-- 2. Create new bucket named "capsule-media"
-- 3. Set to PRIVATE (not public)
-- 4. Enable RLS

-- Storage RLS Policies (apply in Supabase Dashboard SQL editor):
-- Users can upload to their own folder
-- Users can only access media from unlocked capsules they have access to

-- ============================================
-- OPTIONAL MIGRATION FOR EXISTING DATABASES
-- ============================================

-- Add notification tracking columns if missing
-- ALTER TABLE capsules ADD COLUMN IF NOT EXISTS created_email_sent_at TIMESTAMPTZ;
-- ALTER TABLE capsules ADD COLUMN IF NOT EXISTS reminder_email_sent_at TIMESTAMPTZ;
-- CREATE INDEX IF NOT EXISTS idx_capsules_reminder_sent ON capsules(reminder_email_sent_at);
