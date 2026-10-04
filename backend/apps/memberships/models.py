from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal

class MembershipTier(models.TextChoices):
    SILVER = 'SILVER', 'Silver'
    GOLD = 'GOLD', 'Gold'
    PLATINUM = 'PLATINUM', 'Platinum'

TIER_PRICING = {
    MembershipTier.SILVER: Decimal('9.99'),
    MembershipTier.GOLD: Decimal('19.99'),
    MembershipTier.PLATINUM: Decimal('39.99'),
}

TIER_BENEFITS = {
    MembershipTier.SILVER: {'free_shipping': False, 'discount_percentage': 5, 'priority_support': False, 'early_access': False},
    MembershipTier.GOLD: {'free_shipping': True, 'discount_percentage': 10, 'priority_support': False, 'early_access': False},
    MembershipTier.PLATINUM: {'free_shipping': True, 'discount_percentage': 15, 'priority_support': True, 'early_access': True},
}

class PrimeMembership(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='membership')
    tier = models.CharField(max_length=20, choices=MembershipTier.choices, default=MembershipTier.SILVER)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True, db_index=True)
    auto_renew = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'prime_memberships'
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['end_date', 'is_active']),
        ]

    def __str__(self):
        return f"{self.user.email} — {self.get_tier_display()} (active={self.is_active})"

    @property
    def is_expired(self):
        return timezone.now() > self.end_date

    @property
    def benefits(self):
        return TIER_BENEFITS.get(self.tier, {})

    @property
    def monthly_price(self):
        return TIER_PRICING.get(self.tier, Decimal('0.00'))