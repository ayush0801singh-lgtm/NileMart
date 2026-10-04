from django.contrib import admin
from .models import Category, Product

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'parent']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'vendor', 'category', 'price', 'stock_status', 'is_active', 'created_at']
    list_filter = ['stock_status', 'is_active', 'category']
    search_fields = ['name', 'vendor__email']
    list_select_related = ['vendor', 'category']
    raw_id_fields = ['vendor']