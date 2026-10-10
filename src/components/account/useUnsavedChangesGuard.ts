import { useBlocker } from "@tanstack/react-router";

/**
 * Asks before leaving a form with unsaved changes: the browser's own prompt on reload or tab
 * close, and a confirm dialog for links inside the site.
 */
export function useUnsavedChangesGuard(dirty: boolean) {
  useBlocker({
    shouldBlockFn: () => dirty && !window.confirm("You have unsaved changes. Leave this page?"),
    enableBeforeUnload: () => dirty,
  });
}
