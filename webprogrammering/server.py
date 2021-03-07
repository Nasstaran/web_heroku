# //Server.py//
from flask import Flask, request, jsonify
from geventwebsocket.handler import WebSocketHandler
from gevent.pywsgi import WSGIServer
from gevent import pywsgi
from smtplib import SMTP
import database_helper
import json
import string
import os
import smtplib
import random
import secrets
import re


app = Flask(__name__, static_url_path="")
app.debug = True

online_users = {}


@app.route('/')
def twidder():
    return app.send_static_file('client.html')
#@app.teardown_request
#def after_request(exception):
#    database_helper.disconnect_db()

@app.route('/api')
def api():
    global online_users
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        message = json.loads(ws.receive())
        token = message["token"]
        user = database_helper.get_user_by_token(token)
        email = user['email']
        online_users[email] = ws

        try:
            while True:
                listener = ws.receive()
        except Exception:
            pass

    return ""

def generate_new_password():
    password = ''.join((secrets.choice(string.ascii_lowercase + string.digits) for i in range(8)))
    print("new_password", password)
    return password

@app.route('/passwordrecovery', methods = ['POST'])
def password_recovery():
    data = request.get_json()
    user = database_helper.get_user_all(data['email'])
    print("recovery email:",user)
    if user['success']:
        new_password = generate_new_password();
        database_helper.change_password(data['email'], new_password)
        if send_email(data['email'], new_password):
            return json.dumps({"success": True, "message": "New Password sent."})
        json.dumps({"success": False, "message": "Wrong email."})



def send_email(email,new_p):
    print("passwordrecovery")
    try:
        message = "\r\n".join([
        "From: twidder_support@gmail.com",
        "To: "+ email,
        "Subject: Your new Twidder password",
        "",
        "you new password is : "+ new_p
        ])
        server = smtplib.SMTP('64.233.184.108', 587)#måste vara port 587
        server.ehlo()
        server.starttls()
        server.login("s3holic@gmail.com", "smptserverpassword123willchangeafter")
        server.sendmail("s3holic@gmail.com", email, message)
        server.close()
        return True
    except Exception as e:
        print(str(e))
        return False

#alternatively create a new viev where the user can insert their new password

@app.route('/signin', methods = ['POST'])
def sign_in():
    global online_users
    data = request.get_json()
    user = database_helper.get_user_all(data["email"])
    print("user_all", user)
    if user['success']:
        email = user["email"]
        if email in online_users:
            print("online_users: ", online_users)
            socket = online_users[email]
            print("seinding a message Ddsknf")
            socket.send(json.dumps({"message": "already logged in"}))
            socket.close()
            del online_users[email]


        if user['password'] == data['password']:
            token = secrets.token_hex(36)
            database_helper.save_token(token, data["email"])
            return jsonify({"success": True, "message": "Successfully signed in.", "data": token})
        else:
            return jsonify({"success": False, "message": "Wrong password or email."})
    else:
         return jsonify({"success": False, "message": "This user does not exist or Wrong password or email"})

@app.route('/signup', methods = ['POST'])
def sign_up():
    data = request.get_json()
    user = database_helper.get_user_without_pass(data["email"])
    if user['success']:
        return jsonify({"success": False, "message": "Email is already in use!"})

    if validate_signup(data):
         database_helper.add_user(data)
         return jsonify({"success": True, "message": "Successfully created a new user."})
    else:
        return jsonify({"success": False, "message": "Form data missing or incorrect type."})


@app.route('/signout', methods = ['POST'])
def sign_out():
    global online_users
    token = request.headers.get("token")
    user = database_helper.get_user_by_token(token)
    if database_helper.delete_token(token):
        return jsonify({"success": True, "message": "Successfully signed out."})
    else:
        return jsonify({"success": False, "message": "You are not signed in."})


