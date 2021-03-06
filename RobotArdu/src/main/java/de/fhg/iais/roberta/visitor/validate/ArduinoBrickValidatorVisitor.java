package de.fhg.iais.roberta.visitor.validate;

import com.google.common.collect.ClassToInstanceMap;

import de.fhg.iais.roberta.bean.IProjectBean;
import de.fhg.iais.roberta.components.ConfigurationAst;
import de.fhg.iais.roberta.components.ConfigurationComponent;
import de.fhg.iais.roberta.syntax.SC;
import de.fhg.iais.roberta.syntax.action.display.ClearDisplayAction;
import de.fhg.iais.roberta.syntax.action.display.ShowTextAction;
import de.fhg.iais.roberta.syntax.action.generic.PinWriteValueAction;
import de.fhg.iais.roberta.syntax.action.light.LightAction;
import de.fhg.iais.roberta.syntax.action.light.LightStatusAction;
import de.fhg.iais.roberta.syntax.action.motor.MotorOnAction;
import de.fhg.iais.roberta.syntax.action.serial.SerialWriteAction;
import de.fhg.iais.roberta.syntax.action.sound.PlayNoteAction;
import de.fhg.iais.roberta.syntax.action.sound.ToneAction;
import de.fhg.iais.roberta.syntax.actors.arduino.RelayAction;
import de.fhg.iais.roberta.syntax.lang.functions.GetSubFunct;
import de.fhg.iais.roberta.syntax.lang.functions.IndexOfFunct;
import de.fhg.iais.roberta.syntax.lang.functions.LengthOfIsEmptyFunct;
import de.fhg.iais.roberta.syntax.lang.functions.ListGetIndex;
import de.fhg.iais.roberta.syntax.lang.functions.ListSetIndex;
import de.fhg.iais.roberta.syntax.lang.functions.MathOnListFunct;
import de.fhg.iais.roberta.syntax.neuralnetwork.NeuralNetworkAddRawData;
import de.fhg.iais.roberta.syntax.neuralnetwork.NeuralNetworkAddTrainingsData;
import de.fhg.iais.roberta.syntax.neuralnetwork.NeuralNetworkClassify;
import de.fhg.iais.roberta.syntax.neuralnetwork.NeuralNetworkInitRawData;
import de.fhg.iais.roberta.syntax.neuralnetwork.NeuralNetworkSetup;
import de.fhg.iais.roberta.syntax.neuralnetwork.NeuralNetworkTrain;
import de.fhg.iais.roberta.syntax.sensor.Sensor;
import de.fhg.iais.roberta.syntax.sensor.generic.DropSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.EncoderSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.GetSampleSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.HumiditySensor;
import de.fhg.iais.roberta.syntax.sensor.generic.KeysSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.MoistureSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.MotionSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.PinGetValueSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.PulseSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.RfidSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.TemperatureSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.VoltageSensor;
import de.fhg.iais.roberta.syntax.sensors.arduino.nano33blesense.Apds9960ColorSensor;
import de.fhg.iais.roberta.syntax.sensors.arduino.nano33blesense.Apds9960DistanceSensor;
import de.fhg.iais.roberta.syntax.sensors.arduino.nano33blesense.Apds9960GestureSensor;
import de.fhg.iais.roberta.syntax.sensors.arduino.nano33blesense.Hts221HumiditySensor;
import de.fhg.iais.roberta.syntax.sensors.arduino.nano33blesense.Hts221TemperatureSensor;
import de.fhg.iais.roberta.syntax.sensors.arduino.nano33blesense.Lps22hbPressureSensor;
import de.fhg.iais.roberta.syntax.sensors.arduino.nano33blesense.Lsm9ds1AccSensor;
import de.fhg.iais.roberta.syntax.sensors.arduino.nano33blesense.Lsm9ds1GyroSensor;
import de.fhg.iais.roberta.syntax.sensors.arduino.nano33blesense.Lsm9ds1MagneticFieldSensor;
import de.fhg.iais.roberta.typecheck.NepoInfo;
import de.fhg.iais.roberta.visitor.hardware.IArduinoVisitor;
import de.fhg.iais.roberta.visitor.hardware.sensor.ISensorVisitor;

public final class ArduinoBrickValidatorVisitor extends AbstractBrickValidatorVisitor implements ISensorVisitor<Void>, IArduinoVisitor<Void> {

    public ArduinoBrickValidatorVisitor(ConfigurationAst brickConfiguration, ClassToInstanceMap<IProjectBean.IBuilder<?>> beanBuilders) {
        super(brickConfiguration, beanBuilders);
    }

