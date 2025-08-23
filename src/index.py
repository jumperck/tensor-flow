"""Main CLI interface for TensorFlow learning examples.

This module provides a command-line interface for running different
TensorFlow learning projects and examples.
"""

import sys
from pathlib import Path
import click

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent))

try:
    import tensorflow as tf
    print(f"TensorFlow version: {tf.__version__}")
except ImportError as e:
    print(f"Failed to import TensorFlow: {e}")
    print("Try installing TensorFlow with: pip install tensorflow")
    sys.exit(1)

from src.shared.utils.logger import setup_logging, get_logger


@click.group()
@click.option('--log-level', default='INFO', help='Logging level')
@click.option('--log-file', default=None, help='Log file path')
@click.pass_context
def cli(ctx, log_level, log_file):
    """TensorFlow Learning Examples CLI."""
    ctx.ensure_object(dict)
    
    # Setup logging
    setup_logging(log_level=log_level, log_file=log_file)
    logger = get_logger(__name__)
    
    ctx.obj['logger'] = logger


@cli.group(name='mnist')
@click.pass_context
def mnist_cli(ctx):
    """MNIST digit classifier example."""
    from src.examples.mnist_classifier.config import Config
    ctx.obj['config'] = Config()


@mnist_cli.command()
@click.option('--epochs', default=None, type=int, help='Number of training epochs')
@click.option('--batch-size', default=None, type=int, help='Training batch size')
@click.option('--learning-rate', default=None, type=float, help='Learning rate')
@click.pass_context
def train(ctx, epochs, batch_size, learning_rate):
    """Train the MNIST classifier."""
    config = ctx.obj['config']
    logger = ctx.obj['logger']
    
    # Override config with CLI arguments
    if epochs is not None:
        config.training.epochs = epochs
    if batch_size is not None:
        config.training.batch_size = batch_size
    if learning_rate is not None:
        config.training.learning_rate = learning_rate
    
    logger.info("Starting MNIST training with configuration:")
    logger.info(f"  Epochs: {config.training.epochs}")
    logger.info(f"  Batch size: {config.training.batch_size}")
    logger.info(f"  Learning rate: {config.training.learning_rate}")
    
    try:
        from src.examples.mnist_classifier.training.trainer import Trainer
        trainer = Trainer(config)
        results = trainer.train()
        
        logger.info("Training completed successfully!")
        logger.info(f"Final validation accuracy: {results.get('val_accuracy', 'N/A'):.4f}")
        logger.info(f"Model saved to: {config.model_save_path}")
        
    except Exception as e:
        logger.error(f"Training failed: {str(e)}")
        sys.exit(1)


@mnist_cli.command()
@click.option('--model-path', default=None, help='Path to saved model')
@click.option('--num-samples', default=5, type=int, help='Number of samples to predict')
@click.pass_context
def predict(ctx, model_path, num_samples):
    """Make predictions using the MNIST classifier."""
    config = ctx.obj['config']
    logger = ctx.obj['logger']
    
    if model_path:
        config.model_save_path = model_path
    
    logger.info(f"Making predictions with model: {config.model_save_path}")
    logger.info(f"Number of samples: {num_samples}")
    
    try:
        from src.examples.mnist_classifier.inference.predictor import MNISTPredictor
        predictor = MNISTPredictor(config, config.model_save_path)
        results = predictor.predict_batch(num_samples=num_samples)
        
        logger.info("Predictions completed successfully!")
        for i, result in enumerate(results):
            predicted_digit = result['predicted_class']
            confidence = result['confidence']
            actual_digit = result.get('actual_class', 'Unknown')
            logger.info(f"Sample {i+1}: Predicted={predicted_digit} (confidence: {confidence:.4f}), Actual={actual_digit}")
            
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        sys.exit(1)


@mnist_cli.command()
@click.pass_context
def info(ctx):
    """Show information about the MNIST classifier."""
    config = ctx.obj['config']
    logger = ctx.obj['logger']
    
    logger.info("MNIST Classifier Configuration:")
    logger.info(f"  Model input shape: {config.model.input_shape}")
    logger.info(f"  Hidden units: {config.model.hidden_units}")
    logger.info(f"  Dropout rate: {config.model.dropout_rate}")
    logger.info(f"  Number of classes: {config.model.num_classes}")
    logger.info(f"  Model save path: {config.model_save_path}")


