from django.core.mail import send_mail
from django.conf import settings


def send_otp_email(email: str, code: str):
    subject = 'Your Canada 24/7 Verification Code'
    message = (
        f'Your one-time verification code is: {code}\n\n'
        f'This code expires in {settings.OTP_EXPIRY_MINUTES} minutes.\n\n'
        f'If you did not request this code, you can safely ignore this email.'
    )
    html_message = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #c00;">Canada 24/7 News</h2>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing: 8px; color: #c00; font-size: 40px;">{code}</h1>
      <p style="color: #666;">
        This code expires in <strong>{settings.OTP_EXPIRY_MINUTES} minutes</strong>.
      </p>
      <p style="color: #999; font-size: 12px;">
        If you did not request this, please ignore this email.
      </p>
    </div>
    """
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        html_message=html_message,
        fail_silently=False,
    )