    @Override
    public Void visitGetSampleSensor(GetSampleSensor<Void> sensorGetSample) {
        Sensor<Void> sensor = sensorGetSample.getSensor();
        // TODO remove once rfid library is supported for unowifirev2
        if ( sensor.getKind().hasName("RFID_SENSING") ) {
            sensorGetSample.addInfo(NepoInfo.warning("BLOCK_NOT_SUPPORTED"));
        }
        return super.visitGetSampleSensor(sensorGetSample);
    }

    @Override
    public Void visitKeysSensor(KeysSensor<Void> keysSensor) {
        checkSensorPort(keysSensor);
        return null;
    }

    @Override
    public Void visitMoistureSensor(MoistureSensor<Void> moistureSensor) {
        checkSensorPort(moistureSensor);
        return null;
    }

    @Override
    public Void visitMotionSensor(MotionSensor<Void> motionSensor) {
        checkSensorPort(motionSensor);
        return null;
    }

    @Override
    public Void visitPulseSensor(PulseSensor<Void> pulseSensor) {
        checkSensorPort(pulseSensor);
        return null;
    }

    @Override
    public Void visitRfidSensor(RfidSensor<Void> rfidSensor) {
        if ( !this.robotConfiguration.getRobotName().equals("unowifirev2") ) { // TODO remove when rfid library is supported for unowifirev2
            checkSensorPort(rfidSensor);
        } else {
            rfidSensor.addInfo(NepoInfo.warning("BLOCK_NOT_SUPPORTED"));
        }
        return null;
    }

    @Override
    public Void visitHumiditySensor(HumiditySensor<Void> humiditySensor) {
        checkSensorPort(humiditySensor);
        return null;
    }

    @Override
    public Void visitDropSensor(DropSensor<Void> dropSensor) {
        checkSensorPort(dropSensor);
        return null;
    }

    @Override
    public Void visitVoltageSensor(VoltageSensor<Void> voltageSensor) {
        checkSensorPort(voltageSensor);
        return null;
    }

    @Override
    public Void visitTemperatureSensor(TemperatureSensor<Void> temperatureSensor) {
        checkSensorPort(temperatureSensor);
        return null;
    }

    @Override
    public Void visitEncoderSensor(EncoderSensor<Void> encoderSensor) {
        checkSensorPort(encoderSensor);
        return null;
    }

    @Override
    public Void visitMotorOnAction(MotorOnAction<Void> motorOnAction) {
        if ( motorOnAction.getInfos().getErrorCount() == 0 ) {
            ConfigurationComponent usedConfigurationBlock = this.robotConfiguration.optConfigurationComponent(motorOnAction.getUserDefinedPort());
            boolean duration = motorOnAction.getParam().getDuration() != null;
            if ( usedConfigurationBlock == null ) {
                motorOnAction.addInfo(NepoInfo.error("CONFIGURATION_ERROR_ACTOR_MISSING"));
                this.errorCount++;
            } else if ( usedConfigurationBlock.getComponentType().equals(SC.OTHER) && duration ) {
                motorOnAction.addInfo(NepoInfo.error("CONFIGURATION_ERROR_OTHER_NOT_SUPPORTED"));
            }
        }
        return null;
    }

    @Override
    public Void visitLightAction(LightAction<Void> lightAction) {
        if ( lightAction.getInfos().getErrorCount() == 0 ) {
            ConfigurationComponent usedConfigurationBlock = this.robotConfiguration.optConfigurationComponent(lightAction.getPort());
            if ( usedConfigurationBlock == null ) {
                lightAction.addInfo(NepoInfo.error("CONFIGURATION_ERROR_ACTOR_MISSING"));
                this.errorCount++;
            }
        }
        return null;
    }

    @Override
    public Void visitPlayNoteAction(PlayNoteAction<Void> playNoteAction) {
        if ( playNoteAction.getInfos().getErrorCount() == 0 ) {
            ConfigurationComponent usedConfigurationBlock = this.robotConfiguration.optConfigurationComponent(playNoteAction.getPort());
            if ( usedConfigurationBlock == null ) {
                playNoteAction.addInfo(NepoInfo.error("CONFIGURATION_ERROR_ACTOR_MISSING"));
                this.errorCount++;
            }
        }
        return null;
    }

