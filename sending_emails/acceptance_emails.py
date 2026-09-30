import os
import csv
import time
import requests
import resend
from dotenv import load_dotenv

load_dotenv()

# Initialize API credentials
resend.api_key = os.getenv("RESEND_API_KEY")
DOCUSEAL_API_KEY = os.getenv("DOCUSEAL_API_KEY")
DOCUSEAL_URL = "https://occhacks.onrender.com"  
TEMPLATE_ID = os.getenv("DOCUSEAL_TEMPLATE_ID", 1)  

CSV_FILE = "test email.csv"

def send_waiver(hacker_email, hacker_name):
    # 1. Request unique signing slug from DocuSeal
    response = requests.post(
        f"{DOCUSEAL_URL}/api/submissions",
        headers={
            "X-Auth-Token": DOCUSEAL_API_KEY,
            "Content-Type": "application/json"
        },
        json={
            "template_id": int(TEMPLATE_ID),
            "submitters": [
                {
                    "email": hacker_email,
                    "name": hacker_name
                }
            ]
        }
    )
    
    print("DocuSeal Response Status:", response.status_code)
    print("DocuSeal Response Text:", response.text)
    response.raise_for_status()
    
    # Extract unique link slug
    res_data = response.json()
    if isinstance(res_data, list):
        signing_slug = res_data[0]["slug"]
    else:
        signing_slug = res_data.get("slug") or res_data.get("data", [{}])[0].get("slug")

    waiver_link = f"{DOCUSEAL_URL}/s/{signing_slug}"
    website_link = "https://www.occhacks.com/"   

    # 2. Send email via Resend
    email_response = resend.Emails.send({
        "from": os.getenv("RESEND_FROM", "OCC Hacks <hello@occhacks.com>"),
        "to": [hacker_email],
        "subject": "You're in! Confirm Your OCCHacks Spot by October 5th",
        "html": f"""
            <p>Hi {hacker_name},</p>
            
            <p>Congratulations! 🎉 You’ve been officially accepted to OCCHacks 2026! We’re so excited to have you join us. </p>
            
            <p><b>Event Details:</b><br>
            <b>Date:</b> October 10th - 11th<br>
            <b>Location:</b> Orange Coast College, College Center, Floor 3, Ballroom<br>
            <b>Check-in time:</b> 8:00-8:40 am<br>
            <b>Hackathon begins:</b> 9 am<br>
            <b>More details:</b> <a href="{website_link}">OCCHacks</a></p>
            
            <p>To confirm your participation, please review and sign required waiver forms accessed via this 
            <a href="{waiver_link}" style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">sign waiver link</a> by <b>Wednesday, October 5th, at 11:59pm.</b></p>
            
            <p><b>Note:</b> the packet includes a Medical Consent Form, which is required only for Orange Coast College students. If you’re not an OCC student, please skip it.</p>
            
            <p>Once your forms are submitted, your spot will be officially confirmed! 🎉</p>
    
            <p>then get ready for a weekend of $2,000 in prizes, free food, and guest speakers you won't want to miss.</p>
        
            <p>See you at OCCHacks!</p>
        """
    })
    
    return email_response

def send_all_acceptance_emails(csv_file=CSV_FILE):
    if not os.path.exists(csv_file):
        print(f"Error: Could not find '{csv_file}'")
        return

    with open(csv_file, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)

        for index, row in enumerate(reader):
            name = row.get("First Name") 
            email = row.get("Email Address")

            if not email:
                continue

            try:
                response = send_waiver(email, name)
                print(f"[{index + 1}] Sent waiver & acceptance email to {email}")
            except Exception as e:
                print(f"[{index + 1}] Failed to send to {email}: {e}")

            time.sleep(0.9)

if __name__ == "__main__":
    send_all_acceptance_emails()
