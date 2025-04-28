# backend/whatsapp.py
#this fiel is not working for now!
import requests

ACCESS_TOKEN = "EAAKBPptrEF4BO..."  # 🔒 keep this in .env later
PHONE_NUMBER_ID = "648517411674736"

def send_whatsapp_message(to_number, message_text):
    url = f"https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "text",
        "text": {"body": message_text}
    }

    response = requests.post(url, headers=headers, json=payload)
    return response.json()
