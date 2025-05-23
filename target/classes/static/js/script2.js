let map;
let markers = [];
let houseData = [
  {
    title: "[서울 중구] 힐스테이트 세운 센트럴 1단지(도시형) 1동",
    lat: 37.5680926616605,
    lng: 126.99346132272,
    images: [
      { desc: "신축이라서 깔끔한 것이 특징,하지만 관광지라서 붐빌 수도 있음", src: "/img/힐스테이트1단지전경.png"},
      { desc: "집 앞에 청계천이 흐르니 뷰도 탁트여있고 운동하기 좋음", src: "/img/힐스테이트1단지청계천.png" },
      { desc: "지하 주차장이 구비되어 있어 주차 문제는 없음", src: "/img/힐스테이트1단지주차장.png"},
      { desc: "1층 상가와 바로 앞에 다니는 대중교통으로 교통이 최고", src: "/img/힐스테이트1단지상가.png"},
      { desc: "최고 장점은 도보 2분 거리에 을지로3가역이 있음", src: "/img/힐스테이트1단지지하철방향.png"}
    ],
    desc: "[아파트]공급/전용 면적:69.55㎡/46.85㎡ | 월세 :  5,500/230 | 전세 : 6억 1천만원 | 매매 : 8억 7천만원 ",
    pros: ["을지로3가역 5번출구 도보 2분 소요", "지하철 1,2,3,5호선 인접", "청계천 인프라 환경","젊은 세대가 많음","자전거타고 다니기 좋음"],
    cons: ["주변이 시끄러움", "가격에 비해 면적이 다소 좁음", "아직 공사중이라서 주변이 매우 휑함","학군은 그닥"]
  },
  {
    title: "[서울 중구] 종로1가 대성 스카이렉스(주상복합)",
    lat: 37.572185933746,
    lng: 126.98252652032,
    images: [
      { desc: "신축이라서 깔끔한 것이 특징,하지만 관광지라서 붐빌 수도 있음", src: "/img/종로1가대성전경.jpg"},
      { desc: "집 앞에 청계천이 흐르니 뷰도 탁트여있고 운동하기 좋음", src: "/img/종로1가대성주차장.jpg" },
      { desc: "지하 주차장이 구비되어 있어 주차 문제는 없음", src: "/img/종로1가대성지하철.jpg"},
      { desc: "1층 상가와 바로 앞에 다니는 대중교통으로 교통이 최고", src: "/img/종로1가대성상가.jpg"},
    ],
    desc: "[주상복합] 월세 179㎡ 14층 :  5,000/550 | 전세 179㎡ 5층 : 11억 3천만원 | 매매 179㎡ 11층: 최고 12억 7천만원",
    pros: ["신축이라서 깨끗함", "편의시설 가까움", "유명 관광지라서 맛집 많음", "종각역 도보 5분 소요","주변 체인점 다수 포진","월세 값 받기가 좋음"],
    cons: ["주상 복합이라서 외부인 많음", "지하철역에서 집까지 횡단보도 대기 시간이 조금 길다","금액 대비 너무 집이 작음"]
  },
  {
    title: "[서울 중구]푸른 마을 주공 4단지 아파트",
    lat: 37.304011390849,
    lng: 126.85209060982,
    images: [
      { desc: "신축이라서 깔끔한 것이 특징,하지만 관광지라서 붐빌 수도 있음", src: "/img/종로1가대성전경.jpg"},
      { desc: "집 앞에 청계천이 흐르니 뷰도 탁트여있고 운동하기 좋음", src: "/img/종로1가대성주차장.jpg" },
      { desc: "지하 주차장이 구비되어 있어 주차 문제는 없음", src: "/img/종로1가대성지하철.jpg"}
    ],
    desc: "[주상복합] 월세 179㎡ 14층 :  5,000/550 | 전세 179㎡ 5층 : 11억 3천만원 | 매매 179㎡ 11층: 최고 12억 7천만원",
    pros: ["신축이라서 깨끗함", "편의시설 가까움", "유명 관광지라서 맛집 많음", "종각역 도보 5분 소요","주변 체인점 다수 포진","월세 값 받기가 좋음"],
    cons: ["주상 복합이라서 외부인 많음", "지하철역에서 집까지 횡단보도 대기 시간이 조금 길다","금액 대비 너무 집이 작음"]
  },
  {
  title: "[서울 용산구] 세인트힐",
    lat: 37.542352862714,
    lng: 126.96392352483,
     images: [
      { desc: "숙명여대가 집 바로 옆에 있는 세인트힐", src: "/img/용신세인트힐전경.jpg"},
      { desc: "하지만 다소 외진 곳에 위치해있고 언덕이 상당하니 직접 임장을 와보시는 것을 추천", src: "/img/용신세인트힐언덕.jpg" },
      { desc: "숙명여대는 도보 5분내로 후문을 통해 이동 가능하여 월세를 놓기 좋은 구조", src: "/img/용신세인트힐숙명여대.jpg"},
      { desc: "차가 있다면 지하주차장이 있기에 주차 걱정은 없음", src: "/img/용산세인트힐주차장.jpg"},
      { desc: "근처 행정센터들이 많기 때문에 상당히 좋은 위치", src: "/img/용산세인트힐주민센터.jpg"}
    ],
    desc: "[주상복합] 월세 : 정보없음 | 전세 : 정보없음음 | 매매 : 3억 1,500(7층)",
    pros: ["신축이라서 깨끗함", "편의시설 가까움", "숙명여대 근처라서 저렴한 맛집 많음", "종각역 도보 5분 소요","숙명","월세 값 받기가 좋음"],
    cons: ["주상 복합이라서 외부인 많음", "지하철역에서 집까지 횡단보도 대기 시간이 조금 길다","언덕이 있어서 너무 힘듦"]
  },
  {
    title: "[서울 용산구] 이태원주공",
      lat: 37.543091366318,
      lng: 126.98892206555,
      images: [
      { desc: "해방촌과 남산이 인접한 이태원 주공은 상당히 복지를 누리기 좋은 위치", src: "/img/이태원주공전경.png"},
      { desc: "집 바로 앞에 보건소 셔틀버스가 다녀서 노후에 살기에 좋은 곳", src: "/img/이태원주공셔틀.png" },
      { desc: "주민센터가 바로 앞에 위치해있어서 행정 서비스를 누리기에도 좋지만 다소 소란스러울 수도", src: "/img/이태원주공주민센터.png"},
      { desc: "해방촌 시장 방향과 남산까지 도보 10분내로 갈 수 있는 위치기 때문에 가격이 합리적", src: "/img/이태원주공남산.png"}
    ],
      desc: "[주택] 월세 : 5,500/140(3층) | 전세 : 6억(3층) | 매매 : 16억 5,000(3층)",
      pros: ["학군 우수", "편의시설 가까움", "유명 관광지라서 맛집 많음", "종각역 도보 2분 소요","바로 앞에 셔틀과 주민센터가 있어서 부모님들 모시고 살기 좋음"],
      cons: ["낡은 건물, 보수가 필요함", "지하철역 도보 10분 소요","앞에 주민센터, 주택 안에 카페가 있어서 보안이 좋지 않을 수 있음"]
    },
    {
    title: "[서울 강남구] 래미안 대치팰리스",
    lat: 37.495075837111,
    lng: 127.05991531199,
    images: [
      { desc: "대치역 앞에 위치하여 좋음", src: "/img/강남레미안대치전경.png"},
      { desc: "쪽문방향 골프장과 주민센터와 같은 시설 완비", src: "/img/강남레미안대치주민센터.png" },
      { desc: "커뮤니티 시설이 매우 크다는 장점!", src: "/img/강남레미안대치커뮤니티센터.png"},
      { desc: "헬스장,건강체크시설,스크린골프까지 꽤나 큰 규모", src: "/img/강남레미안대치커뮤니티센터2.png"},
      { desc: "아기자기한 아파트라고 평가할 수 있음", src: "/img/강남레미안대치주민후문.png"}
    ],
    desc: "[아파트] 월세 : 3억/500(12층) | 전세 : 9억 2,925(4층) | 매매 : 25억(12층)",
    pros: ["대치역 1번출구 도보 3분 소요", "단국대 부속 고등학교 가까움", "커뮤니티 시설이 진짜 좋음","골프장이 있어서 매우 만족","숙명여대 부속 중학교와 고등학교가 있음","대치동 답게 학군이 좋음"],
    cons: ["주변이 시끄러움", "적은 세대 수로 관리비가 많이 듦", "단지가 작아서 아쉬움","양재천이 보이지 않아서 아쉬움"]
  },
  {
    title: "[경기도 용인시] 동천 파크자이",
    lat: 37.331328638937,
    lng: 127.08999164869,
    images: [
      { desc: "대로변에 위치하였지만 생각보다 조용한 소음", src: "/img/용인동천자이전경.png"},
      { desc: "작지만 아기자기한 단지로 구성", src: "/img/용인동천자이단지.png" },
      { desc: "뒤에 산책로가 있어서 건강을 챙기기 좋음", src: "/img/용인동천자이산책.png"},
      { desc: "근처에 도보로 갈 수 있는 큰 도서관이 있어요. ", src: "/img/용인동천자이도서관.png"}
    ],
    desc: "[아파트] 월세 : 3,000/129(15층) | 전세 : 4억 5,000(7층) | 매매 : 7억 5,000(12층)",
    pros: ["대로변임에도 조용한 편", "동천역 7분 소요", "뒤에 동산 산책하기 좋음","단지가 아기자기하게 잘 구성되어 있음"],
    cons: ["뒤에 산이라 벌레가 많음", "터널 사이에 있는 아파트라서 휑함", "단지가 작아서 아쉬움","상가가 아쉬움"]
  },
  {
    title: "[강원도 속초시] 속초 롯데캐슬 인더스카이",
    lat: 38.2094205170955,
    lng: 128.589776707883,
    images: [
      { desc: "대로변에 위치하였지만 생각보다 조용한 소음", src: "/img/용인동천자이전경.png"},
      { desc: "작지만 아기자기한 단지로 구성", src: "/img/용인동천자이단지.png" },
      { desc: "뒤에 산책로가 있어서 건강을 챙기기 좋음", src: "/img/용인동천자이산책.png"},
      { desc: "근처에 도보로 갈 수 있는 큰 도서관이 있어요. ", src: "/img/용인동천자이도서관.png"}
    ],
    desc: "[아파트] 월세 : 3,000/95(13층) | 전세 : 2억 5,700(15층) | 매매 : 3억 5,000(8층)",
    pros: ["대로변임에도 조용한 편", "동천역 7분 소요", "뒤에 동산 산책하기 좋음","단지가 아기자기하게 잘 구성되어 있음","속초시외버스터미널 도보 5분"," 초중고 인근"],
    cons: ["뒤에 산이라 벌레가 많음", "터널 사이에 있는 아파트라서 휑함", "단지가 작아서 아쉬움","상가가 아쉬움"]
  },
  {
    title: "[충청북도 충주시] 충주 2차 푸르지오",
    lat: 36.977043998366,
    lng: 127.94454206201,
    images: [
      { desc: "적은 단지 수에 비해 굉장히 깔끔하게 구성되어 있어요.", src: "/img/충주푸르지오전경.png"},
      { desc: "도보 입구가 정문문에, 주차장이 안쪽에 위치해있는 좋은 구성이에요.", src: "/img/충주푸르지오후문.png" },
      { desc: "107동은 어린이집이 있어서 시끄러울 수도 있어요.", src: "/img/충주푸르지오어린이집.png"},
      { desc: "지하와 지상 주차장 구비되어 있으니 주차 걱정은 없어요.", src: "/img/충주푸르지오주차장.png"},
      { desc: "101동은 건너편에 도시 개발이 예상되니 뷰가 막힐 수도 있어요.", src: "/img/충주푸르지오대로변.png"}
    ],
    desc: "[아파트] 월세 : 2,000/80(7층) | 전세 : 2억 6,000(21층) | 매매 : 2억 9,000(17층)",
    pros: ["단지 사이가 넓어서 사생활 보호가 잘됨", "옆이 도시개발 구역이어서 발전 가능성 있음", "조용한 동네라는 장점","단지가 넓어서 강아지 산책하기 좋음","버스 정류장이 바로 앞에 있음"],
    cons: [ "단지 수가 작아서 아쉬움","주변 상가가 아쉬움","주변 공공시설이 부족함"]
  },
   {
    title: "[충청남도 아산시] 아산 칸타빌 센트럴시티",
    lat: 36.7841364822927,
    lng: 126.997819469051,
    images: [
      { desc: "신축으로 바로 입주가 가능함", src: "/img/아산칸타전경.png"},
      { desc: "하지만 집까지 다소 언덕이 있다는 점", src: "/img/아산칸타언덕.png" },
      { desc: "전통시장이 도보 5-7분이면 도착해서 번화가까지 가기 좋음", src: "/img/아산칸타시장.png"},
      { desc: "도보 15분 정도에는 1호선 온양온천역이 있음", src: "/img/아산칸타지하철.png"}
    ],
    desc: "[주상복합] 월세 : 정보 없음 | 전세 : 1억 7,500 | 매매 : 2억 5,710(30층)",
    pros: ["도보 13분 온양온천역 있음", "신축 건물임", "도보 5분거리 전통시장이 있음","집 근처에 요양병원이 있음","주변에 하천이랑 쉼터가 있어서 휴양할 수 있음"],
    cons: [ "입구가 언덕이라서 아쉬움","한참 공사가 많이 진행중임","아직 입주 중이라서 상가가 안들어옴"]
  },
  {
    title: "[전라남도 순천시] 골드클래스 시그니처",
    lat: 34.9591782531756,
    lng: 127.524020952618,
    images: [
      { desc: "깔끔하게 구성되어있는 아파트", src: "/img/순천골드전경.png"},
      { desc: "바로 앞에 아동병원과 동네 마트가 있어서 상당히 인프라가 좋음", src: "/img/순천골드마트.png" },
      { desc: "상가에는 유명한 브랜드들이 많이 입점해있음", src: "/img/순천골드상가.png"},
      { desc: "도보 5분거리에는 대형병원이 있다는 가장 큰 장점이 있음", src: "/img/순천골드순천병원.png"}
    ],
    desc: "[아파트] 월세 : 2,000/90(6층) | 전세 : 3억(1층) | 매매 : 4억 1,000(2층)",
    pros: ["도보 3분 홈플러스 있음", "도보 5분 순천병원어서 응급상황시 치료가능", "바로 앞에 여성아동병원있어서 애들 키우기 좋음"],
    cons: [ "금연아파트 지정되어서 흡연자한테 비추","주변에 공원을 가려면 20분 걸어가야함","지상 주차장밖에 없어서 주차 조금 힘듦"]
  },
  {
    title: "[경상남도 창원시]	노블파크 아파트",
    lat: 35.235240818521,
    lng: 128.66692921613,
    images: [
      { desc: "단지 수가 꽤 되는 만큼 단지내 인프라가 좋음", src: "/img/창원노블전경.png"},
      { desc: "지하와 지상 주차장 구비되어 있으니 주차 걱정없음", src: "/img/창원노블주차.png" },
      { desc: "세대 수가 많은 만큼 상가도 1-2동으로 이루어져 있음", src: "/img/창원노블상가.png"},
      { desc: "114동앞에는 도서관이 있어서 더운 여름날 시원하게 즐길 수 있음", src: "/img/창원노블도서관.png"}
    ],
    desc: "[아파트] 월세 : 정보없음 | 전세 : 정보없음 | 매매 : 5억 1,381(30층)",
    pros: ["단지가 넓음", "대형마트 차량 5분", "아파트 내 상가가 많아서 좋음","바로 앞에 대상공원이 있어서 뷰가 좋음","사방에 공원이 있어서 반려동물 키우기 좋음","2028년 창원 스타필드 준공 예정"],
    cons: [ "근처 중앙시장은 조금 낡음","구축인만큼 다소 집이 낡음, 리모델링 필요","앞에 주경기장이 있는 만큼 거의 주말마다 시끄러움"]
  },
  {
    title: "[제주도 제주시]	삼화사랑으로부영 2차아파트",
    lat: 33.514077289651,
    lng: 126.57447017635,
    images: [
      { desc: "색감이 따스한 아파트 전경입니다.", src: "/img/제주부영전경.png"},
      { desc: "지하와 지상 주차장 구비되어 있으니 주차 걱정없어요", src: "/img/제주부영주차.png" },
      { desc: "깔끔하게 정돈된 단지로 조경이 잘되어있는 것이 특징입니다.", src: "/img/제주부영분위기.png"},
      { desc: "정문 건너편에 동네 마트가 있습니다.", src: "/img/제주부영마트.png"},
      { desc: "단지 근처에는 벚꽃 거리가 있어서 좋습니다", src: "/img/제주부영벚꽃.png"}
    ],
    desc: "[아파트] 월세 : 4,500/100(3층) | 전세 : 3억 1,000(12층) | 매매 : 5억 1,200(6층)",
    pros: ["바로 앞에 마트,다이소가 있어서 좋음", "근처에 강이 있어서 제주의 느낌이 많이 나게됨", "벚꽃이 이쁘게 핀 동네가 좋음","제주국제공항 차량 20분"],
    cons: ["낮은 층수가 많음","구축인만큼 다소 집이 낡음, 리모델링 필요","단지내 커뮤니티 시설이 없어서 비추함","번화가까지 다른 아파트보다 다소 멀다고 느낌"]
  },
  {
    title: "[부산 해운대구] 엘시티",
    lat: 35.161910196177,
    lng: 129.1682844778,
    images: [
      { desc: "아파트가 정말 높아서 부산의 랜드마크라고 불림", src: "/img/부산엘시티전경.png"},
      { desc: "주차는 지하만 있지만 워낙 상가가 많아서 주차는 넉넉함", src: "/img/부산엘시티주차.png" },
      { desc: "해운대역에서는 도보 20분 정도 걸리는 교통", src: "/img/부산엘시티지하철.png"},
      { desc: "아파트 도보 1분거리에 해운대가 보인다는 최대 장점", src: "/img/부산엘시티해운대.png"}
    ],
    desc: "[주상복합] 월세 : 2억/480(41층) | 전세 : 11억 5,000(63층) | 매매 : 26억 9,500(21층)",
    pros: ["해운대 바다 1분거리라서 뷰가 미쳤음", "1-5층까지 상점가가 즐비함", "해운대 메인거리인 만큼 맛집이 많음","해운대 구청까지 도보 5분내로 갈 수 있음","수영장 회원권으로 수영할 수 있음","커뮤니티 시설이 다양함"],
    cons: ["해운대역까지 도보20분이라서 다소 멀다고 느낌","왕래가 많은 주상복합이라서 상가의 보안의 필요성이 있음","번화가까지 다른 아파트보다 다소 멀다고 느낌"]
  },
  {
    title: "[대구 중구] 대봉 서한 포레스트",
    lat: 35.8602181029507,
    lng: 128.601418656846,
    images: [
      { desc: "아파트가 정말 높아서 부산의 랜드마크라고 불림", src: "/img/대구포레스트전경.png"},
      { desc: "아파트 입구 도보 1분안에 버스정류장이 있음", src: "/img/대구포레스트버스.png" },
      { desc: "지상주차를 통해 집과 인도의 거리를 벌려두었음", src: "/img/대구포레스트주차.png"},
      { desc: "경대병원역/건들바위역/대봉교역 근처 교통 편리", src: "/img/대구포레스트지하철.png"}
    ],
    desc: "[주상복합] 월세 : 2,000/100(3층) | 전세 : 2억 5,000(6층) | 매매 : 4억 5,300(25층)",
    pros: ["대구백화점/봉리단길/김광석길 인접", "경대병원역 도보 6분 소요", "경북대학교 병원까지 도보 15분이면 감","동성로 봉리단길 방향이라서 주변에 맛집이 많음","주변 초중고 있음","행정복지센터가 있음"],
    cons: ["세대 수가 작아서 별로 커뮤니티시설이 다양하지 않음","집 주변이 전부 아파트여서 답답함","주변에 산책이나 취미를 즐길 만한 것이 없음"]
  },
  {
    title: "[인천 연수구]송도 더샵 센트럴시티",
    lat: 37.373742230721,
    lng: 126.64926934427,
    images: [
      { desc: "신도시 메카라고 불리는 송도 더샵 센트럴시티 입구", src: "/img/송도더샵전경.png"},
      { desc: "정문에 드롭존이 있어서 안전하게 아이들 등하교가 가능함", src: "/img/송도더샵드롭.png" },
      { desc: "주차는 지상 지하 모두 있어서 주차 걱정은 없어 보임", src: "/img/송도더샵주차.png"},
      { desc: "송도센트럴오피스텔 근처 상가에 gs리프레시 마트가 있음", src: "/img/송도더샵상가.png"},
      { desc: "도보 5분거리에 걷기 좋은 평지로 공원이 2개가 있음", src: "/img/송도더샵공원.png"}
    ],
    desc: "[주상복합] 월세 : 1억/56(3층) | 전세 : 3억 5,000(6층) | 매매 : 6억 3,400(38층)",
    pros: ["지식정보단지역 인천1호선까지 도보 13분", "송도 국제도시인 만큼 주변이 매우 깨끗함", "학생,직장인들 많음","주변에 대학교와 직장이 있어서 맛집이 많음"],
    cons: ["관리비가 많이 나오는 편","GTX 소식이 없음","난방비 많이 나오는 편","직장인들이 많아서 퇴근길이 막힘"]
  },
   {
    title: "[광주 광산구] 신창동 유탑유블레스 리버뷰 아파트",
    lat: 35.189306285389,
    lng: 126.84417751989,
    images: [
      { desc: "바로 옆 광주보건대학교가 위치한 신창동 유탑유블레스리버뷰아파트", src: "/img/광주유탑전경.png"},
      { desc: "주차는 지상 지하 모두 있어서 주차 걱정은 없어 보임", src: "/img/광주유탑주차.png" },
      { desc: "단지내에는 테니스 장이 크게 하나 있음", src: "/img/광주유탑테니스장.png"},
      { desc: "주변 상가는 아직 크게 없어보임", src: "/img/광주유탑상가.png"}
    ],
    desc: "[아파트] 월세 : 1억/85(20층) | 전세 : 3억(7층) | 매매 : 3억 9,500(13층)",
    pros: ["근처 교육청이 있어서 직장 다니기 좋음", "영산강/수변공원 조망", "광주보건대학교 옆이라서 싼 맛집들이 있음","주변 산책로/공원/숲세권/역사문화공원 인접"],
    cons: ["대학교가 바로 옆에 있어서 행사하면 시끄러움","단지 상가가 빈약함","번화가까지 조금 도보로 걸어가야함","초등학교가 도보로 10분 걸림"]
  },
  {
    title: "[대전 유성구]	장대 푸르지오",
    lat: 36.360751779624,
    lng: 127.33350441222,
    images: [
      { desc: "메인 학교,직장의 중간점인 장대 푸르지오", src: "/img/대전장대전경.png"},
      { desc: "마주보는 형태와 주차장이 다소 부족해보임", src: "/img/대전장대구조.png" },
      { desc: "단지 옆 소공원이 위치해있음", src: "/img/대전장대소공원.png"},
      { desc: "106동은 입구가 약간 언덕에 위치함", src: "/img/대전장대106동.png"}
    ],
    desc: "[아파트] 월세 : 5,000/93(14층) | 전세 : 3억 2,000(11층) | 매매 : 4억 8,000(3층)",
    pros: ["유성 재래시장 인근이라서 장보기 용이함", "도시 첨단 산업단지가 있어서 수요가 많음", "구암역 도보 5분 소요","주변 유성천 인접하여 산책하기 좋음"],
    cons: ["주차자리가 다소 부족함","바로 근처 충남대학교가 있어서 시끄러움","아파트 구조가 약간 사생활 보호가 안됨","단지내 피트니스 센터 부재"]
  },
  {
    title: "[울산 울주군] 천상 필그린 아파트",
    lat: 35.561914792702,
    lng: 129.23051947715,
    images: [
      { desc: "한개의 동으로 이루어진 소규모 아파트", src: "/img/울산필그린전경.png"},
      { desc: "주변 상가로는 다이소,이디야 등이 입점해있음", src: "/img/울산필그린상가.png" },
      { desc: "주변 천상 공원이 위치해있어서 산책하기 좋은 위치", src: "/img/울산필그린공원.png"},
      { desc: "문화예술회관과 체육공원이 도보 15분 내외로 갈 수 있는 문화생활 특화 아파트", src: "/img/울산필그린문화.png"}
    ],
    desc: "[아파트] 월세 : 3,000/45(10층) | 전세 :1억 7,000(7층) | 매매 :2억 8,000(12층)",
    pros: ["올 리모델링으로 되게 깨끗한 집", "다이소 올리브영같은 편의시설이 많음", "차로 MBC와 가까움","근처 문화를 즐길 수 있는 요소가 많음"],
    cons: ["주차자리가 다소 부족함","대중교통이 불편함","옆이 도시개발 구역이라서 공사판임","단지 수 부족 및 피트니스 센터 부재"]
  },
  {
    title: "[세종 새롬북로] 새뜸마을 4단지",
    lat: 36.486550655802,
    lng: 127.24647322839,
    images: [
      { desc: "롯데캐슬이 만든 19개 동의 아파트", src: "/img/세종새뜸전경.png"},
      { desc: "마트는 상가에 입점해있습니다", src: "/img/세종새뜸마트.png" },
      { desc: "롯데캐슬답게 피트니스 시설이 최고로 보입니다", src: "/img/세종새뜸시설.png"},
      { desc: "후문에 긴 길따라 산책코스를 아파트가 만들어두었네요", src: "/img/세종새뜸산책.png"}
    ],
    desc: "[아파트] 월세 : 3,000/110(18층) | 전세 :2억 5,000(16층) | 매매 :6억 6,800(7층)",
    pros: ["단지가 진짜 넓어서 반려견 산책에 최적화됨", "피트니스 시설 최고급으로 구비", "근처가 다 아파트 단지라서 체인점들이 주변에 많다","집 근처 근린 공원이 있어서 머리 환기하기 좋다"],
    cons: ["단지가 진짜 넓어서 너무 멀다","대중교통이 불편함","옆이 도시개발 구역이라서 초등학교 뒤로 아무것도 없음","공유기 KT로 강제써야함"]
  },
  {
    title: "[서울 강남구] 타워팰리스2차",
    lat: 37.489361620873,
    lng: 127.05489077402,
    images: [
      { desc: "학군과 위치가 훌룡한 입지에 위치함", src: "/img/대치팰리스전경.png"},
      { desc: "3호선 도곡역 입구에서 정문까지 도보 2분 소요", src: "/img/대치팰리스지하철.png" },
      { desc: "가을 단풍로 유명한 양재천길에서 도보 5분 소요 ", src: "/img/대치팰리스양재천.png"}
    ],
    desc: "[주상복합] 월세 : 5,000/320| 전세 :	12억 | 매매 :	20억",
    pros: ["도곡역 3분거리", "근처 강남 세브란스 병원, 도곡 공원 인접", "중앙부속 고등학교 숙명여자 고등학교 등 학군 최고","집 바로 앞 양재천에서 산책하기 좋음","수인분당선과 3호선 교차 지역"],
    cons: ["초중고등학교 인접해서 애들이 많이 산다","단지 수가 2개여서 너무 적다.","근처에 맛있는 맛집이 별로 없다"]
  },
  {
    title: "[서울 강남구] PH129",
    lat: 37.5259558961367,
    lng: 127.054236542629,
    images: [
      { desc: "너무나도 유명한 연예인 한강뷰 집 PH129 입니다.", src: "/img/청담PH전경.png"},
      { desc: "한강 뷰가 보이는 집 답게 집 바로 앞은 도로변과 한강으로 구성되어 있어요. 대로변 앞이기에 조금은 소음이 있을 수 있어요.", src: "/img/청담PH한강.png" },
      { desc: "도보로 5-6분 정도 걸어가면 청담 명품 거리가 펼쳐져서 좋네요.", src: "/img/청담PH거리.png"},
      { desc: "통행 차량이 많아서 자차를 몰고 다니시면 조금 불편하실 수도 있어요.", src: "/img/청담PH교통.png"}
    ],
    desc: "[아파트] 월세 : 20억/2,300(6층)| 전세 :	100억(4층) | 매매 :	138억(6층)",
    pros: ["한강뷰여서 시야가 좋다", "근처 한강공원이 가깝기 때문에 쉬는 날 시간 보내기 좋다", "단지 수가 적음에도 불구하고 지하 주차장이 넓다","청담동 명품거리와 가까워서 쇼핑을 하기 좋다","근처 청담근린공원,주민센터등이 도보 5분내로 이동 가능하다"],
    cons: ["집 앞으로 도로가 있기 때문에 저층은 다소 만족도가 떨어진다","교통체증이 있다","청담역과 압구정로데오역과 도보로 가기 조금 멀다","가격이 과하게 측정되었다"]
  },
   {
    title: "[부산 해운대구]	해운대 자이 2차",
    lat: 35.168202477546,
    lng: 129.1443108349,
    images: [
      { desc: "주변에 병원,노인정,교회등이 가까워 노인 분들의 선호도가 높은 해운대 자이 2차 입니다", src: "/img/부산자이전경.png"},
      { desc: "1차는 비교적 평지에 위치하지만, 2차 단지의 경우 약간 언덕이 있어서 알아두셔야 합니다.", src: "/img/부산자이언덕.png" },
      { desc: "도보로 6-8분 정도 걸어가면 벡스코역이 인접해있어서 교통은 좋습니다.", src: "/img/부산자이지하철.png"}
    ],
    desc: "[아파트] 월세 : 1,500/130(14층)| 전세 :	3억 4,000(22층) | 매매 :	7억 3,800(16층)",
    pros: ["근린생활시설이 2개로 이루어져서 널널하게 이용할 수 있다", "지하철역이랑 가깝다", "도보로 2분내로 노인정과 교회, 해운대 자명병원이 있다","노인분들이 살기 좋은 아파트","벡스코역까지 도보 10분내로 갈 수 있다"],
    cons: ["1차에 상가가 많은데 2차는 상가가 별로 없음","언덕이어서 도보 이동시 조금 힘들다","노인들이 많이 살기에 젊은 사람한테 오지랖이 많음","주변 초등학교,중학교가 없다"]
  },
  {
    title: "[부산 해운대구] 해운대 아이파크",
    lat: 35.156206667397,
    lng: 129.14318547187,
    images: [
      { desc: "해운대 바다 바로 앞에 위치한 하이엔드 아파트 아이파크입니다.", src: "/img/부산아이파크전경.png"},
      { desc: "근처에는 아이파크 공원이 정말 넓게 조성되어있어서 산책하는 주민들이 많습니다.", src: "/img/부산아이파크공원.png" },
      { desc: "전층에서 해운대 바다를 볼 수 있다는 가장 큰 장점!", src: "/img/부산아이파크바다.png"},
      { desc: "하지만 동백역까지 도보 20분정도 소요되어서 자차가 있으면 좋을 것 같습니다.", src: "/img/부산아이파크지하철.png"}
    ],
    desc: "[주상복합] 월세 : 2,000/200(30층)| 전세 : 4억 (36층) | 매매 : 8억 800(13층)",
    pros: ["해운대가 도보 1분거리에 위치해 전층에서 오션 뷰로 즐길 수 있다", "도보 2분 정도로 아이파크 공원이 되게 넓게 구성되어 있어서 좋다", "단지내에 하얏트호텔과 해양진흥원이 입점해있어서 상가에 체인점이 많다","주차장이 넓어서 주차 걱정이 없다"],
    cons: ["주변에 대중교통이 다소 미흡함, 자차가 있어야 좋은 집","저층은 오션뷰이긴 하나 사람들도 굉장히 잘보임","상가가 많아서 조금 소란스러운 편이라고 생각함","동백역까지 도보 20분이나 걸림"]
  },
  {
    title: "[경기도 성남시] 목련마을 SK 아파트",
    lat: 37.406053994251,
    lng: 127.15508329308,
    images: [
      { desc: "판교 IT업계 종사자라면 구매를 고려해보는 아파트 중 한곳이 바로 성남 SK아파트", src: "/img/성남SK전경.png"},
      { desc: "도보로 판교테크노파크가 위치해있어서 직장인들이 머물기 좋은 아파트", src: "/img/성남SK회사.png" },
      { desc: "아파트 뒤쪽으로 산이 위치해서 등산하기에는 좋으나 벌레 조심해야합니다", src: "/img/성남SK산.png"}
    ],
    desc: "[아파트] 월세 : 1억 2,500/85(11층)| 전세 :3억 1,500(12층) | 매매 : 5억 7,500(9층)",
    pros:["버스정류장이 도보 1~2분 거리에 있어 대중교통 이용이 매우 편리하다","단지 주변에 산과 탄천이 가까워 산책이나 야외 활동, 자연환경을 즐기기에 좋다","단지 내외가 조용하고 치안이 좋아 가족 단위 거주에 적합하다","초등학교, 어린이집, 학원이 근처에 많아 아이 키우기에 좋은 환경이다"],
    cons:["아파트가 28년 이상 된 구축이라 시설이 다소 노후되고 유지·관리비가 높을 수 있다","주차 공간이 부족해 늦은 시간에는 주차가 어려운 편이다","편의시설과 상권이 풍부하지 않아 대형마트나 상업시설 이용 시 야탑역 쪽으로 이동해야 한다","노후로 인해 벌레(바퀴벌레, 모기 등)와 층간소음, 환기 문제 등이 발생할 수 있다"]
  },
  {
    title: "[경기도 성남시] 더샵 분당 파크리버",
    lat: 37.3554182357718,
    lng: 127.116265837206,
    images: [
      { desc: "판교 IT업계 테크노파크와 차량 10분 출근이 가능한 분당 파크 리버 아파트", src: "/img/성남더샵파크전경.png"},
      { desc: "집 앞 도보 2분 탄천을 끼고 공원이 넓게 조성되어 있어서 좋다", src: "/img/성남더샵파크공원.png" },
      { desc: "키즈스테이션,시니어존과 같이 부대시설이 다양해서 입주민의 편의를 돕는다", src: "/img/성남더샵파크단지.png"}
    ],
    desc: "[아파트] 월세 : 4억 5,000/120(9층)| 전세 :	7억4,000 | 매매 : 12억(13층)",
    pros: ["단지 앞 탄천과 뒤 불곡산, 정자공원이 인접해 쾌적한 자연환경과 산책로를 누릴 수 있다","2021년 입주한 신축 아파트로 내부와 커뮤니티 시설이 현대적이고 쾌적하다","이마트, 분당서울대병원, 다양한 편의점 등 생활 인프라가 도보권에 위치해 편리하다"],
    cons: ["가장 가까운 지하철역(미금역)까지 도보 12분 이상 소요되어 역세권이라고 보기엔 다소 거리가 있다","신축 단지임에도 인근 상권이 아직 활성화되지 않아 일부 상업·문화시설은 차량 이동이 필요하다","분당 내에서도 비교적 높은 분양가와 관리비 부담이 있을 수 있다"]
  },
   {
    title: "[경기도 성남시] 더샵 판교 퍼스트파크",
    lat: 37.3840447298609,
    lng: 127.093494941924,
    images: [
      { desc: "판교 테크노파크로 자차로 10분이면 가는 위치에 있어 고려하기 좋음 ", src: "/img/성남더샵퍼스트전경.png"},
      { desc: "주변 상가에는 뭐가 많지는 않아서 테크노 파크 방향에 번화가가 이루어져있음", src: "/img/성남더샵퍼스트주변.png" },
      { desc: "지하철 도보 생활권은 아니지만, 도보 1분 앞에 버스 정류장과 도로가 잘 되어 있기에 활용 가능", src: "/img/성남더샵퍼스트버스.png"},
      { desc: "103동은 상가가 1층에 있어서 냄새나 소음에 유의하고 구매 바람", src: "/img/성남더샵퍼스트상가.png"}
    ],
    desc: "[아파트] 월세 : 7억 5,100/12(8층)| 전세 :	8억(21층) | 매매 :13억 6,000(13층)",
    pros: ["단지 4면이 모두 녹지로 둘러싸여 쾌적한 자연환경과 산책로를 누릴 수 있다","7500㎡ 규모의 대형 커뮤니티(게스트하우스, 골프연습장, 피트니스센터, 사우나, 독서실 등)와 첨단 스마트홈 시스템이 있다","판교, 정자, 강남 등 주요 지역 접근성이 좋고, 신분당선·분당선·경강선 등 지하철과 인접하다"],
    cons: ["판교신도시 남서쪽 끝자락에 위치해 판교역 등 지하철역까지 도보 접근성이 떨어지고, 대중교통이 다소 불편하다","방 크기가 다소 작고 천장 높이도 평범해 개방감이 부족하다","주차 공간이 넉넉하지 않아 주차가 불편할 수 있다"]
  },
  {
    title: "[서울 송파구] 송파동 삼성 래미안",
    lat: 37.505016510092,
    lng: 127.12018432289,
    images: [
      { desc: "레미안이라는 명성답게 깔끔하고 무난한 집", src: "/img/송파레미안전경.png"},
      { desc: "105동은 단지 어린이집이 도보로 갈 수 있기에 아기가 가족에게 추천하는 매물", src: "/img/송파레미안어린이집.png" },
      { desc: "도보권으로 이동가능한 잠실 타워와 바로 건너편에는 넓직한 공원이 인접함", src: "/img/송파레미안주변.png"}
    ],
    desc: "[아파트] 월세 : 5억/48(7층)| 전세 : 6억 8,000(18층) | 매매 :16억 3,500(18층)",
    pros: ["오금공원, 올림픽공원 등과 인접해 쾌적한 자연환경이 있다","헬스장, 독서실, 경로당 등"," 8호선 송파역 도보 12~15분 거리에 위치"],
    cons: ["2001년 준공된 20년 이상 구축 아파트라서 인테리어 필요함","방음이 취약하다, 이웃 잘못 걸리면 먼저 이사가는게 나음","강남 등 주요 업무지구까지는 환승이 필요함"]
  },
  {
    title: "[서울 송파구] 송파 파크데일 2단지",
    lat: 37.496398631492,
    lng: 127.15781833281,
    images: [
      { desc: "굉장히 단지가 깨끗하고 조용한 송파 파크데일입니다", src: "/img/송파파크전경.png"},
      { desc: "도서관도 단지내에 위치해 있고 정문 바로 앞에는 대형유치원, 도보로는 학교들이 있으니 아이가 있으면 좋을 것 같네요", src: "/img/송파파크도서관.png" },
      { desc: "파크데일은 테니스장,경로당 이런 취미를 즐길 수 있는 커뮤니티 시설들이 많아서 추천합니다.", src: "/img/송파파크시설.png"},
      { desc: "큰 동네 마트가 앞에 위치해 있으니 좋네요", src: "/img/송파파크마트.png"}
    ],
    desc: "[아파트] 월세 : 1억 9,000/90(2층)| 전세 : 1억 5,551(5층)| 매매 : 8억 4,000(14층)",
    pros: ["마천역(5호선)까지 도보 8~10분 거리","단지 주변이 조용하고 숲세권 느낌이 강함","주차장이 넓고, 경비 및 보안이 철저해 안전하게 생활 가능함"],
    cons: ["단지가 송파구 외곽에 위치해 강남 등 주요 업무지구 접근성은 다소 떨어진다","대형 상업시설이 가까이 있지 않아 쇼핑 편의성은 다소 부족","2011년 준공된 준신축 아파트치고 너무 구조가 올드함","세대당 주차 대수가 1.08대로 차량이 많은 가구에는 주차가 부족"]
  },
  {
    title: "[서울 송파구] 송파 시그니처 롯데캐슬",
    lat: 37.4970276224235,
    lng: 127.147225273858,
    images: [
      { desc: "판교 테크노파크로 자차로 10분이면 가는 위치에 있어 고려하기 좋음 ", src: "/img/성남SK전경.png"},
      { desc: "주변 상가에는 뭐가 많지는 않아서 테크노 파크 방향에 번화가가 이루어져있음", src: "/img/성남SK회사.png" },
      { desc: "지하철 도보 생활권은 아니지만, 도보 1분 앞에 버스 정류장과 도로가 잘 되어 있기에 활용 가능", src: "/img/성남SK산.png"},
      { desc: "103동은 상가가 1층에 있어서 냄새나 소음에 유의하고 구매 바람", src: "/img/성남SK산.png"}
    ],
    desc: "[아파트] 월세 : 5억/48(7층)| 전세 : 6억 8,000(18층) | 매매 :16억 3,500(18층)",
    pros: ["5호선 거여역, 마천역이 도보권에 위치한 더블 역세권"," 다이닝카페, 피트니스·골프클럽, 게스트룸 등 대형 커뮤니티시설","남한산성·성내천·올림픽공원 등 자연환경과 가까워 산책 및 야외활동이 편리","초등학교, 도서관, 학원가 도보권","타필드위례·가든파이브 등 쇼핑·생활을 즐기기 좋음"],
    cons: ["거여2-1구역 재개발지로 주변에 아직 정비되지 않은 구역","일부 세대에서 층간소음, 방음, 벌레 등 생활 불편함, 집 별로 너무 랜덤임","2011년 준공된 준신축 아파트치고 너무 구조가 올드함","단지 내 초등학교가 분할되어 있어 일부 세대는 통학 거리가 길어질 수 있다"]
  },
];

