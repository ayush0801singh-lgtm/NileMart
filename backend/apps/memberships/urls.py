from django.urls import path
from .views import TierInfoView, MembershipStatusView, SubscribeView, CancelMembershipView, AdminExpireMembershipsView

urlpatterns = [
    path('tiers/', TierInfoView.as_view(), name='membership-tiers'),
    path('status/', MembershipStatusView.as_view(), name='membership-status'),
    path('subscribe/', SubscribeView.as_view(), name='membership-subscribe'),
    path('cancel/', CancelMembershipView.as_view(), name='membership-cancel'),
    path('admin/expire/', AdminExpireMembershipsView.as_view(), name='admin-expire-memberships'),
]