package de.fhg.iais.roberta.visitor;

import de.fhg.iais.roberta.syntax.action.ev3.ShowPictureAction;
import de.fhg.iais.roberta.syntax.sensor.generic.ColorSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.CompassSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.EncoderSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.GetSampleSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.GyroSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.HTColorSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.IRSeekerSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.InfraredSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.KeysSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.SoundSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.TimerSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.TouchSensor;
import de.fhg.iais.roberta.syntax.sensor.generic.UltrasonicSensor;
import de.fhg.iais.roberta.visitor.hardware.actor.IActors4AutonomousDriveRobots;
import de.fhg.iais.roberta.visitor.hardware.actor.IBluetoothVisitor;
import de.fhg.iais.roberta.visitor.hardware.actor.ISpeechVisitor;

public interface IEv3Visitor<V> extends IActors4AutonomousDriveRobots<V>, IBluetoothVisitor<V>, ISpeechVisitor<V> {
    V visitShowPictureAction(ShowPictureAction<V> showPictureAction);

    V visitKeysSensor(KeysSensor<V> keysSensor);

    V visitColorSensor(ColorSensor<V> colorSensor);

    V visitSoundSensor(SoundSensor<V> soundSensor);

    V visitEncoderSensor(EncoderSensor<V> encoderSensor);

    V visitGyroSensor(GyroSensor<V> gyroSensor);

    V visitInfraredSensor(InfraredSensor<V> infraredSensor);

    V visitTimerSensor(TimerSensor<V> timerSensor);

    V visitTouchSensor(TouchSensor<V> touchSensor);

    V visitUltrasonicSensor(UltrasonicSensor<V> ultrasonicSensor);

    V visitCompassSensor(CompassSensor<V> compassSensor);

    V visitIRSeekerSensor(IRSeekerSensor<V> irSeekerSensor);

    V visitHTColorSensor(HTColorSensor<V> htColorSensor);

    default V visitGetSampleSensor(GetSampleSensor<V> sensorGetSample) {
        return sensorGetSample.getSensor().accept(this);
    }
}
