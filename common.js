/* ====================================================== */
/* ==        CEMENT CALCULATOR SHARED JAVASCRIPT   == */
/* ==        Version: 1.0                           == */
/* ==        Author: Mr. Fadi M. Darwesh            == */
/* ====================================================== */

// ======================================================
// ==              LANGUAGE SWITCHING               ==
// ======================================================

/**
 * Switch the interface language between English and Arabic
 * @param {string} lang - Language code ('en' or 'ar')
 */
function setLanguage(lang) {
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`lang-${lang}`).classList.add('active');
    
    // Update text content based on data attributes
    document.querySelectorAll('[data-en]').forEach(element => {
        if (lang === 'en') {
            element.textContent = element.getAttribute('data-en');
        } else {
            element.textContent = element.getAttribute('data-ar');
        }
    });
    
    // Update placeholders
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(element => {
        const enText = element.getAttribute('data-en-placeholder');
        const arText = element.getAttribute('data-ar-placeholder');
        
        if (enText && arText) {
            element.placeholder = lang === 'en' ? enText : arText;
        }
    });
    
    // Update direction
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Re-populate print header for new language
    updatePrintHeader();
}

// ======================================================
// ==            SAVE & LOAD FUNCTIONS              ==
// ======================================================

/**
 * Collect general form information (company, separator, notes)
 * @returns {Object} General information object
 */
function collectGeneralInfo() {
    return {
        companyName: document.getElementById('company-name')?.value || '',
        reportDate: document.getElementById('report-date')?.value || '',
        preparedBy: document.getElementById('report-preparer')?.value || '',
        position: document.getElementById('report-position')?.value || '',
        productType: document.getElementById('product-type')?.value || '',
        productionDate: document.getElementById('production-date')?.value || '',
        separatorType: document.getElementById('separator-type')?.value || '',
        separatorModel: document.getElementById('separator-model')?.value || '',
        airFlow: document.getElementById('air-flow')?.value || '',
        notes: document.getElementById('additional-notes')?.value || ''
    };
}

/**
 * Populate the form fields using saved general information
 * @param {Object} info - General information object
 */
function populateGeneralInfo(info) {
    if (!info) return;
    document.getElementById('company-name') && (document.getElementById('company-name').value = info.companyName || '');
    document.getElementById('report-date') && (document.getElementById('report-date').value = info.reportDate || '');
    document.getElementById('report-preparer') && (document.getElementById('report-preparer').value = info.preparedBy || '');
    document.getElementById('report-position') && (document.getElementById('report-position').value = info.position || '');
    document.getElementById('product-type') && (document.getElementById('product-type').value = info.productType || '');
    document.getElementById('production-date') && (document.getElementById('production-date').value = info.productionDate || '');
    document.getElementById('separator-type') && (document.getElementById('separator-type').value = info.separatorType || '');
    document.getElementById('separator-model') && (document.getElementById('separator-model').value = info.separatorModel || '');
    document.getElementById('air-flow') && (document.getElementById('air-flow').value = info.airFlow || '');
    document.getElementById('additional-notes') && (document.getElementById('additional-notes').value = info.notes || '');
}

/**
 * Collect PSD data from table
 * @returns {Object} PSD data object
 */
