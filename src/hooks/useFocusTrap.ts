import { useEffect, RefObject } from 'react';

export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return;

    const element = ref.current;
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusables = element.querySelectorAll<HTMLElement>(focusableSelectors);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: Go backward, loop to end
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        // Tab: Go forward, loop to beginning
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    // Capture initial focus after a small render tick
    const timeoutId = setTimeout(() => {
      const focusables = element.querySelectorAll<HTMLElement>(focusableSelectors);
      if (focusables.length > 0) {
        // Prefer autoFocused elements or first element
        const autoFocused = element.querySelector('[autoFocus]') as HTMLElement | null;
        if (autoFocused) {
          autoFocused.focus();
        } else {
          focusables[0].focus();
        }
      }
    }, 50);

    element.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timeoutId);
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, ref]);
}
