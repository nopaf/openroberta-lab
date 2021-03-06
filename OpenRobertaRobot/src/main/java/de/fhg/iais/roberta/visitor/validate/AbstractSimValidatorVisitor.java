package de.fhg.iais.roberta.visitor.validate;

import com.google.common.collect.ClassToInstanceMap;

import de.fhg.iais.roberta.bean.IProjectBean;
import de.fhg.iais.roberta.components.ConfigurationAst;
import de.fhg.iais.roberta.components.ConfigurationComponent;
import de.fhg.iais.roberta.syntax.action.communication.BluetoothCheckConnectAction;
import de.fhg.iais.roberta.syntax.action.communication.BluetoothConnectAction;
import de.fhg.iais.roberta.syntax.action.communication.BluetoothReceiveAction;
import de.fhg.iais.roberta.syntax.action.communication.BluetoothSendAction;
import de.fhg.iais.roberta.syntax.action.communication.BluetoothWaitForConnectionAction;
import de.fhg.iais.roberta.syntax.lang.expr.Binary;
import de.fhg.iais.roberta.syntax.lang.expr.ConnectConst;
import de.fhg.iais.roberta.syntax.lang.expr.EmptyExpr;
import de.fhg.iais.roberta.syntax.lang.expr.Unary;
import de.fhg.iais.roberta.syntax.lang.stmt.RepeatStmt;
import de.fhg.iais.roberta.syntax.lang.stmt.RepeatStmt.Mode;
import de.fhg.iais.roberta.syntax.sensor.ExternalSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.ColorSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.LightSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.TemperatureSensor;
import de.fhg.iais.roberta.typecheck.NepoInfo;

public abstract class AbstractSimValidatorVisitor extends AbstractProgramValidatorVisitor {

    public AbstractSimValidatorVisitor(ConfigurationAst brickConfiguration, ClassToInstanceMap<IProjectBean.IBuilder<?>> beanBuilders) {
        super(brickConfiguration, beanBuilders);
    }

    @Override
    protected void checkSensorPort(ExternalSensor<Void> sensor) {
        ConfigurationComponent usedSensor = this.robotConfiguration.optConfigurationComponent(sensor.getUserDefinedPort());
        if ( usedSensor == null ) {
            if ( sensor.getKind().hasName("INFRARED_SENSING") ) {
                addWarningToPhrase(sensor,"SIM_CONFIGURATION_WARNING_WRONG_INFRARED_SENSOR_PORT");;
            } else {
                addWarningToPhrase(sensor,"SIM_CONFIGURATION_WARNING_SENSOR_MISSING");;
            }
        } else {
            String type = usedSensor.getComponentType();
            switch ( sensor.getKind().getName() ) {
                case "COLOR_SENSING":
                    if ( !type.equals("COLOR") && !type.equals("HT_COLOR") ) {
                        addWarningToPhrase(sensor,"SIM_CONFIGURATION_WARNING_WRONG_SENSOR_PORT");;
                    }
                    break;
                case "TOUCH_SENSING":
                    if ( !type.equals("TOUCH") ) {
                        addWarningToPhrase(sensor,"SIM_CONFIGURATION_WARNING_WRONG_SENSOR_PORT");;
                    }
                    break;
                case "ULTRASONIC_SENSING":
                    if ( !type.equals("ULTRASONIC") ) {
                        addWarningToPhrase(sensor,"SIM_CONFIGURATION_WARNING_WRONG_SENSOR_PORT");;
                    }
                    break;
                case "INFRARED_SENSING":
                    if ( !type.equals("INFRARED") ) {
                        addWarningToPhrase(sensor,"SIM_CONFIGURATION_WARNING_WRONG_INFRARED_SENSOR_PORT");;
                    }
                    break;
                case "GYRO_SENSING":
                    if ( !type.equals("GYRO") ) {
                        addWarningToPhrase(sensor,"SIM_CONFIGURATION_WARNING_WRONG_SENSOR_PORT");;
                    }
                    break;
                case "COMPASS_SENSING":
                    if ( !type.equals("COMPASS") ) {
                        addWarningToPhrase(sensor,"SIM_CONFIGURATION_WARNING_WRONG_SENSOR_PORT");;
                    }
                    break;
                case "IRSEEKER_SENSING":
                    if ( !type.equals("IRSEEKER_SENSING") ) {
                        addWarningToPhrase(sensor,"SIM_CONFIGURATION_WARNING_WRONG_SENSOR_PORT");;
                    }
                    break;
                default:
                    break;
            }
        }
    }

