const tf = require('@tensorflow/tfjs-node-gpu');
const fs = require('fs');
const path = require('path');

class LoanDecisionModel {
    constructor() {
        this.model = null;
        this.isLoaded = false;
        this.modelPath = path.join(__dirname, '../../models/loan_decision_model');
        this.scaler = null;
        this.featureNames = [
            'age', 'creditScore', 'annualIncome', 'loanAmount', 'loanTypeEncoded',
            'employmentYears', 'debtToIncomeRatio', 'hasCollateral', 'provinceRiskEncoded',
            'educationLevelEncoded', 'ageRisk', 'incomeToLoanRatio', 'creditRisk'
        ];
        
        // Initialize TensorFlow backend
        this.initializeTensorFlow();
    }

    /**
     * Initialize TensorFlow and check GPU availability
     */
    async initializeTensorFlow() {
        try {
            console.log('🔧 Initializing TensorFlow.js with GPU support...');
            
            // Force CPU backend if GPU not available
            if (tf.getBackend() !== 'tensorflow') {
                console.log('⚠️  GPU not available, using CPU backend with TensorFlow.js');
            } else {
                console.log('🚀 Using TensorFlow backend (GPU acceleration available)');
            }
            
            console.log('✅ TensorFlow.js initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing TensorFlow.js:', error);
            throw error;
        }
    }

    /**
     * Prepare features from loan application data
     */
    prepareFeatures(applicationData) {
        const {
            age,
            creditScore,
            annualIncome,
            loanAmount,
            loanType,
            employmentYears,
            debtToIncomeRatio,
            hasCollateral,
            province,
            educationLevel
        } = applicationData;

        // Convert categorical variables to numerical
        const loanTypeMapping = {
            'personal-unsecured': 0,
            'personal-secured': 1,
            'mortgage': 2,
            'auto': 3,
            'student': 4,
            'line-of-credit': 5
        };

        const provinceRiskMapping = {
            'ON': 0, 'QC': 1, 'BC': 2, 'AB': 3, 'MB': 1, 'SK': 1,
            'NS': 2, 'NB': 2, 'NL': 3, 'PE': 2, 'NT': 3, 'YT': 3, 'NU': 3
        };

        const educationMapping = {
            'high-school': 0,
            'college': 1,
            'bachelor': 2,
            'master': 3,
            'phd': 4
        };

        // Calculate additional risk factors
        const ageRisk = age < 25 ? 2 : age > 65 ? 1 : 0;
        const incomeToLoanRatio = Math.min(annualIncome / loanAmount, 10); // Cap at 10
        const creditRisk = creditScore < 650 ? 2 : creditScore < 750 ? 1 : 0;

        return [
            age / 100.0,  // Normalize age
            creditScore / 1000.0,  // Normalize credit score
            Math.log(annualIncome + 1) / 15.0,  // Log-normalize income
            Math.log(loanAmount + 1) / 15.0,    // Log-normalize loan amount
            loanTypeMapping[loanType] || 0,
            employmentYears / 20.0,  // Normalize employment years
            debtToIncomeRatio,
            hasCollateral ? 1.0 : 0.0,
            provinceRiskMapping[province] !== undefined ? provinceRiskMapping[province] : 1,
            educationMapping[educationLevel] !== undefined ? educationMapping[educationLevel] : 1,
            ageRisk / 2.0,
            Math.min(incomeToLoanRatio / 5.0, 1.0),  // Normalize ratio
            creditRisk / 2.0
        ];
    }

