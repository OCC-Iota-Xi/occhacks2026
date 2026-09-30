import os
import csv
import time
import base64
import resend
from dotenv import load_dotenv

load_dotenv()

# Initialize Resend API key
resend.api_key = os.getenv("RESEND_API_KEY")
reply_to_email = os.getenv("RESEND_REPLY_TO")

CSV_FILE = "defeated__acceptance_email.csv"
PDF_FILE_PATH = "Waivers.pdf"  

def load_pdf_attachment(file_path):
    """Reads a local PDF file and encodes it in Base64 for Resend attachment."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Could not find PDF document at '{file_path}'")
    
    with open(file_path, "rb") as pdf_file:
        content = pdf_file.read()
        encoded_content = base64.b64encode(content).decode("utf-8")
        
    return {
        "filename": os.path.basename(file_path),
        "content": encoded_content
    }

def send_acceptance_email(hacker_email, hacker_name, pdf_attachment):
    website_link = "https://www.occhacks.com/"   

    # Send email with PDF attached via Resend
    email_response = resend.Emails.send({
        "from": os.getenv("RESEND_FROM", "OCC Hacks <hello@occhacks.com>"),
        "to": [hacker_email],
        "reply_to": reply_to_email,
        "subject": "You're in! Confirm Your OCCHacks Spot by October 5th",
        "html": f"""
            <p>Hi {hacker_name},</p>
            
            <p>Congratulations! 🎉 You’ve been officially accepted to OCCHacks 2026! We’re so excited to have you join us.</p>
            
            <p><b>Event Details:</b><br>
            <b>Date:</b> October 10th - 11th<br>
            <b>Location:</b> Orange Coast College, College Center, Floor 3, Ballroom<br>
            <b>Check-in time:</b> 8:00-8:40 am<br>
            <b>Hackathon begins:</b> 9 am<br>
            <b>More details:</b> <a href="{website_link}">OCCHacks</a></p>
            
            <p>To confirm your participation, please review and sign required waiver form. Please print, sign, and bring them with you during check-in on event day (or reply to this email with your signed copy) by <b>Wednesday, October 5th, at 11:59pm.</b></p>
            
            <p><b>Note:</b> The packet includes a Medical Consent Form, which is required only for Orange Coast College students. If you’re not an OCC student, please skip it.</p>
            
            <p>Once your forms are submitted, your spot will be officially confirmed! 🎉</p>
    
            <p>Then get ready for a weekend of $2,000 in prizes, free food, and guest speakers you won't want to miss.</p>
        
            <p>See you at OCCHacks!</p>
        """,
        "attachments": [
            {
                "filename": pdf_attachment["filename"],
                "content": pdf_attachment["content"]
            }
        ]
    })
    
    return email_response

def send_all_acceptance_emails(csv_file=CSV_FILE, pdf_file=PDF_FILE_PATH):
    if not os.path.exists(csv_file):
        print(f"Error: Could not find '{csv_file}'")
        return

    # Read and encode the PDF once before running the loop
    try:
        pdf_attachment = load_pdf_attachment(pdf_file)
    except Exception as e:
        print(f"Failed to load PDF file: {e}")
        return

    with open(csv_file, mode="r", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)

        for index, row in enumerate(reader):
            clean_row = {k.strip(): v.strip() if v else "" for k, v in row.items()}
            
            name = clean_row.get("name") 
            email = clean_row.get("email")

            if not email:
                print(f"[{index + 1}] Skipping row missing email")
                continue

            try:
                send_acceptance_email(email, name, pdf_attachment)
                print(f"[{index + 1}] Sent acceptance email with PDF attachment to {email}")
            except Exception as e:
                print(f"[{index + 1}] Failed to send to {email}: {e}")

            time.sleep(0.8) # Keep within Resend rate limits

if __name__ == "__main__":
    send_all_acceptance_emails()