function collectPSDData() {
    const psdData = {
        sieveSizes: [],
        feed: [],
        fines: [],
        rejects: []
    };
    
    // Collect data from all rows
    const rows = document.querySelectorAll('#psd-table-body tr');
    rows.forEach(row => {
        const sizeInput = row.querySelector('.sieve-size-input');
        const feedInput = row.querySelector('.psd-input[data-stream="feed"]');
        const finesInput = row.querySelector('.psd-input[data-stream="fines"]');
        const rejectsInput = row.querySelector('.psd-input[data-stream="rejects"]');
        
        if (sizeInput && feedInput && finesInput && rejectsInput) {
            const size = parseFloat(sizeInput.value);
            const feedVal = parseFloat(feedInput.value);
            const finesVal = parseFloat(finesInput.value);
            const rejectsVal = parseFloat(rejectsInput.value);
            
            // Only add if size is valid and at least one value is provided
            if (!isNaN(size) && size > 0 && 
                (!isNaN(feedVal) || !isNaN(finesVal) || !isNaN(rejectsVal))) {
                psdData.sieveSizes.push(size);
                psdData.feed.push(isNaN(feedVal) ? 0 : feedVal);
                psdData.fines.push(isNaN(finesVal) ? 0 : finesVal);
                psdData.rejects.push(isNaN(rejectsVal) ? 0 : rejectsVal);
            }
        }
    });
    
    // Sort by sieve size (ascending)
    const combined = psdData.sieveSizes.map((size, index) => ({
        size,
        feed: psdData.feed[index],
        fines: psdData.fines[index],
        rejects: psdData.rejects[index]
    }));
    
    combined.sort((a, b) => a.size - b.size);
    
    // Rebuild sorted arrays
    psdData.sieveSizes = combined.map(item => item.size);
    psdData.feed = combined.map(item => item.feed);
    psdData.fines = combined.map(item => item.fines);
    psdData.rejects = combined.map(item => item.rejects);
    
    return psdData;
}

/**
 * Save PSD data and general form info to localStorage
 * @param {string} storageKey - LocalStorage key (default: 'separatorSavedData')
 */
function saveData(storageKey = 'separatorSavedData') {
    const psdData = collectPSDData();
    if (psdData.sieveSizes.length === 0) {
        alert('No particle size data to save.');
        return;
    }
    const info = collectGeneralInfo();
    const saveObj = { psdData: psdData, generalInfo: info };
    try {
        localStorage.setItem(storageKey, JSON.stringify(saveObj));
        alert('Data saved successfully!');
    } catch (e) {
        alert('Unable to save data: ' + e.message);
    }
}

/**
 * Load PSD data and general form info from localStorage and populate the form
 * @param {string} storageKey - LocalStorage key (default: 'separatorSavedData')
 */
function loadData(storageKey = 'separatorSavedData') {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
        alert('No saved data found.');
        return;
    }
    try {
        const data = JSON.parse(saved);
        // Populate general info
        populateGeneralInfo(data.generalInfo);
        // Populate PSD table
        const tbody = document.getElementById('psd-table-body');
        tbody.innerHTML = '';
        if (data.psdData && data.psdData.sieveSizes) {
            data.psdData.sieveSizes.forEach(() => {
                addSieveRow();
            });
            // After adding rows, fill values
            const rows = document.querySelectorAll('#psd-table-body tr');
            rows.forEach((row, idx) => {
                const inputs = row.querySelectorAll('input');
                if (inputs.length >= 4) {
                    inputs[0].value = data.psdData.sieveSizes[idx] !== undefined ? data.psdData.sieveSizes[idx] : '';
                    inputs[1].value = data.psdData.feed[idx] !== undefined ? data.psdData.feed[idx] : '';
                    inputs[2].value = data.psdData.fines[idx] !== undefined ? data.psdData.fines[idx] : '';
                    inputs[3].value = data.psdData.rejects[idx] !== undefined ? data.psdData.rejects[idx] : '';
                }
            });
            updateMassBalanceSieveSelect();
        }
        alert('Saved data loaded successfully.');
    } catch (e) {
        alert('Error loading saved data: ' + e.message);
    }
}

// ======================================================
// ==              TABLE MANAGEMENT                 ==
// ======================================================

/**
 * Add a new sieve row to the PSD table
 * @param {number|string} defaultSize - Default sieve size
 */
function addSieveRow(defaultSize = '') {
    const tableBody = document.getElementById('psd-table-body');
    if (!tableBody) return;
    
    const newRow = document.createElement('tr');
    
    newRow.innerHTML = `
        <td>
            <input type="number" step="0.1" min="0.1" class="sieve-size-input" value="${defaultSize}" placeholder="Enter size">
        </td>
        <td>
            <input type="number" step="0.01" min="0" max="100" class="psd-input" data-stream="feed" placeholder="0-100">
        </td>
        <td>
            <input type="number" step="0.01" min="0" max="100" class="psd-input" data-stream="fines" placeholder="0-100">
        </td>
        <td>
            <input type="number" step="0.01" min="0" max="100" class="psd-input" data-stream="rejects" placeholder="0-100">
        </td>
        <td>
            <button class="btn btn-danger remove-row" data-en="Remove" data-ar="إزالة">Remove</button>
        </td>
    `;
    
    tableBody.appendChild(newRow);
    
    // Add event listeners to update sieve selector
    newRow.querySelector('.sieve-size-input').addEventListener('change', updateMassBalanceSieveSelect);
    
    newRow.querySelector('.remove-row').addEventListener('click', function() {
        if (tableBody.children.length > 1) {
            tableBody.removeChild(newRow);
            updateMassBalanceSieveSelect(); // Update selector on remove
        } else {
            alert('You must have at least one sieve size!');
        }
    });
}

