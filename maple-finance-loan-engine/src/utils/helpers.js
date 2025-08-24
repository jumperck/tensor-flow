// Utility functions for Maple Finance Loan Engine

/**
 * Calculate monthly payment for installment loans
 */
function calculateMonthlyPayment(principal, annualRate, termMonths) {
    if (termMonths === 0) return 0;
    
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return principal / termMonths;
    
    const payment = principal * 
        (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
        (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    return Math.round(payment * 100) / 100;
}

/**
 * Calculate total interest for a loan
 */
function calculateTotalInterest(principal, monthlyPayment, termMonths) {
    return Math.round((monthlyPayment * termMonths - principal) * 100) / 100;
}

/**
 * Validate Canadian postal code
 */
function isValidPostalCode(postalCode) {
    const regex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    return regex.test(postalCode);
}

/**
 * Format currency for Canadian dollars
 */
function formatCAD(amount, showCents = false) {
    const formatter = new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: showCents ? 2 : 0,
        maximumFractionDigits: showCents ? 2 : 0
    });
    
    return formatter.format(amount);
}

/**
 * Validate Social Insurance Number (basic format check)
 */
function isValidSIN(sin) {
    // Remove spaces and hyphens
    const cleanSIN = sin.replace(/[\s-]/g, '');
    
    // Check if it's 9 digits
    if (!/^\d{9}$/.test(cleanSIN)) {
        return false;
    }
    
    // Luhn algorithm check
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        let digit = parseInt(cleanSIN[i]);
        
        if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) {
                digit = digit.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
            }
        }
        
        sum += digit;
    }
    
    return sum % 10 === 0;
}

/**
 * Get province risk factor for lending
 */
function getProvinceRiskFactor(province) {
    const riskFactors = {
        'ON': 1.0,   // Low risk
        'QC': 1.1,   // Slightly higher
        'BC': 1.05,  // Slightly higher due to housing costs
        'AB': 1.15,  // Economic volatility
        'MB': 1.0,   // Stable
        'SK': 1.0,   // Stable
        'NS': 1.1,   // Slightly higher
        'NB': 1.1,   // Slightly higher
        'NL': 1.2,   // Higher due to economic challenges
        'PE': 1.05,  // Slightly higher
        'NT': 1.3,   // Higher due to remote location
        'YT': 1.3,   // Higher due to remote location
        'NU': 1.3    // Higher due to remote location
    };
    
    return riskFactors[province] || 1.0;
}

/**
 * Determine minimum age by province
 */
function getMinimumAge(province) {
    const higherAgeProvinces = ['BC', 'NS', 'NB', 'NL'];
    return higherAgeProvinces.includes(province) ? 19 : 18;
}

/**
 * Calculate debt service ratio
 */
function calculateDebtServiceRatio(monthlyDebtPayments, grossMonthlyIncome) {
    if (grossMonthlyIncome === 0) return 1;
    return monthlyDebtPayments / grossMonthlyIncome;
}

/**
 * Get credit score category
 */
function getCreditScoreCategory(score) {
    if (score >= 800) return 'Excellent';
    if (score >= 740) return 'Very Good';
    if (score >= 670) return 'Good';
    if (score >= 580) return 'Fair';
    return 'Poor';
}

/**
 * Calculate maximum affordable loan amount
 */
function calculateMaxAffordableLoan(annualIncome, monthlyDebt, interestRate, termMonths, maxDebtRatio = 0.4) {
    const monthlyIncome = annualIncome / 12;
    const maxMonthlyDebt = monthlyIncome * maxDebtRatio;
    const availableForLoan = maxMonthlyDebt - monthlyDebt;
    
    if (availableForLoan <= 0) return 0;
    
    const monthlyRate = interestRate / 100 / 12;
    if (monthlyRate === 0) return availableForLoan * termMonths;
    
    const maxLoan = availableForLoan * 
        (Math.pow(1 + monthlyRate, termMonths) - 1) / 
        (monthlyRate * Math.pow(1 + monthlyRate, termMonths));
    
    return Math.floor(maxLoan);
}

/**
 * Generate loan application reference number
 */
function generateReferenceNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `MPL-${timestamp}-${random}`;
}

/**
 * Validate age requirement for loan type
 */
function validateAgeRequirement(age, province, loanType) {
    const minAge = getMinimumAge(province);
    
    if (age < minAge) {
        return {
            valid: false,
            message: `Minimum age is ${minAge} in ${getProvinceName(province)}`
        };
    }
    
    // Special age requirements for certain loan types
    if (loanType === 'student' && age > 35) {
        return {
            valid: false,
            message: 'Student loans are typically for applicants under 35'
        };
    }
    
    return { valid: true, message: null };
}

/**
 * Get full province name from code
 */
function getProvinceName(code) {
    const provinces = {
        'ON': 'Ontario',
        'QC': 'Quebec',
        'BC': 'British Columbia',
        'AB': 'Alberta',
        'MB': 'Manitoba',
        'SK': 'Saskatchewan',
        'NS': 'Nova Scotia',
        'NB': 'New Brunswick',
        'NL': 'Newfoundland and Labrador',
        'PE': 'Prince Edward Island',
        'NT': 'Northwest Territories',
        'YT': 'Yukon',
        'NU': 'Nunavut'
    };
    
    return provinces[code] || code;
}

/**
 * Log loan application activity
 */
function logActivity(applicationId, action, details = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        applicationId,
        action,
        details
    };
    
    console.log('Loan Activity:', JSON.stringify(logEntry, null, 2));
    
    // In production, this would send to a logging service
    return logEntry;
}

module.exports = {
    calculateMonthlyPayment,
    calculateTotalInterest,
    isValidPostalCode,
    formatCAD,
    isValidSIN,
    getProvinceRiskFactor,
    getMinimumAge,
    calculateDebtServiceRatio,
    getCreditScoreCategory,
    calculateMaxAffordableLoan,
    generateReferenceNumber,
    validateAgeRequirement,
    getProvinceName,
    logActivity
};
