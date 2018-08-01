'use strict';

function unscope(name) {
  if (name[0] !== '@') {
    return name;
  }

  return name.slice(name.indexOf('/') + 1);
}

/*
  Finds an addon given a specific name. Due to older versions of ember-cli
  not properly supporting scoped packages it was (at one point) common practice
  to have `package.json` include a scoped name but `index.js` having an unscoped
  name.

  Changes to the blueprints and addon model (in ~ 3.4+) have made it much clearer
  that both `package.json` and `index.js` `name`'s should match. At some point
  this will be "forced" and no longer optional.

  This function is attempting to prioritize matching across all of the combinations
  (in this priority order):

  - package.json name matches requested name exactly
  - index.js name matches requested name exactly
  - unscoped (leaf portion) index.js name matches unscoped requested name
  */
let ALREADY_EMITTED_DETAILS;
module.exports = function findAddonByName(addons, name) {
  let exactMatchFromPkg = addons.find(addon => addon.pkg && addon.pkg.name === name);

  if (exactMatchFromPkg) {
    return exactMatchFromPkg;
  }

  let exactMatchFromIndex = addons.find(addon => addon.name === name);
  if (exactMatchFromIndex) {
    const pkg = exactMatchFromIndex.pkg;
    const root = exactMatchFromIndex.root;

    if (ALREADY_EMITTED_DETAILS[root] === undefined) {
      // This is so we down spam the console with duplicate warnings
      ALREADY_EMITTED_DETAILS[root] = true;
      console.warn(`The addon at \`${root}\` has a different name in its addon index.js ('${exactMatchFromIndex.name}') and its package.json ('${pkg && pkg.name}').`);
    }
    return exactMatchFromIndex;
  }

  let unscopedName = unscope(name);
  let unscopedMatchFromIndex = addons.find(addon => addon.name && unscope(addon.name) === unscopedName);
  if (unscopedMatchFromIndex) {
    console.trace(`Finding a scoped addon via its unscoped name is deprecated. You searched for \`${name}\` which we found as \`${unscopedMatchFromIndex.name}\` in '${unscopedMatchFromIndex.root}'`);
    return unscopedMatchFromIndex;
  }

  return undefined;
};

module.exports._RESET_ALREADY_EMITTED_DETAILS = reset;
function reset() {
  ALREADY_EMITTED_DETAILS = Object.create(null);
}

reset();
