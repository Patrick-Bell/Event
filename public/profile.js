const eventClick = document.querySelector('.events-show');
const profileClick = document.querySelector('.profile-show');
const reviewClick = document.querySelector('.reviews-show');


const profileTab = document.querySelector('.profile-tab');
const eventTab = document.querySelector('.event-tab');
const reviewTab = document.querySelector('.review-tab')


const futureEvents = document.getElementById('future-events');
const pastEvents = document.getElementById('past-events');
const totalEvents = document.getElementById('total-events');

eventClick.addEventListener("click", () => {
    profileTab.style.display = "none";
    reviewTab.style.display = "none"
    eventTab.style.display = "block"
})

profileClick.addEventListener("click", () => {
    eventTab.style.display = "none";
    reviewTab.style.display = "none"
    profileTab.style.display = "block"
})

reviewClick.addEventListener("click", () => {
    profileTab.style.display = "none";
    eventTab.style.display = "none"
    reviewTab.style.display = "block"
})



const findTotalPastEvents = async () => {
    try {
        const response = await axios.get('/api/past-events');
        const events = response.data;
        const allEvents = events.length;
        
        if (allEvents === 0) {
            pastEvents.innerHTML = "No events found.";
        } else {
            pastEvents.innerHTML = allEvents.toString();
        }
    } catch (error) {
        console.error('Error fetching events:', error);
        pastEvents.innerHTML = "Error loading events.";
    }
};

findTotalPastEvents()

const findTotalFutureEvents = async () => {
    try {
        const response = await axios.get('/api/future-events');
        const events = response.data;
        const allEvents = events.length;
        
        if (allEvents === 0) {
            futureEvents.innerHTML = "No events found.";
        } else {
            futureEvents.innerHTML = allEvents.toString();
        }
    } catch (error) {
        console.error('Error fetching events:', error);
        futureEvents.innerHTML = "Error loading events.";
    }
};

findTotalFutureEvents()

const findTotalEvents = async () => {
    try {
        const response = await axios.get('/api/events');
        const events = response.data;
        const allEvents = events.length;
        
        if (allEvents === 0) {
            totalEvents.innerHTML = "No events found.";
        } else {
            totalEvents.innerHTML = allEvents.toString();
        }
    } catch (error) {
        console.error('Error fetching events:', error);
        totalEvents.innerHTML = "Error loading events.";
    }
};


findTotalEvents()


