import graphene
from graphene.relay import Node
from graphene_mongo import MongoengineConnectionField, MongoengineObjectType
from mongoengine.context_managers import switch_collection

from trastero.models import Item as ItemModel


class Item(MongoengineObjectType):

    class Meta:
        model = ItemModel
        interfaces = (Node,)


class DynamicCollection(MongoengineConnectionField):

    def get_queryset(self, model, info, **args):
        if 'collection' not in info.context:
            return [], 0
        with switch_collection(model, info.context['collection']):
            return super(DynamicCollection, self).get_queryset(
                model, info, **args)


class Query(graphene.ObjectType):
    node = Node.Field()

    collections = graphene.List(graphene.String)

    collection = graphene.String(name=graphene.String())
    items = DynamicCollection(Item)

    def resolve_collections(self, info, **args):
        return info.context['db'].list_collection_names()

    def resolve_collection(self, info, **args):
        if 'name' not in args:
            raise NotImplementedError(info, args)
        info.context['collection'] = args['name']
        return args['name']


schema = graphene.Schema(query=Query, types=[Item])
