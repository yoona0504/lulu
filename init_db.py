import sqlite3

# DB 파일 생성 (없으면 새로 만듦)
conn = sqlite3.connect('lulubot.db')
cursor = conn.cursor()

# 테이블 생성
cursor.execute('''
CREATE TABLE IF NOT EXISTS dashboard_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emotion TEXT,
    emotion_duration TEXT,
    todays_chats INTEGER,
    face_accuracy TEXT,
    battery TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
''')

# 샘플 데이터 한 줄 삽입
cursor.execute('''
INSERT INTO dashboard_status (emotion, emotion_duration, todays_chats, face_accuracy, battery)
VALUES ('행복', '3시간 연속 유지', 24, '98%', '78%')
''')

conn.commit()
conn.close()

print("✅ DB 생성 및 샘플 데이터 삽입 완료!")
