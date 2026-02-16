
-- Create trigger to auto-grant admin to first registered user
CREATE TRIGGER on_profile_created_first_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_first_admin();
