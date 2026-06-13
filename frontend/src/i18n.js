// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import namespace translation resources
import enNavbar from './locales/en/navbar.json';
import enFooter from './locales/en/footer.json';
import enHome from './locales/en/home.json';
import enPricing from './locales/en/pricing.json';
import enBlog from './locales/en/blog.json';
import enAbout from './locales/en/about.json';
import enAdministrationSidebar from './locales/en/administrationsidebar.json';
import enCoachSidebar from './locales/en/coachsidebar.json';
import enCoachDashboard from './locales/en/coachdashboard.json';
import enAdministrationDashboard from './locales/en/administrationdashboard.json';
import enAdministrationProfile from './locales/en/administrationprofile.json';
import enPlayermanagement from './locales/en/playermanagement.json';
import enCoachmanagement from './locales/en/coachmanagement.json';
import enPaymentmanagement from './locales/en/paymentmanagement.json';
import enAgendamanagement from './locales/en/agendamanagement.json';
import enContactmanagement from './locales/en/contactmanagement.json';
import enSettings from './locales/en/settings.json';
import enCoachProfile from './locales/en/coachprofile.json';
import enCoachPlayers from './locales/en/coachplayers.json';
import enNotifications from './locales/en/notifications.json';
import enAuth from './locales/en/auth.json';
import enCoachAgenda from './locales/en/coachagenda.json';
import enCoachTraining from './locales/en/coachtraining.json';
import enPlayersidebar from './locales/en/playersidebar.json';
import enPlayerdashboard from './locales/en/playerdashboard.json';
import enPlayerprofile from './locales/en/playerprofile.json';
import enPlayertraining from './locales/en/playertraining.json';
import enPlayerstats from './locales/en/playerstats.json';
import enPlayersettings from './locales/en/playersettings.json';

import frNavbar from './locales/fr/navbar.json';
import frFooter from './locales/fr/footer.json';
import frHome from './locales/fr/home.json';
import frPricing from './locales/fr/pricing.json';
import frBlog from './locales/fr/blog.json';
import frAbout from './locales/fr/about.json';
import frAdministrationSidebar from './locales/fr/administrationsidebar.json';
import frCoachSidebar from './locales/fr/coachsidebar.json';
import frCoachDashboard from './locales/fr/coachdashboard.json';
import frAdministrationDashboard from './locales/fr/administrationdashboard.json';
import frAdministrationProfile from './locales/fr/administrationprofile.json';
import frPlayermanagement from './locales/fr/playermanagement.json';
import frCoachmanagement from './locales/fr/coachmanagement.json';
import frPaymentmanagement from './locales/fr/paymentmanagement.json';
import frAgendamanagement from './locales/fr/agendamanagement.json';
import frContactmanagement from './locales/fr/contactmanagement.json';
import frSettings from './locales/fr/settings.json';
import frCoachProfile from './locales/fr/coachprofile.json';
import frCoachPlayers from './locales/fr/coachplayers.json';
import frNotifications from './locales/fr/notifications.json';
import frAuth from './locales/fr/auth.json';
import frCoachAgenda from './locales/fr/coachagenda.json';
import frCoachTraining from './locales/fr/coachtraining.json';
import frPlayersidebar from './locales/fr/playersidebar.json';
import frPlayerdashboard from './locales/fr/playerdashboard.json';
import frPlayerprofile from './locales/fr/playerprofile.json';
import frPlayertraining from './locales/fr/playertraining.json';
import frPlayerstats from './locales/fr/playerstats.json';
import frPlayersettings from './locales/fr/playersettings.json';

