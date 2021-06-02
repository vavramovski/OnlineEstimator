const express = require('express');

const mongoose = require('mongoose');
const uri = "mongodb+srv://Giacomo:LmQntqv4tcgRXxoN@cluster0.rv3kt.mongodb.net/OnlineEstimatorDB?retryWrites=true&w=majority";

const readXlsxFile = require('read-excel-file/node');
const bodyParser = require('body-parser');

const PriceModel = require('./Model/PriceModel');
const ParametersModel = require('./Model/ParameterModel');
const AvgParameterModel = require('./Model/AvgParameter');
const AssociatedZipModel = require('./Model/AssociatedZip');

const Calculator = require('./Calculator');

// const cors = require('cors');
const app = express();
const port = 3000;

// app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

mongoose.connect(uri,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Mongodb connection successful'))
.catch(err => console.log(err))

app.post('/submit', (req, res) => {    
    // UploadFreshData();

    Calculator(req.body)
        .then((result) => {
            let response = {
                result,
            };
        
            res.end(JSON.stringify(response));
        })
});

function UploadFreshData() {
    ClearAllRecords();
    UploadPriceData();
    UploadParameters('Parameters PPE','ppe');
    UploadParameters('Parameters House','house');
    UploadAssociatedZips();
}

function UploadPriceData() {

    readXlsxFile('../model.xlsm', { sheet: 'price per type and year' }).then((rows) => {
        let years = rows[0].filter((cell) => typeof cell === 'number');
        let allRows = [];

        rows.forEach((row,idx) => {
            if(idx < 2) {
                return;
            }

            let rowIndex = 0;
            let yearIndex = 0;

            let rowData = {}; 
            for(let i = 1;i < row.length;i++) {                   
                rowData.zip = row[0];             
                let cell = row[i];

                if(!cell) {
                    cell = 0;
                }

                rowData.year = years[yearIndex];

                if(i - rowIndex === 1) {
                    rowData.house = cell.toFixed(0);
                }else if(i - rowIndex === 2) {
                    rowData.houseNew =  cell.toFixed(0);
                }else if(i - rowIndex === 3) {
                    rowData.ppe =  cell.toFixed(0);
                }else if(i - rowIndex === 4) {
                    rowData.ppeNew =  cell.toFixed(0);
                }         
                
                if(i % 4 === 0) {
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

function UploadParameters(sheetName,type) {
    readXlsxFile('../model.xlsm', { sheet: sheetName }).then((rows) => {
        let years = rows[0].filter((cell) => typeof cell === 'number');
        let allParameterRows = [];   
        let allAvgParameterRows = [];     

        rows.forEach((row,idx) => {              
            if(idx < 1) {
                return;
            }

            let avgParamRowData = {
                zip: row[0],
                avg: (row[row.length-1]*100).toFixed(2),
                type: type
            }

            allAvgParameterRows.push(avgParamRowData);

            let rowData = {};
            let yearIndex = 0;             
            for(let i = 1;i < row.length-1;i++) {                          
                rowData.type = type;
                rowData.zip = row[0];  
                let cell = row[i];

                if(!cell) {
                    cell = 0;
                }

                rowData.year = years[yearIndex];
                rowData.rate = (cell*100).toFixed(2);           
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
    readXlsxFile('../model.xlsm', { sheet: 'Associated Zips' }).then((rows) => {
        let allRows = [];        

        rows.forEach((row,idx) => {              
            if(idx < 1) {
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
}

app.listen(port,() => console.log(`Server running on port ${port}`));