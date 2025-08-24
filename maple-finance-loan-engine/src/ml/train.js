const LoanDecisionModel = require('./model');

async function trainModel() {
    console.log('🍁 Maple Finance Inc. - GPU-Accelerated Loan Decision Model Training');
    console.log('Helping Canadians borrow smarter since 2025\n');
    
    try {
        const model = new LoanDecisionModel();
        
        console.log('📊 Model Information:');
        const info = model.getModelInfo();
        console.log(`Backend: ${info.backend}`);
        console.log(`GPU Available: ${info.gpuAvailable ? '✅ Yes' : '❌ No'}`);
        console.log(`Features: ${info.featureCount}`);
        console.log(`Memory Info:`, info.memoryInfo);
        console.log('');
        
        // Train the model with GPU acceleration
        await model.train(100, 64); // 100 epochs, batch size 64
        
        console.log('\n🎯 Training completed successfully!');
        
        // Display final model info
        const finalInfo = model.getModelInfo();
        console.log('� Final Model Statistics:');
        console.log(`Model Parameters: ${finalInfo.modelParams?.toLocaleString()}`);
        console.log(`Model Layers: ${finalInfo.modelLayers}`);
        console.log(`Memory Usage:`, finalInfo.memoryInfo);
        
        console.log('\n🚀 Server ready! You can now start with: npm start');
        
        // Clean up
        model.dispose();
        
    } catch (error) {
        console.error('❌ Error during model training:', error);
        process.exit(1);
    }
}

// Run training if this file is executed directly
if (require.main === module) {
    trainModel();
}

module.exports = { trainModel };
