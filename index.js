let csvData = null;

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Get DOM elements
    const fileInput = document.getElementById('fileInput');
    const convertButton = document.getElementById('convertButton');
    const downloadButton = document.getElementById('downloadButton');
    const uploadArea = document.getElementById('uploadArea');
    const browseButton = document.getElementById('browseButton');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const loading = document.getElementById('loading');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const output = document.getElementById('output');

    // Set up event listeners
    setupEventListeners();

    function setupEventListeners() {
        // Handle browse button click
        browseButton.addEventListener('click', function() {
            fileInput.click();
        });

        // Handle file selection
        fileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        });

        // Handle drag and drop
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.classList.add('active');
        });

        uploadArea.addEventListener('dragleave', function() {
            uploadArea.classList.remove('active');
        });

        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('active');

            if (e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                    fileInput.files = e.dataTransfer.files;
                    handleFile(file);
                } else {
                    showError('Please select an Excel file (.xlsx or .xls)');
                }
            }
        });

        // Convert button click handler
        convertButton.addEventListener('click', function() {
            if (fileInput.files.length === 0) {
                showError("Please select a file first!");
                return;
            }

            const file = fileInput.files[0];
            loading.style.display = 'flex';
            errorMessage.style.display = 'none';

            // Use timeout to allow UI to update before processing
            setTimeout(function() {
                parseSheet(file).then(csv => {
                    csvData = csv;

                    // Display preview
                    output.textContent = csv.length > 5000
                        ? csv.substring(0, 5000) + '...\n(Preview truncated for better performance)'
                        : csv;

                    output.style.display = 'block';
                    successMessage.style.display = 'block';
                    downloadButton.style.display = 'block';
                    loading.style.display = 'none';
                }).catch(error => {
                    showError('Error processing file: ' + error.message);
                    console.error("Error processing the file:", error);
                    loading.style.display = 'none';
                });
            }, 100);
        });

        // Download button click handler
        downloadButton.addEventListener('click', function() {
            if (!csvData) return;

            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = getFileNameWithoutExtension(fileInput.files[0].name) + '.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    // Handle file processing
    function handleFile(file) {
        resetUI();

        // Display file info
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileInfo.style.display = 'block';

        // Enable convert button
        convertButton.disabled = false;
    }
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
            try {
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
            } catch (error) {
                reject(error);
            }
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

// Helper Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileNameWithoutExtension(filename) {
    return filename.replace(/\.[^/.]+$/, "");
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
}

function resetUI() {
    const output = document.getElementById('output');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const downloadButton = document.getElementById('downloadButton');

    output.style.display = 'none';
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    downloadButton.style.display = 'none';
    csvData = null;
}