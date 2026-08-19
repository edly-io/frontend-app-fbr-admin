import {
  useCallback, useEffect, useRef, useState,
} from 'react';

// Mirrored by `$admin-nav-sheet-close-duration` in `admin-nav-mobile-styles.scss`.
const SHEET_CLOSE_DURATION_MS = 200;

// Mirrors `--pgn-size-breakpoint-max-width-md`, the query the stylesheets switch
// on: while it matches, the context bar owns navigation.
const MOBILE_MEDIA_QUERY = '(max-width: 992px)';
const REDUCED_MOTION_MEDIA_QUERY = '(prefers-reduced-motion: reduce)';

const matchesMedia = query => (
  typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && window.matchMedia(query).matches
);

/**
 * Open/close state for the nav sheet. Paragon's `Sheet` renders nothing while
 * `show` is false, so a close keeps it mounted under a `--closing` class for one
 * animation before unmounting - skipped entirely under reduced motion.
 */
const useNavSheetVisibility = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef(null);

  const cancelPendingClose = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const closeImmediately = useCallback(() => {
    cancelPendingClose();
    setIsClosing(false);
    setIsMounted(false);
  }, [cancelPendingClose]);

  const open = useCallback(() => {
    cancelPendingClose();
    setIsClosing(false);
    setIsMounted(true);
  }, [cancelPendingClose]);

  const close = useCallback(() => {
    if (matchesMedia(REDUCED_MOTION_MEDIA_QUERY)) {
      closeImmediately();
      return;
    }

    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null;
      setIsClosing(false);
      setIsMounted(false);
    }, SHEET_CLOSE_DURATION_MS);
  }, [closeImmediately]);

  useEffect(() => cancelPendingClose, [cancelPendingClose]);

  // A sheet left open across a resize to desktop would hold its scroll lock and
  // focus trap while its trigger is hidden.
  useEffect(() => {
    if (!isMounted || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQueryList = window.matchMedia(MOBILE_MEDIA_QUERY);
    const handleBreakpointChange = (event) => {
      if (!event.matches) {
        closeImmediately();
      }
    };

    mediaQueryList.addEventListener('change', handleBreakpointChange);
    return () => mediaQueryList.removeEventListener('change', handleBreakpointChange);
  }, [isMounted, closeImmediately]);

  return {
    isMounted,
    isClosing,
    isOpen: isMounted && !isClosing,
    open,
    close,
  };
};

export default useNavSheetVisibility;
