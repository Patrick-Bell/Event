
const addEventModal = document.getElementById('add-event-modal');
const openEventModal = document.querySelector('.bx-plus');
const closeAddEventModal = document.querySelector('.bx-x');
const addEventToList = document.querySelector('.bx-check');
const myEventsIcon = document.querySelector('.my-events')
const eventText = document.querySelector('.text')
const deleteModal = document.getElementById('delete-modal');
const deleteModalText = document.getElementById('delete-modal-text')


const futureEventsText = document.getElementById("future-events-text");
const pastEventsText = document.getElementById('past-events-text')


const ToFutureEventsContainer = document.querySelector('.future-events-container');
const ToPastEventsContainer = document.querySelector('.past-events-container');
const futureEventTab = document.querySelector('.future-events');
const pastEventTab = document.querySelector('.past-events');



const menuIcon = document.querySelector('.bx-menu');
const sideMenu = document.querySelector('.side-menu');



// event listener that toggles the menu

menuIcon.addEventListener("click", () => {
    sideMenu.classList.toggle('show');
    menuIcon.classList.toggle("bx-menu");
    menuIcon.classList.toggle("bx-menu-alt-left");
});

myEventsIcon.addEventListener('click', () => {
    sideMenu.classList.remove('show');
    menuIcon.classList.remove("bx-menu-alt-left")
    menuIcon.classList.add('bx-menu'); 
    console.log("clicking menu");
});



futureEventTab.addEventListener("click", () => {
    ToPastEventsContainer.style.display = "none";
    pastEventTab.style.background = "darkgrey";
    futureEventTab.style.background = "lightgrey";
    ToFutureEventsContainer.style.display = "block";
    pastEventsText.style.display = "none"
    futureEventsText.style.display = "block"
});


pastEventTab.addEventListener("click", () => {
    ToPastEventsContainer.style.display = "block";
    pastEventTab.style.background = "lightgrey";
    futureEventTab.style.background = "darkgrey";
    ToFutureEventsContainer.style.display = "none";
    futureEventsText.style.display = "none"
    pastEventsText.style.display = "block"

});




openEventModal.addEventListener("click", () => {
    addEventModal.showModal();
});

closeAddEventModal.addEventListener("click", () => {
    addEventModal.close();
});

const sortEventsInOrder = async () => {
    const response = await axios.get('/api/events');
    const events = response.data;

    // Separate events into future and past categories
    const futureEvents = events.filter(event => event.days >= 0);
    const pastEvents = events.filter(event => event.days < 0);

    // Update the days property for past events to reflect negative days
    pastEvents.forEach(event => {
        event.days = Math.abs(event.days); // Convert negative days to positive
    });

    // Sort future events by ascending days remaining
    futureEvents.sort((a, b) => a.days - b.days);

    // Sort past events by descending days (since they are in the past)
    pastEvents.sort((a, b) => b.days - a.days);

    // Render events based on the updated categorization

};

sortEventsInOrder()


const colorChosen = document.getElementById('color');
 

colorChosen.addEventListener('input', () => {
    const color = colorChosen.value;
    console.log(color); // Log the chosen color for debugging
    chooseColor(color); // Call the function to update the color
});


// function to get users color

function chooseColor(color) {
    const eventCardColor = document.querySelector('.event-card');
    const eventDaysCard = document.querySelector('.event-days-left');
    
    // Update the background color of the elements
    if (eventCardColor) eventCardColor.style.backgroundColor = color;
    if (eventDaysCard) eventDaysCard.style.backgroundColor = color; // Optionally, update other elements

}

// function that checks if events length and generates relevant HTML//



