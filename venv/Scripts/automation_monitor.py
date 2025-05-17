import os
import time
import smtplib
from email.message import EmailMessage

WATCHED_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CHECK_INTERVAL = 10  # seconds
EMAIL_ADDRESS = 'your_email@example.com'
EMAIL_PASSWORD = 'your_password'
TO_EMAIL = 'notify_to@example.com'


def send_email(subject, body):
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = EMAIL_ADDRESS
    msg['To'] = TO_EMAIL
    msg.set_content(body)
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
        smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        smtp.send_message(msg)

def scan_files(directory):
    files = {}
    for root, _, filenames in os.walk(directory):
        for f in filenames:
            path = os.path.join(root, f)
            try:
                files[path] = os.path.getmtime(path)
            except Exception:
                continue
    return files

def main():
    print(f"Monitoring changes in: {WATCHED_DIR}")
    prev_files = scan_files(WATCHED_DIR)
    while True:
        time.sleep(CHECK_INTERVAL)
        curr_files = scan_files(WATCHED_DIR)
        added = set(curr_files) - set(prev_files)
        removed = set(prev_files) - set(curr_files)
        modified = {f for f in curr_files if f in prev_files and curr_files[f] != prev_files[f]}
        if added or removed or modified:
            changes = []
            if added:
                changes.append(f"Added: {', '.join(added)}")
            if removed:
                changes.append(f"Removed: {', '.join(removed)}")
            if modified:
                changes.append(f"Modified: {', '.join(modified)}")
            body = '\n'.join(changes)
            print("Detected changes:\n" + body)
            try:
                send_email("File System Change Detected", body)
            except Exception as e:
                print(f"Failed to send email: {e}")
        prev_files = curr_files

if __name__ == "__main__":
    main()