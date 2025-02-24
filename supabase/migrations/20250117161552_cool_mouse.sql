/*
  # Fix processed_resumes table and policies

  1. Changes
    - Add trigger for updated_at timestamp
    - Add better constraints and defaults
    - Improve RLS policies
    - Add indexes for performance

  2. Security
    - Ensure proper RLS policies
    - Add validation constraints
*/

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_processed_resumes_updated_at ON processed_resumes;

-- Create trigger for updated_at
CREATE TRIGGER update_processed_resumes_updated_at
    BEFORE UPDATE ON processed_resumes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add better constraints and defaults
ALTER TABLE processed_resumes
  ALTER COLUMN status SET DEFAULT 'processing',
  ALTER COLUMN job_title SET DEFAULT '',
  ADD CONSTRAINT processed_resumes_job_title_length CHECK (length(job_title) <= 255),
  ADD CONSTRAINT processed_resumes_status_valid CHECK (status IN ('completed', 'processing')),
  ADD CONSTRAINT processed_resumes_download_url_valid CHECK (download_url IS NULL OR length(download_url) <= 2048),
  ADD CONSTRAINT processed_resumes_job_url_valid CHECK (job_url IS NULL OR length(job_url) <= 2048),
  ADD CONSTRAINT processed_resumes_original_resume_url_valid CHECK (original_resume_url IS NULL OR length(original_resume_url) <= 2048);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own processed resumes" ON processed_resumes;
DROP POLICY IF EXISTS "Users can insert own processed resumes" ON processed_resumes;

-- Create improved policies
CREATE POLICY "Users can read own processed resumes"
  ON processed_resumes
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
  );

CREATE POLICY "Users can insert own processed resumes"
  ON processed_resumes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    length(job_title) <= 255
  );

CREATE POLICY "Users can update own processed resumes"
  ON processed_resumes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    length(job_title) <= 255 AND
    status IN ('completed', 'processing')
  );

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_processed_resumes_user_status
  ON processed_resumes(user_id, status, processed_at DESC);