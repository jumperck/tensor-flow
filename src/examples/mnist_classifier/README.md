# MNIST Digit Classifier Example

A neural network implementation for classifying handwritten digits from the MNIST dataset.

## Overview

This example demonstrates:
- Data loading and preprocessing from the MNIST dataset
- Neural network architecture design with TensorFlow/Keras
- Model training with validation
- Model evaluation and prediction
- Model persistence (save/load)

## Architecture

- **Input Layer**: 28x28 pixel images (flattened to 784 features)
- **Hidden Layer**: Configurable dense layer with ReLU activation
- **Dropout Layer**: Regularization to prevent overfitting
- **Output Layer**: 10 neurons with softmax activation (for 10 digits)

## Files Structure

```
mnist_classifier/
├── __init__.py
├── config.py           # Configuration settings
├── config_simple.py    # Simplified config without dependencies
├── data/
│   ├── __init__.py
│   └── loader.py       # Data loading and preprocessing
├── models/
│   ├── __init__.py
│   └── classifier.py   # Neural network architecture
├── training/
│   ├── __init__.py
│   └── trainer.py      # Training logic
├── inference/
│   ├── __init__.py
│   └── predictor.py    # Prediction utilities
└── utils/
    ├── __init__.py
    └── logger.py       # Logging utilities
```

## Usage

Run from the project root:

```bash
# Train the model
python -m src.index mnist train

# Train with custom parameters
python -m src.index mnist train --epochs 10 --batch-size 64

# Make predictions
python -m src.index mnist predict

# Show model information
python -m src.index mnist info
```

## Configuration

The example uses a flexible configuration system supporting:

- Environment variables (`.env` file)
- Command-line arguments
- Code-based configuration

Key parameters:
- **epochs**: Number of training iterations
- **batch_size**: Batch size for training
- **learning_rate**: Learning rate for optimization
- **hidden_units**: Number of neurons in hidden layer
- **dropout_rate**: Dropout rate for regularization

## Expected Results

With default settings, you should expect:
- Training accuracy: ~98-99%
- Validation accuracy: ~97-98%
- Training time: 2-5 minutes (depending on hardware)

## Learning Objectives

This example teaches:
1. **Data Pipeline**: Loading and preprocessing image data
2. **Model Design**: Creating neural network architectures
3. **Training Process**: Backpropagation and optimization
4. **Evaluation**: Measuring model performance
5. **Configuration**: Managing hyperparameters
6. **Logging**: Monitoring training progress
