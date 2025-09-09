document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
    function initializeApp() {
        updateDateTime();
        setupTabs();
        highlightCurrentDay();
        checkCurrentClass();
        autoScrollToCurrentClass();
        
        // Update every 30 seconds for better performance
        setInterval(() => {
            updateDateTime();
            checkCurrentClass();
            autoScrollToCurrentClass();
        }, 30000);
    }
    
    function updateDateTime() {
        const now = new Date();
        
        // Update current time
        const timeOptions = { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        };
        document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-IN', timeOptions);
        
        // Update current date  
        const dateOptions = { 
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        };
        document.getElementById('currentDate').textContent = now.toLocaleDateString('en-IN', dateOptions);
    }
    
    function setupTabs() {
        const tabs = document.querySelectorAll('.day-btn');
        const schedules = document.querySelectorAll('.day-schedule');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetDay = this.getAttribute('data-day');
                
                // Remove active class
                tabs.forEach(t => t.classList.remove('active'));
                schedules.forEach(s => s.classList.remove('active'));
                
                // Add active class
                this.classList.add('active');
                document.getElementById(targetDay).classList.add('active');
                
                // Check current class for selected day
                checkCurrentClass();
                autoScrollToCurrentClass();
            });
        });
    }
    
    function highlightCurrentDay() {
        const now = new Date();
        const currentDay = now.getDay();
        
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
                document.querySelectorAll('.day-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.day-schedule').forEach(schedule => schedule.classList.remove('active'));
                
                todayTab.classList.add('active');
                document.getElementById(todayKey).classList.add('active');
            }
        }
    }
    
    function checkCurrentClass() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;
        
        // Clear previous current class highlighting
        document.querySelectorAll('.time-slot.current').forEach(slot => {
            slot.classList.remove('current');
        });
        
        // Time slots in minutes from midnight
        const timeSlots = [
            { start: 9 * 60, end: 10 * 60, time: '09:00' },
            { start: 10 * 60, end: 11 * 60, time: '10:00' },
            { start: 11 * 60, end: 12 * 60, time: '11:00' },
            { start: 12 * 60, end: 13 * 60, time: '12:00' },
            { start: 13 * 60, end: 13 * 60 + 30, time: '13:00' },
            { start: 13 * 60 + 30, end: 14 * 60 + 30, time: '13:30' },
            { start: 14 * 60 + 30, end: 15 * 60 + 30, time: '14:30' },
            { start: 15 * 60 + 30, end: 16 * 60 + 30, time: '15:30' },
            { start: 16 * 60 + 30, end: 17 * 60 + 30, time: '16:30' }
        ];
        
        const currentSlot = timeSlots.find(slot => 
            currentTime >= slot.start && currentTime < slot.end
        );
        
        const activeSchedule = document.querySelector('.day-schedule.active');
        const alertDiv = document.getElementById('currentClassAlert');
        
        if (currentSlot && activeSchedule) {
            const currentTimeSlot = activeSchedule.querySelector(`[data-time="${currentSlot.time}"]`);
            
            if (currentTimeSlot) {
                currentTimeSlot.classList.add('current');
                
                // Show current class alert
                const classCard = currentTimeSlot.querySelector('.class-card');
                const subject = classCard.querySelector('.subject').textContent;
                const subjectName = classCard.querySelector('.subject-name')?.textContent || '';
                const faculty = classCard.querySelector('.faculty')?.textContent || '';
                const room = classCard.querySelector('.room')?.textContent || '';
                
                if (subject && subject !== 'Free Period') {
                    document.getElementById('alertSubject').textContent = subject;
                    document.getElementById('alertDetails').textContent = `${faculty} • ${room}`;
                    document.getElementById('alertTime').textContent = getTimeRemaining(currentSlot.end);
                    alertDiv.style.display = 'block';
                } else {
                    alertDiv.style.display = 'none';
                }
            }
        } else {
            alertDiv.style.display = 'none';
        }
    }
    
    function getTimeRemaining(endTime) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const remaining = endTime - currentTime;
        
        if (remaining <= 0) return 'Ended';
        if (remaining < 60) return `${remaining}m left`;
        
        const hours = Math.floor(remaining / 60);
        const minutes = remaining % 60;
        return minutes > 0 ? `${hours}h ${minutes}m left` : `${hours}h left`;
    }
    
    function autoScrollToCurrentClass() {
        const currentTimeSlot = document.querySelector('.time-slot.current');
        
        if (currentTimeSlot) {
            // Add a small delay to ensure DOM is updated
            setTimeout(() => {
                const container = document.querySelector('.schedule-container');
                const containerTop = container.offsetTop;
                const slotTop = currentTimeSlot.offsetTop;
                const slotHeight = currentTimeSlot.offsetHeight;
                
                // Calculate scroll position to center the current class
                const scrollPosition = slotTop - containerTop - (window.innerHeight / 2) + (slotHeight / 2);
                
                window.scrollTo({
                    top: Math.max(0, scrollPosition),
                    behavior: 'smooth'
                });
            }, 100);
        } else {
            // If no current class, scroll to show upcoming classes
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            
            // If it's before 9 AM, stay at top
            if (currentTime < 9 * 60) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            
            // If it's after classes, scroll to show last few classes
            if (currentTime > 17 * 60 + 30) {
                const activeSchedule = document.querySelector('.day-schedule.active');
                if (activeSchedule) {
                    const timeSlots = activeSchedule.querySelectorAll('.time-slot');
                    const lastSlot = timeSlots[timeSlots.length - 1];
                    if (lastSlot) {
                        lastSlot.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
                return;
            }
            
            // Find next upcoming class
            const timeSlots = [
                { start: 9 * 60, time: '09:00' },
                { start: 10 * 60, time: '10:00' },
                { start: 11 * 60, time: '11:00' },
                { start: 12 * 60, time: '12:00' },
                { start: 13 * 60, time: '13:00' },
                { start: 13 * 60 + 30, time: '13:30' },
                { start: 14 * 60 + 30, time: '14:30' },
                { start: 15 * 60 + 30, time: '15:30' },
                { start: 16 * 60 + 30, time: '16:30' }
            ];
            
            const nextSlot = timeSlots.find(slot => currentTime < slot.start);
            
            if (nextSlot) {
                const activeSchedule = document.querySelector('.day-schedule.active');
                const nextTimeSlot = activeSchedule?.querySelector(`[data-time="${nextSlot.time}"]`);
                
                if (nextTimeSlot) {
                    nextTimeSlot.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    }
    
    // Add swipe functionality for mobile navigation
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const difference = touchStartX - touchEndX;
        
        if (Math.abs(difference) > swipeThreshold) {
            const currentTab = document.querySelector('.day-btn.active');
            const tabs = Array.from(document.querySelectorAll('.day-btn'));
            const currentIndex = tabs.indexOf(currentTab);
            
            let newIndex;
            if (difference > 0 && currentIndex < tabs.length - 1) {
                newIndex = currentIndex + 1;
            } else if (difference < 0 && currentIndex > 0) {
                newIndex = currentIndex - 1;
            }
            
            if (newIndex !== undefined) {
                tabs[newIndex].click();
            }
        }
    }
    
    // Optimize performance by throttling scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        scrollTimeout = setTimeout(() => {
            // Any scroll-related functionality can go here
        }, 100);
    });
});
