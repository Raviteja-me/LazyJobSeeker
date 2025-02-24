/*
  # Create processed resumes table

  1. New Tables
    - `processed_resumes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `job_title` (text)
      - `processed_at` (timestamptz)
      - `status` (text)
      - `download_url` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `processed_resumes` table
    - Add policies for:
      - Users can read their own processed resumes
      - Users can insert their own processed resumes
*/

CREATE TABLE IF NOT EXISTS processed_resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  job_title text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL CHECK (status IN ('completed', 'processing')),
  download_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
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

-- Create index for faster queries
CREATE INDEX processed_resumes_user_id_idx ON processed_resumes(user_id);
CREATE INDEX processed_resumes_processed_at_idx ON processed_resumes(processed_at);