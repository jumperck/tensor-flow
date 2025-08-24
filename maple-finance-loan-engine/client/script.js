// Maple Finance Inc. - Loan Application JavaScript

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const loanForm = document.getElementById('loan-form');
const applicationSection = document.getElementById('application-section');
const decisionSection = document.getElementById('decision-section');
const decisionContent = document.getElementById('decision-content');
const newApplicationBtn = document.getElementById('new-application');
const loadingOverlay = document.getElementById('loading-overlay');

// Current application data
let currentApplicationId = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateLoanAmountLimits();
});

function initializeEventListeners() {
    loanForm.addEventListener('submit', handleFormSubmit);
    newApplicationBtn.addEventListener('click', startNewApplication);
    
    // Update loan amount limits when loan type changes
    document.getElementById('loanType').addEventListener('change', updateLoanAmountLimits);
    
    // Real-time validation
    document.getElementById('age').addEventListener('change', validateAge);
    document.getElementById('province').addEventListener('change', validateAge);
    document.getElementById('creditScore').addEventListener('input', validateCreditScore);
    document.getElementById('debtToIncomeRatio').addEventListener('input', validateDebtToIncomeRatio);
}

// Form Submission Handler
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(loanForm);
    const applicationData = Object.fromEntries(formData.entries());
    
    // Convert numeric fields
    applicationData.age = parseInt(applicationData.age);
    applicationData.annualIncome = parseInt(applicationData.annualIncome);
    applicationData.creditScore = parseInt(applicationData.creditScore);
    applicationData.loanAmount = parseInt(applicationData.loanAmount);
    applicationData.employmentYears = parseFloat(applicationData.employmentYears);
    applicationData.debtToIncomeRatio = parseFloat(applicationData.debtToIncomeRatio);
    applicationData.hasCollateral = applicationData.hasCollateral === 'true';
    
    // Validate form data
    if (!validateFormData(applicationData)) {
        return;
    }
    
    showLoading(true);
    
    try {
        // Submit application
        const applicationResponse = await submitApplication(applicationData);
        
        if (applicationResponse.success) {
            currentApplicationId = applicationResponse.applicationId;
            // Get ML decision
            const decisionResponse = await getDecision(currentApplicationId);
            if (decisionResponse.success) {
                displayDecision(decisionResponse.decision);
                showDecisionSection();
            } else {
                showError('Failed to get loan decision: ' + decisionResponse.error);
            }
        } else {
            // Show API validation errors if present
            if (Array.isArray(applicationResponse.details) && applicationResponse.details.length > 0) {
                showError('Please correct the following errors:\n\n' + applicationResponse.details.join('\n'));
            } else {
                showError('Failed to submit application: ' + applicationResponse.error);
            }
        }
    } catch (error) {
        console.error('Application error:', error);
        showError('An error occurred while processing your application. Please try again.');
    } finally {
        showLoading(false);
    }
}

// API Functions
async function submitApplication(applicationData) {
    const response = await fetch(`${API_BASE_URL}/loans/apply`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData)
    });
    
    return await response.json();
}

