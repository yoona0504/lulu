// 페이지 전환 기능
document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll(".sidebar li");
  const pages = document.querySelectorAll(".page");

  menuItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      pages.forEach(p => p.style.display = "none");
      pages[index].style.display = "block";

      menuItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  renderDashboardCards({
    emotion: "행복",
    emotionDuration: "3시간 연속 유지",
    todaysChats: 24,
    faceAccuracy: "98%",
    battery: "78%"
  });
});

// 웹캠 활성화
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    const video = document.getElementById('video');
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      document.getElementById('captureBtn').disabled = false;
    };
  });

function getFollowupQuestion(emotion) {
  const followups = {
    happy: "오늘은 기분이 참 좋아 보여요! 특별한 일이 있었나요?",
    sad: "무슨 일이 있었나요? 루루봇이 얘기 들어줄게요.",
    angry: "화가 난 것 같아요. 마음 진정시키는 데 도움이 필요할까요?",
    neutral: "평온해 보이네요. 루루봇과 가벼운 대화 나눠볼까요?",
    fear: "무서운 일이 있었던 건 아니죠?",
    surprise: "놀란 얼굴이에요! 무슨 일이 있었나요?",
    disgust: "좀 불쾌한 일이 있었던 것 같아요. 이야기해볼래요?"
  };
  return followups[emotion] || "루루봇이 항상 옆에 있을게요. 무슨 이야기든 해도 괜찮아요.";
}

function saveLogToLocalStorage(entry) {
  const logs = JSON.parse(localStorage.getItem('chatLogs') || '[]');
  logs.push(entry);
  localStorage.setItem('chatLogs', JSON.stringify(logs));
}

function capture() {
  const video = document.getElementById('video');
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    alert("카메라 준비 중입니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  function sendUserMessage() {
    const input = document.getElementById('userMessage');
    const message = input.value.trim();
    if (!message) return;

    const now = new Date().toLocaleTimeString();
    const logTable = document.getElementById('logTableBody');

    // 사용자 메시지 기록
    const userRow = document.createElement('tr');
    userRow.innerHTML = `
    <td>${now}</td>
    <td>사용자</td>
    <td>${message}</td>
    <td>-</td>
  `;
    logTable.appendChild(userRow);
    saveLogToLocalStorage({ time: now, from: '사용자', response: message, emotion: '-' });

    // 루루봇 임의 반응 (예시)
    const reply = "그렇군요! 더 얘기해볼까요?";
    const botRow = document.createElement('tr');
    botRow.innerHTML = `
    <td>${now}</td>
    <td>루루봇</td>
    <td>${reply}</td>
    <td>중립</td>
  `;
    logTable.appendChild(botRow);
    saveLogToLocalStorage({ time: now, from: '루루봇', response: reply, emotion: 'neutral' });

    input.value = "";
  }

  function renderDashboardCards(data) {
  const container = document.getElementById("cardContainer");
  container.innerHTML = ""; // 기존 카드 초기화

  const cardData = [
    {
      icon: "😊",
      title: "현재 감정",
      value: data.emotion || "중립",
      small: data.emotionDuration || "방금 감지됨"
    },
    {
      icon: "💬",
      title: "오늘의 대화",
      value: data.todaysChats || "0",
      small: "어제보다 +5"
    },
    {
      icon: "🎯",
      title: "얼굴 인식 정확도",
      value: data.faceAccuracy || "0%",
      small: "지난주보다 +2%"
    },
    {
      icon: "🔋",
      title: "배터리 상태",
      value: data.battery || "78%",
      small: "약 5시간 남음"
    }
  ];

  cardData.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${item.icon} ${item.title}</h3>
      <p>${item.value}<br><span class="small">${item.small}</span></p>
    `;
    container.appendChild(card);
  });
}


  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  const dataUrl = canvas.toDataURL('image/jpeg');
  document.getElementById('photo').src = dataUrl;

  fetch('/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataUrl })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        return;
      }

      document.getElementById('response').innerText = data.response;

      // 감정 분석 차트
      const ctx = document.getElementById('emotionChart').getContext('2d');
      const labels = Object.keys(data.emotions);
      const values = Object.values(data.emotions);

      if (window.emotionChart) window.emotionChart.destroy();
      window.emotionChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: '감정 확률 (%)',
            data: values,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: { beginAtZero: true, max: 100 }
          }
        }
      });

      // 대화 테이블에 반응 + 후속질문 추가
      const logTable = document.getElementById('logTableBody');

      const now = new Date().toLocaleTimeString();

      const row1 = document.createElement('tr');
      row1.innerHTML = `
        <td>${now}</td>
        <td>-</td>
        <td>${data.response}</td>
        <td>${data.dominant}</td>
      `;
      logTable.appendChild(row1);
      saveLogToLocalStorage({ time: now, from: '-', response: data.response, emotion: data.dominant });

      const followup = getFollowupQuestion(data.dominant);
      const row2 = document.createElement('tr');
      row2.innerHTML = `
        <td>${now}</td>
        <td>루루봇</td>
        <td>${followup}</td>
        <td>${data.dominant}</td>
      `;
      logTable.appendChild(row2);
      saveLogToLocalStorage({ time: now, from: '루루봇', response: followup, emotion: data.dominant });
    });
}