/* globals Foo: true */

Foo = {}

a = new Mongo.Collection('a');
b = new Mongo.Collection('b');
c = new Mongo.Collection('c');

if (Meteor.isServer) {
  a.insert({});
  a.insert({});
  a.insert({});
  a.insert({});

  b.insert({});
  b.insert({});
  b.insert({});
  b.insert({});

  c.insert({});
  c.insert({});
  c.insert({});
  c.insert({});
}
