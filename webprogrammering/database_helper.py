# //server_helper.py//
import sqlite3
from flask import g

DATABASE_URI = 'database.db'

def get_db():
    db = getattr(g,'db', None)
    if db is None:
        db = g.db = sqlite3.connect(DATABASE_URI)
    return db

def disconnect_db():
    db = getattr(g,'db', None)
    if db is not None:
        g.db.close()
        g.db = None

def add_user(user):
    try:
        get_db().execute("insert into users values(?,?,?,?,?,?,?)" , [user["email"], user["password"], user["firstname"], user["lastname"], user["gender"], user["city"], user["country"]])
        get_db().commit()
        return True
    except:
        return False



def get_user_all(email):
    cursor = get_db().execute("select * from users where email = ?", [email])
    rows = cursor.fetchall()
    cursor.close()
    #result = dict()
    if rows != []:
        for index in range(len(rows)):
            result = {'email': rows[index][0], 'password': rows[index][1], 'firstname': rows[index][2], 'lastname': rows[index][3], 'gender': rows[index][4], 'city': rows[index][5], 'country': rows[index][6]}
        return result
    else:
        result = {'success': False}
        return result

def get_user_without_pass(email):
    cursor = get_db().execute("select * from users where email = ?", [email])
    rows = cursor.fetchall()
    cursor.close()
    #result = dict()
    if rows != []:
        for index in range(len(rows)):
            result = {'email': rows[index][0], 'firstname': rows[index][2], 'lastname': rows[index][3], 'gender': rows[index][4], 'city': rows[index][5], 'country': rows[index][6]}
            return result
    else:
        result = {'success': False}
        return result




def save_token(token, email):
    try:
        get_db().execute("insert or replace into signedinusers values(?,?)", [token, email])
        get_db().commit()
        return True
    except:
        return False

def delete_token(token):
    if signed_in(token):
        get_db().execute("delete from signedinusers where token = ?", [token])
        get_db().commit()
        return True
    else:
        return False

def get_user_by_token(token):
    cursor = get_db().execute("select email from signedinusers where token = ?", [token])
    rows = cursor.fetchall()
    cursor.close()
    if signed_in(token):
        email = rows[0][0]
        result = get_user_all(email)
        return result
    else:
        result = "False"
        return result

def get_user_by_token_without_pass(token):
    cursor = get_db().execute("select email from signedinusers where token = ?", [token])
    rows = cursor.fetchall()
    cursor.close()
    if signed_in(token):
        email = rows[0][0]
        result = get_user_without_pass(email)
        return result
    else:
        result = None
        return result

def signed_in(token):
    cursor = get_db().execute("select token from signedinusers where token = ?", [token])
    rows = cursor.fetchall()
    cursor.close()
    if rows != []:
        return True
    else:
        return False

def change_password(email, newPassword):
    try:
        get_db().execute("update users set password = ? where email = ?", [newPassword, email])
        get_db().commit()
        return True
    except:
        return False

def update_messsagesWall(fromEmail, toEmail, message):
    cursor = get_db().execute("select * from wall where toEmail = ?", [toEmail])
    rows = cursor.fetchall()
    cursor.close()
    try:
        get_db().execute("insert into wall values(?,?,?)", [fromEmail, toEmail, message])
        print("inserted")
        get_db().commit()
        return True
    except:
        return False

def get_messsagesWall(email):
    token = get_db().execute("select token from signedinusers where email = ?", [email])
    toEmail = email
    cursor = get_db().execute("select * from wall where toEmail = ?", [toEmail])
    rows = cursor.fetchall()
    cursor.close()
    result = []
    if rows != []:
        for i in range(len(rows)):
            result.append({'writer': rows[i][0], 'content': rows[i][2]})
        return result
    else:
        message = {"success": False}
        return message
