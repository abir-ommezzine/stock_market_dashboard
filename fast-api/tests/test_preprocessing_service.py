"""
Tests for preprocessing_service.py
Verifies data cleaning and percentage change transformation.
"""

import pytest
import numpy as np
import pandas as pd
from unittest.mock import MagicMock
from app.services.preprocessing_service import preprocess


def make_data_points(prices):
    """Helper — creates mock StockDataPoint objects from a list of prices."""
    points = []
    for i, price in enumerate(prices):
        point = MagicMock()
        point.close = price
        point.date = f"2024-01-{i+1:02d}"
        points.append(point)
    return points


class TestPreprocess:

    def test_returns_series_and_meta(self):
        """preprocess must return a tuple of (Series, dict)."""
        data = make_data_points([100, 101, 102, 103, 104])
        series, meta = preprocess(data)
        assert isinstance(series, pd.Series)
        assert isinstance(meta, dict)

    def test_pct_change_reduces_length_by_one(self):
        """pct_change drops the first row — output length = input - 1."""
        data = make_data_points([100, 102, 105, 103, 107])
        series, meta = preprocess(data, use_pct_change=True)
        assert len(series) == len(data) - 1
        assert meta["used_pct_change"] is True

    def test_no_transform_preserves_length(self):
        """Without transforms, length should stay the same."""
        data = make_data_points([100, 101, 102, 103, 104])
        series, meta = preprocess(data)
        assert len(series) == len(data)
        assert meta["used_pct_change"] is False
        assert meta["used_log"] is False

    def test_pct_change_values_are_correct(self):
        """Verify the percentage change calculation is accurate."""
        data = make_data_points([100.0, 110.0, 121.0])
        series, _ = preprocess(data, use_pct_change=True)
        # (110-100)/100 = 0.10, (121-110)/110 ≈ 0.10
        assert abs(series.iloc[0] - 0.10) < 1e-6
        assert abs(series.iloc[1] - 0.10) < 1e-6

    def test_nan_rows_are_dropped(self):
        """NaN values in the input should be removed."""
        data = make_data_points([100, float("nan"), 102, 103])
        series, _ = preprocess(data)
        assert not series.isna().any()

    def test_original_first_value_stored_in_meta(self):
        """When pct_change is used, meta must store the first price."""
        data = make_data_points([150.0, 155.0, 160.0])
        _, meta = preprocess(data, use_pct_change=True)
        assert meta["original_first_value"] == 150.0
