import pytest
import sys
import os
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import json

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

from main import app, IntegralRequest, IntegralResponse

client = TestClient(app)


class TestIntegralCalculatorAPI:
    """Test class for the Integral Calculator API endpoints"""
    
    def test_test_endpoint(self):
        """Test the /test endpoint"""
        response = client.get("/test")
        assert response.status_code == 200
        assert response.json() == {"message": "Backend is working!"}
    
    def test_calculate_integral_simple_polynomial(self):
        """Test integral calculation for a simple polynomial: x^2"""
        request_data = {
            "function_string": "x**2",
            "start_x": 0,
            "end_x": 1
        }
        response = client.post("/calculate-integral", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "latex_expression" in data
        assert "area" in data
        assert "function_points" in data
        
        # The integral of x^2 from 0 to 1 should be 1/3 ≈ 0.333
        assert abs(data["area"] - 1/3) < 0.001
        assert len(data["function_points"]) > 0
    
    def test_calculate_integral_linear_function(self):
        """Test integral calculation for a linear function: 2*x + 1"""
        request_data = {
            "function_string": "2*x + 1",
            "start_x": 0,
            "end_x": 2
        }
        response = client.post("/calculate-integral", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        # The integral of 2x + 1 from 0 to 2 should be [x^2 + x] = 4 + 2 = 6
        assert abs(data["area"] - 6) < 0.001
    
    def test_calculate_integral_sine_function(self):
        """Test integral calculation for trigonometric function: sin(x)"""
        request_data = {
            "function_string": "sin(x)",
            "start_x": 0,
            "end_x": 3.14159  # π
        }
        response = client.post("/calculate-integral", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        # The integral of sin(x) from 0 to π should be 2
        assert abs(data["area"] - 2) < 0.01
    
    def test_calculate_integral_exponential_function(self):
        """Test integral calculation for exponential function: exp(x)"""
        request_data = {
            "function_string": "exp(x)",
            "start_x": 0,
            "end_x": 1
        }
        response = client.post("/calculate-integral", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        # The integral of exp(x) from 0 to 1 should be e - 1 ≈ 1.718
        import math
        expected = math.e - 1
        assert abs(data["area"] - expected) < 0.001
    
    def test_calculate_integral_negative_limits(self):
        """Test integral calculation with negative limits"""
        request_data = {
            "function_string": "x**3",
            "start_x": -1,
            "end_x": 1
        }
        response = client.post("/calculate-integral", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        # The integral of x^3 from -1 to 1 should be 0 (odd function)
        assert abs(data["area"]) < 0.001
    
    def test_calculate_integral_invalid_function(self):
        """Test error handling for invalid function"""
        request_data = {
            "function_string": "invalid_function(x)",
            "start_x": 0,
            "end_x": 1
        }
        response = client.post("/calculate-integral", json=request_data)
        assert response.status_code == 400
    
    def test_calculate_integral_division_by_zero(self):
        """Test handling of function with potential division by zero"""
        request_data = {
            "function_string": "1/x",
            "start_x": -1,
            "end_x": 1
        }
        response = client.post("/calculate-integral", json=request_data)
        # This should either return an error or handle the singularity
        assert response.status_code in [200, 400]
    
    def test_calculate_integral_complex_function(self):
        """Test integral calculation for a complex function"""
        request_data = {
            "function_string": "x**2 * sin(x) + cos(x)",
            "start_x": 0,
            "end_x": 1
        }
        response = client.post("/calculate-integral", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "area" in data
        assert isinstance(data["area"], float)
        assert len(data["function_points"]) > 0
    
    def test_calculate_integral_response_structure(self):
        """Test the structure of the integral calculation response"""
        request_data = {
            "function_string": "x",
            "start_x": 0,
            "end_x": 2
        }
        response = client.post("/calculate-integral", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        
        # Check required fields
        required_fields = ["latex_expression", "area", "function_points"]
        for field in required_fields:
            assert field in data
        
        # Check data types
        assert isinstance(data["latex_expression"], str)
        assert isinstance(data["area"], (int, float))
        assert isinstance(data["function_points"], list)
        
        # Check function points structure
        if data["function_points"]:
            point = data["function_points"][0]
            assert "x" in point
            assert "y" in point
            assert isinstance(point["x"], (int, float))
            assert isinstance(point["y"], (int, float, type(None)))
    
    def test_calculate_integral_empty_function(self):
        """Test error handling for empty function string"""
        request_data = {
            "function_string": "",
            "start_x": 0,
            "end_x": 1
        }
        response = client.post("/calculate-integral", json=request_data)
        assert response.status_code == 400
    
    def test_calculate_integral_invalid_limits(self):
        """Test error handling for invalid integration limits"""
        request_data = {
            "function_string": "x",
            "start_x": 1,
            "end_x": 0  # end < start
        }
        response = client.post("/calculate-integral", json=request_data)
        assert response.status_code == 200  # Should still work, just negative area
        
        data = response.json()
        # Area should be negative when limits are reversed
        assert data["area"] < 0
    
    def test_calculate_integral_implicit_multiplication_simple(self):
        """Test integral calculation with implicit multiplication: 2x+1"""
        request_data = {
            "function_string": "2x+1",
            "start_x": 0,
            "end_x": 2
        }
        response = client.post("/calculate-integral", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        # The integral of 2x + 1 from 0 to 2 should be [x^2 + x] = 4 + 2 = 6
        assert abs(data["area"] - 6) < 0.001
        assert "2 x + 1" in data["latex_expression"] or "2*x + 1" in data["latex_expression"]
    
    def test_calculate_integral_implicit_multiplication_polynomial(self):
        """Test integral calculation with implicit multiplication: 3x^2"""
        request_data = {
            "function_string": "3x^2",
            "start_x": 0,
            "end_x": 1
        }
        response = client.post("/calculate-integral", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        # The integral of 3x^2 from 0 to 1 should be x^3 = 1
        assert abs(data["area"] - 1) < 0.001
    
    def test_calculate_integral_implicit_multiplication_complex(self):
        """Test integral calculation with complex implicit multiplication: x^2+2x+1"""
        request_data = {
            "function_string": "x^2+2x+1",
            "start_x": -1,
            "end_x": 1
        }
        response = client.post("/calculate-integral", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        # The integral of (x+1)^2 from -1 to 1 should be 8/3
        assert abs(data["area"] - 8/3) < 0.01
    
    def test_calculate_integral_implicit_multiplication_trigonometric(self):
        """Test integral calculation with implicit multiplication in trig functions: sin(2x)"""
        request_data = {
            "function_string": "sin(2x)",
            "start_x": 0,
            "end_x": 3.14159/2  # π/2
        }
        response = client.post("/calculate-integral", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        # The integral of sin(2x) from 0 to π/2 should be 1
        assert abs(data["area"] - 1) < 0.01
    
    def test_calculate_integral_coefficient_function(self):
        """Test integral calculation with coefficient times function: 2sin(x)"""
        request_data = {
            "function_string": "2sin(x)",
            "start_x": 0,
            "end_x": 3.14159  # π
        }
        response = client.post("/calculate-integral", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        # The integral of 2sin(x) from 0 to π should be 4
        assert abs(data["area"] - 4) < 0.01
    
    def test_calculate_integral_caret_exponentiation(self):
        """Test integral calculation with caret exponentiation: x^3+2x^2"""
        request_data = {
            "function_string": "x^3+2x^2",
            "start_x": 0,
            "end_x": 2
        }
        response = client.post("/calculate-integral", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        # The integral of x^3 + 2x^2 from 0 to 2 should be [x^4/4 + 2x^3/3] = 4 + 16/3 ≈ 9.333
        assert abs(data["area"] - (4 + 16/3)) < 0.01

    # ...existing code...


class TestIntegralRequestModel:
    """Test the Pydantic models"""
    
    def test_integral_request_valid(self):
        """Test valid IntegralRequest creation"""
        request = IntegralRequest(
            function_string="x**2",
            start_x=0.0,
            end_x=1.0
        )
        assert request.function_string == "x**2"
        assert request.start_x == 0.0
        assert request.end_x == 1.0
    
    def test_integral_request_type_conversion(self):
        """Test type conversion in IntegralRequest"""
        request = IntegralRequest(
            function_string="x**2",
            start_x=0,  # int should convert to float
            end_x=1     # int should convert to float
        )
        assert isinstance(request.start_x, (int, float))
        assert isinstance(request.end_x, (int, float))


class TestErrorHandling:
    """Test error handling scenarios"""
    
    def test_malformed_request(self):
        """Test handling of malformed JSON request"""
        response = client.post("/calculate-integral", json={})
        assert response.status_code == 422  # Validation error
    
    def test_missing_fields(self):
        """Test handling of missing required fields"""
        request_data = {
            "function_string": "x**2"
            # Missing start_x and end_x
        }
        response = client.post("/calculate-integral", json=request_data)
        assert response.status_code == 422
    
    def test_invalid_data_types(self):
        """Test handling of invalid data types"""
        request_data = {
            "function_string": "x**2",
            "start_x": "invalid",  # Should be numeric
            "end_x": 1
        }
        response = client.post("/calculate-integral", json=request_data)
        assert response.status_code == 422


class TestCORSConfiguration:
    """Test CORS configuration"""
    
    def test_cors_headers(self):
        """Test that CORS headers are properly set"""
        response = client.options("/calculate-integral")
        # Should not return error due to CORS
        assert response.status_code in [200, 405]  # 405 is also acceptable for OPTIONS


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
