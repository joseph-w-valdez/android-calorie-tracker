/**
 * Shared style constants and common style patterns
 */

export const Colors = {
  background: '#000',
  cardBackground: '#1a1a1a',
  inputBackground: '#2a2a2a',
  border: '#333',
  text: '#fff',
  textSecondary: '#aaa',
  textTertiary: '#666',
  primary: '#4a9eff',
  primaryDark: '#3a7fc4',
  success: '#4ade80',
  error: '#f87171',
  divider: '#333',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
} as const;

export const FontSizes = {
  xs: 9,
  sm: 10,
  md: 12,
  base: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  huge: 28,
} as const;

export const CommonStyles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: FontSizes.xl,
    fontWeight: '600' as const,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    color: Colors.text,
    fontSize: FontSizes.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.md,
    alignItems: 'center' as const,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonSecondary: {
    backgroundColor: Colors.inputBackground,
  },
  buttonText: {
    color: Colors.text,
    fontSize: FontSizes.lg,
    fontWeight: '500' as const,
  },
} as const;

