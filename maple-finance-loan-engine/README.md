# Maple Finance Loan Decision Engine

**Helping Canadians borrow smarter since 2025**

A comprehensive loan decision engine built with Node.js, featuring machine learning-powered approval decisions, REST API, and web client interface.

## Features

- **Machine Learning Model**: Random Forest classifier for loan approval decisions
- **REST API Server**: Express.js server with comprehensive loan evaluation endpoints  
- **Web Client**: Interactive dashboard for loan applications and decisions
- **Canadian Compliance**: Follows all Canadian lending regulations and policies

## Project Structure

```
maple-finance-loan-engine/
├── src/
│   ├── ml/                 # Machine Learning components
│   │   ├── train.js        # Model training script
│   │   ├── model.js        # ML model class
│   │   └── data/           # Training data
│   ├── server/             # Express.js API server
│   │   ├── app.js          # Main server application
│   │   ├── routes/         # API route handlers
│   │   └── middleware/     # Custom middleware
│   └── utils/              # Shared utilities
├── client/                 # Web client interface
├── models/                 # Trained ML models
├── tests/                  # Unit tests
└── docs/                   # Documentation
```

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Train the Machine Learning Model**
   ```bash
   npm run train
   ```

3. **Start the API Server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

4. **Launch the Web Client**
   ```bash
   npm run client
   ```

5. **Access the Application**
   - API Server: http://localhost:3000
   - Web Client: http://localhost:3001

## API Endpoints

### Loan Application
- `POST /api/loans/apply` - Submit new loan application
- `GET /api/loans/:id` - Get loan application status
- `POST /api/loans/:id/decision` - Get ML-powered loan decision

### Loan Types Supported

- **Personal Loans**: $1,000 – $50,000 (secured/unsecured)
- **Mortgages**: Starting from $50,000 (up to 80% property value)
- **Auto Loans**: $5,000 – $80,000 (vehicle collateral)
- **Student Support**: Up to $20,000 (flexible grace period)
- **Line of Credit**: $2,000 – $30,000 (revolving credit)

## Loan Policies

- Minimum age: 18+ (19 in BC, NS, NB, NL)
- Canadian citizenship/residency required
- Minimum credit score: 600 (unsecured loans)
- Interest rates: 6% – 19% based on risk profile
- Full regulatory compliance with Criminal Code Section 347

## Technology Stack

- **Backend**: Node.js, Express.js
- **Machine Learning**: ml-random-forest, ml-regression
- **Frontend**: HTML5, CSS3, JavaScript
- **Testing**: Jest
- **Development**: Nodemon

## License

MIT License - Maple Finance Inc.
