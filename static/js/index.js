const say = (...msgs) => console.log(...msgs);
const URL="/test";
const rfuncs = {};


let hash = ''; 

const headerdate = document.getElementsByClassName('headerdate');


async function sendmsg(data) {
	const response = fetch('/test', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ data })
	})
	.then(response => response.json())
	.then(data => getmsg(data))
	.catch(error => console.error('Error sending data:', error));
}


function getmsg(data) {
	if (data['t'] in rfuncs) {
		rfuncs[data['t']](data);
	}
	else { say('no js handler for ' + data['t']); }
}


function getCurrentWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return Math.ceil((day + start.getDay() + 1) / 7);
}


const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


async function sync() {
    const weeknum = $('.weeknum').children('p')[0];
    const week = getCurrentWeekNumber();
    weeknum.innerHTML = 'Week ' + week;

    const now = new Date();
    const day = days[now.getDay()];  // get the day name
    const date = now.getDate();
    const month = months[now.getMonth()];  // get the month name
    const dayelement = $('.headerdate').children('p')[0];
    const dateelement = $('.headerdate').children('p')[1];
    dayelement.innerHTML = `${day}`;
    dateelement.innerHTML = `${month} ${date}`;

    const m = { 't': 'sync' };
    sendmsg(m);
}


async function test(data) {
    say(data);
    if (data['hash'] != hash) {
        const m = { 't': 'get_events' };
        sendmsg(m);
    }
}


async function get_events(data) {
    say(data);
    const events = data['events']
    hash = data['hash'];
    
    let ev;
    for (let i=0; i<events.length; i++) {
        ev = events[i];
        if ('date' in ev['start']){
            say(ev['start']['date']);
        }
        
    }
}



rfuncs['sync_ack'] = test;
rfuncs['get_events_ack'] = get_events;

sync();

