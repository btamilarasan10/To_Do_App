from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuthViewSet, ProfileViewSet, ListViewSet,
    TaskViewSet, FocusSessionViewSet
)

router = DefaultRouter()
router.register('lists', ListViewSet, basename='list')
router.register('tasks', TaskViewSet, basename='task')
router.register('focus-sessions', FocusSessionViewSet, basename='focussession')
router.register('profile', ProfileViewSet, basename='profile')

auth_register = AuthViewSet.as_view({'post': 'register'})
auth_login = AuthViewSet.as_view({'post': 'login'})

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', auth_register, name='auth-register'),
    path('auth/login/', auth_login, name='auth-login'),
]
