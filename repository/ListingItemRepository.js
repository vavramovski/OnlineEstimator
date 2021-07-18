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
    const zipArray = zip.split(',').map(item => {
        return {zip: parseInt(item)}
    });
    return ListingItem.aggregate([
        {
            $match: {
                $or: zipArray
            }
        },
        {
            $group: {
                _id: 'zipcode',
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
    dateFrom = new Date(dateFrom);
    dateTo = new Date(dateTo);

    const searchCriteria = {};
    const aggregate = [];

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

    /*// Add Zip to searchCriteria
    if (zip && zip !== '' && zip !== 'Zip' && zip) {
        for (let i = 0; i < zip.length; i++) {
            searchCriteria.zip = parseInt(zip);
        }
    }*/

    // Add Address to searchCriteria
    if (address && address.length > 0) {
        const aggregateAddress = {
            $or: address.map(item => {
                return {address: item}
            })
        };
        aggregate.push({$match:aggregateAddress});
    }

    // Add Type to searchCriteria
    if (type && type.length > 0) {
        const aggregateType = {
            $or: type.map(item => {
                return {type: item}
            })
        };
        aggregate.push({$match:aggregateType});
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

    aggregate.push({$match:searchCriteria});
    // Query
    return ListingItem.aggregate(aggregate)
    /*return new Promise((resolve, reject) => {
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
*/
};