/**
 * Check if a sieve size already exists in the table
 * @param {number} size - Sieve size to check
 * @returns {boolean} - True if exists
 */
function sieveSizeExists(size) {
    const inputs = document.querySelectorAll('.sieve-size-input');
    for (let input of inputs) {
        if (parseFloat(input.value) === size) {
            return true;
        }
    }
    return false;
}

/**
 * Update the mass balance sieve dropdown with current sieve sizes
 */
function updateMassBalanceSieveSelect() {
    const select = document.getElementById('mass-balance-sieve');
    if (!select) return;
    
    const currentVal = select.value;
    select.innerHTML = ''; // Clear existing options
    
    const inputs = document.querySelectorAll('.sieve-size-input');
    let sizeFound = false;

    inputs.forEach(input => {
        const size = parseFloat(input.value);
        if (!isNaN(size) && size > 0) {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = `${size} μm`;
            select.appendChild(option);
            if (size.toString() === currentVal) {
                select.value = currentVal;
                sizeFound = true;
            }
        }
    });
    
    if (!sizeFound && select.options.length > 0) {
        // Default to a common sieve if possible, like 48, 64, or 96
        const defaultSieves = ['48', '64', '96', '200'];
        let selected = false;
        for (const sieve of defaultSieves) {
            if (Array.from(select.options).some(opt => opt.value === sieve)) {
                select.value = sieve;
                selected = true;
                break;
            }
        }
        if (!selected) {
             select.selectedIndex = Math.floor(select.options.length / 2); // Fallback
        }
    }
}

/**
 * Handle Enter key navigation in the PSD table
 * @param {KeyboardEvent} event - Keydown event
 */
function handleTableKeyDown(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Stop form submission

        const allInputs = Array.from(document.querySelectorAll('#psd-table-body input[type="number"]'));
        const currentIndex = allInputs.indexOf(event.target);
        const nextIndex = currentIndex + 1;

        if (nextIndex < allInputs.length) {
            allInputs[nextIndex].focus();
            allInputs[nextIndex].select();
        } else {
            // Optional: Move to "Add Sieve Row" button or blur
            allInputs[currentIndex].blur();
        }
    }
}

/**
 * Handle pasting data from Excel into the PSD table
 * @param {ClipboardEvent} event - Paste event
 */
function handleTablePaste(event) {
    event.preventDefault(); // Stop default paste behavior
    
    const pasteData = (event.clipboardData || window.clipboardData).getData('text/plain');
    
    // Find starting row and cell
    const startInput = event.target;
    if (startInput.tagName !== 'INPUT') return;

    const startCell = startInput.closest('td');
    const startRow = startInput.closest('tr');
    const startCellIndex = Array.from(startRow.children).indexOf(startCell);
    
    // Get all rows in the table body
    let tableRows = Array.from(document.getElementById('psd-table-body').children);
    const startRowIndex = tableRows.indexOf(startRow);

    const pastedRows = pasteData.split(/(\r\n|\n|\r)/) // Split by newlines
                              .filter(row => row.trim() !== '') // Remove empty rows
                              .map(row => row.split('\t')); // Split by tabs

    pastedRows.forEach((rowData, rowIndex) => {
        const targetRowIndex = startRowIndex + rowIndex;
        
        // Add a new row if pasted data exceeds table length
        if (targetRowIndex >= tableRows.length) {
            addSieveRow();
            tableRows = Array.from(document.getElementById('psd-table-body').children); // Re-query rows
        }
        
        const targetRow = tableRows[targetRowIndex];
        const targetInputs = targetRow.querySelectorAll('input[type="number"]');

        rowData.forEach((cellData, cellIndex) => {
            const targetCellIndex = startCellIndex + cellIndex;
            if (targetCellIndex < targetInputs.length) {
                targetInputs[targetCellIndex].value = cellData.trim();
            }
        });
    });

    // Update the mass balance sieve selector after pasting
    updateMassBalanceSieveSelect();
}

