from django.urls import path
from .views import RegisterView, LoginView, LogoutView, ProfileView, UserListView, UserDetailAdminView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('admin/users/', UserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', UserDetailAdminView.as_view(), name='admin-user-detail'),
]
