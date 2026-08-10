import * as FbrReact from 'react';
import { getConfig as getFbrConfig } from '@edx/frontend-platform';
import {
  getAuthenticatedHttpClient as getFbrAuthenticatedHttpClient,
  getAuthenticatedUser as getFbrAuthenticatedUser,
} from '@edx/frontend-platform/auth';
import React, { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';

import { getConfig } from '@edx/frontend-platform';
import { Icon } from '@openedx/paragon';
import { Nightlight, WbSunny } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

function addPlugins(config, slot_name, plugins) {
  if (slot_name in config.pluginSlots === false) {
    config.pluginSlots[slot_name] = {
      keepDefault: true,
      plugins: []
    };
  }

  config.pluginSlots[slot_name].plugins.push(...plugins);
}const FBR_PROFILE_ME_PATH = '/fbr/api/biodata/v1/users/me/';
const FBR_BIODATA_API_PATH = '/fbr/api/biodata';
const FBR_DECLARATION_PATH = 'v1/declaration/';
const FBR_COURSES_LABEL = 'Courses';
const FBR_PROGRAMS_LABEL = 'Programs';
const FBR_DISCOVER_NEW_LABEL = 'Discover New';
const FBR_CALENDAR_LABEL = 'Calendar';
const FBR_STUDIO_LABEL = 'Studio';
const FBR_ADMIN_CONSOLE_LABEL = 'Admin Console';
const FBR_DASHBOARD_LABEL = 'Dashboard';
const FBR_PROFILE_LABEL = 'Profile';
const FBR_ACCOUNT_LABEL = 'Account';
const FBR_ORDER_HISTORY_LABEL = 'Order History';
const FBR_LOGOUT_LABEL = 'Logout';
let fbrRequiredProfileStatusPromise = null;

function getFbrProfileMeUrl() {
  const { LMS_BASE_URL } = getFbrConfig();

  if (!LMS_BASE_URL) {
    return null;
  }

  return `${LMS_BASE_URL.replace(/\/$/, '')}${FBR_PROFILE_ME_PATH}`;
}

function getFbrAdminConsoleUrl() {
  return getFbrConfig().FBR_ADMIN_BASE_URL
    || getFbrConfig().FBR_ADMIN_MICROFRONTEND_URL
    || null;
}

function getFbrLogoutUrl() {
  return getFbrConfig().LOGOUT_URL || '/logout';
}

function getFbrDashboardUrl() {
  const {
    LEARNER_DASHBOARD_URL,
    LEARNER_HOME_MICROFRONTEND_URL,
    LMS_BASE_URL,
  } = getFbrConfig();

  return LEARNER_DASHBOARD_URL
    || LEARNER_HOME_MICROFRONTEND_URL
    || `${LMS_BASE_URL.replace(/\/$/, '')}/dashboard`;
}

function getFbrProgramsUrl() {
  const { LMS_BASE_URL } = getFbrConfig();

  return `${LMS_BASE_URL.replace(/\/$/, '')}/dashboard/programs`;
}

function getFbrDiscoverUrl() {
  const { LMS_BASE_URL } = getFbrConfig();

  return `${LMS_BASE_URL.replace(/\/$/, '')}/courses`;
}

function getFbrBiodataUrl(path) {
  const { LMS_BASE_URL, BIODATA_API_BASE_URL } = getFbrConfig();
  const baseUrl = BIODATA_API_BASE_URL || (LMS_BASE_URL ? `${LMS_BASE_URL.replace(/\/$/, '')}${FBR_BIODATA_API_PATH}` : null);

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

function getFbrOwnProfileUrl() {
  const { ACCOUNT_PROFILE_URL } = getFbrConfig();
  const authenticatedUser = getFbrAuthenticatedUser();

  if (!ACCOUNT_PROFILE_URL || !authenticatedUser?.username) {
    return null;
  }

  return `${ACCOUNT_PROFILE_URL.replace(/\/$/, '')}/u/${encodeURIComponent(authenticatedUser.username)}`;
}

function normalizeFbrHeaderPath(value) {
  try {
    const url = new URL(value, window.location.origin);
    return url.pathname.replace(/\/+$/, '') || '/';
  } catch {
    return '/';
  }
}

function isFbrProfileUrl(url) {
  const profileUrl = getFbrOwnProfileUrl();

  if (!profileUrl) {
    return false;
  }

  const targetPath = normalizeFbrHeaderPath(url);
  const profilePath = normalizeFbrHeaderPath(profileUrl);

  return targetPath === profilePath;
}

function isFbrLogoutUrl(url) {
  return normalizeFbrHeaderPath(url) === normalizeFbrHeaderPath(getFbrLogoutUrl());
}

function isFbrHeaderMenuItemActive(href) {
  const currentPath = normalizeFbrHeaderPath(window.location.href);
  const targetPath = normalizeFbrHeaderPath(href);

  if (targetPath === '/') {
    return currentPath === targetPath;
  }

  if (targetPath === '/dashboard' && currentPath.startsWith('/learner-dashboard')) {
    return true;
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

function buildFbrMainMenuItems(isFbrAdmin) {
  const items = [
    {
      type: 'item',
      href: getFbrDashboardUrl(),
      content: FBR_COURSES_LABEL,
      isActive: isFbrHeaderMenuItemActive(getFbrDashboardUrl()),
    },
  ];

  if (getFbrConfig().ENABLE_PROGRAMS) {
    const href = getFbrProgramsUrl();
    items.push({
      type: 'item',
      href,
      content: FBR_PROGRAMS_LABEL,
      isActive: isFbrHeaderMenuItemActive(href),
    });
  }

  if (!getFbrConfig().NON_BROWSABLE_COURSES) {
    const href = getFbrDiscoverUrl();
    items.push({
      type: 'item',
      href,
      content: FBR_DISCOVER_NEW_LABEL,
      isActive: isFbrHeaderMenuItemActive(href),
    });
  }

  if (getFbrConfig().SESSIONS_BASE_URL) {
    const href = getFbrConfig().SESSIONS_BASE_URL;
    items.push({
      type: 'item',
      href,
      content: FBR_CALENDAR_LABEL,
      isActive: isFbrHeaderMenuItemActive(href),
    });
  }

  if (isFbrAdmin && getFbrConfig().STUDIO_BASE_URL) {
    const href = getFbrConfig().STUDIO_BASE_URL;
    items.push({
      type: 'item',
      href,
      content: FBR_STUDIO_LABEL,
      isActive: isFbrHeaderMenuItemActive(href),
    });
  }

  if (isFbrAdmin && getFbrAdminConsoleUrl() && window.location.pathname.includes('/fbr-admin')) {
    const href = getFbrAdminConsoleUrl();
    items.push({
      type: 'item',
      href,
      content: FBR_ADMIN_CONSOLE_LABEL,
      isActive: isFbrHeaderMenuItemActive(href),
    });
  }

  return items;
}

function buildFbrDesktopUserMenu(isFbrAdmin, isRequiredProfileNavigationLocked) {
  if (isRequiredProfileNavigationLocked) {
    return [
      {
        heading: '',
        items: [{
          type: 'item',
          href: getFbrLogoutUrl(),
          content: FBR_LOGOUT_LABEL,
          isActive: isFbrHeaderMenuItemActive(getFbrLogoutUrl()),
        }],
      },
    ];
  }

  const authenticatedUser = getFbrAuthenticatedUser();
  const items = [];

  if (authenticatedUser?.username) {
    items.push({
      type: 'item',
      href: getFbrDashboardUrl(),
      content: FBR_DASHBOARD_LABEL,
      isActive: isFbrHeaderMenuItemActive(getFbrDashboardUrl()),
    });

    const profileUrl = getFbrOwnProfileUrl();
    if (profileUrl) {
      items.push({
        type: 'item',
        href: profileUrl,
        content: FBR_PROFILE_LABEL,
        isActive: isFbrHeaderMenuItemActive(profileUrl),
      });
    }
  }

  if (getFbrConfig().ACCOUNT_SETTINGS_URL) {
    items.push({
      type: 'item',
      href: getFbrConfig().ACCOUNT_SETTINGS_URL,
      content: FBR_ACCOUNT_LABEL,
      isActive: isFbrHeaderMenuItemActive(getFbrConfig().ACCOUNT_SETTINGS_URL),
    });
  }

  if (getFbrConfig().ORDER_HISTORY_URL) {
    items.push({
      type: 'item',
      href: getFbrConfig().ORDER_HISTORY_URL,
      content: FBR_ORDER_HISTORY_LABEL,
      isActive: isFbrHeaderMenuItemActive(getFbrConfig().ORDER_HISTORY_URL),
    });
  }

  items.push({
    type: 'item',
    href: getFbrLogoutUrl(),
    content: FBR_LOGOUT_LABEL,
    isActive: isFbrHeaderMenuItemActive(getFbrLogoutUrl()),
  });

  return [{
    heading: '',
    items,
  }];
}

function buildFbrLearningUserMenu(isFbrAdmin, isRequiredProfileNavigationLocked) {
  if (isRequiredProfileNavigationLocked) {
    return [{
      message: FBR_LOGOUT_LABEL,
      href: getFbrLogoutUrl(),
    }];
  }

  const items = [];

  items.push({
    message: FBR_LOGOUT_LABEL,
    href: getFbrLogoutUrl(),
  });

  return items;
}

function getFbrRequiredProfileStatus() {
  if (fbrRequiredProfileStatusPromise) {
    return fbrRequiredProfileStatusPromise;
  }

  const profileMeUrl = getFbrProfileMeUrl();

  if (!profileMeUrl) {
    fbrRequiredProfileStatusPromise = Promise.resolve({
      isStpTrainee: false,
      isRequiredProfileComplete: true,
    });
    return fbrRequiredProfileStatusPromise;
  }

  fbrRequiredProfileStatusPromise = getFbrAuthenticatedHttpClient().get(profileMeUrl)
    .then(({ data: meData }) => {
      if (!meData?.id) {
        return {
          isStpTrainee: false,
          isRequiredProfileComplete: true,
        };
      }

      const profileDetailUrl = getFbrBiodataUrl(`v1/users/${meData.id}/`);
      const declarationUrl = getFbrBiodataUrl(FBR_DECLARATION_PATH);

      if (!profileDetailUrl || !declarationUrl) {
        return {
          isStpTrainee: false,
          isRequiredProfileComplete: true,
        };
      }

      return Promise.all([
        getFbrAuthenticatedHttpClient().get(profileDetailUrl),
        getFbrAuthenticatedHttpClient().get(declarationUrl).catch(() => ({ data: {} })),
      ]).then(([profileResponse, declarationResponse]) => {
        const isStpTrainee = profileResponse.data?.trainee_profile?.trainee_type === 'stp';
        return {
          isStpTrainee,
          isRequiredProfileComplete: !isStpTrainee || Boolean(declarationResponse.data?.is_submitted),
        };
      });
    })
    .catch(() => ({
      isStpTrainee: false,
      isRequiredProfileComplete: true,
    }));

  return fbrRequiredProfileStatusPromise;
}

function useFbrAdminAccess() {
  const [isFbrAdmin, setIsFbrAdmin] = FbrReact.useState(false);
  const profileMeUrl = getFbrProfileMeUrl();
  const authenticatedUser = getFbrAuthenticatedUser();

  FbrReact.useEffect(() => {
    let isMounted = true;

    if (authenticatedUser?.administrator) {
      setIsFbrAdmin(true);
      return () => {
        isMounted = false;
      };
    }

    if (!profileMeUrl) {
      setIsFbrAdmin(false);
      return () => {
        isMounted = false;
      };
    }

    getFbrAuthenticatedHttpClient().get(profileMeUrl)
      .then(({ data }) => {
        if (isMounted) {
          setIsFbrAdmin(Boolean(data?.is_admin));
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsFbrAdmin(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [authenticatedUser?.administrator, profileMeUrl]);

  return isFbrAdmin;
}

function useFbrIsMobile() {
  const getIsMobile = () => (typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [isMobile, setIsMobile] = FbrReact.useState(getIsMobile);

  FbrReact.useEffect(() => {
    const handleResize = () => setIsMobile(getIsMobile());

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

function useFbrRequiredProfileNavigationLock() {
  const [isNavigationLocked, setIsNavigationLocked] = FbrReact.useState(false);

  FbrReact.useEffect(() => {
    let isMounted = true;

    getFbrRequiredProfileStatus().then((status) => {
      if (isMounted) {
        setIsNavigationLocked(status.isStpTrainee && !status.isRequiredProfileComplete);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return isNavigationLocked;
}

const fbrActiveMainNavStyle = {
  borderBottom: '2px solid currentColor',
  fontWeight: 600,
};

function FbrDesktopMainMenu() {
  const isFbrAdmin = useFbrAdminAccess();
  const isRequiredProfileNavigationLocked = useFbrRequiredProfileNavigationLock();
  const menu = isRequiredProfileNavigationLocked ? [] : buildFbrMainMenuItems(isFbrAdmin);

  return (
    <>
      {menu.map((item) => (
        <a
          key={item.href}
          className={`nav-link${item.isActive ? ' active' : ''}`}
          href={item.href}
          aria-current={item.isActive ? 'page' : undefined}
          style={item.isActive ? fbrActiveMainNavStyle : undefined}
        >
          {item.content}
        </a>
      ))}
    </>
  );
}

function FbrMobileMainMenu() {
  const isFbrAdmin = useFbrAdminAccess();
  const isRequiredProfileNavigationLocked = useFbrRequiredProfileNavigationLock();
  const menu = isRequiredProfileNavigationLocked ? [] : buildFbrMainMenuItems(isFbrAdmin);

  return (
    <>
      {menu.map((item) => (
        <li className="nav-item" key={item.href}>
          <a
            className={`nav-link${item.isActive ? ' active' : ''}`}
            href={item.href}
            aria-current={item.isActive ? 'page' : undefined}
            style={item.isActive ? fbrActiveMainNavStyle : undefined}
          >
            {item.content}
          </a>
        </li>
      ))}
    </>
  );
}

function FbrDesktopUserMenu({ component }) {
  const isFbrAdmin = useFbrAdminAccess();
  const isRequiredProfileNavigationLocked = useFbrRequiredProfileNavigationLock();
  const menu = buildFbrDesktopUserMenu(isFbrAdmin, isRequiredProfileNavigationLocked);

  return FbrReact.cloneElement(component, { menu });
}

function FbrMobileUserMenu({ component }) {
  const isFbrAdmin = useFbrAdminAccess();
  const isRequiredProfileNavigationLocked = useFbrRequiredProfileNavigationLock();
  const menu = buildFbrDesktopUserMenu(isFbrAdmin, isRequiredProfileNavigationLocked);

  return FbrReact.cloneElement(component, { menu });
}

function FbrLearningUserMenu({ component }) {
  const isFbrAdmin = useFbrAdminAccess();
  const isRequiredProfileNavigationLocked = useFbrRequiredProfileNavigationLock();
  const items = buildFbrLearningUserMenu(isFbrAdmin, isRequiredProfileNavigationLocked);

  return FbrReact.cloneElement(component, { items });
}

const fbrLearningNavStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  marginRight: '1rem',
  flexWrap: 'wrap',
};

const fbrLearningMobileMenuStyle = {
  position: 'absolute',
  top: '100%',
  right: 0,
  zIndex: 1000,
  minWidth: '14rem',
};

function FbrLearningNavigation() {
  const isFbrAdmin = useFbrAdminAccess();
  const isRequiredProfileNavigationLocked = useFbrRequiredProfileNavigationLock();
  const isMobile = useFbrIsMobile();
  const [isOpen, setIsOpen] = FbrReact.useState(false);
  const menuItems = isRequiredProfileNavigationLocked ? [] : buildFbrMainMenuItems(isFbrAdmin);

  FbrReact.useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  if (menuItems.length === 0) {
    return null;
  }

  if (!isMobile) {
    return (
      <nav aria-label="FBR navigation" style={fbrLearningNavStyle}>
        {menuItems.map((item) => (
          <a
            key={item.href}
            className={`text-gray-700${item.isActive ? ' font-weight-bold' : ''}`}
            href={item.href}
            aria-current={item.isActive ? 'page' : undefined}
            style={item.isActive ? fbrActiveMainNavStyle : undefined}
          >
            {item.content}
          </a>
        ))}
      </nav>
    );
  }

  return (
    <div className="position-relative mr-2">
      <button
        type="button"
        className="btn btn-link text-gray-700 p-0"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        Menu
      </button>
      {isOpen && (
        <div className="dropdown-menu show shadow" style={fbrLearningMobileMenuStyle}>
          {menuItems.map((item) => (
            <a
              key={item.href}
              className={`dropdown-item${item.isActive ? ' active' : ''}`}
              href={item.href}
              aria-current={item.isActive ? 'page' : undefined}
              style={item.isActive ? fbrActiveMainNavStyle : undefined}
            >
              {item.content}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function FbrHideDefaultNavigation({ component }) {
  const isRequiredProfileNavigationLocked = useFbrRequiredProfileNavigationLock();

  if (isRequiredProfileNavigationLocked) {
    return null;
  }

  return component;
}

function FbrRequiredProfileNavigationGuard() {
  FbrReact.useEffect(() => {
    let isMounted = true;
    let cleanupGuardListeners = () => {};

    const enforceRequiredProfileRoute = () => {
      const profileUrl = getFbrOwnProfileUrl();

      if (!profileUrl || isFbrProfileUrl(window.location.href)) {
        return;
      }

      window.location.replace(profileUrl);
    };

    getFbrRequiredProfileStatus().then((status) => {
      if (!isMounted || !status.isStpTrainee || status.isRequiredProfileComplete) {
        return;
      }

      enforceRequiredProfileRoute();

      const handleClick = (event) => {
        const link = event.target.closest?.('a[href]');

        if (!link) {
          return;
        }

        const href = link.getAttribute('href');

        if (!href || href.startsWith('#') || isFbrProfileUrl(href) || isFbrLogoutUrl(href)) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        enforceRequiredProfileRoute();
      };

      const handlePopState = () => {
        enforceRequiredProfileRoute();
      };

      document.addEventListener('click', handleClick, true);
      window.addEventListener('popstate', handlePopState);

      cleanupGuardListeners = () => {
        document.removeEventListener('click', handleClick, true);
        window.removeEventListener('popstate', handlePopState);
      };
    });

    return () => {
      isMounted = false;
      cleanupGuardListeners();
    };
  }, []);

  return null;
}function FbrStudioDesktopMainMenu() {
  const isFbrAdmin = useFbrAdminAccess();
  const isRequiredProfileNavigationLocked = useFbrRequiredProfileNavigationLock();
  const menu = isRequiredProfileNavigationLocked ? [] : buildFbrMainMenuItems(isFbrAdmin);

  if (isFbrAdmin && getFbrAdminConsoleUrl()) {
    menu.push({
      type: 'item',
      href: getFbrAdminConsoleUrl(),
      content: FBR_ADMIN_CONSOLE_LABEL,
      isActive: isFbrHeaderMenuItemActive(getFbrAdminConsoleUrl()),
    });
  }

  return (
    <>
      {menu.map((item) => (
        <a
          key={item.href}
          className={`nav-link${item.isActive ? ' active' : ''}`}
          href={item.href}
          aria-current={item.isActive ? 'page' : undefined}
          style={item.isActive ? fbrActiveMainNavStyle : undefined}
        >
          {item.content}
        </a>
      ))}
    </>
  );
}

let themeVariant = 'selected-paragon-theme-variant';

const AddDarkTheme = () => {
  const isThemeToggleEnabled = getConfig().INDIGO_ENABLE_DARK_TOGGLE;

  const addDarkThemeToIframes = () => {
    const iframes = document.getElementsByTagName('iframe');
    const iframesLength = iframes.length;
    if (iframesLength > 0) {
      Array.from({ length: iframesLength }).forEach((_, index) => {
        const style = document.createElement('style');
        style.textContent = `
          body {
            background-color: #0D0D0E;
            color: #ccc;
          }
          a { color: #ccc; }
          a:hover { color: #d3d3d3; }
        `;
        if (iframes[index].contentDocument) {
          iframes[index].contentDocument.head.appendChild(style);
        }
      });
    }
  };

  useEffect(() => {
    const theme = window.localStorage.getItem(themeVariant);

    // - When page loads, Footer loads before MFE content. Since there is no iframe on page,
    // it does not append any class. MutationObserver observes changes in DOM and hence appends dark
    // attributes when iframe is added. After 15 sec, this observer is destroyed to conserve resources.
    // - It has been added outside dark-theme condition so that it can be removed on Component Unmount.
    // - Observer can be passed to `addDarkThemeToIframes` function and disconnected after observing Iframe.
    // This approach has a limitation: the observer first detects the iframe and then detects the docSrc.
    // We need to wait for docSrc to fully load before appending the style tag.
    const observer = new MutationObserver(() => {
      addDarkThemeToIframes();
    });

    if (isThemeToggleEnabled && theme === 'dark') {
      document.documentElement.setAttribute('data-paragon-theme-variant', 'dark');

      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => observer?.disconnect(), 15000); // clear after 15 sec to avoid resource usage
    }

    return () => observer?.disconnect();
  }, []);

  return (<div />);
};

async function setConfig () {
  let config = {
    pluginSlots: {}
  };

  try {
    /* We can't assume FPF exists, as it's not declared as a dependency in all
     * MFEs, so we import it dynamically. In addition, for dynamic imports to
     * work with Webpack all of the code that actually uses the imported module
     * needs to be inside the `try{}` block.
     */
    const { DIRECT_PLUGIN, PLUGIN_OPERATIONS } = await import('@openedx/frontend-plugin-framework');

const IndigoFooter = () => {
  const intl = useIntl();
  const config = getConfig();

  const indigoFooterNavLinks = config.INDIGO_FOOTER_NAV_LINKS || [];

  const messages = {
    "footer.poweredby.text": {
      id: "footer.poweredby.text",
      defaultMessage: "Powered by",
      description: "text for the footer",
    },
    "footer.tutorlogo.altText": {
      id: "footer.tutorlogo.altText",
      defaultMessage: "Runs on Tutor",
      description: "alt text for the footer tutor logo",
    },
    "footer.logo.altText": {
      id: "footer.logo.altText",
      defaultMessage: "Powered by Open edX",
      description: "alt text for the footer logo.",
    },
    "footer.copyright.text": {
      id: "footer.copyright.text",
      defaultMessage: `Copyrights ©${new Date().getFullYear()}. All Rights Reserved.`,
      description: "copyright text for the footer",
    },
  };

  return (
    <div className="wrapper wrapper-footer">
      <footer id="footer" className="tutor-container">
        <div className="footer-top">
          <div className="powered-area">
            <ul className="logo-list">
              <li>{intl.formatMessage(messages["footer.poweredby.text"])}</li>
              <li>
                <a
                  href="https://edly.io/tutor/"
                  rel="noreferrer"
                  target="_blank"
                >
                  <img
                    src={`${config.LMS_BASE_URL}/theming/asset/images/tutor-logo.png`}
                    alt={intl.formatMessage(
                      messages["footer.tutorlogo.altText"]
                    )}
                    width="57"
                  />
                </a>
              </li>
              <li>
                <a href="https://open.edx.org" rel="noreferrer" target="_blank">
                  <img
                    src={`${config.LMS_BASE_URL}/theming/asset/images/openedx-logo.png`}
                    alt={intl.formatMessage(messages["footer.logo.altText"])}
                    width="79"
                  />
                </a>
              </li>
            </ul>
          </div>
          <nav className="nav-colophon">
            <ol>
              {indigoFooterNavLinks.map((link) => (
                <li key={link.url}>
                  <a href={`${link.url.startsWith("http") ? link.url : config.LMS_BASE_URL + link.url}`}>{link.title}</a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
        <span className="copyright-site">
          {intl.formatMessage(messages["footer.copyright.text"])}
        </span>
      </footer>
    </div>
  );
};
const MobileViewHeader = () => {
  const config = getConfig();
  const intl = useIntl();
  const messages = {
    "mobile.view.header.logo.altText": {
      id: "mobile.view.header.logo.altText",
      defaultMessage: "My Open edX",
      description: "alt text for the mobile view header logo",
    },
  };

  const BASE_URL = config.LMS_BASE_URL;

  return (
    <>
      <style>
        {`
          #root .logo-image.logo-white {
            display: none;
          }
          [data-paragon-theme-variant="dark"] #root .logo-image {
            display: none;
          }
          [data-paragon-theme-variant="dark"] #root .logo-white {
            display: block;
          }
          #root .logo .logo-image {
            height: 60px;
          }
        `}
      </style>
      <a href={`${BASE_URL}/dashboard`} title="Open edX" className="logo">
        <img className="logo-image" src={`${BASE_URL}/static/indigo/images/logo.png`} alt={intl.formatMessage(messages["mobile.view.header.logo.altText"])} />
        <img className="logo-image logo-white" src={`${BASE_URL}/static/indigo/images/logo-white.png`} alt={intl.formatMessage(messages["mobile.view.header.logo.altText"])} />
      </a>
    </>
  );
};const ThemedLogo = () => {
  const BASE_URL = getConfig().LMS_BASE_URL;

  return (
    <>
      <style>
        {`
          #root header .logo-image.logo-white {
            display: none !important;
          }
          [data-paragon-theme-variant="dark"] #root header .logo-image {
            display: none;
          }
          [data-paragon-theme-variant="dark"] #root header .logo-white {
            display: block !important;
          }
          #root header .logo {
            margin-right: 30px !important;
            height: fit-content !important;
            top: 0 !important;
            padding-bottom: 4px !important;
          }
          #root header .logo .logo-image {
            height: 60px !important;
          }
          #root .learning-header .container-xl {
            padding: 0 !important;
          }
        `}
      </style>
      <a href={`${BASE_URL}/dashboard`} title="Open edX" className="logo">
        <img
          className="logo-image"
          src={`${BASE_URL}/static/indigo/images/logo.png`}
          alt="Open edX"
        />
        <img
          className="logo-image logo-white"
          src={`${BASE_URL}/static/indigo/images/logo-white.png`}
          alt="Open edX"
        />
      </a>
    </>
  );
};
const ToggleThemeButton = () => {
  const intl = useIntl();
  const [isDarkThemeEnabled, setIsDarkThemeEnabled] = useState(false);

  const themeCookie = 'selected-paragon-theme-variant';
  const themeCookieExpiry = 90; // days
  const isThemeToggleEnabled = getConfig().INDIGO_ENABLE_DARK_TOGGLE;

  const getCookie = (name) => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1];
  };

  const setCookie = (name, value, { domain, path, expires }) => {
    document.cookie = `${name}=${value}; domain=${domain}; path=${path}; expires=${expires.toUTCString()}; SameSite=Lax`;
  };

  const serverURL = new URL(getConfig().LMS_BASE_URL);

  const getCookieExpiry = () => {
    const today = new Date();
    return new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + themeCookieExpiry
    );
  };

  const getCookieOptions = (serverURL) => ({
    domain: serverURL.hostname,
    path: '/',
    expires: getCookieExpiry(),
  });

  const onToggleTheme = () => {
    let theme = '';

    if (getCookie(themeCookie) === 'dark') {
      document.documentElement.setAttribute('data-paragon-theme-variant', 'light');
      setIsDarkThemeEnabled(false);
      theme = 'light';
    } else {
      document.documentElement.setAttribute('data-paragon-theme-variant', 'dark');
      setIsDarkThemeEnabled(true);
      theme = 'dark';
    }

    window.localStorage.setItem(themeCookie, theme);
    setTimeout(() => {
      setCookie(themeCookie, theme, getCookieOptions(serverURL));
      window.location.reload();
    }, 1);
  };

  useEffect(() => {
    if (!getCookie(themeCookie) || getCookie(themeCookie) === 'undefined') {
      return;
    }
    if (getCookie(themeCookie) !== window.localStorage.getItem(themeCookie)) {
      window.localStorage.setItem(themeCookie, getCookie(themeCookie));
      window.location.reload();
    }
  }, []);

  const handleKeyUp = (event) => {
    if (event.key === "Enter") {
      onToggleTheme();
    }
  };

  if (!isThemeToggleEnabled) {
    return <div />;
  }

  const messages = {
    "header.user.theme": {
      id: "header.user.theme",
      defaultMessage: "Toggle Theme",
      description: "Toggle between light and dark theme",
    },
  };

  return (
    <div className="theme-toggle-button mr-3">
      <div className="light-theme-icon">
        <Icon src={WbSunny} />
      </div>
      <div className="toggle-switch">
        <label htmlFor="theme-toggle-checkbox" className="switch">
          <input
            id="theme-toggle-checkbox"
            defaultChecked={getCookie(themeCookie) === "dark"}
            onChange={onToggleTheme}
            onKeyUp={handleKeyUp}
            type="checkbox"
            title={intl.formatMessage(messages["header.user.theme"])}
          />
          <span className="slider round" />
          <span id="theme-label" className="sr-only">{`Switch to ${isDarkThemeEnabled ? "Light" : "Dark"
            } Mode`}</span>
        </label>
      </div>
      <div className="dark-theme-icon">
        <Icon src={Nightlight} />
      </div>
    </div>
  );
};
    addPlugins(config, 'org.openedx.frontend.layout.header_desktop_user_menu.v1', [
    {
      op: PLUGIN_OPERATIONS.Wrap,
      widgetId: 'default_contents',
      wrapper: FbrDesktopUserMenu,
    }
]);
    addPlugins(config, 'org.openedx.frontend.layout.header_mobile_user_menu.v1', [
    {
      op: PLUGIN_OPERATIONS.Wrap,
      widgetId: 'default_contents',
      wrapper: FbrMobileUserMenu,
    }
]);
    addPlugins(config, 'org.openedx.frontend.layout.header_learning_user_menu.v1', [
    {
      op: PLUGIN_OPERATIONS.Wrap,
      widgetId: 'default_contents',
      wrapper: FbrLearningUserMenu,
    }
]);
    addPlugins(config, 'org.openedx.frontend.layout.header_desktop.v1', [
    {
      op: PLUGIN_OPERATIONS.Insert,
      widget: {
        id: 'fbr-required-profile-navigation-guard',
        priority: 1,
        type: DIRECT_PLUGIN,
        RenderWidget: FbrRequiredProfileNavigationGuard,
      },
    }
]);
    addPlugins(config, 'org.openedx.frontend.layout.header_mobile.v1', [
    {
      op: PLUGIN_OPERATIONS.Insert,
      widget: {
        id: 'fbr-required-profile-navigation-guard',
        priority: 1,
        type: DIRECT_PLUGIN,
        RenderWidget: FbrRequiredProfileNavigationGuard,
      },
    }
]);
    addPlugins(config, 'org.openedx.frontend.layout.header_learning_help.v1', [
    {
      op: PLUGIN_OPERATIONS.Insert,
      widget: {
        id: 'fbr-required-profile-navigation-guard',
        priority: 1,
        type: DIRECT_PLUGIN,
        RenderWidget: FbrRequiredProfileNavigationGuard,
      },
    }
]);
    addPlugins(config, 'org.openedx.frontend.layout.header_desktop_main_menu.v1', [
    {
      op: PLUGIN_OPERATIONS.Wrap,
      widgetId: 'default_contents',
      wrapper: FbrDesktopMainMenu,
    }
]);
    addPlugins(config, 'org.openedx.frontend.layout.header_mobile_main_menu.v1', [
    {
      op: PLUGIN_OPERATIONS.Wrap,
      widgetId: 'default_contents',
      wrapper: FbrMobileMainMenu,
    }
]);
    addPlugins(config, 'org.openedx.frontend.layout.header_desktop_secondary_menu.v1', [
    {
      op: PLUGIN_OPERATIONS.Wrap,
      widgetId: 'default_contents',
      wrapper: FbrHideDefaultNavigation,
    }
]);
    addPlugins(config, 'org.openedx.frontend.layout.header_learning_help.v1', [
    {
      op: PLUGIN_OPERATIONS.Wrap,
      widgetId: 'default_contents',
      wrapper: FbrLearningNavigation,
    }
]);
    if (process.env.APP_ID == 'authn') {
      addPlugins(config, 'logo_slot', [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widgetId: 'default_contents',
                },
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'custom_logo',
                        type: DIRECT_PLUGIN,
                        RenderWidget: ThemedLogo,
                    }
                }
                ]);
    }
    if (process.env.APP_ID == 'authoring') {
      addPlugins(config, 'org.openedx.frontend.layout.studio_header_search_button_slot.v1', [
    {
      op: PLUGIN_OPERATIONS.Insert,
      widget: {
        id: 'fbr_studio_header',
        priority: 1,
        type: DIRECT_PLUGIN,
        RenderWidget: FbrStudioDesktopMainMenu,
      },
    }
]);
      addPlugins(config, 'org.openedx.frontend.layout.footer.v1', [
            {
                op: PLUGIN_OPERATIONS.Hide,
                widgetId: 'default_contents',
            },
            {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: 'indigo_footer',
                    type: DIRECT_PLUGIN,
                    priority: 1,
                    RenderWidget: IndigoFooter,
                },
            },
            {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: 'read_theme_cookie',
                    type: DIRECT_PLUGIN,
                    priority: 2,
                    RenderWidget: AddDarkTheme,
                },
            },
  ]);
      addPlugins(config, 'desktop_secondary_menu_slot', [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'theme_switch_button',
                        type: DIRECT_PLUGIN,
                        RenderWidget: ToggleThemeButton,
                    },
                },
        ]);
      addPlugins(config, 'mobile_header_slot', [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widgetId: 'default_contents',
                }
                ]);
      addPlugins(config, 'mobile_header_slot', [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'theme_switch_button',
                        type: DIRECT_PLUGIN,
                        RenderWidget: MobileViewHeader,
                    },
                },
                ]);
      addPlugins(config, 'org.openedx.frontend.layout.studio_footer.v1', [
        {
            op: PLUGIN_OPERATIONS.Hide,
            widgetId: 'default_contents',
        },
        {
            op: PLUGIN_OPERATIONS.Insert,
            widget: {
                id: 'custom_studio_footer',
                type: DIRECT_PLUGIN,
                priority: 1,
                RenderWidget: IndigoFooter,
            },
        },]);
      addPlugins(config, 'logo_slot', [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widgetId: 'default_contents',
                },
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'custom_logo',
                        type: DIRECT_PLUGIN,
                        RenderWidget: ThemedLogo,
                    }
                }
                ]);
    }
    if (process.env.APP_ID == 'account') {
      addPlugins(config, 'org.openedx.frontend.layout.footer.v1', [
            {
                op: PLUGIN_OPERATIONS.Hide,
                widgetId: 'default_contents',
            },
            {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: 'indigo_footer',
                    type: DIRECT_PLUGIN,
                    priority: 1,
                    RenderWidget: IndigoFooter,
                },
            },
            {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: 'read_theme_cookie',
                    type: DIRECT_PLUGIN,
                    priority: 2,
                    RenderWidget: AddDarkTheme,
                },
            },
  ]);
      addPlugins(config, 'desktop_secondary_menu_slot', [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'theme_switch_button',
                        type: DIRECT_PLUGIN,
                        RenderWidget: ToggleThemeButton,
                    },
                },
        ]);
      addPlugins(config, 'mobile_header_slot', [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widgetId: 'default_contents',
                }
                ]);
      addPlugins(config, 'mobile_header_slot', [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'theme_switch_button',
                        type: DIRECT_PLUGIN,
                        RenderWidget: MobileViewHeader,
                    },
                },
                ]);
      addPlugins(config, 'logo_slot', [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widgetId: 'default_contents',
                },
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'custom_logo',
                        type: DIRECT_PLUGIN,
                        RenderWidget: ThemedLogo,
                    }
                }
                ]);
    }
    if (process.env.APP_ID == 'learner-dashboard') {
      addPlugins(config, 'org.openedx.frontend.layout.footer.v1', [
            {
                op: PLUGIN_OPERATIONS.Hide,
                widgetId: 'default_contents',
            },
            {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: 'indigo_footer',
                    type: DIRECT_PLUGIN,
                    priority: 1,
                    RenderWidget: IndigoFooter,
                },
            },
            {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: 'read_theme_cookie',
                    type: DIRECT_PLUGIN,
                    priority: 2,
                    RenderWidget: AddDarkTheme,
                },
            },
  ]);
      addPlugins(config, 'desktop_secondary_menu_slot', [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'theme_switch_button',
                        type: DIRECT_PLUGIN,
                        RenderWidget: ToggleThemeButton,
                    },
                },
        ]);
      addPlugins(config, 'mobile_header_slot', [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widgetId: 'default_contents',
                }
                ]);
      addPlugins(config, 'mobile_header_slot', [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'theme_switch_button',
                        type: DIRECT_PLUGIN,
                        RenderWidget: MobileViewHeader,
                    },
                },
                ]);
      addPlugins(config, 'logo_slot', [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widgetId: 'default_contents',
                },
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'custom_logo',
                        type: DIRECT_PLUGIN,
                        RenderWidget: ThemedLogo,
                    }
                }
                ]);
    }
    if (process.env.APP_ID == 'learning') {
      addPlugins(config, 'org.openedx.frontend.layout.footer.v1', [
            {
                op: PLUGIN_OPERATIONS.Hide,
                widgetId: 'default_contents',
            },
            {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: 'indigo_footer',
                    type: DIRECT_PLUGIN,
                    priority: 1,
                    RenderWidget: IndigoFooter,
                },
            },
            {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: 'read_theme_cookie',
                    type: DIRECT_PLUGIN,
                    priority: 2,
                    RenderWidget: AddDarkTheme,
                },
            },
  ]);
      addPlugins(config, 'learning_help_slot', [
        {
            op: PLUGIN_OPERATIONS.Hide,
            widgetId: 'default_contents',
        }
        ]);
      addPlugins(config, 'learning_help_slot', [
        {
            op: PLUGIN_OPERATIONS.Insert,
            widget: {
                id: 'theme_switch_button',
                type: DIRECT_PLUGIN,
                RenderWidget: ToggleThemeButton,
            },
        },
        ]);
      addPlugins(config, 'logo_slot', [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widgetId: 'default_contents',
                },
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'custom_logo',
                        type: DIRECT_PLUGIN,
                        RenderWidget: ThemedLogo,
                    }
                }
                ]);
    }
    if (process.env.APP_ID == 'profile') {
      addPlugins(config, 'org.openedx.frontend.layout.footer.v1', [
            {
                op: PLUGIN_OPERATIONS.Hide,
                widgetId: 'default_contents',
            },
            {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: 'indigo_footer',
                    type: DIRECT_PLUGIN,
                    priority: 1,
                    RenderWidget: IndigoFooter,
                },
            },
            {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: 'read_theme_cookie',
                    type: DIRECT_PLUGIN,
                    priority: 2,
                    RenderWidget: AddDarkTheme,
                },
            },
  ]);
      addPlugins(config, 'desktop_secondary_menu_slot', [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'theme_switch_button',
                        type: DIRECT_PLUGIN,
                        RenderWidget: ToggleThemeButton,
                    },
                },
        ]);
      addPlugins(config, 'mobile_header_slot', [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widgetId: 'default_contents',
                }
                ]);
      addPlugins(config, 'mobile_header_slot', [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'theme_switch_button',
                        type: DIRECT_PLUGIN,
                        RenderWidget: MobileViewHeader,
                    },
                },
                ]);
      addPlugins(config, 'logo_slot', [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widgetId: 'default_contents',
                },
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'custom_logo',
                        type: DIRECT_PLUGIN,
                        RenderWidget: ThemedLogo,
                    }
                }
                ]);
    }
    if (process.env.APP_ID == 'fbr-admin') {
      addPlugins(config, 'org.openedx.frontend.layout.footer.v1', [
            {
                op: PLUGIN_OPERATIONS.Hide,
                widgetId: 'default_contents',
            },
            {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: 'indigo_footer',
                    type: DIRECT_PLUGIN,
                    priority: 1,
                    RenderWidget: IndigoFooter,
                },
            },
            {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: 'read_theme_cookie',
                    type: DIRECT_PLUGIN,
                    priority: 2,
                    RenderWidget: AddDarkTheme,
                },
            },
  ]);
      addPlugins(config, 'desktop_secondary_menu_slot', [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'theme_switch_button',
                        type: DIRECT_PLUGIN,
                        RenderWidget: ToggleThemeButton,
                    },
                },
        ]);
      addPlugins(config, 'mobile_header_slot', [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widgetId: 'default_contents',
                }
                ]);
      addPlugins(config, 'mobile_header_slot', [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'theme_switch_button',
                        type: DIRECT_PLUGIN,
                        RenderWidget: MobileViewHeader,
                    },
                },
                ]);
      addPlugins(config, 'logo_slot', [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widgetId: 'default_contents',
                },
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'custom_logo',
                        type: DIRECT_PLUGIN,
                        RenderWidget: ThemedLogo,
                    }
                }
                ]);
    }
