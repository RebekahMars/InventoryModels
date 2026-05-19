"""
Multi-model time series forecasting for diagnostic test order volume.
Models: ARIMA, Holt-Winters ETS, Linear Trend + Fourier Seasonality.
"""
import warnings
import numpy as np
import pandas as pd
from datetime import date, timedelta
from dataclasses import dataclass

warnings.filterwarnings("ignore")


@dataclass
class ForecastPoint:
    date: str
    value: float
    lower: float
    upper: float


@dataclass
class ModelMetrics:
    mae: float
    rmse: float


def _fourier_features(dates: pd.DatetimeIndex, periods: list[float], n_terms: int = 3) -> np.ndarray:
    """Generate sine/cosine Fourier features for given seasonal periods."""
    t = np.arange(len(dates), dtype=float)
    cols = []
    for p in periods:
        for k in range(1, n_terms + 1):
            cols.append(np.sin(2 * np.pi * k * t / p))
            cols.append(np.cos(2 * np.pi * k * t / p))
    return np.column_stack(cols)


def _make_series(history: list[tuple[date, float]]) -> pd.Series:
    idx = pd.DatetimeIndex([d for d, _ in history], freq="D")
    return pd.Series([v for _, v in history], index=idx, dtype=float)


def run_arima(series: pd.Series, horizon: int) -> tuple[list[ForecastPoint], ModelMetrics]:
    from statsmodels.tsa.arima.model import ARIMA

    train = series.iloc[:-30]
    test = series.iloc[-30:]

    model = ARIMA(train, order=(2, 1, 2), seasonal_order=(1, 1, 1, 7))
    fit = model.fit()

    # in-sample validation on held-out 30 days
    val_fc = fit.forecast(steps=30)
    mae = float(np.mean(np.abs(val_fc.values - test.values)))
    rmse = float(np.sqrt(np.mean((val_fc.values - test.values) ** 2)))

    # refit on full series, forecast horizon
    full_fit = ARIMA(series, order=(2, 1, 2), seasonal_order=(1, 1, 1, 7)).fit()
    fc = full_fit.get_forecast(steps=horizon)
    summary = fc.summary_frame(alpha=0.10)

    last_date = series.index[-1].date()
    points = []
    for i in range(horizon):
        d = last_date + timedelta(days=i + 1)
        points.append(ForecastPoint(
            date=d.isoformat(),
            value=max(0.0, round(summary["mean"].iloc[i], 1)),
            lower=max(0.0, round(summary["mean_ci_lower"].iloc[i], 1)),
            upper=max(0.0, round(summary["mean_ci_upper"].iloc[i], 1)),
        ))
    return points, ModelMetrics(mae=round(mae, 2), rmse=round(rmse, 2))


def run_ets(series: pd.Series, horizon: int) -> tuple[list[ForecastPoint], ModelMetrics]:
    from statsmodels.tsa.holtwinters import ExponentialSmoothing

    train = series.iloc[:-30]
    test = series.iloc[-30:]

    model = ExponentialSmoothing(train, trend="add", seasonal="add", seasonal_periods=7)
    fit = model.fit(optimized=True)

    val_fc = fit.forecast(30)
    mae = float(np.mean(np.abs(val_fc.values - test.values)))
    rmse = float(np.sqrt(np.mean((val_fc.values - test.values) ** 2)))

    full_fit = ExponentialSmoothing(series, trend="add", seasonal="add", seasonal_periods=7).fit(optimized=True)
    fc_values = full_fit.forecast(horizon)

    # compute prediction interval from residual std
    resid_std = float(np.std(full_fit.resid))
    z = 1.645  # 90% interval

    last_date = series.index[-1].date()
    points = []
    for i in range(horizon):
        d = last_date + timedelta(days=i + 1)
        v = max(0.0, round(float(fc_values.iloc[i]), 1))
        margin = round(z * resid_std * np.sqrt(i + 1), 1)
        points.append(ForecastPoint(
            date=d.isoformat(),
            value=v,
            lower=max(0.0, round(v - margin, 1)),
            upper=round(v + margin, 1),
        ))
    return points, ModelMetrics(mae=round(mae, 2), rmse=round(rmse, 2))


