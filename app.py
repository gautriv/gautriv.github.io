from flask import Flask, jsonify
from flask_cors import CORS
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime
import pytz
import logging
import threading
import time
import os

from nifty500 import NIFTY_500_STOCKS

# ==========================================
# 1. SYSTEM LOGGING & CONFIGURATION
# ==========================================
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
CORS(app)

TOTAL_CAPITAL = 100000
BULLET_SIZE = 25000  # 25% allocation per trade
NIFTY_STOCKS = NIFTY_500_STOCKS
scan_lock = threading.Lock()

scan_cache = {"data": None, "timestamp": 0}
CACHE_TTL = 300 

# ==========================================
# 2. THE BLOOMBERG-ENVY QUANT ENGINES
# ==========================================
def get_nearest_round_number(price):
    if price > 1000: return round(price / 100) * 100
    return round(price / 50) * 50

def calculate_atr(df, period=14):
    high_low = df['High'] - df['Low']
    high_close = np.abs(df['High'] - df['Close'].shift())
    low_close = np.abs(df['Low'] - df['Close'].shift())
    ranges = pd.concat([high_low, high_close, low_close], axis=1)
    return np.max(ranges, axis=1).rolling(period).mean()

def calculate_evr(vol_z_score, body, curr_atr):
    if not np.isfinite(curr_atr) or curr_atr <= 0:
        return 0.0
    effort = max(vol_z_score, 0.1) 
    result = max(body / curr_atr, 0.05) 
    return effort / result

def map_liquidity_cascades(df):
    is_swing_low = (df['Low'] < df['Low'].shift(1)) & (df['Low'] < df['Low'].shift(2)) & \
                   (df['Low'] < df['Low'].shift(-1)) & (df['Low'] < df['Low'].shift(-2))
    return df['Low'][is_swing_low].dropna()

def detect_virgin_order_blocks(df, atr_series):
    """SMC: Finds only VIRGIN zones where Institutional Limit Buyers are waiting"""
    order_blocks = []
    for i in range(2, len(df)-1):
        # Displacement > 1.2x ATR
        if (df['Close'].iloc[i] - df['Open'].iloc[i]) > (atr_series.iloc[i] * 1.2):
            if df['Close'].iloc[i-1] < df['Open'].iloc[i-1]: # Prior red candle
                ob_high = df['High'].iloc[i-1]
                ob_low = df['Low'].iloc[i-1]
                
                # Check for Mitigation (Did price ever touch it again?)
                mitigated = False
                for j in range(i+1, len(df)-1):
                    if df['Low'].iloc[j] <= ob_high:
                        mitigated = True
                        break
                
                if not mitigated:
                    order_blocks.append((ob_low, ob_high))
    return order_blocks

def detect_choch(df):
    """SMC: Change of Character (Engulfing yesterday's selling pressure)"""
    prev_high_body = max(df['Open'].iloc[-2], df['Close'].iloc[-2])
    return df['Close'].iloc[-1] > prev_high_body

