from gcal import * 
from flask import jsonify
import hashlib


class Logic:
    def __init__(self):
        self.creds = setCreds()
        self.calendars = []
        self.events = []
        self.fullevents = []
        self.hash = ''

        self.gsync()


    def gsync(self):
        self.calendars = getCalendars(self.creds)
        for cal in self.calendars:
            if cal['summary'] in hideCalendars: continue
            events = getEvents(self.creds, cal['id'], 10)
            if events:
                for event in events:
                    say(cal['summary'], event['summary'], event['start'].get("date"))
                    self.fullevents.append(event)
            else:
                say(cal['summary'], "No upcoming events found.")
                
        self.hash = hashlib.md5(str(self.fullevents).encode('utf-8')).hexdigest()


    def sync(self, data):
        print('synced')
        print(data)
        response_data = { 't': 'sync_ack',
                        'hash': self.hash 
                        }
        return jsonify(response_data)


    def get_events(self, data):
        print('get_events')
        print(data)

        response_data = { 't': 'get_events_ack',
                        'events': self.fullevents, 
                        'hash': self.hash
                        }
        return jsonify(response_data)


