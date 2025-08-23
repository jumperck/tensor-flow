"""Test suite for MNIST classifier."""

import pytest
import numpy as np
import tensorflow as tf
from unittest.mock import patch, MagicMock

from src.config import Config
from src.models.classifier import MNISTClassifier
from src.data.loader import DataLoader
from src.training.trainer import Trainer
from src.inference.predictor import MNISTPredictor


@pytest.fixture
def config():
    """Test configuration fixture."""
    return Config()


@pytest.fixture
def sample_data():
    """Sample MNIST-like data for testing."""
    x_train = np.random.random((100, 28, 28)).astype('float32')
    y_train = np.random.randint(0, 10, 100)
    x_test = np.random.random((20, 28, 28)).astype('float32')
    y_test = np.random.randint(0, 10, 20)
    return (x_train, y_train), (x_test, y_test)


class TestConfig:
    """Test configuration management."""
    
    def test_config_creation(self, config):
        """Test that configuration is created correctly."""
        assert config.model.input_shape == (28, 28)
        assert config.model.num_classes == 10
        assert config.training.epochs > 0
        assert config.training.batch_size > 0
    
    def test_config_validation(self):
        """Test configuration validation."""
        config = Config()
        config.training.epochs = 10
        assert config.training.epochs == 10


class TestDataLoader:
    """Test data loading and preprocessing."""
    
    def test_data_loader_creation(self, config):
        """Test data loader initialization."""
        loader = DataLoader(config)
        assert loader.config == config
    
    @patch('tensorflow.keras.datasets.mnist.load_data')
    def test_load_data(self, mock_load, config, sample_data):
        """Test data loading."""
        mock_load.return_value = sample_data
        
        loader = DataLoader(config)
        (x_train, y_train), (x_test, y_test) = loader.load_data()
        
        assert x_train.shape == (100, 28, 28)
        assert y_train.shape == (100,)
        mock_load.assert_called_once()
    
    def test_preprocess_data(self, config, sample_data):
        """Test data preprocessing."""
        (x_train, y_train), (x_test, y_test) = sample_data
        
        loader = DataLoader(config)
        (x_train_proc, y_train_proc), (x_test_proc, y_test_proc) = loader.preprocess_data(
            x_train, y_train, x_test, y_test
        )
        
        assert x_train_proc.max() <= 1.0
        assert x_train_proc.min() >= 0.0
        assert x_train_proc.dtype == np.float32
    
    def test_validation_split(self, config, sample_data):
        """Test validation split creation."""
        (x_train, y_train), _ = sample_data
        
        loader = DataLoader(config)
        (x_train_split, y_train_split), (x_val, y_val) = loader.create_validation_split(
            x_train, y_train
        )
        
        if config.training.validation_split > 0:
            assert len(x_train_split) < len(x_train)
            assert x_val is not None
            assert y_val is not None


class TestMNISTClassifier:
    """Test model architecture."""
    
    def test_model_creation(self, config):
        """Test model building."""
        classifier = MNISTClassifier(config)
        model = classifier.build_model()
        
        assert isinstance(model, tf.keras.Model)
        assert len(model.layers) == 4
        assert model.input_shape == (None, 28, 28)
        assert model.output_shape == (None, 10)
    
    def test_model_compilation(self, config):
        """Test model compilation."""
        classifier = MNISTClassifier(config)
        model = classifier.build_model()
        
        assert model.optimizer is not None
        assert model.loss is not None
    
    def test_callbacks_creation(self, config):
        """Test callback creation."""
        classifier = MNISTClassifier(config)
        callbacks = classifier.get_callbacks()
        
        assert len(callbacks) > 0
        assert any(isinstance(cb, tf.keras.callbacks.EarlyStopping) for cb in callbacks)


class TestTrainer:
    """Test training functionality."""
    
    def test_trainer_creation(self, config):
        """Test trainer initialization."""
        trainer = Trainer(config)
        assert trainer.config == config
        assert isinstance(trainer.model_builder, MNISTClassifier)
        assert isinstance(trainer.data_loader, DataLoader)
    
    @patch.object(DataLoader, 'load_data')
    @patch.object(DataLoader, 'preprocess_data')
    def test_data_preparation(self, mock_preprocess, mock_load, config, sample_data):
        """Test data preparation."""
        mock_load.return_value = sample_data
        mock_preprocess.return_value = sample_data
        
        trainer = Trainer(config)
        
        with patch.object(trainer.data_loader, 'create_validation_split') as mock_split:
            mock_split.return_value = (sample_data[0], (None, None))
            
            (x_train, y_train), (x_test, y_test), val_data = trainer.prepare_data()
            
            assert x_train.shape == (100, 28, 28)
            assert y_train.shape == (100,)


class TestMNISTPredictor:
    """Test inference functionality."""
    
    def test_predictor_creation(self, config):
        """Test predictor initialization."""
        predictor = MNISTPredictor(config)
        assert predictor.config == config
        assert predictor.model is None
    
    def test_image_preprocessing(self, config):
        """Test image preprocessing."""
        predictor = MNISTPredictor(config)
        image = np.random.random((28, 28)).astype('float32') * 255
        
        processed = predictor.preprocess_image(image)
        
        assert processed.shape == (1, 28, 28)
        assert processed.max() <= 1.0
        assert processed.min() >= 0.0
    
    @patch('tensorflow.keras.models.load_model')
    def test_model_loading(self, mock_load, config):
        """Test model loading."""
        mock_model = MagicMock()
        mock_load.return_value = mock_model
        
        predictor = MNISTPredictor(config)
        predictor.load_model("test_path.h5")
        
        assert predictor.model == mock_model
        mock_load.assert_called_once_with("test_path.h5")


if __name__ == "__main__":
    pytest.main([__file__])