    @Override
    public Void visitBluetoothReceiveAction(BluetoothReceiveAction<Void> bluetoothReceiveAction) {
        super.visitBluetoothReceiveAction(bluetoothReceiveAction);
        addWarningToPhrase(bluetoothReceiveAction,"SIM_BLOCK_NOT_SUPPORTED");;
        return null;
    }

    @Override
    public Void visitBluetoothConnectAction(BluetoothConnectAction<Void> bluetoothConnectAction) {
        super.visitBluetoothConnectAction(bluetoothConnectAction);
        addWarningToPhrase(bluetoothConnectAction,"SIM_BLOCK_NOT_SUPPORTED");;
        return null;
    }

    @Override
    public Void visitBluetoothSendAction(BluetoothSendAction<Void> bluetoothSendAction) {
        super.visitBluetoothSendAction(bluetoothSendAction);
        addWarningToPhrase(bluetoothSendAction,"SIM_BLOCK_NOT_SUPPORTED");;
        return null;
    }

    @Override
    public Void visitBluetoothWaitForConnectionAction(BluetoothWaitForConnectionAction<Void> bluetoothWaitForConnection) {
        super.visitBluetoothWaitForConnectionAction(bluetoothWaitForConnection);
        addWarningToPhrase(bluetoothWaitForConnection,"SIM_BLOCK_NOT_SUPPORTED");;
        return null;
    }

    @Override
    public Void visitConnectConst(ConnectConst<Void> connectConst) {
        super.visitConnectConst(connectConst);
        addWarningToPhrase(connectConst,"SIM_BLOCK_NOT_SUPPORTED");;
        return null;
    }

    @Override
    public Void visitBluetoothCheckConnectAction(BluetoothCheckConnectAction<Void> bluetoothCheckConnectAction) {
        super.visitBluetoothCheckConnectAction(bluetoothCheckConnectAction);
        addWarningToPhrase(bluetoothCheckConnectAction,"SIM_BLOCK_NOT_SUPPORTED");;
        return null;
    }

    @Override
    public Void visitTemperatureSensor(TemperatureSensor<Void> temperatureSensor) {
        super.visitTemperatureSensor(temperatureSensor);
        addWarningToPhrase(temperatureSensor,"SIM_BLOCK_NOT_SUPPORTED");;
        return null;
    }

    @Override
    public Void visitLightSensor(LightSensor<Void> lightSensor) {
        super.visitLightSensor(lightSensor);
        if ( lightSensor.getMode().toString().equals("AMBIENTLIGHT") ) {
            addWarningToPhrase(lightSensor,"SIM_BLOCK_NOT_SUPPORTED");;
        }
        return null;
    }

    @Override
    public Void visitColorSensor(ColorSensor<Void> colorSensor) {
        super.visitColorSensor(colorSensor);
        if ( colorSensor.getMode().toString().equals("AMBIENTLIGHT") ) {
            addWarningToPhrase(colorSensor,"SIM_BLOCK_NOT_SUPPORTED");;
        }
        return null;
    }

    @Override
    public Void visitRepeatStmt(RepeatStmt<Void> repeatStmt) {
        super.visitRepeatStmt(repeatStmt);
        if ( repeatStmt.getExpr() instanceof EmptyExpr ) {
            repeatStmt.addInfo(NepoInfo.error("ERROR_MISSING_PARAMETER"));
            this.errorCount++;
        } else if ( repeatStmt.getExpr() instanceof Unary ) {
            if ( ((Unary<Void>) repeatStmt.getExpr()).getExpr() instanceof EmptyExpr ) {
                repeatStmt.addInfo(NepoInfo.error("ERROR_MISSING_PARAMETER"));
                this.errorCount++;
            }
        } else if ( repeatStmt.getExpr() instanceof Binary ) {
            if ( ((Binary<Void>) repeatStmt.getExpr()).getRight() instanceof EmptyExpr ) {
                repeatStmt.addInfo(NepoInfo.error("ERROR_MISSING_PARAMETER"));
                this.errorCount++;
            }
        }
        if ( repeatStmt.getMode() == Mode.FOR_EACH && ((Binary<?>) repeatStmt.getExpr()).getRight().getKind().getName().equals("LIST_CREATE") ) {
            ((Binary<?>) repeatStmt.getExpr()).getRight().addInfo(NepoInfo.error("SIM_BLOCK_NOT_SUPPORTED"));
            this.errorCount++;
        }
        return null;
    }
}
