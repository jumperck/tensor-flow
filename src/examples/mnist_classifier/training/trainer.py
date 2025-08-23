"""Training utilities and trainer class."""

import time
from pathlib import Path
from typing import Optional, Tuple, Dict, Any
import numpy as np
import tensorflow as tf

from ..config import Config
from ..models.classifier import MNISTClassifier
from ..data.loader import DataLoader
from src.shared.utils.logger import get_logger

logger = get_logger(__name__)


class Trainer:
    """Handles model training and evaluation."""
    
    def __init__(self, config: Config):
        """Initialize trainer with configuration.
        
        Args:
            config: Configuration object
        """
        self.config = config
        self.model_builder = MNISTClassifier(config)
        self.data_loader = DataLoader(config)
        self.history: Optional[tf.keras.callbacks.History] = None
    
    def prepare_data(self) -> Tuple[Tuple[np.ndarray, np.ndarray], 
                                   Tuple[np.ndarray, np.ndarray],
                                   Optional[Tuple[np.ndarray, np.ndarray]]]:
        """Prepare training data.
        
        Returns:
            Tuple of (train_data, test_data, validation_data)
        """
        # Load data
        (x_train, y_train), (x_test, y_test) = self.data_loader.load_data()
        
        # Preprocess data
        (x_train, y_train), (x_test, y_test) = self.data_loader.preprocess_data(
            x_train, y_train, x_test, y_test
        )
        
        # Create validation split
        (x_train, y_train), validation_data = self.data_loader.create_validation_split(
            x_train, y_train
        )
        
        # Log data information
        data_info = self.data_loader.get_data_info(x_train, y_train)
        logger.info(f"Dataset info: {data_info}")
        
        return (x_train, y_train), (x_test, y_test), validation_data
    
    def train(self) -> Dict[str, Any]:
        """Train the model.
        
        Returns:
            Training history and metrics
        """
        logger.info("Starting training process...")
        start_time = time.time()
        
        # Prepare data
        (x_train, y_train), (x_test, y_test), validation_data = self.prepare_data()
        
        # Build model
        model = self.model_builder.build_model()
        
        # Prepare validation data for training
        validation_data_tuple = None
        if validation_data[0] is not None:
            validation_data_tuple = validation_data
        
        # Get callbacks
        callbacks = self.model_builder.get_callbacks()
        
        # Ensure model directory exists
        Path(self.config.model_save_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Train model
        logger.info(f"Training for {self.config.training.epochs} epochs...")
        self.history = model.fit(
            x_train, y_train,
            epochs=self.config.training.epochs,
            batch_size=self.config.training.batch_size,
            validation_data=validation_data_tuple,
            callbacks=callbacks,
            verbose=1
        )
        
        # Evaluate on test set
        logger.info("Evaluating on test set...")
        test_metrics = model.evaluate(x_test, y_test, verbose=0)
        test_loss, test_accuracy = test_metrics[0], test_metrics[1]
        
        training_time = time.time() - start_time
        
        # Log final metrics
        logger.info(f"Training completed in {training_time:.2f} seconds")
        logger.info(f"Final test accuracy: {test_accuracy:.4f}")
        logger.info(f"Final test loss: {test_loss:.4f}")
        
        # Save final model
        self.model_builder.save_model(self.config.model_save_path)
        
        return {
            "history": self.history.history,
            "test_accuracy": float(test_accuracy),
            "test_loss": float(test_loss),
            "training_time": training_time,
            "epochs_trained": len(self.history.history["loss"])
        }
    
    def evaluate_model(self, x_test: np.ndarray, y_test: np.ndarray) -> Dict[str, float]:
        """Evaluate the trained model.
        
        Args:
            x_test: Test images
            y_test: Test labels
            
        Returns:
            Evaluation metrics
        """
        if self.model_builder.model is None:
            raise ValueError("Model not trained yet. Call train() first.")
        
        logger.info("Evaluating model...")
        
        # Basic evaluation
        test_metrics = self.model_builder.model.evaluate(x_test, y_test, verbose=0)
        test_loss, test_accuracy = test_metrics[0], test_metrics[1]
        
        # Predictions for more detailed metrics
        y_pred = self.model_builder.model.predict(x_test, verbose=0)
        y_pred_classes = np.argmax(y_pred, axis=1)
        
        # Calculate per-class accuracy
        class_accuracies = {}
        for class_idx in range(self.config.model.num_classes):
            class_mask = y_test == class_idx
            if np.sum(class_mask) > 0:
                class_acc = np.mean(y_pred_classes[class_mask] == y_test[class_mask])
                class_accuracies[f"class_{class_idx}_accuracy"] = float(class_acc)
        
        metrics = {
            "test_loss": float(test_loss),
            "test_accuracy": float(test_accuracy),
            **class_accuracies
        }
        
        logger.info(f"Evaluation metrics: {metrics}")
        return metrics
