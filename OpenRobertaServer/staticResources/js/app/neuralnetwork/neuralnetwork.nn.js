/**
 * This is an addition to the Open Roberta Lab. It supports self programmed Neural Networks.
 * Our work is heavily based on the tensorflow playground, see https://github.com/tensorflow/playground.
 * The Open Roberta Lab is open source and uses the Apache 2.0 License, see https://www.apache.org/licenses/LICENSE-2.0
 */
define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getOutputNode = exports.forEachNode = exports.updateWeights = exports.backProp = exports.forwardProp = exports.buildNetwork = exports.Link = exports.RegularizationFunction = exports.Activations = exports.Errors = exports.Node = void 0;
    /**
     * A node in a neural network. Each node has a state
     * (total input, output, and their respectively derivatives) which changes
     * after every forward and back propagation run.
     */
    var Node = /** @class */ (function () {
        /**
         * Creates a new node with the provided id and activation function.
         */
        function Node(id, activation, initZero) {
            /** List of input links. */
            this.inputLinks = [];
            this.bias = 0.0; // was: 0.1
            /** List of output links. */
            this.outputs = [];
            /** Error derivative with respect to this node's output. */
            this.outputDer = 0;
            /** Error derivative with respect to this node's total input. */
            this.inputDer = 0;
            /**
             * Accumulated error derivative with respect to this node's total input since
             * the last update. This derivative equals dE/db where b is the node's
             * bias term.
             */
            this.accInputDer = 0;
            /**
             * Number of accumulated err. derivatives with respect to the total input
             * since the last update.
             */
            this.numAccumulatedDers = 0;
            this.id = id;
            this.activation = activation;
            if (initZero) {
                this.bias = 0;
            }
        }
        /** Recomputes the node's output and returns it. */
        Node.prototype.updateOutput = function () {
            // Stores total input into the node.
            this.totalInput = this.bias;
            for (var j = 0; j < this.inputLinks.length; j++) {
                var link = this.inputLinks[j];
                this.totalInput += link.weight * link.source.output;
            }
            this.output = this.activation.output(this.totalInput);
            return this.output;
        };
        return Node;
    }());
    exports.Node = Node;
    /** Built-in error functions */
    var Errors = /** @class */ (function () {
        function Errors() {
        }
        Errors.SQUARE = {
            error: function (output, target) { return 0.5 * Math.pow(output - target, 2); },
            der: function (output, target) { return output - target; },
        };
        return Errors;
    }());
    exports.Errors = Errors;
    /** Polyfill for TANH */
    Math.tanh =
        Math.tanh ||
            function (x) {
                if (x === Infinity) {
                    return 1;
                }
                else if (x === -Infinity) {
                    return -1;
                }
                else {
                    var e2x = Math.exp(2 * x);
                    return (e2x - 1) / (e2x + 1);
                }
            };
    /** Built-in activation functions */
    var Activations = /** @class */ (function () {
        function Activations() {
        }
        Activations.TANH = {
            output: function (x) { return Math.tanh(x); },
            der: function (x) {
                var output = Activations.TANH.output(x);
                return 1 - output * output;
            },
        };
        Activations.RELU = {
            output: function (x) { return Math.max(0, x); },
            der: function (x) { return (x <= 0 ? 0 : 1); },
        };
        Activations.SIGMOID = {
            output: function (x) { return 1 / (1 + Math.exp(-x)); },
            der: function (x) {
                var output = Activations.SIGMOID.output(x);
                return output * (1 - output);
            },
        };
        Activations.LINEAR = {
            output: function (x) { return x; },
            der: function (x) { return 1; },
        };
        return Activations;
    }());
    exports.Activations = Activations;
    /** Build-in regularization functions */
    var RegularizationFunction = /** @class */ (function () {
        function RegularizationFunction() {
        }
        RegularizationFunction.L1 = {
            output: function (w) { return Math.abs(w); },
            der: function (w) { return (w < 0 ? -1 : w > 0 ? 1 : 0); },
        };
        RegularizationFunction.L2 = {
            output: function (w) { return 0.5 * w * w; },
            der: function (w) { return w; },
        };
        return RegularizationFunction;
    }());
    exports.RegularizationFunction = RegularizationFunction;
    /**
     * A link in a neural network. Each link has a weight and a source and
     * destination node. Also it has an internal state (error derivative
     * with respect to a particular input) which gets updated after
     * a run of back propagation.
     */
    var Link = /** @class */ (function () {
        /**
         * Constructs a link in the neural network initialized with random weight.
         *
         * @param source The source node.
         * @param dest The destination node.
         * @param regularization The regularization function that computes the
         *     penalty for this weight. If null, there will be no regularization.
         */
        function Link(source, dest, regularization, initZero) {
            this.weight = 0.0; // was: Math.random() - 0.5;
            this.isDead = false;
            /** Error derivative with respect to this weight. */
            this.errorDer = 0;
            /** Accumulated error derivative since the last update. */
            this.accErrorDer = 0;
            /** Number of accumulated derivatives since the last update. */
            this.numAccumulatedDers = 0;
            this.id = source.id + '-' + dest.id;
            this.source = source;
            this.dest = dest;
            this.regularization = regularization;
            if (initZero) {
                this.weight = 0;
            }
        }
        return Link;
    }());
    exports.Link = Link;
    /**
     * Builds a neural network.
     *
     * @param networkShape The shape of the network. E.g. [1, 2, 3, 1] means
     *   the network will have one input node, 2 nodes in first hidden layer,
     *   3 nodes in second hidden layer and 1 output node.
     * @param activation The activation function of every hidden node.
     * @param outputActivation The activation function for the output nodes.
     * @param regularization The regularization function that computes a penalty
     *     for a given weight (parameter) in the network. If null, there will be
     *     no regularization.
     * @param inputIds List of ids for the input nodes.
     */
    function buildNetwork(networkShape, activation, outputActivation, regularization, inputIds, initZero) {
        var numLayers = networkShape.length;
        var id = 1;
        /** List of layers, with each layer being a list of nodes. */
        var network = [];
        for (var layerIdx = 0; layerIdx < numLayers; layerIdx++) {
            var isOutputLayer = layerIdx === numLayers - 1;
            var isInputLayer = layerIdx === 0;
            var currentLayer = [];
            network.push(currentLayer);
            var numNodes = networkShape[layerIdx];
            for (var i = 0; i < numNodes; i++) {
                var nodeId = id.toString();
                if (isInputLayer) {
                    nodeId = inputIds[i];
                }
                else {
                    id++;
                }
                var node = new Node(nodeId, isOutputLayer ? outputActivation : activation, initZero);
                currentLayer.push(node);
                if (layerIdx >= 1) {
                    // Add links from nodes in the previous layer to this node.
                    for (var j = 0; j < network[layerIdx - 1].length; j++) {
                        var prevNode = network[layerIdx - 1][j];
                        var link = new Link(prevNode, node, regularization, initZero);
                        prevNode.outputs.push(link);
                        node.inputLinks.push(link);
                    }
                }
            }
        }
        return network;
    }
    exports.buildNetwork = buildNetwork;
    /**
     * Runs a forward propagation of the provided input through the provided
     * network. This method modifies the internal state of the network - the
     * total input and output of each node in the network.
     *
     * @param network The neural network.
     * @param inputs The input array. Its length should match the number of input
     *     nodes in the network.
     * @return The final output of the network.
     */
    function forwardProp(network, inputs) {
        var inputLayer = network[0];
        if (inputs.length !== inputLayer.length) {
            throw new Error('The number of inputs must match the number of nodes in' + ' the input layer');
        }
        // Update the input layer.
        for (var i = 0; i < inputLayer.length; i++) {
            var node = inputLayer[i];
            node.output = inputs[i];
        }
        for (var layerIdx = 1; layerIdx < network.length; layerIdx++) {
            var currentLayer = network[layerIdx];
            // Update all the nodes in this layer.
            for (var i = 0; i < currentLayer.length; i++) {
                var node = currentLayer[i];
                node.updateOutput();
            }
        }
        return network[network.length - 1][0].output;
    }
    exports.forwardProp = forwardProp;
    /**
     * Runs a backward propagation using the provided target and the
     * computed output of the previous call to forward propagation.
     * This method modifies the internal state of the network - the error
     * derivatives with respect to each node, and each weight
     * in the network.
     */
    function backProp(network, target, errorFunc) {
        // The output node is a special case. We use the user-defined error
        // function for the derivative.
        var outputNode = network[network.length - 1][0];
        outputNode.outputDer = errorFunc.der(outputNode.output, target);
        // Go through the layers backwards.
        for (var layerIdx = network.length - 1; layerIdx >= 1; layerIdx--) {
            var currentLayer = network[layerIdx];
            // Compute the error derivative of each node with respect to:
            // 1) its total input
            // 2) each of its input weights.
            for (var i = 0; i < currentLayer.length; i++) {
                var node = currentLayer[i];
                node.inputDer = node.outputDer * node.activation.der(node.totalInput);
                node.accInputDer += node.inputDer;
                node.numAccumulatedDers++;
            }
            // Error derivative with respect to each weight coming into the node.
            for (var i = 0; i < currentLayer.length; i++) {
                var node = currentLayer[i];
                for (var j = 0; j < node.inputLinks.length; j++) {
                    var link = node.inputLinks[j];
                    if (link.isDead) {
                        continue;
                    }
                    link.errorDer = node.inputDer * link.source.output;
                    link.accErrorDer += link.errorDer;
                    link.numAccumulatedDers++;
                }
            }
            if (layerIdx === 1) {
                continue;
            }
            var prevLayer = network[layerIdx - 1];
            for (var i = 0; i < prevLayer.length; i++) {
                var node = prevLayer[i];
                // Compute the error derivative with respect to each node's output.
                node.outputDer = 0;
                for (var j = 0; j < node.outputs.length; j++) {
                    var output = node.outputs[j];
                    node.outputDer += output.weight * output.dest.inputDer;
                }
            }
        }
    }
    exports.backProp = backProp;
    /**
     * Updates the weights of the network using the previously accumulated error
     * derivatives.
     */
    function updateWeights(network, learningRate, regularizationRate) {
        for (var layerIdx = 1; layerIdx < network.length; layerIdx++) {
            var currentLayer = network[layerIdx];
            for (var i = 0; i < currentLayer.length; i++) {
                var node = currentLayer[i];
                // Update the node's bias.
                if (node.numAccumulatedDers > 0) {
                    node.bias -= (learningRate * node.accInputDer) / node.numAccumulatedDers;
                    node.accInputDer = 0;
                    node.numAccumulatedDers = 0;
                }
                // Update the weights coming into this node.
                for (var j = 0; j < node.inputLinks.length; j++) {
                    var link = node.inputLinks[j];
                    if (link.isDead) {
                        continue;
                    }
                    var regulDer = link.regularization ? link.regularization.der(link.weight) : 0;
                    if (link.numAccumulatedDers > 0) {
                        // Update the weight based on dE/dw.
                        link.weight = link.weight - (learningRate / link.numAccumulatedDers) * link.accErrorDer;
                        // Further update the weight based on regularization.
                        var newLinkWeight = link.weight - learningRate * regularizationRate * regulDer;
                        if (link.regularization === RegularizationFunction.L1 && link.weight * newLinkWeight < 0) {
                            // The weight crossed 0 due to the regularization term. Set it to 0.
                            link.weight = 0;
                            link.isDead = true;
                        }
                        else {
                            link.weight = newLinkWeight;
                        }
                        link.accErrorDer = 0;
                        link.numAccumulatedDers = 0;
                    }
                }
            }
        }
    }
    exports.updateWeights = updateWeights;
    /** Iterates over every node in the network/ */
    function forEachNode(network, ignoreInputs, accessor) {
        for (var layerIdx = ignoreInputs ? 1 : 0; layerIdx < network.length; layerIdx++) {
            var currentLayer = network[layerIdx];
            for (var i = 0; i < currentLayer.length; i++) {
                var node = currentLayer[i];
                accessor(node);
            }
        }
    }
    exports.forEachNode = forEachNode;
    /** Returns the output nodes in the network. */
    function getOutputNode(network) {
        return network[network.length - 1];
    }
    exports.getOutputNode = getOutputNode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV1cmFsbmV0d29yay5ubi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvbmV1cmFsbmV0d29yay9uZXVyYWxuZXR3b3JrLm5uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7Ozs7SUFFSDs7OztPQUlHO0lBQ0g7UUEyQkk7O1dBRUc7UUFDSCxjQUFZLEVBQVUsRUFBRSxVQUE4QixFQUFFLFFBQWtCO1lBNUIxRSwyQkFBMkI7WUFDM0IsZUFBVSxHQUFXLEVBQUUsQ0FBQztZQUN4QixTQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsV0FBVztZQUN2Qiw0QkFBNEI7WUFDNUIsWUFBTyxHQUFXLEVBQUUsQ0FBQztZQUdyQiwyREFBMkQ7WUFDM0QsY0FBUyxHQUFHLENBQUMsQ0FBQztZQUNkLGdFQUFnRTtZQUNoRSxhQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ2I7Ozs7ZUFJRztZQUNILGdCQUFXLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCOzs7ZUFHRztZQUNILHVCQUFrQixHQUFHLENBQUMsQ0FBQztZQVFuQixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztZQUNiLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQzdCLElBQUksUUFBUSxFQUFFO2dCQUNWLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO2FBQ2pCO1FBQ0wsQ0FBQztRQUVELG1EQUFtRDtRQUNuRCwyQkFBWSxHQUFaO1lBQ0ksb0NBQW9DO1lBQ3BDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUM1QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzdDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQzthQUN2RDtZQUNELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUN2QixDQUFDO1FBQ0wsV0FBQztJQUFELENBQUMsQUFqREQsSUFpREM7SUFqRFksb0JBQUk7SUF1RWpCLCtCQUErQjtJQUMvQjtRQUFBO1FBS0EsQ0FBQztRQUppQixhQUFNLEdBQWtCO1lBQ2xDLEtBQUssRUFBRSxVQUFDLE1BQWMsRUFBRSxNQUFjLElBQUssT0FBQSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFsQyxDQUFrQztZQUM3RSxHQUFHLEVBQUUsVUFBQyxNQUFjLEVBQUUsTUFBYyxJQUFLLE9BQUEsTUFBTSxHQUFHLE1BQU0sRUFBZixDQUFlO1NBQzNELENBQUM7UUFDTixhQUFDO0tBQUEsQUFMRCxJQUtDO0lBTFksd0JBQU07SUFPbkIsd0JBQXdCO0lBQ3ZCLElBQVksQ0FBQyxJQUFJO1FBQ2IsSUFBWSxDQUFDLElBQUk7WUFDbEIsVUFBVSxDQUFDO2dCQUNQLElBQUksQ0FBQyxLQUFLLFFBQVEsRUFBRTtvQkFDaEIsT0FBTyxDQUFDLENBQUM7aUJBQ1o7cUJBQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7b0JBQ3hCLE9BQU8sQ0FBQyxDQUFDLENBQUM7aUJBQ2I7cUJBQU07b0JBQ0gsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQzFCLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQ2hDO1lBQ0wsQ0FBQyxDQUFDO0lBRU4sb0NBQW9DO0lBQ3BDO1FBQUE7UUF1QkEsQ0FBQztRQXRCaUIsZ0JBQUksR0FBdUI7WUFDckMsTUFBTSxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUMsSUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBckIsQ0FBcUI7WUFDcEMsR0FBRyxFQUFFLFVBQUMsQ0FBQztnQkFDSCxJQUFJLE1BQU0sR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEMsT0FBTyxDQUFDLEdBQUcsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUMvQixDQUFDO1NBQ0osQ0FBQztRQUNZLGdCQUFJLEdBQXVCO1lBQ3JDLE1BQU0sRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFkLENBQWM7WUFDN0IsR0FBRyxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFoQixDQUFnQjtTQUMvQixDQUFDO1FBQ1ksbUJBQU8sR0FBdUI7WUFDeEMsTUFBTSxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUF0QixDQUFzQjtZQUNyQyxHQUFHLEVBQUUsVUFBQyxDQUFDO2dCQUNILElBQUksTUFBTSxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzQyxPQUFPLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztZQUNqQyxDQUFDO1NBQ0osQ0FBQztRQUNZLGtCQUFNLEdBQXVCO1lBQ3ZDLE1BQU0sRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsRUFBRCxDQUFDO1lBQ2hCLEdBQUcsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsRUFBRCxDQUFDO1NBQ2hCLENBQUM7UUFDTixrQkFBQztLQUFBLEFBdkJELElBdUJDO0lBdkJZLGtDQUFXO0lBeUJ4Qix3Q0FBd0M7SUFDeEM7UUFBQTtRQVNBLENBQUM7UUFSaUIseUJBQUUsR0FBMkI7WUFDdkMsTUFBTSxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBWCxDQUFXO1lBQzFCLEdBQUcsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQTVCLENBQTRCO1NBQzNDLENBQUM7UUFDWSx5QkFBRSxHQUEyQjtZQUN2QyxNQUFNLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBWCxDQUFXO1lBQzFCLEdBQUcsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsRUFBRCxDQUFDO1NBQ2hCLENBQUM7UUFDTiw2QkFBQztLQUFBLEFBVEQsSUFTQztJQVRZLHdEQUFzQjtJQVduQzs7Ozs7T0FLRztJQUNIO1FBY0k7Ozs7Ozs7V0FPRztRQUNILGNBQVksTUFBWSxFQUFFLElBQVUsRUFBRSxjQUFzQyxFQUFFLFFBQWtCO1lBbEJoRyxXQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsNEJBQTRCO1lBQzFDLFdBQU0sR0FBRyxLQUFLLENBQUM7WUFDZixvREFBb0Q7WUFDcEQsYUFBUSxHQUFHLENBQUMsQ0FBQztZQUNiLDBEQUEwRDtZQUMxRCxnQkFBVyxHQUFHLENBQUMsQ0FBQztZQUNoQiwrREFBK0Q7WUFDL0QsdUJBQWtCLEdBQUcsQ0FBQyxDQUFDO1lBWW5CLElBQUksQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNwQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNyQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNqQixJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztZQUNyQyxJQUFJLFFBQVEsRUFBRTtnQkFDVixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQzthQUNuQjtRQUNMLENBQUM7UUFDTCxXQUFDO0lBQUQsQ0FBQyxBQS9CRCxJQStCQztJQS9CWSxvQkFBSTtJQWlDakI7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0gsU0FBZ0IsWUFBWSxDQUN4QixZQUFzQixFQUN0QixVQUE4QixFQUM5QixnQkFBb0MsRUFDcEMsY0FBc0MsRUFDdEMsUUFBa0IsRUFDbEIsUUFBa0I7UUFFbEIsSUFBSSxTQUFTLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQztRQUNwQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDWCw2REFBNkQ7UUFDN0QsSUFBSSxPQUFPLEdBQWEsRUFBRSxDQUFDO1FBQzNCLEtBQUssSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFLFFBQVEsR0FBRyxTQUFTLEVBQUUsUUFBUSxFQUFFLEVBQUU7WUFDckQsSUFBSSxhQUFhLEdBQUcsUUFBUSxLQUFLLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFDL0MsSUFBSSxZQUFZLEdBQUcsUUFBUSxLQUFLLENBQUMsQ0FBQztZQUNsQyxJQUFJLFlBQVksR0FBVyxFQUFFLENBQUM7WUFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMzQixJQUFJLFFBQVEsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDL0IsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUMzQixJQUFJLFlBQVksRUFBRTtvQkFDZCxNQUFNLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN4QjtxQkFBTTtvQkFDSCxFQUFFLEVBQUUsQ0FBQztpQkFDUjtnQkFDRCxJQUFJLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNyRixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN4QixJQUFJLFFBQVEsSUFBSSxDQUFDLEVBQUU7b0JBQ2YsMkRBQTJEO29CQUMzRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0JBQ25ELElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3hDLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDO3dCQUM5RCxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQzlCO2lCQUNKO2FBQ0o7U0FDSjtRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7SUF2Q0Qsb0NBdUNDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0gsU0FBZ0IsV0FBVyxDQUFDLE9BQWlCLEVBQUUsTUFBZ0I7UUFDM0QsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxVQUFVLENBQUMsTUFBTSxFQUFFO1lBQ3JDLE1BQU0sSUFBSSxLQUFLLENBQUMsd0RBQXdELEdBQUcsa0JBQWtCLENBQUMsQ0FBQztTQUNsRztRQUNELDBCQUEwQjtRQUMxQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN4QyxJQUFJLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDM0I7UUFDRCxLQUFLLElBQUksUUFBUSxHQUFHLENBQUMsRUFBRSxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsRUFBRTtZQUMxRCxJQUFJLFlBQVksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDckMsc0NBQXNDO1lBQ3RDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMxQyxJQUFJLElBQUksR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzthQUN2QjtTQUNKO1FBQ0QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDakQsQ0FBQztJQW5CRCxrQ0FtQkM7SUFFRDs7Ozs7O09BTUc7SUFDSCxTQUFnQixRQUFRLENBQUMsT0FBaUIsRUFBRSxNQUFjLEVBQUUsU0FBd0I7UUFDaEYsbUVBQW1FO1FBQ25FLCtCQUErQjtRQUMvQixJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoRCxVQUFVLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVoRSxtQ0FBbUM7UUFDbkMsS0FBSyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxRQUFRLElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFO1lBQy9ELElBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNyQyw2REFBNkQ7WUFDN0QscUJBQXFCO1lBQ3JCLGdDQUFnQztZQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDMUMsSUFBSSxJQUFJLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN0RSxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2FBQzdCO1lBRUQscUVBQXFFO1lBQ3JFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMxQyxJQUFJLElBQUksR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDN0MsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDOUIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO3dCQUNiLFNBQVM7cUJBQ1o7b0JBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO29CQUNuRCxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUM7b0JBQ2xDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2lCQUM3QjthQUNKO1lBQ0QsSUFBSSxRQUFRLEtBQUssQ0FBQyxFQUFFO2dCQUNoQixTQUFTO2FBQ1o7WUFDRCxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN2QyxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLG1FQUFtRTtnQkFDbkUsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7Z0JBQ25CLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDMUMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDN0IsSUFBSSxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO2lCQUMxRDthQUNKO1NBQ0o7SUFDTCxDQUFDO0lBOUNELDRCQThDQztJQUVEOzs7T0FHRztJQUNILFNBQWdCLGFBQWEsQ0FBQyxPQUFpQixFQUFFLFlBQW9CLEVBQUUsa0JBQTBCO1FBQzdGLEtBQUssSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxFQUFFO1lBQzFELElBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNyQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDMUMsSUFBSSxJQUFJLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzQiwwQkFBMEI7Z0JBQzFCLElBQUksSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsRUFBRTtvQkFDN0IsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDO29CQUN6RSxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztvQkFDckIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQztpQkFDL0I7Z0JBQ0QsNENBQTRDO2dCQUM1QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzdDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzlCLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTt3QkFDYixTQUFTO3FCQUNaO29CQUNELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM5RSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLEVBQUU7d0JBQzdCLG9DQUFvQzt3QkFDcEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7d0JBQ3hGLHFEQUFxRDt3QkFDckQsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxZQUFZLEdBQUcsa0JBQWtCLEdBQUcsUUFBUSxDQUFDO3dCQUMvRSxJQUFJLElBQUksQ0FBQyxjQUFjLEtBQUssc0JBQXNCLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsYUFBYSxHQUFHLENBQUMsRUFBRTs0QkFDdEYsb0VBQW9FOzRCQUNwRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQzs0QkFDaEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7eUJBQ3RCOzZCQUFNOzRCQUNILElBQUksQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFDO3lCQUMvQjt3QkFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQzt3QkFDckIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQztxQkFDL0I7aUJBQ0o7YUFDSjtTQUNKO0lBQ0wsQ0FBQztJQXBDRCxzQ0FvQ0M7SUFFRCwrQ0FBK0M7SUFDL0MsU0FBZ0IsV0FBVyxDQUFDLE9BQWlCLEVBQUUsWUFBcUIsRUFBRSxRQUE2QjtRQUMvRixLQUFLLElBQUksUUFBUSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLEVBQUU7WUFDN0UsSUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3JDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMxQyxJQUFJLElBQUksR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNsQjtTQUNKO0lBQ0wsQ0FBQztJQVJELGtDQVFDO0lBRUQsK0NBQStDO0lBQy9DLFNBQWdCLGFBQWEsQ0FBQyxPQUFpQjtRQUMzQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFGRCxzQ0FFQyJ9