let currentIndex = 0;

function initMap() {
  map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(37.5665, 126.9780),
    zoom: 13
  });

  houseData.forEach((house, index) => {
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(house.lat, house.lng),
      map: map,
      title: house.title
    });

    marker.addListener('click', () => {
      showHouseInfo(index);
    });

    markers.push(marker);
  });

  // 첫 번째 집 정보는 기본으로 보여줌
  //showHouseInfo(0);
}
  // 지도 전체 보기
function fitMapToMarkers() {
  // 지도 높이 확장
  const mapDiv = document.getElementById('map');
  mapDiv.style.height = '80vh'; // 원하는 높이로 조정
  //map.relayout(); // 지도 크기 변경 후 relayout 호출

   // 지도 리사이즈 이벤트 수동 발생
  naver.maps.Event.trigger(map, 'resize');
  
  setTimeout(() => {
    const bounds = map.getBounds();
    map.fitBounds(bounds);
  }, 300);

  // 모든 마커가 포함된 경계 설정
  const bounds = new naver.maps.LatLngBounds();
  markers.forEach(marker => {
    bounds.extend(marker.getPosition());
  });
  document.getElementById('fit-map-btn').style.display = 'none';
  document.getElementById('shrink-map-btn').style.display = 'block';
  // 지도 경계에 맞게 확대
  map.fitBounds(bounds);
}
function shrinkMap() {
  const mapDiv = document.getElementById('map');
  mapDiv.style.height = '400px';
  naver.maps.Event.trigger(map, 'resize'); // 반드시 추가!
  document.getElementById('fit-map-btn').style.display = 'block';
  document.getElementById('shrink-map-btn').style.display = 'none';
}

