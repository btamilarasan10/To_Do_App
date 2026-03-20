from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.conf import settings
import os
from datetime import timedelta
from django.contrib.auth import update_session_auth_hash
from .serializers import ChangePasswordSerializer, UpdateEmailSerializer
from .models import List, Task, FocusSession, Profile
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    ListSerializer, TaskSerializer, FocusSessionSerializer, ProfileSerializer
)

class IsListMemberOrOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, List):
            return (obj.owner == request.user) or (request.user in obj.members.all())
        if isinstance(obj, Task):
            lst = obj.list
            return (lst.owner == request.user) or (request.user in lst.members.all())
        return False

class AuthViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'User registered successfully!',
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Login successful!',
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Profile.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            profile = request.user.profile
            serializer = self.get_serializer(profile)
            return Response({
                'message': 'Profile fetched successfully',
                'profile': serializer.data,
            })
        except ObjectDoesNotExist:
            return Response({'error': 'Profile not found'}, status=404)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def avatars(self, request):
        """Returns list of static avatars"""
        avatar_dir = os.path.join(settings.STATIC_ROOT or settings.BASE_DIR, 'static/avatars')
        avatars = []
        
        try:
            if os.path.exists(avatar_dir):
                for filename in os.listdir(avatar_dir):
                    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.svg')):
                        avatar_name = os.path.splitext(filename)[0].replace('_', ' ').title()
                        avatars.append({
                            'id': os.path.splitext(filename)[0],
                            'name': avatar_name,
                            'image': f"{request.build_absolute_uri(settings.STATIC_URL)}avatars/{filename}"
                        })
            else:
                avatars = [
                    {'id': f'avatar{i}', 'name': f'Avatar {i}', 'image': f"{request.build_absolute_uri(settings.STATIC_URL)}avatars/avatar{i}.png"}
                    for i in range(1, 9)
                ]
        except Exception as e:
            return Response({'error': f'Failed to load avatars: {str(e)}'}, status=500)
        
        return Response({
            'message': f'Found {len(avatars)} avatars ✅',
            'avatars': avatars
        })

    @action(detail=False, methods=['post'], parser_classes=[JSONParser])
    def select_avatar(self, request):
        """User selects avatar from static collection"""
        try:
            profile, created = Profile.objects.get_or_create(user=request.user)
            
            avatar_id = request.data.get('avatar_id') or request.data.get('avatar')
            
            if not avatar_id:
                return Response({'error': 'Avatar ID required'}, status=400)
            
            # ✅ FIX: Convert "avatar4" → 4 for IntegerField
            if isinstance(avatar_id, str) and avatar_id.startswith('avatar'):
                profile.avatar_id = int(avatar_id.replace('avatar', ''))
            else:
                profile.avatar_id = int(avatar_id)
            
            profile.is_onboarded = True
            profile.save()
            
            serializer = self.get_serializer(profile)
            return Response({
                'message': 'Avatar selected successfully! 🎉',
                'profile': serializer.data,
            })
            
        except ValueError:
            return Response({'error': 'Invalid avatar format'}, status=400)
        except IntegrityError:
            return Response({'error': 'Profile conflict'}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=False, methods=['patch'])
    def complete_onboarding(self, request):
        try:
            profile, created = Profile.objects.get_or_create(user=request.user)
            profile.is_onboarded = True
            profile.save()
            serializer = self.get_serializer(profile)
            return Response({
                'message': 'Onboarding completed!',
                'profile': serializer.data
            })
        except Exception as e:
            return Response({'error': str(e)}, status=404)
    @action(detail=False, methods=['patch'])
    def change_password(self, request):
        """Update user password (requires old password)"""
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'error': 'Old password incorrect'}, status=400)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            update_session_auth_hash(request, user)  # Keep user logged in
            return Response({
                'message': 'Password updated successfully! 🔒'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['patch'])
    def update_email(self, request):
        """Update user email (requires password confirmation)"""
        serializer = UpdateEmailSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['password']):
                return Response({'error': 'Current password incorrect'}, status=400)
            if User.objects.filter(email=serializer.validated_data['new_email']).exclude(pk=user.pk).exists():
                return Response({'error': 'Email already exists'}, status=400)
            user.email = serializer.validated_data['new_email']
            user.save()
            return Response({
                'message': 'Email updated successfully! 📧'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class ListViewSet(viewsets.ModelViewSet):
    serializer_class = ListSerializer
    permission_classes = [permissions.IsAuthenticated, IsListMemberOrOwner]

    def get_queryset(self):
        user = self.request.user
        return List.objects.filter(owner=user) | List.objects.filter(members=user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            list_obj = serializer.save(owner=self.request.user)
            return Response({
                'message': 'List created successfully ✅',
                'list': ListSerializer(list_obj).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def invite(self, request, pk=None):
        todo_list = self.get_object()
        username = request.data.get('username')
        try:
            user = User.objects.get(username=username)
            todo_list.members.add(user)
            return Response({'message': f'User {username} added to list! ✅'})
        except User.DoesNotExist:
            return Response({'error': 'User not found!'}, status=status.HTTP_404_NOT_FOUND)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsListMemberOrOwner]

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(
            list__owner=user
        ) | Task.objects.filter(
            list__members=user
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            task = serializer.save()
            return Response({
                'message': 'Task created successfully ✅',
                'task': TaskSerializer(task).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        qs = self.get_queryset().filter(status='pending')
        serializer = self.get_serializer(qs, many=True)
        return Response({
            'message': f'Found {len(serializer.data)} pending tasks ✅',
            'pending_tasks': serializer.data
        })

    @action(detail=False, methods=['get'])
    def today(self, request):
        user = request.user
        now = timezone.now()
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=1)
        qs = self.get_queryset().filter(due_datetime__gte=start, due_datetime__lt=end)
        serializer = self.get_serializer(qs, many=True)
        return Response({
            'message': f"Today's tasks ({len(serializer.data)}) ✅",
            'today_tasks': serializer.data
        })

    @action(detail=True, methods=['post'])
    def finish(self, request, pk=None):
        task = self.get_object()
        if task.status == 'done':
            return Response({'error': 'Task already completed!'}, status=status.HTTP_400_BAD_REQUEST)
        task.status = 'done'
        task.save()
        return Response({
            'message': 'Task completed successfully! ✅',
            'task': TaskSerializer(task).data
        })

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        task = self.get_object()
        if task.status == 'done':
            return Response({'error': 'Cannot start completed task!'}, status=status.HTTP_400_BAD_REQUEST)
        task.status = 'in_progress'
        task.save()
        return Response({
            'message': 'Task started! ⏳',
            'task': TaskSerializer(task).data
        })

    @action(detail=True, methods=['delete'])
    def delete(self, request, pk=None):
        task = self.get_object()
        task.status = 'deleted'
        task.save()
        return Response({
            'message': 'Task deleted successfully! 🗑️',
            'task': TaskSerializer(task).data
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = self.get_queryset()
        stats = {
            'total': qs.count(),
            'pending': qs.filter(status='pending').count(),
            'in_progress': qs.filter(status='in_progress').count(),
            'done': qs.filter(status='done').count(),
            'deleted': qs.filter(status='deleted').count(),
        }
        return Response({'message': 'Task stats ✅', 'stats': stats})

class FocusSessionViewSet(viewsets.ModelViewSet):
    serializer_class = FocusSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FocusSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def stop(self, request, pk=None):
        session = self.get_object()
        if session.end_time:
            return Response({'error': 'Already stopped!'}, status=status.HTTP_400_BAD_REQUEST)
        session.end_time = timezone.now()
        session.save()
        serializer = self.get_serializer(session)
        return Response({
            'message': 'Session stopped! ✅',
            'session': serializer.data
        })
