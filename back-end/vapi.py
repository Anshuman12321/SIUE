import time
from functools import lru_cache

import httpx
from pydantic_settings import BaseSettings

VAPI_BASE = "https://api.vapi.ai"
VAPI_PHONE = "+13148875694"

RILEY_SYSTEM_PROMPT = """\
You are Riley, a friendly AI assistant making a phone call to {venue_name} on behalf of {caller_name}.

You are calling to make a reservation for 3 people under the name {caller_name} for {event_date_time}.

Instructions:
- Introduce yourself as Riley, an AI assistant
- State your request upfront: you'd like to reserve for {caller_name} at {event_date_time}
- Only answer questions the venue asks — do not volunteer extra information or ask questions yourself
- Once the venue confirms the reservation, say thank you and end the call
- If they cannot accommodate, politely thank them and end the call
- Keep it short and natural
"""

STRUCTURED_DATA_SCHEMA = {
    "type": "object",
    "properties": {
        "reservation_status": {
            "type": "string",
            "description": "Whether the reservation was successful. Values: 'successful' or 'not successful'",
        },
        "confirmed_date_time": {
            "type": "string",
            "description": "The confirmed date and time for the reservation, if successful",
        },
        "notes": {
            "type": "string",
            "description": "Any additional notes or details from the call",
        },
    },
}


class VapiSettings(BaseSettings):
    vapi_api_key: str
    vapi_assistant_id: str

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache
def get_vapi_settings() -> VapiSettings:
    return VapiSettings()


def _headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {get_vapi_settings().vapi_api_key}"}


@lru_cache
def get_phone_number_id() -> str:
    """Look up the Vapi phoneNumberId for our configured number."""
    resp = httpx.get(
        f"{VAPI_BASE}/phone-number",
        headers=_headers(),
        timeout=15,
    )
    resp.raise_for_status()
    for pn in resp.json():
        if pn.get("number") == VAPI_PHONE:
            return pn["id"]
    raise ValueError(f"No Vapi phone number found matching {VAPI_PHONE}")


def create_call(
    customer_number: str,
    *,
    caller_name: str,
    venue_name: str,
    event_date_time: str,
) -> dict:
    """Place an outbound call to *customer_number* via the Riley assistant."""
    phone_number_id = get_phone_number_id()
    settings = get_vapi_settings()
    customer_number = "+16362190625"

    payload = {
        "assistantId": settings.vapi_assistant_id,
        "phoneNumberId": phone_number_id,
        "customer": {"number": customer_number},
        "assistantOverrides": {
            "firstMessage": (
                f"Hi, my name is Riley, an AI assistant calling on behalf of {caller_name}. "
                f"I'd like to make a reservation at {venue_name}."
            ),
            "firstMessageMode": "assistant-waits-for-user",
            "model": {
                "provider": "openai",
                "model": "gpt-4.1",
                "messages": [
                    {
                        "role": "system",
                        "content": RILEY_SYSTEM_PROMPT.format(
                            caller_name=caller_name,
                            venue_name=venue_name,
                            event_date_time=event_date_time,
                        ),
                    }
                ],
            },
            "analysisPlan": {
                "structuredDataSchema": STRUCTURED_DATA_SCHEMA,
            },
        },
    }
    resp = httpx.post(
        f"{VAPI_BASE}/call",
        json=payload,
        headers=_headers(),
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()


def poll_call_until_done(
    call_id: str,
    *,
    interval: float = 3,
    timeout: float = 120,
) -> dict:
    """Poll GET /call/{id} until the call reaches a terminal status."""
    terminal_statuses = {"ended", "failed"}
    elapsed = 0.0

    while elapsed < timeout:
        resp = httpx.get(
            f"{VAPI_BASE}/call/{call_id}",
            headers=_headers(),
            timeout=15,
        )
        resp.raise_for_status()
        call = resp.json()

        if call.get("status") in terminal_statuses:
            return call

        time.sleep(interval)
        elapsed += interval

    raise TimeoutError(
        f"Call {call_id} did not finish within {timeout}s (last status: {call.get('status')})"
    )
