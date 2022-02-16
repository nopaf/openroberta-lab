package de.fhg.iais.roberta.visitor.codegen;

import java.util.List;

import com.google.common.collect.ClassToInstanceMap;

import de.fhg.iais.roberta.bean.IProjectBean;
import de.fhg.iais.roberta.bean.UsedHardwareBean;
import de.fhg.iais.roberta.components.Category;
import de.fhg.iais.roberta.components.ConfigurationAst;
import de.fhg.iais.roberta.components.ConfigurationComponent;
import de.fhg.iais.roberta.mode.action.MotorMoveMode;
import de.fhg.iais.roberta.syntax.MotionParam;
import de.fhg.iais.roberta.syntax.MotorDuration;
import de.fhg.iais.roberta.syntax.Phrase;
import de.fhg.iais.roberta.syntax.SC;
import de.fhg.iais.roberta.syntax.action.light.LightAction;
import de.fhg.iais.roberta.syntax.action.light.LightStatusAction;
import de.fhg.iais.roberta.syntax.action.motor.MotorGetPowerAction;
import de.fhg.iais.roberta.syntax.action.motor.MotorOnAction;
import de.fhg.iais.roberta.syntax.action.motor.MotorSetPowerAction;
import de.fhg.iais.roberta.syntax.action.motor.MotorStopAction;
import de.fhg.iais.roberta.syntax.action.motor.differential.CurveAction;
import de.fhg.iais.roberta.syntax.action.motor.differential.DriveAction;
import de.fhg.iais.roberta.syntax.action.motor.differential.MotorDriveStopAction;
import de.fhg.iais.roberta.syntax.action.motor.differential.TurnAction;
import de.fhg.iais.roberta.syntax.lang.blocksequence.MainTask;
import de.fhg.iais.roberta.util.dbc.DbcException;
import de.fhg.iais.roberta.visitor.hardware.IOnerpcVisitor;

