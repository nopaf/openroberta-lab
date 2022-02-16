/**
 * This is an addition to the Open Roberta Lab. It supports self programmed Neural Networks.
 * Our work is heavily based on the tensorflow playground, see https://github.com/tensorflow/playground.
 * The Open Roberta Lab is open source and uses the Apache 2.0 License, see https://www.apache.org/licenses/LICENSE-2.0
 */
define(["require", "exports", "./neuralnetwork.nn"], function (require, exports, nn) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.State = exports.Type = exports.getKeyFromValue = exports.regularizations = exports.activations = void 0;
    /** A map between names and activation functions. */
    exports.activations = {
        relu: nn.Activations.RELU,
        tanh: nn.Activations.TANH,
        sigmoid: nn.Activations.SIGMOID,
        linear: nn.Activations.LINEAR,
    };
    /** A map between names and regularization functions. */
    exports.regularizations = {
        none: null,
        L1: nn.RegularizationFunction.L1,
        L2: nn.RegularizationFunction.L2,
    };
    function getKeyFromValue(obj, value) {
        for (var key in obj) {
            if (obj[key] === value) {
                return key;
            }
        }
        return undefined;
    }
    exports.getKeyFromValue = getKeyFromValue;
    /**
     * The data type of a state variable. Used for determining the
     * (de)serialization method.
     */
    var Type;
    (function (Type) {
        Type[Type["STRING"] = 0] = "STRING";
        Type[Type["NUMBER"] = 1] = "NUMBER";
        Type[Type["ARRAY_NUMBER"] = 2] = "ARRAY_NUMBER";
        Type[Type["ARRAY_STRING"] = 3] = "ARRAY_STRING";
        Type[Type["BOOLEAN"] = 4] = "BOOLEAN";
        Type[Type["OBJECT"] = 5] = "OBJECT";
    })(Type = exports.Type || (exports.Type = {}));
    // Add the GUI state.
    var State = /** @class */ (function () {
        function State() {
            this.learningRate = 0.03;
            this.regularizationRate = 0;
            this.noise = 0;
            this.batchSize = 10;
            this.discretize = false;
            this.percTrainData = 50;
            this.activationKey = 'linear';
            this.activation = nn.Activations[this.activationKey];
            this.regularization = null;
            this.initZero = false;
            this.collectStats = false;
            this.numHiddenLayers = 1;
            this.networkShape = [3];
            this.numInputs = 3;
            this.inputs = {
                i1: 'I_1',
                i2: 'I_2',
                i3: 'I_3',
            };
            this.numOutputs = 3;
        }
        return State;
    }());
    exports.State = State;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV1cmFsbmV0d29yay5zdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvbmV1cmFsbmV0d29yay9uZXVyYWxuZXR3b3JrLnN0YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7Ozs7SUFJSCxvREFBb0Q7SUFDekMsUUFBQSxXQUFXLEdBQTZDO1FBQy9ELElBQUksRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUk7UUFDekIsSUFBSSxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSTtRQUN6QixPQUFPLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPO1FBQy9CLE1BQU0sRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLE1BQU07S0FDaEMsQ0FBQztJQUVGLHdEQUF3RDtJQUM3QyxRQUFBLGVBQWUsR0FBaUQ7UUFDdkUsSUFBSSxFQUFFLElBQUk7UUFDVixFQUFFLEVBQUUsRUFBRSxDQUFDLHNCQUFzQixDQUFDLEVBQUU7UUFDaEMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFO0tBQ25DLENBQUM7SUFFRixTQUFnQixlQUFlLENBQUMsR0FBUSxFQUFFLEtBQVU7UUFDaEQsS0FBSyxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUU7WUFDakIsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssS0FBSyxFQUFFO2dCQUNwQixPQUFPLEdBQUcsQ0FBQzthQUNkO1NBQ0o7UUFDRCxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBUEQsMENBT0M7SUFFRDs7O09BR0c7SUFDSCxJQUFZLElBT1g7SUFQRCxXQUFZLElBQUk7UUFDWixtQ0FBTSxDQUFBO1FBQ04sbUNBQU0sQ0FBQTtRQUNOLCtDQUFZLENBQUE7UUFDWiwrQ0FBWSxDQUFBO1FBQ1oscUNBQU8sQ0FBQTtRQUNQLG1DQUFNLENBQUE7SUFDVixDQUFDLEVBUFcsSUFBSSxHQUFKLFlBQUksS0FBSixZQUFJLFFBT2Y7SUFRRCxxQkFBcUI7SUFDckI7UUFBQTtZQUVJLGlCQUFZLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLHVCQUFrQixHQUFHLENBQUMsQ0FBQztZQUN2QixVQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsY0FBUyxHQUFHLEVBQUUsQ0FBQztZQUNmLGVBQVUsR0FBRyxLQUFLLENBQUM7WUFDbkIsa0JBQWEsR0FBRyxFQUFFLENBQUM7WUFDbkIsa0JBQWEsR0FBRyxRQUFRLENBQUM7WUFDekIsZUFBVSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2hELG1CQUFjLEdBQThCLElBQUksQ0FBQztZQUNqRCxhQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ2pCLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLG9CQUFlLEdBQUcsQ0FBQyxDQUFDO1lBQ3BCLGlCQUFZLEdBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixjQUFTLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsV0FBTSxHQUFHO2dCQUNMLEVBQUUsRUFBRSxLQUFLO2dCQUNULEVBQUUsRUFBRSxLQUFLO2dCQUNULEVBQUUsRUFBRSxLQUFLO2FBQ1osQ0FBQztZQUNGLGVBQVUsR0FBRyxDQUFDLENBQUM7UUFFbkIsQ0FBQztRQUFELFlBQUM7SUFBRCxDQUFDLEFBdkJELElBdUJDO0lBdkJZLHNCQUFLIn0=