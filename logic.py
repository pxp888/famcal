from gcal import * 
from flask import jsonify
import hashlib
import time 
import threading 


class Logic:
    def __init__(self):
        self.creds = setCreds()
        self.calendars = []
        self.events = []
        self.fullevents = []
        self.hash = ''

        self.lock = threading.Lock()
        self.thread = threading.Thread(target=self.sync_thread)
        self.thread.start()


    def sync_thread(self):
        while True:
            self.gsync()
            time.sleep(600)


    def gsync(self):
        fullevents = []
        calendars = getCalendars(self.creds)
        for cal in calendars:
            if cal['summary'] in hideCalendars: continue
            events = getEvents(self.creds, cal['id'], 10)
            if events:
                for i in events:
                    i['calname'] = cal['summary']
                for event in events:
                    say(cal['summary'], event['summary'], event['start'].get("date"))
                    fullevents.append(event)
            else:
                say(cal['summary'], "No upcoming events found.")
                
        hash = hashlib.md5(str(fullevents).encode('utf-8')).hexdigest()

        self.lock.acquire()
        self.calendars = calendars
        self.fullevents = fullevents
        self.hash = hash
        self.lock.release()


    def sync(self, data):
        self.lock.acquire()
        response_data = { 't': 'sync_ack',
                        'hash': self.hash 
                        }
        self.lock.release()
        return jsonify(response_data)


    def get_events(self, data):
        self.lock.acquire()
        response_data = { 't': 'get_events_ack',
                        'events': self.fullevents, 
                        'hash': self.hash
                        }
        self.lock.release()
        return jsonify(response_data)

