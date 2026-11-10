-- La fonction de création de profil ne doit être appelée que par le déclencheur d'inscription
revoke execute on function public.handle_new_user() from public, anon, authenticated;
