import mongoengine


def init(db_name=None, host=None, port=None, username=None, password=None):
    import os

    if db_name is None:
        db_name = os.environ.get(
            'TRASTERO_MONGO_DB_NAME', 'trastero')

    if host is None:
        host = os.environ.get(
            'TRASTERO_MONGO_HOST', 'mongodb://db')

    if port is None:
        port = os.environ.get(
            'TRASTERO_MONGO_PORT', 27017)

    if username is None:
        username = os.environ.get(
            'TRASTERO_MONGO_USERNAME', 'trastero')

    if password is None:
        password = os.environ.get(
            'TRASTERO_MONGO_PASSWORD', 'trastero123!')

    print('''
        client = mongoengine.connect(
            db={db_name!r},
            # username={username!r},
            # password={password!r},
            host={host!r},
            port={port!r},
            connect=False
        )
        '''.format(
            db_name=db_name,
            username=username,
            password=password,
            host=host,
            port=int(port),
        ))

    client = mongoengine.connect(
        db=db_name,
        # username=username,
        # password=password,
        host=host,
        port=int(port),
        connect=False
    )

    return client.get_database(db_name)