def run_linear_fourier(series: pd.Series, horizon: int) -> tuple[list[ForecastPoint], ModelMetrics]:
    from sklearn.linear_model import Ridge

    n = len(series)
    train_n = n - 30

    # Features: time trend + weekly (7) + yearly (365.25) Fourier terms
    all_dates = pd.date_range(series.index[0], periods=n + horizon, freq="D")
    X_all = np.column_stack([
        np.arange(len(all_dates), dtype=float),          # linear trend
        _fourier_features(all_dates, periods=[7, 365.25], n_terms=3),
    ])

    X_train = X_all[:train_n]
    y_train = series.values[:train_n]
    X_val   = X_all[train_n:n]
    y_val   = series.values[train_n:]
    X_fc    = X_all[n:]

    model = Ridge(alpha=1.0)
    model.fit(X_train, y_train)

    val_pred = model.predict(X_val)
    mae = float(np.mean(np.abs(val_pred - y_val)))
    rmse = float(np.sqrt(np.mean((val_pred - y_val) ** 2)))

    # refit on all data
    model.fit(X_all[:n], series.values)
    fc_values = model.predict(X_fc)

    resid = series.values - model.predict(X_all[:n])
    resid_std = float(np.std(resid))
    z = 1.645

    last_date = series.index[-1].date()
    points = []
    for i in range(horizon):
        d = last_date + timedelta(days=i + 1)
        v = max(0.0, round(float(fc_values[i]), 1))
        margin = round(z * resid_std, 1)
        points.append(ForecastPoint(
            date=d.isoformat(),
            value=v,
            lower=max(0.0, round(v - margin, 1)),
            upper=round(v + margin, 1),
        ))
    return points, ModelMetrics(mae=round(mae, 2), rmse=round(rmse, 2))


def generate_synthetic_history(n_days: int = 730) -> list[tuple[date, float]]:
    """Generate realistic synthetic daily test order counts for the past n_days."""
    rng = np.random.default_rng(42)
    end = date.today() - timedelta(days=1)
    start = end - timedelta(days=n_days - 1)

    dates = [start + timedelta(days=i) for i in range(n_days)]
    t = np.arange(n_days, dtype=float)

    trend = 40 + 0.015 * t
    weekly = -8 * np.sin(2 * np.pi * t / 7) - 4 * np.cos(2 * np.pi * t / 7)
    yearly = 12 * np.cos(2 * np.pi * t / 365.25) + 6 * np.sin(4 * np.pi * t / 365.25)
    noise = rng.normal(0, 4, n_days)

    counts = np.maximum(5, trend + weekly + yearly + noise)
    return [(d, round(float(v), 1)) for d, v in zip(dates, counts)]


def run_all_forecasts(
    history: list[tuple[date, float]],
    horizon: int = 90,
) -> dict:
    series = _make_series(history)

    arima_fc, arima_m = run_arima(series, horizon)
    ets_fc, ets_m     = run_ets(series, horizon)
    linear_fc, linear_m = run_linear_fourier(series, horizon)

    historical = [
        {"date": d.isoformat(), "value": round(v, 1)}
        for d, v in history[-180:]  # last 6 months visible in chart
    ]

    return {
        "historical": historical,
        "models": {
            "arima":  [p.__dict__ for p in arima_fc],
            "ets":    [p.__dict__ for p in ets_fc],
            "linear": [p.__dict__ for p in linear_fc],
        },
        "metrics": {
            "arima":  arima_m.__dict__,
            "ets":    ets_m.__dict__,
            "linear": linear_m.__dict__,
        },
    }
