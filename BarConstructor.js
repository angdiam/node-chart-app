// ***** MULTI TIMEFRAME BAR CREATOR  (feed = tickdata or 1m bars) (default 1M, customM, H, D) *****
//*** Used to Test  BarDetector() *** Start
//BAR FORMAT TIMESTAMP-UNIX, OPEN, HIGH, LOW, CLOSE, VOLUME, TIMESTAMP-STRING
/* Description
   Provide
   Genesis Bar  'currentBar'
   Set up all Timeframes first Bar
   All TimeFrames us the convention that the TimeStamp denotes the end and closing of the Bar. Therefore 23:55 Bar ia the one that starts at 23:50 and ends at 23:55 exclusive (23:54:59)
   if Tick timestamp reads 23:50 then this triggers the creation of a new 5min bar with timestamp 23:55
   if Tick timestamp reads 2018/09/27 00:00 then this triggers the creation of a new 5min bar with timestamp 00:05:00, hourly bar 01:00:00 and Day Bar  2018/09/28 00:00:00
   In this way the timestamp of each bar is the closing time of the bar
   Set up Mechanism to create new Tick Bar Feed
   Set customM if needed e.g. 5 for 5mins
   Use objects currentBar, Bar_1M, Bar_customM, Bar_H, Bar_D to store latest BarValues for each timeframe.
   Arrays feedData=[], Bar_1M_TS=[], Bar_customM_TS=[], Bar_H_TS=[], Bar_D_TS=[]; are fed the live respective bar values for each timeframe and once
         the bar closes a new bar is added using the feedTick Data
*/

//get random number
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

let TickStamp = moment({hours:'23', minutes:'50', seconds:'0'}), oldTickStamp, lastPrice, Spread=0.02;
let counter=0, customMINs=5, TimeSeries_String='';    //Bar_1M_TS_String='', Bar_customM_TS_String='', Bar_H_TS_String='', Bar_D_TS_String='';
console.log(`START TIME: ${TickStamp.valueOf()} ${TickStamp.format('DD/MM/YY HH:mm:ss')}  CustomMINs: ${customMINs} mins`);

//*** currentBar is GENESIS BAR , IS THE FIRST NEW TICK AFTER THE COMPLETION OF HISTORICAL BARS
let _currentBar={ //[timestamp,open,high,low,close]  [timestamp,bidSize,bidPrice,asPrice,askSize]
    timestamp: TickStamp.valueOf(),
    open: 100,
    high: 102,
    low:  99,
    close: 101,
    volume: 10,
    timestampStr: TickStamp.format('DD/MM/YY HH:mm:ss')
};
let feedData=[], _Bar_1M_TS=[], _Bar_customM_TS=[], _Bar_H_TS=[], _Bar_D_TS=[];
let genesis_String = `genesis Bar: Timestamp: ${_currentBar.timestamp} Open: ${_currentBar.open} High: ${_currentBar.high} Low: ${_currentBar.low} Close: ${_currentBar.close} Volume: ${_currentBar.volume}`;
feedData.push([_currentBar.timestamp,_currentBar.open,_currentBar.high,_currentBar.low,_currentBar.close,_currentBar.volume,_currentBar.timestampStr]);

//*** INITIAL BAR SETUP
//initialize 1 min Bar
let _Bar_1M_timestamp = TickStamp.clone().add(1,'minutes').seconds(0);
let Bar_1M = {
  timestamp: _Bar_1M_timestamp.valueOf(),
  open: _currentBar.open,
  high: _currentBar.high,
  low: _currentBar.low,
  close: _currentBar.close,
  volume: _currentBar.volume,
  timestampStr: _Bar_1M_timestamp.format('DD/MM/YY HH:mm:ss')
};
_Bar_1M_TS.push([Bar_1M.timestamp,Bar_1M.open,Bar_1M.high,Bar_1M.low,Bar_1M.close,Bar_1M.volume,Bar_1M.timestampStr]);

