const express = require('express');

const mongoose = require('mongoose');
const uri = "mongodb+srv://Giacomo:LmQntqv4tcgRXxoN@cluster0.rv3kt.mongodb.net/OnlineEstimatorDB?retryWrites=true&w=majority";

const readXlsxFile = require('read-excel-file/node');
const Excel = require('exceljs')
const bodyParser = require('body-parser');

const PriceModel = require('./Model/PriceModel');
const ParametersModel = require('./Model/ParameterModel');
const AvgParameterModel = require('./Model/AvgParameter');
const AssociatedZipModel = require('./Model/AssociatedZip');
const UserInputSchema = require('./Model/UserInput');
const ListingItem = require('./Model/ListingItem');

const Calculator = require('./Calculator');
const {getAllDistinctZip, getAddressesForZip, getAllDistinctType, handleSearch} = require("./repository/ListingItemRepository");

const app = express();
const port = 3000;

// app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Mongodb connection successful'))
    .catch(err => console.log(err))

app.post('/submit', (req, res) => {
    UploadFreshData();
    // DownloadUserInputs();

    Calculator(req.body)
        .then((result) => {
            let resValue = result.value;

            if (!result.err) {
                let userInput = {
                    ...req.body,
                    finalPrice: resValue
                }
                UserInputSchema.collection.insertOne(userInput)
                    .then(() => console.log("Successfully inserted user input"))
                    .catch((err) => console.log(err))
            }

            let response = {
                resValue,
            };

            res.end(JSON.stringify(response));
        })
});

app.get('/zip', (req, res) => {
    if (req.query.postcode) {
        const postcode = parseInt(req.query.postcode);
        getAddressesForZip(postcode)
            .then(data => res.send(data[0]))
            .catch(err => res.status(500));
    } else {
        getAllDistinctZip()
            .then(data => res.send(data))
            .catch(err => res.status(500));
    }
})

app.get('/types', (req, res) => {
    getAllDistinctType()
        .then(data => res.send(data))
        .catch(err => res.status(500));
})

app.get('/search', (req, res) => {
    handleSearch(req.query)
        .then(data => res.send(data))
        .catch(err => res.status(500));
})

async function DownloadUserInputs() {
    let allRows = await UserInputSchema.find({});
    if (allRows.length) {
        let workbook = new Excel.Workbook();
        let worksheet = workbook.addWorksheet('User Inputs');

        worksheet.columns = [
            {header: 'Email Id', key: 'email'},
            {header: 'Zip', key: 'zip'},
            {header: 'Type', key: 'typeSelected'},
            {header: 'Construction Year', key: 'cyear'},
            {header: 'Renovation Year', key: 'ryear'},
            {header: 'Surface Habitable', key: 'surfaceHabitable'},
            {header: 'Renovation Price', key: 'renovationPrice'},
            {header: 'Land Area', key: 'landArea'},
            {header: 'Renovation Check', key: 'renovationCheck'},
            {header: 'Final Price', key: 'finalPrice'},
        ];

        worksheet.columns.forEach(column => {
            column.width = column.header.length < 12 ? 12 : column.header.length
        });
        worksheet.getRow(1).font = {bold: true};

        allRows.forEach((row) => {
            let rowData = {
                email: row.email,
                zip: row.zip,
                typeSelected: row.typeSelected,
                cyear: row.cyear,
                ryear: row.ryear,
                surfaceHabitable: row.surfaceHabitable,
                renovationPrice: row.renovationPrice,
                landArea: row.landArea,
                renovationCheck: row.renovationCheck,
                finalPrice: row.finalPrice
            }
            worksheet.addRow(rowData);
        });

        workbook.xlsx.writeFile('../UserInput.xlsx');
    }
}

function UploadFreshData() {
    ClearAllRecords();
    // UploadPriceData();
    // UploadParameters('Parameters PPE', 'ppe');
    // UploadParameters('Parameters House', 'house');
    // UploadAssociatedZips();
    UploadListingItems();
}

/**
 * Configure @param sheetname
 * */
function UploadListingItems() {
    const listItemsToAdd = [];
    readXlsxFile('./listingdatasample.xlsx', {sheet: 'Sheet1'}).then((rows) => {
        for (let i = 1; i < rows.length; i++) {
            const listingItem = {
                parcelle: rows[i][0],
                price: rows[i][1],
                ratio: rows[i][2],
                type: rows[i][3],
                address: rows[i][4],
                landArea: rows[i][5],
                livingArea: rows[i][6],
                date: rows[i][7],
                year: rows[i][8],
                timeSinceTransaction: rows[i][9],
                commune: rows[i][10],
                rate: rows[i][11],
                zip: rows[i][12]
            }
            listItemsToAdd.push(listingItem);
        }
        ListingItem.collection.insertMany(listItemsToAdd)
            .then(() => console.log("Successfully inserted Listing items!!"))
            .catch(err => {
                console.error('Add listing items error')
                console.log(err);
            })
    })
}

