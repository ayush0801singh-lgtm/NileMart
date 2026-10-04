from django.urls import path
from .views import (
    CartView, CartItemDetailView, CheckoutView,
    CustomerOrderListView, CustomerOrderDetailView, CustomerDashboardView,
    VendorDashboardView,
    AdminDashboardView, AdminOrderListView, AdminOrderDetailView,
)

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/items/<int:item_id>/', CartItemDetailView.as_view(), name='cart-item-detail'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('my-orders/', CustomerOrderListView.as_view(), name='customer-orders'),
    path('my-orders/<int:pk>/', CustomerOrderDetailView.as_view(), name='customer-order-detail'),
    path('dashboard/customer/', CustomerDashboardView.as_view(), name='customer-dashboard'),
    path('dashboard/vendor/', VendorDashboardView.as_view(), name='vendor-dashboard'),
    path('dashboard/admin/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/orders/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/orders/<int:pk>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
]