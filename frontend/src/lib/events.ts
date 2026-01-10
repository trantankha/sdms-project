type EventHandler = () => void;

class EventBus {
    private events: { [key: string]: EventHandler[] } = {};

    on(event: string, handler: EventHandler) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(handler);
    }

    off(event: string, handler: EventHandler) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(h => h !== handler);
    }

    emit(event: string) {
        if (!this.events[event]) return;
        this.events[event].forEach(handler => handler());
    }
}

export const eventBus = new EventBus();
export const REFRESH_SIDEBAR = "REFRESH_SIDEBAR";
