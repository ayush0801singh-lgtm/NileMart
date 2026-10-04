from django.contrib import admin
from .models import PrimeMembership

@admin.register(PrimeMembership)
class PrimeMembershipAdmin(admin.ModelAdmin):
    list_display = ['user', 'tier', 'start_date', 'end_date', 'is_active', 'auto_renew']
    list_filter = ['tier', 'is_active', 'auto_renew']
    search_fields = ['user__email']
    readonly_fields = ['start_date', 'created_at', 'updated_at']