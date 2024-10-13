/* The maximum number of minutes in a period (a day) */

const MAX_IN_PERIOD = 1440;

/**
 * PART 1
 *
 * You have an appliance that uses energy, and you want to calculate how
 * much energy it uses over a period of time.
 *
 * As an input to your calculations, you have a series of events that contain
 * a timestamp and the new state (on or off). You are also given the initial
 * state of the appliance. From this information, you will need to calculate
 * the energy use of the appliance i.e. the amount of time it is switched on.
 *
 * The amount of energy it uses is measured in 1-minute intervals over the
 * period of a day. Given there is 1440 minutes in a day (24 * 60), if the
 * appliance was switched on the entire time, its energy usage would be 1440.
 * To simplify calculations, timestamps range from 0 (beginning of the day)
 * to 1439 (last minute of the day).
 *
 * HINT: there is an additional complication with the last two tests that
 * introduce spurious state change events (duplicates at different time periods).
 * Focus on getting these tests working after satisfying the first tests.
 *
 * The structure for `profile` looks like this (as an example):
 * ```
 * {
 *    initial: 'on',
 *    events: [
 *      { state: 'off', timestamp: 50 },
 *      { state: 'on', timestamp: 304 },
 *      { state: 'off', timestamp: 600 },
 *    ]
 * }
 * ```
 */

const calculateEnergyUsageSimple = (profile) => {
  // if the event array is empty we return 0 or 1440
  // dependant on the appliances initial state
  if (profile.events.length === 0) {
    if (profile.initial === 'on') {
      return MAX_IN_PERIOD;
    } else return 0;
  }

  // initialize energy usage at 0
  let energyUsage = 0;

  for (let i = 0; i < profile.events.length; i++) {
    // initialize the current event for cleanliness' sake each loop
    let event = profile.events[i];

    // initialize the previous event as the previous object in the array
    // or as a placeholder event if it is the first iteration of the loop
    let previousEvent =
      i > 0 ? profile.events[i - 1] : { timestamp: 0, state: profile.initial };

    // if the appliance state has not changed since the previous iteration
    // proceed to the next iteration of the loop
    if (event.state === previousEvent.state) {
      continue;
      // if the appliance is turned on we subtract the timestamp value from energyUsage
      // as we can assume that it has been turned off up until that point
    } else if (event.state === 'on') {
      i === profile.events.length - 1
        ? (energyUsage += MAX_IN_PERIOD - event.timestamp)
        : (energyUsage -= event.timestamp);
      // if the appliance is turned off we add the timestamp value to energyUsage
      // as we can assume that it has been turned on up until that point
    } else {
      energyUsage += event.timestamp;
    }
  }

  return energyUsage;
};

/**
 * PART 2
 *
 * You purchase an energy-saving device for your appliance in order
 * to cut back on its energy usage. The device is smart enough to shut
 * off the appliance after it detects some period of disuse, but you
 * can still switch on or off the appliance as needed.
 *
 * You are keen to find out if your shiny new device was a worthwhile
 * purchase. Its success is measured by calculating the amount of
 * energy *saved* by device.
 *
 * To assist you, you now have a new event type that indicates
 * when the appliance was switched off by the device (as opposed to switched
 * off manually). Your new states are:
 * * 'on'
 * * 'off' (manual switch off)
 * * 'auto-off' (device automatic switch off)
 *
 * (The `profile` structure is the same, except for the new possible
 * value for `initial` and `state`.)
 *
 * Write a function that calculates the *energy savings* due to the
 * periods of time when the device switched off your appliance. You
 * should not include energy saved due to manual switch offs.
 *
 * You will need to account for redundant/non-sensical events e.g.
 * an off event after an auto-off event, which should still count as
 * an energy savings because the original trigger was the device
 * and not manual intervention.
 */

