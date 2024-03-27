const EventModel = require('./models/event');
const nodemailer = require('nodemailer')

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


const sendEmailReminder = async () => {
    try {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0); // Set time to midnight
        
        if (now.getTime() === midnight.getTime()) { // Check if it's midnight
            // Find all events
            const events = await EventModel.find();

            // Iterate through each event
            for (const event of events) {
                if (event.days === '1') { // Assuming 'days' is stored as a string
                    console.log('email reminder');

                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.USER,
                            pass: process.env.PASS
                        }
                    });

                    const eventDate = new Date(event.date);
                    const formattedDate = eventDate.toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long' });               
                    const emailContent = `<p>Hi ${event.createdByUser}</p><br>
                    You have an upcoming event tomorrow!<br><br>
                    <strong>When?</strong> ${formattedDate}<br><br>
                    <strong>What?</strong> ${event.title} - ${event.subtitle}<br><br>
                    Enjoy!<br><br>
                    Time Ticker Team<br>
                    https://timetickeronrender.com`
                    ;

                    const userEventReminder = {
                        from: process.env.USER,
                        to: event.createdByEmail,
                        subject: `Event Reminder - ${formattedDate}`,
                        html: emailContent
                    };

                    transporter.sendMail(userEventReminder, (error, info) => {
                        if (error) {
                            console.error('Error sending email:', error);
                        } else {
                            console.log('Reminder sent');
                        }
                    });
                } else {
                    console.log('no email reminder');
                }
            }
        }
    } catch (error) {
        console.error('Error sending email reminders:', error);
    }

    // Schedule the next update for the next day at midnight
    const now = new Date();
    const millisTillMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0) - now;
    setTimeout(sendEmailReminder, millisTillMidnight)
};

sendEmailReminder();

module.exports = { updateEventStatus, sendEmailReminder };

