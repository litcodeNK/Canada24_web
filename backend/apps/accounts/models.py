import random
import string
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.conf import settings


class UserManager(BaseUserManager):
    def create_user(self, email, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        user = self.create_user(email, **extra_fields)
        if password:
            user.set_password(password)
            user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=150, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)

    joined_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'users'
        ordering = ['-joined_at']

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        # Auto-derive display name from email if not set
        if not self.display_name:
            local = self.email.split('@')[0]
            self.display_name = local.replace('.', ' ').replace('_', ' ').title()
        super().save(*args, **kwargs)


class OTPVerification(models.Model):
    email = models.EmailField(db_index=True)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    attempts = models.PositiveSmallIntegerField(default=0)

    MAX_ATTEMPTS = 5

    class Meta:
        db_table = 'otp_verifications'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.email} – {self.code}'

    def save(self, *args, **kwargs):
        if not self.pk:
            expiry_minutes = getattr(settings, 'OTP_EXPIRY_MINUTES', 10)
            self.expires_at = timezone.now() + timedelta(minutes=expiry_minutes)
        super().save(*args, **kwargs)

    @property
    def is_valid(self):
        return (
            not self.is_used
            and self.expires_at > timezone.now()
            and self.attempts < self.MAX_ATTEMPTS
        )

    @staticmethod
    def generate_code():
        length = getattr(settings, 'OTP_LENGTH', 6)
        return ''.join(random.choices(string.digits, k=length))
