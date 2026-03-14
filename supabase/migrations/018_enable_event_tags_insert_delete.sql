-- ============================================================================
-- 018_enable_event_tags_insert_delete.sql
--
-- Enable INSERT and DELETE operations on event_tags for authenticated users
-- (RLS policies control who can actually insert/delete based on event ownership)
-- ============================================================================

-- Grant INSERT and DELETE permissions to authenticated users
-- RLS policies will enforce that only event hosts/admins can actually insert/delete
GRANT INSERT, DELETE ON public.event_tags TO authenticated;
