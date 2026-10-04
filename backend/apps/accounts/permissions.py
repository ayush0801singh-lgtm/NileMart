from rest_framework.permissions import BasePermission
from .models import UserRole


class IsCustomer(BasePermission):
    message = 'Access restricted to customers only.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.CUSTOMER
        )


class IsVendor(BasePermission):
    message = 'Access restricted to vendors only.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.VENDOR
        )


class IsAdmin(BasePermission):
    message = 'Access restricted to administrators only.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.ADMIN
        )


class IsVendorOrAdmin(BasePermission):
    message = 'Access restricted to vendors and administrators.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in (UserRole.VENDOR, UserRole.ADMIN)
        )


class IsOwnerOrAdmin(BasePermission):
    message = 'You do not have permission to access this resource.'

    def has_object_permission(self, request, view, obj):
        if request.user.role == UserRole.ADMIN:
            return True
        owner = getattr(obj, 'user', getattr(obj, 'vendor', None))
        return owner == request.user
