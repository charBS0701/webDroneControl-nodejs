export const takeoffCommand = Buffer.from("takeoff");
export const landCommand = Buffer.from("land");
export const stopCommand = Buffer.from("stop");
export const batteryCommand = Buffer.from("battery?");

// 동서남북
export const forwardCommand = Buffer.from("rc 0 50 0 0");
export const backCommand = Buffer.from("rc 0 -50 0 0");
export const leftCommand = Buffer.from("rc -50 0 0 0");
export const rightCommand = Buffer.from("rc 50 0 0 0");

// 위 아래 회전
export const upCommand = Buffer.from("rc 0 0 50 0");
export const downCommand = Buffer.from("rc 0 0 -50 0");
export const clockwiseCommand = Buffer.from("rc 0 0 0 50");
export const counterClockwiseCommand = Buffer.from("rc 0 0 0 -50");

// Avoid
export const avoidCammand = Buffer.from('back 50');

// destination
export const fwCommand = Buffer.from("forward 50");
export const cwCommand = Buffer.from("cw 90");
export const ccwCommand = Buffer.from("ccw 90");