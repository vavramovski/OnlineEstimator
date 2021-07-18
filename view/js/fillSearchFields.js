// Initial
window.addEventListener('load', initialFetch, false)
// onChange
document.getElementById('postcode').addEventListener('change', fillAddresses, false)
document.getElementById('address').addEventListener('change', printAddress, false)


const zipDom = document.getElementById('postcode');
const typeDom = document.getElementById('type');
const addressDom = document.getElementById('address');

function createOptionDOM(value, text, selected = false) {
    return `<option value="${value}" ${selected ? 'selected' : ''}>${text}</option>`;
}

/**
 * Fetch Initial data for Zip and Type
 * */
function initialFetch() {
    initialFetchZipCodes();
    initialFetchTypes();
}


function refreshSelectFields(e) {
    console.log(e)
    $('select').formSelect();
}

function initialFetchZipCodes() {
    fetch('http://localhost:3000/zip')
        .then(response => response.json())
        .then(zipCodes => {
            zipDom.innerHTML = '';
            // zipDom.innerHTML += createOptionDOM('', 'Zip');
            zipCodes.forEach(zipCode => {
                zipDom.innerHTML += createOptionDOM(zipCode, zipCode);
            })
            // Rerender
            $('select').formSelect();
        })
}

function initialFetchTypes() {
    fetch('http://localhost:3000/types')
        .then(response => response.json())
        .then(types => {
            typeDom.innerHTML = '';
            // typeDom.innerHTML += createOptionDOM('', 'Type');
            types.forEach(type => {
                typeDom.innerHTML += createOptionDOM(type, type);
            })
            // Rerender
            $('select').formSelect();
        })
}

function printAddress(e){
    console.log($('#address').val())
}
/**
 * On changed ZIP, fetches streets for given ZIP from backend
 * */
function fillAddresses(e) {
    const url = new URL('http://localhost:3000/zip')
    const zipCodes = $('#postcode').val()
    url.search = new URLSearchParams({postcode:zipCodes}).toString();

    if (zipDom.value !== '') {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                addressDom.innerHTML = '';
                // addressDom.innerHTML += createOptionDOM('', 'Street', true);
                data.addresses.sort();
                data.addresses.forEach(address => {
                    addressDom.innerHTML += createOptionDOM(address, address);
                })
                $('.dropdown-trigger').hover(function (){
                    console.log('asd')
                    $('select').formSelect();
                })
                // $('select').formSelect();
            })
    }
}