from flask import Flask, render_template, request, jsonify
import base64
import numpy as np
import cv2
import sqlite3  # ✅ DB 연결 위해 필요
from emotion_analysis import analyze_emotion
from emotion_response import get_emotion_response

app = Flask(__name__)

# 🔹 대시보드 카드용 DB 데이터 가져오기 함수
def get_dashboard_data():
    conn = sqlite3.connect('lulubot.db')
    cursor = conn.cursor()
    cursor.execute("SELECT emotion, emotion_duration, todays_chats, face_accuracy, battery FROM dashboard_status ORDER BY updated_at DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()

    return {
        "emotion": row[0],
        "emotionDuration": row[1],
        "todaysChats": row[2],
        "faceAccuracy": row[3],
        "battery": row[4]
    } if row else {}

# 🔹 메인 페이지
@app.route('/')
def index():
    return render_template('index.html')

# 🔹 감정 분석 요청 처리
@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json['image']
        _, encoded = data.split(",", 1)
        img_data = base64.b64decode(encoded)
        np_arr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        emotions, dominant = analyze_emotion(frame)
        response = get_emotion_response(dominant)

        return jsonify({'emotions': emotions, 'response': response, 'dominant': dominant})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 🔹 대시보드 카드 요청 처리
@app.route('/dashboard-data')
def dashboard_data():
    data = get_dashboard_data()
    return jsonify(data)

# 🔹 서버 실행
if __name__ == "__main__":
    app.run(debug=True)