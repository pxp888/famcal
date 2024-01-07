from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

import os
import datetime
import pp

def say(*args):
	pp(args)


SCOPES = ["https://www.googleapis.com/auth/calendar.readonly","https://www.googleapis.com/auth/calendar.readonly"]
hideCalendars = ('Muslim Holidays','JOHN PERRINE')

def daysThisMonth():
	now = datetime.datetime.now()
	year = now.year
	month = now.month
	days = []
	for day in range(1, 32):
		try:
			d = datetime.datetime(year, month, day)
			days.append(d)
		except ValueError:
			break
	return days


def setCreds():
	creds = None
	# The file token.json stores the user's access and refresh tokens, and is
	# created automatically when the authorization flow completes for the first
	# time.
	if os.path.exists("token.json"):
		creds = Credentials.from_authorized_user_file("token.json", SCOPES)
	# If there are no (valid) credentials available, let the user log in.
	if not creds or not creds.valid:
		if creds and creds.expired and creds.refresh_token:
			creds.refresh(Request())
		else:
			flow = InstalledAppFlow.from_client_secrets_file(
			"credentials.json", SCOPES
			)
			creds = flow.run_local_server(port=0)
		# Save the credentials for the next run
		with open("token.json", "w") as token:
			token.write(creds.to_json())
	return creds


def getCalendars(creds):
	try:
		service = build("calendar", "v3", credentials=creds)
		calendars_result = service.calendarList().list().execute()

		calendars = calendars_result.get('items', [])

		if not calendars:
			print('No calendars found.')
			return None
		return calendars

	except HttpError as error:
		print(f"An error occurred: {error}")
		return None


def getEvents(creds, calendarId, results=10):
	try:
		service = build("calendar", "v3", credentials=creds)
		now = datetime.datetime.utcnow().isoformat() + "Z"  # 'Z' indicates UTC time
		events_result = (
			service.events()
			.list(
				calendarId=calendarId,
				timeMin=now,
				maxResults=results,
				singleEvents=True,
				orderBy="startTime",
			)
			.execute()
		)
		events = events_result.get("items", [])

		if not events:
			# print("No upcoming events found.")
			return None
		return events

	except HttpError as error:
		print(f"An error occurred: {error}")
		return None