async function getDecision(applicationId) {
    const response = await fetch(`${API_BASE_URL}/loans/${applicationId}/decision`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    
    return await response.json();
}

// Display Functions
function displayDecision(decision) {
    const { approved, interestRate, confidence, riskScore, explanation, loanTerms } = decision;
    
    let html = `
        <div class="decision-result ${approved ? 'decision-approved' : 'decision-declined'}">
            <div class="decision-status">
                ${approved ? '✅ APPROVED' : '❌ DECLINED'}
            </div>
            <div class="decision-details">
                ${approved ? 'Congratulations! Your loan application has been approved.' : 'Unfortunately, your application does not meet our current lending criteria.'}
            </div>
            <div class="confidence-score">
                Confidence: ${confidence}% | Risk Score: ${riskScore}%
            </div>
        </div>
    `;
    
    if (explanation && explanation.length > 0) {
        html += `
            <div class="explanation-list">
                <h4>Decision Factors</h4>
                <ul>
                    ${explanation.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    if (approved && interestRate) {
        html += `
            <div class="loan-terms">
                <h4>Your Approved Interest Rate: ${interestRate.toFixed(2)}% APR</h4>
            </div>
        `;
    }
    
    if (loanTerms && loanTerms.options && loanTerms.options.length > 0) {
        html += `
            <div class="loan-terms">
                <h4>Available Loan Terms</h4>
                ${loanTerms.options.map(option => createTermOption(option)).join('')}
                
                <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <h5 style="color: #c0392b; margin-bottom: 10px;">Special Conditions</h5>
                    <ul style="list-style: disc; padding-left: 20px;">
                        ${loanTerms.specialConditions.map(condition => `<li style="margin: 5px 0;">${condition}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
    
    decisionContent.innerHTML = html;
}

function createTermOption(option) {
    if (option.creditLimit) {
        // Line of credit
        return `
            <div class="term-option">
                <h5>Maple Line of Credit</h5>
                <div class="term-details">
                    <div class="term-detail">
                        <strong>$${option.creditLimit.toLocaleString()}</strong>
                        Credit Limit
                    </div>
                    <div class="term-detail">
                        <strong>${option.interestRate.toFixed(2)}%</strong>
                        APR
                    </div>
                    <div class="term-detail">
                        <strong>$${option.minimumMonthlyPayment.toFixed(2)}</strong>
                        Min. Monthly Payment
                    </div>
                    <div class="term-detail">
                        <strong>${option.paymentType}</strong>
                        Payment Type
                    </div>
                </div>
            </div>
        `;
    } else if (option.termYears) {
        // Mortgage
        return `
            <div class="term-option">
                <h5>${option.termYears} Year Term</h5>
                <div class="term-details">
                    <div class="term-detail">
                        <strong>$${option.monthlyPayment.toLocaleString()}</strong>
                        Monthly Payment
                    </div>
                    <div class="term-detail">
                        <strong>$${option.totalPaid.toLocaleString()}</strong>
                        Total Paid
                    </div>
                    <div class="term-detail">
                        <strong>$${option.totalInterest.toLocaleString()}</strong>
                        Total Interest
                    </div>
                    <div class="term-detail">
                        <strong>${option.interestRate.toFixed(2)}%</strong>
                        APR
                    </div>
                </div>
            </div>
        `;
    } else {
        // Regular installment loan
        return `
            <div class="term-option">
                <h5>${option.termMonths} Month Term</h5>
                <div class="term-details">
                    <div class="term-detail">
                        <strong>$${option.monthlyPayment.toLocaleString()}</strong>
                        Monthly Payment
                    </div>
                    <div class="term-detail">
                        <strong>$${option.totalPaid.toLocaleString()}</strong>
                        Total Paid
                    </div>
                    <div class="term-detail">
                        <strong>$${option.totalInterest.toLocaleString()}</strong>
                        Total Interest
                    </div>
                    <div class="term-detail">
                        <strong>${option.interestRate.toFixed(2)}%</strong>
                        APR
                    </div>
                </div>
            </div>
        `;
    }
}

// Validation Functions
function validateFormData(data) {
    const errors = [];
    
    // Age validation
    const minAge = ['BC', 'NS', 'NB', 'NL'].includes(data.province) ? 19 : 18;
    if (data.age < minAge) {
        errors.push(`Minimum age is ${minAge} in ${getProvinceName(data.province)}`);
    }
    
    // Credit score validation
    if (data.creditScore < 300 || data.creditScore > 900) {
        errors.push('Credit score must be between 300 and 900');
    }
    
    // Debt-to-income validation
    if (data.debtToIncomeRatio < 0 || data.debtToIncomeRatio > 1) {
        errors.push('Debt-to-income ratio must be between 0 and 1');
    }
    
    // Loan amount validation
    const loanLimits = getLoanLimits(data.loanType);
    if (loanLimits && (data.loanAmount < loanLimits.min || data.loanAmount > loanLimits.max)) {
        errors.push(`${getLoanTypeName(data.loanType)} amount must be between $${loanLimits.min.toLocaleString()} and $${loanLimits.max.toLocaleString()}`);
    }
    
    if (errors.length > 0) {
        showError('Please correct the following errors:\n\n' + errors.join('\n'));
        return false;
    }
    
    return true;
}

function validateAge() {
    const age = parseInt(document.getElementById('age').value);
    const province = document.getElementById('province').value;
    const ageInput = document.getElementById('age');
    
    if (age && province) {
        const minAge = ['BC', 'NS', 'NB', 'NL'].includes(province) ? 19 : 18;
        if (age < minAge) {
            ageInput.setCustomValidity(`Minimum age is ${minAge} in ${getProvinceName(province)}`);
        } else {
            ageInput.setCustomValidity('');
        }
    }
}

function validateCreditScore() {
    const creditScore = parseInt(document.getElementById('creditScore').value);
    const creditInput = document.getElementById('creditScore');
    
    if (creditScore) {
        if (creditScore < 300 || creditScore > 900) {
            creditInput.setCustomValidity('Credit score must be between 300 and 900');
        } else {
            creditInput.setCustomValidity('');
        }
    }
}

function validateDebtToIncomeRatio() {
    const ratio = parseFloat(document.getElementById('debtToIncomeRatio').value);
    const ratioInput = document.getElementById('debtToIncomeRatio');
    
    if (ratio !== null && !isNaN(ratio)) {
        if (ratio < 0 || ratio > 1) {
            ratioInput.setCustomValidity('Debt-to-income ratio must be between 0 and 1');
        } else {
            ratioInput.setCustomValidity('');
        }
    }
}

// UI Helper Functions
function updateLoanAmountLimits() {
    const loanType = document.getElementById('loanType').value;
    const loanAmountInput = document.getElementById('loanAmount');
    
    const limits = getLoanLimits(loanType);
    if (limits) {
        loanAmountInput.min = limits.min;
        loanAmountInput.max = limits.max;
        loanAmountInput.placeholder = `$${limits.min.toLocaleString()} - $${limits.max.toLocaleString()}`;
    }
}

function getLoanLimits(loanType) {
    const limits = {
        'personal-unsecured': { min: 1000, max: 50000 },
        'personal-secured': { min: 1000, max: 50000 },
        'mortgage': { min: 50000, max: 2000000 },
        'auto': { min: 5000, max: 80000 },
        'student': { min: 1000, max: 20000 },
        'line-of-credit': { min: 2000, max: 30000 }
    };
    
    return limits[loanType] || null;
}

function getLoanTypeName(loanType) {
    const names = {
        'personal-unsecured': 'Personal Loan (Unsecured)',
        'personal-secured': 'Personal Loan (Secured)',
        'mortgage': 'Mortgage',
        'auto': 'Auto Loan',
        'student': 'Student Support Loan',
        'line-of-credit': 'Maple Line of Credit'
    };
    
    return names[loanType] || loanType;
}

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

function showDecisionSection() {
    applicationSection.classList.add('hidden');
    decisionSection.classList.remove('hidden');
    
    // Scroll to decision section
    decisionSection.scrollIntoView({ behavior: 'smooth' });
}

function startNewApplication() {
    // Reset form
    loanForm.reset();
    currentApplicationId = null;
    
    // Show application section
    applicationSection.classList.remove('hidden');
    decisionSection.classList.add('hidden');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Reset validation
    const inputs = loanForm.querySelectorAll('input, select');
    inputs.forEach(input => input.setCustomValidity(''));
    
    // Update loan amount limits
    updateLoanAmountLimits();
}

function showLoading(show) {
    if (show) {
        loadingOverlay.classList.remove('hidden');
    } else {
        loadingOverlay.classList.add('hidden');
    }
}

function showError(message) {
    alert(message);
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatPercentage(value) {
    return (value * 100).toFixed(1) + '%';
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateFormData,
        getLoanLimits,
        getLoanTypeName,
        getProvinceName
    };
}
