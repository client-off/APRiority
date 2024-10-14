import { useIntegration } from '@telegram-apps/react-router-integration';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import {
  bindMiniAppCSSVars,
  bindThemeParamsCSSVars,
  bindViewportCSSVars,
  initNavigator, useLaunchParams,
  useMiniApp,
  useThemeParams,
  useViewport,
} from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { type FC, useEffect, useMemo } from 'react';
import {
  Navigate,
  Route,
  Router,
  Routes,
} from 'react-router-dom';

import { routes } from '@/navigation/routes.tsx';
import { postEvent } from '@telegram-apps/bridge'

export const App: FC = () => {
  
  const lp = useLaunchParams();
  const miniApp = useMiniApp();
  const themeParams = useThemeParams();
  const viewport = useViewport();

  useEffect(() => {
    return bindMiniAppCSSVars(miniApp, themeParams);
  }, [miniApp, themeParams]);

  useEffect(() => {
    return bindThemeParamsCSSVars(themeParams);
  }, [themeParams]);

  useEffect(() => {
    return viewport && bindViewportCSSVars(viewport);
  }, [viewport]);

  // Create a new application navigator and attach it to the browser history, so it could modify
  // it and listen to its changes.
  const navigator = useMemo(() => initNavigator('app-navigation-state'), []);
  const [location, reactNavigator] = useIntegration(navigator);

  // Don't forget to attach the navigator to allow it to control the BackButton state as well
  // as browser history.
  // useEffect(() => {
  //   navigator.attach();
  //   return () => navigator.detach();
  // }, []);

  useEffect(() => {
    if (miniApp.isDark) {
        document.body.classList.add('dark-theme');
        postEvent('web_app_set_header_color', {
          color: '#1C1C1C'
        });
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme'); // Удаляем класс для светлой темы
        postEvent('web_app_set_header_color', {
          color: '#FFFFFF'
        });
        localStorage.setItem('theme', 'light');
    }
}, [miniApp.isDark]);

  return (
    <TonConnectUIProvider manifestUrl="https://gist.githubusercontent.com/client-off/447f7c60e7c4866edaa1daae1ffdafe6/raw/4841bbfab996aa6b45134124fe3a9b1296f74a5b/apriority-tcm.json">
    <AppRoot
      appearance={miniApp.isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
    >
      <Router location={location} navigator={reactNavigator}>
        <Routes>
          {routes.map((route) => <Route key={route.path} {...route} />)}
          <Route path='*' element={<Navigate to='/'/>}/>
        </Routes>
      </Router>
    </AppRoot>
    </TonConnectUIProvider>
  );
};
