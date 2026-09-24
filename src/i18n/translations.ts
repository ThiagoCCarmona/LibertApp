export type Language = "pt" | "en" | "es";

export interface Translations {
  // Navigation
  nav_home: string;
  nav_activities: string;
  nav_card: string;
  nav_benefits: string;
  nav_profile: string;

  // Home Screen
  feed_title: string;
  feed_tagline: string;
  feed_search_placeholder: string;
  feed_new_post: string;
  feed_publish: string;
  feed_share_thought: string;
  feed_filter_following: string;
  feed_filter_all: string;
  feed_like: string;
  feed_likes: string;
  feed_comment: string;
  feed_comments: string;
  feed_no_posts: string;
  feed_time_now: string;

  // Profile Screen
  profile_title: string;
  profile_edit: string;
  profile_wellness_title: string;
  profile_screen_today: string;
  profile_goal: string;
  profile_focus_week: string;
  profile_streak_days: string;
  profile_wellness_score: string;
  profile_achievements_title: string;
  profile_view_all: string;
  profile_settings_title: string;
  profile_language_title: string;
  profile_language_sub: string;
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
  profile_night_start: string;
  profile_night_end: string;
  profile_screenlimit_title: string;
  profile_screenlimit_sub: string;
  profile_logout: string;
  profile_photo_modal_title: string;
  profile_photo_modal_sub: string;
  profile_photo_camera: string;
  profile_photo_gallery: string;
  profile_photo_cancel: string;

  // User Profile Modal (Peer)
  user_focus_time: string;
  user_streak: string;
  user_points: string;
  user_follow: string;
  user_following: string;
  user_unfollow: string;
  user_incentive_btn: string;
  user_incentive_limit: string;
  user_achievements: string;
  user_recent_posts: string;
  user_no_posts: string;

  // Activities Screen
  act_title: string;
  act_pomodoro_tab: string;
  act_challenges_tab: string;
  act_start_focus: string;
  act_pause: string;
  act_reset: string;
  act_session_finished: string;
  act_daily_challenges: string;
  act_weekly_challenges: string;
  act_monthly_challenges: string;

  // Card & Benefits
  card_member: string;
  card_category: string;
  card_view_digital: string;
  benefits_title: string;
  benefits_subtitle: string;
  benefits_partner_discount: string;

  // Common
  common_save: string;
  common_cancel: string;
  common_confirm: string;
  common_close: string;
  common_loading: string;
  common_success: string;
  common_error: string;
  common_hours: string;
  common_minutes: string;
}

