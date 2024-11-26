class PomodoroTimer {
    constructor(dataManager) {
        this.dataManager = dataManager;
        // Timer state
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.timerId = null;
        this.isRunning = false;
        this.isWorkSession = true;

        // DOM elements
        this.minutesDisplay = document.getElementById('minutes');
        this.secondsDisplay = document.getElementById('seconds');
        this.startButton = document.getElementById('startTimer');
        this.pauseButton = document.getElementById('pauseTimer');
        this.resetButton = document.getElementById('resetTimer');
        this.workTimeInput = document.getElementById('workTime');
        this.breakTimeInput = document.getElementById('breakTime');

        // Initialize
        this.bindEvents();
        this.updateDisplay();

        this.currentTaskId = null;
        this.initializeTaskSelection();
    }

    initializeTaskSelection() {
        const taskSelect = document.createElement('select');
        taskSelect.id = 'taskSelect';
        taskSelect.innerHTML = '<option value="">Select Task</option>';
        
        // Add task selection before timer display
        this.minutesDisplay.parentNode.insertBefore(taskSelect, this.minutesDisplay);
        
        this.updateTaskList();
    }

    updateTaskList() {
        const taskSelect = document.getElementById('taskSelect');
        const currentTasks = Array.from(this.dataManager.tasks.values())
            .filter(task => !task.completed);
        
        taskSelect.innerHTML = '<option value="">Select Task</option>' +
            currentTasks.map(task => 
                `<option value="${task.id}">${task.title}</option>`
            ).join('');
            
        taskSelect.addEventListener('change', (e) => {
            this.currentTaskId = e.target.value;
        });
    }

    bindEvents() {
        this.startButton.addEventListener('click', () => this.start());
        this.pauseButton.addEventListener('click', () => this.pause());
        this.resetButton.addEventListener('click', () => this.reset());
        
        this.workTimeInput.addEventListener('change', () => this.updateWorkTime());
        this.breakTimeInput.addEventListener('change', () => this.updateBreakTime());
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        this.minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        this.secondsDisplay.textContent = seconds.toString().padStart(2, '0');
        
        // Update button states
        this.startButton.disabled = this.isRunning;
        this.pauseButton.disabled = !this.isRunning;
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.timerId = setInterval(() => {
            this.timeLeft--;
            
            if (this.timeLeft <= 0) {
                this.handleSessionComplete();
            }
            
            this.updateDisplay();
        }, 1000);
        
        this.updateDisplay();
    }

    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.timerId);
        this.updateDisplay();
    }

    reset() {
        this.pause();
        this.isWorkSession = true;
        this.timeLeft = parseInt(this.workTimeInput.value) * 60;
        this.updateDisplay();
    }

    handleSessionComplete() {
        this.pause();
        
        // Play notification sound if available
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
        
        // Toggle between work and break sessions
        this.isWorkSession = !this.isWorkSession;
        this.timeLeft = this.isWorkSession ? 
            parseInt(this.workTimeInput.value) * 60 : 
            parseInt(this.breakTimeInput.value) * 60;
        
        // Automatically start the next session
        this.start();

        if (this.currentTaskId && this.isWorkSession) {
            const session = new PomodoroSession(
                null,
                this.currentTaskId,
                new Date(),
                parseInt(this.workTimeInput.value) * 60,
                true
            );
            this.dataManager.addPomodoroSession(session);
        }
    }

    updateWorkTime() {
        if (!this.isRunning && this.isWorkSession) {
            this.timeLeft = parseInt(this.workTimeInput.value) * 60;
            this.updateDisplay();
        }
    }

    updateBreakTime() {
        if (!this.isRunning && !this.isWorkSession) {
            this.timeLeft = parseInt(this.breakTimeInput.value) * 60;
            this.updateDisplay();
        }
    }
} 