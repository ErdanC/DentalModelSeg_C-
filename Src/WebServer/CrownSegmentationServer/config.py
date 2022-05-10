
from os.path import abspath, dirname
UPLOAD_FOLDER=dirname(abspath(__file__))+'/../upload'
print('upload dir:'+UPLOAD_FOLDER);

ALLOWED_EXTENSIONS = set(['stl'])
