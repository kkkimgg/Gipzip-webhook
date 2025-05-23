// AI집 js



// 0. 전역 변수 선언
let map;                // 지도 객체
let markers = [];       // 마커 배열
let bounds;             // 지도 경계
let activeInfoWindow = null;

// 로딩 메시지 관련 변수
const loadingMessages = [ /* ... */ ];
let currentMsgIndex = -1;
let loadingInterval = null;

// 로딩 메시지 함수
function showRandomLoadingMessage() { /* ... */ }
function hideLoader() { /* ... */ }



// 1. DOMContentLoaded: 폼 제출 로딩 처리, 인디케이터 초기화
document.addEventListener("DOMContentLoaded", function () {
  // // 폼 제출 시 로딩바 표시
  // const form = document.getElementById("mainForm");
  // if (form) {
  //   form.addEventListener("submit", function (e) {
  //     const loader = document.getElementById("loader");
  //     if (loader) loader.style.display = "block";
  //   });
  // }


  // 폼 제출 시 로딩바 표시
  const form = document.getElementById("mainForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      const loaderContainer = document.getElementById("loader-container");
      const loadingText = document.getElementById("loading-text");
      if (loaderContainer && loadingText) {
        loaderContainer.style.display = "flex";
        loadingText.textContent = "AI가 최적의 집을 찾고 있어요... 🏡";
      }
      showRandomLoadingMessage(); // 랜덤 메시지 시작
      // 10초마다 메시지 변경
      if (loadingInterval) clearInterval(loadingInterval);
      loadingInterval = setInterval(showRandomLoadingMessage, 10000);
    });
  }


// 추가: 로딩 메시지 관련
const loadingMessages = [
    "최신 부동산 데이터를 분석 중입니다... 📊",
    "AI가 추천 집을 선정 중입니다... 🤖",
    "주변 시설 정보를 확인 중입니다... 🏪",
    "입력하신 예산을 반영 중입니다... 💸",
    "선호하시는 주거 형태를 분석 중입니다... 🏠",
    "가족 형태에 맞는 집을 찾고 있습니다... 👨‍👩‍👧‍👦",
    "취미와 라이프스타일을 고려 중입니다... 🎾",
    "지역 내 시설 정보를 확인 중입니다... 🏥🌳🛒"
];

/* 개발 테스트 
document.getElementById("loading-text").textContent = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
*/


let currentMsgIndex = -1;
let loadingInterval = null;

function showRandomLoadingMessage() {
    let nextIndex;
    do {
        nextIndex = Math.floor(Math.random() * loadingMessages.length);
    } while (nextIndex === currentMsgIndex && loadingMessages.length > 1);
    currentMsgIndex = nextIndex;
    document.getElementById("loading-text").textContent = loadingMessages[currentMsgIndex];
}

// 로딩 종료 시 반드시 interval 해제
function hideLoader() {
    const loaderContainer = document.getElementById("loader-container");
    if (loaderContainer) loaderContainer.style.display = "none";
    if (loadingInterval) clearInterval(loadingInterval);
}

});









//   // 인디케이터 동적 생성
//   const wrapper = document.getElementById('cardWrapper');
//   if (wrapper) {
//     const indicators = document.getElementById('indicatorContainer');
//     if (indicators) {
//       indicators.innerHTML = '';
//       const cards = wrapper.getElementsByClassName('recommendation-card');
//       Array.from(cards).forEach((_, i) => {
//         const dot = document.createElement('span');
//         dot.className = 'indicator';
//         if (i === 0) dot.classList.add('active');
//         dot.onclick = () => scrollToCard(i);
//         indicators.appendChild(dot);
//       });
//     }
//   }
// });

// 2. 네이버 지도 API 콜백 (window에 등록되어야 함)
function initMap() {
  if (!window.naver || typeof recommendations === "undefined" || recommendations.length === 0) return;

  // 지도 생성
  const firstLat = parseFloat(recommendations[0]?.위도 || recommendations[0]?.lat) || 37.5665;
  const firstLng = parseFloat(recommendations[0]?.경도 || recommendations[0]?.lng) || 126.9780;

  map = new naver.maps.Map("map", {
    center: new naver.maps.LatLng(firstLat, firstLng),
    zoom: 13
  });

  markers = [];
  bounds = new naver.maps.LatLngBounds();

  // 마커 생성
  recommendations.forEach((rec, idx) => {
    const lat = parseFloat(rec['위도'] || rec['lat']) || 37.5665;
    const lng = parseFloat(rec['경도'] || rec['lng']) || 126.9780;
    const position = new naver.maps.LatLng(lat, lng);
    bounds.extend(position);

    const marker = new naver.maps.Marker({
      position: position,
      map: map,
      icon: {
        url: '/img/placeholder.png',
        size: new naver.maps.Size(34, 34),           // 화면에 보이는 마커 크기
        scaledSize: new naver.maps.Size(34, 34),     // 실제로 강제로 조정할 크기
        anchor: new naver.maps.Point(16, 32) // 마커 하단 중앙 기준
      }
    });

    marker.addListener("click", () => {
      if (activeInfoWindow) activeInfoWindow.close();

      const content = `
        <div class="info-window">
          <span class="close-btn" onclick="closeInfoWindow()">×</span>
          <h3 style="margin:0 0 10px 0; color:#333;">${rec['이름'] || rec['name']}</h3>
          
          <p style="margin:0; color:#666;">
          <img src="/img/security-pin.png" alt="주소" style="height:1.3em;vertical-align:middle;">
          ${rec['주소'] || rec['address']}
          </p>

          <p style="margin:5px 0; color:#444;">${rec['크기'] || rec['size']}</p>
          <p style="margin:0; font-weight:bold; color:#2E7D32;">
            ${(rec['가격'] || rec['price'] || '').toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원
          </p>
        </div>
      `;
      activeInfoWindow = new naver.maps.InfoWindow({
        content: content,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: 'white',
        anchorSize: new naver.maps.Size(10, 10)
      });
      activeInfoWindow.open(map, marker);
      scrollToCard(idx);
    });

    markers.push(marker);
  });

  // "이 위치 보기" 버튼 이벤트
  document.querySelectorAll('.map-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const index = parseInt(this.dataset.index);
      const marker = markers[index];
      map.setCenter(marker.getPosition());
      map.setZoom(16);
      scrollToCard(index);
    });
  });

  // 지도 전체 보기(초기)
  setTimeout(() => {
    if (markers.length > 0) {
      map.fitBounds(bounds, { padding: 50 });
    }
  }, 500);

  showCard(0);

  // 결과가 보이자마자, 로딩창 숨기기
  hideLoader(); 
}

