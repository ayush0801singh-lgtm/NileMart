import logging
from django.utils import timezone
from django.db import transaction
from .models import PrimeMembership
from dateutil.relativedelta import relativedelta

logger = logging.getLogger(__name__)

@transaction.atomic
def expire_memberships() -> int:
    now = timezone.now()
    expired = PrimeMembership.objects.filter(is_active=True, end_date__lt=now)
    count = expired.count()
    if count:
        expired.update(is_active=False)
        logger.info('Expired %d memberships.', count)
    return count

@transaction.atomic
def subscribe_user(user, tier: str, months: int = 1) -> PrimeMembership:
    now = timezone.now()
    membership, created = PrimeMembership.objects.get_or_create(
        user=user,
        defaults={'tier': tier, 'start_date': now, 'end_date': now + relativedelta(months=months), 'is_active': True}
    )

    if not created:
        base = membership.end_date if membership.end_date > now else now
        membership.tier = tier
        membership.end_date = base + relativedelta(months=months)
        membership.is_active = True
        membership.save(update_fields=['tier', 'end_date', 'is_active', 'updated_at'])

    logger.info('User %s subscribed to %s for %d month(s).', user.email, tier, months)
    return membership