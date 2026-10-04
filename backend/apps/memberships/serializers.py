from rest_framework import serializers
from .models import PrimeMembership, MembershipTier

class PrimeMembershipSerializer(serializers.ModelSerializer):
    benefits = serializers.ReadOnlyField()
    monthly_price = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()

    class Meta:
        model = PrimeMembership
        fields = ['id', 'tier', 'start_date', 'end_date', 'is_active', 'auto_renew', 'benefits', 'monthly_price', 'is_expired']
        read_only_fields = ['id', 'start_date', 'end_date', 'is_active', 'benefits', 'monthly_price', 'is_expired']

class SubscribeSerializer(serializers.Serializer):
    tier = serializers.ChoiceField(choices=MembershipTier.choices)
    months = serializers.IntegerField(min_value=1, max_value=12, default=1)