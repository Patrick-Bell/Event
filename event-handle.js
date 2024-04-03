const EventModel = require('./models/event');
const UserModel = require('./models/user')
const ReviewModel = require('./models/review')
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
                    const formattedDate = eventDate.toLocaleString('en-US', { dateStyle: 'long' });               
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
        
    } catch (error) {
        console.error('Error sending email reminders:', error);
    }
}




const sendWeeklyReport = async () => {
    try {
        const events = await EventModel.find();
        const users = await UserModel.find();
        const reviews = await ReviewModel.find();

        // User report
        console.log('Number of Users:', users.length);
        let userList = '<table border="1" style="width: 100%; text-align: center;"><tr><th style="padding: 10px">Username</th><th>Email</th></tr>';
        users.forEach(user => {
            console.log({ user: user.username, email: user.email });
            userList += `<tr><td style="padding: 10px">${user.username}</td><td>${user.email}</td></tr>`;
        });
        userList += '</table>';
        
        // Events report
        const numOfEvents = events.length;
        console.log('Total Events:', numOfEvents);
        const pastEvents = events.filter(event => event.status === 'past');
        console.log('Number of Past Events:', pastEvents.length);
        const futureEvents = events.filter(event => event.status === 'future');
        console.log('Number of Future Events:', futureEvents.length);

        // Calculate event counts for each user
        const eventCounts = {};
        events.forEach(event => {
            const key = `${event.createdByUser}-${event.createdByEmail}`;
            eventCounts[key] = (eventCounts[key] || 0) + 1;
        });
        console.log('Number of Events per User:', eventCounts);

        // Format event counts for email
        let eventCountsList = '<table border="1" style="width: 100%; text-align: center;"><tr><th style="padding: 10px">User ID</th><th>Email ID</th><th>Event Count</th></tr>';
        Object.keys(eventCounts).forEach(key => {
            const [userId, emailId] = key.split('-');
            eventCountsList += `<tr><td style="padding: 10px">${userId}</td><td>${emailId}</td><td>${eventCounts[key]}</td></tr>`;
        });
        eventCountsList += '</table>';

        // Calculate average rating of reviews
        const numOfReviews = reviews.length;
        console.log('Number of Reviews:', numOfReviews);
        const sumOfRatings = reviews.reduce((sum, review) => sum + parseInt(review.reviewRating), 0);
        const averageRating = sumOfRatings / numOfReviews;
        console.log('Average Rating:', averageRating);

        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        const sevenDaysFuture = new Date(today);
        sevenDaysFuture.setDate(today.getDate() + 7)

        const todayDate = today.toLocaleDateString()
        const sevenDaysAgoDate = sevenDaysAgo.toLocaleDateString()
        const sevenDaysFutureDate = sevenDaysFuture.toLocaleDateString()


        // Send email report
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.USER,
                pass: process.env.PASS
            }
        });

        const emailContent = `
            This weekly report shows information around the number of users, events and reviews. 
            This report is generated every Monday morning at 9am. This email shows the updated data from 
            <strong>${sevenDaysAgoDate}</strong> to <strong>${todayDate}</strong>.<br><br>
            The next report will be generated on <strong>Monday ${sevenDaysFutureDate}</strong> at <strong>9am</strong>.<br><br>
            <strong>Number of Users: </strong>${users.length}<br><br>
            <strong>List of Users:</strong><br>
            ${userList}<br>
            <strong>Number of Events: </strong>${numOfEvents}<br>
            <strong>Number of Past Events: </strong>${pastEvents.length}<br>
            <strong>Number of Future Events: </strong>${futureEvents.length}<br><br>
            <strong>Event Counts per User:</strong><br>
            ${eventCountsList}<br>
            <strong>Number of Reviews: </strong>${numOfReviews}<br>
            <strong>Average Rating: </strong>${averageRating}<br>
            <br>
            TimeTicker Team<br>
            http://eventcountdown.onrender.com<br>
            `;

        const mailOptions = {
            from: process.env.USER,
            to: process.env.USER, // Replace with recipient email address
            subject: `Weekly Report - ${todayDate}`,
            html: emailContent
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Weekly report sent:', info.response);
            }
        });
    } catch (error) {
        console.error('Error generating and sending weekly report:', error);
    }
};


module.exports = { updateEventStatus, sendEmailReminder, sendWeeklyReport };

