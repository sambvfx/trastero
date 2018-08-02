import mongoengine


# FIXME: Should we consider allowing custom Document to be inserted and
#        searched? If we chose not to, then we may stuff more than we want
#        into metadata. We could use DynamicDocument, but the extra fields
#        wouldn't be served via the graphql model wrapper.
class Item(mongoengine.Document):
    meta = {'collection': 'default'}

    # FIXME: Should we just use id here and keep it abstract?
    url = mongoengine.StringField(required=True, primary_key=True)

    # FIXME: Should this be a first-class concept of our model?
    thumbnail = mongoengine.StringField(default='')

    # FIXME: Should this be a first-class concept of our model?
    tags = mongoengine.ListField(mongoengine.StringField())

    # FIXME: This gets json serialized so it's internals are not available
    #        to graphql for filtering. This means you cannot make optimized
    #        queries such as fetching only specific metadata. We need to use
    #        some other type of field, but I'm not sure what yet...
    metadata = mongoengine.DictField()


class Collection(object):

    model = Item

    def __init__(self, collection_name, autosave=False):

        self.collection_name = collection_name
        self.autosave = autosave
        self.created = []
        self._fetched = []

        self._ori_collection = self.model._collection
        self._ori_get_collection_name = self.model._get_collection_name

    @property
    def modified(self):
        return [x for x in self._fetched if x._changed_fields]

    def __enter__(self):

        @classmethod
        def _get_collection_name(cls):
            return self.collection_name

        self.model._collection = None
        self.model._get_collection_name = _get_collection_name

        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.autosave:
            self.commit()
        self.model._collection = self._ori_collection
        self.model._get_collection_name = self._ori_get_collection_name

    def commit(self):
        for item in self.created + self.modified:
            item.save()

    def query(self, **kwargs):
        results = self.model.objects(**kwargs)
        self._fetched.extend(results)
        return results

    def new(self, **kwargs):
        item = self.model(**kwargs)
        self.created.append(item)
        return item
