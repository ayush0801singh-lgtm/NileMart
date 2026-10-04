from django.urls import path
from .views import CategoryListView, ProductListView, ProductDetailView, VendorProductListCreateView, VendorProductDetailView

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('', ProductListView.as_view(), name='product-list'),
    path('<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('vendor/my-products/', VendorProductListCreateView.as_view(), name='vendor-product-list'),
    path('vendor/my-products/<int:pk>/', VendorProductDetailView.as_view(), name='vendor-product-detail'),
]