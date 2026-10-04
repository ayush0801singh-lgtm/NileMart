from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'parent']
        read_only_fields = ['slug']

class ProductSerializer(serializers.ModelSerializer):
    vendor_name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'vendor', 'vendor_name', 'category', 'category_name',
            'name', 'slug', 'description', 'price', 'stock_quantity',
            'stock_status', 'image', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'vendor', 'created_at', 'updated_at', 'vendor_name', 'category_name']

    def get_vendor_name(self, obj):
        return obj.vendor.full_name if obj.vendor else None

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('Price must be greater than zero.')
        return value

    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError('Stock quantity cannot be negative.')
        return value

class ProductWriteSerializer(ProductSerializer):
    class Meta(ProductSerializer.Meta):
        read_only_fields = ['id', 'slug', 'vendor', 'created_at', 'updated_at']