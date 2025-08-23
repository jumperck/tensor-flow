"""Configuration management for the MNIST classifier."""

from typing import Optional
from pydantic import BaseModel, Field


class ModelConfig(BaseModel):
    """Model configuration settings."""
    
    input_shape: tuple[int, int] = (28, 28)
    hidden_units: int = Field(default=128, ge=32, le=512)
    dropout_rate: float = Field(default=0.2, ge=0.0, le=0.5)
    num_classes: int = 10


class TrainingConfig(BaseModel):
    """Training configuration settings."""
    
    epochs: int = Field(default=5, ge=1, le=100)
    batch_size: int = Field(default=32, ge=16, le=256)
    learning_rate: float = Field(default=0.001, ge=0.0001, le=0.1)
    validation_split: float = Field(default=0.1, ge=0.0, le=0.3)
    early_stopping_patience: int = Field(default=3, ge=1, le=10)


class DataConfig(BaseModel):
    """Data configuration settings."""
    
    normalization_factor: float = 255.0
    test_size: float = Field(default=0.2, ge=0.1, le=0.3)
    random_state: int = 42


class Config(BaseModel):
    """Main configuration class."""
    
    model: ModelConfig = ModelConfig()
    training: TrainingConfig = TrainingConfig()
    data: DataConfig = DataConfig()
    
    # Paths
    model_save_path: str = "models/mnist_classifier.h5"
    logs_path: str = "logs"
    
    # MLflow
    experiment_name: str = "mnist_classification"
    
    class Config:
        """Pydantic config."""
        env_file = ".env"
        env_file_encoding = "utf-8"
