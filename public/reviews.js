document.addEventListener("DOMContentLoaded", function() {
    renderReviews();
    totalNumberOfRatings()
});

async function totalNumberOfRatings() {
    try {
        const response = await axios.get('/api/reviews');
        const reviews = response.data;
        const reviewsText = document.querySelector('.all-reviews'); // Target the correct element
        const reviewsLength = reviews.length;
        console.log(reviewsLength);
        reviewsText.innerHTML = `View all reviews <strong>(${reviewsLength})</strong>`; // Update innerHTML
    } catch (error) {
        console.error(error);
    }
};



const stars = document.querySelectorAll('.stars i');
const submitReviewBtn = document.getElementById('submit-btn');
let reviewRating = 5

stars.forEach((star, index1) => {
    star.classList.add('review-gold'); // Initially add the 'review-gold' class to all stars
    star.addEventListener("click", () => {
        stars.forEach((star, index2) => {
            index1 >= index2 ? star.classList.add('review-gold') : star.classList.remove('review-gold');
            reviewRating = index1 + 1; // Assign value to reviewRating
        });
    });
});


async function renderReviews() {
    console.log('triggering render reviews function');
    try {
        const response = await axios.get('/api/reviews');
        const reviews = response.data;
        const reviewsContainer = document.getElementById('reviews-container');
        console.log('trying rendering reviews');
        console.log(reviews)
        const sortedReviews = reviews.filter(review => review.id === "37" || review.id === "269" || review.id === "261" || review.id === "580")
        

        // Map through the reviews and create HTML for each review
        reviewsContainer.innerHTML = `
            <div class="swiper-container">
                <div class="swiper-wrapper">
                    ${sortedReviews.map(review => `
                        <div class="swiper-slide">
                            <div class="review__card">
                                <img src="${review.image}">
                                <h4 class="review-name">${review.name}</h4>
                                <h5 class="review-joined">Member since: ${(review.joined).slice(0, 10)}</h5>
                                <p class="review-title">${review.reviewTitle}</p>
                                <p class="review-text">${review.reviewText}</p>
                                <div class="review__rating">
                                ${Array(parseInt(review.reviewRating)).fill('<i class="ri-star-fill"></i>').join('')}
                                </div>
                        </div>
                        </div>
                    `).join('')}
                </div>
                <div class="swiper-pagination"></div>
            </div>
        `;

        // Initialize Swiper after the reviews are rendered
        new Swiper('.swiper-container', {
            autoplay: true,
            loop: true,
            slidesPerView: 1.5, // Set 1.5 slides per view
            centeredSlides: true, // Center the main slide
            spaceBetween: 20, // Adjust space between slides as needed
            pagination: {
                el: '.swiper-pagination',
            },
        });

    } catch (error) {
        console.error('Error fetching and rendering reviews:', error);
        console.log('not rendering reviews', error);
    }
}


submitReviewBtn.addEventListener("click", async () => {
    const reviewTitle = document.getElementById('review-title');
    const reviewText = document.getElementById('review-text');
    submitReviewBtn.disabled = true;
    submitReviewBtn.style.cursor = "not-allowed";

    let title = reviewTitle.value;
    let text = reviewText.value;

    let review = {
        id: generateRandomID(),
        reviewRating: reviewRating,
        reviewTitle: title,
        reviewText: text,
        dateSubmitted: new Date()
    };

    console.log(review);

    try {
        const res = await axios.post('/api/reviews', review);
        if (res.status === 201) {
            console.log('Review saved successfully:', review);
            console.log('Response from server:', res.data);
            submitReviewBtn.disabled = false;
            submitReviewBtn.style.cursor = "pointer";
            resetReviewForm();
            renderReviews(); // Re-render reviews after submitting a new review
        } else {
            console.error('Failed to save review. Unexpected status code:', res.status);
        }
    } catch (error) {
        console.error('Error saving review:', error);
    }
});

function resetReviewForm() {
    const reviewTitle = document.getElementById('review-title');
    const reviewText = document.getElementById('review-text');
    const stars = document.querySelectorAll('.stars i');
    stars.forEach(star => {
        star.classList.add('review-gold');
    });
    reviewTitle.value = "";
    reviewText.value = "";
    submitReviewBtn.style.background = "lightgrey";
    submitReviewBtn.style.cursor = "not-allowed"
    submitReviewBtn.setAttribute('disabled', 'disabled')
}

function generateRandomID() {
    let min = 1;
    let max = 1000;
    const randomID = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomID.toString();
}


const reviewTitleInput = document.getElementById('review-title');
const reviewTextInput = document.getElementById('review-text');
const titleError = document.querySelector('.review-title-error');
const textError = document.querySelector('.review-text-error');
let includesTextTemplate, includesTitleTemplate;

function checkReviewValidation() {
    if (includesTextTemplate && includesTitleTemplate) {
        submitReviewBtn.removeAttribute('disabled');
        submitReviewBtn.style.background = "green";
        submitReviewBtn.style.cursor = "pointer";
    } else {
        submitReviewBtn.setAttribute('disabled', 'disabled');
        submitReviewBtn.style.background = "lightgrey";
        submitReviewBtn.style.cursor = "not-allowed";
    }
}

reviewTitleInput.addEventListener("input", () => {
    let title = reviewTitleInput.value;
    let chars = 40;
    let left = chars - title.length;

    includesTitleTemplate = left >= 0 && left <= 30; // Between 10-40 characters

    if (title.length === 0) {
        console.log('empty');
        titleError.style.display = "none";
    } else if (includesTitleTemplate) {
        console.log('working...');
        titleError.style.display = "none";
    } else {
        titleError.style.display = "block";
        titleError.innerHTML = "Title must be between 10 and 40 characters.";
    }

    checkReviewValidation();
});

reviewTextInput.addEventListener("input", () => {
    let text = reviewTextInput.value;
    let chars = 200;
    let left = chars - text.length;

    includesTextTemplate = left >= 0 && left <= 190; // Between 10-75 characters

    if (text.length === 0) {
        console.log('empty');
        textError.style.display = "none";
    } else if (includesTextTemplate) {
        console.log('working...');
        textError.style.display = "none";
    } else {
        textError.style.display = "block";
        textError.innerHTML = "Text must be between 10 and 200 characters.";
    }

    checkReviewValidation();
});


totalNumberOfRatings()
renderReviews();
