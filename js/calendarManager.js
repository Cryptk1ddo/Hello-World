class CalendarManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentView = 'month'; // 'day', 'week', 'month'
        this.telegram = window.telegram; // Access the global telegram instance
        // ... existing constructor code ...

        this.initializeViewControls();
        this.eventManager = new EventManager(dataManager, this);
        this.initializeEventHandling();
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
        this.telegram?.hapticFeedback('medium');
        // ... existing code ...

        // Show event creation dialog
        this.showEventDialog(this.selectedDate);
    }

    showEventDialog(existingEvent = null) {
        const dialog = document.createElement('div');
        dialog.className = 'event-dialog';
        
        const formattedDate = this.selectedDate?.toISOString().slice(0, 16) || 
                             new Date().toISOString().slice(0, 16);

        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>${existingEvent ? 'Edit Event' : 'New Event'}</h3>
                <form id="eventForm">
                    <input type="text" id="eventTitle" placeholder="Event Title" 
                           value="${existingEvent?.title || ''}" required>
                    <textarea id="eventDescription" placeholder="Description">${existingEvent?.description || ''}</textarea>
                    <div class="datetime-group">
                        <div>
                            <label>Start</label>
                            <input type="datetime-local" id="eventStart" 
                                   value="${existingEvent?.startDate.toISOString().slice(0, 16) || formattedDate}" required>
                        </div>
                        <div>
                            <label>End</label>
                            <input type="datetime-local" id="eventEnd" 
                                   value="${existingEvent?.endDate.toISOString().slice(0, 16) || formattedDate}" required>
                        </div>
                    </div>
                    <div class="category-group">
                        <label>Category</label>
                        <select id="eventCategory">
                            <option value="default">Default</option>
                            <option value="work">Work</option>
                            <option value="personal">Personal</option>
                            <option value="important">Important</option>
                        </select>
                    </div>
                    <div class="dialog-buttons">
                        ${existingEvent ? '<button type="button" id="deleteEvent" class="danger-btn">Delete</button>' : ''}
                        <button type="button" id="cancelEvent">Cancel</button>
                        <button type="submit">${existingEvent ? 'Update' : 'Create'}</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(dialog);

        // Form handling
        const form = document.getElementById('eventForm');
        form.onsubmit = (e) => {
            e.preventDefault();
            const eventData = {
                title: document.getElementById('eventTitle').value,
                description: document.getElementById('eventDescription').value,
                startDate: new Date(document.getElementById('eventStart').value),
                endDate: new Date(document.getElementById('eventEnd').value),
                category: document.getElementById('eventCategory').value
            };

            if (existingEvent) {
                this.eventManager.updateEvent(existingEvent.id, eventData);
            } else {
                this.eventManager.createEvent(eventData);
            }

            dialog.remove();
        };

        // Delete handling
        const deleteBtn = document.getElementById('deleteEvent');
        if (deleteBtn) {
            deleteBtn.onclick = () => {
                if (confirm('Are you sure you want to delete this event?')) {
                    this.eventManager.deleteEvent(existingEvent.id);
                    dialog.remove();
                }
            };
        }

        // Cancel handling
        document.getElementById('cancelEvent').onclick = () => dialog.remove();
    }

    initializeEventHandling() {
        // Add event creation button
        const addEventBtn = document.createElement('button');
        addEventBtn.className = 'nav-btn';
        addEventBtn.textContent = '+';
        addEventBtn.onclick = () => this.showEventDialog();
        
        this.monthYearElement.parentNode.appendChild(addEventBtn);
    }

    createDayElement(day, classes = '') {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        if (classes) {
            dayElement.className = classes;
        }

        // Add events for this day
        const currentDate = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            day
        );

        const events = Array.from(this.dataManager.events.values())
            .filter(event => {
                const eventDate = new Date(event.startDate);
                return eventDate.getDate() === day &&
                       eventDate.getMonth() === currentDate.getMonth() &&
                       eventDate.getFullYear() === currentDate.getFullYear();
            });

        if (events.length > 0) {
            const eventIndicator = document.createElement('div');
            eventIndicator.className = 'event-indicator';
            eventIndicator.textContent = events.length;
            dayElement.appendChild(eventIndicator);
        }

        dayElement.addEventListener('click', () => {
            this.handleDateClick(day);
            if (events.length > 0) {
                this.showEventsList(events);
            }
        });

        this.daysGrid.appendChild(dayElement);
    }

    showEventsList(events) {
        const dialog = document.createElement('div');
        dialog.className = 'event-dialog';
        
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Events</h3>
                <div class="events-list">
                    ${events.map(event => `
                        <div class="event-item ${event.category}" onclick="handleEventClick('${event.id}')">
                            <h4>${event.title}</h4>
                            <p>${event.startDate.toLocaleTimeString()}</p>
                        </div>
                    `).join('')}
                </div>
                <div class="dialog-buttons">
                    <button onclick="this.closest('.event-dialog').remove()">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);
    }
} 