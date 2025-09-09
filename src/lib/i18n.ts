// Translation loader utility
export interface TranslationModule {
  [key: string]: any;
}

// Import all translation modules
import adminSidebarTh from '@/i18n/th/adminSidebar.json';
import adminSidebarEn from '@/i18n/en/adminSidebar.json';
import footerTh from '@/i18n/th/footer.json';
import footerEn from '@/i18n/en/footer.json';
import headerTh from '@/i18n/th/header.json';
import headerEn from '@/i18n/en/header.json';
import layoutTh from '@/i18n/th/layout.json';
import layoutEn from '@/i18n/en/layout.json';
import commonTh from '@/i18n/th/common.json';
import commonEn from '@/i18n/en/common.json';
import adminDashboardTh from '@/i18n/th/adminDashboard.json';
import adminDashboardEn from '@/i18n/en/adminDashboard.json';
import adminEventFormTh from '@/i18n/th/adminEventForm.json';
import adminEventFormEn from '@/i18n/en/adminEventForm.json';
import adminEventsTh from '@/i18n/th/adminEvents.json';
import adminEventsEn from '@/i18n/en/adminEvents.json';
import adminReportsTh from '@/i18n/th/adminReports.json';
import adminReportsEn from '@/i18n/en/adminReports.json';
import adminTicketsTh from '@/i18n/th/adminTickets.json';
import adminTicketsEn from '@/i18n/en/adminTickets.json';
import adminTicketTypeFormTh from '@/i18n/th/adminTicketTypeForm.json';
import adminTicketTypeFormEn from '@/i18n/en/adminTicketTypeForm.json';
import homeTh from '@/i18n/th/home.json';
import homeEn from '@/i18n/en/home.json';
import eventsTh from '@/i18n/th/events.json';
import eventsEn from '@/i18n/en/events.json';
import eventDetailTh from '@/i18n/th/eventDetail.json';
import eventDetailEn from '@/i18n/en/eventDetail.json';
import eventBookingTh from '@/i18n/th/eventBooking.json';
import eventBookingEn from '@/i18n/en/eventBooking.json';
import loginTh from '@/i18n/th/login.json';
import loginEn from '@/i18n/en/login.json';
import myTicketsTh from '@/i18n/th/myTickets.json';
import myTicketsEn from '@/i18n/en/myTickets.json';
import notFoundTh from '@/i18n/th/notFound.json';
import notFoundEn from '@/i18n/en/notFound.json';
import eventsComponentsTh from '@/i18n/th/eventsComponents.json';
import eventsComponentsEn from '@/i18n/en/eventsComponents.json';
import mapsComponentsTh from '@/i18n/th/mapsComponents.json';
import mapsComponentsEn from '@/i18n/en/mapsComponents.json';
import paymentComponentsTh from '@/i18n/th/paymentComponents.json';
import paymentComponentsEn from '@/i18n/en/paymentComponents.json';
import ticketsComponentsTh from '@/i18n/th/ticketsComponents.json';
import ticketsComponentsEn from '@/i18n/en/ticketsComponents.json';

// Combine all translations by language
export const translations = {
  th: {
    ...commonTh,
    ...adminSidebarTh,
    footer: footerTh,
    header: headerTh,
    layout: layoutTh,
    adminDashboard: adminDashboardTh,
    adminEventForm: adminEventFormTh,
    adminEvents: adminEventsTh,
    adminReports: adminReportsTh,
    adminTickets: adminTicketsTh,
    adminTicketTypeForm: adminTicketTypeFormTh,
    home: homeTh,
    events: eventsTh,
    eventDetail: eventDetailTh,
    eventBooking: eventBookingTh,
    login: loginTh,
    myTickets: myTicketsTh,
    notFound: notFoundTh,
    eventsComponents: eventsComponentsTh,
    mapsComponents: mapsComponentsTh,
    paymentComponents: paymentComponentsTh,
    ticketsComponents: ticketsComponentsTh,
  },
  en: {
    ...commonEn,
    ...adminSidebarEn,
    footer: footerEn,
    header: headerEn,
    layout: layoutEn,
    adminDashboard: adminDashboardEn,
    adminEventForm: adminEventFormEn,
    adminEvents: adminEventsEn,
    adminReports: adminReportsEn,
    adminTickets: adminTicketsEn,
    adminTicketTypeForm: adminTicketTypeFormEn,
    home: homeEn,
    events: eventsEn,
    eventDetail: eventDetailEn,
    eventBooking: eventBookingEn,
    login: loginEn,
    myTickets: myTicketsEn,
    notFound: notFoundEn,
    eventsComponents: eventsComponentsEn,
    mapsComponents: mapsComponentsEn,
    paymentComponents: paymentComponentsEn,
    ticketsComponents: ticketsComponentsEn,
  },
};

// Translation function with nested key support
export const translate = (language: 'th' | 'en', key: string): string => {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
};
