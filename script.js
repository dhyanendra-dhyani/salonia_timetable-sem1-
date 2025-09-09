document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
    
    function initializeApp() {
        updateDateTime();
        setupTabs();
        highlightCurrentDay();
        
        // Update time every minute
        setInterval(updateDateTime, 60000);
    }
    
    function updateDateTime() {
        const now = new Date();
        
        // Update current date
        const dateOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('currentDate').textContent = now.toLocaleDateString('en-IN', dateOptions);
        
        // Update current day
        const dayOptions = { weekday: 'long' };
        document.getElementById('todayDay').textContent = now.toLocaleDateString('en-IN', dayOptions);
        
        // Update current time
        const timeOptions = { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        };
        document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-IN', timeOptions);
    }
    
    function setupTabs() {
        const tabs = document.querySelectorAll('.day-tab');
        const schedules = document.querySelectorAll('.day-schedule');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetDay = this.getAttribute('data-day');
                
                // Remove active class from all tabs and schedules
                tabs.forEach(t => t.classList.remove('active'));
                schedules.forEach(s => s.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding schedule
                this.classList.add('active');
                document.getElementById(targetDay).classList.add('active');
                
                // Add smooth scroll to top of timetable
                document.querySelector('.timetable-container').scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            });
        });
    }
    
    function highlightCurrentDay() {
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        const dayMapping = {
            0: null, // Sunday
            1: 'monday',
            2: 'tuesday',
            3: 'wednesday',
            4: 'thursday',
            5: 'friday',
            6: 'saturday'
        };
        
        const todayKey = dayMapping[currentDay];
        
        if (todayKey) {
            const todayTab = document.querySelector(`[data-day="${todayKey}"]`);
            if (todayTab) {
                todayTab.classList.add('today');
                
                // Auto-switch to current day
                const allTabs = document.querySelectorAll('.day-tab');
                const allSchedules = document.querySelectorAll('.day-schedule');
                
                allTabs.forEach(tab => tab.classList.remove('active'));
                allSchedules.forEach(schedule => schedule.classList.remove('active'));
                
                todayTab.classList.add('active');
                document.getElementById(todayKey).classList.add('active');
            }
        }
        
        // Highlight current time slot
        highlightCurrentTimeSlot();
    }
    
    function highlightCurrentTimeSlot() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinutes; // Convert to minutes
        
        // Define time slots in minutes from midnight
        const timeSlots = [
            { start: 9 * 60, end: 10 * 60, class: 'slot-1' },      // 9:00-10:00
            { start: 10 * 60, end: 11 * 60, class: 'slot-2' },     // 10:00-11:00
            { start: 11 * 60, end: 12 * 60, class: 'slot-3' },     // 11:00-12:00
            { start: 12 * 60, end: 13 * 60, class: 'slot-4' },     // 12:00-1:00
            { start: 13 * 60, end: 13 * 60 + 30, class: 'lunch' }, // 1:00-1:30 (Lunch)
            { start: 13 * 60 + 30, end: 14 * 60 + 30, class: 'slot-5' }, // 1:30-2:30
            { start: 14 * 60 + 30, end: 15 * 60 + 30, class: 'slot-6' }, // 2:30-3:30
            { start: 15 * 60 + 30, end: 16 * 60 + 30, class: 'slot-7' }, // 3:30-4:30
            { start: 16 * 60 + 30, end: 17 * 60 + 30, class: 'slot-8' }  // 4:30-5:30
        ];
        
        // Remove previous highlighting
        document.querySelectorAll('.time-slot.current').forEach(slot => {
            slot.classList.remove('current');
        });
        
        // Find and highlight current time slot
        const currentSlot = timeSlots.find(slot => 
            currentTime >= slot.start && currentTime < slot.end
        );
        
        if (currentSlot) {
            const activeSchedule = document.querySelector('.day-schedule.active');
            if (activeSchedule) {
                const timeSlots = activeSchedule.querySelectorAll('.time-slot');
                timeSlots.forEach((slot, index) => {
                    if (index === timeSlots.findIndex(s => 
                        s.querySelector('.time').textContent.includes(getTimeSlotText(currentSlot))
                    )) {
                        slot.classList.add('current');
                        // Add pulsing effect to current time slot
                        slot.style.animation = 'pulse 2s infinite';
                    }
                });
            }
        }
    }
    
    function getTimeSlotText(slot) {
        const times = {
            'slot-1': '9:00-10:00',
            'slot-2': '10:00-11:00',
            'slot-3': '11:00-12:00',
            'slot-4': '12:00-1:00',
            'lunch': '1:00-1:30',
            'slot-5': '1:30-2:30',
            'slot-6': '2:30-3:30',
            'slot-7': '3:30-4:30',
            'slot-8': '4:30-5:30'
        };
        return times[slot.class] || '';
    }
    
    // Add pulse animation for current time slot
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
            100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
        }
        
        .time-slot.current {
            position: relative;
            z-index: 1;
        }
        
        .time-slot.current .subject-card {
            border: 2px solid #667eea;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
        }
        
        .time-slot.current .time {
            background: linear-gradient(135deg, #4fd1c7, #38b2ac);
            box-shadow: 0 4px 15px rgba(56, 178, 172, 0.4);
        }
    `;
    document.head.appendChild(style);
    
    // Add swipe functionality for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    const timetableContainer = document.querySelector('.timetable-container');
    
    timetableContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    timetableContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const difference = touchStartX - touchEndX;
        
        if (Math.abs(difference) > swipeThreshold) {
            const currentTab = document.querySelector('.day-tab.active');
            const tabs = Array.from(document.querySelectorAll('.day-tab'));
            const currentIndex = tabs.indexOf(currentTab);
            
            let newIndex;
            if (difference > 0) {
                // Swipe left - next day
                newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
            } else {
                // Swipe right - previous day
                newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
            }
            
            tabs[newIndex].click();
        }
    }
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in-out';
        document.body.style.opacity = '1';
    }, 100);
    
    // Service Worker for offline functionality (optional)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js').then(function(registration) {
                console.log('ServiceWorker registration successful');
            }, function(err) {
                console.log('ServiceWorker registration failed');
            });
        });
    }
});

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    const tabs = document.querySelectorAll('.day-tab');
    const activeTab = document.querySelector('.day-tab.active');
    const currentIndex = Array.from(tabs).indexOf(activeTab);
    
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
        tabs[currentIndex - 1].click();
    } else if (e.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
        tabs[currentIndex + 1].click();
    }
});
