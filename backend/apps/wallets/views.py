from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.accounts.permissions import IsAdmin
from .models import Wallet, WalletTransaction
from .serializers import WalletSerializer, WalletTransactionSerializer

class MyWalletView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wallet = Wallet.objects.prefetch_related('transactions').get(user=request.user)
        serializer = WalletSerializer(wallet)
        return Response(serializer.data)

class MyTransactionListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = WalletTransactionSerializer

    def get_queryset(self):
        return WalletTransaction.objects.filter(wallet__user=self.request.user)

class AdminWalletListView(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = WalletSerializer
    queryset = Wallet.objects.select_related('user').prefetch_related('transactions').all()