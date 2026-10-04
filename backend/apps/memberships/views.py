from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.accounts.permissions import IsAdmin
from .models import PrimeMembership, MembershipTier, TIER_BENEFITS, TIER_PRICING
from .serializers import PrimeMembershipSerializer, SubscribeSerializer
from .services import subscribe_user, expire_memberships

class TierInfoView(APIView):
    permission_classes = []
    def get(self, request):
        data = [{'tier': tier, 'price': TIER_PRICING[tier], 'benefits': TIER_BENEFITS[tier]} for tier in MembershipTier.values]
        return Response(data)

class MembershipStatusView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            membership = request.user.membership
            return Response(PrimeMembershipSerializer(membership).data)
        except PrimeMembership.DoesNotExist:
            return Response({'detail': 'No active membership found.'}, status=status.HTTP_404_NOT_FOUND)

class SubscribeView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = SubscribeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        membership = subscribe_user(user=request.user, tier=serializer.validated_data['tier'], months=serializer.validated_data['months'])
        return Response(PrimeMembershipSerializer(membership).data, status=status.HTTP_200_OK)

class CancelMembershipView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            membership = request.user.membership
            membership.is_active = False
            membership.auto_renew = False
            membership.save(update_fields=['is_active', 'auto_renew', 'updated_at'])
            return Response({'message': 'Membership cancelled successfully.'})
        except PrimeMembership.DoesNotExist:
            return Response({'detail': 'No membership found.'}, status=status.HTTP_404_NOT_FOUND)

class AdminExpireMembershipsView(APIView):
    permission_classes = [IsAdmin]
    def post(self, request):
        count = expire_memberships()
        return Response({'message': f'{count} membership(s) marked as expired.'})