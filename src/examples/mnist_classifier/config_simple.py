"""Simplified configuration management without external dependencies."""

from typing import Optional


class ModelConfig:
    """Model configuration settings."""
    
    def __init__(self):
        self.input_shape = (28, 28)
        self.hidden_units = 128
        self.dropout_rate = 0.2
        self.num_classes = 10


class TrainingConfig:
    """Training configuration settings."""
    
    def __init__(self):
        self.epochs = 5
        self.batch_size = 32
        self.learning_rate = 0.001
        self.validation_split = 0.1
        self.early_stopping_patience = 3


class DataConfig:
    """Data configuration settings."""
    
    def __init__(self):
        self.normalization_factor = 255.0
        self.test_size = 0.2
        self.random_state = 42


class Config:
    """Main configuration class."""
    
    def __init__(self):
        self.model = ModelConfig()
        self.training = TrainingConfig()
        self.data = DataConfig()
        
        # Paths
        self.model_save_path = "models/mnist_classifier.h5"
        self.logs_path = "logs"
        
        # MLflow
        self.experiment_name = "mnist_classification"
