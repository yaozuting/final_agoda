document.addEventListener("DOMContentLoaded", function() {
    let data = [];

    document.getElementById("search-button").addEventListener("click", function(event) {
        event.preventDefault();
        
        const location = document.getElementById("place-select").value;
        const fileName = `all/rawdata_${location}.csv`;
    
        
        Papa.parse(fileName, {
            encoding: "UTF-8",
            download: true,
            header: true,
            complete: function(results) {
                data = results.data;
                data = filter_Data(data);
                renderHotels(data);
                filterData();
    
                // Display the number of results with specific formatting
                const resultCount = data.length;
                const resultText = `<span class="result-count">(${resultCount} results)</span>`;
                document.getElementById('selected-location').innerHTML = `${location} ${resultText}`;
            },
            error: function(error) {
                console.error("Error parsing CSV:", error);
            }
        });
    });
    
    
    function filter_Data(data) {
        const minPrice = parseFloat(document.querySelector(".min-input").value);
        const maxPrice = parseFloat(document.querySelector(".max-input").value);
        const selectedFacilities = Array.from(document.querySelectorAll('input[name="facilities"]:checked')).map(input => input.value);
        const selectedStarRatings = Array.from(document.querySelectorAll('input[name="star-rating"]:checked')).map(input => input.value);
   
        data = data.filter(hotel => {
            const price = parseFloat(hotel.Price);
            
            // Exclude rows where the price is "Not Found"
            if (isNaN(price)) {
                return false;
            }
        
            // Check if Facilities is defined and not null
            const facilities = hotel.Facilities ? hotel.Facilities.toLowerCase() : '';
            console.log("facilities",facilities)
            // Check if the hotel price is within the price range
            if (price < minPrice || price > maxPrice) {
                return false;
            }
        
            // Check if the hotel facilities include selected facilities
            for (const facility of selectedFacilities) {
                const lowerCaseFacility = facility.toLowerCase();
                console.log("lowerCaseFacility", lowerCaseFacility);
                
                const individualFacilities = facilities.split(',');
                
                let facilityFound = false;
                for (const hotelFacility of individualFacilities) {
                    if (hotelFacility.toLowerCase().includes(lowerCaseFacility)) {
                        facilityFound = true;
                        break;
                    }
                }
        
                if (!facilityFound) {
                    return false;
                }
            }

            // Check if the hotel's star rating is in the selected star ratings
            const starRating = parseFloat(hotel['Star Rating']);
            if (selectedStarRatings.length > 0 && !selectedStarRatings.includes(starRating.toString())) {
                return false;
            }

            return true;
        });
        
        console.log(data);
        return data;
    }
    

    function renderHotels(data) {
        const container = document.getElementById('hotels-list');
        container.innerHTML = '';

        data.forEach(hotel => {
            if (!hotel || Object.keys(hotel).length === 0 || !hotel['Hotel Name']) {
                return;
            }

            const hotelContainer = document.createElement('div');
            hotelContainer.classList.add('hotel-container');

            const leftColumn = document.createElement('div');
            leftColumn.classList.add('left-column');
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('img-container');
            const img = document.createElement('img');
            img.src = hotel['img'] || 'default-image.jpg';
            img.alt = hotel['Hotel Name'];
            imgContainer.appendChild(img);
            leftColumn.appendChild(imgContainer);

            const middleColumn = document.createElement('div');
            middleColumn.classList.add('middle-column');
            middleColumn.innerHTML = `
                <h3 style="margin-top: 0;">${hotel['Hotel Name']} ${generateStarRating(hotel['Star Rating'])}</h3> 
                <p style="margin: 0;"><i>${hotel['Location']}</i></p>
                <p style="margin-bottom: 0;"><strong>The Property offers:</strong></p>
                <p style="margin: 0;">${parseFacilities(hotel['Facilities'])}</p>
            `;

            const rightColumn = document.createElement('div');
            rightColumn.classList.add('right-column');
            rightColumn.innerHTML = `
                <p style="margin-bottom: 0; margin-left:2px; font-size: 1.01em; margin-top:5px;"><strong>${hotel['Review']}</strong></p>
                <p style="margin-top: 0;margin-left:2px;">(${hotel['Review Number']} reviews)</p>
                <p class="price_section">NT$<span class="price"><strong>${hotel['Price']}</strong></span></p>
            `;

            hotelContainer.appendChild(leftColumn);
            hotelContainer.appendChild(middleColumn);
            hotelContainer.appendChild(rightColumn);

            hotelContainer.addEventListener('click', function() {
                window.open(hotel['hyperlink'], '_blank');
            });

            container.appendChild(hotelContainer);
        });
    }


    // Helper function to create a hotel container
    function createHotelContainer(hotelData) {
        const hotelContainer = document.createElement('div');
        hotelContainer.classList.add('hotel-container');

        const leftColumn = document.createElement('div');
        leftColumn.classList.add('left-column');
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('img-container');
        const img = document.createElement('img');
        img.src = hotelData['img'] || 'default-image.jpg';
        img.alt = hotelData['Hotel Name'];
        imgContainer.appendChild(img);
        leftColumn.appendChild(imgContainer);

        const middleColumn = document.createElement('div');
        middleColumn.classList.add('middle-column');
        middleColumn.innerHTML = `
            <h3 style="margin-top: 0;">${hotelData['Hotel Name']} ${generateStarRating(hotelData['Star Rating'])}</h3> 
            <p style="margin: 0;"><i>${hotelData['Location']}</i></p>
            <p style="margin-bottom: 0;"><strong>The Property offers:</strong></p>
            <p style="margin: 0;">${parseFacilities(hotelData['Facilities'])}</p>
        `;

        const rightColumn = document.createElement('div');
        rightColumn.classList.add('right-column');
        rightColumn.innerHTML = `
            <p style="margin-bottom: 0; margin-left:2px; font-size: 1.1em; margin-top:5px;"><strong>${hotelData['Review']}</strong></p>
            <p style="margin-top: 0;margin-left:2px;">(${hotelData['Review Number']} reviews)</p>
            <p class="price_section">NT$<span class="price"><strong>${hotelData['Price']}</strong></span></p>
        `;

        hotelContainer.appendChild(leftColumn);
        hotelContainer.appendChild(middleColumn);
        hotelContainer.appendChild(rightColumn);

        hotelContainer.addEventListener('click', function() {
            window.open(hotelData['hyperlink'], '_blank');
        });

        return hotelContainer;
    }

    function generateStarRating(rating) {
        try {
            if (!rating || rating.toLowerCase() === 'not available') {
                return '';
            }

            rating = parseFloat(rating);
            if (rating >= 1 && rating <= 5) {
                let stars = '★'.repeat(Math.floor(rating));
                if (rating % 1 !== 0) {
                    stars += '½';
                }
                return `<span style="font-size: 0.6em;">(${stars})</span>`;
            } else {
                return '';
            }
        } catch (error) {
            return '';
        }
    }

    function parseFacilities(facilitiesList) {
        try {
            if (!facilitiesList) {
                return '';
            }
            const facilities = facilitiesList.split(',');
            const facilitiesWithBorder = facilities.map(facility => {
                return `<span class="facility" style="border: 1px solid #ccc; padding: 2px 4px; margin: 2px; display: inline-block;">${facility.trim()}</span>`;
            });
            return facilitiesWithBorder.join(' ');
        } catch (error) {
            return '';
        }
    }

    const rangeInputs = document.querySelectorAll(".slider-container input");
    const priceInputs = document.querySelectorAll(".price-input input");
    const priceGap = 500;

    rangeInputs.forEach(input => {
        input.addEventListener("input", e => {
            let minVal = parseInt(rangeInputs[0].value);
            let maxVal = parseInt(rangeInputs[1].value);
            if ((maxVal - minVal) < priceGap) {
                if (e.target.className === "min-range") {
                    rangeInputs[0].value = maxVal - priceGap;
                } else {
                    rangeInputs[1].value = minVal + priceGap;
                }
            } else {
                priceInputs[0].value = minVal;
                priceInputs[1].value = maxVal;
            }
            filterData();
        });
    });

    priceInputs.forEach(input => {
        input.addEventListener("input", e => {
            let minPrice = parseInt(priceInputs[0].value);
            let maxPrice = parseInt(priceInputs[1].value);
            if ((maxPrice - minPrice >= priceGap) && maxPrice <= 10000) {
                if (e.target.className === "min-input") {
                    rangeInputs[0].value = minPrice;
                } else {
                    rangeInputs[1].value = maxPrice;
                }
                filterData();
            }
        });
    });
                
    function filterData() {
        const selectedCity = document.getElementById('place-select').value;
        const minPrice = parseFloat(priceInputs[0].value);
        const maxPrice = parseFloat(priceInputs[1].value);
        createChart(data);
    }
                
    function createChart(filteredData) {
        const prices = [];
        const scores = [];
        const reviews = [];
        const hotels = [];
        const hyperlinks = [];

        filteredData.forEach(item => {
            prices.push(parseFloat(item.Price));
            scores.push(parseFloat(item.Review));
            reviews.push(parseInt(item['Review Number']));
            hotels.push(item['Hotel Name']);
            hyperlinks.push(item.hyperlink);
        });

        const trace = {
            x: prices,
            y: scores,
            text: hotels,
            mode: 'markers',
            marker: {
                size: reviews.map(review => Math.sqrt(review)),
                color: reviews,
                colorscale: 'Viridis',
                showscale: true
            }
        };

        const chartData = [trace];

        const layout = {
            title: 'Bubble Chart: Price vs. Review Score (Color-coded by Number of Reviews)',
            xaxis: {title: 'Price (TWD)'},
            yaxis: {title: 'Review Score'},
            showlegend: false
        };

        Plotly.newPlot('bubble-chart', chartData, layout);

        document.getElementById('bubble-chart').on('plotly_click', function(data){
            const pointIndex = data.points[0].pointIndex;
            const hotelData = filteredData[pointIndex];
            const hotelContainer = createHotelContainer(hotelData); // Create hotel container
            const hotelsList = document.getElementById('hotels-list');
            hotelsList.innerHTML = ''; // Clear previous content
            hotelsList.appendChild(hotelContainer); // Append
        });
    }
});
