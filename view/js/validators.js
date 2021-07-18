/**
 * Attach {validateHighLow} handler to elements with name in the array
 * */
window.addEventListener('load', function () {
    ['price', 'livingarea', 'landarea']
        .forEach(name => document.getElementsByName(name)
            .forEach(element => element.addEventListener('change', validateHighLow), false))

    $('select').on('change', validateSelectLimitations);
}, false)


/**
 * Data variable used for download button
 * */
let tableData = [];

// preventDefault()
$("form").submit(function (e) {
    return false;
});

function validateHighLow(e) {
    const [low, high] = document.getElementsByName(e.target.name)
    if (high.value === '' || low.value === '') {
        return;
    }
    isValid(low, high)
}

function isValid(low, high) {
    if (high.value === '' || low.value === '') {
        return true;
    }
    const lowValue = parseInt(low.value)
    const highValue = parseInt(high.value)
    if (highValue < lowValue || lowValue > highValue) {
        low.classList.remove('valid')
        high.classList.remove('valid')
        low.classList.add('invalid')
        high.classList.add('invalid')
        return false;
    } else {
        low.classList.remove('invalid')
        high.classList.remove('invalid')
        low.classList.add('valid')
        high.classList.add('valid')
        return true;
    }
}

function addInvalidClass(element, isInvalid) {
    console.log(element)
    if (isInvalid) {
        element.classList.remove('error-hidden')
    } else {
        element.classList.add('error-hidden')
        // element.classList.add('valid')
    }
}

/**
 * Check if Select fields have selected values
 * if not -> red warning
 * */
function validateSelectFields() {
    const zip = document.getElementById('postcode');
    const zipInput = document.getElementById('postcode').parentNode.children[1];

    const address = document.getElementById('address');
    const addressInput = document.getElementById('address').parentNode.children[1];

    const type = document.getElementById('type');
    const typeInput = document.getElementById('type').parentNode.children[1];

    const [zipError, addressError, typeError] = document.getElementsByClassName('error-select');

    let flag = true;
    const fields = [[zip, zipError], [address, addressError], [type, typeError]];

    fields.forEach(([field, inputField]) => {
        if (field.value === '') {
            console.log('invalid')
            addInvalidClass(inputField, true);
            flag = false;
        } else {
            console.log('valid')
            addInvalidClass(inputField, false);
        }
    })

    return flag;
}

function validateSelectLimitations() {
    const zipDOM = document.getElementById('postcode');
    const zipInput = document.getElementById('postcode').parentNode.children[1].getElementsByTagName('li');
    const addressDOM = document.getElementById('address');
    const addressInput = document.getElementById('address').parentNode.children[1].getElementsByTagName('li');

    if (daysDifference() < 8 * 7) { // less than 8 weeks
        console.log("less than 8 weeks")
        return true;
    } else if (daysDifference() < 18 * 7 && daysDifference() >= 8 * 7) { // between 8 and 18 weeks
        console.log("between 8 and 18 weeks")
        return disableSelectOptions(zipDOM, zipInput, 1);
    } else if (daysDifference() < 52 * 7 && daysDifference() >= 18 * 7) { // between 18 and 52 weeks
        console.log("between 18 and 52 weeks")
        const limit1 = !disableSelectOptions(zipDOM, zipInput, 2);
        const limit2 = !disableSelectOptions(addressDOM, addressInput, 20);
        if (limit1 || limit2)
            return false;
    } else if (daysDifference() >= 52 * 7) { // more than 50 weeks
        console.log("more than 52 weeks")
        return disableSelectOptions(addressDOM, addressInput, 5);
    }

    $('select').formSelect();

    return true;
}

function disableSelectOptions(selectDOM, selectInput, limitSelected) {
    let flag = true;
    const results = [];
    for (let i = 0; i < selectDOM.options.length; i++) {
        const opt = selectDOM.options[i];
        if (opt.selected) {
            results.push(opt.value);
        }
    }

    if (results.length >= limitSelected) {
        let numberOfSelected = 0;
        for (let i = 0; i < selectDOM.options.length; i++) {
            const opt = selectDOM.options[i];
            const inputOpt = selectInput[i];
            !opt.selected ? opt.disabled = true : opt.disabled = false;
            !opt.selected ? inputOpt.classList.add("disabled") : inputOpt.classList.remove("disabled");
            if (opt.selected) {
                numberOfSelected++;
                if (numberOfSelected > limitSelected) {
                    opt.selected = false;
                    opt.disabled = true;
                    inputOpt.classList.add('disabled');
                }
            }
        }
        flag = false;
    } else {
        for (let i = 0; i < selectDOM.options.length; i++) {
            const opt = selectDOM.options[i];
            const inputOpt = selectInput[i];
            opt.disabled = false;
            inputOpt && inputOpt.classList.remove("disabled");
        }
    }
    return flag;
}

function daysDifference() {
    const Difference_In_Time = endDate.getTime() - startDate.getTime();
    return Difference_In_Time / (1000 * 3600 * 24);
}


function setData(data) {
    tableData = data;
}

/**
 * Gather data, and GET search results
 * */
function handleSearch() {
    /** Global variables {startDate} and {endDate}*/
    const [minPrice, maxPrice] = document.getElementsByName('price')
    const zip = $('#postcode').val();
    const address = $('#address').val();
    const type = $('#type').val();
    const [minLivingArea, maxLivingArea] = document.getElementsByName('livingarea');
    const [minLandArea, maxLandArea] = document.getElementsByName('landarea');

    //if at least one of them is invalid, return
    const isValidPrice = !isValid(minPrice, maxPrice);
    const isValidLivingArea = !isValid(minLivingArea, maxLivingArea);
    const isValidLandArea = !isValid(minLandArea, maxLandArea);
    const isValidMinLandLiving = !isValid(minLivingArea, minLandArea);
    const isValidMaxLandLiving = !isValid(maxLivingArea, maxLandArea);
    const isValidSelectFields = !validateSelectFields();
    const isValidSelectLimitations = !validateSelectLimitations();


    if (isValidPrice || isValidLivingArea || isValidLandArea ||
        isValidMinLandLiving || isValidMaxLandLiving ||
        isValidSelectFields || isValidSelectLimitations) {
        return;
    }

    const url = new URL('http://localhost:3000/search')
    if (minPrice.value >= maxPrice.value) {

    }
    const params = {
        dateFrom: startDate,
        dateTo: endDate,
        minPrice: minPrice.value,
        maxPrice: maxPrice.value,
        zip,
        address,
        type,
        minLivingArea: minLivingArea.value,
        maxLivingArea: maxLivingArea.value,
        minLandArea: minLandArea.value,
        maxLandArea: maxLandArea.value,
    }
    console.log(params)
    url.search = new URLSearchParams(params).toString();

    fetch('http://localhost:3000/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
    })
        .then(resp => resp.json())
        .then(data => {
            setData(data);
            renderPagination(data)
        })
        .catch(console.log);
}