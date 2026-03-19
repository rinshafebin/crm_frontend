export const CALL_ALLOWED_ROLES = [
  'ADMIN','BUSINESS_HEAD','OPS','ADM_MANAGER','ADM_EXEC','BDM','CM','FOE',
];

export const CALL_HISTORY_ROLES = [
  'ADMIN','BUSINESS_HEAD','OPS','ADM_MANAGER','ADM_EXEC','BDM','CM','FOE','HR',
];

export const INCOMING_CALL_ROLES = [
  'ADMIN','BUSINESS_HEAD','OPS','ADM_MANAGER','ADM_EXEC','BDM','CM','FOE',
];

export const CALL_ANALYTICS_ROLES = [
  'ADMIN','BUSINESS_HEAD','OPS','CM',
];

export const CALL_RECORDING_ROLES = [
  'ADMIN','BUSINESS_HEAD','OPS','CM',
];

const n = (r) => (r || '').toUpperCase().trim();

export const canMakeCall          = (r) => CALL_ALLOWED_ROLES.includes(n(r));
export const canViewCallHistory   = (r) => CALL_HISTORY_ROLES.includes(n(r));
export const canReceiveIncoming   = (r) => INCOMING_CALL_ROLES.includes(n(r));
export const canViewCallAnalytics = (r) => CALL_ANALYTICS_ROLES.includes(n(r));
export const canPlayRecording     = (r) => CALL_RECORDING_ROLES.includes(n(r));

/** 'full' | 'history-only' | 'none' */
export const getCallAccess = (r) => {
  if (canMakeCall(r))        return 'full';
  if (canViewCallHistory(r)) return 'history-only';
  return 'none';
};

export const ROLE_LABELS = {
  ADMIN:'Administrator', BUSINESS_HEAD:'Business Head',
  OPS:'Operations', ADM_MANAGER:'Admissions Manager',
  ADM_EXEC:'Admissions Executive', MEDIA:'Media',
  TRAINER:'Trainer', BDM:'Business Development Manager',
  CM:'Center Manager', HR:'Human Resources',
  FOE:'Front Office Executive', ACCOUNTS:'Accounts',
};
export const getRoleLabel = (r) => ROLE_LABELS[n(r)] || n(r);