# ==========================================
# 3. THE CORE SCANNER
# ==========================================
def get_hunter_signals():
    logging.info("===============================================================")
    logging.info("--- STARTING SOVEREIGN HUNTER (v16.0 FULL VERBOSE) SCAN ---")
    logging.info("===============================================================")
    recommendations = []
    
    IST = pytz.timezone('Asia/Kolkata')
    current_time = datetime.now(IST)
    is_closing_window = current_time.hour == 15 and current_time.minute >= 15

    # MARKET CONTEXT
    try:
        nifty = yf.Ticker("^NSEI").history(period="5d", interval="1d").dropna()
        n_curr = nifty.iloc[-1]
        n_close, n_open, n_low, n_high = n_curr['Close'], n_curr['Open'], n_curr['Low'], n_curr['High']
        n_change = (n_close - n_open) / n_open
        n_stable = n_close > (n_low + (n_high - n_low) * 0.2)
    except:
        n_stable, n_change = False, 0.0

    total_stocks = len(NIFTY_STOCKS)
    for idx, ticker in enumerate(NIFTY_STOCKS):
        logging.info(f"Scanning [{idx+1}/{total_stocks}] {ticker}...")
        
        try:
            df = yf.Ticker(ticker).history(period="90d", interval="1d").dropna()
            if len(df) < 30: 
                logging.info(f"    [-] Skipped. Insufficient data.")
                continue

            df['ATR'] = calculate_atr(df)
            curr = df.iloc[-1]
            c_close, c_open, c_low, c_vol = curr['Close'], curr['Open'], curr['Low'], curr['Volume']
            c_atr = df['ATR'].iloc[-1]
            s_change = (c_close - c_open) / c_open

            # VOL ANOMALY (Z-SCORE)
            v_mean, v_std = df['Volume'].iloc[-21:-1].mean(), df['Volume'].iloc[-21:-1].std()
            v_std = 1 if v_std == 0 or pd.isna(v_std) else v_std
            vol_z = (c_vol - v_mean) / v_std

            # TRAP MAPS
            classic_target = min(df['Low'].iloc[-20:-1].min(), get_nearest_round_number(c_close))
            swing_lows = map_liquidity_cascades(df.iloc[:-1]) 
            virgin_obs = detect_virgin_order_blocks(df, df['ATR'])
            
            # SWEEP MATH
            swept_cascades = swing_lows[(swing_lows >= c_low) & (swing_lows <= c_close)]
            num_cascades = len(swept_cascades)
            tapped_ob = any(c_low <= (h * 1.002) and c_close >= (l * 0.998) for l, h in virgin_obs[-3:])

            # CORE LOGIC
            is_classic_hunt = c_low < classic_target and c_close > classic_target
            is_cascade_hunt = num_cascades > 0 and c_close > swept_cascades.max()
            hunted_and_reclaimed = is_classic_hunt or is_cascade_hunt

            # PHYSICS & CHARACTER
            body = abs(c_close - c_open)
            lower_wick = min(c_close, c_open) - c_low
            evr = calculate_evr(vol_z, body, c_atr)
            is_immune = (n_change < -0.005 and s_change > 0)
            choch = detect_choch(df)

            # --- THE GAUNTLET LOGGING ---
            if not hunted_and_reclaimed:
                logging.info(f"    [-] Skipped. No Liquidity Trap triggered.")
            elif not choch:
                logging.info(f"    [▼] VETO. Trap triggered, but FAILED Change of Character.")
            elif vol_z < 1.0: 
                logging.info(f"    [!] VETO. Weak Volume Z-Score ({round(vol_z, 2)}σ).")
            elif not ((lower_wick > (body * 1.5)) and (lower_wick > (c_atr * 0.3))):
                logging.info(f"    [!] VETO. Rejection wick too small.")
            elif evr < 1.5:
                logging.info(f"    [!] VETO. Effort vs Result Physics ({round(evr, 2)}) too weak.")
            elif not tapped_ob and num_cascades == 0:
                logging.info(f"    [!] VETO. No SMC clusters or Unmitigated OBs present.")
            elif not n_stable and not is_immune:
                logging.warning(f"    [X] VETO. Nifty is crashing and stock lacks Immunity.")
            
            # --- START OF THE SLAYER SCORE ADDITION ---
            else:
                # 1. CALCULATE THE SLAYER SCORE
                ob_points = 50 if tapped_ob else 0
                cascade_points = num_cascades * 15
                evr_points = evr * 10
                z_points = vol_z * 10
                immunity_points = 25 if is_immune else 0
                
                slayer_score = ob_points + cascade_points + evr_points + z_points + immunity_points

                # 2. POSITION & TARGET MATH
                stop_loss = c_low - (c_atr * 0.1) 
                risk_per_share = c_close - stop_loss
                qty = int(BULLET_SIZE / c_close)
                if qty < 1:
                    logging.info(f"    [-] Skipped. Bullet size cannot purchase a single share.")
                    continue
                target = c_close + (risk_per_share * 3) 
                
                trap_type = "Cascade+Classic" if is_classic_hunt and is_cascade_hunt else ("Cascade" if is_cascade_hunt else "Classic")

                logging.info(f"    ==================================================")
                logging.info(f"    👑 SOVEREIGN TARGET ACQUIRED: {ticker} 👑")
                logging.info(f"       - Slayer Score: {round(slayer_score, 2)}")
                logging.info(f"       - Trap: {trap_type} (Cascades: {num_cascades})")
                logging.info(f"       - Unmitigated OB Tapped: {tapped_ob}")
                logging.info(f"       - EvR Physics: {round(evr, 2)} (Vol: +{round(vol_z, 2)}σ)")
                logging.info(f"    ==================================================")

                recommendations.append({
                    "ticker": ticker,
                    "entry": round(c_close, 2),
                    "sl": round(stop_loss, 2),
                    "target": round(target, 2),
                    "qty": qty,
                    "score": round(slayer_score, 2), # FOR DASHBOARD RANKING
                    "status": "VALID" if is_closing_window else "STALKING",
                    "game_detected": f"Trap: {trap_type}. Cascades: {num_cascades}. Virgin OB Tapped: {tapped_ob}. EvR Physics: {round(evr, 2)}."
                })
            # --- END OF THE SLAYER SCORE ADDITION ---

        except Exception as e:
            logging.error(f"Error processing {ticker}: {e}")
            
    # --- THE SORTING MASTERSTROKE ---
    # This happens OUTSIDE the for loop, after all 500 stocks are processed
    recommendations = sorted(recommendations, key=lambda x: x['score'], reverse=True)
    
    logging.info(f"--- Apex Predator Scan Complete! Found {len(recommendations)} Valid Targets. ---")
    return recommendations

# ==========================================
# 5. FLASK ROUTES
# ==========================================
@app.route('/api/signals')
def get_signals():
    with scan_lock:
        current_time = time.time()
        if scan_cache["data"] is not None and (current_time - scan_cache["timestamp"] < CACHE_TTL):
            return jsonify({"status": "success", "data": scan_cache["data"], "nifty_hunter_version": "15.0-APEX-PREDATOR (Cached)"})

        signals = get_hunter_signals()
        scan_cache["data"] = signals
        scan_cache["timestamp"] = time.time()

    return jsonify({"status": "success", "data": signals, "nifty_hunter_version": "15.0-APEX-PREDATOR"})

if __name__ == '__main__':
    app.run(debug=os.getenv("FLASK_DEBUG") == "1", port=5001)