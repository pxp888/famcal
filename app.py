import os
from flask import Flask, render_template, request, flash, jsonify

if os.path.exists("env.py"):
	import env


import logic


funcs = {}

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY")


@app.route("/", methods=["GET", "POST"])
def index():
	# if request.method == "POST":
	# 	logging.info('FORM:', request.form)
	return render_template("index.html")


@app.route("/test", methods=["POST"])
def test():
	if request.method == "POST":
		data = request.get_json()['data']
		try:
			return funcs[data['t']](data)
		except KeyError:
			# logging.error("KeyError", data['t'])
			response_data = { "t": "dunno", "answer": "Hello, World!" }
			return jsonify(response_data)
		except Exception as e:
			# logging.error("Exception", e)
			response_data = { "t": "exception", "answer": e }
			return jsonify(response_data)


if __name__ == "__main__":
	mind = logic.Logic()
	funcs['sync'] = mind.sync
	funcs['get_events'] = mind.get_events

	app.run(
		host=os.environ.get("IP", "0.0.0.0"),
		port=int(os.environ.get("PORT", "5001")),
		debug=False)



