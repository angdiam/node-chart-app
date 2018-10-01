let myHelpLbl = document.querySelector('#myHelpLabel');
console.log('ang1.js is run');
let gamma = 1;
console.log(`gamma: ${gamma}`);

let zeta = setInterval(function () {
  ++gamma
  myHelpLbl.innerHTML = gamma;
  console.log(gamma);
  console.log(myHelpLbl);
},1000);
