// 인기지역별 핫매물 데이터 (이미지 경로는 상황에 맞게 수정)
const regionProperties = {
  "서울특별시 강남구": [
    {
      name: "대치동 래미안 아파트",
      address: "서울특별시 강남구 대치동",
      size: "84m² (25평)",
      price: "13억 3,000만원",
      auction: "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
      infra: "지하철 2호선 대치역 5분, 학군 우수, 공원, 강남구청, 맛집",
      img: "images/서울강남구_top3.jpg"
    },
    {
      name: "타워팰리스2차",
      address: "서울특별시 강남구 청담동",
      size: "95m² (28.7평)",
      price: "19억",
      auction: "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
      infra: "지하철 7호선 청담역, 한강 조망, 고급 커뮤니티, 공원, 대형마트",
      img: "images/서울강남구2.jpg"
    },
    {
      name: "PH129 펜트하우스",
      address: "서울특별시 강남구 삼성동",
      size: "273.95m² (83평)",
      price: "138억",
      auction: "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
      infra: "지하철 2호선 삼성역, 코엑스, 한강 조망, 고급 상권, 공원",
      img: "images/서울강남구3.jpeg"
    }
  ],
  "부산광역시 해운대구": [
  {
    name: '해운대 자이 2차',
    address: '부산시 해운대구 우동',
    size: '84.96㎡ (약 25평)',
    price: '9억 5,000만원',
    auction: '실제 법원경매정보 사이트에서 확인하러 가기',
    infra: '2018년 입주, 13층, 부산2호선 인근, 대단지, 생활편의시설 인접',
    img: "images/부산 해운대구1.jpeg"
  },
  {
    name: '해운대 아이파크',
    address: '부산시 해운대구 우동',
    size: '168.5㎡ (약 51평)',
    price: '12억원',
    auction: '실제 법원경매정보 사이트에서 확인하러 가기',
    infra: '2011년 입주, 10층, 초고층, 바다조망, 생활편의시설 인접',
    img: "images/부산해운대구2.jpeg"
  },
  {
    name: '해운대아이파크(펜트하우스)',
    address: '부산시 해운대구 우동',
    size: '205.53㎡ (약 62평)',
    price: '39억원',
    auction: '실제 법원경매정보 사이트에서 확인하러 가기',
    infra: '2011년 입주, 71층, 초고층, 파노라마 오션뷰, 최고급 단지',
    img: "images/부산해운대구3.jpeg"
  }
  ],
  "경기도 성남시 분당구": [
  {
  name: '목련마을 SK 아파트',
  address: '경기도 성남시 분당구 야탑동',
  size: '75m² (23평)',
  price: '7억 8,000만원',
  auction: '실제 법원경매정보 사이트에서 확인',
  infra: '야탑역 인근, 버스 다수, 대형마트 차량 10분, 공원 인근',
  img: "images/성남시분당구1.jpg"
  },
  {
  name: '더샵 분당 파크리버',
  address: '경기도 성남시 분당구',
  size: '85m² (25평)',
  price: '15억 내외',
  auction: '실제 법원경매정보 사이트에서 확인',
  infra: '분당구청 근처, 버스 다수, 대형마트 차량 10분, 공원 인근',
  img: "images/성남시분당구2.jpg"
  },
  {
  name: '더샵 판교 퍼스트파크',
  address: '경기도 성남시 분당구 백현동',
  size: '165m² (50평)',
  price: '20억 8,000만원',
  auction: '실제 법원경매정보 사이트에서 확인',
  infra: '백현역 인근, 판교역 차량 10분, 대형마트 차량 10분, 공원 인근',
  img: "images/성남시분당구3.jpg"
  }
  ],
  "서울특별시 송파구": [
    {
  name: '송파동 삼성 래미안',
  address: '서울특별시 송파구 송파동',
  size: '80m² (24평)',
  price: '10억 9,000만원',
  auction: '실제 법원경매정보 사이트에서 확인',
  infra: '가락시장역 도보 7분, 송파구청 차량 10분, 올림픽공원 인근, 대형마트 차량 10분, 버스 다수',
  img: "images/서울송파구1.jpg"
  },
  {
  name: '송파 파크데일 2단지',
  address: '서울특별시 송파구 마천동',
  size: '148.75m² (45평)',
  price: '13억 5,000만원',
  auction: '실제 법원경매정보 사이트에서 확인하러 가기',
  infra: '마천역 도보 7분, 송파구청 차량 20분, 인근 공원, 대형마트 차량 10분, 버스 다수, 자주식 주차장 완비',
  img: "images/서울송파구2.jpeg"
  },
  {
  name: '송파 시그니처 롯데캐슬',
  address: '서울특별시 송파구',
  size: '111.62m² (34평)',
  price: '15억 9,000만원',
  auction: '실제 법원경매정보 사이트에서 확인하러 가기',
  infra: '지하철 인근, 송파구청 차량 10분, 대형마트, 공원, 버스 다수, 자주식 주차장 완비',
  img: "images/서울송파구3.jpeg"
  }
  ],
  "인천광역시 연수구": [
    {
  name: '더샵 송도센트럴파크 3차',
  address: '인천 연수구 송도동',
  size: '119.8㎡ (약 36평)',
  price: '20억 2,000만원',
  auction: '실제 법원경매정보 사이트에서 확인하러 가기',
  infra: '2014년 준공, 31층, 송도동 중심, 초고급 대단지, 생활편의시설 인접',
  img: "images/인천연수구1.jpeg"
  },
  {
  name: '자이 하버뷰 2단지',
  address: '인천 연수구 송도동',
  size: '243.4㎡ (약 74평)',
  price: '24억 3,000만원',
  auction: '실제 법원경매정보 사이트에서 확인하러 가기',
  infra: '2017년 준공, 4층, 송도동 중심, 초고급 대단지, 생활편의시설 인접[20]',
  img: "images/인천연수구2.webp"
  },
  {
  name: '글로벌캠퍼스 푸르지오',
  address: '인천 연수구 송도동',
  size: '101㎡ (약 31평)',
  price: '8억원',
  auction: '실제 법원경매정보 사이트에서 확인하러 가기',
  infra: '2013년 준공, 10층, 송도동 중심, 대단지, 생활편의시설 인접',
  img: "images/인천연수구3.jpg"
  }
  ],
  "대구광역시 수성구": [
  {
  name: '힐스테이트 범어센트럴',
  address: '대구광역시 수성구 범어동',
  size: '84.81㎡',
  price: '8억 7,000만원',
  auction: '실제 법원경매정보 사이트에서 확인하러 가기',
  infra: '2022년 입주, 9층, 범어동 중심, 대단지, 생활편의시설 인접',
  img: "images/대구수성구1.jpeg"
  },
  {
  name: '범어 아이파크 1차',
  address: '대구광역시 수성구 범어동',
  size: '84.97㎡',
  price: '12억 8,000만원',
  auction: '실제 법원경매정보 사이트에서 확인하러 가기',
  infra: '2024년 입주, 14층, 범어동 중심, 대단지, 생활편의시설 인접',
  img: "images/대구수성구2.jpeg"
  },
  {
  name: '대우 트럼프월드 수성',
  address: '대구광역시 수성구 두산동',
  size: '125㎡',
  price: '8억 6,500만원',
  auction: '실제 법원경매정보 사이트에서 확인하러 가기',
  infra: '2007년 입주, 28층, 두산동 중심, 대단지, 생활편의시설 인접',
  img: "images/대구수성구3.jpg"
  }
  ],
  "경기도 용인시 수지구": [
  {
  name: '죽전 아이뷰 아파트',
  address: '경기도 용인시 수지구 죽전동',
  size: '102.5m² (31평)',
  price: '6억 2,000만원',
  auction: '실제 법원경매정보 사이트에서 확인하러 가기',
  infra: '수인분당선 오리역 도보 13분, 신분당선 동천역 13분, 초등학교 도보 7분, 판교·강남 접근성 우수',
  img: "images/용인수지구.jpg"
  },
  {
  name: '성복역 롯데캐슬 골드타운',
  address: '경기도 용인시 수지구 성복동',
  size: '99.98m² (30평)',
  price: '13억 6,000만원',
  auction: '실제 법원경매정보 사이트에서 확인하러 가기',
  infra: '성복역 도보 3분, 대형마트(롯데몰), 판교·강남 접근성, 자주식 주차장',
  img: "images/용인수지2.jpg"
  },
  {
  name: '고기동 하이엔드 고급주택',
  address: '경기도 용인시 수지구 고기동',
  size: '대지 약 156평',
  price: '23억',
  auction: '실제 법원경매정보 사이트에서 확인하러 가기',
  infra: '고기유원지 입구, 분당·판교·대장IC 인접, 자연환경 우수',
  img: "images/용인수지구3.jpg"
  }
  ],
  "서울특별시 용산구": [
    {
  name: '한남 아이파크 애비뉴',
  address: '서울특별시 용산구 한남동',
  size: '49.7m² (15평)',
  price: '12억 내외',
  auction: '실제 법원경매정보 사이트에서 확인',
  infra: '한남역 도보 5분, 용산구청 차량 10분, 한강공원 인근, 대형마트 차량 10분, 버스 다수',
  img: "images/서울용산구1.jpg"
  },
  {
  name: '한남더힐 단독주택',
  address: '서울특별시 용산구 한남동',
  size: '200m² (60평)',
  price: '19억 내외',
  auction: '실제 법원경매정보 사이트에서 확인',
  infra: '한남역 도보 5분, 용산구청 차량 10분, 한강공원, 대형마트 차량 10분, 버스 다수',
  img: "images/서울용산2.jpg"
  },
  {
  name: '아크로 서울포레스트',
  address: '서울특별시 용산구',
  size: '198m² (60평)',
  price: '145억',
  auction: '실제 법원경매정보 사이트에서 확인',
  infra: '성수역 도보 5분, 성동구청 차량 10분, 서울숲공원, 대형마트 차량 10분, 버스 다수',
  img: "images/서울용산3.webp"
  }
  ]
};