const calculateEnergySavings = (profile) => {
  // if the event array is empty we return 0 or 1440
  // dependant on the appliances initial state
  if (profile.events.length === 0) {
    if (profile.initial === 'on' || profile.initial === 'off') {
      return 0;
    } else return MAX_IN_PERIOD;
  }

  // initialize saved energy at 0
  let savedEnergy = 0;

  for (let i = 0; i < profile.events.length; i++) {
    // initialize the current event for cleanliness' sake each loop
    let event = profile.events[i];

    // initialize the next event as the next object in the array
    let nextEvent = profile.events[i + 1];

    // if the event state is on we continue to the next loop iteration
    if (event.state === 'on') {
      continue;
      // if the appliance has turned itself off we proceed to check
      // how long it stays 'off'
    } else if (event.state === 'auto-off') {
      if (i === profile.events.length - 1) {
        savedEnergy += MAX_IN_PERIOD - event.timestamp;
      } else if (nextEvent.state === 'on') {
        savedEnergy += nextEvent.timestamp - event.timestamp;
      } else if (nextEvent.state === 'off') {
        let nextTimestamp = profile.events[i + 2]
          ? profile.events[i + 2].timestamp
          : 1440;
        savedEnergy += nextTimestamp - event.timestamp;
      }
    }
  }

  return savedEnergy;
};

/**
 * PART 3
 *
 * The process of producing metrics usually requires handling multiple days of data. The
 * examples so far have produced a calculation assuming the day starts at '0' for a single day.
 *
 * In this exercise, the timestamp field contains the number of minutes since a
 * arbitrary point in time (the "Epoch"). To simplify calculations, assume:
 *  - the Epoch starts at the beginning of the month (i.e. midnight on day 1 is timestamp 0)
 *  - our calendar simply has uniform length 'days' - the first day is '1' and the last day is '365'
 *  - the usage profile data will not extend more than one month
 *
 * Your function should calculate the energy usage over a particular day, given that
 * day's number. It will have access to the usage profile over the month.
 *
 * It should also throw an error if the day value is invalid i.e. if it is out of range
 * or not an integer. Specific error messages are expected - see the tests for details.
 *
 * (The `profile` structure is the same as part 1, but remember that timestamps now extend
 * over multiple days)
 *
 * HINT: You are encouraged to re-use `calculateEnergyUsageSimple` from PART 1 by
 * constructing a usage profile for that day by slicing up and rewriting up the usage profile you have
 * been given for the month.
 */

const isInteger = (number) => Number.isInteger(number);

const calculateEnergyUsageForDay = (monthUsageProfile, day) => {
  // initialize the last minute for a given day
  const lastMinuteOfDay = day * MAX_IN_PERIOD;

  // initialize the first minute for a given day
  const firstMinuteOfDay = (day - 1) * MAX_IN_PERIOD;

  // if the provided day is not an integer throw an error
  if (!isInteger(day)) {
    throw new Error('/must be an integer/');
  }

  // if the provided day is out of range throw an error
  if (day > 365 || day < 1) {
    throw new Error('/day out of range/');
  }

  // if the initial events array is empty return either 0 or 1440
  // dependant on the initial appliance state
  if (monthUsageProfile.events.length === 0) {
    if (monthUsageProfile.initial === 'on') {
      return MAX_IN_PERIOD;
    } else return 0;
  }

  // if the first minute of the provided day is greater than the
  // last event timestamp in the new events array return 1440
  if (firstMinuteOfDay > monthUsageProfile.events.at(-1).timestamp) {
    return MAX_IN_PERIOD;
  }

  const filteredEvents = monthUsageProfile.events.filter(
    (item) =>
      item.timestamp <= lastMinuteOfDay && item.timestamp >= firstMinuteOfDay
  );

  // if the filteredEvents array is empty return 0
  if (filteredEvents.length === 0) return 0;

  // initialize a new profile given the provided day
  const usageProfile = {
    initial: monthUsageProfile.initial,
    events: filteredEvents,
  };

  // if the new events array only contains 1 event push a new event object
  // to the end of the array timestamped at the last minute of the provided day
  if (usageProfile.events.length === 1) {
    usageProfile.events.push({ state: 'off', timestamp: lastMinuteOfDay });
  }

  // if the first event state is 'on' then add a new event object to the start
  // of the array timestamped at the first minute of the provided day
  if (usageProfile.events[0].state === 'on') {
    usageProfile.events.splice(0, 0, {
      state: 'off',
      timestamp: firstMinuteOfDay,
    });
  }

  return calculateEnergyUsageSimple(usageProfile);
};

module.exports = {
  calculateEnergyUsageSimple,
  calculateEnergySavings,
  calculateEnergyUsageForDay,
  MAX_IN_PERIOD,
};
