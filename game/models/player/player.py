from django.db import models
from django.contrib.auth.models import User


class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    photo = models.URLField(max_length=256, blank=True)
    HPNum = models.IntegerField()
    MapNum = models.IntegerField()
    Skill = models.CharField(max_length=10);

    def __str__(self):
        return str(self.user)
