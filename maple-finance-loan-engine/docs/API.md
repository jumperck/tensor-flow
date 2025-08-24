# Maple Finance Loan Decision Engine

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
Currently, no authentication is required for demo purposes. In production, implement JWT tokens or API keys.

## Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "Maple Finance Loan Decision Engine",
  "version": "1.0.0",
  "timestamp": "2025-01-20T15:30:45.123Z",
  "modelLoaded": true
}
```

### Submit Loan Application
```http
POST /api/loans/apply
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "age": 35,
  "province": "ON",
  "citizenship": "citizen",
  "educationLevel": "bachelor",
  "annualIncome": 75000,
  "creditScore": 720,
  "employmentYears": 8,
  "debtToIncomeRatio": 0.25,
  "loanAmount": 20000,
  "loanType": "personal-secured",
  "hasCollateral": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "applicationId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "submitted",
  "nextSteps": "Your application will be processed using our ML-powered decision engine..."
}
```

### Get Loan Decision
```http
POST /api/loans/{applicationId}/decision
```

**Response (Approved):**
```json
{
  "success": true,
  "decision": {
    "applicationId": "550e8400-e29b-41d4-a716-446655440000",
    "approved": true,
    "interestRate": 8.5,
    "confidence": 87,
    "riskScore": 13,
    "explanation": [
      "✅ Application meets Maple Finance lending criteria",
      "✅ Strong credit score demonstrates financial responsibility",
      "✅ Healthy debt-to-income ratio",
      "✅ Stable employment history",
      "✅ Collateral reduces lending risk"
    ],
    "decidedAt": "2025-01-20T15:31:15.456Z",
    "loanTerms": {
      "loanAmount": 20000,
      "interestRate": 8.5,
      "options": [
        {
          "termMonths": 24,
          "monthlyPayment": 904.55,
          "totalPaid": 21709.20,
          "totalInterest": 1709.20,
          "interestRate": 8.5
        },
        {
          "termMonths": 36,
          "monthlyPayment": 631.35,
          "totalPaid": 22728.60,
          "totalInterest": 2728.60,
          "interestRate": 8.5
        }
      ],
      "specialConditions": [
        "No prepayment penalties - pay off your loan early without fees",
        "2 business day cooling-off period to cancel without penalty",
        "Late payment fee: $25 + interest on overdue amount"
      ]
    }
  }
}
```

**Response (Declined):**
```json
{
  "success": true,
  "decision": {
    "applicationId": "550e8400-e29b-41d4-a716-446655440000",
    "approved": false,
    "interestRate": null,
    "confidence": 92,
    "riskScore": 8,
    "explanation": [
      "❌ Application does not meet current lending criteria",
      "❌ Credit score below minimum requirement (600) for unsecured loans",
      "❌ Debt-to-income ratio exceeds safe lending limits"
    ],
    "decidedAt": "2025-01-20T15:31:15.456Z",
    "loanTerms": null
  }
}
```

### Get Application Status
```http
GET /api/loans/{applicationId}
```

**Response:**
```json
{
  "success": true,
  "application": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "loanType": "personal-secured",
    "loanAmount": 20000,
    "status": "approved",
    "submittedAt": "2025-01-20T15:30:45.123Z",
    "decidedAt": "2025-01-20T15:31:15.456Z",
    "creditScoreProvided": true,
    "incomeVerified": true
  }
}
```

### List All Applications
```http
GET /api/loans
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "applications": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "lastName": "Doe",
      "loanType": "personal-secured",
      "loanAmount": 20000,
      "status": "approved",
      "submittedAt": "2025-01-20T15:30:45.123Z",
      "decidedAt": "2025-01-20T15:31:15.456Z"
    }
  ]
}
```

## Loan Types & Limits

| Loan Type | Minimum | Maximum | Credit Score Requirement |
|-----------|---------|---------|-------------------------|
| Personal (Unsecured) | $1,000 | $50,000 | 600+ |
| Personal (Secured) | $1,000 | $50,000 | No minimum |
| Mortgage | $50,000 | $2,000,000 | No minimum |
| Auto Loan | $5,000 | $80,000 | No minimum |
| Student Support | $1,000 | $20,000 | No minimum |
| Line of Credit | $2,000 | $30,000 | 600+ |

## Interest Rate Ranges

| Loan Type | Interest Rate Range |
|-----------|-------------------|
| Personal (Unsecured) | 8% - 19% APR |
| Personal (Secured) | 6% - 12% APR |
| Mortgage | 5.5% - 9% APR |
| Auto Loan | 7% - 15% APR |
| Student Support | 6% - 12% APR |
| Line of Credit | Prime + 4% |

## Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Validation Error | Invalid input data |
| 404 | Not Found | Application not found |
| 500 | Internal Error | Server error |
| 503 | Service Unavailable | ML model not loaded |

## Rate Limiting

- Production: 100 requests per minute per IP
- Development: No limits

## Canadian Compliance

All loans comply with:
- Criminal Code of Canada (Section 347)
- Provincial lending regulations
- Maximum 60% annual interest rate (never exceeded)
- Age requirements (18+ or 19+ depending on province)

## Data Privacy

- Personal information is encrypted
- PCI compliance for payment data
- PIPEDA compliance for privacy
- Data retention according to Canadian law
