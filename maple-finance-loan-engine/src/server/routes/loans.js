const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory storage for demo purposes (use database in production)
const loanApplications = new Map();

// Loan type configurations based on Maple Finance policies
const LOAN_CONFIGS = {
    'personal-unsecured': { min: 1000, max: 50000, minCreditScore: 600 },
    'personal-secured': { min: 1000, max: 50000, minCreditScore: 0 },
    'mortgage': { min: 50000, max: 2000000, minCreditScore: 0 },
    'auto': { min: 5000, max: 80000, minCreditScore: 0 },
    'student': { min: 1000, max: 20000, minCreditScore: 0 },
    'line-of-credit': { min: 2000, max: 30000, minCreditScore: 600 }
};

const CANADIAN_PROVINCES = ['ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'YT', 'NU'];

/**
 * Validate loan application data
 */
function validateApplication(data) {
    const errors = [];
    
    // Required fields
    const requiredFields = [
        'firstName', 'lastName', 'age', 'province', 'citizenship',
        'creditScore', 'annualIncome', 'employmentYears', 'loanAmount',
        'loanType', 'debtToIncomeRatio', 'educationLevel'
    ];
    
    for (const field of requiredFields) {
        if (!data[field] && data[field] !== 0) {
            errors.push(`${field} is required`);
        }
    }
    
    if (errors.length > 0) return { isValid: false, errors };
    
    // Age validation
    const minAge = ['BC', 'NS', 'NB', 'NL'].includes(data.province) ? 19 : 18;
    if (data.age < minAge) {
        errors.push(`Minimum age is ${minAge} in ${data.province}`);
    }
    
    // Province validation
    if (!CANADIAN_PROVINCES.includes(data.province)) {
        errors.push('Invalid province code');
    }
    
    // Citizenship validation
    const validCitizenship = ['citizen', 'permanent-resident', 'work-permit', 'study-permit'];
    if (!validCitizenship.includes(data.citizenship)) {
        errors.push('Invalid citizenship status');
    }
    
    // Credit score validation
    if (data.creditScore < 300 || data.creditScore > 900) {
        errors.push('Credit score must be between 300 and 900');
    }
    
    // Loan type and amount validation
    const loanConfig = LOAN_CONFIGS[data.loanType];
    if (!loanConfig) {
        errors.push('Invalid loan type');
    } else {
        if (data.loanAmount < loanConfig.min || data.loanAmount > loanConfig.max) {
            errors.push(`${data.loanType} loan amount must be between $${loanConfig.min.toLocaleString()} and $${loanConfig.max.toLocaleString()}`);
        }
        
        if (data.loanType === 'personal-unsecured' && data.creditScore < loanConfig.minCreditScore) {
            errors.push(`Minimum credit score for unsecured personal loans is ${loanConfig.minCreditScore}`);
        }
    }
    
    // Income validation
    if (data.annualIncome < 0) {
        errors.push('Annual income must be positive');
    }
    
    // Debt-to-income ratio validation
    if (data.debtToIncomeRatio < 0 || data.debtToIncomeRatio > 1) {
        errors.push('Debt-to-income ratio must be between 0 and 1');
    }
    
    return { isValid: errors.length === 0, errors };
}

/**
 * Submit new loan application
 * POST /api/loans/apply
 */
router.post('/apply', async (req, res) => {
    try {
        const applicationData = req.body;
        
        // Validate application
        const validation = validateApplication(applicationData);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: validation.errors
            });
        }
        
        // Create application
        const applicationId = uuidv4();
        const application = {
            id: applicationId,
            ...applicationData,
            status: 'submitted',
            submittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Store application
        loanApplications.set(applicationId, application);
        
        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            applicationId: applicationId,
            status: 'submitted',
            nextSteps: 'Your application will be processed using our ML-powered decision engine. Use the decision endpoint to get your result.'
        });
        
    } catch (error) {
        console.error('Error processing loan application:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process application',
            message: 'An error occurred while processing your loan application'
        });
    }
});

/**
 * Get loan application by ID
 * GET /api/loans/:id
 */
router.get('/:id', (req, res) => {
    try {
        const applicationId = req.params.id;
        const application = loanApplications.get(applicationId);
        
        if (!application) {
            return res.status(404).json({
                success: false,
                error: 'Application not found',
                message: `No loan application found with ID: ${applicationId}`
            });
        }
        
        // Return application without sensitive data
        const { creditScore, annualIncome, ...publicData } = application;
        
        res.json({
            success: true,
            application: {
                ...publicData,
                creditScoreProvided: !!creditScore,
                incomeVerified: !!annualIncome
            }
        });
        
    } catch (error) {
        console.error('Error retrieving application:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve application'
        });
    }
});

/**
 * Get ML-powered loan decision
 * POST /api/loans/:id/decision
 */
