"""Makefile-like commands for the project."""

import subprocess
import sys
from pathlib import Path


def install():
    """Install dependencies."""
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])


def install_dev():
    """Install development dependencies."""
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements-dev.txt"])


def test():
    """Run tests."""
    subprocess.run([sys.executable, "-m", "pytest", "tests/", "-v"])


def lint():
    """Run linting."""
    subprocess.run([sys.executable, "-m", "flake8", "src/", "tests/"])


def format_code():
    """Format code with black."""
    subprocess.run([sys.executable, "-m", "black", "src/", "tests/"])


def clean():
    """Clean up generated files."""
    import shutil
    
    patterns = ["**/__pycache__", "**/*.pyc", "**/*.pyo", "**/.*_cache"]
    
    for pattern in patterns:
        for path in Path(".").glob(pattern):
            if path.is_dir():
                shutil.rmtree(path)
            else:
                path.unlink()


def train():
    """Train the MNIST model."""
    subprocess.run([sys.executable, "-m", "src.index", "mnist", "train"])


def predict():
    """Run MNIST predictions."""
    subprocess.run([sys.executable, "-m", "src.index", "mnist", "predict"])


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python scripts.py <command>")
        print("Commands: install, install-dev, test, lint, format, clean, train, predict")
        sys.exit(1)
    
    command = sys.argv[1].replace("-", "_")
    
    if hasattr(sys.modules[__name__], command):
        getattr(sys.modules[__name__], command)()
    else:
        print(f"Unknown command: {sys.argv[1]}")
        sys.exit(1)
