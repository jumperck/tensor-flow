const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');

const loanRoutes = require('./routes/loans');
const LoanDecisionModel = require('../ml/model');

const app = express();
const PORT = process.env.PORT || 3000;

// Global model instance
let globalModel = null;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize ML model
async function initializeModel() {
    console.log('Initializing Maple Finance Loan Decision Engine...');
    
    globalModel = new LoanDecisionModel();
    const modelLoaded = await globalModel.loadModel();
    
    if (!modelLoaded) {
        console.log('Training new model...');
        await globalModel.train();
    }
    
    console.log('✅ ML model ready for predictions');
}

// Make model available to routes
app.use((req, res, next) => {
    req.model = globalModel;
    next();
});

// Routes
app.use('/api/loans', loanRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Maple Finance Loan Decision Engine',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        modelLoaded: globalModel && globalModel.isLoaded
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: '🍁 Maple Finance Inc. - Loan Decision Engine',
        tagline: 'Helping Canadians borrow smarter since 2025',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            loans: '/api/loans',
            apply: '/api/loans/apply',
            decision: '/api/loans/:id/decision'
        },
        documentation: 'See README.md for full API documentation'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `The requested endpoint ${req.path} does not exist`,
        availableEndpoints: ['/', '/health', '/api/loans']
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your request',
        timestamp: new Date().toISOString()
    });
});

// Start server
async function startServer() {
    try {
        await initializeModel();
        
        app.listen(PORT, () => {
            console.log('\n🍁 Maple Finance Inc. - Loan Decision Engine');
            console.log('Helping Canadians borrow smarter since 2025');
            console.log('='.repeat(50));
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`🎯 API docs: http://localhost:${PORT}/`);
            console.log('='.repeat(50));
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down Maple Finance server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down Maple Finance server...');
    process.exit(0);
});

if (require.main === module) {
    startServer();
}

module.exports = app;
