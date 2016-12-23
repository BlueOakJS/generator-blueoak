/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';
var recast = require('recast');
var astBuilders = require("ast-types").builders;
var traverse = require('traverse');
var CallExpression = require('ast-query/lib/nodes/CallExpression');


function isFluentCallExpression(tree, name) {
	if (tree.callee.type != 'MemberExpression')
		return false;
	var memberExpressionObject = tree.callee.object;
	if (memberExpressionObject.type == 'CallExpression')
		return isFluentCallExpression(memberExpressionObject, name);
	return memberExpressionObject.type == 'Identifier' && memberExpressionObject.name == name;
}

/**
 * Find variables declaration
 * @param  {String} name  Name of the declared variable
 * @return {Variable}
 */
function fluent(tree, name) {
	var fluentCalls = [];
	var nodes = traverse(tree).forEach(function() {
		if (this.parent && this.parent.node.type == 'ExpressionStatement' &&
			this.node.type === 'CallExpression' && isFluentCallExpression(this.node, name))
			fluentCalls.push(new FluentCall(this.parent.node));
	});
	return fluentCalls;
};


/**
 * Constructor for a function call/invocation
 * @constructor
 * @param  {Array(Object)} nodes
 */
var FluentCall = function(expressionTree) {
	this.expressionTree = expressionTree;

	this.calls = [];
	var currentCall = this.expressionTree.expression;
	while (currentCall.type == 'CallExpression') {
		this.calls.unshift(new FluentCallExpression(currentCall));
		currentCall = currentCall.callee.object;
	}
};

FluentCall.prototype.appendCall = function(codeString) {
	var tree = recast.parse('x' + codeString);
	var expressionTree = tree.program.body[0].expression;
	expressionTree.callee.object = this.expressionTree.expression;
	this.expressionTree.expression = expressionTree;
}

FluentCall.prototype.getCallAt = function(where) {
	return this.calls[where];
}

FluentCall.prototype.forEach = function(callback, thisArg) {
	this.calls.forEach(callback, thisArg);
}

FluentCall.prototype.every = function(callback, thisArg) {
	return this.calls.every(callback, thisArg);
}

FluentCall.prototype.some = function(callback, thisArg) {
	return this.calls.some(callback, thisArg);
}

var FluentCallExpression = function(tree) {
	CallExpression.call(this, tree);
}
FluentCallExpression.prototype = Object.create(CallExpression.prototype);
FluentCallExpression.prototype.constructor = FluentCallExpression;

FluentCallExpression.prototype.functionName = function() {
	return this.nodes[0].callee.property.name;
}

FluentCallExpression.prototype.replaceCall = function(codeString) {
	var tree = recast.parse('x' + codeString);
	var expressionTree = tree.program.body[0].expression;
	this.nodes[0].arguments = expressionTree.arguments;
}

module.exports = fluent;
