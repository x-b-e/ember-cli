'use strict';

const expect = require('chai').expect;
const findAddonByName = require('../../../lib/utilities/find-addon-by-name');
const td = require('testdouble');

const trace = console.trace;
const warn = console.warn;

describe('findAddonByName', function() {
  let addons;

  beforeEach(function() {
    findAddonByName._RESET_ALREADY_EMITTED_DETAILS();
    addons = [{
      name: 'foo',
      pkg: { name: 'foo' },
    }, {
      pkg: { name: 'bar-pkg' },
    }, {
      name: 'foo-bar',
      pkg: { name: 'foo-bar' },
    }, {
      name: '@scoped/foo-bar',
      pkg: { name: '@scoped/foo-bar' },
    }, {
      name: 'thing',
      pkg: { name: '@scope/thing' },
    }, {
      name: '@scoped/other',
      pkg: { name: '@scoped/other' },
    }];

    console.trace = td.func('fake trace');
    console.warn = td.func('fake warn');
  });

  afterEach(function() {
    console.trace = trace;
    console.warn = warn;
  });

  it('should return the foo addon from name', function() {
    let addon = findAddonByName(addons, 'foo');
    expect(addon.name).to.equal('foo', 'should have found the foo addon');
  });

  it('should return the foo-bar addon from name when a foo also exists', function() {
    let addon = findAddonByName(addons, 'foo-bar');
    expect(addon.name).to.equal('foo-bar', 'should have found the foo-bar addon');
  });

  it('should return the bar-pkg addon from package name', function() {
    let addon = findAddonByName(addons, 'bar-pkg');
    expect(addon.pkg.name).to.equal('bar-pkg', 'should have found the bar-pkg addon');
  });

  it('should return undefined if addon doesn\'t exist', function() {
    let addon = findAddonByName(addons, 'not-an-addon');
    expect(addon).to.equal(undefined, 'not found addon should be undefined');
  });

  it('should not return an addon that is a substring of requested name', function() {
    let addon = findAddonByName(addons, 'foo-ba');
    expect(addon).to.equal(undefined, 'foo-ba should not be found');
  });

  it('should not guess addon name from string with slashes', function() {
    let addon = findAddonByName(addons, 'qux/foo');
    expect(addon).to.equal(undefined, 'should not have found the foo addon');
  });

  it('matches scoped packages when names match exactly', function() {
    let addon = findAddonByName(addons, '@scoped/other');
    expect(addon.pkg.name).to.equal('@scoped/other');
  });

  it('matches unscoped name of scoped package when no exact match is found', function() {
    let addon = findAddonByName(addons, 'other');
    expect(addon.pkg.name).to.equal('@scoped/other');
    td.verify(console.trace("Finding a scoped addon via its unscoped name is deprecated. You searched for `other` which we found as `@scoped/other` in 'undefined'"));
  });

  it('warns and matches unscoped name of scoped package when no exact match is found and with the addon name being unscoped', function() {
    let addon = findAddonByName(addons, 'thing');
    expect(addon.pkg.name).to.equal('@scope/thing');
    td.verify(console.warn("The addon at `undefined` has a different name in its addon index.js ('thing') and its package.json ('@scope/thing')."));
  });

  it('if exact match is found, it "wins" over unscoped matches', function() {
    let addon = findAddonByName(addons, 'foo-bar');
    expect(addon.pkg.name).to.equal('foo-bar');
  });
});