    /**
     * Create the neural network model
     */
    createModel() {
        console.log('🧠 Creating neural network model...');
        
        const model = tf.sequential({
            layers: [
                // Input layer
                tf.layers.dense({
                    inputShape: [13],
                    units: 128,
                    activation: 'relu',
                    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
                }),
                tf.layers.dropout({ rate: 0.3 }),
                
                // Hidden layers
                tf.layers.dense({
                    units: 64,
                    activation: 'relu',
                    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
                }),
                tf.layers.dropout({ rate: 0.2 }),
                
                tf.layers.dense({
                    units: 32,
                    activation: 'relu',
                    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
                }),
                tf.layers.dropout({ rate: 0.1 }),
                
                // Output layer (binary classification)
                tf.layers.dense({
                    units: 1,
                    activation: 'sigmoid'
                })
            ]
        });

        // Compile the model
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });

        console.log('✅ Model created successfully');
        model.summary();
        
        return model;
    }

    /**
     * Train the model with synthetic data
     */
    async train(epochs = 100, batchSize = 32) {
        console.log('Starting loan decision model training...');
        
        // Use fewer epochs for testing
        const actualEpochs = process.env.NODE_ENV === 'test' ? Math.min(epochs, 5) : epochs;
        
        const { features, labels } = this.generateTrainingData();
        
        console.log(`Training with ${actualEpochs} epochs and batch size ${batchSize}...`);
        
        await this.model.fit(features, labels, {
            epochs: actualEpochs,
            batchSize: batchSize,
            verbose: 1,
            validationSplit: 0.2,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(`Epoch ${epoch + 1}/${actualEpochs} - Loss: ${logs.loss.toFixed(4)}, Accuracy: ${logs.acc.toFixed(4)}`);
                }
            }
        });
        
        console.log('Model training completed successfully!');
        
        // Save the trained model
        await this.saveModel();
    }

    /**
     * Load trained model
     */
    async loadModel() {
        try {
            const modelUrl = `file://${this.modelPath}/model.json`;
            
            if (fs.existsSync(path.join(this.modelPath, 'model.json'))) {
                console.log('📥 Loading trained model from disk...');
                this.model = await tf.loadLayersModel(modelUrl);
                this.isLoaded = true;
                console.log('✅ Model loaded successfully!');
                return true;
            } else {
                console.log('🚫 No trained model found. Please train the model first.');
                return false;
            }
        } catch (error) {
            console.error('❌ Error loading model:', error);
            return false;
        }
    }

    /**
     * Save trained model
     */
    async saveModel() {
        try {
            if (!fs.existsSync(this.modelPath)) {
                fs.mkdirSync(this.modelPath, { recursive: true });
            }
            
            const saveUrl = `file://${this.modelPath}`;
            await this.model.save(saveUrl);
            console.log('💾 Model saved successfully!');
        } catch (error) {
            console.error('❌ Error saving model:', error);
        }
    }

    /**
     * Make loan decision prediction using GPU
     */
    async predict(applicationData) {
        if (!this.isLoaded || !this.model) {
            throw new Error('Model not loaded. Please load or train the model first.');
        }

        try {
            const features = this.prepareFeatures(applicationData);
            
            // Create tensor and run prediction on GPU
            const inputTensor = tf.tensor2d([features]);
            const prediction = await this.model.predict(inputTensor);
            
            // Get prediction values
            const predictionData = await prediction.data();
            const probability = predictionData[0];
            const approved = probability > 0.5;
            const confidence = Math.round(Math.max(probability, 1 - probability) * 100);
            
            // Clean up tensors
            inputTensor.dispose();
            prediction.dispose();
            
            // Determine interest rate based on risk factors
            const interestRate = approved ? this.calculateInterestRate(applicationData, approved, probability) : null;
            
            // Generate explanation
            const explanation = this.generateExplanation(applicationData, approved, probability);

            return {
                approved,
                confidence,
                interestRate,
                explanation,
                riskScore: Math.round((1 - probability) * 100),
                probability: Math.round(probability * 100),
                features: features
            };
        } catch (error) {
            console.error('❌ Error during prediction:', error);
            throw error;
        }
    }

    /**
     * Calculate interest rate based on loan type and risk factors
     */
    calculateInterestRate(applicationData, approved, probability) {
        if (!approved) return null;

        const { loanType, creditScore, hasCollateral } = applicationData;
        
        // Base rates according to Maple Finance policies
        const baseRates = {
            'personal-unsecured': { min: 8, max: 19 },
            'personal-secured': { min: 6, max: 12 },
            'mortgage': { min: 5.5, max: 9 },
            'auto': { min: 7, max: 15 },
            'student': { min: 6, max: 12 },
            'line-of-credit': { min: 10, max: 15 }
        };

        const rates = baseRates[loanType] || baseRates['personal-unsecured'];
        
        // Risk adjustment based on ML probability
        let riskMultiplier = 1 - probability; // Higher probability = lower risk
        
        // Credit score adjustment
        if (creditScore >= 750) riskMultiplier *= 0.7;
        else if (creditScore >= 700) riskMultiplier *= 0.85;
        else if (creditScore < 600) riskMultiplier *= 1.3;
        
        // Collateral adjustment
        if (hasCollateral) riskMultiplier *= 0.8;
        
        const interestRate = rates.min + (rates.max - rates.min) * riskMultiplier;
        return Math.min(Math.max(interestRate, rates.min), rates.max);
    }

    /**
     * Generate human-readable explanation for the decision
     */
    generateExplanation(applicationData, approved, probability) {
        const reasons = [];
        const confidence = probability > 0.5 ? probability : 1 - probability;
        
        if (approved) {
            reasons.push("✅ AI model recommends approval based on risk analysis");
            
            if (confidence > 0.8) {
                reasons.push("✅ High confidence prediction (strong approval indicators)");
            }
            
            if (applicationData.creditScore >= 700) {
                reasons.push("✅ Strong credit score demonstrates financial responsibility");
            }
            
            if (applicationData.debtToIncomeRatio <= 0.3) {
                reasons.push("✅ Healthy debt-to-income ratio");
            }
            
            if (applicationData.employmentYears >= 2) {
                reasons.push("✅ Stable employment history");
            }
            
            if (applicationData.hasCollateral) {
                reasons.push("✅ Collateral reduces lending risk");
            }
        } else {
            reasons.push("❌ AI model recommends decline based on risk analysis");
            
            if (confidence > 0.8) {
                reasons.push("❌ High confidence prediction (multiple risk factors)");
            }
            
            if (applicationData.creditScore < 600 && applicationData.loanType === 'personal-unsecured') {
                reasons.push("❌ Credit score below minimum requirement for unsecured loans");
            }
            
            if (applicationData.debtToIncomeRatio > 0.45) {
                reasons.push("❌ Debt-to-income ratio exceeds safe lending limits");
            }
            
            if (applicationData.annualIncome / applicationData.loanAmount < 2) {
                reasons.push("❌ Loan amount high relative to income");
            }
            
            const minAge = ['BC', 'NS', 'NB', 'NL'].includes(applicationData.province) ? 19 : 18;
            if (applicationData.age < minAge) {
                reasons.push("❌ Does not meet minimum age requirements");
            }
        }
        
        return reasons;
    }

    /**
     * Generate synthetic training data with realistic patterns
     */
    generateTrainingData(numSamples = 1000) {
        const data = [];
        const loanTypes = ['personal-unsecured', 'personal-secured', 'mortgage', 'auto', 'student', 'line-of-credit'];
        const provinces = ['ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'YT', 'NU'];
        const educationLevels = ['high-school', 'college', 'bachelor', 'master', 'phd'];

        for (let i = 0; i < numSamples; i++) {
            // Generate realistic but varied data
            const age = Math.floor(Math.random() * 50) + 18;
            const creditScore = Math.floor(Math.random() * 400) + 450;
            const annualIncome = Math.exp(Math.random() * 2 + 10) * 1000; // Log-normal distribution
            const loanType = loanTypes[Math.floor(Math.random() * loanTypes.length)];
            const employmentYears = Math.min(age - 16, Math.floor(Math.random() * 15));
            const debtToIncomeRatio = Math.random() * 0.7;
            const hasCollateral = Math.random() > 0.6;
            const province = provinces[Math.floor(Math.random() * provinces.length)];
            const educationLevel = educationLevels[Math.floor(Math.random() * educationLevels.length)];
            
            // Loan amount based on type and income
            let loanAmount;
            switch (loanType) {
                case 'personal-unsecured':
                case 'personal-secured':
                    loanAmount = Math.min(Math.floor(Math.random() * 49000) + 1000, annualIncome * 0.6);
                    break;
                case 'mortgage':
                    loanAmount = Math.min(Math.floor(Math.random() * 450000) + 50000, annualIncome * 5);
                    break;
                case 'auto':
                    loanAmount = Math.min(Math.floor(Math.random() * 75000) + 5000, annualIncome * 0.8);
                    break;
                case 'student':
                    loanAmount = Math.floor(Math.random() * 19000) + 1000;
                    break;
                case 'line-of-credit':
                    loanAmount = Math.min(Math.floor(Math.random() * 28000) + 2000, annualIncome * 0.4);
                    break;
            }

            const applicationData = {
                age, creditScore, annualIncome, loanAmount, loanType,
                employmentYears, debtToIncomeRatio, hasCollateral, province, educationLevel
            };

            const features = this.prepareFeatures(applicationData);
            
            // Determine approval using realistic business logic
            let approvalScore = 0.5; // Base probability
            
            // Age factors
            if (age < 18 || (age < 19 && ['BC', 'NS', 'NB', 'NL'].includes(province))) {
                approvalScore = 0; // Automatic decline
            } else if (age >= 25 && age <= 55) {
                approvalScore += 0.1;
            }
            
            // Credit score factors
            if (creditScore >= 750) approvalScore += 0.3;
            else if (creditScore >= 700) approvalScore += 0.2;
            else if (creditScore >= 650) approvalScore += 0.1;
            else if (creditScore < 600 && loanType === 'personal-unsecured') approvalScore -= 0.4;
            else if (creditScore < 550) approvalScore -= 0.3;
            
            // Income factors
            const incomeToLoanRatio = annualIncome / loanAmount;
            if (incomeToLoanRatio >= 5) approvalScore += 0.2;
            else if (incomeToLoanRatio >= 3) approvalScore += 0.1;
            else if (incomeToLoanRatio < 1.5) approvalScore -= 0.3;
            
            // Debt-to-income factors
            if (debtToIncomeRatio <= 0.2) approvalScore += 0.15;
            else if (debtToIncomeRatio <= 0.35) approvalScore += 0.05;
            else if (debtToIncomeRatio > 0.5) approvalScore -= 0.2;
            else if (debtToIncomeRatio > 0.6) approvalScore -= 0.4;
            
            // Employment factors
            if (employmentYears >= 5) approvalScore += 0.1;
            else if (employmentYears >= 2) approvalScore += 0.05;
            else if (employmentYears < 0.5) approvalScore -= 0.1;
            
            // Collateral factors
            if (hasCollateral) approvalScore += 0.15;
            
            // Education factors
            if (educationLevel === 'phd' || educationLevel === 'master') approvalScore += 0.05;
            
            // Add some randomness
            approvalScore += (Math.random() - 0.5) * 0.1;
            
            // Ensure bounds
            approvalScore = Math.max(0, Math.min(1, approvalScore));
            
            const approved = approvalScore > 0.5;

            data.push({ features, approved, applicationData, approvalScore });
        }

        // Prepare tensors for training
        const featureArrays = data.map(item => item.features);
        const labelArray = data.map(item => item.approved ? 1 : 0);

        const features = tf.tensor2d(featureArrays);
        const labels = tf.tensor2d(labelArray, [labelArray.length, 1]);

        return {
            features,
            labels,
            rawData: data
        };
    }

    /**
     * Get model summary and GPU usage info
     */
    getModelInfo() {
        const info = {
            isLoaded: this.isLoaded,
            modelPath: this.modelPath,
            featureCount: this.featureNames.length,
            featureNames: this.featureNames,
            backend: tf.getBackend(),
            gpuAvailable: tf.getBackend() === 'webgl' || tf.getBackend().includes('gpu'),
            memoryInfo: tf.memory()
        };
        
        if (this.model) {
            info.modelParams = this.model.countParams();
            info.modelLayers = this.model.layers.length;
        }
        
        return info;
    }

    /**
     * Clean up resources
     */
    dispose() {
        if (this.model) {
            this.model.dispose();
            this.model = null;
        }
        this.isLoaded = false;
    }
}

module.exports = LoanDecisionModel;
