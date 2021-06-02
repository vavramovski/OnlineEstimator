
let latestYear = 2019;
const PriceModel = require('./Model/PriceModel');
const ParametersModel = require('./Model/ParameterModel');
const AvgParameterModel = require('./Model/AvgParameter');
const AssociatedZipModel = require('./Model/AssociatedZip');
const { prototype } = require('body-parser');

module.exports = async function Calculator(userInput) {
    let zip = await zipCheck(userInput.zip);
    let propertyType = userInput.typeSelected;
    let cyear = userInput.cyear;
    let ryear = userInput.ryear;
    let renovationCheck = userInput.renovationCheck;
    let landArea = userInput.landArea;
    let surfaceHabitable = userInput.surfaceHabitable;
    let renovationPrice = userInput.renovationPrice;

    let propertyRate = await getPropertyRate(cyear,zip,propertyType);
    let constructionPrice = await getConstructionPrice(cyear,zip,propertyType);
    let renovationFV = await getRenovationFv(ryear,renovationCheck,propertyType,zip);

    let errMsg = GetErrorMsg(propertyRate,constructionPrice,renovationFV);

    if(errMsg) {
        return errMsg;
    }

    let timeSinceConstr = getTimeSinceConstr(cyear);

    let priceFV = constructionPrice * Math.pow(1 + propertyRate,timeSinceConstr);

    let result = priceFV * (propertyType === 'house'?landArea:surfaceHabitable) + renovationFV * renovationPrice;

    return result;
}

function GetErrorMsg(propertyRate,constructionPrice,renovationFV) {
    if(propertyRate.err) {
        return propertyRate.err;
    }

    if(constructionPrice.err) {
        return constructionPrice.err;
    }

    if(renovationFV.err) {
        return renovationFV.err;
    }
}

async function zipCheck(userZip) {
    let zipsData = await AssociatedZipModel.find({zip:userZip})
    if(zipsData.length) {
        return zipsData[0].associatedZip;
    }

    return userZip;
}
 
async function getPropertyRate(cyear,zip,propertyType) {
    if(cyear >= 2004 && cyear <= latestYear) {
        let obj = {
            type: propertyType,
            zip,
            year: cyear
        }
        let rateObj = await ParametersModel.find(obj);
        if(rateObj.length) {
            return rateObj[0].rate;
        }else {
            return {
                err: `Couldn't find Property rate associalted with the data :- zip: ${zip}, property type: ${propertyType}, year: ${cyear}`
            }
        }
    }
    else {
        //fetch data based on zip and avg and type from parameters
        let obj = {
            type: propertyType,
            zip,
        }
        let avgRateObj = await AvgParameterModel.find(obj);
        if(avgRateObj.length) {
            return avgRateObj[0].avg;
        }else {
            return {
                err: `Couldn't find Property rate associalted with the data :- zip: ${zip}, property type: ${propertyType}`
            }
        }
    }
}

async function getConstructionPrice(cyear,zip,propertyType) {
    if(cyear >= 2004 && cyear <= latestYear) {
        //fetch data based on zip and c_year and type and type will be new        
        let obj = {
            zip,
            year: cyear,
        }

        let priceObj = await PriceModel.find(obj);
        if(priceObj.length) {
            return priceObj[0][propertyType + 'New'];
        }else {
            return {
                err: `Couldn't find Price associalted with the data :- zip: ${zip}, property type: ${propertyType + 'New'}, year: ${cyear}`
            }
        }
    }else if(cyear > latestYear) {
        //fetch data based on zip and type and year as 2019 and type will be new
        let obj = {
            zip,
            year: 2019,
        }

        let priceObj = await PriceModel.find(obj);
        if(priceObj.length) {
            return priceObj[0][propertyType + 'New'];
        }else {
            return {
                err: `Couldn't find Price associalted with the data :- zip: ${zip}, property type: ${propertyType + 'New'}, year: ${cyear}`
            }
        }
    }else {
        //fetch data based on zip and type and year as 2019 and type will be old
        let obj = {
            zip,
            year: cyear,
        }

        let priceObj = await PriceModel.find(obj);
        if(priceObj.length) {
            return priceObj[0][propertyType];
        }else {
            return {
                err: `Couldn't find Price associalted with the data :- zip: ${zip}, property type: ${propertyType}, year: ${cyear}`
            }
        }
    }
}

function getTimeSinceConstr(cyear) {
    let {year,month,date} = getCurrentDate();
    if(cyear <= 2019) {
        return year + month/12 + date/365.25 - (cyear + 0.5);
    }else {
        return year + month / 12 + date / 365.25 - (latestYear + 0.5)
    }      
}

function getCurrentDate() {
    let dateObj = new Date();
    let year = dateObj.getFullYear();
    let month = dateObj.getMonth();
    let date = dateObj.getDate();

    return {year,month,date};
}

async function getRenovationFv(ryear,renovationCheck,propertyType,zip) {
    let renovationFV;
    if(renovationCheck) {
        let renovationRate = await getRenovationRate(ryear,propertyType,zip);
        let {year,month,date} = getCurrentDate();
        timeSinceRenovation = year + month / 12 + date / 365.25 - (ryear + 0.5); 
        renovationFV = Math.pow(1 + renovationRate,timeSinceRenovation);
    }else {
        renovationFV = 0;
    }   
    
    return renovationFV;
}

async function getRenovationRate(ryear,propertyType,zip) {
    if(ryear >= 2004 && ryear <= latestYear) {
        let obj = {
            type: propertyType,
            zip,
            year: ryear
        }
        let rateObj = await ParametersModel.find(obj);
        if(rateObj.length) {
            return rateObj[0].rate;
        }else {
            return {
                err: `Couldn't find Renovation rate associalted with the data :- zip: ${zip}, property type: ${propertyType}, year: ${ryear}`
            }
        }
    }else {
        //fetch data based on zip and avg and type from parameters
        let obj = {
            type: propertyType,
            zip,
        }
        let avgRateObj = await AvgParameterModel.find(obj);
        if(avgRateObj.length) {
            return avgRateObj[0].avg;
        }else {
            return {
                err: `Couldn't find Price associalted with the data :- zip: ${zip}, property type: ${propertyType}`
            }
        }
    }
}