const checkFutureEventsLength = async (userId) => {
    try {
        const [futureResponse, pastResponse] = await Promise.all([
            axios.get('/api/future-events'),
            axios.get('/api/past-events')
        ]);

        const futureEvents = futureResponse.data;
        const pastEvents = pastResponse.data;

        if (futureEvents.length === 0 && pastEvents.length === 0) {
            futureEventsText.style.display = "block !important";
            futureEventsText.innerHTML = "Click '+' to create your first event.";
            pastEventsText.style.display = "block !important";
            pastEventsText.innerHTML = "Click '+' to create your first event.";
        } else if (futureEvents.length > 0 && pastEvents.length === 0) {
            futureEventsText.style.display = "none !important";
            futureEventsText.innerHTML = "";
            pastEventsText.style.display = "block !important";
            pastEventsText.innerHTML = `No past events and ${futureEvents.length} future event(s).`;
        } else if (pastEvents.length > 0 && futureEvents.length === 0) {
            futureEventsText.style.display = "block !important";
            futureEventsText.innerHTML = `No future events and ${pastEvents.length} past event(s)`;
            pastEventsText.style.display = "none !important";
            pastEventsText.innerHTML = "";
        } else {
            futureEventsText.style.display = "none !important";
            futureEventsText.innerHTML = "";
            pastEventsText.style.display = "none !important";
            pastEventsText.innerHTML = "";
        }
    } catch (error) {
        // Handle error here
        console.error("Error fetching events:", error);
    }
}


checkFutureEventsLength()




// function to get a color 20% darker

