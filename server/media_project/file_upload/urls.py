from django.urls import path
from .views import FileUploadView, FileDeleteView

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('delete/<int:pk>/', FileDeleteView.as_view(), name='file-delete'),

]
