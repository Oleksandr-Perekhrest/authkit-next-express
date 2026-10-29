// outsource dependencies
import "client-only";

export const WAKEUP_MESSAGE =
    "Waking up the server — the first request after a break can take up to a minute.";

type Listener = () => void;

const listeners = new Set<Listener>();
let slowCount = 0;

function notify() {
    for (const l of listeners) l();
}

export function trackRequest(): () => void {
    let isSlow = false;
    const timer = setTimeout(() => {
        isSlow = true;
        slowCount++;
        notify();
    }, 3000);

    return function done() {
        if (isSlow) {
            slowCount = Math.max(0, slowCount - 1);
            notify();
        } else {
            clearTimeout(timer);
        }
    };
}

export const requestTrackerStore = {
    getSnapshot(): number {
        return slowCount;
    },
    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },
};
