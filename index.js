const express = require('express');

const mongoose = require('mongoose');
const uri = "mongodb+srv://Giacomo:LmQntqv4tcgRXxoN@cluster0.rv3kt.mongodb.net/OnlineEstimatorDB?retryWrites=true&w=majority";

const readXlsxFile = require('read-excel-file/node');
const bodyParser = require('body-parser');

const PriceModel = require('./Model/PriceModel');
const ParametersModel = require('./Model/ParameterModel');
const AssociatedZipModel = require('./Model/AssociatedZip');

const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(uri,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Mongodb connection successful'))
.catch(err => console.log(err))

app.post('/submit', (req, res) => {
    // UploadFreshData();
    let response = {
        result: 'new result'
    };

    res.end(JSON.stringify(response));
});


function UploadFreshData() {
    ClearAllRecords();
    UploadPriceData();
    UploadParameters('Parameters PPE','ppe');
    UploadParameters('Parameters House','house');
    UploadAssociatedZips();
}

function UploadPriceData() {

    readXlsxFile('./model.xlsm', { sheet: 'price per type and year' }).then((rows) => {
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
        console.log(allRows.length);
        PriceModel.collection.insertMany(allRows)
            .then(() => console.log("Successfully inserted prices data!!"))
            .catch(err => {
                console.log(err);
            })        
    });
}

function UploadParameters(sheetName,type) {
    readXlsxFile('./model.xlsm', { sheet: sheetName }).then((rows) => {
        let years = rows[0].filter((cell) => typeof cell === 'number');
        let allRows = [];        

        rows.forEach((row,idx) => {              
            if(idx < 1) {
                return;
            }
            let rowData = {};
            let yearIndex = 0;             
            for(let i = 1;i < row.length-1;i++) {                          
                rowData.type = type;
                rowData.zip = row[0]; 
                rowData.avg = row[row.length-1];  
                let cell = row[i];

                if(!cell) {
                    cell = 0;
                }

                rowData.year = years[yearIndex];
                rowData.rate = (cell*100).toFixed(2);           
                yearIndex++; 
                allRows.push(rowData);   
                rowData = {};   
            }     
        });
        ParametersModel.collection.insertMany(allRows)
            .then(() => console.log(`Successfully inserted ${sheetName} data!!`)) 
            .catch(err => {
                console.log(err);
            })     
    });
}

function UploadAssociatedZips() {
    readXlsxFile('./model.xlsm', { sheet: 'Associated Zips' }).then((rows) => {
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
        console.log(allRows);   
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
    
    PriceModel.deleteMany({})
        .then(() => console.log("Successfully deleted all records in parameters collection"))
        .catch(err => console.log(err))

    AssociatedZipModel.deleteMany({})
    .then(() => console.log("Successfully deleted all records in associated zips collection"))
    .catch(err => console.log(err))
}

app.listen(port,() => console.log(`Server running on port ${port}`));