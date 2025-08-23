"""Inference utilities for model prediction."""

import numpy as np
import tensorflow as tf
from typing import Union, List, Dict, Any
from pathlib import Path

from src.config import Config
from src.models.classifier import MNISTClassifier
from src.utils.logger import get_logger

logger = get_logger(__name__)


class MNISTPredictor:
    """Handles inference for MNIST digit classification."""
    
    def __init__(self, config: Config, model_path: str = None):
        """Initialize predictor.
        
        Args:
            config: Configuration object
            model_path: Path to saved model (optional)
        """
        self.config = config
        self.model: tf.keras.Model = None
        
        if model_path and Path(model_path).exists():
            self.load_model(model_path)
    
    def load_model(self, model_path: str) -> None:
        """Load a trained model.
        
        Args:
            model_path: Path to the saved model
        """
        try:
            self.model = tf.keras.models.load_model(model_path)
            logger.info(f"Model loaded successfully from {model_path}")
        except Exception as e:
            logger.error(f"Failed to load model from {model_path}: {e}")
            raise
    
    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Preprocess a single image for prediction.
        
        Args:
            image: Input image (28x28) or batch of images
            
        Returns:
            Preprocessed image ready for prediction
        """
        # Ensure correct shape
        if image.ndim == 2:
            image = np.expand_dims(image, axis=0)  # Add batch dimension
        elif image.ndim == 3 and image.shape[0] != 1:
            pass  # Already a batch
        else:
            raise ValueError(f"Invalid image shape: {image.shape}")
        
        # Normalize
        image = image.astype('float32') / self.config.data.normalization_factor
        
        return image
    
    def predict_single(self, image: np.ndarray) -> Dict[str, Any]:
        """Predict a single digit.
        
        Args:
            image: Single 28x28 image
            
        Returns:
            Prediction results with confidence scores
        """
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        # Preprocess
        processed_image = self.preprocess_image(image)
        
        # Predict
        predictions = self.model.predict(processed_image, verbose=0)
        predicted_class = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][predicted_class])
        
        # Get all class probabilities
        class_probs = {
            f"class_{i}": float(predictions[0][i])
            for i in range(len(predictions[0]))
        }
        
        return {
            "predicted_digit": predicted_class,
            "confidence": confidence,
            "all_probabilities": class_probs
        }
    
    def predict_batch(self, images: np.ndarray) -> List[Dict[str, Any]]:
        """Predict multiple digits.
        
        Args:
            images: Batch of 28x28 images
            
        Returns:
            List of prediction results
        """
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        # Preprocess
        processed_images = self.preprocess_image(images)
        
        # Predict
        predictions = self.model.predict(processed_images, verbose=0)
        
        results = []
        for i, pred in enumerate(predictions):
            predicted_class = int(np.argmax(pred))
            confidence = float(pred[predicted_class])
            
            class_probs = {
                f"class_{j}": float(pred[j])
                for j in range(len(pred))
            }
            
            results.append({
                "sample_index": i,
                "predicted_digit": predicted_class,
                "confidence": confidence,
                "all_probabilities": class_probs
            })
        
        return results
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model.
        
        Returns:
            Model information dictionary
        """
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        return {
            "input_shape": self.model.input_shape,
            "output_shape": self.model.output_shape,
            "num_parameters": self.model.count_params(),
            "num_layers": len(self.model.layers),
            "layer_info": [
                {
                    "name": layer.name,
                    "type": type(layer).__name__,
                    "output_shape": layer.output_shape,
                    "trainable_params": layer.count_params()
                }
                for layer in self.model.layers
            ]
        }
