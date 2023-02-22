'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2023-02-09T14:11:59.604Z',
    '2023-02-14T17:01:17.194Z',
    '2023-02-15T20:36:17.929Z',
    '2023-02-16T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// const account3 = {
//   owner: 'Steven Thomas Williams',
//   movements: [200, -200, 340, -300, -20, 50, 400, -460],
//   interestRate: 0.7,
//   pin: 3333,
// };

// const account4 = {
//   owner: 'Sarah Smith',
//   movements: [430, 1000, 700, 50, 90],
//   interestRate: 1,
//   pin: 4444,
// };

// const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//global scope vars//

const now = new Date();
const secondsToTimeOut = 60;
/// seven days time stamp
const sevenDaysMS = 7 * 24 * 60 * 60 * 1000;

let currentAccount, expireTime;

///////////////functions /////////////
//setting timer//
const setTimer = function (time) {
  let timerSec = time;
  if (expireTime) clearInterval(expireTime);
  expireTime = setInterval(
    () => {
      if (timerSec > 0) {
        --timerSec;
        labelTimer.textContent = `${Math.trunc(timerSec / 60)}:${String(
          timerSec % 60
        ).padStart(2, '0')}`;
      } else {
        logOut();
      }
    },
    1000,
    timerSec
  );
  return expireTime;
};

//logout//
const logOut = function () {
  labelWelcome.textContent = 'Login to get started';
  containerApp.style.opacity = 0;
  currentAccount = '';
  clearInterval(expireTime);
};

//converting dates to obj
const isoToDateObj = function (IsoStr) {
  return new Date(IsoStr);
};

/// generall formatting functions
const formatMoney = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const formatDate = function (date, locale) {
  return new Intl.DateTimeFormat(locale).format(date);
};

//global userName creator
const getUserName = function (accs) {
  accs.forEach(function (acc) {
    acc.userName = acc.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
};
getUserName(accounts);

//// calc balance and store in obj ////
const calcBalance = function (accs) {
  accs.forEach(
    acc => (acc.balance = acc.movements.reduce((acc, curr) => acc + curr, 0))
  );
};
calcBalance(accounts);

//Update UI function  section//

///// movements container ///
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  let displayDate;
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const movDate = isoToDateObj(acc.movementsDates[i]);

    if (now.getTime() - movDate.getTime() < sevenDaysMS) {
      if (now.getDate() === movDate.getDate()) displayDate = 'Today';
      else if (now.getDate() - movDate.getDate() === 1)
        displayDate = 'Yesterday';
      else displayDate = `${now.getDate() - movDate.getDate()} days ago`;
    } else displayDate = formatDate(movDate, acc.locale);

    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `<div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${
      sort ? 'Date not available when sorted' : displayDate
    }</div>
      <div class="movements__value">${formatMoney(
        mov,
        acc.locale,
        acc.currency
      )}</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

///// SUMMARY ////

const displayCalcSummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumIn.textContent = formatMoney(incomes, acc.locale, acc.currency);

  const outcomes = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumOut.textContent = formatMoney(
    Math.abs(outcomes),
    acc.locale,
    acc.currency
  );

  const interest = (incomes * acc.interestRate) / 100;
  labelSumInterest.textContent = formatMoney(
    interest,
    acc.locale,
    acc.currency
  );
};

//// Update UI ////

const updateUI = function (acc) {
  calcBalance(accounts);
  labelBalance.textContent = `${new Intl.NumberFormat(acc.locale, {
    style: 'currency',
    currency: acc.currency,
  }).format(acc.balance)}`;
  labelDate.textContent = `${new Intl.DateTimeFormat(acc.locale).format(now)}`;
  displayMovements(acc);
  displayCalcSummary(acc);
};

///////////////    LOGIN     //////////////////

//global eventhandler//
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  setTimer(secondsToTimeOut);
  currentAccount = accounts.find(
    acc => acc.userName === inputLoginUsername.value
  );
  inputLoginPin.blur();

  //AUTH
  if (currentAccount && currentAccount.pin === +inputLoginPin.value) {
    console.log('logged');
    //welcome label
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    } `;
    //change opacity
    containerApp.style.opacity = 100;
    //update UI (display balance,display movs, display summary)
    updateUI(currentAccount);

    ////////////// child event handlers ///////////////////

    btnTransfer.addEventListener('click', function (e) {
      e.preventDefault();
      setTimer(secondsToTimeOut);
      transfer(inputTransferTo.value, inputTransferAmount.value);
    });

    btnLoan.addEventListener('click', function (e) {
      e.preventDefault();
      setTimer(secondsToTimeOut);
      /// only possible to request a loan if there is any deposit at least of 10% of money requested.
      const reqLoan = Number(inputLoanAmount.value);

      if (currentAccount.movements.some(mov => reqLoan <= mov * 0.1)) {
        currentAccount.movements.push(reqLoan);
        currentAccount.movementsDates.push(now.toISOString());
        //fake time to process loan 2 seconds.
        setTimeout(updateUI, 2000, currentAccount);
        inputLoanAmount.value = '';
        inputLoanAmount.blur();
      } else alert('Max Loan amount exeeded\nMax loan amount = 10% of any deposit');
    });

    btnClose.addEventListener('click', function (e) {
      e.preventDefault();
      closeAcc();
      setTimer(secondsToTimeOut);
      inputCloseUsername.value = inputClosePin.value = '';
      inputClosePin.blur();
    });

    let isSorted = false;
    btnSort.addEventListener('click', function (e) {
      e.preventDefault();
      displayMovements(currentAccount, !isSorted);
      isSorted = !isSorted;
      setTimer(secondsToTimeOut);
    });
  } else console.log('error with credentials');
  inputLoginUsername.value = inputLoginPin.value = '';
});

/////////   LOGGED FUNCTIONALITY   ////////

const transfer = function (trfTo, amount) {
  const trfToAcc = accounts.find(acc => acc.userName === trfTo);
  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferAmount.blur();
  if (
    amount > 0 &&
    trfToAcc &&
    trfToAcc !== currentAccount &&
    currentAccount.balance >= amount
  ) {
    console.log('tranfer valid');
    currentAccount.movements.push(Number(-amount));
    currentAccount.movementsDates.push(now.toISOString());
    trfToAcc.movements.push(Number(amount));
    trfToAcc.movementsDates.push(now.toISOString());
    updateUI(currentAccount);
  } else console.log('trf not valid');
};

const closeAcc = function () {
  if (
    currentAccount.userName === inputCloseUsername.value &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
    const deleteIndex = accounts.findIndex(
      acc => acc.userName === currentAccount.userName
    );
    if (deleteIndex >= 0) {
      accounts.splice(deleteIndex, 1);
      console.log(`acc deleted`);
      logOut();
    }
  } else console.log('smth happend');
};
