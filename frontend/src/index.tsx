import ReactDOM from 'react-dom/client';

import { Root } from '@/components/Root';

// Uncomment this import in case, you would like to develop the application even outside
// the Telegram application, just in your browser.
import './mockEnv.ts';

import './index.css';

import { LanguageProvider } from './pages/LanguagePage/LanguageContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <LanguageProvider>
        <Root />
    </LanguageProvider>
);
