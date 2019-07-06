'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = unique;

var _getID = require('./getID');

var _getClasses = require('./getClasses');

var _getCombinations = require('./getCombinations');

var _getAttributes = require('./getAttributes');

var _getNthChild = require('./getNthChild');

var _getTag = require('./getTag');

var _isUnique = require('./isUnique');

var _getParents = require('./getParents');

/**
 * Returns all the selectors of the elmenet
 * @param  { Object } element
 * @return { Object }
 */
/**
 * Expose `unique`
 */

function getAllSelectors(el, selectors, attributesToIgnore) {
  var funcs = {
    'Tag': _getTag.getTag,
    'NthChild': _getNthChild.getNthChild,
    'Attributes': function Attributes(elem) {
      return (0, _getAttributes.getAttributes)(elem, attributesToIgnore);
    },
    'Class': _getClasses.getClassSelectors,
    'ID': _getID.getID
  };

  return selectors.reduce(function (res, next) {
    res[next] = funcs[next](el);
    return res;
  }, {});
}

/**
 * Tests uniqueNess of the element inside its parent
 * @param  { Object } element
 * @param { String } Selectors
 * @return { Boolean }
 */
function testUniqueness(element, selector) {
  var parentNode = element.parentNode;

  var elements = parentNode.querySelectorAll(selector);
  return elements.length === 1 && elements[0] === element;
}

/**
 * Tests all selectors for uniqueness and returns the first unique selector.
 * @param  { Object } element
 * @param  { Array } selectors
 * @return { String }
 */
function getFirstUnique(element, selectors) {
  for (var i = 0; i < selectors.length; i++) {
    if (testUniqueness(element, selectors[i])) {
      return selectors[i];
    }
  }

  return undefined;
}

/**
 * Checks all the possible selectors of an element to find one unique and return it
 * @param  { Object } element
 * @param  { Array } items
 * @param  { String } tag
 * @return { String }
 */
function getUniqueCombination(element, items, tag) {
  var combinations = (0, _getCombinations.getCombinations)(items, 3),
      firstUnique = getFirstUnique(element, combinations);

  if (Boolean(firstUnique)) {
    return firstUnique;
  }

  if (Boolean(tag)) {
    combinations = combinations.map(function (combination) {
      return tag + combination;
    });
    firstUnique = getFirstUnique(element, combinations);

    if (Boolean(firstUnique)) {
      return firstUnique;
    }
  }

  return null;
}

/**
 * Returns a uniqueSelector based on the passed options
 * @param  { DOM } element
 * @param  { Array } options
 * @return { String }
 */
function getUniqueSelector(element, selectorTypes, attributesToIgnore, excludeRegex) {
  var foundSelector = void 0;

  var elementSelectors = getAllSelectors(element, selectorTypes, attributesToIgnore);

  if (excludeRegex && excludeRegex instanceof RegExp) {
    elementSelectors.ID = excludeRegex.test(elementSelectors.ID) ? null : elementSelectors.ID;
    elementSelectors.Class = elementSelectors.Class.filter(function (className) {
      return !excludeRegex.test(className);
    });
  }

  for (var i = 0; i < selectorTypes.length; i++) {
    var ID = elementSelectors.ID,
        Tag = elementSelectors.Tag,
        Classes = elementSelectors.Class,
        Attributes = elementSelectors.Attributes,
        NthChild = elementSelectors.NthChild;

    switch (selectorTypes[i]) {
      case 'ID':
        if (Boolean(ID) && testUniqueness(element, ID)) {
          return ID;
        }
        break;

      case 'Tag':
        if (Boolean(Tag) && testUniqueness(element, Tag)) {
          return Tag;
        }
        break;

      case 'Class':
        if (Boolean(Classes) && Classes.length) {
          foundSelector = getUniqueCombination(element, Classes, Tag);
          if (foundSelector) {
            return foundSelector;
          }
        }
        break;

      case 'Attributes':
        if (Boolean(Attributes) && Attributes.length) {
          foundSelector = getUniqueCombination(element, Attributes, Tag);
          if (foundSelector) {
            return foundSelector;
          }
        }
        break;

      case 'NthChild':
        if (Boolean(NthChild)) {
          return NthChild;
        }
    }
  }
  return '*';
}

/**
 * Generate unique CSS selector for given DOM element
 *
 * @param {Element} el
 * @return {String}
 * @api private
 */

function unique(el) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$selectorType = options.selectorTypes,
      selectorTypes = _options$selectorType === undefined ? ['ID', 'Class', 'Tag', 'NthChild'] : _options$selectorType,
      _options$attributesTo = options.attributesToIgnore,
      attributesToIgnore = _options$attributesTo === undefined ? ['id', 'class', 'length'] : _options$attributesTo,
      _options$excludeRegex = options.excludeRegex,
      excludeRegex = _options$excludeRegex === undefined ? null : _options$excludeRegex;

  var allSelectors = [];
  var parents = (0, _getParents.getParents)(el);

  for (var i = 0; i < parents.length; i++) {
    var selector = getUniqueSelector(parents[i], selectorTypes, attributesToIgnore, excludeRegex);
    if (Boolean(selector)) {
      allSelectors.push(selector);
    }
  }

  var selectors = [];
  for (var _i = 0; _i < allSelectors.length; _i++) {
    selectors.unshift(allSelectors[_i]);
    var _selector = selectors.join(' > ');
    if ((0, _isUnique.isUnique)(el, _selector)) {
      return _selector;
    }
  }

  return null;
}