//initialize 5 min custom Bar
let _Bar_customM_timestamp = TickStamp.clone().add(customMINs,'minutes').seconds(0);
let Bar_customM = {
  timestamp: _Bar_customM_timestamp.valueOf(),
  open: _currentBar.open,
  high: _currentBar.high,
  low: _currentBar.low,
  close: _currentBar.close,
  volume: _currentBar.volume,
  timestampStr: _Bar_customM_timestamp.format('DD/MM/YY HH:mm:ss')
};
_Bar_customM_TS.push([Bar_customM.timestamp,Bar_customM.open,Bar_customM.high,Bar_customM.low,Bar_customM.close,Bar_customM.volume,Bar_customM.timestampStr]);

//initialize Hour Bar
let _Bar_1H_timestamp = TickStamp.clone().add(1,'hours').minutes(0).seconds(0);
let Bar_H = {
  timestamp: _Bar_1H_timestamp.valueOf(),
  open: _currentBar.open,
  high: _currentBar.high,
  low: _currentBar.low,
  close: _currentBar.close,
  volume: _currentBar.volume,
  timestampStr: _Bar_1H_timestamp.format('DD/MM/YY HH:mm:ss'),
};
_Bar_H_TS.push([Bar_H.timestamp,Bar_H.open,Bar_H.high,Bar_H.low,Bar_H.close,Bar_H.volume,Bar_H.timestampStr]);

//initialize Day Bar
let _Bar_1Day_timestamp = TickStamp.clone().add(1,'Days').hour(0).minutes(0).seconds(0);
let Bar_D = {
  timestamp: _Bar_1Day_timestamp.valueOf(),
  open: _currentBar.open,
  high: _currentBar.high,
  low: _currentBar.low,
  close: _currentBar.close,
  volume: _currentBar.volume,
  timestampStr: _Bar_1Day_timestamp.format('DD/MM/YY HH:mm:ss'),
};
_Bar_D_TS.push([Bar_D.timestamp,Bar_D.open,Bar_D.high,Bar_D.low,Bar_D.close,Bar_D.volume,Bar_D.timestampStr]);


