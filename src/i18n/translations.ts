export type Language = "pt" | "en" | "es";

export interface Translations {
  // Navigation
  nav_home: string;
  nav_activities: string;
  nav_card: string;
  nav_benefits: string;
  nav_profile: string;

  // Home / Feed
  feed_welcome: string;
  feed_title: string;
  feed_tagline: string;
  feed_search_placeholder: string;
  feed_search_colleagues_title: string;
  feed_leaderboard_title: string;
  feed_card_member: string;
  feed_card_category: string;
  feed_unlocked_restaurants: string;
  feed_all_restaurants_unlocked: string;
  feed_posts_count: string;
  feed_post_singular: string;
  feed_loading: string;
  feed_empty_title: string;
  feed_no_posts: string;
  feed_publish_now: string;
  feed_like: string;
  feed_likes: string;
  feed_comment: string;
  feed_comments: string;
  feed_share: string;
  feed_new_post_btn: string;

  // Profile
  profile_title: string;
  profile_edit: string;
  profile_wellness_title: string;
  profile_screen_today: string;
  profile_goal: string;
  profile_no_data: string;
  profile_usage_access: string;
  profile_waiting_sync: string;
  profile_grant_usage_desc: string;
  profile_grant_access_btn: string;
  profile_limit_percentage: string;
  profile_activities_week: string;
  profile_this_week: string;
  profile_streak: string;
  profile_consecutive_days: string;
  profile_consecutive_day: string;
  profile_wellness: string;
  profile_score: string;
  profile_achievements_title: string;
  profile_unlocked_count: string;
  profile_view_all: string;
  profile_admin_panel: string;
  profile_admin_sub: string;
  profile_my_posts_title: string;
  profile_refresh: string;
  profile_loading_my_posts: string;
  profile_no_my_posts_title: string;
  profile_no_my_posts_desc: string;
  profile_delete_post_title: string;
  profile_settings_title: string;
  profile_language_title: string;
  profile_language_sub: string;
  profile_prioritize_following: string;
  profile_prioritize_following_sub: string;
  profile_permissions_title: string;
  profile_permissions_sub: string;
  profile_perm_notifications: string;
  profile_perm_notifications_desc: string;
  profile_perm_usage: string;
  profile_perm_usage_desc: string;
  profile_perm_location: string;
  profile_perm_location_desc: string;
  profile_perm_media: string;
  profile_perm_media_desc: string;
  profile_authorize: string;
  profile_active: string;
  profile_granted: string;
  profile_test: string;
  profile_breathing_title: string;
  profile_breathing_sub: string;
  profile_breathing_freq: string;
  profile_breathing_custom: string;
  profile_night_title: string;
  profile_night_sub: string;
  profile_night_until: string;
  profile_screenlimit_title: string;
  profile_screenlimit_goal: string;
  profile_tip_text: string;
  profile_logout: string;
  profile_photo_modal_title: string;
  profile_photo_modal_sub: string;
  profile_photo_camera: string;
  profile_photo_gallery: string;
  profile_photo_cancel: string;

  // Peer User Profile
  user_focus_time: string;
  user_streak: string;
  user_points: string;
  user_follow: string;
  user_following: string;
  user_unfollow: string;
  user_incentive_btn: string;
  user_incentive_limit: string;
  user_incentive_sent: string;
  user_achievements: string;
  user_recent_posts: string;
  user_no_posts: string;
  user_loading_posts: string;

  // Activities (Pomodoro & Goals)
  act_title: string;
  act_subtitle: string;
  act_focus_mode: string;
  act_short_break: string;
  act_long_break: string;
  act_start_focus: string;
  act_pause: string;
  act_reset: string;
  act_adjust_time: string;
  act_goals_progress_title: string;
  act_total_goals: string;
  act_active_goal: string;
  act_active_goals: string;
  act_completed_goals: string;
  act_performance: string;
  act_all_completed: string;
  act_progress_summary: string;
  act_your_goals_title: string;
  act_new_goal_btn: string;
  act_daily_challenges: string;
  act_weekly_challenges: string;
  act_monthly_challenges: string;
  act_empty_category: string;

  // Card
  card_screen_title: string;
  card_app_title: string;
  card_edition: string;
  card_level_prefix: string;
  card_holder: string;
  card_course_dept: string;
  card_number: string;
  card_security_note: string;
  card_qr_title: string;
  card_qr_hint: string;
  card_view_digital: string;
  card_member: string;
  card_category: string;

  // Benefits
  benefits_screen_title: string;
  benefits_open_card_btn: string;
  benefits_partners_title: string;
  benefits_summary: string;
  benefits_off: string;
  benefits_level: string;
  benefits_unlocked: string;
  benefits_unlock_hint: string;
  benefits_next_goal_title: string;
  benefits_next_goal_desc: string;
  benefits_all_partners_unlocked: string;
  benefits_title: string;
  benefits_subtitle: string;
  benefits_partner_discount: string;

  // Leaderboard
  leaderboard_title: string;
  leaderboard_subtitle: string;
  leaderboard_cached_notice: string;
  leaderboard_loading: string;
  leaderboard_empty_title: string;
  leaderboard_empty_desc: string;
  leaderboard_pts: string;

  // Search Users
  search_screen_title: string;
  search_input_placeholder: string;
  search_filter_all: string;
  search_filter_following: string;
  search_loading: string;
  search_empty_title: string;
  search_empty_desc: string;
  search_no_results: string;
  search_pts: string;

  // Edit Profile
  edit_screen_title: string;
  edit_avatar_title: string;
  edit_change_photo: string;
  edit_personal_info: string;
  edit_fullname: string;
  edit_email: string;
  edit_phone: string;
  edit_cpf: string;
  edit_city: string;
  edit_detect_location: string;
  edit_detecting: string;
  edit_save_btn: string;
  edit_saving: string;
  edit_success: string;

  // Auth (Login / SignUp / Forgot)
  auth_welcome_back: string;
  auth_continue_journey: string;
  auth_email: string;
  auth_password: string;
  auth_forgot_password: string;
  auth_login_btn: string;
  auth_logging_in: string;
  auth_or_continue_with: string;
  auth_continue_google: string;
  auth_continue_apple: string;
  auth_no_account: string;
  auth_create_account: string;
  auth_error_fill_fields: string;
  auth_error_invalid_credentials: string;

  auth_signup_title: string;
  auth_signup_sub: string;
  auth_fullname: string;
  auth_phone: string;
  auth_confirm_password: string;
  auth_choose_avatar: string;
  auth_upload_custom_photo: string;
  auth_terms_label: string;
  auth_terms_desc: string;
  auth_register_btn: string;
  auth_registering: string;
  auth_have_account: string;
  auth_enter_link: string;
  auth_error_passwords_mismatch: string;
  auth_error_password_length: string;

  auth_recovery_title: string;
  auth_recovery_sub: string;
  auth_recovery_send_btn: string;
  auth_recovery_sending: string;
  auth_recovery_back_login: string;
  auth_recovery_success: string;

  // Modals
  post_modal_title: string;
  post_modal_sub: string;
  post_category_label: string;
  post_placeholder: string;
  post_add_photo: string;
  post_remove_photo: string;
  post_cancel: string;
  post_publish_btn: string;
  post_publishing: string;
  cat_nature: string;
  cat_focus: string;
  cat_games: string;
  cat_reading: string;

  comments_modal_title: string;
  comments_post_by: string;
  comments_empty_title: string;
  comments_empty_sub: string;
  comments_placeholder: string;
  comments_send_btn: string;

  pomodoro_modal_title: string;
  pomodoro_modal_sub: string;
  pomodoro_focus_label: string;
  pomodoro_short_break_label: string;
  pomodoro_long_break_label: string;
  pomodoro_daily_goal_label: string;
  pomodoro_restore_default: string;
  pomodoro_save: string;

