import { fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { scrollToTopNow, setScrollLocked, useSmoothScroll } from '../hooks/useSmoothScroll';

afterEach(() => {
  vi.restoreAllMocks();
  history.replaceState(null, '', '/');
  setScrollLocked(false);
});

it('preserves native wheel input, anchor focus and offsets, and instant route resets', () => {
  const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  function Page() {
    useSmoothScroll();
    return <><a href="#destination">Jump</a><section id="destination">Destination</section></>;
  }
  const { getByText, unmount } = render(<Page />);
  const destination = getByText('Destination');
  vi.spyOn(destination, 'getBoundingClientRect').mockReturnValue({ top: 500 } as DOMRect);
  const wheel = new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true });
  window.dispatchEvent(wheel);
  expect(wheel.defaultPrevented).toBe(false);
  fireEvent.click(getByText('Jump'));
  expect(scroll).toHaveBeenCalledWith({ top: 412, behavior: 'smooth' });
  expect(document.activeElement).toBe(destination);
  expect(location.hash).toBe('#destination');
  scrollToTopNow();
  expect(scroll).toHaveBeenLastCalledWith({ top: 0, behavior: 'instant' });
  setScrollLocked(true);
  expect(document.documentElement).toHaveClass('scroll-locked');
  unmount();
});
