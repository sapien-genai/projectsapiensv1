/**
 * Workspace brand model + runtime theme-token application.
 *
 * The app's colors all flow from CSS custom properties defined in
 * src/index.css (--accent, --info, --surface, plus their -rgb twins used
 * by Tailwind opacity utilities). White-labeling works by overriding those
 * tokens at runtime with the workspace's colors — every component that
 * uses token-backed utilities (and the --brand-* aliases) follows along.
 */

export interface WorkspaceBrand {
  name: string;
  platformLabel: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
}

/** Matches the seeded 'project-sapiens' workspace and the stylesheet defaults. */
export const DEFAULT_BRAND: WorkspaceBrand = {
  name: 'Project Sapiens Academy',
  platformLabel: 'Project Sapiens',
  logoUrl: '',
  primaryColor: '#FF6A00',
  secondaryColor: '#0A74FF',
  backgroundColor: '#F4F4F4',
};

/**
 * The user-facing label for the active brand: the platform label for the
 * default workspace, the workspace's own name for white-label tenants.
 */
export function brandDisplayLabel(brand: WorkspaceBrand): string {
  return brand.name === DEFAULT_BRAND.name ? brand.platformLabel : brand.name;
}

/** Builds a document title like 'Billing & Usage – Project Sapiens'. */
export function formatPageTitle(page: string, brand: WorkspaceBrand): string {
  return `${page} – ${brandDisplayLabel(brand)}`;
}

/** Parses '#rgb' or '#rrggbb' into an 'r g b' triplet, or null if invalid. */
export function hexToRgbTriplet(hex: string): string | null {
  const normalized = hex.trim().replace(/^#/, '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return null;

  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/** Token pairs driven by the workspace brand colors. */
const BRAND_TOKEN_MAP: Array<{
  key: keyof Pick<WorkspaceBrand, 'primaryColor' | 'secondaryColor' | 'backgroundColor'>;
  token: string;
}> = [
  { key: 'primaryColor', token: '--accent' },
  { key: 'secondaryColor', token: '--info' },
  { key: 'backgroundColor', token: '--surface' },
];

/**
 * Applies a workspace brand to the root element's theme tokens.
 * Passing the default brand clears the inline overrides so the
 * stylesheet values (including dark mode rules) take over again.
 */
export function applyBrandTokens(brand: WorkspaceBrand): void {
  const root = document.documentElement;

  for (const { key, token } of BRAND_TOKEN_MAP) {
    const value = brand[key];
    const triplet = hexToRgbTriplet(value);
    const isDefault = value.toLowerCase() === DEFAULT_BRAND[key].toLowerCase();

    if (isDefault || !triplet) {
      root.style.removeProperty(token);
      root.style.removeProperty(`${token}-rgb`);
    } else {
      root.style.setProperty(token, value);
      root.style.setProperty(`${token}-rgb`, triplet);
    }
  }
}