function componentToHex(c) {
    let hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function darkenColor(hex, percent) {
    // Remove '#' if present
    hex = hex.replace(/^#/, '');

    // Convert hexadecimal to RGB
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);

    // Darken the color by reducing each RGB component
    r = Math.floor(r * (1 - percent / 100));
    g = Math.floor(g * (1 - percent / 100));
    b = Math.floor(b * (1 - percent / 100));

    // Ensure values are within the valid range
    r = r < 0 ? 0 : r;
    g = g < 0 ? 0 : g;
    b = b < 0 ? 0 : b;
    r = r > 255 ? 255 : r;
    g = g > 255 ? 255 : g;
    b = b > 255 ? 255 : b;

    // Convert RGB back to hexadecimal
    let darkenHex = "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);

    return darkenHex;
}



// rendering the future events


addEventToList.addEventListener("click", async () => {
    const title = document.getElementById('event-title').value;
    const subtitle = document.getElementById('event-subtitle').value;
    const date = document.getElementById('event-date').value;

    closeAddEventModal.style.display = "none"
    addEventToList.style.display = "none"
    eventText.innerHTML = "Adding task..."

    const timeNow = new Date();
    console.log("Date string:", date); // Check the format of the date string

    const eventDate = new Date(date);
    console.log("Parsed event date:", eventDate); // Check the parsed date

    timeNow.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    const diff = eventDate.getTime() - timeNow.getTime();
    const differenceInDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
    console.log("Difference in days:", differenceInDays);

    let daysRemaining = differenceInDays;

    const event = {
        id: generateRandomID(),
        title: title,
        subtitle: subtitle,
        date: eventDate,
        days: daysRemaining,
        color: colorChosen.value,
        status: 'future'

    };

    try {
        const res = await axios.post('/api/events', event);
        if (res.status === 201) {
            console.log('Event saved successfully:', event);
            console.log('Testing DB', res.data)
            chooseColor(event.color); // Update UI with chosen color
            sortEventsInOrder()
            checkFutureEventsLength()
            renderPastEvents()
            renderFutureEvents()
            calculateEvents('future');
            calculateEvents('past');
            resetEventForm()
            addEventModal.close();
        } else {
            console.error('Failed to save event. Unexpected status code:', res.status);
        }
    } catch (error) {
        console.error('Error saving event:', error);
    }

});



// generating a random ID for each event

function generateRandomID() {
    let min = 1;
    let max = 1000

    const randomID = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomID.toString()
}

const hideModal = () => {
    deleteModal.style.display = 'none';
};


const attachDeleteEventListeners = () => {
    const trashIcons = document.querySelectorAll('.bx-trash');
    trashIcons.forEach(trashIcon => {
        // Check if event listener is already attached
        if (!trashIcon.hasEventListener) {
            trashIcon.hasEventListener = true; // Mark as attached
            trashIcon.addEventListener('click', async () => {
                deleteModal.showModal()
                deleteModalText.innerHTML = `Deleting Event. Please wait.`;
                const eventId = trashIcon.dataset.eventId;
                try {
                    await deleteProduct(eventId);
                    deleteModal.showModal()
                    trashIcon.parentElement.remove(); // Remove the event card from the DOM
                    deleteModal.close()
                } catch (error) {
                    console.error('Error deleting event:', error);
                    deleteModalText.innerHTML = `Error Deleting Event. Please refresh the page and try again.`;
                    deleteModal.close()
                    // Handle the error gracefully, such as showing a message to the user
                }
            });
        }
    });
};


const renderFutureEvents = async () => {
    try {
        const response = await axios.get('/api/future-events');
        const events = response.data;

        const sortedFutureEvents = events.sort((a, b) => a.days - b.days);

        const futureEventContainer = document.querySelector('.future-events-container');
        const timeNow = new Date();

        // Filter out events that have gone below 0 days
        
        futureEventContainer.innerHTML = sortedFutureEvents.map(event => {
            const dateObject = new Date(event.date);
            const formattedDate = dateObject.toLocaleDateString();
            const diff = dateObject.getTime() - timeNow.getTime();
            const differenceInDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
            event.days = differenceInDays; // Update the days property

            return `
                <div class="event-card" style="background: ${event.color}">
                    <i class='bx bx-timer' style="background: ${darkenColor(event.color, 20)}"></i>
                    <i class='bx bx-trash' style="display: none; background: ${darkenColor(event.color, 20)}" data-event-id="${event.id}"></i>
                    <div class="event-info-container">
                        <div class="event-name">${event.title}</div>
                        <div class="event-desc">${event.subtitle}</div>
                        <div class="event-time">${formattedDate}</div>
                    </div>
                    <div class="event-days-left" style="background: ${darkenColor(event.color, 20)}">
                        <div class="days-container">
                            <div class="days">${event.days}</div>
                            <div class="days-text">${event.days > 1 ? 'days' : 'day'} to go</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        futureEventContainer.addEventListener('mouseover', (event) => {
            const target = event.target;
        
            // Check if the target is a timer icon
            if (target.classList.contains('bx-timer')) {
                target.style.display = 'none'; // Hide the timer icon
                const trashIcon = target.nextElementSibling;
                if (trashIcon && trashIcon.classList.contains('bx-trash')) {
                    trashIcon.style.display = 'block'; // Show the trash icon
                }
            }
        });
        
        futureEventContainer.addEventListener('mouseout', (event) => {
            const target = event.target;
        
            // Check if the target is a trash icon
            if (target.classList.contains('bx-trash')) {
                target.style.display = 'none'; // Hide the trash icon
                const timerIcon = target.previousElementSibling;
                if (timerIcon && timerIcon.classList.contains('bx-timer')) {
                    timerIcon.style.display = 'block'; // Show the timer icon
                }
            }
        });
        
        // Call the function to attach delete event listeners when the page loads

        sortEventsInOrder()
        attachDeleteEventListeners()
        checkFutureEventsLength()
        calculateEvents('future');

    } catch (error) {
        console.error('Error fetching and rendering future events:', error);
        // Handle the error gracefully, such as showing a message to the user
    }
};

// rendering the past events

const renderPastEvents = async () => {
    try {
        const response = await axios.get('/api/past-events');
        const events = response.data;

        // Sort past events by date (ascending order)
        const pastEvents = events.sort((a, b) => new Date(b.date) - new Date(a.date));

        const pastEventsContainer = document.querySelector('.past-events-container');
        const timeNow = new Date();

        pastEventsContainer.innerHTML = pastEvents.map(event => {
            const dateObject = new Date(event.date);
            const formattedDate = dateObject.toLocaleDateString();
            const diff = dateObject.getTime() - timeNow.getTime();
            const differenceInDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
            event.days = differenceInDays; // Update the days property

            return `
                <div class="event-card" style="background: ${event.color}">
                    <i class='bx bx-timer' style="background: ${darkenColor(event.color, 20)}"></i>
                    <i class='bx bx-trash' style="display: none; background: ${darkenColor(event.color, 20)}" data-event-id="${event.id}"></i>
                    <div class="event-info-container">
                        <div class="event-name">${event.title}</div>
                        <div class="event-desc">${event.subtitle}</div>
                        <div class="event-time">${formattedDate}</div>
                    </div>
                    <div class="event-days-left" style="background: ${darkenColor(event.color, 20)}">
                        <div class="days-container">
                            <div class="days">${Math.abs(event.days)}</div>
                            <div class="days-text">${Math.abs(event.days) >= 1 ? 'days' : 'day'} ago</div>
                            </div>
                    </div>
                </div>
            `;
        }).join('');

        pastEventsContainer.addEventListener('mouseover', (event) => {
            const target = event.target;
        
            // Check if the target is a timer icon
            if (target.classList.contains('bx-timer')) {
                target.style.display = 'none'; // Hide the timer icon
                const trashIcon = target.nextElementSibling;
                if (trashIcon && trashIcon.classList.contains('bx-trash')) {
                    trashIcon.style.display = 'block'; // Show the trash icon
                }
            }
        });
        
        pastEventsContainer.addEventListener('mouseout', (event) => {
            const target = event.target;
        
            // Check if the target is a trash icon
            if (target.classList.contains('bx-trash')) {
                target.style.display = 'none'; // Hide the trash icon
                const timerIcon = target.previousElementSibling;
                if (timerIcon && timerIcon.classList.contains('bx-timer')) {
                    timerIcon.style.display = 'block'; // Show the timer icon
                }
            }
        });
        
        // Call the function to attach delete event listeners when the page loads

        sortEventsInOrder()
        attachDeleteEventListeners();
        checkFutureEventsLength()
        calculateEvents('past');  

    } catch (error) {
        console.error('Error fetching and rendering future events:', error);
        // Handle the error gracefully, such as showing a message to the user
    }
};


renderFutureEvents();
renderPastEvents()

// calculate the number of events in each category

const calculateEvents = async (eventType) => {
    try {
        let endpoint = '/api/future-events';
        let containerSelector = '.future-events-num';
        let eventLabel = 'Future';

        if (eventType === 'past') {
            endpoint = '/api/past-events';
            containerSelector = '.past-events-num';
            eventLabel = 'Past';
        }

        const response = await axios.get(endpoint);
        const events = response.data;
        const numOfEvents = document.querySelector(containerSelector);
        const eventsNum = events.length;
        numOfEvents.innerHTML = `${eventLabel} (${eventsNum})`;
    } catch (error) {
        console.error(`Error calculating ${eventType} events:`, error);
    }
};

calculateEvents('future');
calculateEvents('past');


// validation

function checkValidationFields() {
    const title = titleInput.value.trim(); // Remove leading and trailing whitespaces
    const subtitle = subtitleInput.value.trim(); // Remove leading and trailing whitespaces
    const chars = 25;

    const validatedTitle = title.length > 0 && title.length <= chars; // Check if title has characters and is within limit
    const validatedSubtitle = subtitle.length > 0 && subtitle.length <= chars; // Check if subtitle is within limit

    if (validatedTitle && validatedSubtitle) {
        addEventToList.removeAttribute('disabled');
        addEventToList.style.cursor = "pointer";
        console.log("should be allowed");
    } else {
        addEventToList.setAttribute('disabled', 'disabled');
        addEventToList.style.cursor = "not-allowed";
        console.log("shouldn't be allowed...");
    }
}

const titleInput = document.querySelector('#event-title');
titleInput.addEventListener("input", () => {
    let title = titleInput.value;
    let chars = 25;

    let validatedTitle = title.length <= chars;

    if (validatedTitle){
        console.log(validatedTitle);
    } else {
        alert("Whoops! Title must be 25 characters or less.");
    }

    checkValidationFields();
});

const subtitleInput = document.querySelector('#event-subtitle');
subtitleInput.addEventListener("input", () => {
    let subtitle = subtitleInput.value;
    let chars = 25;

    let validatedSubtitle = subtitle.length <= chars;

    if (validatedSubtitle) {
        console.log(validatedSubtitle);
    } else {
        alert("Whoops! Subtitle must be under 25 characters!");
    }

    checkValidationFields();
});

titleInput.addEventListener("input", checkValidationFields);
subtitleInput.addEventListener("input", checkValidationFields);




// function to reset the form each time it is submitted

const dateInput = document.getElementById('event-date')

function resetEventForm() {
    titleInput.value = "";
    subtitleInput.value = "";
    dateInput.value = "";
    closeAddEventModal.style.display = "block"
    addEventToList.style.display = "block"
    eventText.innerHTML = "Add Event"
}

const deleteProduct = async (eventId) => {
    try {
        const response = await axios.delete(`/api/events/${eventId}`);
        const deletedEvent = response.data;
        console.log('Deleted event:', deletedEvent);
        console.log('Sending this event to delete to the server', eventId)

        // Event deleted successfully, update UI
        renderFutureEvents();
        renderPastEvents();
     
        // Optionally, you can perform additional actions after deleting the event
    } catch (error) {
        console.error('Error deleting event:', error);
        // Handle the error gracefully, such as showing a message to the user
    }
};
