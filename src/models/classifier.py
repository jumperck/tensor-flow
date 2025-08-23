"""Model architecture definitions."""

import tensorflow as tf
from typing import Optional

from src.config import Config
from src.utils.logger import get_logger

logger = get_logger(__name__)


class MNISTClassifier:
    """MNIST digit classifier model."""
    
    def __init__(self, config: Config):
        """Initialize the model with configuration.
        
        Args:
            config: Configuration object
        """
        self.config = config
        self.model: Optional[tf.keras.Model] = None
    
    def build_model(self) -> tf.keras.Model:
        """Build the neural network model.
        
        Returns:
            Compiled Keras model
        """
        logger.info("Building MNIST classifier model...")
        
        model = tf.keras.models.Sequential([
            tf.keras.layers.Flatten(
                input_shape=self.config.model.input_shape,
                name="flatten"
            ),
            tf.keras.layers.Dense(
                self.config.model.hidden_units,
                activation='relu',
                name="dense_hidden"
            ),
            tf.keras.layers.Dropout(
                self.config.model.dropout_rate,
                name="dropout"
            ),
            tf.keras.layers.Dense(
                self.config.model.num_classes,
                activation='softmax',
                name="dense_output"
            )
        ])
        
        self._compile_model(model)
        self.model = model
        
        logger.info("Model architecture:")
        model.summary(print_fn=logger.info)
        
        return model
    
    def _compile_model(self, model: tf.keras.Model) -> None:
        """Compile the model with optimizer, loss, and metrics.
        
        Args:
            model: Keras model to compile
        """
        optimizer = tf.keras.optimizers.Adam(
            learning_rate=self.config.training.learning_rate
        )
        
        model.compile(
            optimizer=optimizer,
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy', 'sparse_categorical_crossentropy']
        )
        
        logger.info(f"Model compiled with Adam optimizer (lr={self.config.training.learning_rate})")
    
    def get_callbacks(self) -> list:
        """Get training callbacks.
        
        Returns:
            List of Keras callbacks
        """
        callbacks = []
        
        # Early stopping
        early_stopping = tf.keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=self.config.training.early_stopping_patience,
            restore_best_weights=True,
            verbose=1
        )
        callbacks.append(early_stopping)
        
        # Model checkpoint
        checkpoint = tf.keras.callbacks.ModelCheckpoint(
            filepath=self.config.model_save_path,
            monitor='val_accuracy',
            save_best_only=True,
            save_weights_only=False,
            verbose=1
        )
        callbacks.append(checkpoint)
        
        # Reduce learning rate on plateau
        reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=2,
            min_lr=1e-7,
            verbose=1
        )
        callbacks.append(reduce_lr)
        
        return callbacks
    
    def save_model(self, filepath: str) -> None:
        """Save the trained model.
        
        Args:
            filepath: Path to save the model
        """
        if self.model is None:
            raise ValueError("Model not built yet. Call build_model() first.")
        
        self.model.save(filepath)
        logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str) -> tf.keras.Model:
        """Load a saved model.
        
        Args:
            filepath: Path to the saved model
            
        Returns:
            Loaded Keras model
        """
        self.model = tf.keras.models.load_model(filepath)
        logger.info(f"Model loaded from {filepath}")
        return self.model
