import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import { createRoot } from 'react-dom/client';

import Header from '@edx/frontend-component-header';
import { FooterSlot } from '@edx/frontend-component-footer';
import messages from './i18n';
import AdminConsolePage from './AdminConsolePage';

import './index.scss';

const root = createRoot(document.getElementById('root'));

subscribe(APP_READY, () => {
  root.render(
    <AppProvider>
      <Header />
      <AdminConsolePage />
      <FooterSlot />
    </AppProvider>,
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  root.render(<ErrorPage message={error.message} />);
});

initialize({
  messages,
});
