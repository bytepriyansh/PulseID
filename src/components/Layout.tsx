import React from 'react';
import Navigation from './Navigation';
import { useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

interface LayoutProps {
  children: React.ReactNode;
  hideNavigation?: boolean;
}

const Layout = ({ children, hideNavigation = false }: LayoutProps) => {
  const { isSignedIn } = useUser();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Only show navigation if user is signed in, not on home page, and not explicitly hidden
  const showNavigation = isSignedIn && !isHomePage && !hideNavigation;

  return (
    <div className="min-h-screen bg-slate-50">
      {showNavigation && <Navigation className="print:hidden" />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
