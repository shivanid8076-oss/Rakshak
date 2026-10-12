import psycopg2
import psycopg2.pool
import logging
from contextlib import contextmanager
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import json
import sys
import os
import uuid

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config

logger = logging.getLogger(__name__)

# ── In-memory Fallback Store ──────────────────────────────────────────────────
_in_mem_txns: Dict[str, Dict[str, Any]] = {}
_in_mem_decisions: Dict[str, Dict[str, Any]] = {}
_in_mem_cases: Dict[str, Dict[str, Any]] = {}
_in_mem_notes: List[Dict[str, Any]] = []

def _seed_in_memory_data():
    if _in_mem_txns:
        return

    now = datetime.utcnow()
    seeds = [
        {
            'txn_id': 'TXN-908234-UP',
            'sender_vpa_masked': 'ro**@okhdfcbank',
            'receiver_vpa_masked': 'qu**@ibl',
            'amount': 95000.0,
            'timestamp': (now - timedelta(minutes=7)).isoformat(),
            'device_id_hash': 'a8f192b10',
            'ip_hash': 'b439c288f',
            'gps_lat': 19.0760,
            'gps_lng': 72.8777,
            'merchant_code': None,
            'upi_app': 'PhonePe',
            'decision': 'BLOCK',
            'composite_score': 94.5,
            'ml_score': 92.1,
            'graph_score': 88.0,
            'anomaly_score': 96.2,
            'status': 'OPEN',
            'case_id': 'CASE-1001',
            'disposition': None,
            'assigned_analyst': 'analyst_1',
            'sla_deadline': (now + timedelta(minutes=23)).isoformat()
        },
        {
            'txn_id': 'TXN-883109-UP',
            'sender_vpa_masked': 'an**@okaxis',
            'receiver_vpa_masked': 'cr**@ybl',
            'amount': 48500.0,
            'timestamp': (now - timedelta(minutes=18)).isoformat(),
            'device_id_hash': 'd3198fbb1',
            'ip_hash': 'c0194aa82',
            'gps_lat': 28.6139,
            'gps_lng': 77.2090,
            'merchant_code': None,
            'upi_app': 'GooglePay',
            'decision': 'REVIEW',
            'composite_score': 74.2,
            'ml_score': 76.0,
            'graph_score': 68.5,
            'anomaly_score': 79.0,
            'status': 'OPEN',
            'case_id': 'CASE-1002',
            'disposition': None,
            'assigned_analyst': 'analyst_2',
            'sla_deadline': (now + timedelta(minutes=42)).isoformat()
        },
        {
            'txn_id': 'TXN-761234-UP',
            'sender_vpa_masked': 'vi**@paytm',
            'receiver_vpa_masked': 'ki**@paytm',
            'amount': 1450.0,
            'timestamp': (now - timedelta(minutes=25)).isoformat(),
            'device_id_hash': 'e9812401a',
            'ip_hash': 'f81200384',
            'gps_lat': 12.9716,
            'gps_lng': 77.5946,
            'merchant_code': 'KIRANA_STORE',
            'upi_app': 'Paytm',
            'decision': 'SAFE',
            'composite_score': 11.2,
            'ml_score': 9.5,
            'graph_score': 5.0,
            'anomaly_score': 14.1,
            'status': None,
            'case_id': None,
            'disposition': None,
            'assigned_analyst': None,
            'sla_deadline': None
        },
        {
            'txn_id': 'TXN-654921-UP',
            'sender_vpa_masked': 'sn**@icici',
            'receiver_vpa_masked': 'lo**@axl',
            'amount': 99000.0,
            'timestamp': (now - timedelta(minutes=38)).isoformat(),
            'device_id_hash': 'b901a883e',
            'ip_hash': 'd99104882',
            'gps_lat': 17.3850,
            'gps_lng': 78.4867,
            'merchant_code': None,
            'upi_app': 'PhonePe',
            'decision': 'BLOCK',
            'composite_score': 98.4,
            'ml_score': 98.0,
            'graph_score': 95.0,
            'anomaly_score': 97.2,
            'status': 'CLOSED',
            'case_id': 'CASE-1003',
            'disposition': 'TRUE_FRAUD',
            'assigned_analyst': 'analyst_1',
            'sla_deadline': (now - timedelta(minutes=5)).isoformat()
        },
        {
            'txn_id': 'TXN-554201-UP',
            'sender_vpa_masked': 'am**@upi',
            'receiver_vpa_masked': 'sw**@icici',
            'amount': 380.0,
            'timestamp': (now - timedelta(minutes=45)).isoformat(),
            'device_id_hash': 'a11223344',
            'ip_hash': 'c55667788',
            'gps_lat': 22.5726,
            'gps_lng': 88.3639,
            'merchant_code': 'FOOD_DELIVERY',
            'upi_app': 'Cred',
            'decision': 'SAFE',
            'composite_score': 6.5,
            'ml_score': 5.2,
            'graph_score': 4.0,
            'anomaly_score': 7.8,
            'status': None,
            'case_id': None,
            'disposition': None,
            'assigned_analyst': None,
            'sla_deadline': None
        }
    ]

    for s in seeds:
        _in_mem_txns[s['txn_id']] = {
            'txn_id': s['txn_id'],
            'sender_vpa_masked': s['sender_vpa_masked'],
            'receiver_vpa_masked': s['receiver_vpa_masked'],
            'amount': s['amount'],
            'timestamp': s['timestamp'],
            'device_id_hash': s['device_id_hash'],
            'ip_hash': s['ip_hash'],
            'gps_lat': s['gps_lat'],
            'gps_lng': s['gps_lng'],
            'merchant_code': s['merchant_code'],
            'upi_app': s['upi_app'],
            'raw_payload': {}
        }
        _in_mem_decisions[s['txn_id']] = {
            'txn_id': s['txn_id'],
            'composite_score': s['composite_score'],
            'ml_score': s['ml_score'],
            'graph_score': s['graph_score'],
            'anomaly_score': s['anomaly_score'],
            'decision': s['decision'],
            'model_version': '1.0',
            'shap_values': {
                'top5': [
                    {'feature': 'amount_vs_avg', 'shap_value': 0.35, 'direction': 'fraud'},
                    {'feature': 'is_new_receiver', 'shap_value': 0.28, 'direction': 'fraud'},
                    {'feature': 'receiver_count', 'shap_value': 0.22, 'direction': 'fraud'}
                ]
            }
        }
        if s.get('case_id'):
            _in_mem_cases[s['case_id']] = {
                'case_id': s['case_id'],
                'txn_id': s['txn_id'],
                'risk_score': s['composite_score'],
                'status': s['status'],
                'assigned_analyst': s['assigned_analyst'],
                'sla_deadline': s['sla_deadline'],
                'disposition': s['disposition'],
                'created_at': s['timestamp'],
                'closed_at': now.isoformat() if s['status'] == 'CLOSED' else None
            }

