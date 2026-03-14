from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL

class List(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_lists')
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default='#4f46e5')
    members = models.ManyToManyField(User, related_name='shared_lists', blank=True)

    def __str__(self):
        return self.name

class Task(models.Model):
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
        ('deleted', 'Deleted'),
    )

    list = models.ForeignKey(List, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_datetime = models.DateTimeField(null=True, blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    labels = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    AVATAR_CHOICES = [
        (1, 'Person 1'),
        (2, 'Person 2'),
        (3, 'Person 3'),
        (4, 'Beard'),
        (5, 'Blonde'),
        (6, 'Hijab'),
        (7, 'Older'),
        (8, 'Kid'),
    ]

    avatar_id = models.IntegerField(choices=AVATAR_CHOICES, default=1)

    full_name = models.CharField(max_length=150, blank=True)
    bio = models.CharField(max_length=255, blank=True)

    theme = models.CharField(
        max_length=20,
        choices=[('light', 'Light'), ('dark', 'Dark')],
        default='dark'
    )

    is_onboarded = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username

    @property
    def avatar_url(self):
        return f"/static/avatars/avatar{self.avatar_id}.jpg"


class FocusSession(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='focus_sessions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='focus_sessions')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.task.title}"
    
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    AVATAR_CHOICES = [
        (1, '🧑 Person 1'), (2, '👨 Person 2'), (3, '👩 Person 3'), 
        (4, '🧔 Beard'), (5, '👱 Blonde'), (6, '🧕 Hijab'),
        (7, '👴 Older'), (8, '👦 Kid'),
    ]
    
    avatar_id = models.IntegerField(choices=AVATAR_CHOICES, default=1, blank=True)  # 1-8 for static files
    full_name = models.CharField(max_length=150, blank=True)
    bio = models.CharField(max_length=255, blank=True)
    theme = models.CharField(max_length=20, choices=[('light', 'Light'), ('dark', 'Dark')], default='dark')
    is_onboarded = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username

    @property
    def avatar_url(self):
        """Returns path to static/avatars/ file"""
        if self.avatar_id:
            return f"/static/avatars/avatar{self.avatar_id}.jpg"
        return "/static/avatars/default.jpg"
