function isVisibleCurrentTimeMarker(element: HTMLElement): boolean {
  return getComputedStyle(element).visibility !== "hidden";
}

function findScrollContainer(root: HTMLElement): HTMLElement | null {
  return root.querySelector<HTMLElement>(".k-scheduler-layout-flex");
}

function findVisibleCurrentTimeMarker(root: HTMLElement): HTMLElement | null {
  const markers = root.querySelectorAll<HTMLElement>(".k-current-time");
  for (const marker of markers) {
    if (isVisibleCurrentTimeMarker(marker)) {
      return marker;
    }
  }
  return null;
}

export function scrollToCurrentTimeMarker(
  root: HTMLElement,
  options?: { behavior?: ScrollBehavior },
): boolean {
  const scrollContainer = findScrollContainer(root);
  const marker = findVisibleCurrentTimeMarker(root);

  if (!scrollContainer || !marker) {
    return false;
  }

  const markerRect = marker.getBoundingClientRect();
  const containerRect = scrollContainer.getBoundingClientRect();
  const targetScrollTop =
    scrollContainer.scrollTop +
    (markerRect.top - containerRect.top) -
    containerRect.height / 3;

  scrollContainer.scrollTo({
    top: Math.max(0, targetScrollTop),
    behavior: options?.behavior ?? "auto",
  });

  return true;
}

export function scrollToCurrentTimeMarkerWhenReady(
  root: HTMLElement,
  options?: { maxAttempts?: number; intervalMs?: number },
): () => void {
  const maxAttempts = options?.maxAttempts ?? 20;
  const intervalMs = options?.intervalMs ?? 50;
  let attempts = 0;

  const timerId = window.setInterval(() => {
    attempts += 1;
    const scrolled = scrollToCurrentTimeMarker(root, { behavior: "auto" });
    if (scrolled || attempts >= maxAttempts) {
      window.clearInterval(timerId);
    }
  }, intervalMs);

  return () => window.clearInterval(timerId);
}

export function isViewingToday(viewDate: Date, now: Date = new Date()): boolean {
  return (
    viewDate.getFullYear() === now.getFullYear() &&
    viewDate.getMonth() === now.getMonth() &&
    viewDate.getDate() === now.getDate()
  );
}
