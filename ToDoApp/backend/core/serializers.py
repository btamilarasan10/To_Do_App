from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import List, Task, FocusSession, Profile
from django.contrib.auth.password_validation import validate_password



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class RegisterSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True, min_length=8, error_messages={'required': 'Password is required!'})
    password2 = serializers.CharField(write_only=True, min_length=8, error_messages={'required': 'Confirm password is required!'})
    email = serializers.EmailField(required=True, error_messages={'required': 'Gmail address is required!'})
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']
    
    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already exists!")
        return value
    
    def validate_email(self, value):
        allowed_domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']
        domain = value.split('@')[1] if '@' in value else ''
        
        if domain not in allowed_domains:
            raise serializers.ValidationError("Only Gmail, Yahoo, Outlook, Hotmail allowed.")
        
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already registered!")
        
        return value
    
    def validate(self, data):
        if data['password1'] != data['password2']:
            raise serializers.ValidationError("Passwords don't match!")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password1')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        Profile.objects.create(user=user)
        return user

    password1 = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']
    
    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already exists!")
        return value
    
    def validate_email(self, value):
        # Only accept Gmail, Yahoo, Outlook, Hotmail
        allowed_domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']
        domain = value.split('@')[1] if '@' in value else ''
        
        if domain not in allowed_domains:
            raise serializers.ValidationError("Only Gmail, Yahoo, Outlook, Hotmail allowed.")
        
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already registered!")
        
        return value
    
    def validate(self, data):
        if data['password1'] != data['password2']:
            raise serializers.ValidationError("Passwords don't match!")
        if len(data['password1']) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters!")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password1')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        Profile.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()           # ← CHANGED: email instead of username
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        email = data['email']
        password = data['password']
        
        # Find user by email
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password!")
        
        # Authenticate with username (Django needs username internally)
        user_obj = authenticate(username=user.username, password=password)
        if user_obj and user_obj.is_active:
            return user_obj
        raise serializers.ValidationError("Invalid email or password!")



class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = ['user', 'avatar_id', 'avatar_url', 'full_name', 'bio', 'theme', 'is_onboarded']
        read_only_fields = ['user']  # Explicitly mark user as read-only
    
    def get_avatar_url(self, obj):
        return obj.avatar_url  # Assuming this method works correctly
    
    def update(self, instance, validated_data):
        """Ensure user is never overwritten during updates"""
        # Remove user from validated_data since it's read-only
        validated_data.pop('user', None)
        return super().update(instance, validated_data)



class ListSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)
    
    class Meta:
        model = List
        fields = ['id', 'name', 'color', 'owner', 'members']


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'


class FocusSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FocusSession
        fields = '__all__'


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    new_password_confirm = serializers.CharField(required=True)
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password incorrect!")
        return value
    
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError("Passwords don't match!")
        validate_password(data['new_password'], self.context['request'].user)
        return data

class UpdateEmailSerializer(serializers.Serializer):
    new_email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True)
    
    def validate_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Password incorrect!")
        return value
    
    def validate_new_email(self, value):
        if User.objects.filter(email=value).exclude(pk=self.context['request'].user.pk).exists():
            raise serializers.ValidationError("Email already exists!")
        return value