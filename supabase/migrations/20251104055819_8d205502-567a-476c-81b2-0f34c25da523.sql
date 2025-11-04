-- Create logs table
CREATE TABLE public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create tags table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6D28D9',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, name)
);

-- Create log_tags junction table
CREATE TABLE public.log_tags (
  log_id UUID REFERENCES public.logs(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (log_id, tag_id)
);

-- Create insights cache table
CREATE TABLE public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, week_start)
);

-- Enable RLS
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for logs
CREATE POLICY "Users can view their own logs"
ON public.logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own logs"
ON public.logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs"
ON public.logs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs"
ON public.logs FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for tags
CREATE POLICY "Users can view their own tags"
ON public.tags FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tags"
ON public.tags FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
ON public.tags FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
ON public.tags FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for log_tags
CREATE POLICY "Users can view their own log_tags"
ON public.log_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.logs
    WHERE logs.id = log_tags.log_id
    AND logs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own log_tags"
ON public.log_tags FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.logs
    WHERE logs.id = log_tags.log_id
    AND logs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own log_tags"
ON public.log_tags FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.logs
    WHERE logs.id = log_tags.log_id
    AND logs.user_id = auth.uid()
  )
);

-- RLS Policies for insights
CREATE POLICY "Users can view their own insights"
ON public.insights FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insights"
ON public.insights FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
ON public.insights FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for automatic timestamp updates on logs
CREATE TRIGGER update_logs_updated_at
BEFORE UPDATE ON public.logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_logs_user_id ON public.logs(user_id);
CREATE INDEX idx_logs_date ON public.logs(date DESC);
CREATE INDEX idx_tags_user_id ON public.tags(user_id);
CREATE INDEX idx_log_tags_log_id ON public.log_tags(log_id);
CREATE INDEX idx_log_tags_tag_id ON public.log_tags(tag_id);
CREATE INDEX idx_insights_user_id ON public.insights(user_id);
CREATE INDEX idx_insights_week_start ON public.insights(week_start DESC);