export const translations: Record<Language, Translations> = {
  pt: {
    nav_home: "Início",
    nav_activities: "Atividades",
    nav_card: "Cartão",
    nav_benefits: "Benefícios",
    nav_profile: "Perfil",

    feed_title: "Comunidade",
    feed_tagline: "Conectando mentes e cultivando presença",
    feed_search_placeholder: "Buscar colegas por nome, curso ou email...",
    feed_new_post: "Criar Publicação",
    feed_publish: "Publicar",
    feed_share_thought: "Compartilhe uma pausa consciente ou aprendizado...",
    feed_filter_following: "Apenas quem sigo",
    feed_filter_all: "Todas as publicações",
    feed_like: "Curtir",
    feed_likes: "curtidas",
    feed_comment: "Comentar",
    feed_comments: "comentários",
    feed_no_posts: "Nenhuma publicação encontrada no feed.",
    feed_time_now: "Agora",

    profile_title: "Perfil",
    profile_edit: "Editar Perfil",
    profile_wellness_title: "Relatórios de Bem-estar",
    profile_screen_today: "Tela Hoje",
    profile_goal: "Meta",
    profile_focus_week: "Foco na Semana",
    profile_streak_days: "Dias Seguidos",
    profile_wellness_score: "Índice de Bem-estar",
    profile_achievements_title: "Minhas Conquistas",
    profile_view_all: "Ver todas",
    profile_settings_title: "Configurações & Hábitos",
    profile_language_title: "Idioma do Aplicativo",
    profile_language_sub: "Selecione o idioma da interface",
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
    profile_breathing_sub: "Pausas conscientes durante o dia",
    profile_breathing_freq: "Frequência do lembrete:",
    profile_breathing_custom: "Tempo personalizado (min):",
    profile_night_title: "Modo Noturno & Não Perturbe",
    profile_night_sub: "Silenciar avisos e priorizar sono",
    profile_night_start: "Início",
    profile_night_end: "Fim",
    profile_screenlimit_title: "Limite Diário de Tela",
    profile_screenlimit_sub: "Alerta consciente ao atingir a meta",
    profile_logout: "Sair da conta",
    profile_photo_modal_title: "Foto de Perfil",
    profile_photo_modal_sub: "Escolha como deseja atualizar sua foto",
    profile_photo_camera: "Tirar Foto com a Câmera",
    profile_photo_gallery: "Escolher da Galeria de Fotos",
    profile_photo_cancel: "Cancelar",

    user_focus_time: "Tempo de Foco",
    user_streak: "Sequência",
    user_points: "Pontos",
    user_follow: "Seguir",
    user_following: "Seguindo",
    user_unfollow: "Deixar de seguir",
    user_incentive_btn: "Incentivar Colega",
    user_incentive_limit: "Limite atingido (0/3 na hora)",
    user_achievements: "Conquistas em Destaque",
    user_recent_posts: "Publicações Recentes",
    user_no_posts: "Nenhuma publicação recente deste colega.",

    act_title: "Atividades & Foco",
    act_pomodoro_tab: "Pomodoro & Foco",
    act_challenges_tab: "Desafios Saudáveis",
    act_start_focus: "Iniciar Foco",
    act_pause: "Pausar",
    act_reset: "Reiniciar",
    act_session_finished: "Sessão concluída com sucesso!",
    act_daily_challenges: "Desafios Diários",
    act_weekly_challenges: "Desafios Semanais",
    act_monthly_challenges: "Desafios Mensais",

    card_member: "Membro Carmelita",
    card_category: "Estudante & Comunidade",
    card_view_digital: "Cartão Digital Oficial",
    benefits_title: "Clube de Benefícios",
    benefits_subtitle: "Parceiros saudáveis para o seu dia a dia",
    benefits_partner_discount: "Desconto Exclusivo",

    common_save: "Salvar",
    common_cancel: "Cancelar",
    common_confirm: "Confirmar",
    common_close: "Fechar",
    common_loading: "Carregando...",
    common_success: "Sucesso!",
    common_error: "Erro",
    common_hours: "horas",
    common_minutes: "min",
  },

  en: {
    nav_home: "Home",
    nav_activities: "Activities",
    nav_card: "Card",
    nav_benefits: "Benefits",
    nav_profile: "Profile",

    feed_title: "Community",
    feed_tagline: "Connecting minds and cultivating presence",
    feed_search_placeholder: "Search peers by name, course, or email...",
    feed_new_post: "Create Post",
    feed_publish: "Post",
    feed_share_thought: "Share a mindful pause or learning...",
    feed_filter_following: "Following only",
    feed_filter_all: "All posts",
    feed_like: "Like",
    feed_likes: "likes",
    feed_comment: "Comment",
    feed_comments: "comments",
    feed_no_posts: "No posts found in the feed.",
    feed_time_now: "Just now",

    profile_title: "Profile",
    profile_edit: "Edit Profile",
    profile_wellness_title: "Wellness Reports",
    profile_screen_today: "Screen Today",
    profile_goal: "Goal",
    profile_focus_week: "Focus this Week",
    profile_streak_days: "Streak Days",
    profile_wellness_score: "Wellness Score",
    profile_achievements_title: "My Achievements",
    profile_view_all: "View all",
    profile_settings_title: "Settings & Habits",
    profile_language_title: "App Language",
    profile_language_sub: "Choose your interface language",
    profile_permissions_title: "Device Permissions",
    profile_permissions_sub: "Native integration with Web / Mobile",
    profile_perm_notifications: "Notifications",
    profile_perm_notifications_desc: "App reminders and alerts",
    profile_perm_usage: "Usage Access",
    profile_perm_usage_desc: "Real screen time on Android",
    profile_perm_location: "GPS Location",
    profile_perm_location_desc: "City displayed in user profile",
    profile_perm_media: "Camera & Gallery",
    profile_perm_media_desc: "Profile photos and publications",
    profile_authorize: "Authorize",
    profile_active: "Active",
    profile_granted: "Granted",
    profile_test: "Test",
    profile_breathing_title: "Breathing Reminders",
    profile_breathing_sub: "Mindful pauses throughout the day",
    profile_breathing_freq: "Reminder frequency:",
    profile_breathing_custom: "Custom interval (min):",
    profile_night_title: "Night Mode & Do Not Disturb",
    profile_night_sub: "Mute alerts and prioritize rest",
    profile_night_start: "Start",
    profile_night_end: "End",
    profile_screenlimit_title: "Daily Screen Limit",
    profile_screenlimit_sub: "Mindful alert when reaching goal",
    profile_logout: "Log out",
    profile_photo_modal_title: "Profile Photo",
    profile_photo_modal_sub: "Choose how to update your photo",
    profile_photo_camera: "Take Photo with Camera",
    profile_photo_gallery: "Choose from Photo Gallery",
    profile_photo_cancel: "Cancel",

    user_focus_time: "Focus Time",
    user_streak: "Streak",
    user_points: "Points",
    user_follow: "Follow",
    user_following: "Following",
    user_unfollow: "Unfollow",
    user_incentive_btn: "Cheer on Peer",
    user_incentive_limit: "Limit reached (0/3 this hour)",
    user_achievements: "Featured Achievements",
    user_recent_posts: "Recent Posts",
    user_no_posts: "No recent posts from this peer.",

    act_title: "Activities & Focus",
    act_pomodoro_tab: "Pomodoro & Focus",
    act_challenges_tab: "Healthy Challenges",
    act_start_focus: "Start Focus",
    act_pause: "Pause",
    act_reset: "Reset",
    act_session_finished: "Session completed successfully!",
    act_daily_challenges: "Daily Challenges",
    act_weekly_challenges: "Weekly Challenges",
    act_monthly_challenges: "Monthly Challenges",

    card_member: "Carmelita Member",
    card_category: "Student & Community",
    card_view_digital: "Official Digital Card",
    benefits_title: "Benefits Club",
    benefits_subtitle: "Healthy partners for your daily routine",
    benefits_partner_discount: "Exclusive Discount",

    common_save: "Save",
    common_cancel: "Cancel",
    common_confirm: "Confirm",
    common_close: "Close",
    common_loading: "Loading...",
    common_success: "Success!",
    common_error: "Error",
    common_hours: "hours",
    common_minutes: "min",
  },

  es: {
    nav_home: "Inicio",
    nav_activities: "Actividades",
    nav_card: "Tarjeta",
    nav_benefits: "Beneficios",
    nav_profile: "Perfil",

    feed_title: "Comunidad",
    feed_tagline: "Conectando mentes y cultivando presencia",
    feed_search_placeholder: "Buscar compañeros por nombre, carrera o email...",
    feed_new_post: "Crear Publicación",
    feed_publish: "Publicar",
    feed_share_thought: "Comparte una pausa consciente o aprendizaje...",
    feed_filter_following: "Solo a quienes sigo",
    feed_filter_all: "Todas las publicaciones",
    feed_like: "Me gusta",
    feed_likes: "me gusta",
    feed_comment: "Comentar",
    feed_comments: "comentarios",
    feed_no_posts: "No se encontraron publicaciones.",
    feed_time_now: "Ahora",

    profile_title: "Perfil",
    profile_edit: "Editar Perfil",
    profile_wellness_title: "Informes de Bienestar",
    profile_screen_today: "Pantalla Hoy",
    profile_goal: "Meta",
    profile_focus_week: "Enfoque esta Semana",
    profile_streak_days: "Días Seguidos",
    profile_wellness_score: "Índice de Bienestar",
    profile_achievements_title: "Mis Logros",
    profile_view_all: "Ver todas",
    profile_settings_title: "Configuraciones y Hábitos",
    profile_language_title: "Idioma de la Aplicación",
    profile_language_sub: "Selecciona el idioma de la interfaz",
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
    profile_granted: "Concedido",
    profile_test: "Probar",
    profile_breathing_title: "Recordatorios de Respiración",
    profile_breathing_sub: "Pausas conscientes durante el día",
    profile_breathing_freq: "Frecuencia del recordatorio:",
    profile_breathing_custom: "Tiempo personalizado (min):",
    profile_night_title: "Modo Nocturno y No Molestar",
    profile_night_sub: "Silenciar avisos y priorizar el descanso",
    profile_night_start: "Inicio",
    profile_night_end: "Fin",
    profile_screenlimit_title: "Límite Diario de Pantalla",
    profile_screenlimit_sub: "Alerta consciente al alcanzar la meta",
    profile_logout: "Cerrar sesión",
    profile_photo_modal_title: "Foto de Perfil",
    profile_photo_modal_sub: "Elige cómo deseas actualizar tu foto",
    profile_photo_camera: "Tomar Foto con la Cámara",
    profile_photo_gallery: "Elegir de la Galería de Fotos",
    profile_photo_cancel: "Cancelar",

    user_focus_time: "Tiempo de Enfoque",
    user_streak: "Racha",
    user_points: "Puntos",
    user_follow: "Seguir",
    user_following: "Siguiendo",
    user_unfollow: "Dejar de seguir",
    user_incentive_btn: "Incentivar Compañero",
    user_incentive_limit: "Límite alcanzado (0/3 en la hora)",
    user_achievements: "Logros Destacados",
    user_recent_posts: "Publicaciones Recientes",
    user_no_posts: "No hay publicaciones recientes de este compañero.",

    act_title: "Actividades y Enfoque",
    act_pomodoro_tab: "Pomodoro y Enfoque",
    act_challenges_tab: "Desafíos Saludables",
    act_start_focus: "Iniciar Enfoque",
    act_pause: "Pausar",
    act_reset: "Reiniciar",
    act_session_finished: "¡Sesión completada con éxito!",
    act_daily_challenges: "Desafíos Diarios",
    act_weekly_challenges: "Desafíos Semanales",
    act_monthly_challenges: "Desafíos Mensuales",

    card_member: "Miembro Carmelita",
    card_category: "Estudiante y Comunidad",
    card_view_digital: "Tarjeta Digital Oficial",
    benefits_title: "Club de Beneficios",
    benefits_subtitle: "Socios saludables para tu día a día",
    benefits_partner_discount: "Descuento Exclusivo",

    common_save: "Guardar",
    common_cancel: "Cancelar",
    common_confirm: "Confirmar",
    common_close: "Cerrar",
    common_loading: "Cargando...",
    common_success: "¡Éxito!",
    common_error: "Error",
    common_hours: "horas",
    common_minutes: "min",
  },
};
