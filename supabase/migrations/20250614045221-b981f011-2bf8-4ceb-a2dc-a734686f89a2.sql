
-- Add sort_order column to user_tasks table for drag and drop functionality
ALTER TABLE public.user_tasks 
ADD COLUMN IF NOT EXISTS sort_order integer;

-- Set default sort_order values for existing tasks based on created_at
UPDATE public.user_tasks 
SET sort_order = subquery.row_number - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as row_number
  FROM public.user_tasks
  WHERE sort_order IS NULL
) AS subquery
WHERE public.user_tasks.id = subquery.id;

-- Set default value for future inserts
ALTER TABLE public.user_tasks 
ALTER COLUMN sort_order SET DEFAULT 0;
