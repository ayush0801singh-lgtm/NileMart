from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.accounts.permissions import IsVendor, IsAdmin, IsVendorOrAdmin
from .cache import get_cached_product_list, get_cached_product_detail, invalidate_product_cache
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer, ProductWriteSerializer

class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdmin()]

class ProductListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        filters = {}
        category = request.query_params.get('category')
        vendor = request.query_params.get('vendor')
        search = request.query_params.get('search')

        if category: filters['category'] = category
        if vendor: filters['vendor'] = vendor
        if search: filters['search'] = search

        def fetch_from_db():
            qs = Product.objects.select_related('vendor', 'category').filter(is_active=True)
            if category: qs = qs.filter(category__slug=category)
            if vendor: qs = qs.filter(vendor_id=vendor)
            if search: qs = qs.filter(name__icontains=search)
            return ProductSerializer(qs, many=True, context={'request': request}).data

        data = get_cached_product_list(filters, fetch_from_db)
        return Response(data)

class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        def fetch_from_db():
            product = get_object_or_404(
                Product.objects.select_related('vendor', 'category'),
                pk=pk, is_active=True,
            )
            return ProductSerializer(product, context={'request': request}).data

        data = get_cached_product_detail(pk, fetch_from_db)
        return Response(data)

class VendorProductListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsVendor]

    def get_serializer_class(self):
        if self.request.method == 'POST': return ProductWriteSerializer
        return ProductSerializer

    def get_queryset(self):
        return Product.objects.filter(vendor=self.request.user).select_related('category')

    def perform_create(self, serializer):
        product = serializer.save(vendor=self.request.user)
        invalidate_product_cache()

class VendorProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsVendor]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'): return ProductWriteSerializer
        return ProductSerializer

    def get_queryset(self):
        return Product.objects.filter(vendor=self.request.user)

    def perform_update(self, serializer):
        product = serializer.save()
        invalidate_product_cache(product.pk)

    def perform_destroy(self, instance):
        product_id = instance.pk
        instance.delete()
        invalidate_product_cache(product_id)