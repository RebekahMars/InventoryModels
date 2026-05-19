export const colors = {
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  danger: '#dc2626',
  dangerHover: '#b91c1c',
  success: '#16a34a',
  warning: '#d97706',
  surface: '#ffffff',
  background: '#f8fafc',
  border: '#e2e8f0',
  borderFocus: '#2563eb',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textDisabled: '#94a3b8',
  backdrop: 'rgba(0, 0, 0, 0.3)',
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
} as const;

export const radius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
} as const;

export const font = {
  sm: '13px',
  md: '14px',
  lg: '16px',
  lineHeight: '1.5',
} as const;

export const zIndex = {
  backdrop: 500,
  modalWrapper: 700,
  modal: 100,
} as const;
