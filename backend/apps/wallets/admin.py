from django.contrib import admin
from .models import Wallet, WalletTransaction

class WalletTransactionInline(admin.TabularInline):
    model = WalletTransaction
    extra = 0
    readonly_fields = ['amount', 'transaction_type', 'description', 'reference_id', 'created_at']
    can_delete = False

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['user', 'balance', 'updated_at']
    search_fields = ['user__email']
    inlines = [WalletTransactionInline]
    readonly_fields = ['balance', 'updated_at']