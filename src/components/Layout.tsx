import React from 'react';
import Navigation from './Navigation';
import { useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isSignedIn } = useUser();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Only show navigation if user is signed in and not on home page
  const showNavigation = isSignedIn && !isHomePage;

  return (
    <div className="min-h-screen bg-slate-50">
      {showNavigation && <Navigation />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
