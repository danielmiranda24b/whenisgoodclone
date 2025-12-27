-- ============================================
-- Practice Scheduler - Complete Database Setup
-- ============================================
-- Run this entire file in Supabase SQL Editor
-- This will create the schema, tables, and RLS policies

-- Step 1: Create the custom schema
CREATE SCHEMA IF NOT EXISTS practice_scheduler;

-- Step 2: Create the events table
CREATE TABLE IF NOT EXISTS practice_scheduler.events (
    id VARCHAR PRIMARY KEY,
    title TEXT NOT NULL,
    dates JSONB NOT NULL,
    time_slots JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Step 3: Create the responses table
CREATE TABLE IF NOT EXISTS practice_scheduler.responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR NOT NULL REFERENCES practice_scheduler.events(id) ON DELETE CASCADE,
    participant_name TEXT NOT NULL,
    selected_slots JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Step 4: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_responses_event_id ON practice_scheduler.responses(event_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON practice_scheduler.events(created_at);
CREATE INDEX IF NOT EXISTS idx_responses_created_at ON practice_scheduler.responses(created_at);

-- Step 5: Enable Row Level Security (RLS) on both tables
ALTER TABLE practice_scheduler.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_scheduler.responses ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for the events table
-- Allow anyone to read events
CREATE POLICY "Allow public read access to events"
ON practice_scheduler.events
FOR SELECT
USING (true);

-- Allow anyone to create events (for the app's ensureEvent function)
CREATE POLICY "Allow public insert access to events"
ON practice_scheduler.events
FOR INSERT
WITH CHECK (true);

-- Step 7: Create RLS policies for the responses table
-- Allow anyone to read responses (for the group view)
CREATE POLICY "Allow public read access to responses"
ON practice_scheduler.responses
FOR SELECT
USING (true);

-- Allow anyone to submit responses (for participant submissions)
CREATE POLICY "Allow public insert access to responses"
ON practice_scheduler.responses
FOR INSERT
WITH CHECK (true);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- After running this migration, verify everything works:

-- Check that tables exist:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'practice_scheduler';

-- Check that RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'practice_scheduler';

-- Check that policies exist:
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'practice_scheduler';
