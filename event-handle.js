const EventModel = require('./models/event');

const updateEventStatus = async () => {
    try {
        const currentTime = new Date();

        // Find all events
        const events = await EventModel.find();

        // Iterate through each event
        for (const event of events) {
            const eventDate = new Date(event.date);
            let status;
        
            // Get the current date without time (midnight)
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
        
            if (eventDate < currentDate) {
                status = 'past';
            } else if (eventDate >= currentDate) {
                status = 'future';
            }
            // Update the status field in the database
            await EventModel.findByIdAndUpdate(event._id, { status });
        }
    } catch (error) {
        console.error('Error updating event statuses:', error);
    }

    // Schedule the next update for the next day at midnight
    const now = new Date();
    const millisTillMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0) - now;
    setTimeout(updateEventStatus, millisTillMidnight);
};

// Start the initial update
updateEventStatus();


// code for email reminder

module.exports = updateEventStatus;
