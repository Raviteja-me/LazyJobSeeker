/*
  # Add Storage Bucket and Resume URLs

  1. Storage
    - Create 'resumes' bucket for storing resume files
    - Enable public access for resume downloads
    - Set up security policies

  2. Table Updates
    - Add URL columns to processed_resumes table:
      - original_resume_url
      - job_url
*/

-- Create the resumes storage bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('resumes', 'resumes', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Create storage policies for the resumes bucket
CREATE POLICY "Users can upload own resumes"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read own resumes"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add URL columns to processed_resumes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'processed_resumes' 
    AND column_name = 'original_resume_url'
  ) THEN
    ALTER TABLE processed_resumes ADD COLUMN original_resume_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'processed_resumes' 
    AND column_name = 'job_url'
  ) THEN
    ALTER TABLE processed_resumes ADD COLUMN job_url text;
  END IF;
END $$;