// 3. 전체 지도 보기 함수
function resetMap() {
  if (markers.length > 0) {
    map.fitBounds(bounds, { padding: 50 });
  } else {
    map.setCenter(new naver.maps.LatLng(36.5, 127.5));
    map.setZoom(7);
  }
  closeInfoWindow();
}

// 4. InfoWindow 닫기
function closeInfoWindow() {
  if (activeInfoWindow) {
    activeInfoWindow.close();
    activeInfoWindow = null;
  }
}

// 5. 카드/인디케이터/스크롤 함수
function showCard(index) {
  currentIdx = index;
  updateIndicators(index);
  if (map && recommendations && recommendations[index]) {
    const lat = parseFloat(recommendations[index]['위도'] || recommendations[index]['lat']) || 37.5665;
    const lng = parseFloat(recommendations[index]['경도'] || recommendations[index]['lng']) || 126.9780;
    map.setCenter(new naver.maps.LatLng(lat, lng));
  }
}

// 인디케이터 클릭 시 해당 카드로 스크롤
document.querySelectorAll('.indicator, .indicator-dot').forEach((dot, i) => {
  dot.onclick = () => scrollToCard(i);
});

// function scrollToCard(index) {
//   const wrapper = document.getElementById('cardWrapper');
//   if (!wrapper) return;
//   const card = wrapper.children[index];
//   if (card) {
//     card.scrollIntoView({
//       behavior: 'smooth',
//       block: 'nearest',
//       inline: 'center'
//     });
//     updateIndicators(index);
//   }
// }

function scrollToCard(index) {
  const wrapper = document.querySelector('.card-wrapper');
  const cards = document.querySelectorAll('.recommendation-card');
  if (!wrapper || !cards[index]) return;
  
  const card = cards[index];
  const wrapperRect = wrapper.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  
  // 카드 중앙 위치 계산
  const scrollLeft = wrapper.scrollLeft + (cardRect.left + cardRect.width/2) - (wrapperRect.left + wrapperRect.width/2);
  
  wrapper.scrollTo({
    left: scrollLeft,
    behavior: 'smooth'
  });
}

// 인디케이터 클릭 시
document.querySelectorAll('.indicator-dot').forEach((dot, idx) => {
  dot.addEventListener('click', () => {
    scrollToCard(idx);
  });
});

// ‘지도에서 위치 보기’ 버튼 클릭 시에도 같은 함수 호출
document.querySelectorAll('.map-btn').forEach((btn, idx) => {
  btn.addEventListener('click', () => {
    scrollToCard(idx);
  });
});




/* 일정 스크롤 시, 맨 위로 이동 */
// 버튼 보이기/숨기기
window.addEventListener("scroll", function() {
  const topBtn = document.getElementById("topBtn");
  if (window.scrollY > 550) { 
    topBtn.style.display = "block";
  } else {
    topBtn.style.display = "none";
  }
});


// 클릭 시 상단 이동
document.addEventListener("DOMContentLoaded", function () {
  const topBtn = document.getElementById("topBtn");
  if (topBtn) {
    topBtn.onclick = function() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  }
});







//스크롤 이벤트로 인디케이터 active 업데이트
document.addEventListener("DOMContentLoaded", function () {
  const wrapper = document.getElementById('cardWrapper');
  if (wrapper) {
    wrapper.addEventListener('scroll', function () {
      const cards = wrapper.getElementsByClassName('recommendation-card');
      let minDiff = Infinity;
      let activeIdx = 0;
      for (let i = 0; i < cards.length; i++) {
        const cardRect = cards[i].getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        const diff = Math.abs((cardRect.left + cardRect.right) / 2 - (wrapperRect.left + wrapperRect.right) / 2);
        if (diff < minDiff) {
          minDiff = diff;
          activeIdx = i;
        }
      }
      updateIndicators(activeIdx);
    });
  }
});




function updateIndicators(index) {
  document.querySelectorAll('.indicator, .indicator-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}