from decimal import Decimal
from django.db import transaction
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.accounts.permissions import IsCustomer, IsVendor, IsAdmin
from apps.products.models import Product
from apps.wallets.services import process_referral_commissions
from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer, CheckoutSerializer

class CartView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        cart, _ = Cart.objects.prefetch_related('items__product').get_or_create(customer=request.user)
        return Response(CartSerializer(cart).data)

    def post(self, request):
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data['product']
        quantity = serializer.validated_data['quantity']

        if product.stock_quantity < quantity:
            return Response({'detail': f'Insufficient stock. Available: {product.stock_quantity}'}, status=status.HTTP_400_BAD_REQUEST)

        cart, _ = Cart.objects.get_or_create(customer=request.user)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created: item.quantity += quantity
        else: item.quantity = quantity
        item.save()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    def delete(self, request):
        cart, _ = Cart.objects.get_or_create(customer=request.user)
        cart.items.all().delete()
        return Response({'message': 'Cart cleared.'}, status=status.HTTP_200_OK)

class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, item_id):
        try:
            item = CartItem.objects.get(pk=item_id, cart__customer=request.user)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)

        quantity = request.data.get('quantity')
        if not quantity or int(quantity) < 1:
            return Response({'detail': 'Quantity must be at least 1.'}, status=status.HTTP_400_BAD_REQUEST)
        item.quantity = int(quantity)
        item.save()
        return Response(CartItemSerializer(item).data)

    def delete(self, request, item_id):
        try:
            item = CartItem.objects.get(pk=item_id, cart__customer=request.user)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]
    @transaction.atomic
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            cart = Cart.objects.prefetch_related('items__product').get(customer=request.user)
        except Cart.DoesNotExist:
            return Response({'detail': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        items = cart.items.all()
        if not items.exists():
            return Response({'detail': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        total = Decimal('0.00')
        order_items_data = []

        for item in items:
            product = Product.objects.select_for_update().get(pk=item.product_id)
            if product.stock_quantity < item.quantity:
                return Response({'detail': f'Insufficient stock for "{product.name}". Available: {product.stock_quantity}'}, status=status.HTTP_400_BAD_REQUEST)
            subtotal = product.price * item.quantity
            total += subtotal
            order_items_data.append({
                'product': product, 'vendor': product.vendor, 'product_name': product.name,
                'unit_price': product.price, 'quantity': item.quantity,
            })
            product.stock_quantity -= item.quantity
            product.save(update_fields=['stock_quantity'])

        order = Order.objects.create(
            customer=request.user, shipping_address=serializer.validated_data['shipping_address'],
            notes=serializer.validated_data.get('notes', ''), total_price=total,
        )

        for item_data in order_items_data:
            OrderItem.objects.create(order=order, **item_data)

        cart.items.all().delete()
        try:
            process_referral_commissions(order)
        except Exception:
            pass

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

class CustomerOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user).prefetch_related('items')

class CustomerOrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user).prefetch_related('items')

class CustomerDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        orders = Order.objects.filter(customer=user)
        total_spent = sum(o.total_price for o in orders)
        wallet_balance = getattr(getattr(user, 'wallet', None), 'balance', 0)
        membership = None
        try:
            m = user.membership
            membership = {'tier': m.tier, 'is_active': m.is_active, 'end_date': m.end_date}
        except Exception:
            pass
        return Response({
            'total_orders': orders.count(), 'total_spent': total_spent,
            'wallet_balance': wallet_balance, 'membership': membership,
            'recent_orders': OrderSerializer(orders[:5], many=True).data,
        })

class VendorDashboardView(APIView):
    permission_classes = [IsVendor]
    def get(self, request):
        vendor = request.user
        from apps.products.models import Product
        product_count = Product.objects.filter(vendor=vendor).count()
        order_items = OrderItem.objects.filter(vendor=vendor).select_related('order')
        total_revenue = sum(oi.subtotal for oi in order_items)
        recent_orders = Order.objects.filter(items__vendor=vendor).distinct().prefetch_related('items')[:5]
        return Response({
            'product_count': product_count, 'total_order_items': order_items.count(),
            'total_revenue': total_revenue, 'recent_orders': OrderSerializer(recent_orders, many=True).data,
        })

class AdminDashboardView(APIView):
    permission_classes = [IsAdmin]
    def get(self, request):
        from django.contrib.auth import get_user_model
        from apps.products.models import Product
        User = get_user_model()
        total_users = User.objects.count()
        total_orders = Order.objects.count()
        total_products = Product.objects.filter(is_active=True).count()
        total_revenue = sum(o.total_price for o in Order.objects.filter(status=Order.OrderStatus.DELIVERED))
        recent_orders = Order.objects.select_related('customer').prefetch_related('items')[:10]
        return Response({
            'total_users': total_users, 'total_orders': total_orders,
            'total_products': total_products, 'total_revenue': total_revenue,
            'recent_orders': OrderSerializer(recent_orders, many=True).data,
        })

class AdminOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAdmin]
    queryset = Order.objects.select_related('customer').prefetch_related('items').all()

class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAdmin]
    queryset = Order.objects.select_related('customer').prefetch_related('items').all()