_seed_in_memory_data()

# ── Connection pool ───────────────────────────────────────────────────────────
_pool: Optional[psycopg2.pool.ThreadedConnectionPool] = None

def get_pool() -> Optional[psycopg2.pool.ThreadedConnectionPool]:
    global _pool
    if _pool is None:
        try:
            _pool = psycopg2.pool.ThreadedConnectionPool(
                minconn=1,
                maxconn=5,
                host=config.POSTGRES_HOST,
                port=config.POSTGRES_PORT,
                dbname=config.POSTGRES_DB,
                user=config.POSTGRES_USER,
                password=config.POSTGRES_PASSWORD,
                connect_timeout=3
            )
            logger.info("✓ TimescaleDB connection pool created")
        except Exception as e:
            logger.warning(f"TimescaleDB connection pool unavailable, using in-memory fallback store: {e}")
            _pool = None
    return _pool

@contextmanager
def get_conn():
    pool = get_pool()
    if pool is None:
        raise ConnectionError("TimescaleDB pool is not available")
    conn = pool.getconn()
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        pool.putconn(conn)

def check_connection() -> bool:
    try:
        with get_conn() as conn:
            cur = conn.cursor()
            cur.execute("SELECT 1")
            return True
    except Exception:
        return False

# ── Transaction operations ────────────────────────────────────────────────────
def insert_transaction(txn: Dict[str, Any]) -> bool:
    _in_mem_txns[txn['txn_id']] = dict(txn)
    sql = """
        INSERT INTO transactions (
            txn_id, sender_vpa_masked, receiver_vpa_masked,
            amount, timestamp, device_id_hash, ip_hash,
            gps_lat, gps_lng, merchant_code, upi_app, raw_payload
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        ) ON CONFLICT DO NOTHING
    """
    try:
        with get_conn() as conn:
            cur = conn.cursor()
            cur.execute(sql, (
                txn['txn_id'],
                txn['sender_vpa_masked'],
                txn['receiver_vpa_masked'],
                txn['amount'],
                txn['timestamp'],
                txn.get('device_id_hash'),
                txn.get('ip_hash'),
                txn.get('gps_lat'),
                txn.get('gps_lng'),
                txn.get('merchant_code'),
                txn.get('upi_app'),
                json.dumps(txn.get('raw_payload', {}))
            ))
        return True
    except Exception as e:
        logger.debug(f"insert_transaction using fallback store: {e}")
        return True