function moveToRegion(region) {
  const regions = {
    seoul:      { lat: 37.5665, lng: 126.9780, zoom: 11 },
    gyeonggi:   { lat: 37.4138, lng: 127.5183, zoom: 9 },
    gangwon:    { lat: 37.8228, lng: 128.1555, zoom: 9 },
    gyeongbuk:  { lat: 36.5760, lng: 128.5056, zoom: 9 },
    chungbuk:   { lat: 36.6357, lng: 127.4917, zoom: 9 },
    chungnam:   { lat: 36.5184, lng: 126.8000, zoom: 9 },
    jeonbuk:    { lat: 35.7167, lng: 127.1448, zoom: 9 },
    jeonnam:    { lat: 34.8161, lng: 126.4630, zoom: 9 },
    gyeongnam:  { lat: 35.4606, lng: 128.2132, zoom: 9 },
    jeju:       { lat: 33.4996, lng: 126.5312, zoom: 11 }
  };
  const target = regions[region];
  if (target) {
    map.setCenter(new naver.maps.LatLng(target.lat, target.lng));
    map.setZoom(target.zoom);
  }
}


function showHouseInfo(index) {
  const house = houseData[index];
  currentIndex = index;

  // 이미지 설정
const infoImage = document.getElementById('info-image');
const infoImageDesc = document.getElementById('info-image-desc'); // <span> 또는 <div>로 추가

infoImage.src = house.images[0].src;
infoImage.dataset.index = 0;
if (infoImageDesc) {
  infoImageDesc.textContent = house.images[0].desc;
}

  // 텍스트 정보
  document.getElementById('info-title').textContent = house.title;
  document.getElementById('info-desc').textContent = house.desc;

  // 결과가 준비되면 리뷰 섹션을 보이게!
  document.getElementById('review-section').style.display = 'block';
  // 리뷰 (pros/cons)
  const prosBox = document.getElementById('pros');
  const consBox = document.getElementById('cons');

  //prosBox.innerHTML = house.pros.map(item => `<div>${item}</div>`).join('');
  //consBox.innerHTML = house.cons.map(item => `<div>${item}</div>`).join('');
  prosBox.innerHTML = house.pros
  .map(item => `<div class="review-card review-cardgood">⭐${item}</div>`)
  .join('');

  consBox.innerHTML = house.cons
  .map(item => `<div class="review-card review-cardbad">⚠️${item}</div>`)
  .join('');

  // 문의 폼 메시지에 집 제목 자동 입력
  const inquiryForm = document.getElementById('inquiry-form');
  if (inquiryForm) {
    const textarea = inquiryForm.querySelector('textarea[name="message"]');
    if (textarea) {
      textarea.value = `[${house.title}] 문의합니다: `;
    }
  }
  // 폼 전송 후 성공 메세지임.
  document.addEventListener('DOMContentLoaded', function() {
    const inquiryForm = document.getElementById('inquiry-form');
    if (inquiryForm) {
      inquiryForm.addEventListener('submit', function(e) {
        e.preventDefault(); // 폼 기본 동작 막기
  
        fetch(this.action, {
          method: 'POST',
          body: new FormData(this),
          headers: { 'Accept': 'application/json' }
        }).then(response => {
          if (response.ok) {
            document.getElementById('inquiry-success').style.display = 'block';
            this.reset();
          } else {
            alert('문의 전송에 실패했습니다. 다시 시도해 주세요.');
          }
        });
      });
    }
  });

  // 스크롤 이동
  const infoBox = document.getElementById('showHouseInfo');
  if (infoBox) {
    infoBox.style.display = 'block';
    infoBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
   // 스크롤 시 약간의 여백추가
  setTimeout(() => {
    window.scrollBy({ top: -60, left: 0, behavior: 'smooth' });
  }, 400); // 스크롤 애니메이션이 끝날 때쯤 실행

}

// 좌우 버튼 이미지 넘기기
document.getElementById('prev-btn').addEventListener('click', () => {
  const house = houseData[currentIndex];
  const infoImage = document.getElementById('info-image');
  const infoImageDesc = document.getElementById('info-image-desc');
  let imgIndex = parseInt(infoImage.dataset.index, 10);

  imgIndex = (imgIndex - 1 + house.images.length) % house.images.length;
  infoImage.src = house.images[imgIndex].src;
  infoImage.dataset.index = imgIndex;

  if (infoImageDesc) {
    infoImageDesc.textContent = house.images[imgIndex].desc;
  }
});

document.getElementById('next-btn').addEventListener('click', () => {
  const house = houseData[currentIndex];
  const infoImage = document.getElementById('info-image');
  const infoImageDesc = document.getElementById('info-image-desc');
  let imgIndex = parseInt(infoImage.dataset.index, 10);

  imgIndex = (imgIndex + 1) % house.images.length;
  infoImage.src = house.images[imgIndex].src;
  infoImage.dataset.index = imgIndex;
  
  if (infoImageDesc) {
    infoImageDesc.textContent = house.images[imgIndex].desc;
  }
});

// 검색 기능
document.getElementById('search-btn').addEventListener('click', () => {
  const input = document.getElementById('search-bar').value.trim();
  const matchedHouses = houseData.filter(h => h.title.includes(input));
  const resultContainer = document.getElementById('result-cards');
  resultContainer.innerHTML = ''; // 기존 결과 제거

  if (matchedHouses.length > 0) {
    const bounds = new naver.maps.LatLngBounds();

    matchedHouses.forEach(house => {
      bounds.extend(new naver.maps.LatLng(house.lat, house.lng));

      const index = houseData.indexOf(house);

      const card = document.createElement('div');
      card.className = 'result-card';
      card.innerHTML = `
        <strong>${house.title}</strong>
        <p>${house.desc}</p>
      `;

      card.addEventListener('click', () => {
        showHouseInfo(index);
        map.setCenter(new naver.maps.LatLng(house.lat, house.lng));
      });

      resultContainer.appendChild(card);
    });

    map.fitBounds(bounds);

    // 첫 번째 집 표시
    //const firstIndex = houseData.indexOf(matchedHouses[0]);
    //showHouseInfo(firstIndex);

    //const infoBox = document.getElementById('showHouseInfo');
    //if (infoBox) {
     // infoBox.style.display = 'block';
     // infoBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    //}
  } else {
    alert('검색 결과를 찾을 수 없습니다.');
  }
});

// 추천 클릭하면 이동
document.querySelectorAll('.suggestion').forEach((suggestion, index) => {
  suggestion.addEventListener('click', () => {
    showHouseInfo(index);
    map.setCenter(new naver.maps.LatLng(houseData[index].lat, houseData[index].lng));
  });
});

// 맵 초기화
window.onload = function () {
  initMap();
};

// 버튼 보이기/숨기기
window.addEventListener("scroll", function() {
  const topBtn = document.getElementById("topBtn");
  if (window.scrollY > 300) {      // 300px 이상 스크롤 시 노출
    topBtn.style.display = "block";
  } else {
    topBtn.style.display = "none";
  }
});

// 클릭 시 상단 이동
document.getElementById("topBtn").onclick = function() {
  window.scrollTo({ top: 0, behavior: "smooth" });
};








//챗봇-온라인 임장 연결
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

window.onload = function () {
  initMap();
  const title = getQueryParam('title');
  if (title) {
    const idx = houseData.findIndex(h => h.title.includes(title));
    if (idx !== -1) {
      showHouseInfo(idx);
      map.setCenter(new naver.maps.LatLng(houseData[idx].lat, houseData[idx].lng));
    
      // // scrollIntoView만 호출 (window.scrollBy는 필요 없음)
      // const infoBox = document.getElementById('showHouseInfo');
      // if (infoBox) {
      //   infoBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // }
    } else {
      // 매칭 실패 안내
      alert('아직 준비 중인 집입니다. 곧 더 많은 임장정보를 제공할 예정이에요!');
    }
  }
};


/*
"아직 준비 중인 집입니다. 곧 더 많은 임장정보를 제공할 예정이에요!"

"죄송합니다. 해당 집의 임장정보는 현재 준비 중입니다. 빠른 시일 내에 업데이트하겠습니다!"

"이 집의 온라인 임장정보는 아직 등록되지 않았어요. 곧 새로운 정보를 만나보실 수 있습니다."

"아직 해당 매물의 임장정보가 등록되지 않았습니다. 조금만 기다려 주세요!"

"선택하신 집의 임장정보는 준비 중입니다. 더 좋은 정보로 곧 찾아뵙겠습니다."
*/