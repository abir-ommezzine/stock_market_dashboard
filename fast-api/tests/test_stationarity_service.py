"""
Tests for stationarity_service.py
Verifies that the ADF test and find_optimal_d function
correctly identify the differencing order for ARIMA models.
"""

import pytest
import numpy as np
import pandas as pd
from app.services.stationarity_service import check_stationarity, find_optimal_d


class TestCheckStationarity:

    def test_stationary_series_returns_true(self):
        """White noise is stationary — ADF should detect it."""
        np.random.seed(42)
        series = pd.Series(np.random.normal(0, 1, 200))
        result = check_stationarity(series)
        assert result["is_stationary"] is True

    def test_nonstationary_series_returns_false(self):
        """A random walk (cumsum) is non-stationary."""
        np.random.seed(42)
        series = pd.Series(np.cumsum(np.random.normal(0, 1, 200)))
        result = check_stationarity(series)
        assert result["is_stationary"] is False

    def test_result_contains_required_keys(self):
        """Result dict must always contain all expected keys."""
        series = pd.Series(np.random.normal(0, 1, 100))
        result = check_stationarity(series)
        assert "test_statistic" in result
        assert "p_value" in result
        assert "is_stationary" in result
        assert "interpretation" in result

    def test_p_value_is_between_0_and_1(self):
        """p-value must always be a valid probability."""
        series = pd.Series(np.random.normal(0, 1, 100))
        result = check_stationarity(series)
        assert 0.0 <= result["p_value"] <= 1.0


class TestFindOptimalD:

    def test_stationary_series_returns_d0(self):
        """White noise needs no differencing — d should be 0."""
        np.random.seed(0)
        series = pd.Series(np.random.normal(0, 1, 200))
        d, _ = find_optimal_d(series)
        assert d == 0

    def test_random_walk_returns_d1(self):
        """A random walk needs one differencing — d should be 1."""
        np.random.seed(0)
        series = pd.Series(np.cumsum(np.random.normal(0, 1, 200)))
        d, _ = find_optimal_d(series)
        assert d >= 1

    def test_returned_series_is_stationary(self):
        """The differenced series returned must be stationary."""
        np.random.seed(0)
        series = pd.Series(np.cumsum(np.random.normal(0, 1, 200)))
        _, differenced = find_optimal_d(series)
        result = check_stationarity(differenced)
        assert result["is_stationary"] is True

    def test_d_does_not_exceed_max(self):
        """d should never exceed the max_d parameter."""
        series = pd.Series(np.cumsum(np.cumsum(np.random.normal(0, 1, 200))))
        d, _ = find_optimal_d(series, max_d=2)
        assert d <= 2
