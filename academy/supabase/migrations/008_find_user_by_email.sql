-- Função RPC para encontrar user_id por email
-- Necessária para admin criar vendas manuais
CREATE OR REPLACE FUNCTION find_user_by_email(p_email TEXT)
RETURNS UUID AS $$
  SELECT id FROM auth.users WHERE email = p_email LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Grant execute para authenticated users (admins)
GRANT EXECUTE ON FUNCTION find_user_by_email(TEXT) TO authenticated;
