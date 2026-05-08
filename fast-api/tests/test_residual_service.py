"""
Tests for residual_service.py
Verifies that Ljung-Box and Jarque-Bera diagnostics
are correctly computed and returned.
"""

import pytest
import numpy as np
import pandas as pd
from unittest.mock import MagicMock
from app.services.residual_service import check_residuals


def make_fitted_model(residuals):
    """Helper — creates a mock fitted model with given residuals."""
    model = MagicMock()
    model.resid = pd.Series(residuals)
    return model


class TestCheckResiduals:

    def test_returns_required_keys(self):
        """Result must always contain all expected keys."""
        model = make_fitted_model(np.random.normal(0, 1, 100))
        result = check_residuals(model)
        assert "residual_mean" in result
        assert "residual_std" in result
        assert "prob_q" in result
        assert "prob_jb" in result
        assert "is_good_fit" in result
        assert "interpretation" in result

    def test_white_noise_is_good_fit(self):
        """Pure white noise residuals should pass both tests."""
        np.random.seed(42)
        model = make_fitted_model(np.random.normal(0, 1, 300))
        result = check_residuals(model)
        # Both p-values should be > 0.05 for white noise
        assert result["prob_q"] > 0.05
        assert result["prob_jb"] > 0.05
        assert result["is_good_fit"] is True

    def test_autocorrelated_residuals_fail_ljung_box(self):
        """Highly autocorrelated residuals should fail the Ljung-Box test."""
        # AR(1) with coefficient 0.9 — very autocorrelated
        np.random.seed(0)
        n = 300
        residuals = np.zeros(n)
        for i in range(1, n):
            residuals[i] = 0.9 * residuals[i - 1] + np.random.normal(0, 1)
        model = make_fitted_model(residuals)
        result = check_residuals(model)
        assert result["prob_q"] < 0.05

    def test_failed_model_returns_none_values(self):
        """If the model has no resid attribute, result should handle gracefully."""
        model = MagicMock()
        model.resid = None  # will cause an error inside check_residuals
        result = check_residuals(model)
        # Should not raise — should return a dict with None values
        assert result is not None
        assert "interpretation" in result

    def test_is_good_fit_is_native_bool(self):
        """is_good_fit must be a native Python bool, not numpy.bool_."""
        model = make_fitted_model(np.random.normal(0, 1, 200))
        result = check_residuals(model)
        assert type(result["is_good_fit"]) is bool
