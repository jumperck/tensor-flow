# MNIST Digit Classifier

A modern, well-structured machine learning project for training and deploying a neural network to classify handwritten digits using the MNIST dataset.

## 🚀 Features

- **Modern Architecture**: Built with TensorFlow 2.15+ and modern Python best practices
- **Configurable**: Flexible configuration system using Pydantic
- **CLI Interface**: Easy-to-use command-line interface with Click
- **Comprehensive Logging**: Structured logging throughout the application
- **Model Persistence**: Save and load trained models
- **Batch Inference**: Support for both single and batch predictions
- **Testing Suite**: Comprehensive unit tests with pytest
- **Docker Support**: Containerized deployment ready

## 📁 Project Structure

```
tensor-flow/
├── src/
│   ├── __init__.py
│   ├── index.py              # Main CLI interface
│   ├── config.py             # Configuration management
│   ├── data/
│   │   ├── __init__.py
│   │   └── loader.py         # Data loading and preprocessing
│   ├── models/
│   │   ├── __init__.py
│   │   └── classifier.py     # Model architecture
│   ├── training/
│   │   ├── __init__.py
│   │   └── trainer.py        # Training logic
│   ├── inference/
│   │   ├── __init__.py
│   │   └── predictor.py      # Inference utilities
│   └── utils/
│       ├── __init__.py
│       └── logger.py         # Logging utilities
├── tests/
│   ├── __init__.py
│   └── test_mnist_classifier.py
├── requirements.txt          # Production dependencies
├── requirements-dev.txt      # Development dependencies
├── pyproject.toml           # Project configuration
├── scripts.py               # Development scripts
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
├── docker-compose.yml      # Docker configuration
└── README.md               # This file
```

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/KaueReinbold/tensor-flow.git
cd tensor-flow
```

### 2. Create a virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
# Production dependencies
pip install -r requirements.txt

# Development dependencies (optional)
pip install -r requirements-dev.txt
```

## 🎯 Quick Start

### Training a Model
```bash
# Basic training with default parameters
python -m src.index train

# Custom training parameters
python -m src.index train --epochs 10 --batch-size 64 --learning-rate 0.001
```

### Making Predictions
```bash
# Predict on 5 random test samples
python -m src.index predict

# Predict on 10 samples with custom model
python -m src.index predict --model-path models/my_model.h5 --num-samples 10
```

### Model Information
```bash
# Show model architecture and details
python -m src.index info
```

### CLI Help
```bash
# Show available commands
python -m src.index --help

# Show help for specific command
python -m src.index train --help
```

## ⚙️ Configuration

The project uses a flexible configuration system. You can modify settings in several ways:

### 1. Environment Variables (.env file)
```env
EPOCHS=10
BATCH_SIZE=64
LEARNING_RATE=0.001
MODEL_SAVE_PATH=models/custom_model.h5
```

### 2. Command Line Arguments
```bash
python -m src.index train --epochs 15 --batch-size 128
```

### 3. Code Configuration (src/config.py)
Modify the default values in the configuration classes.

## 🧪 Testing

### Run Tests
```bash
# Run all tests
python scripts.py test

# Or using pytest directly
pytest tests/ -v
```

### Code Quality
```bash
# Format code
python scripts.py format

# Lint code
python scripts.py lint
```

## 📊 Model Architecture

The default model architecture:
- **Input Layer**: Flatten layer for 28x28 images
- **Hidden Layer**: Dense layer with 128 neurons (ReLU activation)
- **Dropout Layer**: 20% dropout for regularization
- **Output Layer**: Dense layer with 10 neurons (softmax activation)

**Total Parameters**: ~101,770 trainable parameters

## 🐳 Docker Usage

### Build and Run with Docker Compose
```bash
# Build and start the container
docker-compose up --build

# Run training
docker-compose exec app python -m src.index train

# Run predictions
docker-compose exec app python -m src.index predict
```

## 📈 Performance

Typical performance on MNIST dataset:
- **Training Accuracy**: ~99%
- **Test Accuracy**: ~97-98%
- **Training Time**: ~2-3 minutes (CPU)
- **Inference Speed**: ~1ms per sample

## 🤝 Development

### Development Scripts
```bash
# Install development dependencies
python scripts.py install-dev

# Run tests
python scripts.py test

# Format code
python scripts.py format

# Lint code
python scripts.py lint

# Clean up generated files
python scripts.py clean

# Train model
python scripts.py train

# Run predictions
python scripts.py predict
```

### Adding New Features

1. **Data Processing**: Add new preprocessing steps in `src/data/loader.py`
2. **Model Architecture**: Modify or create new models in `src/models/`
3. **Training Logic**: Extend training functionality in `src/training/trainer.py`
4. **CLI Commands**: Add new commands in `src/index.py`

## 📚 API Reference

### Configuration Classes
- `Config`: Main configuration class
- `ModelConfig`: Model architecture settings
- `TrainingConfig`: Training parameters
- `DataConfig`: Data processing settings

### Core Classes
- `DataLoader`: Handles data loading and preprocessing
- `MNISTClassifier`: Model architecture and compilation
- `Trainer`: Training logic and evaluation
- `MNISTPredictor`: Inference and prediction utilities

## 🐛 Troubleshooting

### Common Issues

1. **TensorFlow Import Error**
   ```bash
   pip uninstall tensorflow
   pip install tensorflow>=2.15.0
   ```

2. **CUDA/GPU Issues**
   ```bash
   # For GPU support
   pip install tensorflow[and-cuda]
   ```

3. **Memory Issues**
   - Reduce batch size in configuration
   - Use validation split to reduce memory usage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- TensorFlow team for the excellent deep learning framework
- MNIST dataset creators for the benchmark dataset
- Open source community for the tools and libraries used

## 📞 Contact

**Kaue Reinbold**
- GitHub: [@KaueReinbold](https://github.com/KaueReinbold)
- Email: your.email@example.com

---

⭐ **Star this repository if you find it helpful!**