/*
  # Fix processed_resumes table structure and constraints

  1. Changes
    - Drop and recreate table with proper structure
    - Add proper constraints and defaults
    - Add better indexes
    - Improve RLS policies

  2. Security
    - Ensure proper RLS policies
    - Add validation constraints
*/

-- Drop existing table and recreate with proper structure
DROP TABLE IF EXISTS processed_resumes CASCADE;

CREATE TABLE processed_resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title text NOT NULL DEFAULT '',
  job_url text CHECK (job_url IS NULL OR length(job_url) <= 2048),
  original_resume_url text CHECK (original_resume_url IS NULL OR length(original_resume_url) <= 2048),
  download_url text CHECK (download_url IS NULL OR length(download_url) <= 2048),
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('completed', 'processing')),
  processed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT processed_resumes_job_title_length CHECK (length(job_title) <= 255)
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_processed_resumes_updated_at
    BEFORE UPDATE ON processed_resumes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE processed_resumes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own processed resumes"
  ON processed_resumes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own processed resumes"
  ON processed_resumes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own processed resumes"
  ON processed_resumes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_processed_resumes_user_id ON processed_resumes(user_id);
CREATE INDEX idx_processed_resumes_status ON processed_resumes(status);
CREATE INDEX idx_processed_resumes_processed_at ON processed_resumes(processed_at DESC);
CREATE INDEX idx_processed_resumes_user_status_processed 
  ON processed_resumes(user_id, status, processed_at DESC);