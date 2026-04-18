from flask import Flask, jsonify
from flask_cors import CORS
import yfinance as yf
import pandas as pd
import numpy as np
import math
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
BULLET_SIZE = int(TOTAL_CAPITAL * 0.25)  # 25% allocation per trade
NIFTY_STOCKS = NIFTY_500_STOCKS
scan_lock = threading.Lock()

VERSION = "16.1-APEX-PREDATOR"
scan_cache = {
    "data": None, 
    "timestamp": 0, 
    "refreshing": False,
    "last_failure": 0,
    "last_error": None
}
CACHE_TTL = 300 
FAILURE_BACKOFF = 60

# ==========================================
# 2. THE BLOOMBERG-ENVY QUANT ENGINES
# ==========================================
def get_nearest_round_number(price):
    step = 100 if price > 1000 else 50
    return int(math.floor(price / step + 0.5) * step)

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

def detect_order_block_states(df, atr_series):
    """
    SMC: Finds Institutional Zones and categorizes them as:
    - 'VIRGIN': Untouched limit orders waiting.
    - 'SWEPT': Wick tapped the zone, but body rejected (Highly Bullish).
    - Ignores 'BREACHED' zones where the candle closed inside/below.
    """
    valid_order_blocks = []
    
    for i in range(2, len(df)-1):
        # 1. Identify Displacement (Institutional buying pressure > 1.2x ATR)
        if (df['Close'].iloc[i] - df['Open'].iloc[i]) > (atr_series.iloc[i] * 1.2):
            if df['Close'].iloc[i-1] < df['Open'].iloc[i-1]: # Prior candle was red
                ob_high = df['High'].iloc[i-1]
                ob_low = df['Low'].iloc[i-1]
                
                # Assume it's a virgin block until proven otherwise
                ob_state = "VIRGIN"
                
                # 2. The Mitigation Gauntlet
                for j in range(i+1, len(df)-1):
                    future_low = df['Low'].iloc[j]
                    future_close = df['Close'].iloc[j]
                    
                    # CONDITION A: THE DEATH BLOW (Body Breach)
                    # If the candle CLOSES inside or below the OB, the zone is invalidated.
                    if future_close <= ob_high:
                        ob_state = "BREACHED"
                        break # Zone is dead, stop checking future candles
                        
                    # CONDITION B: THE LIQUIDITY SWEEP (Wick Tap)
                    # The low pierced the zone, but the close was safely above it.
                    elif future_low <= ob_high and future_close > ob_high:
                        ob_state = "SWEPT"
                        # We DO NOT break here. A swept OB is still a valid support zone,
                        # but we update its state because a SWEPT block is a high-probability trigger.
                
                # 3. Only keep zones that survived the gauntlet
                if ob_state != "BREACHED":
                    valid_order_blocks.append({
                        "ob_low": ob_low,
                        "ob_high": ob_high,
                        "state": ob_state
                    })
                    
    return valid_order_blocks

def detect_choch(df):
    """
    SMC: True Change of Character (ChoCh)
    Requires the current price to break above the most recent structural Swing High.
    """
    historical_df = df.iloc[:-1]
    
    is_swing_high = (historical_df['High'] > historical_df['High'].shift(1)) & \
                    (historical_df['High'] > historical_df['High'].shift(2)) & \
                    (historical_df['High'] > historical_df['High'].shift(-1)) & \
                    (historical_df['High'] > historical_df['High'].shift(-2))
                    
    swing_highs = historical_df['High'][is_swing_high].dropna()
    
    if len(swing_highs) == 0:
        return False
        
    last_swing_high = swing_highs.iloc[-1]
    
    return df['Close'].iloc[-1] > last_swing_high