// ======================================================
// ==              PRINT & EXPORT FUNCTIONS        ==
// ======================================================

/**
 * Populate the repeating print header
 */
function updatePrintHeader() {
    const company = document.getElementById('company-name')?.value || 'N/A';
    const preparer = document.getElementById('report-preparer')?.value || 'N/A';
    const date = document.getElementById('report-date')?.value || 'N/A';
    
    const en = document.querySelector('.lang-btn.active')?.id === 'lang-en';

    const headerHTML = en ? 
        `<strong>Company:</strong> ${company}<br>
         <strong>Prepared By:</strong> ${preparer}<br>
         <strong>Report Date:</strong> ${date}` :
        `<strong>الشركة:</strong> ${company}<br>
         <strong>معد التقرير:</strong> ${preparer}<br>
         <strong>تاريخ التقرير:</strong> ${date}`;
    
    const headerInfo = document.getElementById('print-header-info');
    if (headerInfo) {
        headerInfo.innerHTML = headerHTML;
    }

    // Also update cover page details for printing
    const coverCompany = document.getElementById('cover-company');
    const coverPreparer = document.getElementById('cover-preparer');
    const coverDate = document.getElementById('cover-date');
    const coverProduction = document.getElementById('cover-production');
    if (coverCompany) coverCompany.textContent = company;
    if (coverPreparer) coverPreparer.textContent = preparer;
    if (coverDate) coverDate.textContent = date;
    if (coverProduction) {
        const prodDate = document.getElementById('production-date')?.value || 'N/A';
        coverProduction.textContent = prodDate;
    }
}

/**
 * Print the report
 */
function printReport() {
    updatePrintHeader(); // Ensure header is fresh before printing
    window.print();
}

/**
 * Export to PDF (placeholder function)
 */
function exportToPDF() {
    alert('PDF export functionality would be implemented here using a library like jsPDF.');
}

// ======================================================
// ==              API & AI FUNCTIONS               ==
// ======================================================

/**
 * Update API connection status display
 * @param {string} status - 'connected' or 'disconnected'
 * @param {string} message - Status message
 */
function updateApiStatus(status, message) {
    const apiStatus = document.getElementById('api-status');
    if (!apiStatus) return;
    
    apiStatus.className = `api-status ${status}`;
    apiStatus.textContent = message;
    
    // Update data attributes for multilingual support
    if (status === 'connected') {
        apiStatus.setAttribute('data-en', 'API: Connected');
        apiStatus.setAttribute('data-ar', 'API: متصل');
    } else {
        apiStatus.setAttribute('data-en', 'API: Disconnected');
        apiStatus.setAttribute('data-ar', 'API: غير متصل');
    }
    
    // Update text based on current language
    const currentLang = document.querySelector('.lang-btn.active')?.id.replace('lang-', '');
    if (currentLang) {
        setLanguage(currentLang);
    }
}

/**
 * Test OpenAI API connection
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<Object>} - Test result
 */
