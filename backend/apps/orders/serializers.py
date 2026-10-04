from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem
from apps.products.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    unit_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=__import__('apps.products.models', fromlist=['Product']).Product.objects.filter(is_active=True), source='product')

    class Meta:
        model = CartItem
        fields = ['id', 'product_id', 'product_name', 'unit_price', 'quantity', 'subtotal']

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError('Quantity must be at least 1.')
        return value

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'updated_at']
        read_only_fields = fields

class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'unit_price', 'quantity', 'subtotal', 'vendor']
        read_only_fields = fields

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'customer', 'customer_email', 'status', 'status_display', 'shipping_address', 'total_price', 'notes', 'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'customer', 'customer_email', 'total_price', 'status_display', 'items', 'created_at', 'updated_at']

class CheckoutSerializer(serializers.Serializer):
    shipping_address = serializers.CharField(min_length=10)
    notes = serializers.CharField(required=False, allow_blank=True, default='')