# ==========================================
# 3. THE CORE SCANNER
# ==========================================
def get_hunter_signals():
    logging.info("===============================================================")
    logging.info(f"--- STARTING SOVEREIGN HUNTER ({VERSION}) SCAN ---")
    logging.info("===============================================================")
    recommendations = []
    failed_fetches = 0
    
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
    except Exception as exc:
        # FIX: Abort entirely if NIFTY fails. Do not buy blindly into the dark.
        logging.error(f"CRITICAL: Failed to load NIFTY context: {exc}. Aborting scan to protect capital.")
        return None

    # 2. BATCH DOWNLOAD (RATE-LIMIT PROTECTION)
    logging.info(f"Initiating batch download for {len(NIFTY_STOCKS)} NIFTY stocks...")
    try:
        # Downloads all 500 stocks in a single API call
        batch_data = yf.download(NIFTY_STOCKS, period="90d", interval="1d", group_by="ticker", threads=True, progress=False)
    except Exception as e:
        logging.error(f"CRITICAL: Batch download failed: {e}")
        return None

    total_stocks = len(NIFTY_STOCKS)
    for idx, ticker in enumerate(NIFTY_STOCKS):
        
        try:
            # Extract individual stock data from the batch
            if ticker in batch_data:
                df = batch_data[ticker].dropna()
            else:
                logging.info(f"    [-] {ticker} Skipped. Not found in batch data.")
                continue
                
            if len(df) < 30: 
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
            valid_obs = detect_order_block_states(df, df['ATR'])
            
            # SWEEP MATH
            swept_cascades = swing_lows[(swing_lows >= c_low) & (swing_lows <= c_close)]
            num_cascades = len(swept_cascades)
            is_virgin_tap = any(c_low <= (ob['ob_high'] * 1.002) and ob['state'] == "VIRGIN" for ob in valid_obs[-3:])
            is_swept_tap = any(c_low <= (ob['ob_high'] * 1.002) and ob['state'] == "SWEPT" for ob in valid_obs[-3:])
            is_any_ob_tap = is_virgin_tap or is_swept_tap

            # CORE LOGIC
            is_classic_hunt = c_low < classic_target and c_close > classic_target
            is_cascade_hunt = num_cascades > 0 and c_close > swept_cascades.max()
            hunted_and_reclaimed = is_classic_hunt or is_cascade_hunt

            # PHYSICS & CHARACTER
            body = abs(c_close - c_open)
            lower_wick = min(c_close, c_open) - c_low
            evr = calculate_evr(vol_z, body, c_atr)
            is_immune = (n_change is not None and n_change < -0.005 and s_change > 0)
            choch = detect_choch(df)

            # --- THE GAUNTLET LOGGING ---
            if not hunted_and_reclaimed:
                continue # Silent skip to reduce log clutter
            elif not choch:
                logging.info(f"    [▼] {ticker}: VETO. Trap triggered, but FAILED Change of Character.")
            elif vol_z < 1.0: 
                logging.info(f"    [!] {ticker}: VETO. Weak Volume Z-Score ({round(vol_z, 2)}σ).")
            elif not ((lower_wick > (body * 1.5)) and (lower_wick > (c_atr * 0.3))):
                logging.info(f"    [!] {ticker}: VETO. Rejection wick too small.")
            elif evr < 1.5:
                logging.info(f"    [!] {ticker}: VETO. Effort vs Result Physics ({round(evr, 2)}) too weak.")
            elif not is_any_ob_tap and num_cascades == 0:
                logging.info(f"    [!] {ticker}: VETO. No SMC clusters or Valid OBs present.")
            elif n_stable is False and not is_immune:
                logging.warning(f"    [X] {ticker}: VETO. Nifty is crashing and stock lacks Immunity.")
            
            # --- START OF THE SLAYER SCORE ADDITION ---
            else:
                # 1. CALCULATE THE SLAYER SCORE
                ob_points = 0
                if is_swept_tap:
                    ob_points = 75
                elif is_virgin_tap:
                    ob_points = 40
                
                cascade_points = num_cascades * 15
                evr_points = evr * 10
                z_points = vol_z * 10
                immunity_points = 25 if is_immune else 0
                
                slayer_score = ob_points + cascade_points + evr_points + z_points + immunity_points

                # 2. POSITION & TARGET MATH
                # FIX: Stop Loss buffer increased to 0.5 ATR to survive retail hunting
                stop_loss = c_low - (c_atr * 0.5) 
                risk_per_share = c_close - stop_loss
                if risk_per_share <= 0:
                    logging.info(f"    [-] {ticker}: Skipped. Invalid risk calculation.")
                    continue
                qty = int(BULLET_SIZE / c_close)
                if qty < 1:
                    logging.info(f"    [-] {ticker}: Skipped. Bullet size cannot purchase a single share.")
                    continue
                target = c_close + (risk_per_share * 3) 
                
                # FIX: Max entry price to invalidate the trade if it gaps up the next morning
                max_entry = c_close + (c_atr * 0.15)
                
                trap_type = "Cascade+Classic" if is_classic_hunt and is_cascade_hunt else ("Cascade" if is_cascade_hunt else "Classic")

                logging.info("    ==================================================")
                logging.info(f"    👑 SOVEREIGN TARGET ACQUIRED: {ticker} 👑")
                logging.info(f"       - Slayer Score: {round(slayer_score, 2)}")
                logging.info(f"       - Trap: {trap_type} (Cascades: {num_cascades})")
                logging.info(f"       - OB Action: Swept {is_swept_tap} | Virgin {is_virgin_tap}")
                logging.info(f"       - EvR Physics: {round(evr, 2)} (Vol: +{round(vol_z, 2)}σ)")
                logging.info("    ==================================================")

                recommendations.append({
                    "ticker": ticker,
                    "ideal_entry": round(c_close, 2),
                    "max_entry": round(max_entry, 2), # Do not buy above this price
                    "sl": round(stop_loss, 2),
                    "target": round(target, 2),
                    "qty": qty,
                    "score": round(slayer_score, 2), # FOR DASHBOARD RANKING
                    "status": "VALID" if is_closing_window else "STALKING",
                    "game_detected": f"Trap: {trap_type}. Cascades: {num_cascades}. OB Action: Swept {is_swept_tap} | Virgin {is_virgin_tap}. EvR Physics: {round(evr, 2)}."
                })
            # --- END OF THE SLAYER SCORE ADDITION ---

        except Exception as e:
            logging.error(f"Error processing {ticker}: {e}")
            failed_fetches += 1
            
    if failed_fetches > (total_stocks * 0.2):
        logging.error(f"CRITICAL: {failed_fetches}/{total_stocks} stocks failed to fetch. Aborting scan to prevent false zero-trades.")
        return None

    # --- THE SORTING MASTERSTROKE ---
    # This happens OUTSIDE the for loop, after all 500 stocks are processed
    recommendations = sorted(recommendations, key=lambda x: x['score'], reverse=True)
    
    logging.info(f"--- Apex Predator Scan Complete! Found {len(recommendations)} Valid Targets. ---")
    return recommendations

