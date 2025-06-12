import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ProfileProvider } from './contexts/ProfileContext.tsx';
import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
    throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById("root")!).render(
    <ProfileProvider>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/'>
            <App />
        </ClerkProvider>    </ProfileProvider>
);
