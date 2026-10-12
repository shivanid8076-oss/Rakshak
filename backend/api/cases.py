import logging
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.schemas import (CaseResponse, DispositionRequest,
                             CaseNoteRequest, CaseStatus)
from database.timescale import (get_cases, update_case_disposition,
                                 get_conn)
import json

logger = logging.getLogger(__name__)
router = APIRouter()


def _parse_dt(val) -> Optional[datetime]:
    if isinstance(val, datetime):
        return val
    if isinstance(val, str):
        try:
            return datetime.fromisoformat(val)
        except Exception:
            return None
    return None

def _parse_disposition(val):
    if not val:
        return None
    try:
        return Disposition(val)
    except Exception:
        if str(val).upper() in ("CONFIRMED_FRAUD", "FRAUD"):
            return Disposition.TRUE_FRAUD
        return None

def _parse_status(val):
    try:
        return CaseStatus(val)
    except Exception:
        return CaseStatus.OPEN

@router.get("/cases", response_model=List[CaseResponse])
async def list_cases(
    status:   Optional[str] = Query(None, example="OPEN"),
    analyst:  Optional[str] = Query(None),
    limit:    int           = Query(50, le=200)
):
    rows = get_cases(status=status, analyst=analyst, limit=limit)
    return [
        CaseResponse(
            case_id          = str(r['case_id']),
            txn_id           = str(r['txn_id']),
            risk_score       = float(r.get('risk_score', 0)),
            status           = _parse_status(r.get('status')),
            assigned_analyst = r.get('assigned_analyst'),
            sla_deadline     = _parse_dt(r.get('sla_deadline')),
            disposition      = _parse_disposition(r.get('disposition')),
            created_at       = _parse_dt(r.get('created_at')) or datetime.utcnow()
        )
        for r in rows
    ]


@router.get("/cases/{case_id}", response_model=CaseResponse)
async def get_case(case_id: str):
    rows = get_cases(limit=1000)
    for r in rows:
        if str(r['case_id']) == case_id:
            return CaseResponse(
                case_id          = str(r['case_id']),
                txn_id           = str(r['txn_id']),
                risk_score       = float(r.get('risk_score', 0)),
                status           = _parse_status(r.get('status')),
                assigned_analyst = r.get('assigned_analyst'),
                sla_deadline     = _parse_dt(r.get('sla_deadline')),
                disposition      = _parse_disposition(r.get('disposition')),
                created_at       = _parse_dt(r.get('created_at')) or datetime.utcnow()
            )
    raise HTTPException(status_code=404, detail="Case not found")


@router.patch("/cases/{case_id}/disposition")
async def submit_disposition(case_id: str, body: DispositionRequest):
    success = update_case_disposition(
        case_id    = case_id,
        disposition = body.disposition.value,
        notes       = body.notes,
        analyst_id  = body.analyst_id
    )
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update disposition")
    return {
        "case_id":     case_id,
        "disposition": body.disposition.value,
        "updated_at":  datetime.utcnow().isoformat(),
        "label_queued": True
    }


@router.post("/cases/{case_id}/notes")
async def add_note(case_id: str, body: CaseNoteRequest):
    sql = """
        INSERT INTO analyst_actions (analyst_id, case_id, action_type, details)
        VALUES (%s, %s, 'NOTE', %s)
        RETURNING action_id, created_at
    """
    try:
        with get_conn() as conn:
            cur = conn.cursor()
            cur.execute(sql, (
                body.analyst_id,
                case_id,
                json.dumps({'content': body.content})
            ))
            row = cur.fetchone()
            return {
                "note_id":    str(row[0]),
                "case_id":    case_id,
                "content":    body.content,
                "created_at": row[1].isoformat()
            }
    except Exception:
        import uuid
        return {
            "note_id":    str(uuid.uuid4())[:8],
            "case_id":    case_id,
            "content":    body.content,
            "created_at": datetime.utcnow().isoformat()
        }


@router.get("/cases/{case_id}/similar")
async def get_similar_cases(case_id: str, limit: int = 3):
    """Get semantically similar past cases via ChromaDB."""
    try:
        import chromadb
        from database.timescale import get_cases
        import config

        # Get the case to find its risk score
        rows = get_cases(limit=1000)
        case = next((r for r in rows if str(r['case_id']) == case_id), None)
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")

        client     = chromadb.HttpClient(host=config.CHROMA_HOST,
                                          port=config.CHROMA_PORT)
        collection = client.get_or_create_collection("fraud_cases")

        query_text = f"fraud case risk score {case['risk_score']:.0f} status {case.get('status','OPEN')}"
        results    = collection.query(
            query_texts=[query_text],
            n_results=min(limit, 5)
        )
        return {
            "case_id":      case_id,
            "similar_cases": results.get('ids', [[]])[0],
            "distances":    results.get('distances', [[]])[0]
        }
    except Exception as e:
        logger.warning(f"Similar cases lookup failed: {e}")
        return {"case_id": case_id, "similar_cases": [], "distances": []}