// 인기지역 리스트와 핫매물 카드 삽입 div 선택
const regionList = document.querySelector('.popular-regions');
const hotListContainer = document.getElementById('region-hot-list');

// 카드 HTML 생성 함수 (기존 property-item 스타일 활용)
function createPropertyCard(prop) {
  return `
    <li class="property-item">
      <img class="property-img" src="${prop.img}" alt="${prop.name}" />
      <div class="property-info">
        <div class="property-title">${prop.name}</div>
        <div class="property-meta">${prop.address} · ${prop.size}</div>
        <div class="property-desc">${prop.price} · ${prop.infra}</div>
      </div>
    </li>
  `;
}

// 카드 리스트 전체 HTML
function renderHotList(regionName) {
  const props = regionProperties[regionName];
  if (!props) return '';
  return `
    <section class="hot-section" style="padding-top:0;">
      <h2 style="font-size:1.15rem; color:#5e35b1; margin-bottom:18px; margin-top:0;">
      ${regionName}의 Top3 Zip</h2>
      <ul class="property-list">
        ${props.map(createPropertyCard).join('')}
      </ul>
    </section>
  `;
}

// 현재 열린 지역 추적
let openedRegion = null;

// 이벤트 위임 방식으로 클릭 처리
regionList.addEventListener('click', function(e) {
  const target = e.target.closest('.region-item');
  if (!target) return;

  const regionName = target.textContent.trim();

  // 같은 지역 다시 클릭 시 닫기
  if (openedRegion === regionName) {
    hotListContainer.innerHTML = '';
    openedRegion = null;
    return;
  }

  // 새 지역 클릭 시 카드 교체
  hotListContainer.innerHTML = renderHotList(regionName);
  openedRegion = regionName;

//   // 스크롤 로직
  document.querySelector('.popular-section').scrollIntoView({ behavior: 'smooth', block: 'start' });

//   const section = document.querySelector('.popular-section');
// const header = document.getElementById('gn-nav');
// const headerHeight = header ? header.offsetHeight : 400;
// const y = section.getBoundingClientRect().top + window.scrollY - headerHeight;

// window.scrollTo({ top: y, behavior: 'smooth' });


});




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