  meta_modal_edit_title: string;
  meta_modal_new_title: string;
  meta_modal_sub: string;
  meta_title_label: string;
  meta_title_placeholder: string;
  meta_period_label: string;
  meta_period_daily: string;
  meta_period_weekly: string;
  meta_period_monthly: string;
  meta_points_label: string;
  meta_save_btn: string;
  meta_create_btn: string;

  achievements_modal_title: string;
  achievements_modal_sub: string;
  achievements_manage_btn: string;
  achievements_unlocked_date: string;
  achievements_progress: string;
  achievements_none: string;

  admin_modal_title: string;
  admin_modal_sub: string;
  admin_search_placeholder: string;
  admin_total_users: string;
  admin_admins_count: string;
  admin_active_count: string;
  admin_reset_password: string;
  admin_delete_user: string;

  unfollow_title: string;
  unfollow_confirm_text: string;
  unfollow_btn: string;
  unfollow_cancel_btn: string;

  chatbot_title: string;
  chatbot_sub: string;
  chatbot_clear: string;
  chatbot_suggested: string;
  chatbot_placeholder: string;
  chatbot_welcome: string;
  chatbot_connecting: string;
  chatbot_assistant_tag: string;
  chatbot_error_retry: string;

  // Additional Modal Helpers
  post_sharing_with_community: string;
  post_choose_theme: string;
  post_change_photo: string;
  post_upload_photo: string;
  post_chars: string;
  post_add_photo_title: string;
  post_add_photo_sub: string;
  post_optimizing_image: string;

  user_featured_achievements: string;
  user_wall_posts: string;
  user_no_posts: string;
  user_loading_posts: string;
  user_likes_count: string;
  user_comments_count: string;
  user_incentive_sent_alert: string;
  user_level_badge: string;

  achievements_unlocked_count: string;
  achievements_loading: string;
  achievements_admin_new: string;
  achievements_admin_edit: string;

  admin_users_title: string;
  admin_users_count: string;
  admin_loading_users: string;
  admin_no_users_found: string;
  admin_status_active: string;
  admin_status_inactive: string;
  admin_change_password: string;
  admin_deactivate: string;
  admin_activate: string;

  // PWA
  pwa_banner_title: string;
  pwa_banner_sub: string;
  pwa_install_btn: string;
  pwa_ios_modal_title: string;
  pwa_ios_modal_desc: string;
  pwa_ios_step_1: string;
  pwa_ios_step_2: string;
  pwa_manual_instruction: string;

  // Common
  common_save: string;
  common_cancel: string;
  common_confirm: string;
  common_close: string;
  common_back: string;
  common_loading: string;
  common_success: string;
  common_error: string;
  common_hours: string;
  common_minutes: string;
  common_days: string;
}

