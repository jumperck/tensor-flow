# Example Template

This template provides a starting structure for new TensorFlow learning examples.

## Structure

```
example_name/
├── __init__.py          # Package initialization
├── README.md            # Example documentation
├── config.py            # Configuration settings
├── data/
│   ├── __init__.py
│   └── loader.py        # Data loading and preprocessing
├── models/
│   ├── __init__.py
│   └── model.py         # Model architecture
├── training/
│   ├── __init__.py
│   └── trainer.py       # Training logic
└── inference/
    ├── __init__.py
    └── predictor.py     # Prediction utilities
```

## Creating a New Example

1. **Copy this template** to a new directory under `src/examples/`
2. **Update the package name** in all `__init__.py` files
3. **Implement your specific logic** in each module
4. **Add CLI commands** in the main `src/index.py`
5. **Update configuration** for your example's needs
6. **Write comprehensive README** explaining the example

## Guidelines

- **Isolation**: Each example should be self-contained
- **Shared Utilities**: Use `src.shared.utils` for common functionality
- **Configuration**: Use Pydantic for robust configuration management
- **Logging**: Use the shared logging utilities
- **Documentation**: Include clear explanations and learning objectives
- **CLI**: Add intuitive command-line interface
- **Testing**: Include unit tests where appropriate

## Integration with Main CLI

Add your example to the main CLI in `src/index.py`:

```python
@cli.group(name='your_example')
@click.pass_context
def your_example_cli(ctx):
    """Your example description."""
    from src.examples.your_example.config import Config
    ctx.obj['config'] = Config()

@your_example_cli.command()
@click.pass_context
def train(ctx):
    """Train your model."""
    # Implementation here
    pass
```
