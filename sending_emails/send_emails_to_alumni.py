import os
import csv 
import time
import resend
from dotenv import load_dotenv

load_dotenv()
resend.api_key = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv("RESEND_FROM")
REPLY_TO_EMAIL = os.getenv("RESEND_REPLY_TO")

CSV_FILE = "emails_list.csv"

def send_spookathon_alumni_emails():
    with open(CSV_FILE, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)

        for index, row in enumerate(reader):
            name = row.get("First Name") or row.get("Name") or "Hacker"
            email = row.get("Email Address")

            if not email:
                continue

            html_content = f"""
            <div style="font-family: Arial, sans-serif; font-size: 15px; color: #333333; line-height: 1.6; max-width: 600px;">
                <p>Hi {name},</p>
                
                <p>Thank you for being a part of last year's <strong>Spookathon</strong>! Thanks to hackers like you, our community has grown, and we are back with an even bigger event this fall.</p>
                
                <p>We are excited to announce <strong>OCC Hacks 2026</strong>, taking place <strong>October 10–11, 2026</strong> at <strong>Orange Coast College Ballroom</strong>!</p>
                
                <p><strong>What to expect:</strong></p>
                <ul>
                    <p><li><strong>🕹️ Tracks:</strong> Entertainment, Education, Productivity</li></p>

                    <p><li>🏆 Up to <strong>$2,000 in prizes</strong> and an additional LeetCode Challenge</li></p>

                    <p><li>💡 Guest speakers from <strong>Amazon, Blizzard, PlayStation & PIMCO</strong></li></p>
                </ul>
                
                <p>Whether you're coming back with a team or looking to build something totally new, we'd love to see you there again.</p>
                
                <p style="margin-top: 20px; margin-bottom: 20px;">
                    👉 <a href="https://www.occhacks.com/" style="background-color: #0070f3; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Register now at occhacks.com</a>
                </p>
                
                <p>Best regards,</p>
                <p>The OCC Hacks Team<br>
                Hosted by the Iota Xi Society at Orange Coast College</p>
            </div>
            """

            params = {
                "from": FROM_EMAIL,
                "reply_to": REPLY_TO_EMAIL,
                "to": [email],
                "subject": "From Spookathon to OCC Hacks 2026! 🚀 (October 10–11)",
                "html": html_content
            }

            try:
                response = resend.Emails.send(params)
                print(f"[{index + 1}] Sent to {email} | ID: {response['id']}")
            except Exception as e:
                print(f"[{index + 1}] Failed to send to {email}: {e}")

            time.sleep(0.9)

if __name__ == "__main__":
    send_spookathon_alumni_emails()
        