router.post('/:id/decision', async (req, res) => {
    try {
        const applicationId = req.params.id;
        const application = loanApplications.get(applicationId);
        
        if (!application) {
            return res.status(404).json({
                success: false,
                error: 'Application not found',
                message: `No loan application found with ID: ${applicationId}`
            });
        }
        
        if (!req.model || !req.model.isLoaded) {
            return res.status(503).json({
                success: false,
                error: 'ML model not available',
                message: 'The decision engine is currently unavailable. Please try again later.'
            });
        }
        
        // Get ML prediction
        const decision = await req.model.predict(application);
        
        // Update application with decision
        application.status = decision.approved ? 'approved' : 'declined';
        application.decision = decision;
        application.decidedAt = new Date().toISOString();
        application.updatedAt = new Date().toISOString();
        
        // Calculate loan terms if approved
        let loanTerms = null;
        if (decision.approved) {
            loanTerms = calculateLoanTerms(application, decision.interestRate);
        }
        
        res.json({
            success: true,
            decision: {
                applicationId: applicationId,
                approved: decision.approved,
                interestRate: decision.interestRate,
                confidence: decision.confidence,
                riskScore: decision.riskScore,
                explanation: decision.explanation,
                decidedAt: application.decidedAt,
                loanTerms: loanTerms
            }
        });
        
    } catch (error) {
        console.error('Error making loan decision:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to make loan decision',
            message: 'An error occurred while processing your application decision'
        });
    }
});

/**
 * Get all loan applications (for demo purposes)
 * GET /api/loans
 */
router.get('/', (req, res) => {
    try {
        const applications = Array.from(loanApplications.values()).map(app => ({
            id: app.id,
            firstName: app.firstName,
            lastName: app.lastName,
            loanType: app.loanType,
            loanAmount: app.loanAmount,
            status: app.status,
            submittedAt: app.submittedAt,
            decidedAt: app.decidedAt
        }));
        
        res.json({
            success: true,
            count: applications.length,
            applications: applications
        });
        
    } catch (error) {
        console.error('Error retrieving applications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve applications'
        });
    }
});

/**
 * Calculate loan terms based on approval
 */
function calculateLoanTerms(application, interestRate) {
    const { loanAmount, loanType } = application;
    
    // Term lengths by loan type (in months)
    const termOptions = {
        'personal-unsecured': [12, 24, 36, 48, 60, 84],
        'personal-secured': [12, 24, 36, 48, 60, 84],
        'mortgage': [12, 24, 36, 48, 60], // years, not months
        'auto': [12, 24, 36, 48, 60, 72],
        'student': [60, 84, 120], // 5-10 years
        'line-of-credit': [0] // Open term
    };
    
    const terms = termOptions[loanType] || [36];
    const termOptions_final = [];
    
    for (const termMonths of terms) {
        if (loanType === 'mortgage') {
            // Mortgage terms are in years
            const termYears = termMonths;
            const monthlyRate = interestRate / 100 / 12;
            const numPayments = termYears * 12;
            
            const monthlyPayment = loanAmount * 
                (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                (Math.pow(1 + monthlyRate, numPayments) - 1);
            
            const totalPaid = monthlyPayment * numPayments;
            const totalInterest = totalPaid - loanAmount;
            
            termOptions_final.push({
                termYears: termYears,
                termMonths: numPayments,
                monthlyPayment: Math.round(monthlyPayment * 100) / 100,
                totalPaid: Math.round(totalPaid * 100) / 100,
                totalInterest: Math.round(totalInterest * 100) / 100,
                interestRate: interestRate
            });
        } else if (loanType === 'line-of-credit') {
            // Line of credit - interest only
            const monthlyInterest = (loanAmount * interestRate / 100) / 12;
            
            termOptions_final.push({
                creditLimit: loanAmount,
                interestRate: interestRate,
                minimumMonthlyPayment: Math.round(monthlyInterest * 100) / 100,
                paymentType: 'Interest only (revolving credit)'
            });
        } else {
            // Regular installment loans
            const monthlyRate = interestRate / 100 / 12;
            const numPayments = termMonths;
            
            const monthlyPayment = loanAmount * 
                (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                (Math.pow(1 + monthlyRate, numPayments) - 1);
            
            const totalPaid = monthlyPayment * numPayments;
            const totalInterest = totalPaid - loanAmount;
            
            termOptions_final.push({
                termMonths: termMonths,
                monthlyPayment: Math.round(monthlyPayment * 100) / 100,
                totalPaid: Math.round(totalPaid * 100) / 100,
                totalInterest: Math.round(totalInterest * 100) / 100,
                interestRate: interestRate
            });
        }
    }
    
    return {
        loanAmount: loanAmount,
        interestRate: interestRate,
        options: termOptions_final,
        specialConditions: getSpecialConditions(application)
    };
}

/**
 * Get special conditions based on loan type
 */
function getSpecialConditions(application) {
    const conditions = [
        "No prepayment penalties - pay off your loan early without fees",
        "2 business day cooling-off period to cancel without penalty",
        "Late payment fee: $25 + interest on overdue amount"
    ];
    
    switch (application.loanType) {
        case 'student':
            conditions.push("12-month grace period after graduation");
            conditions.push("Flexible payment options available");
            break;
        case 'mortgage':
            conditions.push("Property appraisal required");
            conditions.push("Mortgage insurance may be required");
            break;
        case 'auto':
            conditions.push("Vehicle serves as collateral");
            conditions.push("Comprehensive insurance required");
            break;
    }
    
    return conditions;
}

module.exports = router;
