/* globals Foo: true */

Foo = {}

var a = new Mongo.Collection('a');
var b = new Mongo.Collection('b');
var c = new Mongo.Collection('c');

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
