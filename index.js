function init() {
    document.getElementById('convertButton').addEventListener('click', () => {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];

        if (!file) {
            alert("Please select a file first!");
            return;
        }

        parseSheet(file).then(csv => {
            // Display the CSV output in a <pre> element
            document.getElementById('output').textContent = csv;

            // Optionally, allow the user to download the CSV
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "output.csv";
            a.textContent = "Download CSV";
            document.body.appendChild(a);
        }).catch(error => {
            console.error("Error processing the file:", error);
        });
    });
}

/**
 * Parses an Excel file and converts the first sheet's data into a CSV format.
 * @param {File} file - The Excel file to be processed.
 * @returns {Promise<string>} A promise that resolves to a CSV string with the following columns:
 *   Count, Name, Edition, Condition, Language, Foil, Collector Number, Alter, Playtest Card, Purchase Price.
 */
function parseSheet(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (event) {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Assuming the first sheet is the one you want to process
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Convert the sheet to a JSON array
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Generate the CSV header
            let output = "Count,Name,Edition,Condition,Language,Foil,Collector Number,Alter,Playtest Card,Purchase Price";

            // Skip the header row (index 0) if necessary
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];

                // Check if the row exists and has data
                if (!row || row.length === 0) continue;

                // Append the data to the output
                output += "\n";

                // Count
                output += (row[6] || "") + ",";

                // Name
                output += '"' + (row[4] || "") + '",';

                // Edition
                output += (row[3] || "") + ",";

                // Condition
                output += (row[7] || "") + ",";

                // Language
                output += (row[8] || "") + ",";

                // Foil
                output += (row[9] === "VERO" || row[9] === "TRUE" ? "foil" : "") + ",";

                // Collector Number
                output += (row[14] !== undefined ? row[14] : "") + ",";

                // Alter
                output += (row[11] === "VERO" || row[11] === "TRUE" ? "TRUE" : "") + ",";

                // Playtest Card (always blank)
                output += ",";

                // Purchase Price
                output += centsToEuros(row[5] || 0) + ",";
            }

            // Resolve the promise with the final CSV output
            resolve(output);
        };

        reader.onerror = function (error) {
            reject(error);
        };

        // Read the uploaded file as an ArrayBuffer
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Converts a price in cents to euros.
 * @param cents an int representing the price in cents.
 * @returns {string} the price in euros.
 */
function centsToEuros(cents) {
    return (cents / 100).toFixed(2);
}
