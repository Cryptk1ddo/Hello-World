class CalendarManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentView = 'month'; // 'day', 'week', 'month'
        // ... existing constructor code ...

        this.initializeViewControls();
    }

    initializeViewControls() {
        const viewControls = document.createElement('div');
        viewControls.className = 'view-controls';
        viewControls.innerHTML = `
            <button data-view="day">Day</button>
            <button data-view="week">Week</button>
            <button data-view="month">Month</button>
        `;
        
        this.monthYearElement.parentNode.insertBefore(viewControls, this.monthYearElement);
        
        viewControls.addEventListener('click', (e) => {
            if (e.target.dataset.view) {
                this.switchView(e.target.dataset.view);
            }
        });
    }

    switchView(view) {
        this.currentView = view;
        this.renderCalendar();
    }

    handleDateClick(day) {
        // ... existing code ...

        // Show event creation dialog
        this.showEventDialog(this.selectedDate);
    }

    showEventDialog(date) {
        const dialog = document.createElement('div');
        dialog.className = 'event-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Add Event</h3>
                <input type="text" id="eventTitle" placeholder="Event Title">
                <textarea id="eventDescription" placeholder="Description"></textarea>
                <input type="datetime-local" id="eventStart">
                <input type="datetime-local" id="eventEnd">
                <div class="dialog-buttons">
                    <button id="saveEvent">Save</button>
                    <button id="cancelEvent">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Set default times
        const startDate = new Date(date);
        startDate.setHours(9, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(10, 0, 0);

        document.getElementById('eventStart').value = startDate.toISOString().slice(0, 16);
        document.getElementById('eventEnd').value = endDate.toISOString().slice(0, 16);

        document.getElementById('saveEvent').addEventListener('click', () => {
            const event = new Event(
                null,
                document.getElementById('eventTitle').value,
                document.getElementById('eventDescription').value,
                document.getElementById('eventStart').value,
                document.getElementById('eventEnd').value
            );
            this.dataManager.addEvent(event);
            dialog.remove();
            this.renderCalendar();
        });

        document.getElementById('cancelEvent').addEventListener('click', () => {
            dialog.remove();
        });
    }
} 
