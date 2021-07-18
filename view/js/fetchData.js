window.addEventListener('load', fetchData, false)

/**
 * Download data and add pagination (Pagination.js)
 * Handle download button event
 * */
function fetchData() {
    // render empty table
    renderPagination([])
}

/**
 * Render table + pagination
 * */
function renderPagination(data) {
    var paginationContainer = $('#tablecont');
    paginationContainer.pagination({
        dataSource: data,
        totalNumber: data.length,
        pageSize: 20,
        pageRange: 2,
        showPageNumbers: true,
        showPrevious: true,
        showNext: true,
        showNavigator: true,
        showFirstOnEllipsisShow: true,
        showLastOnEllipsisShow: true,
        callback: function (response, pagination) {
            let dataHtml = '<table><tr><th>Parcelle</th><th>Price</th><th>Ratio</th>' +
                '<th>Type</th><th>Address</th><th>Land Area</th><th>Living Area</th>' +
                '<th>Date</th><th>Year</th><th>Time Since Transaction</th><th>Commune</th>' +
                '<th>Rate</th><th>Zip</th></tr>';

            // If Initialize or nothing is found for that search criteria
            if (response.length === 0) {
                dataHtml += '<td colspan="13" style="color: red;text-align: center">Fill in fields to fetch data</td>'
            }

            $.each(response, function (index, item) {
                dataHtml += `<tr><td>${item.parcelle}</td><td>${item.price}</td><td>${item.ratio.toFixed(3)}</td>
                                    <td>${item.type}</td><td>${item.address}</td><td>${item.landArea.toFixed(3)}</td>
                                    <td>${item.livingArea.toFixed(3)}</td><td>${new Date(item.date).toLocaleDateString()}</td><td>${item.year}</td>
                                    <td>${item.timeSinceTransaction.toFixed(3)}</td><td>${item.commune}</td>
                                    <td>${item.rate.toFixed(3)}</td><td>${item.zip}</td></tr>`;
            });

            dataHtml += '</table>'

            paginationContainer.prev().html(dataHtml);
        }
    })
}

/**
 * @var exportFields field defines the column order in csv file, and it's header titles
 * @var tableData is used to generate csv
 * */
$("#download").click(() => {
    const exportFields = {
        parcelle: 'Parcelle',
        price: 'Price',
        ratio: 'Ratio',
        type: 'Type',
        address: 'Address',
        landArea: 'Land Area',
        livingArea: 'Living Area',
        date: 'Date',
        year: 'Year',
        timeSinceTransaction: 'Time Since Transaction',
        commune: 'Commune',
        rate: 'Rate',
        zip: 'Zip'
    };
    exportCSVFile(exportFields, tableData, 'export')
})


/**
 * @param headers - defines which fields are taken in cosideration
 * @param items - array of objects to export
 * @param fileTitle - exported filename  export.csv
 * */
function exportCSVFile(headers, items, fileTitle) {
    if (headers) {
        items.unshift(headers);
    }

    const filteredItems = filterItems(items, headers)
    // Convert Object to JSON
    const jsonObject = JSON.stringify(filteredItems);

    const csv = convertToCSV(jsonObject);

    const exportedFilename = fileTitle + '.csv' || 'export.csv';

    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilename);
    } else {
        const link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function convertToCSV(objArray) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';

    for (let i = 0; i < array.length; i++) {
        let line = '';
        for (const index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }
    return str;
}

/**
 * Filter only expected columns in output file
 * Similar to: SQL Project
 * */
function filterItems(items, headers) {
    return items.map(item => {
        const newObj = {};
        for (const key of Object.keys(headers)) {
            if (key in item) {
                newObj[key] = item[key];
            }
        }
        return newObj;
    });
}