//public class OneRpcCppVisitor <V> extends ArduinoCppVisitor {//implements IOnerpcVisitor<Void> {
 public class OneRpcCppVisitor <V> extends AbstractCommonArduinoCppVisitor implements IOnerpcVisitor<Void> {
    /**
     * Initialize the C++ code generator visitor.
     *
     * @param phrases to generate the code from
     */
    public OneRpcCppVisitor(List<List<Phrase<Void>>> phrases, ConfigurationAst brickConfiguration, ClassToInstanceMap<IProjectBean> beans) {
        super(phrases, brickConfiguration, beans);
    }
	
	@Override
	public Void visitMainTask(MainTask<Void> mainTask) {
		mainTask.getVariables().accept(this);
        nlIndent();
        generateConfigurationVariables();
        generateTimerVariables();
        long numberConf =
            this.programPhrases
                .stream()
                .filter(phrase -> phrase.getKind().getCategory() == Category.METHOD && !phrase.getKind().hasName("METHOD_CALL"))
                .count();
        if ( (this.configuration.getConfigurationComponents().isEmpty() || this.getBean(UsedHardwareBean.class).isSensorUsed(SC.TIMER)) && numberConf == 0 ) {
            nlIndent();
        }
        generateUserDefinedMethods();
        if ( numberConf != 0 ) {
            nlIndent();
        }
        this.sb.append("void setup()");
        nlIndent();
        this.sb.append("{");

        incrIndentation();

        nlIndent();
        if ( this.getBean(UsedHardwareBean.class).isActorUsed(SC.SERIAL) ) {
            this.sb.append("Serial.begin(9600); ");
            nlIndent();
        }
        generateConfigurationSetup();

        generateUsedVars();
        this.sb.delete(this.sb.lastIndexOf("\n"), this.sb.length());

        decrIndentation();

        nlIndent();
        this.sb.append("}");

        nlIndent();
        return null;
	}
	
	@Override
    protected void generateProgramPrefix(boolean withWrapping) {
        if ( !withWrapping ) {
            return;
        } else {
            decrIndentation();
        }
        this.sb.append("#define _ARDUINO_STL_NOT_NEEDED"); // TODO remove negation and thus double negation in NEPODEFS.h, maybe define when necessary
        nlIndent();
        this.sb.append("#include <Arduino.h>");
        nlIndent();
        this.sb.append("#include <NEPODefs.h>");
        nlIndent();
        nlIndent();
        this.sb.append("#define LED_BUILTIN 23");
        nlIndent();
       
        // super.generateProgramPrefix(withWrapping);
    }

    @SuppressWarnings("unchecked")
	@Override
    public Void visitLightAction(LightAction<Void> lightAction) {
        System.out.println("LightAction from 1RPCCppVisitor");
        this.sb.append("digitalWrite(_led_" + lightAction.getPort() + ", " + lightAction.getMode().getValues()[0] + ");");
        return null;
    }

    @Override
    public Void visitLightStatusAction(LightStatusAction<Void> lightStatusAction) {
        return null;
    }    


    // @Override
    // public Void visitDriveAction(DriveAction<Void> driveAction) {
    //     final MotorDuration<Void> duration = driveAction.getParam().getDuration();
    //     this.sb.append("_meDrive.drive(");
    //     driveAction.getParam().getSpeed().accept(this);
    //     this.sb.append(", ");
    //     this.sb.append(driveAction.getDirection() == DriveDirection.FOREWARD ? 1 : 0);
    //     if ( duration != null ) {
    //         this.sb.append(", ");
    //         duration.getValue().accept(this);
    //     }
    //     this.sb.append(");");
    //     return null;
    // }

    // @Override
    // public Void visitMotorOnAction(MotorOnAction<Void> motorOnAction) {
    //     System.out.println("Hello from MotorOnAction");
        
    //     this.sb.append("_servo_").append(motorOnAction.getUserDefinedPort()).append(".write(");
    //     motorOnAction.getParam().getSpeed().accept(this);
    //     this.sb.append(");");
    //     return null;

    //     // boolean step = motorOnAction.getParam().getDuration() != null;
    //     // if ( step ) {//step motor
    //     //     this.sb.append("_stepper_" + motorOnAction.getUserDefinedPort() + ".setSpeed(");
    //     //     motorOnAction.getParam().getSpeed().accept(this);
    //     //     this.sb.append(");");
    //     //     nlIndent();
    //     //     this.sb.append("_stepper_" + motorOnAction.getUserDefinedPort() + ".step(_SPU_" + motorOnAction.getUserDefinedPort() + "*(");
    //     //     motorOnAction.getDurationValue().accept(this);
    //     //     this.sb.append(")");
    //     //     if ( motorOnAction.getDurationMode().equals(MotorMoveMode.DEGREE) ) {
    //     //         this.sb.append("/360");
    //     //     }
    //     //     this.sb.append(");");
    //     // } else {//servo motor
    //     //     this.sb.append("_servo_" + motorOnAction.getUserDefinedPort() + ".write(");
    //     //     motorOnAction.getParam().getSpeed().accept(this);
    //     //     this.sb.append(");");
    //     // }
    //     // return null;
    // }
    
    private void generateConfigurationSetup() {
        for ( ConfigurationComponent usedConfigurationBlock : this.configuration.getConfigurationComponentsValues() ) {
            switch ( usedConfigurationBlock.getComponentType() ) {
                case SC.LED:
                    this.sb.append("pinMode(_led_").append(usedConfigurationBlock.getUserDefinedPortName()).append(", OUTPUT);");
                    nlIndent();
                    break;
                default:
                    // throw new DbcException("Sensor is not supported: " + usedConfigurationBlock.getComponentType());
            }
        }
    }
    
    private void generateConfigurationVariables() {
        for ( ConfigurationComponent cc : this.configuration.getConfigurationComponentsValues() ) {
            String blockName = cc.getUserDefinedPortName();
            System.out.println("cc.getComponentType() = " + cc.getComponentType());
            switch ( cc.getComponentType() ) {
                case SC.LED:
                    this.sb.append("int _led_").append(blockName).append(" = ").append(cc.getProperty("INPUT")).append(";");
                    nlIndent();
                    break;
                default:
                    // throw new DbcException("Configuration block is not supported: " + cc.getComponentType());
            }
        }
    }

    @Override
    public Void visitCurveAction(CurveAction<Void> curveAction) {
        System.out.println("hello from curve");
        return null;
    }

    @Override
    public Void visitTurnAction(TurnAction<Void> turnAction) {
        System.out.println("hello from turnAction");
        return null;
    }

    @Override
    public Void visitMotorDriveStopAction(MotorDriveStopAction<Void> stopAction) {
        System.out.println("hello from driveStop");
        return null;
    }

    @Override
    public Void visitMotorOnAction(MotorOnAction<Void> motorOnAction) {
        System.out.println("hello from onAction");
        return null;
    }

    @Override
    public Void visitDriveAction(DriveAction<Void> driveAction) {
        System.out.println("hello from drive");
        driveAction.getDirection();
        // MotionParam<Void> p = driveAction.getParam();
        sb.append("Serial.println(\"Hello World!\")");
        return null;
    }

    @Override
    public Void visitMotorSetPowerAction(MotorSetPowerAction<Void> motorSetPowerAction) {
        System.out.println("hello from setpoweraction");
        return null;
    }

    @Override
    public Void visitMotorGetPowerAction(MotorGetPowerAction<Void> motorGetPowerAction) {
        System.out.println("hello from getpoweraction");
        return null;
    }

    @Override
    public Void visitMotorStopAction(MotorStopAction<Void> motorStopAction) {
        System.out.println("hello from stop");
        return null;
    }


}