// *** START INTERVAL TO PRODUCE SIM LIVE DATA
let startSimulator = function () {
    let momentIntervalID = setInterval( function () {

          //Mechanism to create new Bar -- START          //[open,high,low,close]  [bidSize,bidPrice,asPrice,askSize]
          oldTickStamp = TickStamp.clone();
          TickStamp.add(1,'minutes');                    //create next Tick timestamp   if you chnage minutes to seconds here then also change call of BarDetector

          const percChange = getRandom(-1,1) / 100 ;
          _currentBar.high = Math.round( (_currentBar.high * (1 + percChange)) * 100 ) / 100;
          lastPrice = _currentBar.high;
          _currentBar.low = Math.round( (lastPrice * (1 - Spread)) * 100 ) / 100;
          _currentBar.open = Math.round(getRandom(_currentBar.low,_currentBar.high) * 100) / 100;
          _currentBar.close = Math.round(getRandom(_currentBar.low,_currentBar.high) * 100) / 100;
          _currentBar.volume = parseInt(getRandom(1,100));
          _currentBar.timestamp = TickStamp.valueOf();
          _currentBar.timestampStr = TickStamp.format('DD/MM/YY HH:mm:ss');
          feedData.push([_currentBar.timestamp,_currentBar.open,_currentBar.high,_currentBar.low,_currentBar.close,_currentBar.volume,_currentBar.timestampStr]);
          //Mechanism to create new Bar -- END

          BarDetector('minutes',oldTickStamp,TickStamp,customMINs,_currentBar,_Bar_1M_TS,_Bar_customM_TS,_Bar_H_TS,_Bar_D_TS);

          //Debugging START creating a big string for checking on Excel and debugging
          let FED = feedData.length, _1M = _Bar_1M_TS.length, _5M = _Bar_customM_TS.length, _H = _Bar_H_TS.length, _D = _Bar_D_TS.length;
          let counterString = `counter: ${counter} `;
          let feedData_String = `Length: ${FED} ${feedData[FED-1][0]} ${feedData[FED-1][1]} ${feedData[FED-1][2]} ${feedData[FED-1][3]} ${feedData[FED-1][4]} ${feedData[FED-1][5]} ${feedData[FED-1][6]} `;
          let Bar_1M_TS_String = `Length: ${_1M} ${_Bar_1M_TS[_1M-1][0]} ${_Bar_1M_TS[_1M-1][1]} ${_Bar_1M_TS[_1M-1][2]} ${_Bar_1M_TS[_1M-1][3]} ${_Bar_1M_TS[_1M-1][4]} ${_Bar_1M_TS[_1M-1][5]} ${_Bar_1M_TS[_1M-1][6]} `;
          let Bar_customM_TS_String = `Length: ${_5M} ${_Bar_customM_TS[_5M-1][0]} ${_Bar_customM_TS[_5M-1][1]} ${_Bar_customM_TS[_5M-1][2]} ${_Bar_customM_TS[_5M-1][3]} ${_Bar_customM_TS[_5M-1][4]} ${_Bar_customM_TS[_5M-1][5]} ${_Bar_customM_TS[_5M-1][6]} `;
          let Bar_H_TS_String = `Length: ${_H} ${_Bar_H_TS[_H-1][0]} ${_Bar_H_TS[_H-1][1]} ${_Bar_H_TS[_H-1][2]} ${_Bar_H_TS[_H-1][3]} ${_Bar_H_TS[_H-1][4]} ${_Bar_H_TS[_H-1][5]} ${_Bar_H_TS[_H-1][6]} `;
          let Bar_D_TS_String = `Length: ${_D} ${_Bar_D_TS[_D-1][0]} ${_Bar_D_TS[_D-1][1]} ${_Bar_D_TS[_D-1][2]} ${_Bar_D_TS[_D-1][3]} ${_Bar_D_TS[_D-1][4]} ${_Bar_D_TS[_D-1][5]} ${_Bar_D_TS[_D-1][6]} `;
          TimeSeries_String += `${counterString} ${feedData_String} ${Bar_1M_TS_String} ${Bar_customM_TS_String} ${Bar_H_TS_String} ${Bar_D_TS_String} \n`;
          console.log(`${counterString} ${feedData_String} ${Bar_1M_TS_String} ${Bar_customM_TS_String} ${Bar_H_TS_String} ${Bar_D_TS_String}`);
          //Debugging END

          if (++counter > 250) {
            clearInterval(momentIntervalID);
            console.log(`Interval will stop now!  genesis_String: ${genesis_String}`);
            console.log('TimeSeries_String :');
            console.log(TimeSeries_String);
          }

    },1000);
};
// startSimulator();
//*** Used to Test  BarDetector() *** End



//TODO CHECK EVERYTHING WHEN FEEDING TICK DATA
//IMPORTANT YOU CAN FEED THE BARDETECTOR WITH TICK/SECOND TIMESTAMPS OR 1 MINUTE TIMESTAMPS SO THAT IT CAN EVALUATE ORRECTLY 1-M, CUSTOM-M, HOUR, DAY BARS
let isThisNewBarMinute = false, isThisNewBarMinute_Lag1 = false;
let isThisNewBarHour = false, isThisNewBarHour_Lag1 = false;
let isThisNewBarDay = false, isThisNewBarDay_Lag1 = false;
let NewBar_MIN=false, NewBar_HOUR=false, NewBar_DAY=false, NewBar_customMIN=false;

