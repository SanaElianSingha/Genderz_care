from flask import Flask, request, jsonify
from flask_cors import CORS

import pyodbc

def db_conn():
    return pyodbc.connect(
        'DRIVER={ODBC Driver 17 for SQL Server};'
        'SERVER=DESKTOP-E3ASVCU\\SQLEXPRESS;'
        'DATABASE=Gender_care_DB;' 
        'Trusted_Connection=yes;'
    )
    
print("successful connected")

con = db_conn()

cursor = con.cursor()

app = Flask(__name__)
CORS(app) 


@app.route('/api/states', methods=['GET'])
def get_states():
    con = db_conn()
    cur = con.cursor()
    cur.execute("SELECT id, name FROM States")
    states = [{'id': row[0], 'name': row[1]} for row in cur.fetchall()]
    con.close()
    return jsonify(states)


@app.route('/api/cities/<int:state_id>', methods=['GET'])
def get_cities(state_id):
    con = db_conn()
    cur = con.cursor()
    cur.execute("SELECT id, name FROM Cities WHERE state_id=?", (state_id,))
    cities = [{'id': row[0], 'name': row[1]} for row in cur.fetchall()]
    con.close()
    return jsonify(cities)


@app.route('/api/providers/<int:city_id>', methods=['GET'])
def get_providers(city_id):
    con = db_conn()
    cur = con.cursor()
    cur.execute("""
        SELECT name, type, specialty, cost_range, verified, contact_info
        FROM Medical_Providers WHERE city_id=?
    """, (city_id,))
    providers = [
        {
            'name': row[0],
            'type': row[1],
            'specialty': row[2],
            'cost_range': row[3],
            'verified': bool(row[4]),
            'contact_info': row[5]
        } for row in cur.fetchall()
    ]
    con.close()
    return jsonify(providers)

@app.route('/api/vet_provider', methods=['POST'])
def vet_provider():
    data = request.json
    provider_name = data.get('name')
    verified_by_org = data.get('verified_by_org')  # boolean
    has_queer_training = data.get('has_queer_training')  # boolean

    if verified_by_org or has_queer_training:
        con = db_conn()
        cur = con.cursor()
        cur.execute("UPDATE Medical_Providers SET verified=1 WHERE name=?", (provider_name,))
        con.commit()
        con.close()
        return jsonify({'status': 'vetted'}), 200
    else:
        return jsonify({'error': 'Insufficient vetting credentials'}), 400



@app.route('/api/support', methods=['POST'])
def submit_support():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')

    con = db_conn()
    cur = con.cursor()
    cur.execute("""
        INSERT INTO Support_Requests (user_name, email, message)
        VALUES (?, ?, ?)
    """, (name, email, message))
    con.commit()
    con.close()
    return jsonify({'status': 'submitted'}), 201

@app.route('/api/news', methods=['GET'])
def get_news():
    con = db_conn()
    cur = con.cursor()
    cur.execute("""
        SELECT title, description, date_posted
        FROM News_Updates ORDER BY date_posted DESC
    """)
    news = [
        {
            'title': row[0],
            'description': row[1],
            'date_posted': row[2].strftime('%Y-%m-%d')
        } for row in cur.fetchall()
    ]
    con.close()
    return jsonify(news)


if __name__ == '__main__':
    app.run(debug=True)
