"""Data loading and preprocessing utilities."""

import numpy as np
import tensorflow as tf
from typing import Tuple
from sklearn.model_selection import train_test_split

from src.config import Config
from src.utils.logger import get_logger

logger = get_logger(__name__)


class DataLoader:
    """Handles MNIST data loading and preprocessing."""
    
    def __init__(self, config: Config):
        """Initialize data loader with configuration.
        
        Args:
            config: Configuration object
        """
        self.config = config
    
    def load_data(self) -> Tuple[Tuple[np.ndarray, np.ndarray], Tuple[np.ndarray, np.ndarray]]:
        """Load MNIST dataset.
        
        Returns:
            Tuple of (train_data, test_data) where each is (x, y)
        """
        logger.info("Loading MNIST dataset...")
        
        try:
            mnist = tf.keras.datasets.mnist
            (x_train, y_train), (x_test, y_test) = mnist.load_data()
            
            logger.info(f"Training data shape: {x_train.shape}")
            logger.info(f"Test data shape: {x_test.shape}")
            
            return (x_train, y_train), (x_test, y_test)
            
        except Exception as e:
            logger.error(f"Failed to load MNIST dataset: {e}")
            raise
    
    def preprocess_data(
        self, 
        x_train: np.ndarray, 
        y_train: np.ndarray,
        x_test: np.ndarray,
        y_test: np.ndarray
    ) -> Tuple[Tuple[np.ndarray, np.ndarray], Tuple[np.ndarray, np.ndarray]]:
        """Preprocess the data.
        
        Args:
            x_train: Training images
            y_train: Training labels
            x_test: Test images
            y_test: Test labels
            
        Returns:
            Preprocessed (train_data, test_data)
        """
        logger.info("Preprocessing data...")
        
        # Normalize pixel values
        x_train = x_train.astype('float32') / self.config.data.normalization_factor
        x_test = x_test.astype('float32') / self.config.data.normalization_factor
        
        logger.info(f"Data normalized with factor: {self.config.data.normalization_factor}")
        logger.info(f"Training data range: [{x_train.min():.3f}, {x_train.max():.3f}]")
        
        return (x_train, y_train), (x_test, y_test)
    
    def create_validation_split(
        self, 
        x_train: np.ndarray, 
        y_train: np.ndarray
    ) -> Tuple[Tuple[np.ndarray, np.ndarray], Tuple[np.ndarray, np.ndarray]]:
        """Create validation split from training data.
        
        Args:
            x_train: Training images
            y_train: Training labels
            
        Returns:
            (train_data, val_data) tuples
        """
        if self.config.training.validation_split > 0:
            logger.info(f"Creating validation split: {self.config.training.validation_split}")
            
            x_train_split, x_val, y_train_split, y_val = train_test_split(
                x_train, y_train,
                test_size=self.config.training.validation_split,
                random_state=self.config.data.random_state,
                stratify=y_train
            )
            
            logger.info(f"Train split shape: {x_train_split.shape}")
            logger.info(f"Validation split shape: {x_val.shape}")
            
            return (x_train_split, y_train_split), (x_val, y_val)
        
        return (x_train, y_train), (None, None)
    
    def get_data_info(self, x_train: np.ndarray, y_train: np.ndarray) -> dict:
        """Get information about the dataset.
        
        Args:
            x_train: Training images
            y_train: Training labels
            
        Returns:
            Dictionary with data information
        """
        unique_labels, counts = np.unique(y_train, return_counts=True)
        
        return {
            "num_samples": len(x_train),
            "input_shape": x_train.shape[1:],
            "num_classes": len(unique_labels),
            "class_distribution": dict(zip(unique_labels.tolist(), counts.tolist())),
            "data_type": str(x_train.dtype),
            "value_range": (float(x_train.min()), float(x_train.max()))
        }