function UploadPriceData() {

    readXlsxFile('../model.xlsm', {sheet: 'price per type and year'}).then((rows) => {
        let years = rows[0].filter((cell) => typeof cell === 'number');
        let allRows = [];

        rows.forEach((row, idx) => {
            if (idx < 2) {
                return;
            }

            let rowIndex = 0;
            let yearIndex = 0;

            let rowData = {};
            for (let i = 1; i < row.length; i++) {
                rowData.zip = row[0];
                let cell = row[i];

                if (!cell) {
                    cell = 0;
                }

                rowData.year = years[yearIndex];

                if (i - rowIndex === 1) {
                    rowData.house = cell.toFixed(0);
                } else if (i - rowIndex === 2) {
                    rowData.houseNew = cell.toFixed(0);
                } else if (i - rowIndex === 3) {
                    rowData.ppe = cell.toFixed(0);
                } else if (i - rowIndex === 4) {
                    rowData.ppeNew = cell.toFixed(0);
                }

                if (i % 4 === 0) {
                    rowIndex = i;
                    yearIndex++;
                    allRows.push(rowData);
                    rowData = {};
                }
            }
        });
        PriceModel.collection.insertMany(allRows)
            .then(() => console.log("Successfully inserted prices data!!"))
            .catch(err => {
                console.log(err);
            })
    });
}

function UploadParameters(sheetName, type) {
    readXlsxFile('../model.xlsm', {sheet: sheetName}).then((rows) => {
        let years = rows[0].filter((cell) => typeof cell === 'number');
        let allParameterRows = [];
        let allAvgParameterRows = [];

        rows.forEach((row, idx) => {
            if (idx < 1) {
                return;
            }

            let avgParamRowData = {
                zip: row[0],
                avg: (row[row.length - 1] * 100),
                type: type
            }

            allAvgParameterRows.push(avgParamRowData);

            let rowData = {};
            let yearIndex = 0;
            for (let i = 1; i < row.length - 1; i++) {
                rowData.type = type;
                rowData.zip = row[0];
                let cell = row[i];

                if (!cell) {
                    cell = 0;
                }

                rowData.year = years[yearIndex];
                rowData.rate = (cell * 100);
                yearIndex++;
                allParameterRows.push(rowData);
                rowData = {};
            }
        });
        ParametersModel.collection.insertMany(allParameterRows)
            .then(() => console.log(`Successfully inserted ${sheetName} data!!`))
            .catch(err => {
                console.log(err);
            })

        AvgParameterModel.collection.insertMany(allAvgParameterRows)
            .then(() => console.log(`Successfully inserted ${sheetName} Avg data!!`))
            .catch(err => {
                console.log(err);
            })
    });
}

function UploadAssociatedZips() {
    readXlsxFile('../model.xlsm', {sheet: 'Associated Zips'}).then((rows) => {
        let allRows = [];

        rows.forEach((row, idx) => {
            if (idx < 1) {
                return;
            }

            let rowData = {
                zip: row[0],
                associatedZip: row[1]
            };

            allRows.push(rowData);

        });
        AssociatedZipModel.collection.insertMany(allRows)
            .then(() => console.log("Successfully inserted associated zips data!!"))
            .catch(err => {
                console.log(err);
            })
    });
}

function ClearAllRecords() {
    PriceModel.deleteMany({})
        .then(() => console.log("Successfully deleted all records in prices collection"))
        .catch(err => console.log(err))

    ParametersModel.deleteMany({})
        .then(() => console.log("Successfully deleted all records in parameters collection"))
        .catch(err => console.log(err))

    AvgParameterModel.deleteMany({})
        .then(() => console.log("Successfully deleted all records in avg parameters collection"))
        .catch(err => console.log(err))

    AssociatedZipModel.deleteMany({})
        .then(() => console.log("Successfully deleted all records in associated zips collection"))
        .catch(err => console.log(err))

    ListingItem.deleteMany({})
        .then(() => console.log("Successfully deleted all records in associated Listing collection"))
        .catch(err => console.log(err))
}

app.listen(port, () => console.log(`Server running on port ${port}`));