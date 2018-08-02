from flask import Flask
from flask_graphql import GraphQLView

from trastero.db import init

from trastero_server.schema import schema


def get_app(name=None):

    app = Flask(name or __name__)
    app.debug = True

    db = init()

    class MyView(GraphQLView):
        def get_context(self):
            return {'db': db}

    app.add_url_rule(
        '/graphql',
        view_func=MyView.as_view('graphql', schema=schema))

    # Optional, for adding batch query support (used in Apollo-Client)
    app.add_url_rule(
        '/graphql/batch',
        view_func=MyView.as_view('graphql/batch', schema=schema, batch=True))

    app.add_url_rule(
        '/graphiql',
        view_func=MyView.as_view('graphiql', schema=schema, graphiql=True))

    return app


if __name__ == '__main__':
    app = get_app()

    # FIXME: remove
    import trastero.tests
    print('Adding test data...')
    trastero.tests.generate_test_data('/opt/app/_data/')
    # trastero.tests.generate_test_data('/opt/app/trastero-ui/', collection_name='trastero-ui')

    app.run(host='0.0.0.0', debug=True)
