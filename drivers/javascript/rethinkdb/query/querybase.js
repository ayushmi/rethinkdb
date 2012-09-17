goog.provide('rethinkdb.query');

goog.require('rethinkdb.errors');

/**
 * @fileoverview This file is somewhat of a hack, designed to be included
 * first by the dependency generator so that we can provide the query
 * shortcut function.
 */

/**
 * A shortcut function for wrapping values with ReQL expressions.
 * @namespace namespace for all ReQL query generating functions
 * @export
 */
rethinkdb.query = function(jsobj) {
    if (typeof jsobj === 'string' && (jsobj[0] === '$' || jsobj[0] === '@')) {
        return rethinkdb.query.R(jsobj);
    } else {
        return rethinkdb.query.expr(jsobj);
    }
};

/**
 * Internal utility for wrapping API function arguments
 * @param {*} val The value to wrap
 * @returns rethinkdb.query.Expression
 * @ignore
 */
function wrapIf_(val) {
    if (val instanceof rethinkdb.query.Expression) {
        return val;
    } else {
        return rethinkdb.query(val);
    }
}

/**
 * Internal utility for wrapping API function arguments that
 * are expected to be function expressions.
 * @param {*} fun
        The function to wrap
 * @returns rethinkdb.query.FunctionExpression
 * @ignore
 */
function functionWrap_(fun) {
    if (fun instanceof rethinkdb.query.FunctionExpression) {
        // No wrap needed
    } else if (fun instanceof rethinkdb.query.Expression) {
        fun = rethinkdb.query.fn('', fun);
    } else if(typeof fun === 'function') {
        fun = rethinkdb.query.fn(fun);
    } else {
       throw TypeError("Argument expected to be a function expression");
    }

    return fun;
}

/**
 * Internal utility to enforce API types
 * @ignore
 */
function typeCheck_(value, types) {
    if (!value) return;

    var type_array = types;
    if (!(goog.isArray(types))) {
        type_array = [type_array];
    }

    if (!type_array.some(function(type) {
        return (typeof type === 'string') ? (typeof value === type) : (value instanceof type);
    })) {
        if (goog.isArray(types)) {
            throw new TypeError("Function argument "+value+" must be one of the types "+types);
        } else {
            throw new TypeError("Function argument "+value+" must be of the type "+types);
        }
    };
}

/**
 * Internal utility to verify min arg counts
 */
function argCheck_(args, expected) {
    if (args.length < expected) {
        throw new TypeError("Function requires at least "+expected+" argument"+
                            (expected > 1 ? 's.' : '.'));
    }
}
