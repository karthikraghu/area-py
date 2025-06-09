# Backend Test Configuration
import os

# Test configuration for pytest
pytest_plugins = []

# Test markers
def pytest_configure(config):
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "unit: marks tests as unit tests"
    )

# Test fixtures and utilities can be added here
import pytest
import sys
import os

# Add backend directory to path for all tests
@pytest.fixture(autouse=True)
def setup_path():
    backend_path = os.path.join(os.path.dirname(__file__), '..', '..', 'backend')
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)

# Mock data fixtures
@pytest.fixture
def sample_integral_request():
    return {
        "function_string": "x**2",
        "start_x": 0,
        "end_x": 1
    }

@pytest.fixture
def complex_integral_request():
    return {
        "function_string": "sin(x) * cos(x) + exp(x/5)",
        "start_x": 0,
        "end_x": 3.14159
    }

@pytest.fixture
def invalid_integral_request():
    return {
        "function_string": "invalid_function(x)",
        "start_x": 0,
        "end_x": 1
    }

# Expected results for testing
@pytest.fixture
def expected_x_squared_integral():
    # Integral of x^2 from 0 to 1 = 1/3
    return 1/3

@pytest.fixture
def expected_linear_integral():
    # Integral of 2x + 1 from 0 to 2 = [x^2 + x] from 0 to 2 = 4 + 2 = 6
    return 6
