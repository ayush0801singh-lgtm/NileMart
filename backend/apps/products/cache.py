import logging
from django.core.cache import cache
from django.conf import settings

logger = logging.getLogger(__name__)

def _make_list_key(filters: dict) -> str:
    parts = '_'.join(f'{k}:{v}' for k, v in sorted(filters.items()))
    return f"{settings.CACHE_KEY_PRODUCT_LIST}:{parts}" if parts else settings.CACHE_KEY_PRODUCT_LIST

def _make_detail_key(product_id: int) -> str:
    return settings.CACHE_KEY_PRODUCT_DETAIL.format(id=product_id)

def get_cached_product_list(filters: dict, fetch_fn):
    cache_key = _make_list_key(filters)
    try:
        cached = cache.get(cache_key)
        if cached is not None:
            logger.debug('Product list cache hit for key: %s', cache_key)
            return cached
    except Exception as exc:
        logger.warning('Redis unavailable on product list read: %s', exc)

    data = fetch_fn()
    try:
        cache.set(cache_key, data, timeout=settings.CACHE_TTL_PRODUCT_LIST)
    except Exception as exc:
        logger.warning('Redis unavailable on product list write: %s', exc)
    return data

def get_cached_product_detail(product_id: int, fetch_fn):
    cache_key = _make_detail_key(product_id)
    try:
        cached = cache.get(cache_key)
        if cached is not None:
            logger.debug('Product detail cache hit for id: %s', product_id)
            return cached
    except Exception as exc:
        logger.warning('Redis unavailable on product detail read: %s', exc)

    data = fetch_fn()
    try:
        cache.set(cache_key, data, timeout=settings.CACHE_TTL_PRODUCT_DETAIL)
    except Exception as exc:
        logger.warning('Redis unavailable on product detail write: %s', exc)
    return data

def invalidate_product_cache(product_id: int = None):
    try:
        if product_id:
            cache.delete(_make_detail_key(product_id))
        cache.delete_pattern(f'{settings.CACHE_KEY_PRODUCT_LIST}*')
    except Exception as exc:
        logger.warning('Redis unavailable during cache invalidation: %s', exc)