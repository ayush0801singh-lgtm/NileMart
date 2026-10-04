from django.urls import path
from .views import MyWalletView, MyTransactionListView, AdminWalletListView

urlpatterns = [
    path('my-wallet/', MyWalletView.as_view(), name='my-wallet'),
    path('my-transactions/', MyTransactionListView.as_view(), name='my-transactions'),
    path('admin/wallets/', AdminWalletListView.as_view(), name='admin-wallet-list'),
]