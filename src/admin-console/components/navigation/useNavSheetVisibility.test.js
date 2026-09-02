import { act, renderHook } from '@testing-library/react';
import useNavSheetVisibility from './useNavSheetVisibility';

// ── Media-query harness ──────────────────────────────────────────────────────
// jsdom has no `matchMedia`, and the hook reads two queries: the mobile
// breakpoint it stays open under, and the reduced-motion preference that skips
// its close animation.

const MOBILE_QUERY = '(max-width: 992px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

let matchesByQuery;
let listenersByQuery;

const stubMatchMedia = () => {
  matchesByQuery = { [MOBILE_QUERY]: true, [REDUCED_MOTION_QUERY]: false };
  listenersByQuery = new Map();

  window.matchMedia = jest.fn(query => ({
    media: query,
    get matches() { return Boolean(matchesByQuery[query]); },
    addEventListener: (_event, handler) => {
      if (!listenersByQuery.has(query)) { listenersByQuery.set(query, new Set()); }
      listenersByQuery.get(query).add(handler);
    },
    removeEventListener: (_event, handler) => {
      listenersByQuery.get(query)?.delete(handler);
    },
  }));
};

const emitQueryChange = (query, matches) => {
  matchesByQuery[query] = matches;
  act(() => {
    listenersByQuery.get(query)?.forEach(handler => handler({ matches }));
  });
};

const listenerCount = query => (listenersByQuery.get(query)?.size ?? 0);

beforeEach(() => {
  jest.useFakeTimers();
  stubMatchMedia();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe('useNavSheetVisibility', () => {
  it('starts closed and unmounted', () => {
    const { result } = renderHook(() => useNavSheetVisibility());

    expect(result.current.isMounted).toBe(false);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.isClosing).toBe(false);
  });

  it('mounts the sheet on open', () => {
    const { result } = renderHook(() => useNavSheetVisibility());

    act(() => result.current.open());

    expect(result.current.isMounted).toBe(true);
    expect(result.current.isOpen).toBe(true);
  });

  it('keeps the sheet mounted for one animation before unmounting it', () => {
    const { result } = renderHook(() => useNavSheetVisibility());

    act(() => result.current.open());
    act(() => result.current.close());

    // Still in the tree so the slide-out can play, but no longer "open".
    expect(result.current.isMounted).toBe(true);
    expect(result.current.isClosing).toBe(true);
    expect(result.current.isOpen).toBe(false);

    act(() => { jest.advanceTimersByTime(199); });
    expect(result.current.isMounted).toBe(true);

    act(() => { jest.advanceTimersByTime(1); });
    expect(result.current.isMounted).toBe(false);
    expect(result.current.isClosing).toBe(false);
  });

  it('unmounts immediately under reduced motion', () => {
    matchesByQuery[REDUCED_MOTION_QUERY] = true;
    const { result } = renderHook(() => useNavSheetVisibility());

    act(() => result.current.open());
    act(() => result.current.close());

    expect(result.current.isMounted).toBe(false);
    expect(result.current.isClosing).toBe(false);
  });

  it('cancels a pending close when reopened mid-animation', () => {
    const { result } = renderHook(() => useNavSheetVisibility());

    act(() => result.current.open());
    act(() => result.current.close());
    act(() => result.current.open());

    // The close timer must not fire after the reopen, or the sheet would
    // vanish while the user is looking at it.
    act(() => { jest.advanceTimersByTime(500); });

    expect(result.current.isMounted).toBe(true);
    expect(result.current.isOpen).toBe(true);
  });

  it('closes when the viewport grows past the mobile breakpoint', () => {
    const { result } = renderHook(() => useNavSheetVisibility());

    act(() => result.current.open());
    emitQueryChange(MOBILE_QUERY, false);

    // Immediate, not animated: the trigger is already hidden by then, and a
    // lingering sheet would keep its focus trap and scroll lock.
    expect(result.current.isMounted).toBe(false);
  });

  it('stays open while the viewport is still below the breakpoint', () => {
    const { result } = renderHook(() => useNavSheetVisibility());

    act(() => result.current.open());
    emitQueryChange(MOBILE_QUERY, true);

    expect(result.current.isMounted).toBe(true);
  });

  it('subscribes only while mounted and cleans up on unmount', () => {
    const { result, unmount } = renderHook(() => useNavSheetVisibility());

    expect(listenerCount(MOBILE_QUERY)).toBe(0);

    act(() => result.current.open());
    expect(listenerCount(MOBILE_QUERY)).toBe(1);

    act(() => result.current.close());
    unmount();

    expect(listenerCount(MOBILE_QUERY)).toBe(0);
    // The pending close timer is cleared, so nothing tries to set state on the
    // unmounted hook.
    expect(() => jest.advanceTimersByTime(500)).not.toThrow();
  });
});