# ==========================================
# 5. FLASK ROUTES
# ==========================================
def run_background_scan():
    try:
        signals = get_hunter_signals()
        if signals is not None:
            with scan_lock:
                scan_cache["data"] = signals
                scan_cache["timestamp"] = time.time()
                scan_cache["refreshing"] = False
                scan_cache["last_failure"] = 0
                scan_cache["last_error"] = None
        else:
            logging.error("Scan aborted due to massive data failure.")
            with scan_lock:
                scan_cache["refreshing"] = False
                scan_cache["last_failure"] = time.time()
                scan_cache["last_error"] = "Scan aborted due to massive data failure."
    except Exception as e:
        logging.error(f"Background scan crashed: {e}")
        with scan_lock:
            scan_cache["refreshing"] = False
            scan_cache["last_failure"] = time.time()
            scan_cache["last_error"] = str(e)

@app.route('/api/signals')
def get_signals():
    with scan_lock:
        current_time = time.time()
        # 1. Fresh cache -> serve immediately
        if scan_cache["data"] is not None and (current_time - scan_cache["timestamp"] < CACHE_TTL):
            return jsonify({"status": "success", "data": scan_cache["data"], "nifty_hunter_version": f"{VERSION} (Cached)"})

        # 2. Cache missing or stale -> trigger background scan if not already refreshing
        recent_failure = (
            scan_cache.get("last_failure", 0) > 0
            and current_time - scan_cache["last_failure"] < FAILURE_BACKOFF
        )
        if not scan_cache.get("refreshing", False) and not recent_failure:
            scan_cache["refreshing"] = True
            threading.Thread(target=run_background_scan, daemon=True).start()

        # 3. Serve stale cache if available while refreshing
        if scan_cache["data"] is not None:
            return jsonify({"status": "success", "data": scan_cache["data"], "nifty_hunter_version": f"{VERSION} (Stale, Refreshing)"})
        
        # 4. Handle recent failure without cache
        if recent_failure:
            return jsonify({
                "status": "error",
                "message": scan_cache.get("last_error", "Latest refresh failed. Retry later."),
                "nifty_hunter_version": VERSION,
            }), 503

        # 5. Total cold start -> return 202
        return jsonify({"status": "accepted", "message": "Scan is running in background. Please wait.", "nifty_hunter_version": VERSION}), 202

if __name__ == '__main__':
    app.run(debug=os.getenv("FLASK_DEBUG") == "1", port=5001)