const BarDetector = function (feedResolution = 'minutes',referenceBarTimeStamp,currentBarTimeStamp,customMINs,bar,Bar_1M_TS,Bar_customM_TS,Bar_H_TS,Bar_D_TS) {

  console.log(`------- Reference Bar: ${referenceBarTimeStamp.format()}  Current Bar: ${currentBarTimeStamp.format()} -----`);
  //setting up bar-update-filter booleans
  isThisNewBarMinute_Lag1 = isThisNewBarMinute;
  isThisNewBarHour_Lag1 = isThisNewBarHour;
  isThisNewBarDay_Lag1 = isThisNewBarDay;

  if (currentBarTimeStamp.days() !== referenceBarTimeStamp.days()) {
    isThisNewBarMinute = true;
    isThisNewBarHour = true;
    isThisNewBarDay = true;
  } else if (currentBarTimeStamp.hours() !== referenceBarTimeStamp.hours()) {
    isThisNewBarMinute = true;
    isThisNewBarHour = true;
    isThisNewBarDay = false;
  } else if (currentBarTimeStamp.minutes() !== referenceBarTimeStamp.minutes()) {
    isThisNewBarMinute = true;
    isThisNewBarHour = false;
    isThisNewBarDay = false;
  } else {
    isThisNewBarMinute = false;
    isThisNewBarHour = false;
    isThisNewBarDay = false;
  }

  //1-Minute BAR
  const barDetectResolcondition_A = (feedResolution === 'seconds' && isThisNewBarMinute && !isThisNewBarMinute_Lag1);  //tick or second resolution
  const barDetectResolcondition_B = (feedResolution === 'minutes' && isThisNewBarMinute);                              //minute resolution
  if ( barDetectResolcondition_A || barDetectResolcondition_B ) {
      NewBar_MIN = true;
      const Bar_1M_timestamp = currentBarTimeStamp.clone().add(1,'minutes').seconds(0);
      console.log(`* NEW bar-MINUTE BAR HAS STARTED ${Bar_1M_timestamp.format()}`);

      Bar_1M.timestamp = Bar_1M_timestamp.valueOf();
      Bar_1M.open = bar.open;
      Bar_1M.high = bar.high;
      Bar_1M.low = bar.low;
      Bar_1M.close = bar.close;
      Bar_1M.volume = bar.volume;
      Bar_1M.timestampStr = Bar_1M_timestamp.format('DD/MM/YY HH:mm:ss');
      Bar_1M_TS.push([Bar_1M.timestamp,Bar_1M.open,Bar_1M.high,Bar_1M.low,Bar_1M.close,Bar_1M.volume,Bar_1M.timestampStr]);

      if (customMINs) {
          if (currentBarTimeStamp.minutes() % customMINs === 0) {
            NewBar_customMIN = true;
            const Bar_customM_timestamp = currentBarTimeStamp.clone().add(customMINs,'minutes').seconds(0);
            console.log(`#NEW bar-${customMINs}-MINUTE BAR HAS STARTED ${Bar_customM_timestamp.format()}`);

            Bar_customM.timestamp = Bar_customM_timestamp.valueOf();
            Bar_customM.open = bar.open;
            Bar_customM.high = bar.high;
            Bar_customM.low = bar.low;
            Bar_customM.close = bar.close;
            Bar_customM.volume = bar.volume;
            Bar_customM.timestampStr = Bar_customM_timestamp.format('DD/MM/YY HH:mm:ss');
            Bar_customM_TS.push([Bar_customM.timestamp,Bar_customM.open,Bar_customM.high,Bar_customM.low,Bar_customM.close,Bar_customM.volume,Bar_customM.timestampStr]);
          } else {
            NewBar_customMIN = false;
            if (bar.high > Bar_customM.high) {Bar_customM.high = bar.high};
            if (bar.low < Bar_customM.low) {Bar_customM.low = bar.low}
            Bar_customM.close = bar.close;
            Bar_customM.volume += bar.volume;

            let Last_CM = Bar_customM_TS.length-1;
            Bar_customM_TS[Last_CM] [2] = Bar_customM.high;
            Bar_customM_TS[Last_CM] [3] = Bar_customM.low;
            Bar_customM_TS[Last_CM] [4] = Bar_customM.close;
            Bar_customM_TS[Last_CM] [5] = Bar_customM.volume;
          }
      }
  } else {    //this case only really runs if feed data are Ticks instead of 1min bars
    NewBar_MIN = false;
    NewBar_customMIN = false;
    if (bar.high > Bar_1M.high) {Bar_1M.high = bar.high};
    if (bar.low < Bar_1M.low) {Bar_1M.low = bar.low}
    Bar_1M.close = bar.close;
    Bar_1M.volume += bar.volume;

    let Last_1M = Bar_1M_TS.length-1;
    Bar_1M_TS[Last_1M] [2] = Bar_1M.high;
    Bar_1M_TS[Last_1M] [3] = Bar_1M.low;
    Bar_1M_TS[Last_1M] [4] = Bar_1M.close;
    Bar_1M_TS[Last_1M] [5] = Bar_1M.volume;


    if (customMINs) {
      if (bar.high > Bar_customM.high) {Bar_customM.high = bar.high};
      if (bar.low < Bar_customM.low) {Bar_customM.low = bar.low}
      Bar_customM.close = bar.close;
      Bar_customM.volume += bar.volume;

      let Last_CM = Bar_customM_TS.length-1;
      Bar_customM_TS[Last_CM] [2] = Bar_customM.high;
      Bar_customM_TS[Last_CM] [3] = Bar_customM.low;
      Bar_customM_TS[Last_CM] [4] = Bar_customM.close;
      Bar_customM_TS[Last_CM] [5] = Bar_customM.volume;
    }

  };


  //1-Hour BAR
  if (isThisNewBarHour && !isThisNewBarHour_Lag1) {
    NewBar_HOUR=true;
    const Bar_1H_timestamp = currentBarTimeStamp.clone().add(1,'hours').minutes(0).seconds(0);
    console.log(`***** NEW bar-HOUR BAR HAS STARTED ${Bar_1H_timestamp.format()}`);

    Bar_H.timestamp = Bar_1H_timestamp.valueOf();
    Bar_H.open = bar.open;
    Bar_H.high = bar.high;
    Bar_H.low = bar.low;
    Bar_H.close = bar.close;
    Bar_H.volume = bar.volume;
    Bar_H.timestampStr = Bar_1H_timestamp.format('DD/MM/YY HH:mm:ss');
    Bar_H_TS.push([Bar_H.timestamp,Bar_H.open,Bar_H.high,Bar_H.low,Bar_H.close,Bar_H.volume,Bar_H.timestampStr]);
  } else {
    NewBar_HOUR=false;
    if (bar.high > Bar_H.high) {Bar_H.high = bar.high};
    if (bar.low < Bar_H.low) {Bar_H.low = bar.low}
    Bar_H.close = bar.close;
    Bar_H.volume += bar.volume;

    let Last_H = Bar_H_TS.length-1;
    Bar_H_TS[Last_H] [2] = Bar_H.high;
    Bar_H_TS[Last_H] [3] = Bar_H.low;
    Bar_H_TS[Last_H] [4] = Bar_H.close;
    Bar_H_TS[Last_H] [5] = Bar_H.volume;
  };

  //1-Day BAR
  if (isThisNewBarDay && !isThisNewBarDay_Lag1) {
    NewBar_DAY=true;
    const Bar_1Day_timestamp = currentBarTimeStamp.clone().add(1,'Days').hour(0).minutes(0).seconds(0);
    console.log(`********** NEW bar-DAY BAR HAS STARTED ${Bar_1Day_timestamp.format()}`);

    Bar_D.timestamp = Bar_1Day_timestamp.valueOf();
    Bar_D.open = bar.open;
    Bar_D.high = bar.high;
    Bar_D.low = bar.low;
    Bar_D.close = bar.close;
    Bar_D.volume = bar.volume;
    Bar_D.timestampStr = Bar_1Day_timestamp.format('DD/MM/YY HH:mm:ss');
    Bar_D_TS.push([Bar_D.timestamp,Bar_D.open,Bar_D.high,Bar_D.low,Bar_D.close,Bar_D.volume,Bar_D.timestampStr]);
  } else {
    NewBar_DAY=false;
    if (bar.high > Bar_D.high) {Bar_D.high = bar.high};
    if (bar.low < Bar_D.low) {Bar_D.low = bar.low}
    Bar_D.close = bar.close;
    Bar_D.volume += bar.volume;

    let Last_D = Bar_D_TS.length-1;
    Bar_D_TS[Last_D] [2] = Bar_D.high;
    Bar_D_TS[Last_D] [3] = Bar_D.low;
    Bar_D_TS[Last_D] [4] = Bar_D.close;
    Bar_D_TS[Last_D] [5] = Bar_D.volume;
  };

};