def validate_signup(data):
    regex = '^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$'
    if not re.search(regex, data["email"]):
        return False
    if len(data["password"]) < 6:
        return False
    if data["repeatPSW"] != data["password"]:
        return False
    if (data["firstname"] and data["lastname"] and data["gender"] and data["city"] and data["country"]):
        return True
    else:
        return False
    return True


@app.route('/changepassword', methods = ['PUT'])
def change_password():
    data = request.get_json()
    token = request.headers.get("token")
    user = database_helper.get_user_by_token(token)
    if database_helper.signed_in(token):
        if len(data["newPassword"]) < 6:
            return jsonify({"success": False, "message": "Password too short."})
        if data["oldPassword"] != user["password"]:
                return jsonify({"success": False, "message": "wrong user password"})
        if data["newPassword"] == user["password"]:
                return jsonify({"success": False, "message": "wrong, the same password"})
        if data["newPassword"] != data["confPassword"]:
            return jsonify({"success": False, "message": "Passwords don't match."})
        if database_helper.change_password(user["email"], data["newPassword"]):
            return jsonify({"success": True, "message": "Password changed."})
        else:
            return jsonify({"success": False, "message": "Something went wrong."})
    else:
        return jsonify({"success": False, "message": "You are not logged in."})


@app.route('/getuserdatabytoken', methods = ['GET'])
def get_user_data_by_token():
    token = request.headers.get("token") #request.headers behaves like a dictionary, so you can also get your header like you would with any dictionary
    data = []
    data = database_helper.get_user_by_token(token)
    if data is not None:
         return jsonify({"success": True, "message": "User data revieved.", "data": data})
    else:
          return jsonify({"success": False, "message": "User not found.", "data": data})

@app.route('/getuserdatabyemail/<email>', methods = ['GET'])
def get_user_data_by_email(email):
    token = request.headers.get("token")
    if database_helper.signed_in(token):
        data = database_helper.get_user_without_pass(email)
        if data:
             return jsonify({"success": True, "message": "User data revieved.", "data": data})
        else:
              return jsonify({"success": False, "message": "User not found.", "data": data})
    else:
        return jsonify({"success": False, "message": "You are not signed in."})


@app.route('/getusermessagesbytoken', methods = ['GET'])
def get_user_messages_by_token():
    token = request.headers.get("token")
    if database_helper.signed_in(token):
        user = database_helper.get_user_by_token(token)
        messages = database_helper.get_messsagesWall(user["email"])
        if messages is not None:
            return jsonify({"success": True, "message": "User messages recieved.", "data": messages})
        else:
            return jsonify({"success": False, "message": "User not found or no message."})
    else:
        return jsonify({"success": False, "message": "You are not signed in."})



@app.route('/getusermessagesbyemail/<email>', methods = ['GET'])
def get_user_messages_by_email(email):
    token = request.headers.get("token")
    if database_helper.signed_in(token):
        messages = database_helper.get_messsagesWall(email)
        if messages != None:
            return jsonify({"success": True, "message": "User messages recieved.", "data": messages})
        else:
            return jsonify({"success": False, "message": "No such user or no messages posted to the user."})
    else:
        return jsonify({"success": False, "message": "You are not signed in."})


@app.route('/postmessage', methods = ['POST'])
def post_message():
    data = request.get_json()
    token = request.headers.get("token")

    if database_helper.signed_in(token):
        user = database_helper.get_user_by_token(token)
        print("to email: ", data["toEmail"])
        print("from email: ", user["email"])
        print("content: ", data["content"])
        if data["toEmail"] is None:
            data["toEmail"] = user["email"]
        if user["email"] is not None:
            if database_helper.update_messsagesWall(user["email"], data["toEmail"], data["content"]):
                return jsonify({"success": True, "message": "Message sent."})
            else:
                return jsonify({"success": False, "message": "Server error."})
        else:
            return jsonify({"success": False, "message": "Wrong input."})
    else:
        return jsonify({"success": False, "message": "You are not signed in."})


if __name__ == '__main__':
    http_server = WSGIServer(('127.0.0.1', 5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()