if (config.pluginSlots && config.pluginSlots['logo_slot']) {
  config.pluginSlots['logo_slot'].keepDefault = false;

  const logoInsertPlugins =
    config.pluginSlots['logo_slot'].plugins.filter(plugin => plugin.op === 'insert' && plugin.widget?.id === 'custom_logo');

  if (logoInsertPlugins.length > 1) {
    let kept = false;
    config.pluginSlots['logo_slot'].plugins =
      config.pluginSlots['logo_slot'].plugins.filter(plugin => {
        if (plugin.op === 'insert' && plugin.widget?.id === 'custom_logo') {
          if (kept) return false;
          kept = true;
        }
        return true;
      });
  }
}

if (config.pluginSlots && config.pluginSlots['org.openedx.frontend.layout.footer.v1']) {
  const footerPluginsToInsert =
    config.pluginSlots['org.openedx.frontend.layout.footer.v1'].plugins.filter(plugin => plugin.op === 'insert');

  if (footerPluginsToInsert.length > 2) {
  config.pluginSlots['org.openedx.frontend.layout.footer.v1'].plugins =
    config.pluginSlots['org.openedx.frontend.layout.footer.v1'].plugins.filter(plugin => {
      if (plugin.op === 'insert') {
        const widgetId = plugin.widget?.id;
        return widgetId !== 'indigo_footer';
      }
      return true;
    });
  }
}
  } catch (err) { console.error("env.config.jsx failed to apply: ", err);}

  return config;
}

export default setConfig;