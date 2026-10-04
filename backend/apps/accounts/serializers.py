from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers
from .models import UserProfile, UserRole

User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['referral_code', 'phone', 'address', 'avatar']
        read_only_fields = ['referral_code']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    referral_code = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=[UserRole.CUSTOMER, UserRole.VENDOR], default=UserRole.CUSTOMER)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'confirm_password', 'role', 'referral_code']

    def validate_email(self, value):
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value.lower()

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('confirm_password'):
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        referral_code = validated_data.pop('referral_code', None)
        referred_by = None

        if referral_code:
            try:
                referrer_profile = UserProfile.objects.get(referral_code=referral_code.upper())
                referred_by = referrer_profile.user
            except UserProfile.DoesNotExist:
                raise serializers.ValidationError({'referral_code': 'Invalid referral code.'})

        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, referred_by=referred_by)
        return user


class PublicUserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'role', 'date_joined', 'profile']
        read_only_fields = ['id', 'email', 'role', 'date_joined']


class AdminUserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'role', 'is_active', 'date_joined', 'profile']