export const translations: Record<Language, Translations> = {
  pt: {
    nav_home: "Início",
    nav_activities: "Atividades",
    nav_card: "Carteirinha",
    nav_benefits: "Benefícios",
    nav_profile: "Perfil",

    feed_welcome: "Bem-vindo(a),",
    feed_title: "Feed da Comunidade",
    feed_tagline: "O mural da feira está aberto!",
    feed_search_placeholder: "Buscar colegas por nome, curso ou e-mail...",
    feed_search_colleagues_title: "Buscar Colegas para Seguir",
    feed_leaderboard_title: "Ver Pódio",
    feed_card_member: "MEMBRO ATIVO",
    feed_card_category: "Benefícios Progressivos",
    feed_unlocked_restaurants: "restaurante(s) para desbloquear",
    feed_all_restaurants_unlocked: "Todos os restaurantes parceiros desbloqueados!",
    feed_posts_count: "publicações",
    feed_post_singular: "publicação",
    feed_loading: "Carregando publicações...",
    feed_empty_title: "Nenhuma publicação ainda.",
    feed_no_posts: "Seja o primeiro a compartilhar uma conquista, foto ou momento de desconexão!",
    feed_publish_now: "Publicar Agora",
    feed_like: "Curtir",
    feed_likes: "curtidas",
    feed_comment: "Comentar",
    feed_comments: "comentários",
    feed_share: "Compartilhar",
    feed_new_post_btn: "Criar novo post",

    profile_title: "Perfil",
    profile_edit: "Editar Perfil",
    profile_wellness_title: "Relatórios de Bem-estar",
    profile_screen_today: "Tela Hoje",
    profile_goal: "Meta",
    profile_no_data: "Sem dados",
    profile_usage_access: "Acesso de Uso",
    profile_waiting_sync: "Aguardando sincronização de tela...",
    profile_grant_usage_desc: "Libere o acesso de uso nas configurações para ver horas reais.",
    profile_grant_access_btn: "Liberar Acesso",
    profile_limit_percentage: "do limite diário",
    profile_activities_week: "Atividades",
    profile_this_week: "esta semana",
    profile_streak: "Sequência",
    profile_consecutive_days: "dias consecutivos",
    profile_consecutive_day: "dia consecutivo",
    profile_wellness: "Bem-estar",
    profile_score: "pontuação",
    profile_achievements_title: "Minhas Conquistas",
    profile_unlocked_count: "desbloqueadas",
    profile_view_all: "Ver todas",
    profile_admin_panel: "Painel de Gestão de Usuários",
    profile_admin_sub: "Controlar, apagar, desativar e redefinir senhas",
    profile_my_posts_title: "Minhas Publicações",
    profile_refresh: "Atualizar",
    profile_loading_my_posts: "Carregando suas publicações...",
    profile_no_my_posts_title: "Você ainda não publicou no mural",
    profile_no_my_posts_desc: "Compartilhe fotos e conquistas na tela de Início para registrar seus momentos!",
    profile_delete_post_title: "Excluir minha publicação",
    profile_settings_title: "Configuração de Alertas e Pausas",
    profile_language_title: "Idioma do Aplicativo",
    profile_language_sub: "Selecione o idioma de sua preferência",
    profile_prioritize_following: "Priorizar Quem Você Segue",
    profile_prioritize_following_sub: "Mostrar primeiro no Feed",
    profile_permissions_title: "Permissões do Dispositivo",
    profile_permissions_sub: "Integração nativa com Web / Mobile",
    profile_perm_notifications: "Notificações",
    profile_perm_notifications_desc: "Lembretes e avisos do app",
    profile_perm_usage: "Acesso de Uso",
    profile_perm_usage_desc: "Tempo de tela real no Android",
    profile_perm_location: "Localização GPS",
    profile_perm_location_desc: "Cidade no perfil do usuário",
    profile_perm_media: "Câmera & Galeria",
    profile_perm_media_desc: "Fotos de perfil e publicações",
    profile_authorize: "Autorizar",
    profile_active: "Ativo",
    profile_granted: "Liberado",
    profile_test: "Testar",
    profile_breathing_title: "Lembretes de Respiro",
    profile_breathing_sub: "Pausas conscientes",
    profile_breathing_freq: "Frequência do lembrete:",
    profile_breathing_custom: "Tempo personalizado (min):",
    profile_night_title: "Modo Noturno Digital",
    profile_night_sub: "Horário de silêncio",
    profile_night_until: "até",
    profile_screenlimit_title: "Limite de Tela Diário",
    profile_screenlimit_goal: "Meta diária",
    profile_tip_text: "Pausas regulares ajudam a reduzir ansiedade e melhorar seu bem-estar digital.",
    profile_logout: "Sair da Conta",
    profile_photo_modal_title: "Foto de Perfil",
    profile_photo_modal_sub: "Escolha como deseja atualizar sua foto",
    profile_photo_camera: "Tirar Foto com a Câmera",
    profile_photo_gallery: "Escolher da Galeria de Fotos",
    profile_photo_cancel: "Cancelar",

    user_focus_time: "Foco Off",
    user_streak: "Sequência",
    user_points: "Pontos",
    user_follow: "Seguir Colega",
    user_following: "Seguindo",
    user_unfollow: "Deixar de Seguir",
    user_incentive_btn: "Incentivar Colega",
    user_incentive_limit: "Limite atingido (0/3 na hora)",
    user_incentive_sent: "Incentivo enviado! 🎉",
    user_achievements: "Conquistas em Destaque",
    user_recent_posts: "Publicações no Mural",
    user_no_posts: "Nenhuma publicação feita ainda por este colega.",
    user_loading_posts: "Carregando publicações...",

    act_title: "Pomodoro & Foco",
    act_subtitle: "Tempo de Foco & Hábitos Conscientes",
    act_focus_mode: "Foco",
    act_short_break: "Pausa Curta",
    act_long_break: "Pausa Longa",
    act_start_focus: "Iniciar Foco",
    act_pause: "Pausar",
    act_reset: "Reiniciar",
    act_adjust_time: "Ajustar Tempos do Pomodoro",
    act_goals_progress_title: "Progresso de Metas",
    act_total_goals: "Total de Metas",
    act_active_goal: "meta ativa",
    act_active_goals: "metas ativas",
    act_completed_goals: "Concluídas",
    act_performance: "Aproveitamento das Metas",
    act_all_completed: "Parabéns! Todas as metas desta seção foram concluídas! 🎉",
    act_progress_summary: "Você completou {completed} de {total} metas. Continue firme!",
    act_your_goals_title: "🎯 Suas Metas",
    act_new_goal_btn: "Nova Meta",
    act_daily_challenges: "Diárias",
    act_weekly_challenges: "Semanais",
    act_monthly_challenges: "Mensais",
    act_empty_category: "Nenhuma meta cadastrada nesta categoria.",

    card_screen_title: "Carteirinha Digital",
    card_app_title: "LibertApp",
    card_edition: "Feira Acadêmica 2026",
    card_level_prefix: "NV",
    card_holder: "Estudante Titular",
    card_course_dept: "Curso / Departamento",
    card_number: "Nº da Carteira",
    card_security_note: "VÁLIDA PARA IDENTIFICAÇÃO E DESCONTOS NOS ESTABELECIMENTOS",
    card_qr_title: "Código QR de Validação",
    card_qr_hint: "Apresente este código ao estabelecimento conveniado",
    card_view_digital: "Ver Carteirinha",
    card_member: "MEMBRO ATIVO",
    card_category: "Benefícios Progressivos",

    benefits_screen_title: "Meus Benefícios",
    benefits_open_card_btn: "📱 Abrir Carteirinha Digital",
    benefits_partners_title: "Restaurantes Parceiros",
    benefits_summary: "Desbloqueados: {unlocked} de {total} • Nível atual: {level} ({points} pts)",
    benefits_off: "OFF",
    benefits_level: "Nível",
    benefits_unlocked: "Desbloqueado",
    benefits_unlock_hint: "Desbloqueie com mais pontos",
    benefits_next_goal_title: "Próxima meta 🎯",
    benefits_next_goal_desc: "Acumule pontos no Pomodoro e desafios para atingir o Nível {level} e desbloquear \"{name}\" com {discount}% de desconto!",
    benefits_all_partners_unlocked: "🎉 Parabéns! Você atingiu o nível máximo e desbloqueou todos os parceiros oficiais da feira!",
    benefits_title: "Benefícios",
    benefits_subtitle: "Parceiros conveniados",
    benefits_partner_discount: "Desconto garantido",

    leaderboard_title: "Pódio de Conquistas",
    leaderboard_subtitle: "Destaque dos hábitos conscientes na feira",
    leaderboard_cached_notice: "Mostrando ranking salvo no dispositivo — sem conexão central.",
    leaderboard_loading: "Carregando ranking oficial...",
    leaderboard_empty_title: "O pódio está à sua espera!",
    leaderboard_empty_desc: "Nenhum participante acumulou pontos ainda. Complete sessões no Pomodoro para inaugurar o 1º lugar!",
    leaderboard_pts: "pts",

    search_screen_title: "Buscar Colegas",
    search_input_placeholder: "Buscar por nome, curso ou interesse...",
    search_filter_all: "Todos",
    search_filter_following: "Quem sigo",
    search_loading: "Buscando colegas...",
    search_empty_title: "Encontre seus amigos",
    search_empty_desc: "Digite um nome para começar a seguir e trocar incentivos.",
    search_no_results: "Nenhum colega encontrado com esse termo.",
    search_pts: "pontos",

    edit_screen_title: "Editar Perfil",
    edit_avatar_title: "Foto de Perfil",
    edit_change_photo: "Alterar Foto",
    edit_personal_info: "Dados Pessoais",
    edit_fullname: "Nome Completo",
    edit_email: "E-mail Institucional",
    edit_phone: "Telefone / WhatsApp",
    edit_cpf: "CPF",
    edit_city: "Cidade / Campus",
    edit_detect_location: "Detectar Cidade via GPS",
    edit_detecting: "Detectando...",
    edit_save_btn: "Salvar Alterações",
    edit_saving: "Salvando...",
    edit_success: "Perfil atualizado com sucesso!",

    auth_welcome_back: "Bem-vinda de volta",
    auth_continue_journey: "Continue sua jornada de liberdade.",
    auth_email: "E-mail",
    auth_password: "Senha",
    auth_forgot_password: "Esqueci minha senha",
    auth_login_btn: "Entrar",
    auth_logging_in: "Entrando...",
    auth_or_continue_with: "ou continue com",
    auth_continue_google: "Continuar com Google",
    auth_continue_apple: "Continuar com Apple",
    auth_no_account: "Não tem conta?",
    auth_create_account: "Criar conta",
    auth_error_fill_fields: "Por favor, preencha e-mail e senha.",
    auth_error_invalid_credentials: "E-mail ou senha incorretos.",

    auth_signup_title: "Criar Conta",
    auth_signup_sub: "Junte-se à comunidade de presença e foco.",
    auth_fullname: "Nome Completo",
    auth_phone: "Telefone",
    auth_confirm_password: "Confirmar Senha",
    auth_choose_avatar: "Escolha seu Avatar",
    auth_upload_custom_photo: "Enviar foto personalizada",
    auth_terms_label: "Termos e Condições",
    auth_terms_desc: "Concordo com as diretrizes da comunidade e uso de dados.",
    auth_register_btn: "Cadastrar",
    auth_registering: "Cadastrando...",
    auth_have_account: "Já tem conta?",
    auth_enter_link: "Entrar",
    auth_error_passwords_mismatch: "As senhas não coincidem.",
    auth_error_password_length: "A senha deve ter pelo menos 6 caracteres.",

    auth_recovery_title: "Recuperar Senha",
    auth_recovery_sub: "Digite seu e-mail cadastrado para redefinir o acesso.",
    auth_recovery_send_btn: "Enviar Link de Recuperação",
    auth_recovery_sending: "Enviando...",
    auth_recovery_back_login: "Voltar para o Login",
    auth_recovery_success: "Instruções enviadas para o seu e-mail!",

    post_modal_title: "Nova Publicação",
    post_modal_sub: "Compartilhe uma conquista, reflexão ou momento saudável",
    post_category_label: "Categoria",
    post_placeholder: "O que você gostaria de compartilhar com a comunidade?",
    post_add_photo: "Adicionar Imagem",
    post_remove_photo: "Remover foto",
    post_cancel: "Cancelar",
    post_publish_btn: "Publicar",
    post_publishing: "Publicando...",
    cat_nature: "Natureza & Ar Livre",
    cat_focus: "Foco & Atenção",
    cat_games: "Gincana & Jogos",
    cat_reading: "Leitura & Estudo",

    comments_modal_title: "Comentários",
    comments_post_by: "Publicação de",
    comments_empty_title: "Nenhum comentário ainda",
    comments_empty_sub: "Seja o primeiro a interagir!",
    comments_placeholder: "Escreva um comentário carinhoso...",
    comments_send_btn: "Enviar",

    pomodoro_modal_title: "Configurar Pomodoro",
    pomodoro_modal_sub: "Personalize seus tempos de foco e descanso",
    pomodoro_focus_label: "Tempo de Foco (min)",
    pomodoro_short_break_label: "Pausa Curta (min)",
    pomodoro_long_break_label: "Pausa Longa (min)",
    pomodoro_daily_goal_label: "Meta Diária de Sessões",
    pomodoro_restore_default: "Restaurar Padrão",
    pomodoro_save: "Salvar Configuração",

    meta_modal_edit_title: "Editar Meta",
    meta_modal_new_title: "Nova Meta",
    meta_modal_sub: "Defina uma meta consciente para seu dia a dia",
    meta_title_label: "Título da Meta",
    meta_title_placeholder: "Ex: Caminhar 20 min sem celular",
    meta_period_label: "Período da Meta",
    meta_period_daily: "Diária",
    meta_period_weekly: "Semanal",
    meta_period_monthly: "Mensal",
    meta_points_label: "Pontos ao Concluir",
    meta_save_btn: "Salvar Meta",
    meta_create_btn: "Criar Meta",

    achievements_modal_title: "Conquistas & Distintivos",
    achievements_modal_sub: "Acompanhe suas medalhas e recompensas por hábitos conscientes",
    achievements_manage_btn: "Gerenciar Conquistas",
    achievements_unlocked_date: "Desbloqueada em",
    achievements_progress: "Progresso",
    achievements_none: "Nenhuma conquista disponível no momento.",

    admin_modal_title: "Painel de Gestão de Usuários",
    admin_modal_sub: "Administração geral de contas da comunidade",
    admin_search_placeholder: "Buscar por nome, e-mail, curso ou CPF...",
    admin_total_users: "Total de Usuários",
    admin_admins_count: "Administradores",
    admin_active_count: "Contas Ativas",
    admin_reset_password: "Redefinir Senha",
    admin_delete_user: "Excluir Usuário",

    unfollow_title: "Deixar de seguir?",
    unfollow_confirm_text: "Você não verá mais as publicações deste colega prioritariamente no Feed.",
    unfollow_btn: "Deixar de seguir",
    unfollow_cancel_btn: "Cancelar",

    chatbot_title: "Conselheiro de Bem-Estar",
    chatbot_sub: "Dúvidas e apoio para foco consciente",
    chatbot_clear: "Limpar conversa",
    chatbot_suggested: "Sugestões de perguntas:",
    chatbot_placeholder: "Digite sua dúvida ou desabafo...",
    chatbot_welcome: "Olá! Sou o Conselheiro Virtual do LibertApp 🌱. Como posso te apoiar hoje?",
    chatbot_connecting: "Conectando ao conselheiro virtual...",
    chatbot_assistant_tag: "Conselheiro Virtual • IA de Apoio",
    chatbot_error_retry: "Parece que houve uma oscilação na conexão com o conselheiro. Por favor, tente enviar novamente em alguns instantes.",

    post_sharing_with_community: "Compartilhando com a comunidade",
    post_choose_theme: "Escolha o tema do momento:",
    post_change_photo: "Trocar Foto",
    post_upload_photo: "Fazer Upload de Foto",
    post_chars: "caracteres",
    post_add_photo_title: "Adicionar Foto à Publicação",
    post_add_photo_sub: "Escolha como deseja anexar sua imagem",
    post_optimizing_image: "Otimizando imagem para o padrão Instagram...",

    user_featured_achievements: "Conquistas em Destaque",
    user_wall_posts: "Publicações no Mural",
    user_likes_count: "curtidas",
    user_comments_count: "comentários",
    user_incentive_sent_alert: "Incentivo enviado! 🎉",
    user_level_badge: "Nv",

    achievements_unlocked_count: "desbloqueadas",
    achievements_loading: "Carregando conquistas...",
    achievements_admin_new: "Nova Conquista",
    achievements_admin_edit: "Editar Conquista",

    admin_users_title: "Painel Administrativo do LibertApp",
    admin_users_count: "usuários",
    admin_loading_users: "Carregando cadastro de usuários...",
    admin_no_users_found: "Nenhum usuário encontrado para a busca.",
    admin_status_active: "ATIVO",
    admin_status_inactive: "DESATIVADO",
    admin_change_password: "Trocar Senha",
    admin_deactivate: "Desativar",
    admin_activate: "Ativar",

    pwa_banner_title: "Instalar LibertApp",
    pwa_banner_sub: "Acesse offline e direto da tela inicial",
    pwa_install_btn: "Instalar App",
    pwa_ios_modal_title: "Instalar no seu iPhone / iPad",
    pwa_ios_modal_desc: "Para instalar este aplicativo direto do Safari:",
    pwa_ios_step_1: "1. Toque no botão Compartilhar na barra do Safari",
    pwa_ios_step_2: "2. Selecione \"Adicionar à Tela de Início\"",
    pwa_manual_instruction: "Para instalar no navegador, use a opção 'Adicionar à Tela Inicial' ou 'Instalar Aplicativo' no menu do seu navegador.",

    common_save: "Salvar",
    common_cancel: "Cancelar",
    common_confirm: "Confirmar",
    common_close: "Fechar",
    common_back: "Voltar",
    common_loading: "Carregando...",
    common_success: "Sucesso!",
    common_error: "Ocorreu um erro",
    common_hours: "horas",
    common_minutes: "minutos",
    common_days: "dias",
  },

  en: {
    nav_home: "Home",
    nav_activities: "Activities",
    nav_card: "Digital Card",
    nav_benefits: "Benefits",
    nav_profile: "Profile",

    feed_welcome: "Welcome,",
    feed_title: "Community Feed",
    feed_tagline: "The community board is open!",
    feed_search_placeholder: "Search colleagues by name, course, or email...",
    feed_search_colleagues_title: "Find Colleagues to Follow",
    feed_leaderboard_title: "View Leaderboard",
    feed_card_member: "ACTIVE MEMBER",
    feed_card_category: "Progressive Benefits",
    feed_unlocked_restaurants: "restaurant(s) left to unlock",
    feed_all_restaurants_unlocked: "All partner restaurants unlocked!",
    feed_posts_count: "posts",
    feed_post_singular: "post",
    feed_loading: "Loading posts...",
    feed_empty_title: "No posts yet.",
    feed_no_posts: "Be the first to share an achievement, photo, or mindful moment!",
    feed_publish_now: "Publish Now",
    feed_like: "Like",
    feed_likes: "likes",
    feed_comment: "Comment",
    feed_comments: "comments",
    feed_share: "Share",
    feed_new_post_btn: "Create new post",

    profile_title: "Profile",
    profile_edit: "Edit Profile",
    profile_wellness_title: "Wellness Reports",
    profile_screen_today: "Screen Today",
    profile_goal: "Goal",
    profile_no_data: "No data",
    profile_usage_access: "Usage Access",
    profile_waiting_sync: "Waiting for screen time sync...",
    profile_grant_usage_desc: "Enable usage access in settings to track real hours.",
    profile_grant_access_btn: "Grant Access",
    profile_limit_percentage: "of daily limit",
    profile_activities_week: "Activities",
    profile_this_week: "this week",
    profile_streak: "Streak",
    profile_consecutive_days: "consecutive days",
    profile_consecutive_day: "consecutive day",
    profile_wellness: "Wellness",
    profile_score: "score",
    profile_achievements_title: "My Achievements",
    profile_unlocked_count: "unlocked",
    profile_view_all: "View all",
    profile_admin_panel: "User Management Panel",
    profile_admin_sub: "Manage, delete, disable, and reset passwords",
    profile_my_posts_title: "My Posts",
    profile_refresh: "Refresh",
    profile_loading_my_posts: "Loading your posts...",
    profile_no_my_posts_title: "You haven't posted yet",
    profile_no_my_posts_desc: "Share photos and achievements on Home to record your mindful moments!",
    profile_delete_post_title: "Delete my post",
    profile_settings_title: "Alerts & Breaks Settings",
    profile_language_title: "App Language",
    profile_language_sub: "Select your preferred language",
    profile_prioritize_following: "Prioritize Following",
    profile_prioritize_following_sub: "Show first in Feed",
    profile_permissions_title: "Device Permissions",
    profile_permissions_sub: "Native integration with Web / Mobile",
    profile_perm_notifications: "Notifications",
    profile_perm_notifications_desc: "Reminders and app alerts",
    profile_perm_usage: "Usage Access",
    profile_perm_usage_desc: "Real screen time on Android",
    profile_perm_location: "GPS Location",
    profile_perm_location_desc: "City in user profile",
    profile_perm_media: "Camera & Gallery",
    profile_perm_media_desc: "Profile photos and posts",
    profile_authorize: "Authorize",
    profile_active: "Active",
    profile_granted: "Granted",
    profile_test: "Test",
    profile_breathing_title: "Breathing Reminders",
    profile_breathing_sub: "Mindful breaks",
    profile_breathing_freq: "Reminder frequency:",
    profile_breathing_custom: "Custom time (min):",
    profile_night_title: "Digital Night Mode",
    profile_night_sub: "Quiet hours",
    profile_night_until: "to",
    profile_screenlimit_title: "Daily Screen Limit",
    profile_screenlimit_goal: "Daily goal",
    profile_tip_text: "Regular breaks help reduce anxiety and improve your digital wellness.",
    profile_logout: "Log Out",
    profile_photo_modal_title: "Profile Photo",
    profile_photo_modal_sub: "Choose how you want to update your photo",
    profile_photo_camera: "Take Photo with Camera",
    profile_photo_gallery: "Choose from Photo Gallery",
    profile_photo_cancel: "Cancel",

    user_focus_time: "Off Focus",
    user_streak: "Streak",
    user_points: "Points",
    user_follow: "Follow Colleague",
    user_following: "Following",
    user_unfollow: "Unfollow",
    user_incentive_btn: "Cheer Colleague",
    user_incentive_limit: "Limit reached (0/3 this hour)",
    user_incentive_sent: "Cheer sent! 🎉",
    user_achievements: "Featured Achievements",
    user_recent_posts: "Board Posts",
    user_no_posts: "No posts yet by this colleague.",
    user_loading_posts: "Loading posts...",

    act_title: "Pomodoro & Focus",
    act_subtitle: "Focus Time & Mindful Habits",
    act_focus_mode: "Focus",
    act_short_break: "Short Break",
    act_long_break: "Long Break",
    act_start_focus: "Start Focus",
    act_pause: "Pause",
    act_reset: "Reset",
    act_adjust_time: "Adjust Pomodoro Times",
    act_goals_progress_title: "Goals Progress",
    act_total_goals: "Total Goals",
    act_active_goal: "active goal",
    act_active_goals: "active goals",
    act_completed_goals: "Completed",
    act_performance: "Goal Completion Rate",
    act_all_completed: "Congratulations! All goals in this category are completed! 🎉",
    act_progress_summary: "You completed {completed} of {total} goals. Keep it up!",
    act_your_goals_title: "🎯 Your Goals",
    act_new_goal_btn: "New Goal",
    act_daily_challenges: "Daily",
    act_weekly_challenges: "Weekly",
    act_monthly_challenges: "Monthly",
    act_empty_category: "No goals registered in this category.",

    card_screen_title: "Digital Student Card",
    card_app_title: "LibertApp",
    card_edition: "Academic Fair 2026",
    card_level_prefix: "LVL",
    card_holder: "Primary Student",
    card_course_dept: "Course / Department",
    card_number: "Card Number",
    card_security_note: "VALID FOR IDENTIFICATION AND DISCOUNTS AT PARTNER STORES",
    card_qr_title: "Validation QR Code",
    card_qr_hint: "Present this code at participating stores",
    card_view_digital: "View Card",
    card_member: "ACTIVE MEMBER",
    card_category: "Progressive Benefits",

    benefits_screen_title: "My Benefits",
    benefits_open_card_btn: "📱 Open Digital Card",
    benefits_partners_title: "Partner Restaurants",
    benefits_summary: "Unlocked: {unlocked} of {total} • Current level: {level} ({points} pts)",
    benefits_off: "OFF",
    benefits_level: "Level",
    benefits_unlocked: "Unlocked",
    benefits_unlock_hint: "Unlock with more points",
    benefits_next_goal_title: "Next Goal 🎯",
    benefits_next_goal_desc: "Earn points in Pomodoro and challenges to reach Level {level} and unlock \"{name}\" with {discount}% discount!",
    benefits_all_partners_unlocked: "🎉 Congratulations! You reached max level and unlocked all official fair partners!",
    benefits_title: "Benefits",
    benefits_subtitle: "Partner vendors",
    benefits_partner_discount: "Guaranteed discount",

    leaderboard_title: "Achievement Podium",
    leaderboard_subtitle: "Mindful habits highlights at the fair",
    leaderboard_cached_notice: "Showing offline ranking — not synced with central server.",
    leaderboard_loading: "Loading official ranking...",
    leaderboard_empty_title: "The podium awaits you!",
    leaderboard_empty_desc: "No participants have accumulated points yet. Complete Pomodoro sessions to claim 1st place!",
    leaderboard_pts: "pts",

    search_screen_title: "Search Colleagues",
    search_input_placeholder: "Search by name, course, or interests...",
    search_filter_all: "All",
    search_filter_following: "Following",
    search_loading: "Searching colleagues...",
    search_empty_title: "Find your friends",
    search_empty_desc: "Type a name to start following and sending cheers.",
    search_no_results: "No colleagues found matching this query.",
    search_pts: "points",

    edit_screen_title: "Edit Profile",
    edit_avatar_title: "Profile Photo",
    edit_change_photo: "Change Photo",
    edit_personal_info: "Personal Information",
    edit_fullname: "Full Name",
    edit_email: "Institutional Email",
    edit_phone: "Phone / WhatsApp",
    edit_cpf: "Tax ID / CPF",
    edit_city: "City / Campus",
    edit_detect_location: "Detect City via GPS",
    edit_detecting: "Detecting...",
    edit_save_btn: "Save Changes",
    edit_saving: "Saving...",
    edit_success: "Profile updated successfully!",

    auth_welcome_back: "Welcome back",
    auth_continue_journey: "Continue your journey of freedom.",
    auth_email: "Email",
    auth_password: "Password",
    auth_forgot_password: "Forgot password?",
    auth_login_btn: "Sign In",
    auth_logging_in: "Signing in...",
    auth_or_continue_with: "or continue with",
    auth_continue_google: "Continue with Google",
    auth_continue_apple: "Continue with Apple",
    auth_no_account: "Don't have an account?",
    auth_create_account: "Create account",
    auth_error_fill_fields: "Please fill in email and password.",
    auth_error_invalid_credentials: "Incorrect email or password.",

    auth_signup_title: "Create Account",
    auth_signup_sub: "Join our mindful community of presence and focus.",
    auth_fullname: "Full Name",
    auth_phone: "Phone",
    auth_confirm_password: "Confirm Password",
    auth_choose_avatar: "Choose your Avatar",
    auth_upload_custom_photo: "Upload custom photo",
    auth_terms_label: "Terms and Conditions",
    auth_terms_desc: "I agree with community guidelines and data usage.",
    auth_register_btn: "Register",
    auth_registering: "Registering...",
    auth_have_account: "Already have an account?",
    auth_enter_link: "Sign In",
    auth_error_passwords_mismatch: "Passwords do not match.",
    auth_error_password_length: "Password must have at least 6 characters.",

    auth_recovery_title: "Reset Password",
    auth_recovery_sub: "Enter your registered email to reset your access.",
    auth_recovery_send_btn: "Send Recovery Link",
    auth_recovery_sending: "Sending...",
    auth_recovery_back_login: "Back to Sign In",
    auth_recovery_success: "Instructions sent to your email!",

    post_modal_title: "New Post",
    post_modal_sub: "Share an achievement, reflection, or mindful moment",
    post_category_label: "Category",
    post_placeholder: "What would you like to share with the community?",
    post_add_photo: "Add Image",
    post_remove_photo: "Remove photo",
    post_cancel: "Cancel",
    post_publish_btn: "Publish",
    post_publishing: "Publishing...",
    cat_nature: "Nature & Outdoors",
    cat_focus: "Focus & Attention",
    cat_games: "Challenges & Games",
    cat_reading: "Reading & Study",

    comments_modal_title: "Comments",
    comments_post_by: "Post by",
    comments_empty_title: "No comments yet",
    comments_empty_sub: "Be the first to leave a kind thought!",
    comments_placeholder: "Write a supportive comment...",
    comments_send_btn: "Send",

    pomodoro_modal_title: "Configure Pomodoro",
    pomodoro_modal_sub: "Customize your focus and rest intervals",
    pomodoro_focus_label: "Focus Time (min)",
    pomodoro_short_break_label: "Short Break (min)",
    pomodoro_long_break_label: "Long Break (min)",
    pomodoro_daily_goal_label: "Daily Sessions Goal",
    pomodoro_restore_default: "Restore Defaults",
    pomodoro_save: "Save Settings",

    meta_modal_edit_title: "Edit Goal",
    meta_modal_new_title: "New Goal",
    meta_modal_sub: "Set a mindful goal for your daily routine",
    meta_title_label: "Goal Title",
    meta_title_placeholder: "E.g.: Walk 20 min without phone",
    meta_period_label: "Goal Frequency",
    meta_period_daily: "Daily",
    meta_period_weekly: "Weekly",
    meta_period_monthly: "Monthly",
    meta_points_label: "Points on Completion",
    meta_save_btn: "Save Goal",
    meta_create_btn: "Create Goal",

    achievements_modal_title: "Achievements & Badges",
    achievements_modal_sub: "Track your medals and rewards for mindful habits",
    achievements_manage_btn: "Manage Achievements",
    achievements_unlocked_date: "Unlocked on",
    achievements_progress: "Progress",
    achievements_none: "No achievements available at the moment.",

    admin_modal_title: "User Management Panel",
    admin_modal_sub: "General administration of community accounts",
    admin_search_placeholder: "Search by name, email, course, or ID...",
    admin_total_users: "Total Users",
    admin_admins_count: "Administrators",
    admin_active_count: "Active Accounts",
    admin_reset_password: "Reset Password",
    admin_delete_user: "Delete User",

    unfollow_title: "Unfollow colleague?",
    unfollow_confirm_text: "You will no longer see this colleague's posts with priority in your Feed.",
    unfollow_btn: "Unfollow",
    unfollow_cancel_btn: "Cancel",

    chatbot_title: "Wellness Advisor",
    chatbot_sub: "Questions and support for mindful focus",
    chatbot_clear: "Clear chat",
    chatbot_suggested: "Suggested questions:",
    chatbot_placeholder: "Type your question or thought...",
    chatbot_welcome: "Hello! I am the LibertApp Virtual Advisor 🌱. How can I support you today?",
    chatbot_connecting: "Connecting to virtual advisor...",
    chatbot_assistant_tag: "Virtual Advisor • Support AI",
    chatbot_error_retry: "It seems there was an issue connecting to the advisor. Please try again in a few moments.",

    post_sharing_with_community: "Sharing with the community",
    post_choose_theme: "Choose the topic of the moment:",
    post_change_photo: "Change Photo",
    post_upload_photo: "Upload Photo",
    post_chars: "characters",
    post_add_photo_title: "Add Photo to Post",
    post_add_photo_sub: "Choose how you want to attach your image",
    post_optimizing_image: "Optimizing image for Instagram square standard...",

    user_featured_achievements: "Featured Achievements",
    user_wall_posts: "Wall Posts",
    user_likes_count: "likes",
    user_comments_count: "comments",
    user_incentive_sent_alert: "Incentive sent! 🎉",
    user_level_badge: "Lvl",

    achievements_unlocked_count: "unlocked",
    achievements_loading: "Loading achievements...",
    achievements_admin_new: "New Achievement",
    achievements_admin_edit: "Edit Achievement",

    admin_users_title: "LibertApp Admin Panel",
    admin_users_count: "users",
    admin_loading_users: "Loading user directory...",
    admin_no_users_found: "No users found for this search.",
    admin_status_active: "ACTIVE",
    admin_status_inactive: "DEACTIVATED",
    admin_change_password: "Change Password",
    admin_deactivate: "Deactivate",
    admin_activate: "Activate",

    pwa_banner_title: "Install LibertApp",
    pwa_banner_sub: "Access offline and directly from your home screen",
    pwa_install_btn: "Install App",
    pwa_ios_modal_title: "Install on iPhone / iPad",
    pwa_ios_modal_desc: "To install this app directly from Safari:",
    pwa_ios_step_1: "1. Tap the Share button in Safari toolbar",
    pwa_ios_step_2: "2. Select \"Add to Home Screen\"",
    pwa_manual_instruction: "To install in your browser, tap 'Add to Home Screen' or 'Install App' in your browser menu.",

    common_save: "Save",
    common_cancel: "Cancel",
    common_confirm: "Confirm",
    common_close: "Close",
    common_back: "Back",
    common_loading: "Loading...",
    common_success: "Success!",
    common_error: "An error occurred",
    common_hours: "hours",
    common_minutes: "minutes",
    common_days: "days",
  },

  es: {
    nav_home: "Inicio",
    nav_activities: "Actividades",
    nav_card: "Credencial",
    nav_benefits: "Beneficios",
    nav_profile: "Perfil",

    feed_welcome: "Bienvenido(a),",
    feed_title: "Muro de la Comunidad",
    feed_tagline: "¡El mural de la feria está abierto!",
    feed_search_placeholder: "Buscar compañeros por nombre, carrera o correo...",
    feed_search_colleagues_title: "Buscar Compañeros para Seguir",
    feed_leaderboard_title: "Ver Podio",
    feed_card_member: "MIEMBRO ACTIVO",
    feed_card_category: "Beneficios Progresivos",
    feed_unlocked_restaurants: "restaurante(s) por desbloquear",
    feed_all_restaurants_unlocked: "¡Todos los restaurantes asociados desbloqueados!",
    feed_posts_count: "publicaciones",
    feed_post_singular: "publicación",
    feed_loading: "Cargando publicaciones...",
    feed_empty_title: "Ninguna publicación todavía.",
    feed_no_posts: "¡Sé el primero en compartir un logro, foto o momento de desconexión!",
    feed_publish_now: "Publicar Ahora",
    feed_like: "Me gusta",
    feed_likes: "me gusta",
    feed_comment: "Comentar",
    feed_comments: "comentarios",
    feed_share: "Compartir",
    feed_new_post_btn: "Crear publicación",

    profile_title: "Perfil",
    profile_edit: "Editar Perfil",
    profile_wellness_title: "Informes de Bienestar",
    profile_screen_today: "Pantalla Hoy",
    profile_goal: "Meta",
    profile_no_data: "Sin datos",
    profile_usage_access: "Acceso de Uso",
    profile_waiting_sync: "Esperando sincronización de pantalla...",
    profile_grant_usage_desc: "Permite el acceso de uso en ajustes para ver horas reales.",
    profile_grant_access_btn: "Conceder Acceso",
    profile_limit_percentage: "del límite diario",
    profile_activities_week: "Actividades",
    profile_this_week: "esta semana",
    profile_streak: "Racha",
    profile_consecutive_days: "días consecutivos",
    profile_consecutive_day: "día consecutivo",
    profile_wellness: "Bienestar",
    profile_score: "puntuación",
    profile_achievements_title: "Mis Logros",
    profile_unlocked_count: "desbloqueados",
    profile_view_all: "Ver todos",
    profile_admin_panel: "Panel de Gestión de Usuarios",
    profile_admin_sub: "Controlar, borrar, desactivar y restablecer contraseñas",
    profile_my_posts_title: "Mis Publicaciones",
    profile_refresh: "Actualizar",
    profile_loading_my_posts: "Cargando tus publicaciones...",
    profile_no_my_posts_title: "Aún no has publicado en el mural",
    profile_no_my_posts_desc: "¡Comparte fotos y logros en Inicio para registrar tus momentos conscientes!",
    profile_delete_post_title: "Eliminar mi publicación",
    profile_settings_title: "Configuración de Alertas y Pausas",
    profile_language_title: "Idioma de la Aplicación",
    profile_language_sub: "Selecciona tu idioma preferido",
    profile_prioritize_following: "Priorizar a Quienes Sigues",
    profile_prioritize_following_sub: "Mostrar primero en el Muro",
    profile_permissions_title: "Permisos del Dispositivo",
    profile_permissions_sub: "Integración nativa con Web / Mobile",
    profile_perm_notifications: "Notificaciones",
    profile_perm_notifications_desc: "Recordatorios y avisos de la app",
    profile_perm_usage: "Acceso de Uso",
    profile_perm_usage_desc: "Tiempo de pantalla real en Android",
    profile_perm_location: "Ubicación GPS",
    profile_perm_location_desc: "Ciudad en el perfil de usuario",
    profile_perm_media: "Cámara y Galería",
    profile_perm_media_desc: "Fotos de perfil y publicaciones",
    profile_authorize: "Autorizar",
    profile_active: "Activo",
    profile_granted: "Permitido",
    profile_test: "Probar",
    profile_breathing_title: "Recordatorios de Respiro",
    profile_breathing_sub: "Pausas conscientes",
    profile_breathing_freq: "Frecuencia del recordatorio:",
    profile_breathing_custom: "Tiempo personalizado (min):",
    profile_night_title: "Modo Nocturno Digital",
    profile_night_sub: "Horas de descanso",
    profile_night_until: "hasta",
    profile_screenlimit_title: "Límite Diario de Pantalla",
    profile_screenlimit_goal: "Meta diaria",
    profile_tip_text: "Las pausas periódicas ayudan a reducir la ansiedad y mejorar tu bienestar digital.",
    profile_logout: "Cerrar Sesión",
    profile_photo_modal_title: "Foto de Perfil",
    profile_photo_modal_sub: "Elige cómo deseas actualizar tu foto",
    profile_photo_camera: "Tomar Foto con la Cámara",
    profile_photo_gallery: "Elegir de la Galería",
    profile_photo_cancel: "Cancelar",

    user_focus_time: "Enfoque Off",
    user_streak: "Racha",
    user_points: "Puntos",
    user_follow: "Seguir Compañero",
    user_following: "Siguiendo",
    user_unfollow: "Dejar de Seguir",
    user_incentive_btn: "Animar Compañero",
    user_incentive_limit: "Límite alcanzado (0/3 esta hora)",
    user_incentive_sent: "¡Ánimo enviado! 🎉",
    user_achievements: "Logros Destacados",
    user_recent_posts: "Publicaciones en el Muro",
    user_no_posts: "Ninguna publicación de este compañero todavía.",
    user_loading_posts: "Cargando publicaciones...",

    act_title: "Pomodoro y Enfoque",
    act_subtitle: "Tiempo de Enfoque y Hábitos Conscientes",
    act_focus_mode: "Enfoque",
    act_short_break: "Pausa Corta",
    act_long_break: "Pausa Larga",
    act_start_focus: "Iniciar Enfoque",
    act_pause: "Pausar",
    act_reset: "Reiniciar",
    act_adjust_time: "Ajustar Tiempos de Pomodoro",
    act_goals_progress_title: "Progreso de Metas",
    act_total_goals: "Total de Metas",
    act_active_goal: "meta activa",
    act_active_goals: "metas activas",
    act_completed_goals: "Completadas",
    act_performance: "Aprovechamiento de Metas",
    act_all_completed: "¡Felicidades! ¡Todas las metas de esta categoría están completadas! 🎉",
    act_progress_summary: "Has completado {completed} de {total} metas. ¡Sigue adelante!",
    act_your_goals_title: "🎯 Tus Metas",
    act_new_goal_btn: "Nueva Meta",
    act_daily_challenges: "Diarias",
    act_weekly_challenges: "Semanales",
    act_monthly_challenges: "Mensuales",
    act_empty_category: "No hay metas registradas en esta categoría.",

    card_screen_title: "Credencial Digital",
    card_app_title: "LibertApp",
    card_edition: "Feria Académica 2026",
    card_level_prefix: "NIV",
    card_holder: "Estudiante Titular",
    card_course_dept: "Carrera / Departamento",
    card_number: "Nº de Credencial",
    card_security_note: "VÁLIDA PARA IDENTIFICACIÓN Y DESCUENTOS EN LOCALES ASOCIADOS",
    card_qr_title: "Código QR de Validación",
    card_qr_hint: "Presenta este código en los establecimientos afiliados",
    card_view_digital: "Ver Credencial",
    card_member: "MIEMBRO ACTIVO",
    card_category: "Beneficios Progresivos",

    benefits_screen_title: "Mis Beneficios",
    benefits_open_card_btn: "📱 Abrir Credencial Digital",
    benefits_partners_title: "Restaurantes Asociados",
    benefits_summary: "Desbloqueados: {unlocked} de {total} • Nivel actual: {level} ({points} pts)",
    benefits_off: "DTO",
    benefits_level: "Nivel",
    benefits_unlocked: "Desbloqueado",
    benefits_unlock_hint: "Desbloquea con más puntos",
    benefits_next_goal_title: "Próxima meta 🎯",
    benefits_next_goal_desc: "¡Acumula puntos en Pomodoro y desafíos para alcanzar el Nivel {level} y desbloquear \"{name}\" con {discount}% de descuento!",
    benefits_all_partners_unlocked: "🎉 ¡Felicidades! ¡Has alcanzado el nivel máximo y desbloqueado todos los asociados de la feria!",
    benefits_title: "Beneficios",
    benefits_subtitle: "Comercios asociados",
    benefits_partner_discount: "Descuento garantizado",

    leaderboard_title: "Podio de Logros",
    leaderboard_subtitle: "Destacados en hábitos conscientes de la feria",
    leaderboard_cached_notice: "Mostrando ranking sin conexión — no sincronizado con el servidor central.",
    leaderboard_loading: "Cargando clasificación oficial...",
    leaderboard_empty_title: "¡El podio te espera!",
    leaderboard_empty_desc: "Ningún participante ha acumulado puntos aún. ¡Completa sesiones en Pomodoro para estrenar el 1er lugar!",
    leaderboard_pts: "pts",

    search_screen_title: "Buscar Compañeros",
    search_input_placeholder: "Buscar por nombre, carrera o intereses...",
    search_filter_all: "Todos",
    search_filter_following: "Siguiendo",
    search_loading: "Buscando compañeros...",
    search_empty_title: "Encuentra a tus amigos",
    search_empty_desc: "Escribe un nombre para comenzar a seguir y enviar ánimos.",
    search_no_results: "No se encontraron compañeros con ese criterio.",
    search_pts: "puntos",

    edit_screen_title: "Editar Perfil",
    edit_avatar_title: "Foto de Perfil",
    edit_change_photo: "Cambiar Foto",
    edit_personal_info: "Datos Personales",
    edit_fullname: "Nombre Completo",
    edit_email: "Correo Institucional",
    edit_phone: "Teléfono / WhatsApp",
    edit_cpf: "DNI / CPF",
    edit_city: "Ciudad / Campus",
    edit_detect_location: "Detectar Ciudad por GPS",
    edit_detecting: "Detectando...",
    edit_save_btn: "Guardar Cambios",
    edit_saving: "Guardando...",
    edit_success: "¡Perfil actualizado con éxito!",

    auth_welcome_back: "Bienvenida de nuevo",
    auth_continue_journey: "Continúa tu viaje de libertad.",
    auth_email: "Correo electrónico",
    auth_password: "Contraseña",
    auth_forgot_password: "¿Olvidaste tu contraseña?",
    auth_login_btn: "Iniciar Sesión",
    auth_logging_in: "Iniciando sesión...",
    auth_or_continue_with: "o continúa con",
    auth_continue_google: "Continuar con Google",
    auth_continue_apple: "Continuar con Apple",
    auth_no_account: "¿No tienes cuenta?",
    auth_create_account: "Crear cuenta",
    auth_error_fill_fields: "Por favor, completa correo y contraseña.",
    auth_error_invalid_credentials: "Correo o contraseña incorrectos.",

    auth_signup_title: "Crear Cuenta",
    auth_signup_sub: "Únete a la comunidad de presencia y enfoque.",
    auth_fullname: "Nombre Completo",
    auth_phone: "Teléfono",
    auth_confirm_password: "Confirmar Contraseña",
    auth_choose_avatar: "Elige tu Avatar",
    auth_upload_custom_photo: "Subir foto personalizada",
    auth_terms_label: "Términos y Condiciones",
    auth_terms_desc: "Acepto las pautas comunitarias y el uso de datos.",
    auth_register_btn: "Registrarse",
    auth_registering: "Registrando...",
    auth_have_account: "¿Ya tienes cuenta?",
    auth_enter_link: "Iniciar Sesión",
    auth_error_passwords_mismatch: "Las contraseñas no coinciden.",
    auth_error_password_length: "La contraseña debe tener al menos 6 caracteres.",

    auth_recovery_title: "Recuperar Contraseña",
    auth_recovery_sub: "Ingresa tu correo registrado para restablecer tu acceso.",
    auth_recovery_send_btn: "Enviar Enlace de Recuperación",
    auth_recovery_sending: "Enviando...",
    auth_recovery_back_login: "Volver a Iniciar Sesión",
    auth_recovery_success: "¡Instrucciones enviadas a tu correo!",

    post_modal_title: "Nueva Publicación",
    post_modal_sub: "Comparte un logro, reflexión o momento consciente",
    post_category_label: "Categoría",
    post_placeholder: "¿Qué te gustaría compartir con la comunidad?",
    post_add_photo: "Añadir Imagen",
    post_remove_photo: "Eliminar foto",
    post_cancel: "Cancelar",
    post_publish_btn: "Publicar",
    post_publishing: "Publicando...",
    cat_nature: "Naturaleza y Aire Libre",
    cat_focus: "Enfoque y Atención",
    cat_games: "Juegos y Retos",
    cat_reading: "Lectura y Estudio",

    comments_modal_title: "Comentarios",
    comments_post_by: "Publicación de",
    comments_empty_title: "Sin comentarios aún",
    comments_empty_sub: "¡Sé el primero en interactuar!",
    comments_placeholder: "Escribe un comentario positivo...",
    comments_send_btn: "Enviar",

    pomodoro_modal_title: "Configurar Pomodoro",
    pomodoro_modal_sub: "Personaliza tus tiempos de enfoque y descanso",
    pomodoro_focus_label: "Tiempo de Enfoque (min)",
    pomodoro_short_break_label: "Pausa Corta (min)",
    pomodoro_long_break_label: "Pausa Larga (min)",
    pomodoro_daily_goal_label: "Meta Diaria de Sesiones",
    pomodoro_restore_default: "Restaurar Predeterminado",
    pomodoro_save: "Guardar Configuración",

    meta_modal_edit_title: "Editar Meta",
    meta_modal_new_title: "Nueva Meta",
    meta_modal_sub: "Establece una meta consciente para tu día a día",
    meta_title_label: "Título de la Meta",
    meta_title_placeholder: "Ej: Caminar 20 min sin móvil",
    meta_period_label: "Frecuencia de la Meta",
    meta_period_daily: "Diaria",
    meta_period_weekly: "Semanal",
    meta_period_monthly: "Mensual",
    meta_points_label: "Puntos al Completar",
    meta_save_btn: "Guardar Meta",
    meta_create_btn: "Crear Meta",

    achievements_modal_title: "Logros y Medallas",
    achievements_modal_sub: "Sigue tus insignias y recompensas por hábitos conscientes",
    achievements_manage_btn: "Administrar Logros",
    achievements_unlocked_date: "Desbloqueada el",
    achievements_progress: "Progreso",
    achievements_none: "No hay logros disponibles en este momento.",

    admin_modal_title: "Panel de Gestión de Usuarios",
    admin_modal_sub: "Administración general de cuentas de la comunidad",
    admin_search_placeholder: "Buscar por nombre, correo, carrera o DNI...",
    admin_total_users: "Total de Usuarios",
    admin_admins_count: "Administradores",
    admin_active_count: "Cuentas Activas",
    admin_reset_password: "Restablecer Contraseña",
    admin_delete_user: "Eliminar Usuario",

    unfollow_title: "¿Dejar de seguir?",
    unfollow_confirm_text: "Ya no verás las publicaciones de este compañero con prioridad en tu Muro.",
    unfollow_btn: "Dejar de seguir",
    unfollow_cancel_btn: "Cancelar",

    chatbot_title: "Consejero de Bienestar",
    chatbot_sub: "Dudas y apoyo para enfoque consciente",
    chatbot_clear: "Limpiar conversación",
    chatbot_suggested: "Sugerencias de preguntas:",
    chatbot_placeholder: "Escribe tu duda o reflexión...",
    chatbot_welcome: "¡Hola! Soy el Consejero Virtual de LibertApp 🌱. ¿Cómo puedo apoyarte hoy?",
    chatbot_connecting: "Conectando con el consejero virtual...",
    chatbot_assistant_tag: "Consejero Virtual • IA de Apoyo",
    chatbot_error_retry: "Parece que hubo un problema de conexión con el consejero. Intenta enviar de nuevo en unos momentos.",

    post_sharing_with_community: "Compartiendo con la comunidad",
    post_choose_theme: "Elige el tema del momento:",
    post_change_photo: "Cambiar Foto",
    post_upload_photo: "Subir Foto",
    post_chars: "caracteres",
    post_add_photo_title: "Añadir Foto a la Publicación",
    post_add_photo_sub: "Elige cómo deseas adjuntar tu imagen",
    post_optimizing_image: "Optimizando imagen para el estándar de Instagram...",

    user_featured_achievements: "Logros Destacados",
    user_wall_posts: "Publicaciones en el Muro",
    user_likes_count: "me gusta",
    user_comments_count: "comentarios",
    user_incentive_sent_alert: "¡Incentivo enviado! 🎉",
    user_level_badge: "Niv",

    achievements_unlocked_count: "desbloqueadas",
    achievements_loading: "Cargando logros...",
    achievements_admin_new: "Nuevo Logro",
    achievements_admin_edit: "Editar Logro",

    admin_users_title: "Panel de Administración de LibertApp",
    admin_users_count: "usuarios",
    admin_loading_users: "Cargando directorio de usuarios...",
    admin_no_users_found: "No se encontraron usuarios para esta búsqueda.",
    admin_status_active: "ACTIVO",
    admin_status_inactive: "DESACTIVADO",
    admin_change_password: "Cambiar Contraseña",
    admin_deactivate: "Desactivar",
    admin_activate: "Activar",

    pwa_banner_title: "Instalar LibertApp",
    pwa_banner_sub: "Accede sin conexión y desde tu pantalla de inicio",
    pwa_install_btn: "Instalar App",
    pwa_ios_modal_title: "Instalar en tu iPhone / iPad",
    pwa_ios_modal_desc: "Para instalar esta app directamente desde Safari:",
    pwa_ios_step_1: "1. Toca el botón Compartir en la barra de Safari",
    pwa_ios_step_2: "2. Selecciona \"Añadir a la pantalla de inicio\"",
    pwa_manual_instruction: "Para instalar en el navegador, selecciona 'Añadir a pantalla de inicio' o 'Instalar aplicación' en el menú de tu navegador.",

    common_save: "Guardar",
    common_cancel: "Cancelar",
    common_confirm: "Confirmar",
    common_close: "Cerrar",
    common_back: "Volver",
    common_loading: "Cargando...",
    common_success: "¡Éxito!",
    common_error: "Ocurrió un error",
    common_hours: "horas",
    common_minutes: "minutos",
    common_days: "días",
  },
};
