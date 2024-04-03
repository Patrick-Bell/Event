const reviewContainer = document.querySelector('.all-reviews-container');
const paginationContainer = document.querySelector('.pagination-container');
const reviewsRangeText = document.querySelector('.reviews-num')

async function renderReviewsOnPage(pageNumber = 1, pageSize = 3) {
    try {
        const response = await axios.get('/api/reviews');
        const reviews = response.data;

        // Calculate start and end indexes for the current page
        const startIndex = (pageNumber - 1) * pageSize;
        let endIndex = startIndex + pageSize;
        const reviewsForPage = reviews.slice(startIndex, endIndex);
        console.log(reviewsForPage)

        reviewContainer.innerHTML = reviewsForPage.map(review => {
            const dateObject = new Date(review.dateSubmitted);
            const formattedDate = dateObject.toLocaleDateString();
            const starsNumber = parseInt(review.reviewRating);
            const finalRating = Array(starsNumber).fill('<i class="ri-star-fill"></i>').join('');
            return `
                <div class="review-card">
                    <div class="review-line">
                        <div class="review-name">${review.name}</div>
                        <div class="review-submitted">${formattedDate}</div>
                    </div>
                    <div class="review-title">${review.reviewTitle}</div>
                    <div class="review-text">${review.reviewText}</div>
                    <div class="rating">${finalRating}</div>
                </div>
            `;
        }).join('');

        // Calculate total number of pages
        const totalPages = Math.ceil(reviews.length / pageSize);
        console.log(totalPages)

        if (endIndex > reviews.length) {
            endIndex = reviews.length;
        }
        
        // Slice the reviews for the current page
        
        reviewsRangeText.innerHTML = `Showing reviews <strong>${startIndex + 1}-${endIndex}</strong> out of <strong>${reviews.length}</strong>`;

        console.log(reviewsRangeText)

        // Initialize pagination controls
        paginationContainer.innerHTML = '';

        const skipLessButton = document.createElement('button')
        skipLessButton.textContent = '<<'
        skipLessButton.addEventListener('click', () => {
            renderReviewsOnPage(pageNumber - 2, pageSize)
            scrollToTop()
        })
        paginationContainer.appendChild(skipLessButton)

        // Previous page button
        const previousPageButton = document.createElement('button');
        previousPageButton.textContent = '<';
        previousPageButton.addEventListener('click', () => {
            renderReviewsOnPage(pageNumber - 1, pageSize);
            scrollToTop()
        });
        paginationContainer.appendChild(previousPageButton);

        // Page buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => {
                renderReviewsOnPage(i, pageSize);
                scrollToTop()
            });
            console.log(pageButton)

            // Add the 'selected' class to the current page button
            if (i === pageNumber) {
                pageButton.classList.add('selected');
            }

            paginationContainer.appendChild(pageButton);
        }

        // Next page button
        const nextPageButton = document.createElement('button');
        nextPageButton.textContent = '>';
        nextPageButton.addEventListener('click', () => {
            renderReviewsOnPage(pageNumber + 1, pageSize);
            scrollToTop()
        });
        paginationContainer.appendChild(nextPageButton);

        const skipPageButton = document.createElement('button')
        skipPageButton.textContent = '>>'
        skipPageButton.addEventListener("click", () => {
            renderReviewsOnPage(pageNumber + 2, pageSize)
            scrollToTop()
        })
        paginationContainer.appendChild(skipPageButton)

        // Disable "Previous" button on first page
        previousPageButton.disabled = pageNumber === 1;
        // Disable "Next" button on last page
        nextPageButton.disabled = pageNumber === totalPages;
        skipPageButton.disabled = pageNumber + 2 > totalPages;
        skipLessButton.disabled = pageNumber - 2 <= 0;

    } catch(error) {
        console.error(error);
    }
}

const calculateAverageRating = async () => {
    try {
        const response = await axios.get('/api/reviews')
        const reviews = response.data
        const avgRatingText = document.querySelector('.avg-rating')

        const numRatings = reviews.map(review => parseInt(review.reviewRating))

        const total = numRatings.reduce((sum, number) => sum + number, 0)

        const finalRating = (total / reviews.length).toFixed(2)
        console.log(finalRating)

        avgRatingText.innerHTML = `Average Rating: <strong>${finalRating}</strong> / 5 | Write your review <a href="/login">here</a>`
      
    } catch (error) {
        console.error(error)
    }
}

const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Smooth scrolling animation
    });
};



// Call the function to render reviews and initialize pagination
calculateAverageRating()
renderReviewsOnPage();
