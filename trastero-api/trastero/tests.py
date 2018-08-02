

def generate_test_data(root, collection_name=None, patterns=None):
    import os
    import datetime
    import fnmatch
    from .models import Collection

    root = os.path.realpath(root)

    for base, directories, filenames in os.walk(root):
        for filename in filenames:
            if filename.startswith('.'):
                continue
            path = os.path.join(base, filename)
            if patterns and not any(fnmatch.fnmatch(path, x) for x in patterns):
                continue

            parents = os.path.relpath(path, root).split(os.path.sep)

            if collection_name is None:
                auto_name = parents[0]
            else:
                auto_name = collection_name
            tags = parents[1:-1]

            metadata = {'stats': {}}
            statinfo = os.stat(path)
            metadata['stats']['st_mtime'] = str(datetime.datetime.fromtimestamp(
                statinfo.st_mtime))
            metadata['stats']['st_size'] = statinfo.st_size
            img_types = ('.jpg', '.png', '.tif', '.exr')
            if os.path.splitext(path)[-1].lower() in img_types:
                metadata['type'] = 'image'

            with Collection(auto_name) as collection:
                item = collection.new(url=path, tags=tags, metadata=metadata)
                item.save()


def capture_manifest(root, collection_name='manifest'):
    import os
    import subprocess
    import datetime
    from .models import Collection

    proc = subprocess.Popen(['git', 'ls-files', '--full-name'],
                            stdout=subprocess.PIPE)
    paths = [os.path.join(root, x.decode('utf-8')) for x in proc.communicate()[0].split(b'\n') if x]

    for path in paths:

        tags = []
        ext = os.path.splitext(path)[-1][1:]
        if ext:
            tags.append(ext)
        if 'docker' in path.lower():
            tags.append('docker')
        if 'trastero-api' in path:
            tags.append('api')
        elif 'trastero-server' in path:
            tags.append('server')
        elif 'trastero-ui' in path:
            tags.append('ui')

        metadata = {'stats': {}}
        statinfo = os.stat(path)
        metadata['stats']['st_mtime'] = str(datetime.datetime.fromtimestamp(
            statinfo.st_mtime))
        metadata['stats']['st_size'] = statinfo.st_size
        img_types = ('.jpg', '.png', '.tif', '.exr')
        if os.path.splitext(path)[-1].lower() in img_types:
            metadata['type'] = 'image'

        with Collection(collection_name) as collection:
            item = collection.new(url=path, tags=set(tags), metadata=metadata)
            item.save()
