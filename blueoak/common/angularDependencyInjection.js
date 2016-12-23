/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var recast = require('recast');
var astTypes = require('ast-types');
var astBuilders = astTypes.builders;
var namedTypes = astTypes.namedTypes;

function addInjection(fileContents, functionName, newDependency) {
	var tree = recast.parse(fileContents);

	astTypes.visit(tree, {
		visitFunctionDeclaration: function(path) {
			function isFunctionNamed() {
				var functionId = path.get("id").value;
				if (!namedTypes.Identifier.check(functionId) ||
					functionId.name != functionName)
					return false;

				return true;
			}

			if (!isFunctionNamed()) {
				// If it's not the right call, keep looking
				this.traverse(path);
			} else {
				// Found it.. add the dependency to the end of the parameters
				path.get('params').push(astBuilders.identifier(newDependency));

				return false;
			}
		},

		visitAssignmentExpression: function(path) {
			function is$inject() {
				var lhs = path.get('left');

				if (!namedTypes.MemberExpression.check(lhs.value))
					return false;

				var objectNode = lhs.get("object").value;
				if (!namedTypes.Identifier.check(objectNode) ||
					objectNode.name != functionName)
					return false;

				var propertyNode = lhs.get("property").value;
				if (!namedTypes.Identifier.check(propertyNode) ||
					propertyNode.name != '$inject')
					return false;

				return true;
			}

			if (path.get('operator').value != '=' ||
				!is$inject() ||
				namedTypes.ArrayExpression.check(path.get('right'))) {
				// If it's not the right call, keep looking
				this.traverse(path);
			} else {
				// Found it.. add the dependency to the end of the parameters
				path.get('right', 'elements').push(astBuilders.literal(newDependency));

				return false;
			}
		}
	});

	var codeGenOptions = {
		quote: "single"
	};
	return recast.print(tree, codeGenOptions).code;
}

module.exports.addInjection = addInjection;
