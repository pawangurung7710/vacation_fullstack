import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CmsBreadcrumbs } from './Breadcrumbs';
import { ThemeProvider } from '../theme/ThemeProvider';
import { authApi } from '../../services/api';
import { ensureEditorFonts } from '../../utils/editor-fonts';
import { toast } from 'sonner';
import { Skeleton } from '../../components/ui/skeleton';

interface CmsLayoutProps {
  children: ReactNode;
}

export function CmsLayout({ children }: CmsLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // The blog editor's typography picker needs the full font set.
  useEffect(() => { ensureEditorFonts(); }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      const shouldRefreshAccessToken = (() => {
        if (!token) return true;
        try {
          const [, payloadB64] = token.split('.');
          if (!payloadB64) return true;
          const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
          const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
          const payloadJson = atob(padded);
          const payload = JSON.parse(payloadJson) as { exp?: number };
          if (!payload.exp) return true;
          const expiresAtMs = payload.exp * 1000;
          return expiresAtMs - Date.now() < 60_000; // refresh if < 60s remaining
        } catch {
          return true;
        }
      })();

      if (refreshToken && shouldRefreshAccessToken) {
        try {
          const refreshed = await authApi.refresh(refreshToken);
          if (refreshed?.accessToken) {
            localStorage.setItem('accessToken', refreshed.accessToken);
          }
          if (refreshed?.refreshToken) {
            localStorage.setItem('refreshToken', refreshed.refreshToken);
          }
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          navigate('/cms');
          toast.error('Session expired. Please login again.');
          setLoading(false);
          return;
        }
      }

      if (!localStorage.getItem('accessToken')) {
        navigate('/cms');
        setLoading(false);
        return;
      }

      try {
        const userData = await authApi.getMe();
        const currentUser = userData.user || userData;

        if (currentUser.role !== 'admin') {
          toast.error('Access denied. Only admin users can access the CMS.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          navigate('/cms');
          return;
        }

        localStorage.setItem('user', JSON.stringify(currentUser));
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        navigate('/cms');
        toast.error('Session expired. Please login again.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex">
          <div className="w-64 border-r border-[var(--cms-border)] p-4 space-y-4" style={{
            background: 'linear-gradient(135deg, #4a90e2 0%, #7b68ee 50%, #9370db 100%)',
          }}>
            <Skeleton className="h-8 w-32 bg-white/20" />
            <Skeleton className="h-10 w-full bg-white/20" />
            <Skeleton className="h-10 w-full bg-white/20" />
            <Skeleton className="h-10 w-full bg-white/20" />
          </div>
          <div 
            className="flex-1 p-8"
            style={{
              background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 50%, #f8f9fa 100%)',
            }}
          >
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </ThemeProvider>
    );
  }

  const isStepperPage =
    location.pathname.includes('/trips/new') ||
    location.pathname.match(/\/trips\/[^/]+$/) ||
    location.pathname.includes('/trips/preview');
  const hideBreadcrumbs =
    location.pathname.startsWith('/cms/trips/categories') ||
    location.pathname.startsWith('/cms/trips/subcategories');

  return (
    <ThemeProvider>
      <div className="min-h-screen flex" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div 
          className="flex-1 flex flex-col overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #f7f8fb 0%, #f3f5fa 45%, #f8f9fc 100%)',
          }}
        >
          <Topbar />
          <main
            className="relative flex-1 overflow-y-auto"
            style={{ fontSize: `calc(1rem * var(--cms-font-scale, 1))` }}
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(94,164,212,0.18),_transparent_55%)]" />
            </div>
            {isStepperPage ? (
              <div className="relative z-10 p-0">
                {children}
              </div>
            ) : (
              <div className="relative z-10 p-6">
                <div className="rounded-3xl border border-slate-200/70 bg-[linear-gradient(180deg,_#ffffff_0%,_#f6f8fc_100%)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
                  {!hideBreadcrumbs && (
                    <div className="mb-4">
                      <CmsBreadcrumbs />
                    </div>
                  )}
                  {children}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
