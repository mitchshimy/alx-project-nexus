export interface Translations {
  [key: string]: string;
}

export interface LanguageData {
  [key: string]: Translations;
}

const translations: LanguageData = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.movies': 'Movies',
    'nav.tv': 'TV Shows',
    'nav.trending': 'Trending',
    'nav.topRated': 'Top Rated',
    'nav.discover': 'Discover',
    'nav.search': 'Search',
    'nav.favorites': 'Favorites',
    'nav.watchlist': 'Watchlist',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.more': 'More',
    'common.less': 'Less',
    
    // Settings
    'settings.title': 'Settings',
    'settings.notifications': 'Notifications',
    'settings.emailUpdates': 'Email Updates',
    'settings.autoPlay': 'Auto-play Trailers',
    'settings.videoQuality': 'Video Quality',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.save': 'Save Settings',
    'settings.saved': 'Settings saved successfully!',
    'settings.unsaved': 'You have unsaved changes',
    'settings.export': 'Export Data',
    'settings.clearCache': 'Clear Cache',
    'settings.logout': 'Logout',
    
    // Profile
    'profile.title': 'Profile',
    'profile.accountInfo': 'Account Information',
    'profile.fullName': 'Full Name',
    'profile.email': 'Email',
    'profile.username': 'Username',
    'profile.memberSince': 'Member Since',
    'profile.activity': 'Your Activity',
    'profile.favorites': 'Favorites',
    'profile.watchlist': 'Watchlist',
    'profile.reviews': 'Reviews',
    'profile.accountActions': 'Account Actions',
    'profile.changePassword': 'Change Password',
    'profile.deleteAccount': 'Delete Account',
    'profile.editProfile': 'Edit Profile',
    
    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.signOut': 'Sign Out',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.rememberMe': 'Remember Me',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    
    // Movies
    'movies.title': 'Movies',
    'movies.trending': 'Trending Movies',
    'movies.popular': 'Popular Movies',
    'movies.topRated': 'Top Rated Movies',
    'movies.nowPlaying': 'Now Playing',
    'movies.upcoming': 'Upcoming',
    'movies.genres': 'Genres',
    'movies.allGenres': 'All Genres',
    'movies.rating': 'Rating',
    'movies.year': 'Year',
    'movies.duration': 'Duration',
    'movies.cast': 'Cast',
    'movies.director': 'Director',
    'movies.watchTrailer': 'Watch Trailer',
    'movies.addToFavorites': 'Add to Favorites',
    'movies.removeFromFavorites': 'Remove from Favorites',
    'movies.addToWatchlist': 'Add to Watchlist',
    'movies.removeFromWatchlist': 'Remove from Watchlist',
    
    // Search
    'search.title': 'Search',
    'search.placeholder': 'Search movies, TV shows, actors...',
    'search.results': 'Search Results',
    'search.noResults': 'No results found',
    'search.tryAgain': 'Try different keywords',
    
    // Quality options
    'quality.720p': '720p (HD)',
    'quality.1080p': '1080p (Full HD)',
    'quality.4k': '4K (Ultra HD)',
    
    // Theme options
    'theme.dark': 'Dark',
    'theme.light': 'Light',
    'theme.auto': 'Auto (System)',
  },
  
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.movies': 'Películas',
    'nav.tv': 'Programas de TV',
    'nav.trending': 'Tendencias',
    'nav.discover': 'Descubrir',
    'nav.search': 'Buscar',
    'nav.favorites': 'Favoritos',
    'nav.watchlist': 'Mi Lista',
    'nav.profile': 'Perfil',
    'nav.settings': 'Configuración',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.retry': 'Reintentar',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.close': 'Cerrar',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.more': 'Más',
    'common.less': 'Menos',
    
    // Settings
    'settings.title': 'Configuración',
    'settings.notifications': 'Notificaciones',
    'settings.emailUpdates': 'Actualizaciones por Email',
    'settings.autoPlay': 'Reproducción Automática de Trailers',
    'settings.videoQuality': 'Calidad de Video',
    'settings.language': 'Idioma',
    'settings.theme': 'Tema',
    'settings.save': 'Guardar Configuración',
    'settings.saved': '¡Configuración guardada exitosamente!',
    'settings.unsaved': 'Tienes cambios sin guardar',
    'settings.export': 'Exportar Datos',
    'settings.clearCache': 'Limpiar Caché',
    'settings.logout': 'Cerrar Sesión',
    
    // Profile
    'profile.title': 'Perfil',
    'profile.accountInfo': 'Información de Cuenta',
    'profile.fullName': 'Nombre Completo',
    'profile.email': 'Correo Electrónico',
    'profile.username': 'Nombre de Usuario',
    'profile.memberSince': 'Miembro Desde',
    'profile.activity': 'Tu Actividad',
    'profile.favorites': 'Favoritos',
    'profile.watchlist': 'Mi Lista',
    'profile.reviews': 'Reseñas',
    'profile.accountActions': 'Acciones de Cuenta',
    'profile.changePassword': 'Cambiar Contraseña',
    'profile.deleteAccount': 'Eliminar Cuenta',
    'profile.editProfile': 'Editar Perfil',
    
    // Auth
    'auth.signIn': 'Iniciar Sesión',
    'auth.signUp': 'Registrarse',
    'auth.signOut': 'Cerrar Sesión',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.confirmPassword': 'Confirmar Contraseña',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    'auth.rememberMe': 'Recordarme',
    'auth.noAccount': '¿No tienes cuenta?',
    'auth.hasAccount': '¿Ya tienes cuenta?',
    
    // Movies
    'movies.title': 'Películas',
    'movies.trending': 'Películas en Tendencia',
    'movies.popular': 'Películas Populares',
    'movies.topRated': 'Películas Mejor Valoradas',
    'movies.nowPlaying': 'En Cartelera',
    'movies.upcoming': 'Próximamente',
    'movies.genres': 'Géneros',
    'movies.allGenres': 'Todos los Géneros',
    'movies.rating': 'Valoración',
    'movies.year': 'Año',
    'movies.duration': 'Duración',
    'movies.cast': 'Reparto',
    'movies.director': 'Director',
    'movies.watchTrailer': 'Ver Trailer',
    'movies.addToFavorites': 'Agregar a Favoritos',
    'movies.removeFromFavorites': 'Quitar de Favoritos',
    'movies.addToWatchlist': 'Agregar a Mi Lista',
    'movies.removeFromWatchlist': 'Quitar de Mi Lista',
    
    // Search
    'search.title': 'Buscar',
    'search.placeholder': 'Buscar películas, programas de TV, actores...',
    'search.results': 'Resultados de Búsqueda',
    'search.noResults': 'No se encontraron resultados',
    'search.tryAgain': 'Intenta con diferentes palabras clave',
    
    // Quality options
    'quality.720p': '720p (HD)',
    'quality.1080p': '1080p (Full HD)',
    'quality.4k': '4K (Ultra HD)',
    
    // Theme options
    'theme.dark': 'Oscuro',
    'theme.light': 'Claro',
    'theme.auto': 'Automático (Sistema)',
  },
  
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.movies': 'Films',
    'nav.tv': 'Émissions TV',
    'nav.trending': 'Tendances',
    'nav.discover': 'Découvrir',
    'nav.search': 'Rechercher',
    'nav.favorites': 'Favoris',
    'nav.watchlist': 'Ma Liste',
    'nav.profile': 'Profil',
    'nav.settings': 'Paramètres',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.retry': 'Réessayer',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.close': 'Fermer',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    'common.more': 'Plus',
    'common.less': 'Moins',
    
    // Settings
    'settings.title': 'Paramètres',
    'settings.notifications': 'Notifications',
    'settings.emailUpdates': 'Mises à jour par email',
    'settings.autoPlay': 'Lecture automatique des bandes-annonces',
    'settings.videoQuality': 'Qualité vidéo',
    'settings.language': 'Langue',
    'settings.theme': 'Thème',
    'settings.save': 'Enregistrer les paramètres',
    'settings.saved': 'Paramètres enregistrés avec succès !',
    'settings.unsaved': 'Vous avez des modifications non enregistrées',
    'settings.export': 'Exporter les données',
    'settings.clearCache': 'Vider le cache',
    'settings.logout': 'Se déconnecter',
    
    // Profile
    'profile.title': 'Profil',
    'profile.accountInfo': 'Informations du compte',
    'profile.fullName': 'Nom complet',
    'profile.email': 'Email',
    'profile.username': 'Nom d\'utilisateur',
    'profile.memberSince': 'Membre depuis',
    'profile.activity': 'Votre activité',
    'profile.favorites': 'Favoris',
    'profile.watchlist': 'Ma liste',
    'profile.reviews': 'Avis',
    'profile.accountActions': 'Actions du compte',
    'profile.changePassword': 'Changer le mot de passe',
    'profile.deleteAccount': 'Supprimer le compte',
    'profile.editProfile': 'Modifier le profil',
    
    // Auth
    'auth.signIn': 'Se connecter',
    'auth.signUp': 'S\'inscrire',
    'auth.signOut': 'Se déconnecter',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.confirmPassword': 'Confirmer le mot de passe',
    'auth.forgotPassword': 'Mot de passe oublié ?',
    'auth.rememberMe': 'Se souvenir de moi',
    'auth.noAccount': 'Vous n\'avez pas de compte ?',
    'auth.hasAccount': 'Vous avez déjà un compte ?',
    
    // Movies
    'movies.title': 'Films',
    'movies.trending': 'Films tendance',
    'movies.popular': 'Films populaires',
    'movies.topRated': 'Films les mieux notés',
    'movies.nowPlaying': 'Au cinéma',
    'movies.upcoming': 'À venir',
    'movies.genres': 'Genres',
    'movies.allGenres': 'Tous les genres',
    'movies.rating': 'Note',
    'movies.year': 'Année',
    'movies.duration': 'Durée',
    'movies.cast': 'Distribution',
    'movies.director': 'Réalisateur',
    'movies.watchTrailer': 'Voir la bande-annonce',
    'movies.addToFavorites': 'Ajouter aux favoris',
    'movies.removeFromFavorites': 'Retirer des favoris',
    'movies.addToWatchlist': 'Ajouter à ma liste',
    'movies.removeFromWatchlist': 'Retirer de ma liste',
    
    // Search
    'search.title': 'Rechercher',
    'search.placeholder': 'Rechercher des films, émissions TV, acteurs...',
    'search.results': 'Résultats de recherche',
    'search.noResults': 'Aucun résultat trouvé',
    'search.tryAgain': 'Essayez d\'autres mots-clés',
    
    // Quality options
    'quality.720p': '720p (HD)',
    'quality.1080p': '1080p (Full HD)',
    'quality.4k': '4K (Ultra HD)',
    
    // Theme options
    'theme.dark': 'Sombre',
    'theme.light': 'Clair',
    'theme.auto': 'Automatique (Système)',
  }
};

export const getTranslation = (key: string, language: string = 'en'): string => {
  const langData = translations[language] || translations['en'];
  return langData[key] || key;
};

export const getCurrentLanguage = (): string => {
  if (typeof window === 'undefined') return 'en';
  
  try {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      return parsedSettings.language || 'en';
    }
  } catch (error) {
    console.error('Error loading language setting:', error);
  }
  
  return 'en';
};

export const t = (key: string): string => {
  const currentLanguage = getCurrentLanguage();
  return getTranslation(key, currentLanguage);
}; 