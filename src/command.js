export const takeoffCommand = Buffer.from("takeoff");
export const landCommand = Buffer.from("land");
export const stopCommand = Buffer.from("stop");
export const batteryCommand = Buffer.from("battery?");

// 동서남북
export const forwardCommand = Buffer.from("rc 0 50 0 0");
// export const backCommand = Buffer.from("rc 0 -50 0 0");
export const backCommand = Buffer.from("back 50");
export const leftCommand = Buffer.from("rc -50 0 0 0");
export const rightCommand = Buffer.from("rc 50 0 0 0");

// 위 아래
export const donwCommand = Buffer.from("rc 0 0 0 -50");
export const upCommand = Buffer.from('rc 0 0 0 50');

// 요잉(회전)
export const yawCammand = Buffer.from('');

// ToF
export const tofCammand = Buffer.from('tof?')