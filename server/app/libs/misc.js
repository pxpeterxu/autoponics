import _ from 'lodash';
import origAxios from 'axios';
import Promise from 'bluebird';
import logger from './logger';

/**
 * Process Sequelize validation messages so that we only display
 * the last one for each field
 * @param errors .errors from a sequelize.validate() or .save()
 * @return list of error messages
 */
function oneMessagePerField(errors) {
  const hasError = {};
  const messages = [];

  for (let i = 0; i !== errors.length; i++) {
    const error = errors[i];
    if (!hasError[error.path]) {
      hasError[error.path] = true;
      messages.push(error.message);
    }
  }

  return messages;
}

/**
 * An internal error type for outputting expected error messages
 * and errTypes in catch() statements
 * @param errors  array of [{ message: '...', type: '...'}, ...]
 */
function ApplicationError(errors, debugData) {
  const messages = errors.map((err) => {
    return err.message;
  });
  const errTypes = errors.map((err) => {
    return err.type;
  });

  this.name = 'ApplicationError';
  this.messages = messages;
  this.message = messages.join('\n');
  this.errTypes = errTypes;
  if (debugData) {
    this.debugData = debugData;
  }
  this.stack = (new Error()).stack;
}

/**
 * An internal error for throwing an error as a response
 * @param response   response object
 */
function ResponseError(response, debugData) {
  this.name = 'ResponseError';
  this.response = response;
  this.message = response.messages.join('\n');
  this.errTypes = response.errTypes;
  if (debugData) {
    this.debugData = debugData;
  }
  this.stack = (new Error()).stack;
}

function buildApplicationError(message, type) {
  return new ApplicationError([{ message: message, type: type }]);
}

function defaultCatch(res) {
  return function(err) {
    if (_.isArray(err)) {
      // By convention, this is an error that we threw
      // ourselves, so we should actually output the error
      // messages to the client
      res.json({
        success: false,
        messages: err
      });
    } else if (err instanceof ResponseError) {
      res.json(err.response);
    } else if (err instanceof ApplicationError) {
      // This is also an internally-generated error similar
      // to the above, except with details and futureproofing
      const response = {
        success: false,
        messages: err.messages,
        errTypes: err.errTypes
      };
      if (err.debugData) {
        response.debugData = err.debugData;
      }
      res.json(response);
    } else if (err.name === 'SequelizeValidationError') {
      res.json({ success: false, messages: oneMessagePerField(err.errors) });
    } else {
      logger.error('Caught unusual exception', err.stack);
      res.json({
        success: false,
        messages: ['An unexpected error has occurred'],
        error: err
      });
    }
  };
}


/**
 * Create a multi-dimensional object out of an array of entries
 * using the given keys as the output's keys
 * @param arr         array of objects to put into this
 * @param keys        keys for each layer, from shallowest to deepest
 * @param valueKey    value key for the actual final value
 * @param intoArrays  whether to make the final level an array, useful for when
 *                    there are multiple matching entries
 * @example  unflattenObject([{ year: 2015, month: 'January', day: 15, weather: 'snow'}],
 *           ['year', 'month', 'day'], 'weather')
 *           will give { 2015: { January: { 15: 'snow' } } }
 * @example  unflattenObject([{ year: 2015, name: 'Peter' }, { year: 2015, name: 'Harry'}],
 *           ['year'], 'name', true)
 *           will give { 2015: ['Peter', 'Harry'] }
 */
export function unflattenObject(arr, keys, valueKey, intoArrays) {
  const ret = {};
  for (const entry of arr) {
    const value = valueKey ? entry[valueKey] : entry;
    const keysForEntry = keys.map(key => (
      entry[key] == null ? entry[key] : entry[key].toString()
    ));
    let toSet = value;
    if (intoArrays) {
      toSet = _.get(ret, keysForEntry) || [];
      toSet.push(value);
    }
    _.setWith(ret, keysForEntry, toSet, Object);
  }

  return ret;
}

/**
 * Flatten a multi-dimensional object, assigning each dimension's key
 * to a different variable as specified
 * @param obj     object to flatten
 * @param keys    keys for each layer, from shallowest to deepest
 * @example  flattenObject({ '2015': { 'January': { 15: 'snow' }}},
 *           ['year', 'month', 'day', 'weather'])
 *           will give [{ year: 2015, month: 'January', day: 15, weather: 'snow'}]
 */
export function flattenObject(obj, keys) {
  function recurse(value, keys, layer) {
    const keyName = keys[layer];
    if (layer === keys.length - 1) {
      return [{ [keyName]: value }];
    } else if (_.isObject(value)) {
      // Exit once we get to the value or to the last key
      return _.chain(value).map((val, key) => {
        const nextLayer = recurse(val, keys, layer + 1);
        return nextLayer.map((obj) => {
          // Assigning null as keys in objects
          // converts it to a string 'null'
          obj[keyName] = key;
          return obj;
        });
      }).flatten().value();
    } else {
      throw new Error('Array deeper than expected: at layer ' + layer + ' with value ' + value);
    }
  }
  return recurse(obj, keys, 0);
}

/**
 * Get a list of unique objects by grouping the objects
 * by the keys given
 * @param arr        array of objects
 * @param groupKeys  keys to group by
 * @return array of unique objects grouped by those keys
 */
export function group(arr, groupKeys) {
  // Do this by assigning everything to an object
  // and then putting it back
  const unflattened = unflattenObject(arr, groupKeys);
  return flattenObject(unflattened, groupKeys);
}

// Variants on axios
function getAxiosData(response) { return response.data; }

function axios(args) {
  return origAxios(args).then(getAxiosData);
}

const axiosCache = {};
function axiosCached(args) {
  const key = JSON.stringify(args);
  if (axiosCache[key]) {
    return Promise.resolve(axiosCache[key]);
  }
  return origAxios(args).then(getAxiosData).then((data) => {
    axiosCache[key] = data;
    return data;
  });
}

const throttledNextTime = {};
/**
 * Throttle a function so that the next function called
 * with throttle only fires after `delay` milliseconds
 * @param args   args for axios
 * @param delay  minimum delay after this call
 * @param queueName  (optional) name of queue to put request
 *                   on; defaults to "default"
 * @return Promise.<data> after delays
 */
export function throttle(func, delay, queue) {
  queue = queue || 'default';
  const now = Date.now();

  let wait;
  const nextTime = throttledNextTime[queue];
  if (!nextTime) {
    wait = 0;
  } else {
    wait = Math.max(0, nextTime - now);
  }

  // The earliest time next request should take place
  throttledNextTime[queue] = now + wait + delay;

  const delayPromise = wait ? Promise.delay(wait) : Promise.resolve(null);
  return delayPromise.then(() => func());
}

const defaultCharset = 'abcdefghijklmnopqrstuvwxyz0123456789';
function randomString(length, charset) {
  charset = charset || defaultCharset;
  let str = '';
  for (let i = 0; i !== length; i++) {
    str += charset[Math.floor(Math.random() * charset.length)];
  }
  return str;
}

module.exports = {
  defaultCatch,
  ApplicationError,
  ResponseError,
  buildApplicationError,
  oneMessagePerField,
  axios,
  axiosCached,
  throttle,

  randomString,

  unflattenObject,
  flattenObject,
  group
};
