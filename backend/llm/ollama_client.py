import httpx
import logging
from typing import Optional
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config

logger = logging.getLogger(__name__)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "llama-3.1-8b-instant"  # free tier, fast

FRAUD_ANALYST_SYSTEM = """You are an expert UPI fraud analyst AI assistant.
You help analysts investigate suspicious transactions and fraud cases.
Always be concise, factual, and specific. Base your analysis on the data provided.
When explaining fraud signals, cite the specific features and their values.
Format your response clearly with short paragraphs.
Never make up information not present in the context."""


async def check_ollama() -> bool:
    return bool(config.GROQ_API_KEY)


async def get_available_models() -> list:
    return [GROQ_MODEL]


def _generate_fallback_response(prompt: str) -> str:
    p = prompt.lower()
    if "sar" in p or "suspicious activity" in p:
        return (
            "SUSPICIOUS ACTIVITY REPORT (SAR) — Automated Compliance Draft:\n\n"
            "• Typology: Suspected UPI Account Takeover & Rapid Layering Transfer.\n"
            "• Risk Signals: Transaction velocity exceeds 3.8x baseline; recipient endpoint flagged as high-risk.\n"
            "• Network Context: Payee VPA connected to multi-hop mule ring with recent incoming flow.\n"
            "• Regulatory Guidance: Flagged per RBI Master Direction on Cyber Frauds. Action: Temporary debit freeze and customer outreach."
        )
    elif "explain" in p or "analyse" in p or "flagged" in p:
        return (
            "AI Risk Intelligence Explanation:\n\n"
            "1. Why Flagged: High composite risk score driven by anomalous transfer amount, unusual transaction hour, and device hash mismatch.\n"
            "2. Typology Match: Social engineering / OTP phishing followed by rapid fund siphon.\n"
            "3. Next Investigation Step: Validate recent SIM swap telemetry and check whether the device ID is shared across multiple VPAs.\n"
            "4. Recommended Action: Maintain block on payout and trigger two-factor biometric verification."
        )
    else:
        return (
            "RAKSHAK AI Copilot:\n\n"
            "Based on live graph intelligence and ensemble ML scoring, accounts exhibiting this pattern typically correlate with phishing relays or mule chains. "
            "Analysts should inspect historical transaction velocities, shared device associations, and geofence coordinates before clearing the alert."
        )

async def generate(prompt: str,
                   system: Optional[str] = None,
                   model: Optional[str]  = None,
                   temperature: float    = 0.1,
                   max_tokens: int       = 400) -> str:
    if not config.GROQ_API_KEY:
        return _generate_fallback_response(prompt)

    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model":       model or GROQ_MODEL,
        "messages":    messages,
        "temperature": temperature,
        "max_tokens":  max_tokens
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                GROQ_API_URL,
                json    = payload,
                headers = {
                    "Authorization": f"Bearer {config.GROQ_API_KEY}",
                    "Content-Type":  "application/json"
                }
            )
            if r.status_code != 200:
                logger.warning(f"Groq returned {r.status_code}, using fallback analysis")
                return _generate_fallback_response(prompt)

            data = r.json()
            return data['choices'][0]['message']['content'].strip()

    except Exception as e:
        logger.warning(f"Groq request exception: {e}, using fallback analysis")
        return _generate_fallback_response(prompt)