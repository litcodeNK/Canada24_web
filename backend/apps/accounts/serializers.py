from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(min_length=6, max_length=6)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'display_name', 'avatar', 'bio',
            'is_verified', 'joined_at',
        ]
        read_only_fields = ['id', 'email', 'is_verified', 'joined_at']


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['display_name', 'avatar', 'bio']


class TokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()
    is_new_user = serializers.BooleanField()
