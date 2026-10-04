import logging
from decimal import Decimal
from django.db import transaction
from .models import Wallet, WalletTransaction

logger = logging.getLogger(__name__)
LEVEL_1_COMMISSION_RATE = Decimal('0.10')
LEVEL_2_COMMISSION_RATE = Decimal('0.05')

@transaction.atomic
def credit_wallet(wallet: Wallet, amount: Decimal, transaction_type: str, description: str, reference_id: str = '') -> WalletTransaction:
    locked_wallet = Wallet.objects.select_for_update().get(pk=wallet.pk)
    locked_wallet.balance += amount
    locked_wallet.save(update_fields=['balance', 'updated_at'])

    tx = WalletTransaction.objects.create(
        wallet=locked_wallet,
        amount=amount,
        transaction_type=transaction_type,
        description=description,
        reference_id=reference_id,
    )
    logger.info('Wallet credited: user=%s amount=%s type=%s ref=%s', locked_wallet.user.email, amount, transaction_type, reference_id)
    return tx

@transaction.atomic
def process_referral_commissions(order) -> None:
    order_ref = str(order.id)
    already_paid = WalletTransaction.objects.filter(reference_id=f'order_{order_ref}', transaction_type=WalletTransaction.TransactionType.REFERRAL_COMMISSION).exists()
    if already_paid: return

    try:
        customer_profile = order.customer.profile
    except Exception:
        return

    order_total = order.total_price
    chain = []

    level1_user = customer_profile.referred_by
    if level1_user:
        chain.append((level1_user, LEVEL_1_COMMISSION_RATE, 'Level-1 referral commission'))
        try:
            level2_user = level1_user.profile.referred_by
            if level2_user and level2_user != order.customer:
                chain.append((level2_user, LEVEL_2_COMMISSION_RATE, 'Level-2 referral commission'))
        except Exception:
            pass

    for referrer, rate, description in chain:
        commission = (order_total * rate).quantize(Decimal('0.01'))
        if commission <= 0: continue
        try:
            wallet = Wallet.objects.get(user=referrer)
            credit_wallet(wallet=wallet, amount=commission, transaction_type=WalletTransaction.TransactionType.REFERRAL_COMMISSION, description=f"{description} — Order #{order_ref}", reference_id=f'order_{order_ref}')
        except Wallet.DoesNotExist:
            logger.error('Wallet not found for referrer %s', referrer.email)
        except Exception as exc:
            logger.error('Error crediting commission for referrer %s: %s', referrer.email, exc)