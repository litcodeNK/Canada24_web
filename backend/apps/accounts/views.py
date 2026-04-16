from django.utils import timezone
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.utils import extend_schema

from .models import User, OTPVerification
from .serializers import (
    SendOTPSerializer, VerifyOTPSerializer,
    UserSerializer, UpdateProfileSerializer,
)
from .utils import send_otp_email


@extend_schema(
    request=SendOTPSerializer,
    responses={200: {'type': 'object', 'properties': {'detail': {'type': 'string'}}}},
    description='Send a one-time password to the provided email address.',
)
@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    serializer = SendOTPSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    email = serializer.validated_data['email'].lower()

    # Invalidate any previous unused OTPs for this email
    OTPVerification.objects.filter(email=email, is_used=False).update(is_used=True)

    code = OTPVerification.generate_code()
    OTPVerification.objects.create(email=email, code=code)

    try:
        send_otp_email(email, code)
    except Exception:
        # In development the console backend is used; don't fail the request
        pass

    return Response({'detail': 'Verification code sent.'}, status=status.HTTP_200_OK)


@extend_schema(
    request=VerifyOTPSerializer,
    description='Verify an OTP and return JWT tokens. Creates user if not already registered.',
)
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    serializer = VerifyOTPSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data['email'].lower()
    code = serializer.validated_data['code']

    try:
        otp = OTPVerification.objects.filter(
            email=email, is_used=False
        ).latest('created_at')
    except OTPVerification.DoesNotExist:
        return Response(
            {'detail': 'No pending verification for this email.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    otp.attempts += 1
    otp.save(update_fields=['attempts'])

    if not otp.is_valid:
        return Response(
            {'detail': 'Code is expired or has exceeded maximum attempts.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if otp.code != code:
        remaining = OTPVerification.MAX_ATTEMPTS - otp.attempts
        return Response(
            {'detail': f'Invalid code. {remaining} attempt(s) remaining.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    otp.is_used = True
    otp.save(update_fields=['is_used'])

    user, created = User.objects.get_or_create(email=email)
    if not user.is_verified:
        user.is_verified = True
        user.save(update_fields=['is_verified'])

    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data,
        'is_new_user': created,
    }, status=status.HTTP_200_OK)


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return UpdateProfileSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user

    @extend_schema(description='Get the current authenticated user profile.')
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(description='Update the current user profile.')
    def patch(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)


@extend_schema(
    request={'type': 'object', 'properties': {'refresh': {'type': 'string'}}},
    description='Logout by blacklisting the refresh token.',
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'detail': 'Logged out successfully.'}, status=status.HTTP_200_OK)
    except Exception:
        return Response({'detail': 'Invalid or already expired token.'}, status=status.HTTP_400_BAD_REQUEST)
