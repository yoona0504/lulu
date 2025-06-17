document.addEventListener("DOMContentLoaded", () => {
  fetch('/dashboard-data')
    .then(res => res.json())
    .then(data => renderDashboardCards(data))
    .catch(err => {
      console.error("서버에서 카드 데이터를 불러오지 못했어요:", err);
    });
});