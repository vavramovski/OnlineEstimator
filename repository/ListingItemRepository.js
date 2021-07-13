const ListingItem = require('../Model/ListingItem')

module.exports.getAllDistinctZip = () => {
    return new Promise((resolve, reject) => {
        ListingItem.distinct('zip', (err, result) => {
            if (err) {
                reject(err)
                return;
            }
            resolve(result)
        })
    })
}

module.exports.getAddressesForZip = (zip) => {
    return ListingItem.aggregate([
        {
            $match: {
                zip: zip
            }
        },
        {
            $group: {
                _id: '$zip',
                addresses: {
                    $addToSet: '$address'
                }
            }
        }
    ])
}

module.exports.getAllDistinctType = () => {
    return new Promise((resolve, reject) => {
        ListingItem.distinct('type', (err, result) => {
            if (err) {
                reject(err)
                return;
            }
            resolve(result)
        })
    })
}

module.exports.handleSearch = function (query) {
    let {
        dateFrom, dateTo, minPrice, maxPrice, zip, address, type, minLivingArea,
        maxLivingArea, minLandArea, maxLandArea
    } = query;
    const searchCriteria = {};

    // Add date to searchCriteria
    if (dateFrom && dateFrom !== 'undefined' && dateTo && dateTo !== 'undefined') {
        // dateFrom = new Date(dateFrom);
        // dateTo = new Date(dateTo);
        searchCriteria.date = {
            $lte: dateTo,
            $gte: dateFrom
        }
    }

    // Add price to criteria
    if (Boolean(minPrice) || Boolean(maxPrice)) {
        const priceCriteria = {};
        if (minPrice) priceCriteria['$lte'] = parseInt(maxPrice);
        if (maxPrice) priceCriteria['$gte'] = parseInt(minPrice);
        searchCriteria.price = priceCriteria;
    }

    // Add Zip to searchCriteria
    if (zip && zip !== '' && zip !== 'Zip' && zip) {
        searchCriteria.zip = parseInt(zip);
    }

    // Add Address to searchCriteria
    if (address && address !== '' && address !== 'Street') {
        searchCriteria.address = address;
    }

    // Add Type to searchCriteria
    if (type && type !== '' && type !== 'Type') {
        searchCriteria.type = type;
    }

    // Add livingArea to criteria
    if (Boolean(minLivingArea) || Boolean(maxLivingArea)) {
        const livingAreaCriteria = {};
        if (minLivingArea) livingAreaCriteria['$lte'] = parseInt(maxLivingArea);
        if (maxLivingArea) livingAreaCriteria['$gte'] = parseInt(minLivingArea);
        searchCriteria.livingArea = livingAreaCriteria;
    }

    // Add landArea to criteria
    if (Boolean(minLandArea) || Boolean(maxLandArea)) {
        const landAreaCriteria = {};
        if (minLandArea) landAreaCriteria['$lte'] = parseInt(maxLandArea);
        if (maxLandArea) landAreaCriteria['$gte'] = parseInt(minLandArea);
        searchCriteria.landArea = landAreaCriteria;
    }

    // Query
    return new Promise((resolve, reject) => {
        ListingItem.find(searchCriteria, (err, result) => {
            console.error(err);
            if (err) {
                reject(err);
                return;
            }
            console.log(result)
            resolve(result);
        })
    })

};