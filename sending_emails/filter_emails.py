import csv
import os

APPLICANTS_FILE = "occhacks-applicants-all-2026-09-16.csv"
INPUT_EMAILS_FILE = "emails_list.csv"
OUTPUT_EMAILS_FILE = "emails_list_filtered.csv"

def filter_applied_emails():
    if not os.path.exists(APPLICANTS_FILE):
        print(f"Error: Could not find '{APPLICANTS_FILE}'")
        return
    if not os.path.exists(INPUT_EMAILS_FILE):
        print(f"Error: Could not find '{INPUT_EMAILS_FILE}'")
        return

    # 1. Read all applicant emails
    applied_emails = set()
    with open(APPLICANTS_FILE, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("email"):
                applied_emails.add(row["email"].strip().lower())

    print(f"🔍 Found {len(applied_emails)} registered applicants.")

    # 2. Filter out registered applicants
    remaining_rows = []
    removed_rows = []

    with open(INPUT_EMAILS_FILE, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            email = row.get("Email Address", "").strip().lower()
            if email in applied_emails:
                removed_rows.append(row)
            else:
                remaining_rows.append(row)

    # 3. Write to emails_list_filtered.csv (preserving original emails_list.csv)
    with open(OUTPUT_EMAILS_FILE, mode="w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(remaining_rows)

    print(f"📊 Original: {len(remaining_rows) + len(removed_rows)} | Removed: {len(removed_rows)} | Clean: {len(remaining_rows)}")
    print(f"🎉 Filtered list saved to '{OUTPUT_EMAILS_FILE}' (your original '{INPUT_EMAILS_FILE}' remains untouched!).")

if __name__ == "__main__":
    filter_applied_emails()
