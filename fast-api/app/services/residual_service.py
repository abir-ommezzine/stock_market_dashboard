# CHANGE: wrap all numpy values with float() or bool() before returning
# numpy.bool_, numpy.float64 etc. are not JSON serializable by Pydantic

import pandas as pd
import numpy as np
from statsmodels.stats.stattools import jarque_bera
from statsmodels.stats.diagnostic import acorr_ljungbox


def check_residuals(fitted_model) -> dict:
    try:
        residuals = fitted_model.resid

        residual_mean = float(np.mean(residuals))
        residual_std  = float(np.std(residuals))

        lb_result = acorr_ljungbox(residuals, lags=[10], return_df=True)
        prob_q = float(lb_result["lb_pvalue"].iloc[0])

        jb_stat, prob_jb, _, _ = jarque_bera(residuals)

        # CHANGE: explicitly cast to native Python bool — numpy.bool_ breaks Pydantic
        is_good = bool(prob_q > 0.05 and prob_jb > 0.05)

        return {
            "residual_mean":  round(residual_mean, 6),
            "residual_std":   round(residual_std, 4),
            "prob_q":         round(float(prob_q), 4),
            "prob_jb":        round(float(prob_jb), 4),
            # CHANGE: native Python bool, not numpy.bool_
            "is_good_fit":    is_good,
            "interpretation": (
                "Good fit: residuals look like white noise"
                if is_good else
                "Poor fit: residuals show patterns — try different p,q values"
            )
        }

    except Exception as e:
        print(f"[Residuals] Diagnostic failed: {e}")
        return {
            "residual_mean":  None,
            "residual_std":   None,
            "prob_q":         None,
            "prob_jb":        None,
            "is_good_fit":    None,
            "interpretation": f"Diagnostic failed: {e}"
        }