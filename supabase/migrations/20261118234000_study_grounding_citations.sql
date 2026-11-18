-- Reclassify derived citation flags from preserved provider evidence. Raw answers,
-- prompts and citation URLs remain untouched; no paid calls are repeated.
UPDATE public.visibility_study_answers a SET cited=true
FROM public.visibility_study_runs r JOIN public.visibility_studies s ON s.id=r.study_id
WHERE a.run_id=r.id AND a.provider='gemini' AND a.status='succeeded' AND a.cited=false
AND EXISTS (
 SELECT 1 FROM jsonb_array_elements(a.citations) c
 WHERE c->>'url' LIKE 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/%'
 AND lower(trim(c->>'title')) ~ '^[a-z0-9.-]+$'
 AND (lower(trim(c->>'title'))=s.domain OR right(lower(trim(c->>'title')),length(s.domain)+1)='.'||s.domain)
);
