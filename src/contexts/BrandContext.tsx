import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { applyBrandTokens, DEFAULT_BRAND, WorkspaceBrand } from '../lib/brand';
import { logError } from '../utils/errorHandling';

interface BrandContextType {
  brand: WorkspaceBrand;
  loading: boolean;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [brand, setBrand] = useState<WorkspaceBrand>(DEFAULT_BRAND);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const applyDefault = () => {
      if (cancelled) return;
      setBrand(DEFAULT_BRAND);
      setLoading(false);
    };

    async function loadBrand() {
      if (!user) {
        applyDefault();
        return;
      }

      setLoading(true);

      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('workspace_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!profile?.workspace_id) {
          applyDefault();
          return;
        }

        const { data: workspace, error: workspaceError } = await supabase
          .from('workspaces')
          .select('name, platform_label, logo_url, primary_color, secondary_color, background_color')
          .eq('id', profile.workspace_id)
          .maybeSingle();

        if (workspaceError) throw workspaceError;

        if (!workspace) {
          applyDefault();
          return;
        }

        if (!cancelled) {
          setBrand({
            name: workspace.name || DEFAULT_BRAND.name,
            platformLabel: workspace.platform_label || DEFAULT_BRAND.platformLabel,
            logoUrl: workspace.logo_url || '',
            primaryColor: workspace.primary_color || DEFAULT_BRAND.primaryColor,
            secondaryColor: workspace.secondary_color || DEFAULT_BRAND.secondaryColor,
            backgroundColor: workspace.background_color || DEFAULT_BRAND.backgroundColor,
          });
          setLoading(false);
        }
      } catch (error) {
        // Fail open to the default brand — a branding problem should never
        // make the app unusable.
        logError(error, 'BrandContext - loadBrand');
        applyDefault();
      }
    }

    loadBrand();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Push the brand colors into the runtime theme tokens.
  useEffect(() => {
    applyBrandTokens(brand);
  }, [brand]);

  return (
    <BrandContext.Provider value={{ brand, loading }}>
      {children}
    </BrandContext.Provider>
  );
}

/**
 * Returns the active workspace brand. Fails soft: outside a BrandProvider
 * (e.g. dev preview routes) it returns the default brand instead of
 * throwing.
 */
export function useBrand(): BrandContextType {
  const context = useContext(BrandContext);
  return context ?? { brand: DEFAULT_BRAND, loading: false };
}
