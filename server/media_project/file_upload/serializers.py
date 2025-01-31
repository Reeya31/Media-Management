# serializers.py

from rest_framework import serializers
from .models import File

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ('id','file', 'file_name', 'file_size', 'file_type', 'uploaded_at', 'category')  
