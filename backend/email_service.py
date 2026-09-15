"""Small, dependency-free transactional email helper for EduPulse.

Email delivery is deliberately non-blocking: a successful registration must never
fail merely because a third-party mail provider is temporarily unavailable.
"""

import logging
import os
import smtplib
from email.message import EmailMessage


logger = logging.getLogger(__name__)


def send_welcome_email(*, recipient: str, student_name: str) -> bool:
    """Send a welcome email when SMTP credentials are configured.

    Gmail SMTP uses an app password, never the account's normal password.  The
    function intentionally returns a status instead of raising so registration
    remains reliable even when mail delivery fails.
    """
    username = os.getenv("SMTP_USERNAME")
    app_password = os.getenv("SMTP_APP_PASSWORD")
    sender = os.getenv("SMTP_FROM_EMAIL", username or "")

    if not username or not app_password or not sender:
        logger.info("Welcome email skipped: SMTP is not configured.")
        return False

    message = EmailMessage()
    message["Subject"] = "Welcome to EduPulse"
    message["From"] = f"EduPulse <{sender}>"
    message["To"] = recipient
    message.set_content(
        f"Hi {student_name},\n\n"
        "Welcome to EduPulse. Your account has been created successfully. "
        "You can now sign in and start tracking your academic progress.\n\n"
        "Regards,\nThe EduPulse Team"
    )

    host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    port = int(os.getenv("SMTP_PORT", "587"))

    try:
        with smtplib.SMTP(host, port, timeout=10) as client:
            client.starttls()
            client.login(username, app_password)
            client.send_message(message)
        logger.info("Welcome email sent.")
        return True
    except (OSError, smtplib.SMTPException) as error:
        logger.warning("Welcome email could not be sent: %s", error)
        return False
