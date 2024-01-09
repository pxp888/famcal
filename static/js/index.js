const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const say = (...msgs) => console.log(...msgs);
const URL="/test";
const rfuncs = {};

const headerdate = document.getElementsByClassName('headerdate');

let hash = '';
let allDayEvents = [];
let timedEvents = [];

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


function hashStringToNumber(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        let char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;  // Convert to 32bit integer
    }
    return Math.abs(hash % 5) + 1;
}


function getCurrentWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return Math.ceil((day + start.getDay() + 1) / 7);
}


function set_display_date(now) {
    const weeknum = $('.weeknum').children('p')[0];
    const week = getCurrentWeekNumber();
    weeknum.innerHTML = 'Week ' + week;
    const day = days[now.getDay()];  // get the day name
    const date = now.getDate();
    const month = months[now.getMonth()];  // get the month name
    const dayelement = $('.headerdate').children('p')[0];
    const dateelement = $('.headerdate').children('p')[1];
    dayelement.innerHTML = `${day}`;
    dateelement.innerHTML = `${month} ${date}`;

    const update = $('.headerupdate')[0];
    update.innerHTML = `Last updated: ${now.getHours()}:${now.getMinutes()}`;
    update.style.color = 'gray';
}


function check_events(events, now) {
    allDayEvents = [];
    timedEvents = [];
    for (let i=0; i<events.length; i++) {
        ev = events[i];
        if ('date' in ev['start']){
            start = new Date(ev['start']['date']);
            end = new Date(ev['end']['date']);
            if (now >= start && now <= end) {
                allDayEvents.push(ev);
            }
        }
        if ('dateTime' in ev['start']) {
            start = new Date(ev['start']['dateTime']);
            end = new Date(ev['end']['dateTime']);
            if (start.getDate() == now.getDate()) {
                timedEvents.push(ev);
            }
        }
    }
}


function show_event(ev) {
    const entry = document.createElement('div');
    entry.classList.add('entry');

    const info = document.createElement('div');
    info.classList.add('info');
    entry.appendChild(info);

    const summary = document.createElement('p');
    summary.classList.add('summary');
    summary.innerHTML = ev['summary'];
    info.appendChild(summary);

    const calendar = document.createElement('p');
    calendar.classList.add('calendar');
    calendar.innerHTML = ev['calname'];
    info.appendChild(calendar);

    const start = document.createElement('p');
    start.classList.add('start');
    start.innerHTML = ev['start']['date'];
    info.appendChild(start);

    const end = document.createElement('p');
    end.classList.add('end');
    end.innerHTML = ev['end']['date'];
    info.appendChild(end);

    if ('dateTime' in ev['start']) {
        let starttime = new Date(ev['start']['dateTime']);
        let endtime = new Date(ev['end']['dateTime']);
        let startMinutes = String(starttime.getMinutes()).padStart(2, '0');  // ensure two digits
        let endMinutes = String(endtime.getMinutes()).padStart(2, '0');  // ensure two digits
        start.innerHTML = `${starttime.getHours()}:${startMinutes}`;
        end.innerHTML = `${endtime.getHours()}:${endMinutes}`;
    }
    else {
        color = hashStringToNumber(ev['calname']);
        summary.style.color = `var(--calcol${color})`;
        say(color);
    }

    $('.outarea')[0].appendChild(entry);
    return entry;
}


function show_timed_event(ev) {
    let entry = show_event(ev);
    const timebar = document.createElement('div');
    timebar.classList.add('timebar');
    entry.appendChild(timebar);

    const outarea = $('.outarea')[0];
    const outwidth = outarea.offsetWidth;
    let start = new Date(ev['start']['dateTime']);
    let end = new Date(ev['end']['dateTime']);
    let starttime = start.getHours() + start.getMinutes()/60;
    let endtime = end.getHours() + end.getMinutes()/60;
    
    let left = (starttime*100/24);
    timebar.style.left = `${left}%`;

    width = (endtime - starttime)/24 * outwidth;
    timebar.style.width = `${width}px`;

    color = hashStringToNumber(ev['calname']);
    timebar.style.backgroundColor = `var(--calcol${color})`;
    say(color);
}


async function sync() {
    const m = { 't': 'sync' };
    sendmsg(m);
}


async function sync_ack(data) {
    if (data['hash'] != hash) {
        const m = { 't': 'get_events' };
        sendmsg(m);
    }
}


async function get_events(data) {
    const events = data['events']
    hash = data['hash'];

    let ev, start, end, now;
    now = new Date();
    check_events(events, now)

    if (timedEvents.length == 0) {
        now.setDate(now.getDate() + 1);
        check_events(events, now);
    }

    set_display_date(now);

    for (let i=0; i<allDayEvents.length; i++) {
        ev = allDayEvents[i];
        show_event(ev);
    }

    for (let i=0; i<timedEvents.length; i++) {
        ev = timedEvents[i];
        show_timed_event(ev);
    }
}


rfuncs['sync_ack'] = sync_ack;
rfuncs['get_events_ack'] = get_events;

sync();

