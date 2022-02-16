define(["require", "exports", "./interpreter.constants", "./interpreter.util"], function (require, exports, C, U) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.State = void 0;
    var State = /** @class */ (function () {
        /**
         * initialization of the state.
         * Gets the array of operations and the function definitions and resets the whole state
         *
         * . @param ops the array of operations
         * . @param fct the function definitions
         */
        function State(ops) {
            this.operations = ops;
            this.pc = 0;
            this.bindings = {};
            this.stack = [];
            this.currentBlocks = [];
            this.debugMode = false;
            // p( 'storeCode with state reset' );
        }
        State.prototype.incrementProgramCounter = function () {
            this.pc++;
        };
        /** returns the boolean debugMode */
        State.prototype.getDebugMode = function () {
            return this.debugMode;
        };
        /** updates the boolean debugMode */
        State.prototype.setDebugMode = function (mode) {
            this.debugMode = mode;
        };
        /**
         * introduces a new binding. An old binding (if it exists) is hidden, until an unbinding occurs.
         *
         * . @param name the name to which a value is bound
         * . @param value the value that is bound to a name
         */
        State.prototype.bindVar = function (name, value) {
            this.checkValidName(name);
            this.checkValidValue(value);
            var nameBindings = this.bindings[name];
            if (nameBindings === undefined || nameBindings === null || nameBindings === []) {
                this.bindings[name] = [value];
                U.debug('bind new ' + name + ' with ' + value + ' of type ' + typeof value);
            }
            else {
                nameBindings.unshift(value);
                U.debug('bind&hide ' + name + ' with ' + value + ' of type ' + typeof value);
            }
        };
        /**
         * remove a  binding. An old binding (if it exists) is re-established.
         *
         * . @param name the name to be unbound
         */
        State.prototype.unbindVar = function (name) {
            this.checkValidName(name);
            var oldBindings = this.bindings[name];
            if (oldBindings.length < 1) {
                U.dbcException('unbind failed for: ' + name);
            }
            oldBindings.shift();
            U.debug('unbind ' + name + ' remaining bindings are ' + oldBindings.length);
        };
        /**
         * get the value of a binding.
         *
         * . @param name the name whose value is requested
         */
        State.prototype.getVar = function (name) {
            this.checkValidName(name);
            var nameBindings = this.bindings[name];
            if (nameBindings === undefined || nameBindings === null || nameBindings.length < 1) {
                U.dbcException('getVar failed for: ' + name);
            }
            // p( 'get ' + name + ': ' + nameBindings[0] );
            return nameBindings[0];
        };
        /**
         * gets all the bindings.
         */
        State.prototype.getVariables = function () {
            return this.bindings;
        };
        /**
         * update the value of a binding.
         *
         * . @param name the name whose value is updated
         * . @param value the new value for that binding
         */
        State.prototype.setVar = function (name, value) {
            this.checkValidName(name);
            this.checkValidValue(value);
            if (value === undefined || value === null) {
                U.dbcException('setVar value invalid');
            }
            var nameBindings = this.bindings[name];
            if (nameBindings === undefined || nameBindings === null || nameBindings.length < 1) {
                U.dbcException('setVar failed for: ' + name);
            }
            nameBindings[0] = value;
            // p( 'set ' + name + ': ' + nameBindings[0] );
        };
        /**
         * push a value onto the stack
         *
         * . @param value the value to be pushed
         */
        State.prototype.push = function (value) {
            this.checkValidValue(value);
            this.stack.push(value);
            U.debug('push ' + value + ' of type ' + typeof value);
        };
        /**
         * pop a value from the stack:
         * - discard the value
         * - return the value
         */
        State.prototype.pop = function () {
            if (this.stack.length < 1) {
                U.dbcException('pop failed with empty stack');
            }
            var value = this.stack.pop();
            // p( 'pop ' + value );
            return value;
        };
        /**
         * get the first (top) value from the stack. Do not discard the value
         */
        State.prototype.get0 = function () {
            return this.get(0);
        };
        /**
         * get the second value from the stack. Do not discard the value
         */
        State.prototype.get1 = function () {
            return this.get(1);
        };
        /**
         * get the third value from the stack. Do not discard the value
         */
        State.prototype.get2 = function () {
            return this.get(2);
        };
        /**
         * helper: get a value from the stack. Do not discard the value
         *
         * . @param i the i'th value (starting from 0) is requested
         */
        State.prototype.get = function (i) {
            if (this.stack.length === 0) {
                U.dbcException('get failed with empty stack');
            }
            return this.stack[this.stack.length - 1 - i];
        };
        /**
         * for early error detection: assert, that a name given (for a binding) is valid
         */
        State.prototype.checkValidName = function (name) {
            if (name === undefined || name === null) {
                U.dbcException('invalid name');
            }
        };
        /**
         * for early error detection: assert, that a value given (for a binding) is valid
         */
        State.prototype.checkValidValue = function (value) {
            if (value === undefined || value === null) {
                U.dbcException('bindVar value invalid');
            }
        };
        /**
         * get the next operation to be executed from the actual array of operations.
         */
        State.prototype.getOp = function () {
            return this.operations[this.pc];
        };
        /**
         * FOR DEBUGGING: write the actual array of operations to the 'console.log'. The actual operation is prefixed by '*'
         *
         * . @param msg the prefix of the message (for easy reading of the logs)
         */
        State.prototype.opLog = function (msg) {
            U.opLog(msg, this.operations, this.pc);
        };
        State.prototype.evalHighlightings = function (currentStmt, lastStmt) {
            var _a;
            if (this.debugMode) {
                var initiations_1 = (currentStmt === null || currentStmt === void 0 ? void 0 : currentStmt[C.HIGHTLIGHT_PLUS]) || [];
                var terminations = (_a = lastStmt === null || lastStmt === void 0 ? void 0 : lastStmt[C.HIGHTLIGHT_MINUS]) === null || _a === void 0 ? void 0 : _a.filter(function (term) { return initiations_1.indexOf(term) < 0; });
                this.evalTerminations(terminations);
                this.evalInitiations(initiations_1);
            }
        };
        /** adds block to currentBlocks and applies correct highlight to block**/
        State.prototype.evalInitiations = function (initiations) {
            var _this = this;
            initiations
                .map(function (blockId) { return stackmachineJsHelper.getBlockById(blockId); })
                .forEach(function (block) {
                if (stackmachineJsHelper.getJqueryObject(block === null || block === void 0 ? void 0 : block.svgPath_).hasClass('breakpoint')) {
                    stackmachineJsHelper.getJqueryObject(block === null || block === void 0 ? void 0 : block.svgPath_).removeClass('breakpoint').addClass('selectedBreakpoint');
                }
                _this.highlightBlock(block);
                _this.addToCurrentBlock(block.id);
            });
        };
        /** removes block froms currentBlocks and removes highlighting from block**/
        State.prototype.evalTerminations = function (terminations) {
            var _this = this;
            terminations === null || terminations === void 0 ? void 0 : terminations.map(function (blockId) { return stackmachineJsHelper.getBlockById(blockId); }).forEach(function (block) {
                if (stackmachineJsHelper.getJqueryObject(block === null || block === void 0 ? void 0 : block.svgPath_).hasClass('selectedBreakpoint')) {
                    stackmachineJsHelper.getJqueryObject(block === null || block === void 0 ? void 0 : block.svgPath_).removeClass('selectedBreakpoint').addClass('breakpoint');
                }
                _this.removeBlockHighlight(block);
                _this.removeFromCurrentBlock(block.id);
            });
        };
        /** Returns true if the current block is currently being executed**/
        State.prototype.beingExecuted = function (stmt) {
            var blockId = stmt[C.HIGHTLIGHT_PLUS].slice(-1).pop();
            return blockId && this.isInCurrentBlock(blockId);
        };
        State.prototype.highlightBlock = function (block) {
            stackmachineJsHelper.getJqueryObject(block.svgPath_).stop(true, true).animate({ 'fill-opacity': '1' }, 0);
        };
        State.prototype.removeBlockHighlight = function (block) {
            stackmachineJsHelper.getJqueryObject(block.svgPath_).stop(true, true).animate({ 'fill-opacity': '0.3' }, 50);
        };
        /** Will add highlights from all currently blocks being currently executed and all given Breakpoints
         * @param breakPoints the array of breakpoint block id's to have their highlights added*/
        State.prototype.addHighlights = function (breakPoints) {
            var _this = this;
            Array.from(this.currentBlocks)
                .map(function (blockId) { return stackmachineJsHelper.getBlockById(blockId); })
                .forEach(function (block) { return _this.highlightBlock(block); });
            breakPoints.forEach(function (id) {
                var block = stackmachineJsHelper.getBlockById(id);
                if (block !== null) {
                    if (_this.currentBlocks.hasOwnProperty(id)) {
                        stackmachineJsHelper.getJqueryObject(block.svgPath_).addClass('selectedBreakpoint');
                    }
                    else {
                        stackmachineJsHelper.getJqueryObject(block.svgPath_).addClass('breakpoint');
                    }
                }
            });
        };
        /** Will remove highlights from all currently blocks being currently executed and all given Breakpoints
         * @param breakPoints the array of breakpoint block id's to have their highlights removed*/
        State.prototype.removeHighlights = function (breakPoints) {
            var _this = this;
            Array.from(this.currentBlocks)
                .map(function (blockId) { return stackmachineJsHelper.getBlockById(blockId); })
                .forEach(function (block) {
                var object = stackmachineJsHelper.getJqueryObject(block);
                if (object.hasClass('selectedBreakpoint')) {
                    object.removeClass('selectedBreakpoint').addClass('breakpoint');
                }
                _this.removeBlockHighlight(block);
            });
            breakPoints
                .map(function (blockId) { return stackmachineJsHelper.getBlockById(blockId); })
                .forEach(function (block) {
                if (block !== null) {
                    stackmachineJsHelper.getJqueryObject(block.svgPath_).removeClass('breakpoint').removeClass('selectedBreakpoint');
                }
            });
        };
        State.prototype.addToCurrentBlock = function (id) {
            var index = this.currentBlocks.indexOf(id, 0);
            if (index > -1) {
                return;
            }
            this.currentBlocks.push(id);
        };
        State.prototype.removeFromCurrentBlock = function (id) {
            var index = this.currentBlocks.indexOf(id, 0);
            if (index > -1) {
                this.currentBlocks.splice(index, 1);
            }
        };
        State.prototype.isInCurrentBlock = function (id) {
            return this.currentBlocks.indexOf(id, 0) > -1;
        };
        return State;
    }());
    exports.State = State;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJwcmV0ZXIuc3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9PcGVuUm9iZXJ0YVdlYi9zcmMvYXBwL25lcG9zdGFja21hY2hpbmUvaW50ZXJwcmV0ZXIuc3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBS0E7UUFpQkk7Ozs7OztXQU1HO1FBQ0gsZUFBWSxHQUFVO1lBQ2xCLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ1osSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFDdkIscUNBQXFDO1FBQ3pDLENBQUM7UUFFTSx1Q0FBdUIsR0FBOUI7WUFDSSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDZCxDQUFDO1FBRUQsb0NBQW9DO1FBQzdCLDRCQUFZLEdBQW5CO1lBQ0ksT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzFCLENBQUM7UUFFRCxvQ0FBb0M7UUFDN0IsNEJBQVksR0FBbkIsVUFBb0IsSUFBYTtZQUM3QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUMxQixDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSSx1QkFBTyxHQUFkLFVBQWUsSUFBWSxFQUFFLEtBQUs7WUFDOUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzVCLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkMsSUFBSSxZQUFZLEtBQUssU0FBUyxJQUFJLFlBQVksS0FBSyxJQUFJ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