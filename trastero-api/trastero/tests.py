

def generate_test_data(root, collection_name=None, patterns=None):
    import os
    import datetime
    import fnmatch
    from .models import Collection, Item

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
                try:
                    item.save()
                except Exception:
                    pass
