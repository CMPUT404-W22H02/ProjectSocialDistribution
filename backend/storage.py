from django.core.files.storage import FileSystemStorage
from django.conf import settings
import os

class OverwriteStorage(FileSystemStorage):

    """
    Overwrite the default storage convention which is to find a new file name when one already exists.
    This allows django to overwrite the file with the same name, this is only used currently with ImageFields,
    default has not changed.
    """
    def get_available_name(self, name, max_length=None):

        if self.exists(name):
            os.remove(os.path.join(settings.MEDIA_ROOT, name))
        return super(OverwriteStorage, self).get_available_name(name, max_length)