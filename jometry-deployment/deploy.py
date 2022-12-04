import boto3 # type: ignore
from botocore.exceptions import ClientError # type: ignore
from pathlib import Path
from typing import List

def get_s3_client():
    return boto3.client('s3')

def get_content_type_for_path(path: Path) -> str:
    if path.suffix == '.html':
        return 'text/html'
    elif path.suffix == '.css':
        return 'text/css'
    elif path.suffix == '.js':
        return 'application/javascript'
    elif path.suffix == '.png':
        return 'image/png'
    elif path.suffix == '.ico':
        return 'image/x-icon'
    elif path.suffix == '.txt':
        return 'text/plain'
    elif path.suffix == '.webmanifest':
        return 'application/manifest+json'
    else:
        raise BaseException('Unknown suffix ' + path.suffix)

def upload_to_s3(pathlist: List[Path]):
    try:
        s3_client = get_s3_client()
        for path in pathlist:
            response = s3_client.upload_file(str(path), 'j-ometry', str(path.relative_to('dist')), \
                ExtraArgs={
                    'CacheControl': 'max-age=300',
                    'ContentType': get_content_type_for_path(path)
                })
    except ClientError as e:
        print(e)

if __name__ == '__main__':
    pathlist = Path('dist').glob('**/*.*')
    upload_to_s3(pathlist)