    @Override
    public Void visitLightStatusAction(LightStatusAction<Void> lightStatusAction) {
        if ( lightStatusAction.getInfos().getErrorCount() == 0 ) {
            ConfigurationComponent usedConfigurationBlock = this.robotConfiguration.optConfigurationComponent(lightStatusAction.getUserDefinedPort());
            if ( usedConfigurationBlock == null ) {
                lightStatusAction.addInfo(NepoInfo.error("CONFIGURATION_ERROR_ACTOR_MISSING"));
                this.errorCount++;
            }
        }
        return null;
    }

    @Override
    public Void visitToneAction(ToneAction<Void> toneAction) {
        if ( toneAction.getInfos().getErrorCount() == 0 ) {
            ConfigurationComponent usedConfigurationBlock = this.robotConfiguration.optConfigurationComponent(toneAction.getPort());
            if ( usedConfigurationBlock == null ) {
                toneAction.addInfo(NepoInfo.error("CONFIGURATION_ERROR_ACTOR_MISSING"));
                this.errorCount++;
            }
        }
        return null;
    }

    @Override
    public Void visitRelayAction(RelayAction<Void> relayAction) {
        if ( relayAction.getInfos().getErrorCount() == 0 ) {
            ConfigurationComponent usedConfigurationBlock = this.robotConfiguration.optConfigurationComponent(relayAction.getPort());
            if ( usedConfigurationBlock == null ) {
                relayAction.addInfo(NepoInfo.error("CONFIGURATION_ERROR_ACTOR_MISSING"));
                this.errorCount++;
            }
        }
        return null;
    }

    @Override
    public Void visitShowTextAction(ShowTextAction<Void> showtextAction) {
        if ( showtextAction.getInfos().getErrorCount() == 0 ) {
            ConfigurationComponent usedConfigurationBlock = this.robotConfiguration.optConfigurationComponent(showtextAction.port);
            if ( usedConfigurationBlock == null ) {
                showtextAction.addInfo(NepoInfo.error("CONFIGURATION_ERROR_ACTOR_MISSING"));
                this.errorCount++;
            }
        }
        return null;
    }

    @Override
    public Void visitClearDisplayAction(ClearDisplayAction<Void> clearDisplayAction) {
        if ( clearDisplayAction.getInfos().getErrorCount() == 0 ) {
            ConfigurationComponent usedConfigurationBlock = this.robotConfiguration.optConfigurationComponent(clearDisplayAction.port);
            if ( usedConfigurationBlock == null ) {
                clearDisplayAction.addInfo(NepoInfo.error("CONFIGURATION_ERROR_ACTOR_MISSING"));
                this.errorCount++;
            }
        }
        return null;
    }

    @Override
    public Void visitPinGetValueSensor(PinGetValueSensor<Void> pinGetValueSensor) {
        checkSensorPort(pinGetValueSensor);
        return null;
    }

    @Override
    public Void visitPinWriteValueAction(PinWriteValueAction<Void> pinWriteValueAction) {
        if ( pinWriteValueAction.getInfos().getErrorCount() == 0 ) {
            ConfigurationComponent usedConfigurationBlock = this.robotConfiguration.optConfigurationComponent(pinWriteValueAction.getPort());
            if ( usedConfigurationBlock == null ) {
                pinWriteValueAction.addInfo(NepoInfo.error("CONFIGURATION_ERROR_ACTOR_MISSING"));
                this.errorCount++;
            }
        }
        return null;
    }

    @Override
    public Void visitSerialWriteAction(SerialWriteAction<Void> serialWriteAction) {
        serialWriteAction.getValue().accept(this);
        return null;
    }

    @Override
    public Void visitIndexOfFunct(IndexOfFunct<Void> indexOfFunct) {
        if ( indexOfFunct.getParam().get(0).toString().contains("ListCreate ") ) {
            indexOfFunct.addInfo(NepoInfo.error("BLOCK_USED_INCORRECTLY"));
            this.errorCount++;
        }
        return super.visitIndexOfFunct(indexOfFunct);
    }

    @Override
    public Void visitListGetIndex(ListGetIndex<Void> listGetIndex) {
        if ( listGetIndex.getParam().get(0).toString().contains("ListCreate ") ) {
            listGetIndex.addInfo(NepoInfo.error("BLOCK_USED_INCORRECTLY"));
            this.errorCount++;
        }
        return super.visitListGetIndex(listGetIndex);
    }