async function testOpenAIAPI(apiKey) {
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return {
            success: true,
            status: response.status,
            model: data.data[0]?.id || 'Unknown'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Generate OpenAI analysis
 * @param {string} apiKey - OpenAI API key
 * @param {string} model - AI model to use
 * @param {Object} results - Calculation results
 * @param {string} separatorType - Separator type
 * @param {string} separatorModel - Separator model
 * @returns {Promise<string>} - Analysis text
 */
async function generateOpenAIAnalysis(apiKey, model, results, separatorType, separatorModel) {
    const prompt = `
    As an expert cement plant process engineer with 20+ years of experience, analyze this separator efficiency data:

    SEPARATOR INFORMATION:
    - Type: ${getSeparatorTypeName(separatorType)}
    - Model: ${separatorModel || 'Not specified'}
    
    PERFORMANCE RESULTS:
    - Circulating Load: ${results.circulatingLoad.toFixed(1)}% (Calculated at ${results.clSieve} μm)
    - Separator Efficiency: ${results.efficiency.toFixed(1)}%
    - Cut Size (d50): ${results.cutSize ? results.cutSize.toFixed(1) + ' μm' : 'N/A'}
    - Imperfection: ${results.imperfection ? results.imperfection.toFixed(3) : 'N/A'}
    - Bypass: ${results.bypass.toFixed(1)}%
    - Sharpness: ${results.sharpness ? results.sharpness.toFixed(3) : 'N/A'}

    Provide a comprehensive professional analysis including:

    1. OVERALL ASSESSMENT: Evaluate the current performance level
    2. INDUSTRY COMPARISON: Compare with typical values for this separator type
    3. KEY OBSERVATIONS: Highlight the most important findings
    4. OPTIMIZATION RECOMMENDATIONS: Specific, actionable recommendations
    5. MAINTENANCE GUIDANCE: Preventive maintenance suggestions
    6. POTENTIAL ISSUES: Identify any red flags or areas of concern

    Format the response in clear HTML with proper sections, bullet points, and emphasis on critical items.
    Use professional cement industry terminology.
    `;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert cement plant process engineer with 20+ years of experience in separator optimization and grinding circuit efficiency. Provide detailed, professional analysis with actionable recommendations.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        throw new Error(`OpenAI API Error: ${error.message}`);
    }
}

/**
 * Get separator type name from code
 * @param {string} type - Separator type code
 * @returns {string} - Separator type name
 */
function getSeparatorTypeName(type) {
    const types = {
        '1st-gen': '1st Generation (Sturtevant, Raymond)',
        '2nd-gen': '2nd Generation (Cyclone Air Separator)',
        '3rd-gen': '3rd Generation High Efficiency Separator (HES)'
    };
    return types[type] || type;
}

/**
 * Generate enhanced local analysis when no API key is available
 * @param {Object} results - Calculation results
 * @param {string} separatorType - Separator type
 * @param {string} separatorModel - Separator model
 * @returns {string} - Analysis HTML
 */
function generateEnhancedLocalAnalysis(results, separatorType, separatorModel) {
    let analysis = '<div class="enhanced-analysis">';
    
    analysis += '<h4>🧠 AI-Powered Analysis</h4>';
    analysis += '<p><em>For enhanced analysis with OpenAI GPT, please enter your API key above.</em></p>';
    
    // Overall Assessment
    analysis += '<h4>📊 Overall Performance Assessment</h4>';
    
    if (results.efficiency >= 75) {
        analysis += '<p>✅ <strong>Excellent Performance:</strong> Your separator is operating at optimal efficiency levels comparable to modern HES systems.</p>';
    } else if (results.efficiency >= 60) {
        analysis += '<p>⚠️ <strong>Good Performance:</strong> Your separator is performing well but has room for optimization to reach peak efficiency.</p>';
    } else {
        analysis += '<p>❌ <strong>Needs Significant Improvement:</strong> Major optimization opportunities exist to improve separator performance.</p>';
    }
    
    // Detailed Analysis
    analysis += '<h4>🔍 Detailed Technical Analysis</h4><ul>';
    
    // Circulating Load Analysis
    if (results.circulatingLoad < 150) {
        analysis += `<li>📉 <strong>Circulating Load (${results.circulatingLoad.toFixed(1)}% at ${results.clSieve} μm):</strong> Below optimal range (150-250%). Consider increasing mill feed rate to improve grinding efficiency.</li>`;
    } else if (results.circulatingLoad > 250) {
        analysis += `<li>📈 <strong>Circulating Load (${results.circulatingLoad.toFixed(1)}% at ${results.clSieve} μm):</strong> Above optimal range. May indicate separator classification issues or excessive bypass.</li>`;
    } else {
        analysis += `<li>✅ <strong>Circulating Load (${results.circulatingLoad.toFixed(1)}% at ${results.clSieve} μm):</strong> Within optimal operating range for efficient grinding circuit operation.</li>`;
    }
    
    // Bypass Analysis
    if (results.bypass > 15) {
        analysis += `<li>🔄 <strong>Bypass (${results.bypass.toFixed(1)}%):</strong> High bypass indicates significant classification inefficiency. Investigate mechanical condition, air flow distribution, and material dispersion.</li>`;
    } else if (results.bypass > 8) {
        analysis += `<li>⚠️ <strong>Bypass (${results.bypass.toFixed(1)}%):</strong> Moderate bypass level. Room for improvement in classification efficiency.</li>`;
    } else {
        analysis += `<li>✅ <strong>Bypass (${results.bypass.toFixed(1)}%):</strong> Excellent bypass control, indicating efficient classification.</li>`;
    }
    
    // Imperfection Analysis
    if (results.imperfection > 0.35) {
        analysis += `<li>⚡ <strong>Imperfection (${(results.imperfection ? results.imperfection.toFixed(3) : 'N/A')}):</strong> High imperfection suggests poor separation sharpness. Consider adjusting rotor speed, air flow, or mechanical settings.</li>`;
    } else if (results.imperfection) {
        analysis += `<li>✅ <strong>Imperfection (${results.imperfection.toFixed(3)}):</strong> Good separation sharpness indicating effective particle classification.</li>`;
    }
    
    analysis += '</ul>';
    
    // Recommendations based on separator type
    analysis += '<h4>🎯 Optimization Recommendations</h4><ul>';
    
    if (separatorType === '3rd-gen') {
        analysis += '<li>Maintain Qf/Qa ratio between 1.5-2.0 kg/m³ for optimal HES performance</li>';
        analysis += '<li>Monitor rotor cage condition and blade wear regularly</li>';
        analysis += '<li>Ensure proper air flow distribution across the rotor cage</li>';
        analysis += '<li>Optimize rotor speed based on product fineness requirements</li>';
    } else if (separatorType === '2nd-gen') {
        analysis += '<li>Optimize counter blade settings and clearance</li>';
        analysis += '<li>Check and maintain dispersion plate condition</li>';
        analysis += '<li>Consider upgrade to HES for 20-40% efficiency improvement</li>';
        analysis += '<li>Monitor guide vane settings and air flow patterns</li>';
    } else {
        analysis += '<li>Strongly consider upgrading to High Efficiency Separator for major efficiency gains</li>';
        analysis += '<li>Monitor mechanical wear closely, especially distribution plate</li>';
        analysis += '<li>Optimize air flow and feed rate balance</li>';
        analysis += '<li>Consider implementing modern control systems</li>';
    }
    
    analysis += '<li>Implement regular performance monitoring and data recording</li>';
    analysis += '<li>Schedule preventive maintenance based on operating hours</li>';
    analysis += '<li>Consider using grinding aids to improve separation efficiency</li>';
    analysis += '</ul>';
    
    analysis += '</div>';
    
    return analysis;
}

// ======================================================
// ==              CHART FUNCTIONS                 ==
// ======================================================

/**
 * Generate all charts for the analysis results
 * @param {Object} psdData - Particle size distribution data
 * @param {Object} results - Calculation results
 */
function generateCharts(psdData, results) {
    // Tromp Curve Chart
    generateTrompChart(psdData, results);
    
    // PSD Chart
    generatePSDChart(psdData);
    
    // KPI Performance Comparison Chart
    generateKPIChart(results);
}

/**
 * Generate Tromp Curve Chart
 * @param {Object} psdData - Particle size distribution data
 * @param {Object} results - Calculation results
 */
function generateTrompChart(psdData, results) {
    const trompCanvas = document.getElementById('tromp-curve-chart');
    if (!trompCanvas) return;
    
    const trompCtx = trompCanvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.trompChart) {
        window.trompChart.destroy();
    }
    
    window.trompChart = new Chart(trompCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Tromp Curve',
                data: psdData.sieveSizes.map((size, i) => ({x: size, y: results.trompValues[i]})),
                backgroundColor: 'rgba(52, 152, 219, 0.7)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 1,
                pointRadius: 5,
                showLine: true, // Add line to connect points
                tension: 0.1 // Slight curve
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'logarithmic',
                    title: {
                        display: true,
                        text: 'Particle Size (μm)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Probability of Rejection (%)'
                    },
                    min: 0,
                    max: 100
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Tromp Curve'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Size: ${context.parsed.x} μm, Probability: ${context.parsed.y.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Generate PSD Chart
 * @param {Object} psdData - Particle size distribution data
 */
function generatePSDChart(psdData) {
    const psdCanvas = document.getElementById('psd-chart');
    if (!psdCanvas) return;
    
    const psdCtx = psdCanvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.psdChart) {
        window.psdChart.destroy();
    }
    
    window.psdChart = new Chart(psdCtx, {
        type: 'line',
        data: {
            labels: psdData.sieveSizes,
            datasets: [
                {
                    label: 'Feed',
                    data: psdData.feed,
                    borderColor: 'rgba(231, 76, 60, 1)',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.3
                },
                {
                    label: 'Fines',
                    data: psdData.fines,
                    borderColor: 'rgba(46, 204, 113, 1)',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    tension: 0.3
                },
                {
                    label: 'Rejects',
                    data: psdData.rejects,
                    borderColor: 'rgba(52, 152, 219, 1)',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'logarithmic',
                    title: {
                        display: true,
                        text: 'Particle Size (μm)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Cumulative % Passing'
                    },
                    min: 0,
                    max: 100
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Particle Size Distribution'
                }
            }
        }
    });
}

/**
 * Generate KPI Performance Chart
 * @param {Object} results - Calculation results
 */
function generateKPIChart(results) {
    const kpiCanvas = document.getElementById('kpi-chart');
    if (!kpiCanvas) return;
    
    const kpiCtx = kpiCanvas.getContext('2d');
    if (window.kpiChart) {
        window.kpiChart.destroy();
    }
    
    // Gather good target values
    const cl_good_val = parseFloat(document.getElementById('target-cl-good')?.value) || 150;
    const eff_good_val = parseFloat(document.getElementById('target-eff-good')?.value) || 85;
    const imp_good_val = parseFloat(document.getElementById('target-imp-good')?.value) || 0.35;
    const sharp_good_val = parseFloat(document.getElementById('target-sharp-good')?.value) || 0.6;
    const bypass_good_val = parseFloat(document.getElementById('target-bypass-good')?.value) || 10;
    
    const kpiLabels = ['Circulating Load', 'Efficiency', 'Imperfection', 'Sharpness', 'Bypass'];
    const actualValues = [
        results.circulatingLoad !== null ? parseFloat(results.circulatingLoad.toFixed(2)) : null,
        results.efficiency !== null ? parseFloat(results.efficiency.toFixed(2)) : null,
        results.imperfection !== null ? parseFloat(results.imperfection.toFixed(3)) : null,
        results.sharpness !== null ? parseFloat(results.sharpness.toFixed(3)) : null,
        results.bypass !== null ? parseFloat(results.bypass.toFixed(2)) : null
    ];
    const goodValues = [cl_good_val, eff_good_val, imp_good_val, sharp_good_val, bypass_good_val];
    
    window.kpiChart = new Chart(kpiCtx, {
        type: 'bar',
        data: {
            labels: kpiLabels,
            datasets: [
                {
                    label: 'Actual',
                    data: actualValues,
                    backgroundColor: 'rgba(52, 152, 219, 0.7)'
                },
                {
                    label: 'Target (Good)',
                    data: goodValues,
                    backgroundColor: 'rgba(46, 204, 113, 0.5)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'KPI Performance vs Good Targets'
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

// ======================================================
// ==              UTILITY FUNCTIONS                ==
// ======================================================

/**
 * Interpolate particle size for a given Tromp value using logarithmic interpolation
 * @param {number} targetValue - Target Tromp value
 * @param {number} value1 - First Tromp value
 * @param {number} value2 - Second Tromp value
 * @param {number} size1 - First particle size
 * @param {number} size2 - Second particle size
 * @returns {number} - Interpolated size
 */
function interpolateSize(targetValue, value1, value2, size1, size2) {
    // If the Tromp values are identical, return the first size to avoid division by zero
    if (value2 - value1 === 0) {
        return size1;
    }
    const logSize1 = Math.log(size1);
    const logSize2 = Math.log(size2);
    const interpLog = logSize1 + (targetValue - value1) * (logSize2 - logSize1) / (value2 - value1);
    return Math.exp(interpLog);
}

/**
 * Convert cumulative passing array to fractional passing array
 * @param {Array} cumulativeArray - Cumulative passing percentages
 * @returns {Array} - Fractional passing percentages
 */
function getFractionalPassing(cumulativeArray) {
    const fractional = [];
    let prevPassing = 0;
    for (let i = 0; i < cumulativeArray.length; i++) {
        // Handle non-monotonic data (errors in lab)
        const currentPassing = Math.max(prevPassing, cumulativeArray[i]); 
        const fraction = currentPassing - prevPassing;
        fractional.push(fraction);
        prevPassing = currentPassing;
    }
    return fractional;
}

/**
 * Set status indicator for KPI cards
 * @param {string} metric - Metric identifier
 * @param {number} value - Current value
 * @param {number} goodThreshold - Good threshold
 * @param {number} fairThreshold - Fair threshold
 * @param {boolean} lowerIsBetter - Whether lower values are better
 */
function setStatusIndicator(metric, value, goodThreshold, fairThreshold, lowerIsBetter = false) {
    const statusElement = document.getElementById(`${metric}-status`);
    if (!statusElement) return;
    
    let status, statusClass;
    
    // Handle N/A values
    if (value === null || typeof value === 'undefined' || isNaN(value)) {
        statusElement.textContent = 'N/A';
        statusElement.className = 'kpi-label';
        return;
    }

    if (lowerIsBetter) {
        if (value <= goodThreshold) {
            status = 'Good';
            statusClass = 'good';
        } else if (value <= fairThreshold) {
            status = 'Fair';
            statusClass = 'fair';
        } else {
            status = 'Poor';
            statusClass = 'poor';
        }
    } else {
        if (value >= goodThreshold) {
            status = 'Good';
            statusClass = 'good';
        } else if (value >= fairThreshold) {
            status = 'Fair';
            statusClass = 'fair';
        } else {
            status = 'Poor';
            statusClass = 'poor';
        }
    }
    
    statusElement.textContent = status;
    statusElement.className = 'kpi-label ' + statusClass;
}

// ======================================================
// ==              INITIALIZATION                   ==
// ======================================================

/**
 * Initialize the application with default settings
 */
function initializeApp() {
    // Set current dates
    const today = new Date().toISOString().split('T')[0];
    const reportDateInput = document.getElementById('report-date');
    const productionDateInput = document.getElementById('production-date');
    
    if (reportDateInput) reportDateInput.value = today;
    if (productionDateInput) productionDateInput.value = today;
    
    // Load saved API key
    const savedApiKey = localStorage.getItem('cement_analyzer_api_key');
    const apiKeyInput = document.getElementById('api-key');
    if (savedApiKey && apiKeyInput) {
        apiKeyInput.value = savedApiKey;
        updateApiStatus('connected', 'API: Connected (Using saved key)');
    }

    // Populate sieve selector on load
    updateMassBalanceSieveSelect();

    // Add listeners for Enter Key and Paste
    const tableBody = document.getElementById('psd-table-body');
    if (tableBody) {
        tableBody.addEventListener('keydown', handleTableKeyDown);
        tableBody.addEventListener('paste', handleTablePaste);
    }
}

/**
 * Hide splash screen after loading
 */
function hideSplashScreen() {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }, 2000); // 2-second splash screen
}

/**
 * Get translated text based on current language
 * @param {string} englishText - English text
 * @param {string} arabicText - Arabic text
 * @returns {string} Translated text
 */
function getText(englishText, arabicText) {
    const currentLang = document.querySelector('.lang-btn.active')?.id.replace('lang-', '') || 'en';
    return currentLang === 'ar' ? arabicText : englishText;
}

/**
 * Setup language switcher event listeners
 */
function setupLanguageSwitcher() {
    const enBtn = document.getElementById('lang-en');
    const arBtn = document.getElementById('lang-ar');
    
    if (enBtn) {
        enBtn.addEventListener('click', () => {
            setLanguage('en');
        });
    }
    
    if (arBtn) {
        arBtn.addEventListener('click', () => {
            setLanguage('ar');
        });
    }
}