@cli.command()
def list_examples():
    """List available TensorFlow learning examples."""
    click.echo("Available TensorFlow Learning Examples:")
    click.echo("")
    click.echo("  mnist    - MNIST digit classification")
    click.echo("           Train neural networks on handwritten digits")
    click.echo("")
    click.echo("Usage:")
    click.echo("  python -m src.index mnist train     # Train MNIST classifier")
    click.echo("  python -m src.index mnist predict   # Make predictions")
    click.echo("  python -m src.index mnist info      # Show model info")


if __name__ == '__main__':
    cli()


@cli.command()
@click.option('--epochs', default=None, type=int, help='Number of training epochs')
@click.option('--batch-size', default=None, type=int, help='Training batch size')
@click.option('--learning-rate', default=None, type=float, help='Learning rate')
@click.pass_context
def train(ctx, epochs, batch_size, learning_rate):
    """Train the MNIST classifier."""
    config = ctx.obj['config']
    logger = ctx.obj['logger']
    
    # Override config with CLI arguments
    if epochs is not None:
        config.training.epochs = epochs
    if batch_size is not None:
        config.training.batch_size = batch_size
    if learning_rate is not None:
        config.training.learning_rate = learning_rate
    
    logger.info("Starting training with configuration:")
    logger.info(f"  Epochs: {config.training.epochs}")
    logger.info(f"  Batch size: {config.training.batch_size}")
    logger.info(f"  Learning rate: {config.training.learning_rate}")
    
    try:
        trainer = Trainer(config)
        results = trainer.train()
        
        logger.info("Training completed successfully!")
        logger.info(f"Final test accuracy: {results['test_accuracy']:.4f}")
        logger.info(f"Training time: {results['training_time']:.2f} seconds")
        
    except Exception as e:
        logger.error(f"Training failed: {e}")
        raise


@cli.command()
@click.option('--model-path', default=None, help='Path to saved model')
@click.option('--num-samples', default=5, type=int, help='Number of test samples to predict')
@click.pass_context
def predict(ctx, model_path, num_samples):
    """Make predictions with the trained model."""
    config = ctx.obj['config']
    logger = ctx.obj['logger']
    
    # Use default model path if not provided
    if model_path is None:
        model_path = config.model_save_path
    
    if not Path(model_path).exists():
        logger.error(f"Model file not found: {model_path}")
        logger.info("Please train a model first using: python -m src.index train")
        return
    
    try:
        # Load predictor
        predictor = MNISTPredictor(config, model_path)
        
        # Load test data
        from src.data.loader import DataLoader
        data_loader = DataLoader(config)
        (_, _), (x_test, y_test) = data_loader.load_data()
        (_, _), (x_test, y_test) = data_loader.preprocess_data(_, _, x_test, y_test)
        
        # Make predictions on random samples
        import numpy as np
        indices = np.random.choice(len(x_test), num_samples, replace=False)
        
        logger.info(f"Making predictions on {num_samples} test samples...")
        
        for i, idx in enumerate(indices):
            result = predictor.predict_single(x_test[idx])
            actual = int(y_test[idx])
            
            logger.info(f"Sample {i+1}:")
            logger.info(f"  Predicted: {result['predicted_digit']}")
            logger.info(f"  Actual: {actual}")
            logger.info(f"  Confidence: {result['confidence']:.4f}")
            logger.info(f"  Correct: {result['predicted_digit'] == actual}")
    
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise


@cli.command()
@click.option('--model-path', default=None, help='Path to saved model')
@click.pass_context
def info(ctx, model_path):
    """Show model information."""
    config = ctx.obj['config']
    logger = ctx.obj['logger']
    
    # Use default model path if not provided
    if model_path is None:
        model_path = config.model_save_path
    
    if not Path(model_path).exists():
        logger.error(f"Model file not found: {model_path}")
        return
    
    try:
        predictor = MNISTPredictor(config, model_path)
        model_info = predictor.get_model_info()
        
        logger.info("Model Information:")
        logger.info(f"  Input shape: {model_info['input_shape']}")
        logger.info(f"  Output shape: {model_info['output_shape']}")
        logger.info(f"  Total parameters: {model_info['num_parameters']:,}")
        logger.info(f"  Number of layers: {model_info['num_layers']}")
        
        logger.info("\nLayer Details:")
        for layer in model_info['layer_info']:
            logger.info(f"  {layer['name']} ({layer['type']}): {layer['output_shape']}")
    
    except Exception as e:
        logger.error(f"Failed to load model info: {e}")
        raise


if __name__ == '__main__':
    cli()