    @Override
    public Void visitListSetIndex(ListSetIndex<Void> listSetIndex) {
        if ( listSetIndex.getParam().get(0).toString().contains("ListCreate ") ) {
            listSetIndex.addInfo(NepoInfo.error("BLOCK_USED_INCORRECTLY"));
            this.errorCount++;
        }
        return super.visitListSetIndex(listSetIndex);
    }

    @Override
    public Void visitLengthOfIsEmptyFunct(LengthOfIsEmptyFunct<Void> lengthOfIsEmptyFunct) {
        if ( lengthOfIsEmptyFunct.getParam().get(0).toString().contains("ListCreate ") ) {
            lengthOfIsEmptyFunct.addInfo(NepoInfo.error("BLOCK_USED_INCORRECTLY"));
            this.errorCount++;
        }
        return super.visitLengthOfIsEmptyFunct(lengthOfIsEmptyFunct);
    }

    @Override
    public Void visitMathOnListFunct(MathOnListFunct<Void> mathOnListFunct) {
        if ( mathOnListFunct.getParam().get(0).toString().contains("ListCreate ") ) {
            mathOnListFunct.addInfo(NepoInfo.error("BLOCK_USED_INCORRECTLY"));
            this.errorCount++;
        }
        return super.visitMathOnListFunct(mathOnListFunct);
    }

    @Override
    public Void visitGetSubFunct(GetSubFunct<Void> getSubFunct) {
        if ( getSubFunct.getParam().get(0).toString().contains("ListCreate ") ) {
            getSubFunct.addInfo(NepoInfo.error("BLOCK_USED_INCORRECTLY"));
            this.errorCount++;
        }
        return super.visitGetSubFunct(getSubFunct);
    }

    @Override
    public Void visitLsm9ds1AccSensor(Lsm9ds1AccSensor<Void> sensor) {
        sensor.getX().accept(this);
        sensor.getY().accept(this);
        sensor.getZ().accept(this);
        return null;
    }

    @Override
    public Void visitLsm9ds1GyroSensor(Lsm9ds1GyroSensor<Void> sensor) {
        sensor.x.accept(this);
        sensor.y.accept(this);
        sensor.z.accept(this);
        return null;
    }

    @Override
    public Void visitLsm9ds1MagneticFieldSensor(Lsm9ds1MagneticFieldSensor<Void> sensor) {
        sensor.getX().accept(this);
        sensor.getY().accept(this);
        sensor.getZ().accept(this);
        return null;
    }

    @Override
    public Void visitApds9960DistanceSensor(Apds9960DistanceSensor<Void> sensor) {
        sensor.getDistance().accept(this);
        return null;
    }

    @Override
    public Void visitApds9960GestureSensor(Apds9960GestureSensor<Void> sensor) {
        sensor.getGesture().accept(this);
        return null;
    }

    @Override
    public Void visitApds9960ColorSensor(Apds9960ColorSensor<Void> sensor) {
        sensor.getR().accept(this);
        sensor.getG().accept(this);
        sensor.getB().accept(this);
        return null;
    }

    @Override
    public Void visitLps22hbPressureSensor(Lps22hbPressureSensor<Void> sensor) {
        sensor.getPressure().accept(this);
        return null;
    }

    @Override
    public Void visitHts221TemperatureSensor(Hts221TemperatureSensor<Void> sensor) {
        sensor.getTemperature().accept(this);
        return null;
    }

    @Override
    public Void visitHts221HumiditySensor(Hts221HumiditySensor<Void> sensor) {
        sensor.getHumidity().accept(this);
        return null;
    }

    @Override
    public Void visitNeuralNetworkSetup(NeuralNetworkSetup<Void> nn) {
        nn.getNumberOfClasses().accept(this);
        nn.getNumberInputNeurons().accept(this);
        nn.getMaxNumberOfNeurons().accept(this);
        return null;
    }

    @Override
    public Void visitNeuralNetworkInitRawData(NeuralNetworkInitRawData<Void> nn) {
        return null;
    }

    @Override
    public Void visitNeuralNetworkAddRawData(NeuralNetworkAddRawData<Void> nn) {
        nn.getRawData().accept(this);
        return null;
    }

    @Override
    public Void visitNeuralNetworkAddTrainingsData(NeuralNetworkAddTrainingsData<Void> nn) {
        nn.getClassNumber().accept(this);
        return null;
    }

    @Override
    public Void visitNeuralNetworkTrain(NeuralNetworkTrain<Void> nn) {
        return null;
    }

    @Override
    public Void visitNeuralNetworkClassify(NeuralNetworkClassify<Void> nn) {
        nn.probabilities.accept(this);
        return null;
    }
}
