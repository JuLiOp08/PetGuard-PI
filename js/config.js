export const APP_NAME = 'PetGuard';
export const DB_NAME = 'petguard_db';
export const DB_VERSION = 2;
export const PROFILE_ID = 'owner_local';

export const PET_STATUSES = Object.freeze({
  SAFE: 'safe',
  LOST: 'lost',
  FOUND: 'found'
});

export const ALERT_STATUSES = Object.freeze({
  ACTIVE: 'active',
  PAUSED: 'paused',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled'
});

export const SIGHTING_CONFIDENCE = Object.freeze(['low', 'medium', 'high']);
export const SIGHTING_REVIEW_STATUSES = Object.freeze(['new', 'in_review', 'relevant', 'discarded']);

export const LOCATION_FRESHNESS = Object.freeze({
  RECENT_MINUTES: 15,
  INTERMEDIATE_MINUTES: 60
});
