class Event {
    constructor(id, title, description, startDate, endDate, category = 'default') {
        this.id = id || crypto.randomUUID();
        this.title = title;
        this.description = description;
        this.startDate = new Date(startDate);
        this.endDate = new Date(endDate);
        this.category = category;
    }
}

class Task {
    constructor(id, title, description, dueDate, priority = 1, listId = 'default', completed = false) {
        this.id = id || crypto.randomUUID();
        this.title = title;
        this.description = description;
        this.dueDate = new Date(dueDate);
        this.priority = priority; // 1: Low, 2: Medium, 3: High
        this.listId = listId;
        this.completed = completed;
        this.pomodoroSessions = []; // Track associated pomodoro sessions
    }
}

class TaskList {
    constructor(id, name, color = '#2481cc') {
        this.id = id || crypto.randomUUID();
        this.name = name;
        this.color = color;
    }
}

class PomodoroSession {
    constructor(id, taskId, startTime, duration, completed = false) {
        this.id = id || crypto.randomUUID();
        this.taskId = taskId;
        this.startTime = startTime;
        this.duration = duration;
        this.completed = completed;
    }
} 