export const logError = (message: string, error?: any) => {
  console.log('🚨 LOG_ERROR:', message, error);
  // Futur : envoyer vers Sentry, Crashlytics ou Datadog
};