import arNavbar from './locales/ar/navbar.json';
import arFooter from './locales/ar/footer.json';
import arHome from './locales/ar/home.json';
import arPricing from './locales/ar/pricing.json';
import arBlog from './locales/ar/blog.json';
import arAbout from './locales/ar/about.json';
import arAdministrationSidebar from './locales/ar/administrationsidebar.json';
import arCoachSidebar from './locales/ar/coachsidebar.json';
import arCoachDashboard from './locales/ar/coachdashboard.json';
import arAdministrationDashboard from './locales/ar/administrationdashboard.json';
import arAdministrationProfile from './locales/ar/administrationprofile.json';
import arPlayermanagement from './locales/ar/playermanagement.json';
import arCoachmanagement from './locales/ar/coachmanagement.json';
import arPaymentmanagement from './locales/ar/paymentmanagement.json';
import arAgendamanagement from './locales/ar/agendamanagement.json';
import arContactmanagement from './locales/ar/contactmanagement.json';
import arSettings from './locales/ar/settings.json';
import arCoachProfile from './locales/ar/coachprofile.json';
import arCoachPlayers from './locales/ar/coachplayers.json';
import arNotifications from './locales/ar/notifications.json';
import arAuth from './locales/ar/auth.json';
import arCoachAgenda from './locales/ar/coachagenda.json';
import arCoachTraining from './locales/ar/coachtraining.json';
import arPlayersidebar from './locales/ar/playersidebar.json';
import arPlayerdashboard from './locales/ar/playerdashboard.json';
import arPlayerprofile from './locales/ar/playerprofile.json';
import arPlayertraining from './locales/ar/playertraining.json';
import arPlayerstats from './locales/ar/playerstats.json';
import arPlayersettings from './locales/ar/playersettings.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        navbar: enNavbar,
        footer: enFooter,
        home: enHome,
        pricing: enPricing,
        blog: enBlog,
        about: enAbout,
        administrationsidebar: enAdministrationSidebar,
        coachsidebar: enCoachSidebar,
        coachdashboard: enCoachDashboard,
        coachprofile: enCoachProfile,
        coachplayers: enCoachPlayers,
        administrationdashboard: enAdministrationDashboard,
        administrationprofile: enAdministrationProfile,
        playermanagement: enPlayermanagement,
        coachmanagement: enCoachmanagement,
        paymentmanagement: enPaymentmanagement,
        agendamanagement: enAgendamanagement,
        contactmanagement: enContactmanagement,
        settings: enSettings,
        notifications: enNotifications,
        auth: enAuth,
        coachagenda: enCoachAgenda,
        coachtraining: enCoachTraining,
        playersidebar: enPlayersidebar,
        playerdashboard: enPlayerdashboard,
        playerprofile: enPlayerprofile,
        playertraining: enPlayertraining,
        playerstats: enPlayerstats,
        playersettings: enPlayersettings,
      },
      fr: {
        navbar: frNavbar,
        footer: frFooter,
        home: frHome,
        pricing: frPricing,
        blog: frBlog,
        about: frAbout,
        administrationsidebar: frAdministrationSidebar,
        coachsidebar: frCoachSidebar,
        coachdashboard: frCoachDashboard,
        coachprofile: frCoachProfile,
        coachplayers: frCoachPlayers,
        administrationdashboard: frAdministrationDashboard,
        administrationprofile: frAdministrationProfile,
        playermanagement: frPlayermanagement,
        coachmanagement: frCoachmanagement,
        paymentmanagement: frPaymentmanagement,
        agendamanagement: frAgendamanagement,
        contactmanagement: frContactmanagement,
        settings: frSettings,
        notifications: frNotifications,
        auth: frAuth,
        coachagenda: frCoachAgenda,
        coachtraining: frCoachTraining,
        playersidebar: frPlayersidebar,
        playerdashboard: frPlayerdashboard,
        playerprofile: frPlayerprofile,
        playertraining: frPlayertraining,
        playerstats: frPlayerstats,
        playersettings: frPlayersettings,
      },
      ar: {
        navbar: arNavbar,
        footer: arFooter,
        home: arHome,
        pricing: arPricing,
        blog: arBlog,
        about: arAbout,
        administrationsidebar: arAdministrationSidebar,
        coachsidebar: arCoachSidebar,
        coachdashboard: arCoachDashboard,
        coachprofile: arCoachProfile,
        coachplayers: arCoachPlayers,
        administrationdashboard: arAdministrationDashboard,
        administrationprofile: arAdministrationProfile,
        playermanagement: arPlayermanagement,
        coachmanagement: arCoachmanagement,
        paymentmanagement: arPaymentmanagement,
        agendamanagement: arAgendamanagement,
        contactmanagement: arContactmanagement,
        settings: arSettings,
        notifications: arNotifications,
        auth: arAuth,
        coachagenda: arCoachAgenda,
        coachtraining: arCoachTraining,
        playersidebar: arPlayersidebar,
        playerdashboard: arPlayerdashboard,
        playerprofile: arPlayerprofile,
        playertraining: arPlayertraining,
        playerstats: arPlayerstats,
        playersettings: arPlayersettings,
      },
    },
    fallbackLng: 'en',
    debug: false,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    // defaultNS: 'navbar', // optional default namespace
  })
  .then(() => {
    if (i18n.language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  });

// Listen for language changes to update direction
i18n.on('languageChanged', (lng) => {
  if (lng === 'ar') {
    document.documentElement.setAttribute('dir', 'rtl');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
  }
});

export default i18n;
