/**
 * This is an addition to the Open Roberta Lab. It supports self programmed Neural Networks.
 * Our work is heavily based on the tensorflow playground, see https://github.com/tensorflow/playground.
 * The Open Roberta Lab is open source and uses the Apache 2.0 License, see https://www.apache.org/licenses/LICENSE-2.0
 */
define(["require", "exports", "./neuralnetwork.nn", "./neuralnetwork.state", "d3"], function (require, exports, nn, neuralnetwork_state_1, d3) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.oneStep = exports.runPlayground = void 0;
    var mainWidth;
    var RECT_SIZE = 30;
    var SPACE_BETWEEN_NODES = 90;
    var BIAS_SIZE = 5;
    var HoverType;
    (function (HoverType) {
        HoverType[HoverType["BIAS"] = 0] = "BIAS";
        HoverType[HoverType["WEIGHT"] = 1] = "WEIGHT";
    })(HoverType || (HoverType = {}));
    var NodeType;
    (function (NodeType) {
        NodeType[NodeType["INPUT"] = 0] = "INPUT";
        NodeType[NodeType["HIDDEN"] = 1] = "HIDDEN";
        NodeType[NodeType["OUTPUT"] = 2] = "OUTPUT";
    })(NodeType || (NodeType = {}));
    var state = new neuralnetwork_state_1.State();
    var linkWidthScale = d3.scale.linear().domain([0, 5]).range([1, 10]).clamp(true);
    var colorScale = d3.scale.linear().domain([-1, 0, 1]).range(['#f59322', '#e8eaeb', '#0877bd']).clamp(true);
    var boundary = {};
    var network = null;
    function makeGUI() {
        d3.select('#add-layers').on('click', function () {
            if (state.numHiddenLayers >= 6) {
                return;
            }
            state.networkShape[state.numHiddenLayers] = 2;
            state.numHiddenLayers++;
            reset();
        });
        d3.select('#remove-layers').on('click', function () {
            if (state.numHiddenLayers <= 0) {
                return;
            }
            state.numHiddenLayers--;
            state.networkShape.splice(state.numHiddenLayers);
            reset();
        });
        var activationDropdown = d3.select('#activations').on('change', function () {
            state.activationKey = this.value;
            state.activation = neuralnetwork_state_1.activations[this.value];
            reset();
        });
        activationDropdown.property('value', neuralnetwork_state_1.getKeyFromValue(neuralnetwork_state_1.activations, state.activation));
        // Listen for css-responsive changes and redraw the svg network.
        window.addEventListener('resize', function () {
            var newWidth = document.querySelector('#main-part').getBoundingClientRect().width;
            if (newWidth !== mainWidth) {
                mainWidth = newWidth;
                drawNetwork(network);
                updateUI(true);
            }
        });
    }
    function updateBiasesUI(network) {
        nn.forEachNode(network, true, function (node) {
            d3.select("rect#bias-" + node.id).style('fill', colorScale(node.bias));
        });
    }
    function updateWeightsUI(network, container) {
        for (var layerIdx = 1; layerIdx < network.length; layerIdx++) {
            var currentLayer = network[layerIdx];
            // Update all the nodes in this layer.
            for (var i = 0; i < currentLayer.length; i++) {
                var node = currentLayer[i];
                for (var j = 0; j < node.inputLinks.length; j++) {
                    var link = node.inputLinks[j];
                    container
                        .select("#link" + link.source.id + "-" + link.dest.id)
                        .style({
                        'stroke-dashoffset': 0,
                        'stroke-width': linkWidthScale(Math.abs(link.weight)),
                        stroke: colorScale(link.weight),
                    })
                        .datum(link);
                }
            }
        }
    }
    function drawNode(cx, cy, nodeId, nodeType, container, node) {
        var x = cx - RECT_SIZE / 2;
        var y = cy - RECT_SIZE / 2;
        var nodeClass = nodeType === NodeType.INPUT ? 'node_input' : nodeType === NodeType.HIDDEN ? 'node_hidden' : 'node_output';
        var nodeGroup = container.append('g').attr({
            class: nodeClass,
            id: "node" + nodeId,
            transform: "translate(" + x + "," + y + ")",
        });
        // Draw the main rectangle.
        nodeGroup.append('rect').attr({
            x: 0,
            y: 0,
            width: RECT_SIZE,
            height: RECT_SIZE,
        });
        var activeOrNotClass = state[nodeId] ? 'active' : 'inactive';
        if (nodeType === NodeType.INPUT) {
            var label = state.inputs[nodeId];
            // Draw the input label.
            var text = nodeGroup.append('text').attr({
                class: 'main-label',
                x: -10,
                y: RECT_SIZE / 2,
                'text-anchor': 'end',
            });
            if (/[_^]/.test(label)) {
                var myRe = /(.*?)([_^])(.)/g;
                var myArray = void 0;
                var lastIndex = void 0;
                while ((myArray = myRe.exec(label)) != null) {
                    lastIndex = myRe.lastIndex;
                    var prefix = myArray[1];
                    var sep = myArray[2];
                    var suffix = myArray[3];
                    if (prefix) {
                        text.append('tspan').text(prefix);
                    }
                    text.append('tspan')
                        .attr('baseline-shift', sep === '_' ? 'sub' : 'super')
                        .style('font-size', '9px')
                        .text(suffix);
                }
                if (label.substring(lastIndex)) {
                    text.append('tspan').text(label.substring(lastIndex));
                }
            }
            else {
                text.append('tspan').text(label);
            }
            nodeGroup.classed(activeOrNotClass, true);
        }
        if (nodeType !== NodeType.INPUT) {
            // Draw the node's bias.
            nodeGroup
                .append('rect')
                .attr({
                id: "bias-" + nodeId,
                x: -BIAS_SIZE - 2,
                y: RECT_SIZE - BIAS_SIZE + 3,
                width: BIAS_SIZE,
                height: BIAS_SIZE,
            })
                .on('mouseenter', function () {
                updateHoverCard(HoverType.BIAS, node, d3.mouse(container.node()));
            })
                .on('mouseleave', function () {
                updateHoverCard(null);
            });
        }
        // Draw the node's canvas.
        var div = d3
            .select('#network')
            .insert('div', ':first-child')
            .attr({
            id: "canvas-" + nodeId,
            class: 'canvas',
        })
            .style({
            position: 'absolute',
            left: x + 3 + "px",
            top: y + 3 + "px",
        });
        if (nodeType === NodeType.INPUT) {
            div.classed(activeOrNotClass, true);
        }
    }
    // Draw network
    function drawNetwork(network) {
        var svg = d3.select('#svg');
        // Remove all svg elements.
        svg.select('g.core').remove();
        // Remove all div elements.
        d3.select('#network').selectAll('div.canvas').remove();
        d3.select('#network').selectAll('div.plus-minus-neurons').remove();
        // Get the width of the svg container.
        var padding = 3;
        var co = d3.select('.column.right').node();
        var cf = d3.select('.column.features').node();
        var width = co.offsetLeft - cf.offsetLeft;
        svg.attr('width', width);
        // Map of all node coordinates.
        var node2coord = {};
        var container = svg.append('g').classed('core', true).attr('transform', "translate(" + padding + "," + padding + ")");
        // Draw the network layer by layer.
        var numLayers = network.length;
        var featureWidth = 118;
        var layerScale = d3.scale
            .ordinal()
            .domain(d3.range(1, numLayers - 1))
            .rangePoints([featureWidth, width - featureWidth - RECT_SIZE], 0.7);
        var nodeIndexScale = function (nodeIndex) { return nodeIndex * (RECT_SIZE + SPACE_BETWEEN_NODES); };
        var calloutThumb = d3.select('.callout.thumbnail').style('display', 'none');
        var calloutWeights = d3.select('.callout.weights').style('display', 'none');
        var idWithCallout = null;
        var targetIdWithCallout = null;
        // Draw the input layer separately.
        var cx = RECT_SIZE / 2 + 50;
        var nodeIds = Object.keys(state.inputs);
        var maxY = nodeIndexScale(nodeIds.length);
        nodeIds.forEach(function (nodeId, i) {
            var cy = nodeIndexScale(i) + RECT_SIZE / 2;
            node2coord[nodeId] = { cx: cx, cy: cy };
            drawNode(cx, cy, nodeId, NodeType.INPUT, container);
        });
        // Draw the intermediate layers, exclude input (id:0) and output (id:numLayers-1)
        for (var layerIdx = 1; layerIdx < numLayers - 1; layerIdx++) {
            var numNodes = network[layerIdx].length;
            var cx_1 = layerScale(layerIdx) + RECT_SIZE / 2;
            maxY = Math.max(maxY, nodeIndexScale(numNodes));
            addPlusMinusControl(layerScale(layerIdx), layerIdx);
            for (var i = 0; i < numNodes; i++) {
                var node = network[layerIdx][i];
                var cy = nodeIndexScale(i) + RECT_SIZE / 2;
                node2coord[node.id] = { cx: cx_1, cy: cy };
                drawNode(cx_1, cy, node.id, NodeType.HIDDEN, container, node);
                // Show callout to thumbnails.
                var numNodes_1 = network[layerIdx].length;
                var nextNumNodes = network[layerIdx + 1].length;
                if (idWithCallout == null && i === numNodes_1 - 1 && nextNumNodes <= numNodes_1) {
                    calloutThumb.style({
                        display: null,
                        top: 20 + 3 + cy + "px",
                        left: cx_1 + "px",
                    });
                    idWithCallout = node.id;
                }
                // Draw links.
                for (var j = 0; j < node.inputLinks.length; j++) {
                    var link = node.inputLinks[j];
                    var path = drawLink(link, node2coord, network, container, j === 0, j, node.inputLinks.length).node();
                    // Show callout to weights.
                    var prevLayer = network[layerIdx - 1];
                    var lastNodePrevLayer = prevLayer[prevLayer.length - 1];
                    if (targetIdWithCallout == null &&
                        i === numNodes_1 - 1 &&
                        link.source.id === lastNodePrevLayer.id &&
                        (link.source.id !== idWithCallout || numLayers <= 5) &&
                        link.dest.id !== idWithCallout &&
                        prevLayer.length >= numNodes_1) {
                        var midPoint = path.getPointAtLength(path.getTotalLength() * 0.7);
                        calloutWeights.style({
                            display: null,
                            top: midPoint.y + 5 + "px",
                            left: midPoint.x + 3 + "px",
                        });
                        targetIdWithCallout = link.dest.id;
                    }
                }
            }
        }
        // Draw the output nodes separately.
        {
            var outputLayer = network[numLayers - 1];
            var numOutputs = outputLayer.length;
            var cx_2 = width - 3 * RECT_SIZE;
            maxY = Math.max(maxY, nodeIndexScale(numOutputs));
            for (var j = 0; j < numOutputs; j++) {
                var node = outputLayer[j];
                var cy = nodeIndexScale(j) + RECT_SIZE / 2;
                node2coord[node.id] = { cx: cx_2, cy: cy };
                drawNode(cx_2, cy, node.id, NodeType.OUTPUT, container, node);
                // Draw links.
                for (var i = 0; i < node.inputLinks.length; i++) {
                    var link = node.inputLinks[i];
                    drawLink(link, node2coord, network, container, i === 0, i, node.inputLinks.length);
                }
            }
        }
        // Adjust the height of the svg.
        svg.attr('height', Math.max(maxY, nodeIndexScale(6)));
        // Adjust the height of the features column.
        var height = Math.max(getRelativeHeight(calloutWeights), getRelativeHeight(d3.select('#network')));
        d3.select('.column.features').style('height', height + 'px');
    }
    function getRelativeHeight(selection) {
        var node = selection.node();
        return node.offsetHeight + node.offsetTop;
    }
    function addPlusMinusControl(x, layerIdx) {
        var div = d3
            .select('#network')
            .append('div')
            .classed('plus-minus-neurons', true)
            .style('left', x - 10 + "px");
        var i = layerIdx - 1;
        var firstRow = div.append('div').attr('class', "ui-numNodes" + layerIdx);
        firstRow
            .append('button')
            .attr('class', 'mdl-button mdl-js-button mdl-button--icon')
            .on('click', function () {
            var numNeurons = state.networkShape[i];
            if (numNeurons >= 6) {
                return;
            }
            state.networkShape[i]++;
            reset();
        })
            .append('i')
            .attr('class', 'material-icons')
            .text('add');
        firstRow
            .append('button')
            .attr('class', 'mdl-button mdl-js-button mdl-button--icon')
            .on('click', function () {
            var numNeurons = state.networkShape[i];
            if (numNeurons <= 1) {
                return;
            }
            state.networkShape[i]--;
            reset();
        })
            .append('i')
            .attr('class', 'material-icons')
            .text('remove');
        var suffix = state.networkShape[i] > 1 ? 's' : '';
        div.append('div').text(state.networkShape[i] + ' neuron' + suffix);
    }
    function updateHoverCard(type, nodeOrLink, coordinates) {
        var hovercard = d3.select('#hovercard');
        if (type == null) {
            hovercard.style('display', 'none');
            d3.select('#svg').on('click', null);
            return;
        }
        d3.select('#svg').on('click', function () {
            hovercard.select('.value').style('display', 'none');
            var input = hovercard.select('input');
            input.style('display', null);
            input.on('input', function () {
                if (this.value != null && this.value !== '') {
                    if (type === HoverType.WEIGHT) {
                        nodeOrLink.weight = +this.value;
                    }
                    else {
                        nodeOrLink.bias = +this.value;
                    }
                    updateUI();
                }
            });
            input.on('keypress', function () {
                if (d3.event.keyCode === 13) {
                    updateHoverCard(type, nodeOrLink, coordinates);
                }
            });
            input.node().focus();
        });
        var value = type === HoverType.WEIGHT ? nodeOrLink.weight : nodeOrLink.bias;
        var name = type === HoverType.WEIGHT ? 'Weight' : 'Bias';
        hovercard.style({
            left: coordinates[0] + 20 + "px",
            top: coordinates[1] + "px",
            display: 'block',
        });
        hovercard.select('.type').text(name);
        hovercard.select('.value').style('display', null).text(value.toPrecision(2));
        hovercard.select('input').property('value', value.toPrecision(2)).style('display', 'none');
    }
    function drawLink(input, node2coord, network, container, isFirst, index, length) {
        var line = container.insert('path', ':first-child');
        var source = node2coord[input.source.id];
        var dest = node2coord[input.dest.id];
        var datum = {
            source: {
                y: source.cx + RECT_SIZE / 2 + 2,
                x: source.cy,
            },
            target: {
                y: dest.cx - RECT_SIZE / 2,
                x: dest.cy + ((index - (length - 1) / 2) / length) * 12,
            },
        };
        var diagonal = d3.svg.diagonal().projection(function (d) { return [d.y, d.x]; });
        line.attr({
            'marker-start': 'url(#markerArrow)',
            class: 'link',
            id: 'link' + input.source.id + '-' + input.dest.id,
            d: diagonal(datum, 0),
        });
        // Add an invisible thick link that will be used for
        // showing the weight value on hover.
        container
            .append('path')
            .attr('d', diagonal(datum, 0))
            .attr('class', 'link-hover')
            .on('mouseenter', function () {
            updateHoverCard(HoverType.WEIGHT, input, d3.mouse(this));
        })
            .on('mouseleave', function () {
            updateHoverCard(null);
        });
        return line;
    }
    function updateUI(firstStep) {
        if (firstStep === void 0) { firstStep = false; }
        // Update the links visually.
        updateWeightsUI(network, d3.select('g.core'));
        // Update the bias values visually.
        updateBiasesUI(network);
        function zeroPad(n) {
            var pad = '000000';
            return (pad + n).slice(-pad.length);
        }
        function addCommas(s) {
            return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        function humanReadable(n) {
            return n.toFixed(3);
        }
    }
    function constructInputIds() {
        var result = [];
        for (var inputName in state.inputs) {
            result.push(inputName);
        }
        return result;
    }
    function reset() {
        var suffix = state.numHiddenLayers !== 1 ? 's' : '';
        d3.select('#layers-label').text('Hidden layer' + suffix);
        d3.select('#num-layers').text(state.numHiddenLayers);
        // Make a simple network.
        var shape = [state.numInputs].concat(state.networkShape).concat([state.numOutputs]);
        var outputActivation = nn.Activations.LINEAR; // was: TANH;
        var oldWeights = extractWeights(network);
        network = nn.buildNetwork(shape, state.activation, outputActivation, state.regularization, constructInputIds(), state.initZero);
        replaceWeights(network, oldWeights);
        drawNetwork(network);
        updateUI(true);
    }
    function extractWeights(network) {
        var weightsAllLayers = [];
        if (network != null && network.length > 0) {
            for (var _i = 0, network_1 = network; _i < network_1.length; _i++) {
                var layer = network_1[_i];
                var weightsOneLayer = [];
                for (var _a = 0, layer_1 = layer; _a < layer_1.length; _a++) {
                    var node = layer_1[_a];
                    var weightsOneNode = [];
                    for (var _b = 0, _c = node.outputs; _b < _c.length; _b++) {
                        var link = _c[_b];
                        weightsOneNode.push(link.weight);
                    }
                    weightsOneLayer.push(weightsOneNode);
                }
                weightsAllLayers.push(weightsOneLayer);
            }
        }
        return weightsAllLayers;
    }
    function replaceWeights(network, weightsAllLayers) {
        if (network != null && network.length > 0 && weightsAllLayers != null) {
            for (var i = 0; i < weightsAllLayers.length && i < network.length; i += 1) {
                var layer = network[i];
                var layerWeight = weightsAllLayers[i];
                if (layer == null || layerWeight == null) {
                    break;
                }
                for (var j = 0; j < layerWeight.length && j < layer.length; j += 1) {
                    var node = layer[j];
                    var nodeWeight = layerWeight[j];
                    if (node == null || nodeWeight == null) {
                        break;
                    }
                    for (var k = 0; k < nodeWeight.length && k < node.outputs.length; k += 1) {
                        var link = node.outputs[k];
                        var linkWeight = nodeWeight[k];
                        if (link == null || linkWeight == null) {
                            break;
                        }
                        link.weight = linkWeight;
                    }
                }
            }
        }
    }
    function runPlayground() {
        makeGUI();
        reset();
    }
    exports.runPlayground = runPlayground;
    function oneStep(inputData) {
        nn.forwardProp(network, inputData);
        var outputData = [];
        var outputs = network[network.length - 1];
        for (var j = 0; j < outputs.length; j++) {
            var node = outputs[j];
            outputData.push(node.output);
        }
        return outputData;
    }
    exports.oneStep = oneStep;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV1cmFsbmV0d29yay5wbGF5Z3JvdW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2FwcC9uZXVyYWxuZXR3b3JrL25ldXJhbG5ldHdvcmsucGxheWdyb3VuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHOzs7O0lBTUgsSUFBSSxTQUFTLENBQUM7SUFFZCxJQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDckIsSUFBTSxtQkFBbUIsR0FBRyxFQUFFLENBQUM7SUFDL0IsSUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBRXBCLElBQUssU0FHSjtJQUhELFdBQUssU0FBUztRQUNWLHlDQUFJLENBQUE7UUFDSiw2Q0FBTSxDQUFBO0lBQ1YsQ0FBQyxFQUhJLFNBQVMsS0FBVCxTQUFTLFFBR2I7SUFFRCxJQUFLLFFBSUo7SUFKRCxXQUFLLFFBQVE7UUFDVCx5Q0FBSyxDQUFBO1FBQ0wsMkNBQU0sQ0FBQTtRQUNOLDJDQUFNLENBQUE7SUFDVixDQUFDLEVBSkksUUFBUSxLQUFSLFFBQVEsUUFJWjtJQUVELElBQUksS0FBSyxHQUFHLElBQUksMkJBQUssRUFBRSxDQUFDO0lBRXhCLElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pGLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENB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