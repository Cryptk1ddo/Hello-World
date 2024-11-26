class EventManager {
    constructor(dataManager, calendarManager) {
        this.dataManager = dataManager;
        this.calendarManager = calendarManager;
        this.notifications = [];
        
        // Initialize notification permission
        this.initializeNotifications();
        
        // Check for upcoming events every minute
        setInterval(() => this.checkUpcomingEvents(), 60000);
    }

    async initializeNotifications() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
        }
    }

    createEvent(eventData) {
        const event = new Event(
            null,
            eventData.title,
            eventData.description,
            eventData.startDate,
            eventData.endDate,
            eventData.category
        );

        this.dataManager.addEvent(event);
        this.scheduleNotification(event);
        this.calendarManager.renderCalendar();
        
        return event;
    }

    scheduleNotification(event) {
        // Schedule notifications: 1 day before, 1 hour before, and 5 minutes before
        const notificationTimes = [
            { time: 24 * 60 * 60 * 1000, message: '1 day' },
            { time: 60 * 60 * 1000, message: '1 hour' },
            { time: 5 * 60 * 1000, message: '5 minutes' }
        ];

        notificationTimes.forEach(({ time, message }) => {
            const notificationTime = new Date(event.startDate.getTime() - time);
            if (notificationTime > new Date()) {
                const timeoutId = setTimeout(() => {
                    this.showNotification(event, message);
                }, notificationTime.getTime() - Date.now());

                this.notifications.push({
                    eventId: event.id,
                    timeoutId: timeoutId
                });
            }
        });
    }

    showNotification(event, timeMessage) {
        const notificationText = `${event.title} starts in ${timeMessage}`;
        this.telegram?.showAlert(notificationText);
    }

    checkUpcomingEvents() {
        const now = new Date();
        const events = Array.from(this.dataManager.events.values());
        
        events.forEach(event => {
            const timeDiff = event.startDate.getTime() - now.getTime();
            if (timeDiff > 0 && timeDiff <= 5 * 60 * 1000) { // Within next 5 minutes
                this.showNotification(event, 'soon');
            }
        });
    }

    async deleteEvent(eventId) {
        if (await this.telegram?.showConfirm('Are you sure you want to delete this event?')) {
            // Clear any pending notifications
            this.notifications = this.notifications.filter(notification => {
                if (notification.eventId === eventId) {
                    clearTimeout(notification.timeoutId);
                    return false;
                }
                return true;
            });

            this.dataManager.events.delete(eventId);
            this.dataManager.saveData();
            this.calendarManager.renderCalendar();
        }
    }

    updateEvent(eventId, updateData) {
        const event = this.dataManager.events.get(eventId);
        if (!event) return null;

        // Update event properties
        Object.assign(event, updateData);
        
        // Reschedule notifications
        this.notifications
            .filter(n => n.eventId === eventId)
            .forEach(n => clearTimeout(n.timeoutId));
            
        this.scheduleNotification(event);
        
        this.dataManager.saveData();
        this.calendarManager.renderCalendar();
        
        return event;
    }
}