# TensorFlow Learning Examples

A collection of isolated TensorFlow learning projects for exploring different machine learning concepts and techniques.

## 🚀 Features

- **Multiple Examples**: Various isolated learning projects
- **Modern Architecture**: Built with TensorFlow 2.15+ and modern Python best practices
- **Configurable**: Flexible configuration system using Pydantic
- **CLI Interface**: Easy-to-use command-line interface with Click
- **Comprehensive Logging**: Structured logging throughout the application
- **Model Persistence**: Save and load trained models
- **Testing Suite**: Comprehensive unit tests with pytest
- **Docker Support**: Containerized deployment ready

## 📁 Project Structure

```
tensor-flow/
├── src/
│   ├── __init__.py
│   ├── index.py              # Main CLI interface
│   ├── shared/               # Shared utilities
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── logger.py     # Logging utilities
│   └── examples/             # Learning examples
│       ├── __init__.py
│       ├── _template/        # Template for new examples
│       └── mnist_classifier/ # MNIST digit classification
│           ├── __init__.py
│           ├── README.md
│           ├── config.py     # Configuration management
│           ├── data/
│           │   ├── __init__.py
│           │   └── loader.py # Data loading and preprocessing
│           ├── models/
│           │   ├── __init__.py
│           │   └── classifier.py # Model architecture
│           ├── training/
│           │   ├── __init__.py
│           │   └── trainer.py # Training logic
│           └── inference/
│               ├── __init__.py
│               └── predictor.py # Inference utilities
├── tests/
│   ├── __init__.py
│   └── test_mnist_classifier.py
├── models/                   # Saved models directory
├── logs/                     # Logs directory
├── requirements.txt          # Production dependencies
├── requirements-dev.txt      # Development dependencies
├── pyproject.toml           # Project configuration
├── scripts.py               # Development scripts
├── docker-compose.yml       # Docker configuration
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

### List Available Examples
```bash
# See all available learning examples
python -m src.index list-examples
```

### MNIST Digit Classification
```bash
# Train the MNIST classifier
python -m src.index mnist train

# Custom training parameters
python -m src.index mnist train --epochs 10 --batch-size 64 --learning-rate 0.001

# Make predictions
python -m src.index mnist predict

# Show model information
python -m src.index mnist info
```

### CLI Help
```bash
# Show available commands
python -m src.index --help

# Show help for MNIST example
python -m src.index mnist --help
```

## 📚 Available Examples

### 1. MNIST Digit Classification (`mnist`)
- **Description**: Neural network for handwritten digit recognition
- **Dataset**: MNIST (70,000 images of digits 0-9)
- **Architecture**: Dense neural network with dropout
- **Commands**: `train`, `predict`, `info`
- **Learning Focus**: Basic neural networks, image classification

### Adding New Examples

1. Use the template in `src/examples/_template/`
2. Follow the established structure
3. Add CLI commands to `src/index.py`
4. Include comprehensive documentation

## ⚙️ Configuration

Each example uses a flexible configuration system. You can modify settings in several ways:

### 1. Environment Variables (.env file)
```env
# MNIST Example
EPOCHS=10
BATCH_SIZE=64
LEARNING_RATE=0.001
MODEL_SAVE_PATH=models/mnist_model.h5
```

### 2. Command Line Arguments
```bash
python -m src.index mnist train --epochs 15 --batch-size 128
```

### 3. Code Configuration
Modify the default values in each example's `config.py` file.

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

# Train MNIST model
python scripts.py train

# Run MNIST predictions
python scripts.py predict
```

### Adding New Examples

1. **Create Structure**: Copy the template from `src/examples/_template/`
2. **Implement Logic**: Add your specific machine learning logic
3. **Add CLI Commands**: Extend the main CLI in `src/index.py`
4. **Update Configuration**: Customize `config.py` for your needs
5. **Write Documentation**: Include learning objectives and usage
6. **Add Tests**: Include unit tests in the `tests/` directory

### Project Guidelines

- **Isolation**: Each example should be self-contained
- **Shared Resources**: Use `src.shared` for common utilities
- **Documentation**: Clear explanations and learning objectives
- **Configuration**: Flexible and well-documented settings

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