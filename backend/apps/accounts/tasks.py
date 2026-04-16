from celery import shared_task
from django.utils import timezone
from .models import OTPVerification


@shared_task
def cleanup_expired_otps():
    """Remove OTP records that have expired."""
    deleted, _ = OTPVerification.objects.filter(expires_at__lt=timezone.now()).delete()
    return f'Deleted {deleted} expired OTP records.'