def insert_decision(decision: Dict[str, Any]) -> bool:
    _in_mem_decisions[decision['txn_id']] = dict(decision)
    sql = """
        INSERT INTO fraud_decisions (
            txn_id, composite_score, ml_score, graph_score,
            anomaly_score, decision, model_version, shap_values
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    try:
        with get_conn() as conn:
            cur = conn.cursor()
            cur.execute(sql, (
                decision['txn_id'],
                decision['composite_score'],
                decision['ml_score'],
                decision['graph_score'],
                decision['anomaly_score'],
                decision['decision'],
                decision.get('model_version', '1.0'),
                json.dumps(decision.get('shap_values', {}))
            ))
        return True
    except Exception as e:
        logger.debug(f"insert_decision using fallback store: {e}")
        return True

def create_case(case: Dict[str, Any]) -> Optional[str]:
    case_id = f"CASE-{len(_in_mem_cases) + 1001}"
    _in_mem_cases[case_id] = {
        'case_id': case_id,
        'txn_id': case['txn_id'],
        'risk_score': case['risk_score'],
        'status': case.get('status', 'OPEN'),
        'assigned_analyst': case.get('assigned_analyst', 'analyst_1'),
        'sla_deadline': str(case.get('sla_deadline', datetime.utcnow() + timedelta(minutes=30))),
        'disposition': None,
        'created_at': datetime.utcnow().isoformat(),
        'closed_at': None
    }
    sql = """
        INSERT INTO fraud_cases (
            txn_id, risk_score, status,
            assigned_analyst, sla_deadline
        ) VALUES (%s, %s, %s, %s, %s)
        RETURNING case_id
    """
    try:
        with get_conn() as conn:
            cur = conn.cursor()
            cur.execute(sql, (
                case['txn_id'],
                case['risk_score'],
                case.get('status', 'OPEN'),
                case.get('assigned_analyst'),
                case.get('sla_deadline')
            ))
            row = cur.fetchone()
            return str(row[0]) if row else case_id
    except Exception as e:
        logger.debug(f"create_case using fallback store: {e}")
        return case_id

def get_cases(status: Optional[str] = None,
              analyst: Optional[str] = None,
              limit: int = 50) -> List[Dict]:
    conditions = []
    params = []

    if status:
        conditions.append("status = %s")
        params.append(status)
    if analyst:
        conditions.append("assigned_analyst = %s")
        params.append(analyst)

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    sql = f"""
        SELECT case_id, txn_id, risk_score, status,
               assigned_analyst, sla_deadline, disposition,
               created_at, closed_at
        FROM fraud_cases
        {where}
        ORDER BY risk_score DESC, created_at DESC
        LIMIT %s
    """
    params.append(limit)

    try:
        with get_conn() as conn:
            cur = conn.cursor()
            cur.execute(sql, params)
            cols = [d[0] for d in cur.description]
            rows = [dict(zip(cols, row)) for row in cur.fetchall()]
            if rows:
                return rows
    except Exception:
        pass

    # Fallback to in-memory cases
    results = list(_in_mem_cases.values())
    if status:
        results = [c for c in results if c.get('status') == status]
    if analyst:
        results = [c for c in results if c.get('assigned_analyst') == analyst]
    results.sort(key=lambda x: x.get('risk_score', 0), reverse=True)
    return results[:limit]

def update_case_disposition(case_id: str, disposition: str,
                             notes: str, analyst_id: str) -> bool:
    if case_id in _in_mem_cases:
        _in_mem_cases[case_id]['disposition'] = disposition
        _in_mem_cases[case_id]['status'] = 'CLOSED'
        _in_mem_cases[case_id]['closed_at'] = datetime.utcnow().isoformat()

    sql = """
        UPDATE fraud_cases
        SET disposition = %s,
            disposition_notes = %s,
            status = 'CLOSED',
            closed_at = NOW()
        WHERE case_id = %s
    """
    try:
        with get_conn() as conn:
            cur = conn.cursor()
            cur.execute(sql, (disposition, notes, case_id))
        return True
    except Exception:
        return True

def get_recent_transactions(limit: int = 100,
                             decision: Optional[str] = None) -> List[Dict]:
    conditions = []
    params = []
    if decision:
        conditions.append("fd.decision = %s")
        params.append(decision)

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    sql = f"""
        SELECT t.txn_id, t.sender_vpa_masked, t.amount,
               fd.decision, fd.composite_score, t.timestamp
        FROM transactions t
        LEFT JOIN fraud_decisions fd ON t.txn_id = fd.txn_id
        {where}
        ORDER BY t.timestamp DESC
        LIMIT %s
    """
    params.append(limit)
    try:
        with get_conn() as conn:
            cur = conn.cursor()
            cur.execute(sql, params)
            cols = [d[0] for d in cur.description]
            rows = [dict(zip(cols, row)) for row in cur.fetchall()]
            if rows:
                return rows
    except Exception:
        pass

    # Fallback in-memory
    rows = []
    for tid, t in _in_mem_txns.items():
        dec = _in_mem_decisions.get(tid, {})
        d_val = dec.get('decision', 'SAFE')
        if decision and d_val != decision:
            continue
        rows.append({
            'txn_id': tid,
            'sender_vpa_masked': t.get('sender_vpa_masked', '***'),
            'amount': float(t.get('amount', 0)),
            'decision': d_val,
            'composite_score': float(dec.get('composite_score', 0)),
            'timestamp': t.get('timestamp')
        })
    rows.sort(key=lambda x: str(x.get('timestamp', '')), reverse=True)
    return rows[:limit]

def get_transaction_detail(txn_id: str) -> Optional[Dict]:
    sql = """
        SELECT t.txn_id, t.sender_vpa_masked, t.receiver_vpa_masked,
               t.amount, t.timestamp, t.upi_app,
               fd.decision, fd.composite_score, fd.ml_score,
               fd.graph_score, fd.anomaly_score, fd.shap_values,
               fd.model_version
        FROM transactions t
        LEFT JOIN fraud_decisions fd ON t.txn_id = fd.txn_id
        WHERE t.txn_id = %s
    """
    try:
        with get_conn() as conn:
            cur = conn.cursor()
            cur.execute(sql, (txn_id,))
            row = cur.fetchone()
            if row:
                cols = [d[0] for d in cur.description]
                return dict(zip(cols, row))
    except Exception:
        pass

    # In-memory lookup
    t = _in_mem_txns.get(txn_id)
    if not t:
        return None
    dec = _in_mem_decisions.get(txn_id, {})
    return {
        'txn_id': t['txn_id'],
        'sender_vpa_masked': t.get('sender_vpa_masked', '***'),
        'receiver_vpa_masked': t.get('receiver_vpa_masked', '***'),
        'amount': float(t.get('amount', 0)),
        'timestamp': t.get('timestamp'),
        'upi_app': t.get('upi_app', 'PhonePe'),
        'decision': dec.get('decision', 'SAFE'),
        'composite_score': float(dec.get('composite_score', 0)),
        'ml_score': float(dec.get('ml_score', 0)),
        'graph_score': float(dec.get('graph_score', 0)),
        'anomaly_score': float(dec.get('anomaly_score', 0)),
        'shap_values': dec.get('shap_values', {}),
        'model_version': dec.get('model_version', '1.0')
    }