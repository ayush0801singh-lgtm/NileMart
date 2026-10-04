from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal

class Wallet(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wallet', primary_key=True)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), validators=[MinValueValidator(Decimal('0.00'))])
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'wallets'

    def __str__(self):
        return f"Wallet({self.user.email}) = {self.balance}"

class WalletTransaction(models.Model):
    class TransactionType(models.TextChoices):
        REFERRAL_COMMISSION = 'REFERRAL_COMMISSION', 'Referral Commission'
        WITHDRAWAL = 'WITHDRAWAL', 'Withdrawal'
        PURCHASE = 'PURCHASE', 'Purchase'
        REFUND = 'REFUND', 'Refund'
        BONUS = 'BONUS', 'Bonus'

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions', db_index=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=30, choices=TransactionType.choices)
    description = models.CharField(max_length=500)
    reference_id = models.CharField(max_length=100, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'wallet_transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['wallet', 'transaction_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.transaction_type} | {self.amount} | {self.wallet.user.email}" 