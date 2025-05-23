const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

async function fallback(req, res) {
    const fallbackMessages = [
      '죄송해요, 이해하지 못했어요. 다시 한 번 말씀해 주세요.',
      '제가 잘 이해하지 못했어요. 다른 방식으로 말씀해주실 수 있을까요?',
      '말씀하신 내용을 정확히 이해하지 못했어요. 다시 한번 알려주세요.',
      '음... 제가 정확히 알아듣지 못했어요. 조금 더 자세히 말씀해주세요.',
      '죄송합니다. 다시 한번 말씀해주시겠어요?'
    ];
    
    // 랜덤 메시지 선택
    const randomIndex = Math.floor(Math.random() * fallbackMessages.length);
    const message = fallbackMessages[randomIndex];
  
    // fulfillmentMessages 배열로 응답 구성
    const fulfillmentMessages = [
      {
        text: {
          text: [message]
        }
      }
    ];
  
    // JSON 응답 반환
    res.json({ fulfillmentMessages });
}


// 컨텍스트별 맞춤 폴백 메시지
const contextFallbackMessages = {
'awaiting_region': [
  "어떤 '광역시/도' 지역에서 집을 찾으시는지 알려주세요. 서울특별시, 충청남도 등의 지역을 선택해주세요.",
  '집을 찾으실 지역을 말씀해주세요. 예: 서울특별시, 경기도, 제주특별자치도 등',
  "어떤 지역의 집을 찾고 계신가요? '광역시/도' 단위로 알려주세요."
],
'awaiting_city': [
  '어떤 시나 군에서 집을 찾으실지 알려주세요.',
  '선택하신 지역 내의 어떤 시/군에서 집을 찾으시겠어요?',
  '어떤 시/군에서 집을 찾고 계신가요?'
],
'awaiting_district': [
  '어떤 구에서 집을 찾으실지 알려주세요.',
  '선택하신 도시의 어떤 구에서 집을 찾고 계신가요?',
  '어느 구를 찾으시나요?'
],
'awaiting_price': [
  '예산은 어느 정도로 생각하고 계신가요?',
  '집 구매 예산이 어떻게 되시나요?',
  '어느 가격대의 집을 찾고 계신가요?'
],
'awaiting_traffic': [
  '주로 이용하시는 교통수단은 무엇인가요?',
  '어떤 교통수단을 자주 이용하시나요?',
  '지하철, 버스, 자가용 중 주로 이용하시는 것은 무엇인가요?'
],
'awaiting_life_infra': [
  '주변에 필요한 생활 편의시설은 무엇인가요?',
  '집 주변에 어떤 시설이 있으면 좋겠나요?',
  '학교, 마트, 공원 등 필요한 시설이 있으신가요?'
]
};

const koreaRegions = [
'경기도', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도', '광역시/특별시(서울,세종)에서 찾기'
];

const regionCities = {
'경기도': [ '가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시',
    '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시',
    '시흥시', '안산시', '안성시', '안양시', '양주시', '양평군', '여주시', '연천군',
    '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시',
    '평택시', '포천시', '하남시', '화성시'],
'강원도': [ '고성군', '강릉시', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군',
           '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군',
           '홍천군', '화천군', '횡성군' ],
'충청북도': [ '괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군',
             '제천시', '증평군', '진천군', '청주시', '충주시' ],
'충청남도': [ '계룡시', '공주시', '금산군', '논산시', '당진시', '보령시',
             '부여군', '서산시', '서천군', '아산시', '예산군', '천안시',
             '청양군', '태안군', '홍성군' ],
'전라북도': [ '고창군', '군산시', '김제시', '남원시', '무주군', '부안군',
             '순창군', '완주군', '익산시', '임실군', '장수군', '전주시',
             '정읍시', '진안군' ],
'전라남도': [ '강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시',
             '담양군', '목포시', '무안군', '보성군', '순천시', '신안군',
             '여수시', '영광군', '영암군', '완도군', '장성군', '장흥군',
             '진도군', '함평군', '해남군', '화순군' ],
'경상북도': [ '경산시', '경주시', '고령군', '구미시', '김천시', '문경시',
             '봉화군', '상주시', '성주군', '안동시', '영덕군', '영양군',
             '영주시', '영천시', '예천군', '울릉군', '울진군', '의성군',
             '청도군', '청송군', '칠곡군', '포항시' ],
'경상남도': [ '거제시', '거창군', '고성군', '김해시', '남해군', '밀양시',
             '사천시', '산청군', '양산시', '의령군', '진주시', '창녕군',
             '창원시', '통영시', '하동군', '함안군', '함양군', '합천군' ],
'제주특별자치도': [ '서귀포시', '제주시' ],
'광역시/특별시(서울,세종)에서 찾기': [
  '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시'
]

// '서울특별시': [ '서울특별시' ],
// '부산광역시': [ '부산광역시' ],
// '대구광역시': [ '대구광역시' ],
// '인천광역시': [ '인천광역시' ],
// '광주광역시': [ '광주광역시' ],
// '대전광역시': [ '대전광역시' ],
// '울산광역시': [ '울산광역시' ],
// '세종특별자치시': [ '세종특별자치시' ]
};

const citiesWithDistrict = {
'서울특별시': [
  '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
  '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구',
  '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'
],

'부산광역시': [
  '강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구',
  '서구', '수영구', '연제구', '영도구', '중구', '해운대구'
],

'대구광역시': [
  '군위군', '남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'
],

'인천광역시': [
  '강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구'
],

'광주광역시': [
  '광산구', '남구', '동구', '북구', '서구'
],

'대전광역시': [
  '대덕구', '동구', '서구', '유성구', '중구'
],

'울산광역시': [
  '남구', '동구', '북구', '울주군', '중구'
],

'고양시': ['덕양구', '일산동구', '일산서구'],
'성남시': ['분당구', '수정구', '중원구'],
'안산시': ['단원구', '상록구'],
'안양시': ['동안구', '만안구'],
'용인시': ['기흥구', '수지구', '처인구'],
'수원시': ['장안구', '권선구', '팔달구', '영통구'],
'부천시': ['오정구', '원미구', '소사구'],

'청주시': ['상당구', '서원구', '청원구', '흥덕구'],
'천안시': ['동남구', '서북구'],

'전주시': ['덕진구', '완산구'],

'포항시': ['남구', '북구'],
'창원시': ['마산합포구', '마산회원구', '성산구', '의창구', '진해구'],


 // 구가 없는 시, 군
    '세종특별자치시': null,
'가평군': null, '양평군': null, '연천군': null,
'과천시': null, '광명시': null, '광주시': null, '구리시': null, '군포시': null,
'김포시': null, '남양주시': null, '동두천시': null, '시흥시': null, '안성시': null,
'양주시': null, '여주시': null, '오산시': null, '의왕시': null, '의정부시': null, 
'이천시': null, '파주시': null, '평택시': null, '포천시': null, '하남시': null, '화성시': null,
    '고성군': null, '강릉시': null, '동해시': null, '삼척시': null, '속초시': null, '양구군': null,
    '양양군': null, '영월군': null, '원주시': null, '인제군': null, '정선군': null, '철원군': null,
    '춘천시': null, '태백시': null, '평창군': null, '홍천군': null, '화천군': null, '횡성군': null,
'괴산군': null, '단양군': null, '보은군': null, '영동군': null, '옥천군': null, '음성군': null,  '제천시': null, '증평군': null, '진천군': null, '충주시': null,
    '계룡시': null, '공주시': null, '금산군': null, '논산시': null, '당진시': null, '보령시': null,
    '부여군': null, '서산시': null, '서천군': null, '아산시': null, '예산군': null, '청양군': null,
    '태안군': null, '홍성군': null,
'고창군': null, '군산시': null, '김제시': null, '남원시': null, '무주군': null, '부안군': null,
'순창군': null, '완주군': null, '익산시': null, '임실군': null, '장수군': null, '정읍시': null,
'진안군': null,
    '강진군': null, '고흥군': null, '곡성군': null, '광양시': null, '구례군': null, '나주시': null, '담양군': null, '목포시': null,
    '무안군': null, '보성군': null, '순천시': null, '신안군': null, '여수시': null, '영광군': null,
    '영암군': null, '완도군': null, '장성군': null, '장흥군': null, '진도군': null, '함평군': null,
    '해남군': null, '화순군': null,
'경산시': null, '경주시': null, '고령군': null, '구미시': null, '김천시': null, '문경시': null,
'봉화군': null, '상주시': null, '성주군': null, '안동시': null, '영덕군': null, '영양군': null,
'영주시': null, '영천시': null, '예천군': null, '울릉군': null, '울진군': null, '의성군': null,
'청도군': null, '청송군': null, '칠곡군': null,
    '거제시': null, '거창군': null, '고성군': null, '김해시': null, '남해군': null, '밀양시': null,
    '사천시': null, '산청군': null, '양산시': null, '의령군': null, '진주시': null, '창녕군': null,
    '통영시': null, '하동군': null, '함안군': null, '함양군': null, '합천군': null,
'서귀포시': null, '제주시': null
};


// 추천 함수
function recommendHouses(region, priceRange) {
  const regionData = houseDatabaseByRegionPrice[region];
  if (!regionData || !regionData[priceRange]) {
    // 데이터 자체가 없을 때
    return [
      { message: "해당 가격대 매물 희소" }
    ];
  }

  const { houses = [], message } = regionData[priceRange];

  // 희소 안내 메시지 우선
  if (message && houses.length === 0) {
    return [{ message }];
  }

  if (houses.length === 0) return [{ message: "해당 가격대 매물 희소" }];

  // 매물이 1~3개만 있을 때
  if (houses.length < 3) {
    const results = houses.map(h => formatHouse(h));
    // 남은 칸은 안내 메시지로 채움
    for (let i = houses.length; i < 3; i++) {
      results.push({ message: "실제 매물 더이상 없음" });
    }
    return results;
  }

  // 3개 이상 있을 때
  return houses.slice(0, 3).map(h => formatHouse(h));
}

// 매물 카드 포맷 함수
function formatHouse(house) {
  return {
    name: house.name,
    address: house.address,
    size: house.size,
    price: house.price,
    auction:"법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인",
    infra: house.infra
  };
}

function createHouseCards(recommended) {
  return recommended.map(house => {
    if (house.message) {
    return {
      type: "description",
      title: house.message,
      text: []
    };
  }
  return {
    type: "description",
    title: house.name,
    text: [
      house.address ? `주소: ${house.address}` : "",
      house.size ? `크기: ${house.size}` : "",
      `가격: ${house.price}`,
      house.infra ? `인프라: ${house.infra}` : "",
      house.auction ? `경매정보: 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인` : ""
    ].filter(Boolean)
  };
});
}



const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Webhook 핸들러
app.post('/webhook', async (req, res) => {
  try {
    const intentName = req.body.queryResult.intent.displayName;
    const contexts = req.body.queryResult.outputContexts || [];
    const parameters = req.body.queryResult.parameters || {};
    
    let fulfillmentMessages = [];
    let outputContexts = [];

    // 컨텍스트 관리 함수
    const setContext = (name, lifespan, params = {}) => {
      outputContexts.push({
        name: `${req.body.session}/contexts/${name}`,
        lifespanCount: lifespan,
        parameters: params
      });
    };

    // 재시도 횟수 추적 함수
    const trackConversationAttempts = (contextName) => {
      const attemptsContext = contexts.find(c => c.name.endsWith(`${contextName}_attempts`));
      const attempts = (attemptsContext?.parameters?.count || 0) + 1;
      setContext(`${contextName}_attempts`, 5, { count: attempts });
      return attempts;
    };

    // Welcome Intent 처리
    if(intentName === 'Default Welcome Intent') {
      fulfillmentMessages.push(
        { text: { text: ["안녕하세요! 부동산 추천 봇 입니다🤖"] } },
        { text: { text: ["어느 지역에서 집을 찾으시나요?"] } },
      );
      fulfillmentMessages.push({
        payload: {
          richContent: [[
            { type: "chips", options: koreaRegions.map(r => ({ text: r })) }
          ]]
        }
      });
      setContext('awaiting_region', 5);
    }

    // SelectRegion 처리
    else if(intentName === 'SelectRegion') {
    const region = parameters.region;
    if(!koreaRegions.includes(region)) {
      fulfillmentMessages.push({ text: { text: ["⚠️ 유효하지 않은 지역입니다."] }});
      fulfillmentMessages.push({
        payload: {
          richContent: [[
            { type: "chips", options: koreaRegions.map(r => ({ text: r })) }
          ]]
        }
      });
    } else {
      setContext('region_selected', 5, { region });

      // "광역시/특별시(서울,세종)에서 찾기"일 때는 '건너뛰기' 버튼을 빼고, 그 외에는 추가
      const cities = regionCities[region] || [];
      const cityChips = region === '광역시/특별시(서울,세종)에서 찾기'
        ? cities.map(c => ({ text: c }))
        : [...cities.map(c => ({ text: c })), { text: '건너뛰기' }];

      fulfillmentMessages.push({ text: { text: [`📍 ${region}을 선택하셨습니다. 어느 시/군을 찾으시나요?`] }});
      fulfillmentMessages.push({
        payload: {
          richContent: [[
            { type: "chips", options: cityChips }   // <<== 반드시 cityChips만 사용!
          ]]
        }
      });

      setContext('awaiting_city', 5);
    }
  }





    // SelectCity
    else if (intentName === 'SelectCity') {
      const city = parameters.city || parameters.district;
      const region = parameters.region || (contexts.find(c => c.name.endsWith('region_selected'))?.parameters.region);
      const regionContext = contexts.find(c => c.name.endsWith('region_selected'));

      if (!regionContext || !region) {
        fulfillmentMessages.push({ text: { text: ["⚠️ 먼저 지역을 선택해주세요."] }});
        fulfillmentMessages.push({
          payload: {
            richContent: [[
              { type: "chips", options: koreaRegions.map(r => ({ text: r })) }
            ]]
          }
        });
      } else {
        if (city === '건너뛰기') {
          setContext('city_selected', 5, { city: null });
          setContext('district_selected', 5, { district: null });
          fulfillmentMessages.push({ text: { text: [`📍 ${region} 전체에서 찾아드릴게요. 예산은 얼마인가요?`] }});
          fulfillmentMessages.push({
            payload: {
              richContent: [[
                { type: "chips", options: ['~2억','2억~5억','5억~10억','10억~15억','15억~20억','20억 이상'].map(p => ({ text: p })) }
              ]]
            }
          });
          setContext('awaiting_price', 5);
        } else {
          const allDistricts = Object.values(citiesWithDistrict).flat();
          if (allDistricts.includes(city)) {
            setContext('district_selected', 5, { district: city });
            fulfillmentMessages.push({ text: { text: [`📍 ${city}를(을) 선택하셨습니다. 예산은 얼마인가요?`] }});
            fulfillmentMessages.push({
              payload: {
                richContent: [[
                  { type: "chips", options: ['~2억','2억~5억','5억~10억','10억~15억','15억~20억','20억 이상'].map(p => ({ text: p })) }
                ]]
              }
            });
            setContext('awaiting_price', 5);
          } else {
            setContext('city_selected', 5, { city });
            const districts = citiesWithDistrict[city];
            if (districts) {
              fulfillmentMessages.push({ text: { text: [`📍 ${city}를(을) 선택하셨습니다. 어느 구를 찾으시나요?`] }});
              fulfillmentMessages.push({
                payload: {
                  richContent: [[
                    { type: "chips", options: [...districts.map(d => ({ text: d })), { text: '건너뛰기' }] }
                  ]]
                }
              });
              setContext('awaiting_district', 5);
            } else {
              fulfillmentMessages.push({ text: { text: [`📍 ${city}를(을) 선택하셨습니다. 예산은 얼마인가요?`] }});
              fulfillmentMessages.push({
                payload: {
                  richContent: [[
                    { type: "chips", options: ['~2억','2억~5억','5억~10억','10억~15억','15억~20억','20억 이상'].map(p => ({ text: p })) }
                  ]]
                }
              });
              setContext('awaiting_price', 5);
            }
          }
        }
      }
    }
      
  
  // SelectDistrict
    else if (intentName === 'SelectDistrict') {
      const district = parameters.district;
      const city = parameters.city || (contexts.find(c => c.name.endsWith('city_selected'))?.parameters.city);
      const cityContext = contexts.find(c => c.name.endsWith('city_selected'));
      if (!cityContext || !city) {
        fulfillmentMessages.push({ text: { text: ["⚠️ 먼저 시/군을 선택해주세요."] }});
        fulfillmentMessages.push({
          payload: {
            richContent: [[
              { type: "chips", options: koreaRegions.map(r => ({ text: r })) }
            ]]
          }
        });
      } else {
        if (district === '건너뛰기') {
          setContext('district_selected', 5, { district: null });
          fulfillmentMessages.push({ text: { text: [`📍 ${city} 전체에서 찾아드릴게요. 예산은 어느 정도인가요?`] }});
          fulfillmentMessages.push({
            payload: {
              richContent: [[
                { type: "chips", options: ['~2억','2억~5억','5억~10억','10억~15억','15억~20억','20억 이상'].map(p => ({ text: p })) }
              ]]
            }
          });
          setContext('awaiting_price', 5);
        } else {
          setContext('district_selected', 5, { district });
          fulfillmentMessages.push({ text: { text: [`📍 ${district}를(을) 선택하셨습니다. 예산은 얼마인가요?`] }});
          fulfillmentMessages.push({
            payload: {
              richContent: [[
                { type: "chips", options: ['~2억','2억~5억','5억~10억','10억~15억','15억~20억','20억 이상'].map(p => ({ text: p })) }
              ]]
            }
          });
          setContext('awaiting_price', 5);
        }
      }
    }
    
    
   // SelectPrice
    else if (intentName === 'SelectPrice') {
      const price = parameters.price_range;
      const validPrices = ['~2억', '2억~5억', '5억~10억', '10억~15억', '15억~20억', '20억 이상'];
      if (!validPrices.includes(price)) {
        const attempts = trackConversationAttempts('price');
        fulfillmentMessages.push({ text: { text: ["⚠️ 예산 형식을 인식하지 못했습니다. 버튼을 선택해주세요."] }});
        fulfillmentMessages.push({
          payload: {
            richContent: [[
              { type: "chips", options: validPrices.map(p => ({ text: p })) }
            ]]
          }
        });
      } else {
        setContext('price_selected', 5, { price });
        fulfillmentMessages.push({ text: { text: [`💰 예산 ${price}으로 설정되었습니다. 주 교통수단을 선택해주세요`] }});
        fulfillmentMessages.push({
          payload: {
            richContent: [[
              { type: "chips", options: ['지하철', '버스', '자가용', '도보', '자전거', '기타'].map(t => ({ text: t })) }
            ]]
          }
        });
        setContext('awaiting_traffic', 5);
      }
    }

  
      // SelectTraffic
    else if (intentName === 'SelectTraffic') {
      const traffic = parameters.traffic;
      const validTraffic = ['지하철', '버스', '자가용', '도보', '자전거', '기타'];
      
      console.log('traffic:', traffic);
      

      if (!validTraffic.includes(traffic)) {
        fulfillmentMessages.push({ text: { text: ["⚠️ 유효하지 않은 교통수단입니다."] }});
        fulfillmentMessages.push({
          payload: {
            richContent: [[
              { type: "chips", options: validTraffic.map(t => ({ text: t })) }
            ]]
          }
        });
      } else {
        if (traffic === '건너뛰기') {
          setContext('traffic_selected', 5, { traffic: null });
          fulfillmentMessages.push({ text: { text: ['교통수단 선택을 건너뛰셨습니다. 필요한 생활 편의시설을 선택해주세요'] }});
          const lifeInfraOptions = ['행정서비스', '대형마트&쇼핑몰', '맛집', '여가시설: 공원 등', '병원&약국', '문화시설: 영화관, 미술관 등', '교육시설: 학교, 학원 등', '건너뛰기'];
          fulfillmentMessages.push({
            payload: {
              richContent: [[
                { type: "chips", options: lifeInfraOptions.map(i => ({ text: i })) }
              ]]
            }
          });
          setContext('awaiting_life_infra', 5);
        } else {
          setContext('traffic_selected', 5, { traffic });
          fulfillmentMessages.push({ text: { text: [`🚗 ${traffic}(을)를 주요 교통수단으로 설정했습니다. 필요한 생활시설을 선택해주세요`] }});
          const lifeInfraOptions = ['행정서비스', '대형마트&쇼핑몰', '맛집', '여가시설: 공원 등', '병원&약국', '문화시설: 영화관, 미술관 등', '교육시설: 학교, 학원 등','건너뛰기'];
          fulfillmentMessages.push({
            payload: {
              richContent: [[
                { type: "chips", options: lifeInfraOptions.map(i => ({ text: i })) }
              ]]
            }
          });
          setContext('awaiting_life_infra', 5);
        }
      }
    }
      
  
      // SelectLifeInfra
    else if (intentName === 'SelectLifeInfra') {
      const lifeInfra = parameters.life_infra;
      const validInfra = ['행정서비스', '대형마트&쇼핑몰', '맛집', '여가시설: 공원 등', '병원&약국', '문화시설: 영화관, 미술관 등', '교육시설: 학교, 학원 등','건너뛰기'];
      
      console.log('lifeInfra:', lifeInfra);
      
      if (!validInfra.includes(lifeInfra)) {
        fulfillmentMessages.push({ text: { text: ["⚠️ 유효하지 않은 생활시설입니다."] }});
        fulfillmentMessages.push({
          payload: {
            richContent: [[
              { type: "chips", options: validInfra.map(i => ({ text: i })) }
            ]]
          }
        });
        return;
      }
      // setContext('infra_selected', 5, { life_infra: lifeInfra === '건너뛰기' ? null : lifeInfra });
      setContext('infra_selected', 5, { lifeInfra });
      // 파라미터 추출(항상 안전하게!)
      const region = parameters.region || (contexts.find(c => c.name.endsWith('region_selected'))?.parameters.region);
      const city = parameters.city || (contexts.find(c => c.name.endsWith('city_selected'))?.parameters.city);
      const district = parameters.district || (contexts.find(c => c.name.endsWith('district_selected'))?.parameters.district);
      const priceRange = parameters.price_range || (contexts.find(c => c.name.endsWith('price_selected'))?.parameters.price);
      if (!region || !priceRange) {
        fulfillmentMessages.push({ text: { text: ["⚠️ 지역 또는 예산 정보가 누락되었습니다. 처음부터 다시 시도해 주세요."] } });
        return res.json({ fulfillmentMessages, outputContexts });
      }


      let fullRegion;
      if (region === '광역시/특별시(서울,세종)에서 찾기') {
        fullRegion = city;
        if (district && district !== 'null') fullRegion += ' ' + district;
      } else {
        fullRegion = region;
        if (city && city !== 'null') fullRegion += ' ' + city;
        if (district && district !== 'null') fullRegion += ' ' + district;
      }


      console.log('fullRegion:', fullRegion, 'priceRange:', priceRange);
      console.log('houseDatabaseByRegionPrice[fullRegion]:', houseDatabaseByRegionPrice[fullRegion]);
      console.log('houses:', houseDatabaseByRegionPrice[fullRegion] && houseDatabaseByRegionPrice[fullRegion][priceRange] && houseDatabaseByRegionPrice[fullRegion][priceRange].houses);



      const recommended = recommendHouses(fullRegion, priceRange);
      const houseCards = createHouseCards(recommended);
      fulfillmentMessages.push({ payload: { richContent: [houseCards] } });
      setContext('ready_for_recommendation', 5);
    }

      


/*
    //결과 추천_RecommendHouse 처리 부분
    else if(intentName === 'RecommendHouse') {
      // 사용자가 입력한 지역, 가격대 파라미터 추출
      const region = parameters.region || (contexts.find(c => c.name.endsWith('region_selected'))?.parameters.region);
      const city = parameters.city || (contexts.find(c => c.name.endsWith('city_selected'))?.parameters.city);
      const district = parameters.district || (contexts.find(c => c.name.endsWith('district_selected'))?.parameters.district);
      const priceRange = parameters.price_range || (contexts.find(c => c.name.endsWith('price_selected'))?.parameters.price);

      if (!region || !priceRange) {
      fulfillmentMessages.push({ text: { text: ['⚠️ 지역 또는 예산 정보가 누락되었습니다. 처음부터 다시 시도해 주세요.'] }});
      return res.json({ fulfillmentMessages, outputContexts });
    }

      // 지역명 조립 (구가 있으면 "시 구", 없으면 "시")
      let fullRegion = region || '';
      if (city && city !== 'null') fullRegion += ' ' + city;
      if (district && district !== 'null') fullRegion += ' ' + district;

      // 추천 함수 호출
      const recommended = recommendHouses(fullRegion, priceRange);

      // 카드 형태로 변환
      const houseCards = recommended.map(house => {
        if (house.message) {
          return {
            type: "info",
            title: house.message,
            subtitle: "",
            text: []
          };
        }
        return {
          type: "info",
          title: house.name,
          subtitle: `가격: ${house.price}`,
          text: [
            `주소: ${house.address}`,
            `크기: ${house.size}`,
            `인프라: ${house.infra}`,
            house.auction
          ]
        };
      });

      fulfillmentMessages.push({ 
        payload: { richContent: [houseCards] }
      });
    }
*/



    // 결과 추천_RecommendHouse
    else if (intentName === 'RecommendHouse') {
      const region = parameters.region || (contexts.find(c => c.name.endsWith('region_selected'))?.parameters.region);
      const city = parameters.city || (contexts.find(c => c.name.endsWith('city_selected'))?.parameters.city);
      const district = parameters.district || (contexts.find(c => c.name.endsWith('district_selected'))?.parameters.district);
      const priceRange = parameters.price_range || (contexts.find(c => c.name.endsWith('price_selected'))?.parameters.price);
      if (!region || !priceRange) {
        fulfillmentMessages.push({ text: { text: ['⚠️ 지역 또는 예산 정보가 누락되었습니다. 처음부터 다시 시도해 주세요.'] }});
        return res.json({ fulfillmentMessages, outputContexts });
      }
      let fullRegion;
      if (region === '광역시/특별시(서울,세종)에서 찾기') {
        fullRegion = city;
      } else {
        fullRegion = region;
        if (city && city !== 'null') fullRegion += ' ' + city;
        if (district && district !== 'null') fullRegion += ' ' + district;
      }

      const houseCards = createHouseCards(recommended);


      fulfillmentMessages.push({ payload: { richContent: [houseCards] } });
    }









    // Fallback
    else {
      const fallbackMessages = [
        '죄송해요, 이해하지 못했어요. 다시 한 번 말씀해 주세요.',
        '제가 잘 이해하지 못했어요. 다른 방식으로 말씀해주실 수 있을까요?',
        '말씀하신 내용을 정확히 이해하지 못했어요. 다시 한번 알려주세요.',
        '음... 제가 정확히 알아듣지 못했어요. 조금 더 자세히 말씀해주세요.',
        '죄송합니다. 다시 한번 말씀해주시겠어요?'
      ];
      const randomIndex = Math.floor(Math.random() * fallbackMessages.length);
      fulfillmentMessages.push({ text: { text: [fallbackMessages[randomIndex]] } });
      // 컨텍스트 기반 추천 chips
      const currentContext = contexts.find(c => c.name.includes('awaiting_'))?.name.split('_')[1];
      if (currentContext) {
        switch (currentContext) {
          case 'region':
            fulfillmentMessages.push({
              payload: {
                richContent: [[
                  { type: "chips", options: koreaRegions.map(r => ({ text: r })) }
                ]]
              }
            });
            break;
          case 'city': {
            const region = parameters.region || (contexts.find(c => c.name.endsWith('region_selected'))?.parameters.region);
            if (region && regionCities[region]) {
              fulfillmentMessages.push({
                payload: {
                  richContent: [[
                    { type: "chips", options: regionCities[region].map(c => ({ text: c })) }
                  ]]
                }
              });
            }
            break;
          }
          // 다른 컨텍스트 처리(필요하면)
        }
      }
    }

    // 최종 응답
    res.json({
      fulfillmentMessages,
      outputContexts: outputContexts.length > 0 ? outputContexts : undefined
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '서버 오류' });
  }
});


// 서버 실행
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});































/*
"서울특별시 강남구":{
"~2억":{
  houses: [
    
  ]
},
"2억~5억": {
  houses: [
    
  ]
},
"5억~10억": {
  houses: [
    
  ]
},
"10억~15억": {
  houses: [
    
  ]
},
"15억~20억": {
  houses: [
    
  ]
},
"20억 이상": {
  houses: [

  ]
}
},
*/


//집 데이터
const houseDatabaseByRegionPrice = 
{
"서울특별시":{
"~2억":{
  "houses": [
    {
  "name": "천호동 빌라",
  "address": "서울특별시 강동구 천호동",
  "size": "28.97m² (8.7평)",
  "price": "2억 9,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 5호선 천호역 10분, 천호공원, 강동구청, 버스, 주차장"
},
{
  "name": "신림동 빌라",
  "address": "서울특별시 관악구 신림동",
  "size": "25m² (7.5평)",
  "price": "1억 7,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 2호선 신림역, 버스, 주차장"
},
{
  "name": "구로아트빌라8",
  "address": "서울특별시 구로구 구로동",
  "size": "59.44m² (18평)",
  "price": "2억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "1호선/7호선 구로역, 대형마트, 버스, 주차장, 구로구청, 공원"
}
  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "신림동 아파트",
  "address": "서울특별시 관악구 신림동",
  "size": "45m² (13.6평)",
  "price": "4억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 2호선 신림역, 관악구청, 공원"
},
{
  "name": "화곡동 아파트",
  "address": "서울특별시 강서구 화곡동",
  "size": "45m² (13.6평)",
  "price": "3억 8,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 5호선 화곡역, 강서구청, 공원"
},
{
  "name": "수유동 아파트",
  "address": "서울특별시 강북구 수유동",
  "size": "50m² (15평)",
  "price": "3억 8,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 4호선 수유역, 강북구청, 맛집, 버스"
}
  ]
},
"5억~10억": {
  "houses": [
    {
"name": "대흥 태영아파트",
"address": "서울특별시 마포구 대흥동",
"size": "59m² (18평)",
"price": "5억 8,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "6호선 대흥역 3분, 버스, 대형마트, 공원, 학군, 맛집"
},
{
  "name": "삼선동5가 다가구 주택 해상빌",
  "address": "서울특별시 성북구 삼선동5가 173",
  "size": "108.45m² (33평)",
  "price": "10억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "보문역 도보 10분, 성북구청 차량 15분, 주택가 위치, 임대수익형 원룸건물, 주차 가능, 버스 다수"
},
{
  "name": "영등포구 문래동 아파트",
  "address": "서울특별시 영등포구 문래동",
  "size": "80m² (24평)",
  "price": "9억 2,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "문래역 도보 5분, 영등포구청 차량 10분, 공원 인근, 대형마트 차량 10분, 버스 다수"
}
  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "구로삼성래미안",
  "address": "서울특별시 구로구 구로동 256-1",
  "size": "110.18m² (33.3평)",
  "price": "10억 2,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 1호선 구로역 10분, 버스, 주차장 1488대, 구로구청, 공원, 대형마트, 맛집"
},
{
  "name": "종로구 익선동 2층 건물",
  "address": "서울특별시 종로구 익선동",
  "size": "100m² (30평)",
  "price": "14억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "종로3가역 도보 5분, 종로구청 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
"name": "포레나노원1단지아파트",
"address": "서울특별시 노원구 상계동 680",
"size": "114.9m² (34.7평)",
"price": "10억 9,300만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "4호선 상계역 10분, 7호선 마들역, 버스, 공원, 대형마트, 학군 우수"
}

  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "고덕동 고덕아르테온",
  "address": "서울특별시 강동구 고덕동",
  "size": "84m² (25평)",
  "price": "16억 9,500만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "5호선 상일동역, 초등학교, 공원, 강동구청"
},
{
"name": "롯데캐슬에듀포레",
"address": "서울특별시 동작구 흑석동",
"size": "84.99m² (25.7평)",
"price": "18억 2,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "9호선 흑석역, 버스, 대형마트, 공원"
},
{
  "name": "삼선SK뷰",
  "address": "서울특별시 성북구 삼선동3가 116",
  "size": "116.86m² (35평)",
  "price": "15억 3,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "동묘앞역 차량 10분, 성북구청 차량 15분, 삼선동 공원 인근, 대형마트 차량 10분, 자주식 주차장 완비, 버스 다수"
}
  ]
},
"20억 이상": {
  "houses": [
{
  "name": "목동 힐스테이트 프리미엄 아파트",
  "address": "서울특별시 양천구 목동",
  "size": "120m² (36평)",
  "price": "30억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "목동역 도보 7분, 양천구청 차량 10분, 목동공원, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "영등포구 여의도동 리버타워",
  "address": "서울특별시 영등포구 여의도동",
  "size": "234.02m² (70평)",
  "price": "23억 7,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "여의도역 도보 7분, 영등포구청 차량 10분, 여의도공원, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "한남더힐 아파트",
  "address": "서울특별시 용산구 한남동",
  "size": "240m² (72평)",
  "price": "120억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "한남역 도보 5분, 용산구청 차량 10분, 한강공원, 대형마트 차량 10분, 버스 다수, 자주식 주차장 완비"
}
  ]
}
},

"서울특별시 강남구":{
"~2억":{
  "houses": [
    
  ]
},
"2억~5억": {
  "houses": [
    
  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "대치동 중소형 아파트",
  "address": "서울특별시 강남구 대치동",
  "size": "45m² (13.6평)",
  "price": "약 7억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 2호선 삼성역 10분, 코엑스, 강남구청, 공원, 맛집"
},
{
  "name": "압구정동 구축 아파트",
  "address": "서울특별시 강남구 압구정동",
  "size": "59m² (18평)",
  "price": "약 9억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 3호선 압구정역, 압구정로 상권, 강남구청, 한강공원 인접"
},
{
  "name": "역삼동 오피스텔",
  "address": "서울특별시 강남구 역삼동",
  "size": "30m² (9평)",
  "price": "약 6억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 2호선 역삼역, 강남대로, 버스 다수, 주차장 완비"
}

  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "대치동 래미안 아파트",
  "address": "서울특별시 강남구 대치동",
  "size": "84m² (25평)",
  "price": "13억 3,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 2호선 대치역 5분, 학군 우수, 공원, 강남구청, 맛집"
}
,
{
  "name": "청담동 신축 아파트",
  "address": "서울특별시 강남구 청담동",
  "size": "75m² (22.7평)",
  "price": "14억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 7호선 청담역, 한강 조망, 고급 상권, 공원, 대형마트"
}
,
{
  "name": "삼성동 아이파크",
  "address": "서울특별시 강남구 삼성동",
  "size": "82m² (24.8평)",
  "price": "12억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 2호선 삼성역, 코엑스, 강남구청, 공원, 맛집"
}

  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "반포동 아크로리버파크",
  "address": "서울특별시 강남구 반포동",
  "size": "110m² (33평)",
  "price": "18억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 9호선 신반포역, 한강 조망, 반포한강공원, 강남구청, 대형마트"
}
,
{
  "name": "압구정동 현대아파트",
  "address": "서울특별시 강남구 압구정동",
  "size": "100m² (30평)",
  "price": "17억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 3호선 압구정역, 고급 상권, 강남구청, 공원, 맛집"
}
,
{
  "name": "청담동 타워팰리스",
  "address": "서울특별시 강남구 청담동",
  "size": "95m² (28.7평)",
  "price": "19억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 7호선 청담역, 한강 조망, 고급 커뮤니티, 공원, 대형마트"
}

  ]
},
"20억 이상": {
  "houses": [
    {
  "name": "PH129 펜트하우스",
  "address": "서울특별시 강남구 삼성동",
  "size": "273.95m² (83평)",
  "price": "138억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 2호선 삼성역, 코엑스, 한강 조망, 고급 상권, 공원"
}
,
{
  "name": "압구정현대6,7차아파트",
  "address": "서울특별시 강남구 압구정동",
  "size": "196.7m² (59.5평)",
  "price": "79.5억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 3호선 압구정역, 고급 상권, 강남구청, 공원, 대형마트"
}
,
{
  "name": "타워팰리스",
  "address": "서울특별시 강남구 삼성동",
  "size": "244.66m² (74평)",
  "price": "79억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 2호선 삼성역, 코엑스, 한강 조망, 고급 커뮤니티, 공원"
}

  ]
}
},

"서울특별시 강동구":{
"~2억":{
  "houses": [
    {
  "name": "천호동 빌라",
  "address": "서울특별시 강동구 천호동",
  "size": "28.97m² (8.7평)",
  "price": "2억 9,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 5호선 천호역 10분, 천호공원, 강동구청, 버스, 주차장"
}
,
{
  "name": "둔촌동 오피스텔",
  "address": "서울특별시 강동구 둔촌동",
  "size": "25m² (7.5평)",
  "price": "1억 8,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 5호선 둔촌동역, 버스, 주차장, 대형마트"
}
,
{
  "name": "길동 빌라",
  "address": "서울특별시 강동구 길동",
  "size": "30m² (9평)",
  "price": "1억 9,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 5호선 길동역, 공원, 대형마트, 버스"
}

  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "명일동 명일지에스 아파트",
  "address": "서울특별시 강동구 명일동",
  "size": "33평",
  "price": "4억 5,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 5호선 명일역 5분, 대형마트, 학군, 공원, 강동구청"
}
,
{
  "name": "강일동 신축 아파트",
  "address": "서울특별시 강동구 강일동",
  "size": "40m² (12평)",
  "price": "4억 8,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "5호선+9호선 강일역, 고덕비즈밸리, 공원, 행정서비스"
}
,
{
  "name": "성내동 투룸 아파트",
  "address": "서울특별시 강동구 성내동",
  "size": "34m² (10평)",
  "price": "3억 5,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 5호선 강동역, 버스, 강동구청, 맛집"
}

  ]
},
"5억~10억": {
  "houses": [
   {
  "name": "상일동 고덕아르테온",
  "address": "서울특별시 강동구 상일동",
  "size": "84m² (25평)",
  "price": "14억 9,500만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "5호선 상일동역, 초등학교 품은 아파트, 공원, 대형마트, 강동구청"
}
,
{
  "name": "명일동 신축 아파트",
  "address": "서울특별시 강동구 명일동",
  "size": "70m² (21평)",
  "price": "12억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 5호선 명일역, 공원, 강동구청"
}
,
{
  "name": "둔촌동 신축 아파트",
  "address": "서울특별시 강동구 둔촌동",
  "size": "84m² (25평)",
  "price": "13억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 5호선 둔촌동역, 대형마트, 학군"
}
 
  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "상일동 고덕아르테온",
  "address": "서울특별시 강동구 상일동",
  "size": "84m² (25평)",
  "price": "14억 9,500만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "5호선 상일동역, 초등학교 품은 아파트, 공원, 대형마트, 강동구청"
}
,
{
  "name": "명일동 신축 아파트",
  "address": "서울특별시 강동구 명일동",
  "size": "70m² (21평)",
  "price": "12억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 5호선 명일역, 공원, 강동구청"
}
,
{
  "name": "둔촌동 신축 아파트",
  "address": "서울특별시 강동구 둔촌동",
  "size": "84m² (25평)",
  "price": "13억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 5호선 둔촌동역, 대형마트, 학군"
}

  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "고덕동 고덕아르테온",
  "address": "서울특별시 강동구 고덕동",
  "size": "84m² (25평)",
  "price": "16억 9,500만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "5호선 상일동역, 초등학교, 공원, 강동구청"
}
,
{
  "name": "강일동 신축 단지",
  "address": "서울특별시 강동구 강일동",
  "size": "100m² 이상",
  "price": "18억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "5호선+9호선 강일역, 고덕비즈밸리, 대형마트, 공원"
}
,
{
  "name": "둔촌동 구축 아파트",
  "address": "서울특별시 강동구 둔촌동",
  "size": "84m² (25평)",
  "price": "15억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 5호선 둔촌동역, 학군, 공원"
}

  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"서울특별시 강북구":{
"~2억":{
  "houses": [
    {
  "name": "미아동 빌라",
  "address": "서울특별시 강북구 미아동",
  "size": "25m² (7.5평)",
  "price": "1억 8,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 4호선 미아역, 버스, 주차장, 공원"
}
,
{
  "name": "번동 오피스텔",
  "address": "서울특별시 강북구 번동",
  "size": "30m² (9평)",
  "price": "1억 9,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 4호선 수유역, 공원, 대형마트, 버스"
}
,
{
  "name": "수유동 빌라",
  "address": "서울특별시 강북구 수유동",
  "size": "28m² (8.5평)",
  "price": "1억 7,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 4호선 수유역, 강북구청, 버스, 맛집"
}
  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "번동 아파트",
  "address": "서울특별시 강북구 번동",
  "size": "45m² (13.6평)",
  "price": "4억 5,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 4호선 미아역, 공원, 대형마트, 버스"
}
,
{
  "name": "수유동 아파트",
  "address": "서울특별시 강북구 수유동",
  "size": "50m² (15평)",
  "price": "3억 8,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 4호선 수유역, 강북구청, 맛집, 버스"
}
,
{
  "name": "미아동 구축 아파트",
  "address": "서울특별시 강북구 미아동",
  "size": "55m² (16.6평)",
  "price": "4억 9,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 4호선 미아역, 공원, 대형마트, 버스"
}

  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "수유동 신축 아파트",
  "address": "서울특별시 강북구 수유동",
  "size": "70m² (21평)",
  "price": "8억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 4호선 수유역, 공원, 대형마트, 버스"
}
,
{
  "name": "번동 래미안",
  "address": "서울특별시 강북구 번동",
  "size": "75m² (22.7평)",
  "price": "9억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 4호선 미아역, 강북구청, 학군, 공원"
}
,
{
  "name": "미아동 중형 아파트",
  "address": "서울특별시 강북구 미아동",
  "size": "65m² (19.6평)",
  "price": "7억 5,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 4호선 미아역, 공원, 맛집, 버스"
}

  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"서울특별시 강서구":{
"~2억":{
  "houses": [
    {
  "name": "방화동 빌라",
  "address": "서울특별시 강서구 방화동",
  "size": "25m² (7.5평)",
  "price": "1억 9,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 5호선 방화역, 버스, 주차장"
}
,
{
  "name": "화곡동 오피스텔",
  "address": "서울특별시 강서구 화곡동",
  "size": "30m² (9평)",
  "price": "1억 8,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 5호선 화곡역, 대형마트, 공원"
},

{
  "name": "등촌동 빌라",
  "address": "서울특별시 강서구 등촌동",
  "size": "28m² (8.5평)",
  "price": "1억 7,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 9호선 등촌역, 강서구청, 맛집"
}

  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "마곡동 마곡엠밸리7단지",
  "address": "서울특별시 강서구 마곡동",
  "size": "33평",
  "price": "4억 5,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "5호선+9호선 마곡역, R&D 업무지구, 대형마트, 공원"
}
,
{
  "name": "화곡동 아파트",
  "address": "서울특별시 강서구 화곡동",
  "size": "45m² (13.6평)",
  "price": "3억 8,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 5호선 화곡역, 강서구청, 공원"
}
,
{
  "name": "등촌동 아파트",
  "address": "서울특별시 강서구 등촌동",
  "size": "50m² (15평)",
  "price": "4억 9,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 9호선 등촌역, 대형마트, 버스"
}

  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "방화동 방화3단지 청솔 아파트",
  "address": "서울특별시 강서구 방화동",
  "size": "23평",
  "price": "5억 2,500만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "5호선 방화역, 마곡지구 인접, 주차장"
}
,
{
  "name": "마곡동 신축 아파트",
  "address": "서울특별시 강서구 마곡동",
  "size": "59m² (18평)",
  "price": "7억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "5호선+9호선 마곡역, 대형마트, 공원"
}
,
{
  "name": "화곡동 중형 아파트",
  "address": "서울특별시 강서구 화곡동",
  "size": "70m² (21평)",
  "price": "8억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 5호선 화곡역, 강서구청, 맛집"
}

  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "마곡13단지 힐스테이트마스터 아파트",
  "address": "서울특별시 강서구 마곡동",
  "size": "59.98m² (18평)",
  "price": "10억 8,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "5호선+9호선 마곡역, 대형마트, 공원, 주차장"
}
,
{
  "name": "강서힐스테이트아파트",
  "address": "서울특별시 강서구 화곡동 1165",
  "size": "84.99m² (25.7평)",
  "price": "12억 3,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 5호선 화곡역, 주차장 4418대, 강서구청, 공원"
}
,
{
  "name": "마곡엠밸리10단지",
  "address": "서울특별시 강서구 마곡동",
  "size": "84.89m² (25.7평)",
  "price": "13억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "5호선+9호선 마곡역, 대형마트, 공원"
}

  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "마곡엠밸리6단지",
  "address": "서울특별시 강서구 마곡동",
  "size": "114.98m² (34.8평)",
  "price": "17억 5,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "5호선+9호선 마곡역, 대형마트, 공원, 주차장"
}
,
{
  "name": "염창한화꿈에그린",
  "address": "서울특별시 강서구 염창동",
  "size": "84.93m² (25.7평)",
  "price": "12억 4,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "9호선 염창역, 대형마트, 공원"
}
,
{
  "name": "우장산힐스테이트",
  "address": "서울특별시 강서구 우장산동",
  "size": "59.98m² (18평)",
  "price": "10억 1,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "9호선 우장산역, 공원, 대형마트"
}
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"서울특별시 관악구":{
"~2억":{
  "houses": [
    {
  "name": "신림동 빌라",
  "address": "서울특별시 관악구 신림동",
  "size": "25m² (7.5평)",
  "price": "1억 7,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 2호선 신림역, 버스, 주차장"
}
,
{
  "name": "봉천동 오피스텔",
  "address": "서울특별시 관악구 봉천동",
  "size": "30m² (9평)",
  "price": "1억 9,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 2호선 봉천역, 대형마트, 공원"
}
,
{
  "name": "낙성대동 빌라",
  "address": "서울특별시 관악구 낙성대동",
  "size": "28m² (8.5평)",
  "price": "1억 8,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 2호선 낙성대역, 관악구청, 맛집"
}

  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "신림동 아파트",
  "address": "서울특별시 관악구 신림동",
  "size": "45m² (13.6평)",
  "price": "4억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 2호선 신림역, 관악구청, 공원"
}
,
{
  "name": "봉천동 아파트",
  "address": "서울특별시 관악구 봉천동",
  "size": "50m² (15평)",
  "price": "3억 5,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 2호선 봉천역, 대형마트, 버스"
}
,
{
  "name": "낙성대동 아파트",
  "address": "서울특별시 관악구 낙성대동",
  "size": "55m² (16.6평)",
  "price": "4억 8,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 2호선 낙성대역, 공원, 맛집"
}

  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "신림동 신축 아파트",
  "address": "서울특별시 관악구 신림동",
  "size": "70m² (21평)",
  "price": "7억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 2호선 신림역, 관악구청, 공원"
}
,
{
  "name": "봉천동 래미안",
  "address": "서울특별시 관악구 봉천동",
  "size": "75m² (22.7평)",
  "price": "8억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 2호선 봉천역, 대형마트, 학군"
}
,
{
  "name": "낙성대동 중형 아파트",
  "address": "서울특별시 관악구 낙성대동",
  "size": "65m² (19.6평)",
  "price": "6억 5,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 2호선 낙성대역, 공원, 맛집"
}

  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"서울특별시 광진구":{
"~2억":{
  "houses": [
    {
  "name": "광진구 중곡동 빌라",
  "address": "서울특별시 광진구 중곡동",
  "size": "25m² (7.5평)",
  "price": "1억 9,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "중곡역 도보 10분, 버스, 주차장, 광진구청, 공원, 대형마트"
}
,
{
  "name": "광진구 자양동 오피스텔",
  "address": "서울특별시 광진구 자양동",
  "size": "30m² (9평)",
  "price": "1억 8,500만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "건대입구역 15분, 버스, 주차장, 공원, 맛집, 대형마트"
}
,
{
  "name": "광진구 구의동 빌라",
  "address": "서울특별시 광진구 구의동",
  "size": "28m² (8.5평)",
  "price": "1억 7,500만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "구의역 10분, 버스, 주차장, 광진구청, 공원"
}

  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "광진구 자양동 아파트",
  "address": "서울특별시 광진구 자양동",
  "size": "45m² (13.6평)",
  "price": "4억 5,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "건대입구역 10분, 광진구청, 공원, 대형마트, 맛집"
}
,
{
  "name": "광진구 구의동 아파트",
  "address": "서울특별시 광진구 구의동",
  "size": "50m² (15평)",
  "price": "3억 8,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "구의역 5분, 버스, 공원, 대형마트"
}
,
{
  "name": "광진구 중곡동 아파트",
  "address": "서울특별시 광진구 중곡동",
  "size": "55m² (16.6평)",
  "price": "4억 9,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "중곡역 7분, 광진구청, 공원, 맛집"
}

  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "광진구 자양동 신축 아파트",
  "address": "서울특별시 광진구 자양동",
  "size": "70m² (21평)",
  "price": "8억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "건대입구역 5분, 공원, 대형마트, 광진구청"
}
,
{
  "name": "광진구 구의동 래미안 아파트",
  "address": "서울특별시 광진구 구의동",
  "size": "75m² (22.7평)",
  "price": "9억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "구의역 3분, 학군 우수, 공원, 대형마트"
}
,
{
  "name": "광진구 중곡동 중형 아파트",
  "address": "서울특별시 광진구 중곡동",
  "size": "65m² (19.6평)",
  "price": "7억 5,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "중곡역 5분, 공원, 맛집, 버스"
}

  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "현대파크빌10차아파트",
  "address": "서울특별시 광진구 아차산로 549 (광장동 577)",
  "size": "약 111.52m² (34평)",
  "price": "12억 9,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "광진구청 5분, 광장동 공원, 지하철 5호선 광나루역 인근, 버스 다수, 대형마트, 맛집"
}
,
{
  "name": "현대프라임 아파트",
  "address": "서울특별시 광진구 광나루로56길 29 (구의동)",
  "size": "약 111.52m² (34평)",
  "price": "12억 1,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "구의역 7분, 광진구청, 공원, 대형마트, 버스, 맛집 밀집지역"
}
,
{
  "name": "구의삼성쉐르빌(주상복합) 101동",
  "address": "서울특별시 광진구 구의동",
  "size": "186.15m² (56평)",
  "price": "15억 ~ 18억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "강변역 도보 5분, 남향, 광진구청, 공원, 대형마트, 버스, 맛집 인접"
}

  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"서울특별시 구로구":{
"~2억":{
  "houses": [
    {
  "name": "구로아트빌라8",
  "address": "서울특별시 구로구 구로동",
  "size": "59.44m² (18평)",
  "price": "2억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "1호선/7호선 구로역, 대형마트, 버스, 주차장, 구로구청, 공원"
}
,
{
  "name": "구로구 신도림동 빌라",
  "address": "서울특별시 구로구 신도림동",
  "size": "30m² (9평)",
  "price": "1억 8,500만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "신도림역 10분, 버스, 주차장, 대형마트, 공원"
}
,
{
  "name": "구로구 개봉동 오피스텔",
  "address": "서울특별시 구로구 개봉동",
  "size": "28m² (8.5평)",
  "price": "1억 7,500만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "개봉역 5분, 버스, 주차장, 구로구청, 공원"
}

  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "구로구 구로동 아파트",
  "address": "서울특별시 구로구 구로동",
  "size": "45m² (13.6평)",
  "price": "4억 5,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "구로역 5분, 대형마트, 공원, 구로구청, 버스"
}
,
{
  "name": "구로구 신도림동 아파트",
  "address": "서울특별시 구로구 신도림동",
  "size": "50m² (15평)",
  "price": "3억 8,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "신도림역 7분, 공원, 대형마트, 버스"
}
,
{
  "name": "구로구 고척동 아파트",
  "address": "서울특별시 구로구 고척동",
  "size": "55m² (16.6평)",
  "price": "4억 9,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "고척역 5분, 구로구청, 공원, 맛집"
}

  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "구로현대아파트",
  "address": "서울특별시 구로구 구로동",
  "size": "91.93m² (28평)",
  "price": "5억 3,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 1호선 구로역 10분, 버스, 주차장, 구로구청, 공원, 대형마트"
}
,
{
  "name": "천왕연지타운2단지",
  "address": "서울특별시 구로구 천왕동",
  "size": "84m² (25평)",
  "price": "6억~10억원대",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "7호선 천왕역 도보 8분, 버스 다수, 초등학교·중학교 인접, 공원 4곳, 편의점, 대형마트(차량 8분)"
}
,
{
  "name": "구로지웰아파트",
  "address": "서울특별시 구로구 구로동로28길 42",
  "size": "68.65m² (20.7평)",
  "price": "5억 5,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "7호선 남구로역 도보 8분, 버스, 주차장, 구로중학교, 서울영일초등학교, 대형마트, 백화점 차량 5분"
}
  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "GS신구로자이아파트",
  "address": "서울특별시 구로구 구로동 501",
  "size": "133.78m² (40.5평)",
  "price": "11억 9,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 1호선 구로역, 버스, 주차장 990대, 구로구청, 공원, 대형마트, 학군 우수"
}
,
{
  "name": "구로삼성래미안",
  "address": "서울특별시 구로구 구로동 256-1",
  "size": "110.18m² (33.3평)",
  "price": "10억 2,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 1호선 구로역 10분, 버스, 주차장 1488대, 구로구청, 공원, 대형마트, 맛집"
}
,
{
  "name": "신도림태영데시앙아파트",
  "address": "서울특별시 구로구 신도림동",
  "size": "84.87m² (25.7평)",
  "price": "10억 9,500만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 1호선 신도림역, 버스, 대형마트, 공원, 학군 우수"
}

  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "신도림4차e-편한세상",
  "address": "서울특별시 구로구 신도림동 646",
  "size": "152.07m² (46평)",
  "price": "17억 8,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 1호선 신도림역, 버스, 대형마트, 공원, 학군 우수"
}
,
{
  "name": "신도림동아3차",
  "address": "서울특별시 구로구 신도림동",
  "size": "164.82m² (50평)",
  "price": "14억 5,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 1호선 신도림역, 버스, 공원, 대형마트"
}
,
{
  "name": "신도림대림e편한세상7차아파트",
  "address": "서울특별시 구로구 신도림동",
  "size": "116.3m² (35평)",
  "price": "14억 2,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 1호선 신도림역, 대형마트, 공원, 버스, 학군"
}

  ]
},
"20억 이상": {
  "houses": [
{
  "name": "신도림디큐브시티",
  "address": "서울특별시 구로구 신도림동 692",
  "size": "176.87m² (53.5평)",
  "price": "20억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 1호선 신도림역, 7호선 신도림역, 버스, 대형마트, 공원, 학군 우수"
}
,
{
  "name": "신도림4차e-편한세상 (대형 평형)",
  "address": "서울특별시 구로구 신도림동 646",
  "size": "152.07m² (46평)",
  "price": "17억 8,000만원 이상",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 1호선 신도림역, 버스, 대형마트, 공원, 학군 우수"
}
,
{
  "name": "구로롯데캐슬",
  "address": "서울특별시 구로구 구로동",
  "size": "130m² 이상",
  "price": "20억 이상",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 1호선 구로역, 버스, 대형마트, 공원, 학군"
}

  ]
}
},

"서울특별시 금천구":{
"~2억":{
  "houses": [
    {
  "name": "중앙아파트",
  "address": "서울특별시 금천구 독산동",
  "size": "35.61m² (10.7평)",
  "price": "2억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 1호선 독산역 10분, 버스, 금천구청, 공원, 대형마트, 맛집"
}
,
{
  "name": "가산지웰에스테이트",
  "address": "서울특별시 금천구 가산동",
  "size": "12.13m² (3.7평)",
  "price": "8,500만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 1호선 가산디지털단지역 인근, 버스, 주차장, 금천구청, 공원, 대형마트"
}
,
{
  "name": "명도힐스티지",
  "address": "서울특별시 금천구 독산동",
  "size": "29.63m² (8.9평)",
  "price": "2억 7,700만원 (약간 초과하나 2억대 근접 매물)",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 1호선 독산역, 버스, 금천구청, 공원, 대형마트"
}

  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "금천현대아파트",
  "address": "서울특별시 금천구 독산동 711-2",
  "size": "84.8m² (25.6평)",
  "price": "5억 5,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 1호선 독산역 도보 10분, 버스, 주차장, 금천구청, 공원, 대형마트, 학군 우수"
},
{
  "name": "금천롯데캐슬골드파크2차",
  "address": "서울특별시 금천구 독산동 1150",
  "size": "59.27m² (18평)",
  "price": "5억 1,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 1호선 금천구청역 도보 5분, 버스, 주차장, 금천구청, 공원, 대형마트, 맛집"
},
{
  "name": "시흥성지아파트",
  "address": "서울특별시 금천구 시흥동",
  "size": "53m² (16평)",
  "price": "4억 8,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 1호선 가산디지털단지역 인근, 버스, 주차장, 금천구청, 공원, 대형마트"
}
  ]
},
"5억~10억": {
  "houses": [
    {
"name": "벽산1단지 아파트",
"address": "서울특별시 금천구 시흥동 1010",
"size": "105.15m² (31.8평)",
"price": "5억 1,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 가산디지털단지역 인근, 버스, 주차장, 금천구청, 공원, 대형마트"
},
{
"name": "남서울힐스테이트",
"address": "서울특별시 금천구 시흥동 1026",
"size": "115.8m² (35평)",
"price": "8억 5,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 금천구청역 도보 5분, 버스, 주차장, 공원, 대형마트, 학군 우수"
},
{
"name": "금천롯데캐슬골드파크2차",
"address": "서울특별시 금천구 독산동 1150",
"size": "59.27m² (18평)",
"price": "8억 5,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 독산역 10분, 버스, 주차장, 금천구청, 공원, 대형마트, 학군 우수"
}
  ]
},
"10억~15억": {
  "houses": [
    {
"name": "금천롯데캐슬골드파크1차",
"address": "서울특별시 금천구 독산동 1147",
"size": "101.83m² (30.8평)",
"price": "13억 5,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 독산역, 버스, 주차장, 금천구청, 공원, 대형마트, 학군 우수"
},
{
"name": "금천롯데캐슬골드파크3차",
"address": "서울특별시 금천구 독산동 1155",
"size": "84.4m² (25.5평)",
"price": "11억 9,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 독산역, 버스, 대형마트, 공원, 학군 우수"
},
{
"name": "남서울힐스테이트",
"address": "서울특별시 금천구 시흥동 1026",
"size": "115.8m² (35평)",
"price": "11억 3,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 가산디지털단지역, 버스, 대형마트, 공원, 학군 우수"
}
  ]
},
"15억~20억": {
  "houses": [
    {
"name": "금천롯데캐슬골드파크1차 (대형 평형)",
"address": "서울특별시 금천구 독산동 1147",
"size": "130m² 이상",
"price": "15억 이상",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 독산역, 버스, 대형마트, 공원, 학군"
},
{
"name": "금천롯데캐슬골드파크3차 (대형 평형)",
"address": "서울특별시 금천구 독산동 1155",
"size": "130m² 이상",
"price": "17억 이상",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 독산역, 버스, 대형마트, 공원, 학군"
},
{
"name": "남서울힐스테이트 (대형 평형)",
"address": "서울특별시 금천구 시흥동 1026",
"size": "130m² 이상",
"price": "18억 이상",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 가산디지털단지역, 버스, 대형마트, 공원, 학군"
}
  ]
},
"20억 이상": {
  "houses": [
{
"name": "금천롯데캐슬골드파크1차 펜트하우스",
"address": "서울특별시 금천구 독산동",
"size": "150m² 이상",
"price": "20억 이상",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 독산역, 버스, 대형마트, 공원, 학군"
},
{
"name": "신도림디큐브시티",
"address": "서울특별시 구로구 신도림동 692",
"size": "176.87m² (53.5평)",
"price": "20억 이상",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 신도림역, 7호선 신도림역, 버스, 대형마트, 공원, 학군 우수"
},
{
"name": "구로롯데캐슬",
"address": "서울특별시 구로구 구로동",
"size": "130m² 이상",
"price": "20억 이상",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 구로역, 버스, 대형마트, 공원, 학군"
}
  ]
}
},

"서울특별시 노원구":{
"~2억":{
  "houses": [
    {
"name": "중계 주공 2단지",
"address": "서울특별시 노원구 중계동",
"size": "59m² (18평)",
"price": "1억 9,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "4호선 중계역 10분, 버스, 주차장, 노원구청, 공원, 대형마트, 학군 우수"
},
{
"name": "한신 아파트",
"address": "서울특별시 노원구 하계동",
"size": "55m² (16.6평)",
"price": "1억 8,500만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "7호선 하계역 7분, 버스, 주차장, 노원구청, 공원, 대형마트"
},
{
"name": "상계 주공 14단지",
"address": "서울특별시 노원구 상계동",
"size": "60m² (18평)",
"price": "1억 9,500만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "7호선 상계역 5분, 버스, 주차장, 노원구청, 공원, 맛집, 대형마트"
}
  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "상계동 성림 아파트",
  "address": "서울특별시 노원구 상계동",
  "size": "84m² (25평)",
  "price": "4억 5,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "7호선 상계역 10분, 버스, 공원, 대형마트, 학군 우수"
},
{
  "name": "노원구 월계동 삼익아파트",
  "address": "서울특별시 노원구 월계동",
  "size": "59m² (18평)",
  "price": "3억 8,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "7호선 월계역 7분, 버스, 주차장, 공원, 대형마트"
},
{
  "name": "중계동 청구아파트",
  "address": "서울특별시 노원구 중계동",
  "size": "59m² (18평)",
  "price": "4억 2,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "4호선 중계역 10분, 버스, 공원, 대형마트, 학군"
}

  ]
},
"5억~10억": {
  "houses": [
    {
"name": "상계동 성림 아파트",
"address": "서울특별시 노원구 상계동",
"size": "84m² (25평)",
"price": "5억 2,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "버스, 지하철 7호선 상계역 10분, 공원, 대형마트, 학군 우수"
},
{
"name": "금호어울림 아파트",
"address": "서울특별시 노원구 상계동",
"size": "84m² (25평)",
"price": "5억 4,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "7호선 상계역 7분, 버스, 공원, 대형마트, 학군"
},
{
"name": "상계동 노원현대4차",
"address": "서울특별시 노원구 상계동",
"size": "84m² (25평)",
"price": "6억 2,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "7호선 상계역 5분, 버스, 주차장, 공원, 대형마트"
}
  ]
},
"10억~15억": {
  "houses": [
    {
"name": "포레나노원1단지아파트",
"address": "서울특별시 노원구 상계동 680",
"size": "114.9m² (34.7평)",
"price": "10억 9,300만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "4호선 상계역 10분, 7호선 마들역, 버스, 공원, 대형마트, 학군 우수"
},
{
"name": "청구3차 아파트",
"address": "서울특별시 노원구 중계동",
"size": "84.77m² (25.6평)",
"price": "12억 9,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "4호선 중계역, 버스, 공원, 대형마트, 학군"
},
{
"name": "노원롯데캐슬시그니처",
"address": "서울특별시 노원구 상계동",
"size": "84.99m² (25.7평)",
"price": "11억",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "4호선 상계역, 버스, 공원, 대형마트, 학군 우수"
}
  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "포레나노원1단지아파트",
  "address": "서울특별시 노원구 상계동 680",
  "size": "114.9m² (34.7평)",
  "price": "15억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "4호선 상계역 10분, 7호선 마들역, 버스, 공원, 대형마트, 학군 우수"
},
{
  "name": "동진신안 아파트",
  "address": "서울특별시 노원구 중계동",
  "size": "134.74m² (40.7평)",
  "price": "14억 8,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "4호선 중계역, 버스, 공원, 대형마트, 학군"
},
{
  "name": "대림벽산 아파트",
  "address": "서울특별시 노원구 중계동",
  "size": "141.44m² (42.8평)",
  "price": "14억 5,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "4호선 중계역, 버스, 공원, 대형마트, 학군"
}
  ]
},
"20억 이상": {
  "houses": [
{
  "name": "포레나노원1단지아파트 (프리미엄 대형 평형)",
  "address": "서울특별시 노원구 상계동 680",
  "size": "130m² 이상",
  "price": "15억 ~ 20억 이상 예상",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "4호선 상계역 10분, 7호선 마들역, 버스, 공원, 대형마트, 학군 우수"
},
{
  "name": "노원롯데캐슬시그니처 (대형 평형)",
  "address": "서울특별시 노원구 상계동",
  "size": "130m² 이상",
  "price": "15억 ~ 20억 이상 예상",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "4호선 상계역, 버스, 공원, 대형마트, 학군 우수"
},
{
  "name": "청구3차 아파트 (대형 평형)",
  "address": "서울특별시 노원구 중계동",
  "size": "130m² 이상",
  "price": "15억 ~ 20억 이상 예상",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "4호선 중계역, 버스, 공원, 대형마트, 학군"
}

  ]
}
},

"서울특별시 도봉구":{
"~2억":{
  "houses": [
    {
"name": "도봉동 빌라",
"address": "서울특별시 도봉구 도봉동",
"size": "25m² (7.5평)",
"price": "1억 8,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 도봉역, 버스, 주차장, 도봉구청, 공원, 대형마트"
},
{
"name": "창동 오피스텔",
"address": "서울특별시 도봉구 창동",
"size": "30m² (9평)",
"price": "1억 9,500만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 창동역, 버스, 주차장, 공원, 대형마트"
},
{
"name": "방학동 빌라",
"address": "서울특별시 도봉구 방학동",
"size": "28m² (8.5평)",
"price": "1억 7,500만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 방학역, 버스, 도봉구청, 공원"
}
  ]
},
"2억~5억": {
  "houses": [
    {
"name": "도봉동 삼익아파트",
"address": "서울특별시 도봉구 도봉동",
"size": "59m² (18평)",
"price": "3억 8,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 도봉역, 버스, 주차장, 도봉구청, 공원, 대형마트"
},
{
"name": "창동 래미안아파트",
"address": "서울특별시 도봉구 창동",
"size": "70m² (21평)",
"price": "4억 5,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 창동역, 버스, 주차장, 공원, 대형마트"
},
{
"name": "방학동 현대아파트",
"address": "서울특별시 도봉구 방학동",
"size": "65m² (19.6평)",
"price": "4억 9,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 방학역, 버스, 도봉구청, 공원"
}
  ]
},
"5억~10억": {
  "houses": [
    {
"name": "도봉파크빌2단지",
"address": "서울특별시 도봉구 도봉동",
"size": "84.16m² (25.5평)",
"price": "5억 4,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 도봉역 인근, 버스, 주차장, 도봉구청, 공원, 대형마트"
},
{
"name": "삼환도봉아파트",
"address": "서울특별시 도봉구 도봉동",
"size": "73.89m² (22.3평)",
"price": "5억 2,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 도봉역 인근, 버스, 도봉구청, 공원, 대형마트"
},
{
"name": "중흥에스클래스",
"address": "서울특별시 도봉구 도봉동",
"size": "84.95m² (25.7평)",
"price": "6억",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 도봉역 인근, 버스, 주차장, 공원, 대형마트"
}
  ]
},
"10억~15억": {
  "houses": [
    {
"name": "북한산아이파크5차",
"address": "서울특별시 도봉구 창동",
"size": "165.17m² (50평)",
"price": "15억",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 창동역, 버스, 주차장, 도봉구청, 공원, 대형마트, 학군 우수"
},
{
"name": "동아청솔",
"address": "서울특별시 도봉구 창동",
"size": "134.94m² (40.8평)",
"price": "12억 7,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 창동역, 버스, 공원, 대형마트, 학군 우수"
},
{
"name": "대상타운현대아파트",
"address": "서울특별시 도봉구 방학동",
"size": "134m² (40.5평)",
"price": "12억 5,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 방학역, 버스, 공원, 대형마트, 학군 우수"
}
  ]
},
"15억~20억": {
  "houses": [
    {
"name": "북한산아이파크5차",
"address": "서울특별시 도봉구 창동",
"size": "165.17m² (50평)",
"price": "15억",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 창동역, 버스, 주차장, 도봉구청, 공원, 대형마트, 학군 우수"
},
{
"name": "동아청솔",
"address": "서울특별시 도봉구 창동",
"size": "134.94m² (40.8평)",
"price": "17억",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 창동역, 버스, 공원, 대형마트, 학군 우수"
},
{
"name": "대상타운현대아파트",
"address": "서울특별시 도봉구 방학동",
"size": "134m² (40.5평)",
"price": "18억 5,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 1호선 방학역, 버스, 공원, 대형마트, 학군 우수"
}
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"서울특별시 동대문구":{
"~2억":{
  "houses": [
    {
  "name": "우성아파트",
  "address": "서울특별시 동대문구 장안동",
  "size": "19.73m² (6평)",
  "price": "2억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "1호선 전농역 인근, 버스, 대형마트, 공원"
},
{
  "name": "동대문베네스트",
  "address": "서울특별시 동대문구 용두동",
  "size": "30.11m² (9평)",
  "price": "1억 9,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "1호선 용두역, 버스, 대형마트, 공원"
},
{
  "name": "리베르떼",
  "address": "서울특별시 동대문구 전농동",
  "size": "19.73m² (6평)",
  "price": "1억 8,500만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "1호선 전농역, 버스, 공원, 대형마트"
}

  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "어반넥서스",
  "address": "서울특별시 동대문구 제기동",
  "size": "58.7m² (17.7평)",
  "price": "4억 9,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "1호선/2호선 제기동역, 버스, 대형마트, 공원, 학군"
},
{
  "name": "양지쉐르빌 아파트",
  "address": "서울특별시 동대문구 장안동",
  "size": "56.4m² (17평)",
  "price": "4억 6,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "5호선 장한평역, 버스, 대형마트, 공원"
},
{
  "name": "청명에버아트3차",
  "address": "서울특별시 동대문구 장안동",
  "size": "52.96m² (16평)",
  "price": "4억 6,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "5호선 장한평역, 버스, 대형마트, 공원"
}

  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "동대문더퍼스트데시앙",
  "address": "서울특별시 동대문구 휘경동",
  "size": "84.97m² (25.7평)",
  "price": "10억 5,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "1호선 외대앞역 10분, 버스, 대형마트, 공원, 학군"
},
{
  "name": "두산위브",
  "address": "서울특별시 동대문구 답십리동",
  "size": "83.44m² (25.2평)",
  "price": "10억 5,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "5호선 답십리역, 버스, 대형마트, 공원"
},
{
  "name": "래미안크레시티",
  "address": "서울특별시 동대문구 전농동 690",
  "size": "59.99m² (18평)",
  "price": "11억 4,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "2호선 전농역, 버스, 대형마트, 공원, 학군"
}

  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "래미안크레시티",
  "address": "서울특별시 동대문구 전농동 690",
  "size": "121.93m² (36.8평)",
  "price": "15억 9,500만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "2호선 전농역, 버스, 대형마트, 공원, 학군"
},
{
  "name": "래미안위브",
  "address": "서울특별시 동대문구 답십리동 1003",
  "size": "140.62m² (42.5평)",
  "price": "16억 6,500만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "5호선 답십리역, 버스, 대형마트, 공원, 학군"
},
{
  "name": "청량리미주",
  "address": "서울특별시 동대문구 청량리동 235-1",
  "size": "170.31m² (51.5평)",
  "price": "15억 5,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "1호선 청량리역, 버스, 대형마트, 공원, 학군"
}

  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "래미안크레시티 (대형 평형)",
  "address": "서울특별시 동대문구 전농동 690",
  "size": "121.93m² (36.8평)",
  "price": "15억 9,500만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "2호선 전농역, 버스, 대형마트, 공원, 학군"
},
{
  "name": "래미안위브 (대형 평형)",
  "address": "서울특별시 동대문구 답십리동 1003",
  "size": "140.62m² (42.5평)",
  "price": "16억 6,500만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "5호선 답십리역, 버스, 대형마트, 공원, 학군"
},
{
  "name": "청량리역 한양수자인 그라시엘",
  "address": "서울특별시 동대문구 용두동 39-1",
  "size": "84.97m² (25.7평)",
  "price": "15억 4,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "1호선 청량리역, 버스, 대형마트, 공원, 학군"
}

  ]
},
"20억 이상": {
  "houses": [
{
  "name": "래미안크레시티 펜트하우스",
  "address": "서울특별시 동대문구 전농동 690",
  "size": "150m² 이상",
  "price": "20억 이상",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "2호선 전농역, 버스, 대형마트, 공원, 학군"
},
{
  "name": "청량리역 롯데캐슬 SKY-L65",
  "address": "서울특별시 동대문구 청량리동",
  "size": "84.97m² (25.7평)",
  "price": "18억 ~ 22억 호가",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "1호선 청량리역, 버스, 대형마트, 공원, 학군"
},
{
  "name": "휘경 자이 디센시아",
  "address": "서울특별시 동대문구 휘경동",
  "size": "100m² 이상",
  "price": "20억 이상",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "1호선 외대앞역, 버스, 대형마트, 공원, 학군"
}

  ]
}
},

"서울특별시 동작구":{
"~2억":{
  "houses": [
    {
"name": "우공아트빌",
"address": "서울특별시 동작구 상도동",
"size": "68.01m² (20.6평)",
"price": "1억 8,000만원 이하",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "7호선 상도역 인근, 버스, 주차장, 동작구청, 공원, 대형마트"
},
{
"name": "미주아파트",
"address": "서울특별시 동작구 상도동",
"size": "48.3m² (14.6평)",
"price": "1억 9,000만원 이하",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "7호선 상도역, 버스, 공원, 대형마트, 학군"
},
{
"name": "대광아파트",
"address": "서울특별시 동작구 상도동",
"size": "47.87m² (14.5평)",
"price": "1억 9,000만원 이하",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "7호선 상도역, 버스, 주차장, 공원, 대형마트"
}
  ]
},
"2억~5억": {
  "houses": [
    {
"name": "대방주공2단지",
"address": "서울특별시 동작구 대방동",
"size": "51.66m² (15.6평)",
"price": "3억 9,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "1호선 대방역 5분, 9호선, 신림선, 버스, 대형마트, 공원, 동작구청"
},
{
"name": "상도동삼호아파트",
"address": "서울특별시 동작구 상도동",
"size": "84.52m² (25.5평)",
"price": "4억 8,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "7호선 상도역, 버스, 대형마트, 공원, 학군"
},
{
"name": "한성아파트",
"address": "서울특별시 동작구 신대방동",
"size": "59.87m² (18평)",
"price": "4억 9,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "2호선, 7호선, 신림선, 버스, 공원, 대형마트"
}
  ]
},
"5억~10억": {
  "houses": [
    {
"name": "상도동삼호아파트",
"address": "서울특별시 동작구 상도동",
"size": "84.52m² (25.5평)",
"price": "8억 7,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "7호선 상도역, 버스, 대형마트, 공원, 학군"
},
{
"name": "한성아파트",
"address": "서울특별시 동작구 신대방동",
"size": "59.87m² (18평)",
"price": "8억 5,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "2호선, 7호선, 신림선, 버스, 공원, 대형마트"
},
{
"name": "동작삼성래미안",
"address": "서울특별시 동작구 상도동",
"size": "84m² (25평)",
"price": "8억 5,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "7호선 상도역, 버스, 넉넉한 주차 공간, 공원, 대형마트, 학군 우수"
}
  ]
},
"10억~15억": {
  "houses": [
    {
"name": "동작삼성래미안",
"address": "서울특별시 동작구 상도동",
"size": "84.99m² (25.7평)",
"price": "13억 3,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "7호선 상도역 5분, 버스, 대형마트, 공원, 학군 우수"
},
{
"name": "보라매자이더포레스트",
"address": "서울특별시 동작구 신대방동",
"size": "84m² (25평)",
"price": "10억 5,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "7호선 신대방역 7분, 버스, 공원, 대형마트, 학군 우수"
},
{
"name": "사당롯데캐슬골든포레",
"address": "서울특별시 동작구 사당동",
"size": "112m² (34평)",
"price": "11억 3,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "7호선 사당역 5분, 버스, 대형마트, 공원, 학군 우수"
}
  ]
},
"15억~20억": {
  "houses": [
    {
"name": "e편한세상상도노빌리티",
"address": "서울특별시 동작구 상도동",
"size": "108.98m² (33평)",
"price": "19억 5,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "7호선 상도역, 버스, 공원, 대형마트"
},
{
"name": "래미안트윈파크",
"address": "서울특별시 동작구 본동",
"size": "84.76m² (25.6평)",
"price": "17억",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "9호선 본동역, 버스, 공원, 대형마트"
},
{
"name": "롯데캐슬에듀포레",
"address": "서울특별시 동작구 흑석동",
"size": "84.99m² (25.7평)",
"price": "18억 2,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "9호선 흑석역, 버스, 대형마트, 공원"
}
  ]
},
"20억 이상": {
  "houses": [
{
"name": "아크로리버하임",
"address": "서울특별시 동작구 흑석동",
"size": "113.23m² (34.2평)",
"price": "34억 7,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "9호선 흑석역, 버스, 대형마트, 한강공원, 동작구청"
},
{
"name": "이수힐스테이트",
"address": "서울특별시 동작구 동작동",
"size": "133.38m² (40.3평)",
"price": "22억",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "4호선, 7호선, 9호선, 버스, 공원, 대형마트"
},
{
"name": "흑석뉴타운롯데캐슬에듀포레",
"address": "서울특별시 동작구 흑석동",
"size": "107.86m² (32.6평)",
"price": "20억 2,000만원 (2025년 1월 실거래가)",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "9호선 흑석역 도보, 버스, 대형마트, 공원, 학군 우수"
}
  ]
}
},

"서울특별시 마포구":{
"~2억":{
  "houses": [
    {
  "name": "서희스타힐스",
  "address": "서울특별시 마포구 대흥동",
  "size": "12.88m² (3.9평)",
  "price": "2억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "2호선/6호선 대흥역, 버스, 주차장, 구청, 공원"
}
,
{
  "name": "신촌다올노블리움",
  "address": "서울특별시 마포구 노고산동",
  "size": "14.2m² (4.3평)",
  "price": "1억 9,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "2호선 신촌역, 버스, 대형마트, 맛집"
}
,
{
  "name": "마포래미안푸르지오",
  "address": "서울특별시 마포구 아현동 606",
  "size": "59m² (18평)",
  "price": "13억 3,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "아현역 1분, 이마트, 마포구청, 공원"
}

  ]
},
"2억~5억": {
  "houses": [
    {
"name": "블레스하임",
"address": "서울특별시 마포구 신공덕동",
"size": "24.27m² (7.3평)",
"price": "3억 6,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "5호선, 6호선, 경의중앙선, 공항철도 신공덕역 인근, 버스, 대형마트, 공원"
},
{
"name": "애오개아이파크",
"address": "서울특별시 마포구 아현동",
"size": "19.5m² (5.9평)",
"price": "3억 2,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "2호선, 5호선 애오개역 인근, 버스, 대형마트, 공원, 마포구청"
},
{
"name": "현대벤처빌",
"address": "서울특별시 마포구 노고산동",
"size": "41.96m² (12.7평)",
"price": "3억",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "2호선, 6호선, 경의중앙선, 버스, 대형마트, 공원, 마포구청"
}
  ]
},
"5억~10억": {
  "houses": [
    {
"name": "마포현대아파트",
"address": "서울특별시 마포구 마포대로11길 84",
"size": "59m² (18평)",
"price": "9억 5,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "5호선 공덕역, 6호선 공덕역, 경의중앙선 공덕역, 버스, 대형마트, 공원, 마포구청"
},
{
"name": "대흥 태영아파트",
"address": "서울특별시 마포구 대흥동",
"size": "59m² (18평)",
"price": "5억 8,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "6호선 대흥역 3분, 버스, 대형마트, 공원, 학군, 맛집"
},
{
"name": "용강동 강변그린아파트",
"address": "서울특별시 마포구 용강동",
"size": "59m² (18평)",
"price": "5억 2,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "5호선 마포역, 버스, 한강공원, 대형마트, 맛집"
}
  ]
},
"10억~15억": {
  "houses": [
    {
"name": "신촌숲아이파크",
"address": "서울특별시 마포구 신수동",
"size": "84m² (25평대)",
"price": "13억",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "2호선 신촌역, 6호선, 경의중앙선, 버스, 대형마트, 공원, 학군 우수"
},
{
"name": "래미안공덕3차",
"address": "서울특별시 마포구 공덕동",
"size": "84m² (25평대)",
"price": "12억 5,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "5호선 공덕역, 6호선, 경의중앙선, 버스, 대형마트, 공원, 학군 우수"
},
{
"name": "공덕삼성 1차",
"address": "서울특별시 마포구 공덕동",
"size": "84m² (25평대)",
"price": "11억 8,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "5호선 공덕역, 6호선, 경의중앙선, 버스, 대형마트, 공원, 학군 우수"
}
  ]
},
"15억~20억": {
  "houses": [
    {
"name": "이편한세상마포리버파크",
"address": "서울특별시 마포구 용강동",
"size": "84m² (25평)",
"price": "20억 5,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "마포역 5분, 한강 조망, 버스, 대형마트, 공원, 마포구청"
},
{
"name": "신촌숲아이파크",
"address": "서울특별시 마포구 신수동",
"size": "84m² (25평)",
"price": "20억",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "2호선 신촌역, 6호선, 경의중앙선, 버스, 대형마트, 공원, 학군 우수"
},
{
"name": "마포프레스티지자이",
"address": "서울특별시 마포구 염리동",
"size": "84m² (25평)",
"price": "19억 9,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "대흥역 5분, 버스, 대형마트, 공원, 학군 우수"
}
  ]
},
"20억 이상": {
  "houses": [
{
"name": "이편한세상마포리버파크",
"address": "서울특별시 마포구 용강동",
"size": "84m² (25평)",
"price": "20억 5,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "마포역 5분, 한강 조망, 버스, 대형마트, 공원, 마포구청"
},
{
"name": "신촌숲아이파크",
"address": "서울특별시 마포구 신수동",
"size": "84m² (25평)",
"price": "20억",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "2호선 신촌역, 6호선, 경의중앙선, 버스, 대형마트, 공원, 학군 우수"
},
{
"name": "마포프레스티지자이",
"address": "서울특별시 마포구 염리동",
"size": "84m² (25평)",
"price": "19억 7,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "대흥역 5분, 버스, 대형마트, 공원, 학군 우수"
}
  ]
}
},

"서울특별시 서대문구":{
"~2억":{
  "houses": [
    {
  "name": "신촌다올노블리움",
  "address": "서울특별시 서대문구 창천동",
  "size": "17.19m² (5.2평)",
  "price": "1억 9,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "2호선 홍제역, 버스, 주차장, 공원, 맛집"
}
,
{
  "name": "북한산포레스트",
  "address": "서울특별시 은평구 대조동",
  "size": "29.02m² (8.7평)",
  "price": "1억 9,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "6호선 구파발역, 버스, 주차장, 공원"
}
,
{
  "name": "3RU-City",
  "address": "서울특별시 서대문구 창천동",
  "size": "17.19m² (5.2평)",
  "price": "1억 9,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "2호선 홍제역, 버스, 대형마트, 공원"
}

  ]
},
"2억~5억": {
  "houses": [
    {
"name": "홍은동 신원지벤스타",
"address": "서울특별시 서대문구 홍은동",
"size": "70m² (21평)",
"price": "4억 7,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "6호선 독립문역, 버스, 대형마트, 공원"
},
{
"name": "북가좌동 연희로11자길 아파트",
"address": "서울특별시 서대문구 북가좌동",
"size": "59m² (18평)",
"price": "4억 9,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "6호선 디지털미디어시티역, 버스, 대형마트, 공원"
},
{
"name": "연희동 연희로 아파트",
"address": "서울특별시 서대문구 연희동",
"size": "55m² (16.6평)",
"price": "4억 5,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "3호선 홍제역, 버스, 공원, 대형마트"
}
  ]
},
"5억~10억": {
  "houses": [
    {
"name": "홍제센트럴아이파크",
"address": "서울특별시 서대문구 홍제동",
"size": "84.96m² (25.7평)",
"price": "9억 7,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "3호선 홍제역, 버스, 대형마트, 공원, 서대문구청"
},
{
"name": "홍제현대아파트",
"address": "서울특별시 서대문구 홍제동",
"size": "84.9m² (25.7평)",
"price": "9억 5,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "3호선 홍제역, 버스, 공원, 대형마트"
},
{
"name": "서대문푸르지오센트럴파크",
"address": "서울특별시 서대문구 홍제동",
"size": "59.94m² (18.1평)",
"price": "9억 3,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "3호선 홍제역, 버스, 대형마트, 공원"
}
  ]
},
"10억~15억": {
  "houses": [
    {
"name": "홍제원힐스테이트아파트",
"address": "서울특별시 서대문구 홍제동",
"size": "114.72m² (34.7평)",
"price": "10억 9,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "3호선 홍제역, 버스, 공원, 대형마트, 학군 우수"
},
{
"name": "홍제현대아파트",
"address": "서울특별시 서대문구 홍제동",
"size": "119.32m² (36평)",
"price": "10억 8,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "3호선 홍제역, 버스, 공원, 대형마트, 학군"
},
{
"name": "인왕산힐스테이트",
"address": "서울특별시 서대문구 홍제동",
"size": "114.72m² (34.7평)",
"price": "10억 4,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "3호선 홍제역, 버스, 대형마트, 공원"
}
  ]
},
"15억~20억": {
  "houses": [
    {
"name": "홍제현대아파트 대형평형",
"address": "서울특별시 서대문구 홍제동",
"size": "130m² 이상",
"price": "15억 이상",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "3호선 홍제역, 버스, 공원, 대형마트, 학군 우수"
},
{
"name": "홍제원힐스테이트아파트 대형평형",
"address": "서울특별시 서대문구 홍제동",
"size": "130m² 이상",
"price": "15억 이상",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "3호선 홍제역, 버스, 공원, 대형마트, 학군 우수"
},
{
"name": "인왕산힐스테이트 대형평형",
"address": "서울특별시 서대문구 홍제동",
"size": "130m² 이상",
"price": "15억 이상",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "3호선 홍제역, 버스, 대형마트, 공원, 학군"
}
  ]
},
"20억 이상": {
  "houses": [
{
"name": "홍제센트럴아이파크 펜트하우스",
"address": "서울특별시 서대문구 홍제동",
"size": "150m² 이상",
"price": "20억 이상",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "3호선 홍제역, 버스, 대형마트, 공원, 학군 우수"
},
{
"name": "서대문푸르지오센트럴파크 펜트하우스",
"address": "서울특별시 서대문구 홍제동",
"size": "150m² 이상",
"price": "20억 이상",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "3호선 홍제역, 버스, 대형마트, 공원, 학군 우수"
},
{
"name": "홍제원힐스테이트아파트 펜트하우스",
"address": "서울특별시 서대문구 홍제동",
"size": "150m² 이상",
"price": "20억 이상",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "3호선 홍제역, 버스, 공원, 대형마트, 학군 우수"
}
  ]
}
},

"서울특별시 서초구":{
"~2억":{
  "houses": [
    {
"name": "우공아트빌",
"address": "서울특별시 서초구 방배동",
"size": "68.01m² (20.6평)",
"price": "1억 8,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "7호선 내방역 인근, 버스, 주차장, 서초구청, 공원, 대형마트"
},
{
"name": "미주아파트",
"address": "서울특별시 서초구 방배동",
"size": "48.3m² (14.6평)",
"price": "1억 9,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "7호선 내방역, 버스, 공원, 대형마트, 학군"
},
{
"name": "대광아파트",
"address": "서울특별시 서초구 방배동",
"size": "47.87m² (14.5평)",
"price": "1억 9,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "7호선 내방역, 버스, 주차장, 공원, 대형마트"
}
  ]
},
"2억~5억": {
  "houses": [
    {
"name": "방배대우 듀오빌",
"address": "서울특별시 서초구 방배동",
"size": "30.18m² (9.1평)",
"price": "2억 6,500만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "7호선 내방역 도보 2분, 버스, 대형마트, 공원, 서초구청"
},
{
"name": "삼성세로피리차",
"address": "서울특별시 서초구 서초동",
"size": "35m² (10.6평)",
"price": "2억 8,500만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "2호선 강남역 5번 출구 인근, 버스, 대형마트, 공원, 학군"
},
{
"name": "신형 체리 아파트",
"address": "서울특별시 서초구 서초동",
"size": "32m² (9.7평)",
"price": "4억 2,700만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "2호선 양재역 인근, 버스, 대형마트, 공원, 학군"
}
  ]
},
"5억~10억": {
  "houses": [
    {
"name": "킴스빌리지",
"address": "서울특별시 서초구 잠원동",
"size": "30.18m² (9.1평)",
"price": "9억 7,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "3호선, 7호선, 9호선 잠원역 인근, 버스, 대형마트, 공원, 서초구청"
},
{
"name": "반포두산힐스빌",
"address": "서울특별시 서초구 반포동",
"size": "47.7m² (14.4평)",
"price": "9억 4,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "2호선, 3호선, 7호선, 9호선 교통 우수, 버스, 대형마트, 공원"
},
{
"name": "미영아파트",
"address": "서울특별시 서초구 양재동",
"size": "83.19m² (25.1평)",
"price": "8억 5,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "버스, 대형마트, 공원, 학군 우수"
}
  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "서초래미안서밋",
  "address": "서울특별시 서초구 서초동",
  "size": "84m² (25평)",
  "price": "13억 5,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 2호선 서초역, 버스, 대형마트, 공원, 학군 우수"
},
{
  "name": "반포자이",
  "address": "서울특별시 서초구 반포동",
  "size": "84m² (25평)",
  "price": "14억 2,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 9호선 신반포역, 버스, 대형마트, 공원, 학군 우수"
},
{
  "name": "래미안서초에스티지S",
  "address": "서울특별시 서초구 서초동",
  "size": "84m² (25평)",
  "price": "15억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "지하철 2호선 서초역, 버스, 대형마트, 공원, 학군 우수"
}
  ]
},
"15억~20억": {
  "houses": [
    {
"name": "서초현대3차 301동",
"address": "서울특별시 서초구 서초동",
"size": "102.63m² (31평)",
"price": "18억 ~ 20억",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "지하철 2호선 서초역, 버스, 대형마트, 공원, 서초구청, 학군 우수"
},
{
"name": "서초대우디오빌프라임 1동",
"address": "서울특별시 서초구 서초동",
"size": "103.8m² (31.4평)",
"price": "15억 ~ 16억 9,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "강남대로 인접, 지하철 2호선 서초역, 버스, 대형마트, 공원, 학군 우수"
},
{
"name": "래미안원베일리",
"address": "서울특별시 서초구 반포동",
"size": "84m² (25평)",
"price": "19억 5,000만원",
"auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
"infra": "한강변, 지하철 3호선 반포역, 버스, 대형마트, 공원, 학군 우수"
}
  ]
},
"20억 이상": {
  "houses": [
{
  "name": "래미안원펜타스",
  "address": "서울특별시 서초구 반포동 12번지",
  "size": "84m² (25평)",
  "price": "31억 4,000만원 (2025년 2월 실거래가 평균)",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "한강변 입지, 우수한 학군, 반포역 인근, 버스, 대형마트, 공원"
}
,
{
  "name": "아크로리버파크",
  "address": "서울특별시 서초구 반포동",
  "size": "84m² (25평)",
  "price": "30억 이상 (2025년 1~2월 실거래가)",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "한강 조망, 반포한강공원, 우수한 학군, 지하철 9호선 신반포역, 버스, 대형마트"
}
,
{
  "name": "래미안퍼스티지",
  "address": "서울특별시 서초구 반포동",
  "size": "84m² (25평)",
  "price": "28억 ~ 32억 (2025년 실거래가 범위)",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "한강변, 고급 브랜드 단지, 반포역 인근, 버스, 대형마트, 공원, 학군 우수"
}

  ]
}
},

"서울특별시 성동구":{
"~2억":{
  "houses": [
    
  ]
},
"2억~5억": {
  "houses": [
    
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "서울숲 금강아미움",
  "address": "서울특별시 성동구 성수동2가 836",
  "size": "81m² (24평)",
  "price": "10억 5,500만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "성수역 도보 6분, 성동구청 인근, 서울숲공원, 대형마트 차량 7분, 버스정류장 도보 5분"
},
{
  "name": "신금호두산위브",
  "address": "서울특별시 성동구 금호동",
  "size": "84m² (25평)",
  "price": "12억 2,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "금호역 도보 5분, 금호구청, 한강공원 인접, 이마트 금호점, 버스 다수"
},
{
  "name": "성수동1가 동아",
  "address": "서울특별시 성동구 성수동1가",
  "size": "85m² (26평)",
  "price": "11억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "성수역 초역세권, 성동구청, 서울숲공원, 대형마트 차량 5분, 버스정류장 인접"
}

  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "금호대우",
  "address": "서울특별시 성동구 금호동",
  "size": "84m² (25평)",
  "price": "17억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "금호역 도보 5분, 금호구청, 한강공원, 이마트 금호점, 버스 다수"
},
{
  "name": "힐스테이트 성수",
  "address": "서울특별시 성동구 성수동2가",
  "size": "117m² (35평)",
  "price": "18억 3,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "성수역 도보 5분, 성동구청, 서울숲공원, 대형마트 차량 7분, 버스 정류장"
},
{
  "name": "옥수파크힐스",
  "address": "서울특별시 성동구 옥수동",
  "size": "85m² (26평)",
  "price": "18억 9,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "옥수역 도보 7분, 성동구청, 한강공원, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"20억 이상": {
  "houses": [
{
  "name": "서울숲 아이파크 리버포레",
  "address": "서울특별시 성동구 성수동",
  "size": "84m² (25평)",
  "price": "31억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "뚝섬역 도보 5분, 성동구청, 서울숲공원, 대형마트 차량 7분, 버스 정류장 인접"
},
{
  "name": "갤러리아 포레",
  "address": "서울특별시 성동구 성수동1가",
  "size": "271m² (82평)",
  "price": "67억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "성수역 초역세권, 성동구청, 서울숲공원, 고급 상권 및 대형마트 인접"
},
{
  "name": "트리마제",
  "address": "서울특별시 성동구 성수동1가",
  "size": "137m² (41평)",
  "price": "40억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "성수역 도보 5분, 성동구청, 서울숲공원, 대형마트 차량 7분, 버스 다수"
}

  ]
}
},

"서울특별시 성북구":{
"~2억":{
  "houses": [
    {
  "name": "성북구 상월곡동 단독주택(빌라)",
  "address": "서울특별시 성북구 상월곡동",
  "size": "50m² (15평)",
  "price": "1억 8,000만원 내외",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인",
  "infra": "돌곶이역 도보 10분, 성북구청 차량 10분, 중랑천공원 인근, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "성북구 길음동 빌라",
  "address": "서울특별시 성북구 길음동",
  "size": "55m² (16평)",
  "price": "1억 9,500만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "길음역 도보 7분, 성북구청 차량 15분, 길음뉴타운 공원, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "성북구 장위동 단독주택",
  "address": "서울특별시 성북구 장위동",
  "size": "60m² (18평)",
  "price": "2억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "장위역 도보 7분, 성북구청 차량 15분, 장위근린공원, 대형마트 차량 12분, 버스 다수"
}

  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "신안파크 2동 아파트",
  "address": "서울특별시 성북구 신안동",
  "size": "96.9m² (29평)",
  "price": "5억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "성신여대입구역 차량 10분, 성북구청 차량 15분, 인근 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "보문동5가 한옥주택",
  "address": "서울특별시 성북구 보문동5가",
  "size": "80.7m² (24평)",
  "price": "5억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "보문역 도보 5분, 성북구청 차량 15분, 인근 공원, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "성북동 단독주택(소형)",
  "address": "서울특별시 성북구 성북동",
  "size": "42.98m² (13평)",
  "price": "4억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "한성대입구역 차량 10분, 성북구청 차량 15분, 북악산공원 인근, 버스 다수, 대형마트 차량 15분"
}

  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "길음뉴타운5단지 래미안 아파트 506동",
  "address": "서울특별시 성북구 길음동",
  "size": "81.01m² (25평)",
  "price": "9억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "길음역 도보 5분, 성북구청 차량 15분, 길음뉴타운 공원, 대형마트 차량 10분, 버스 다수, 자주식 주차장 완비"
},
{
  "name": "삼선동5가 다가구 주택 해상빌",
  "address": "서울특별시 성북구 삼선동5가 173",
  "size": "108.45m² (33평)",
  "price": "10억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "보문역 도보 10분, 성북구청 차량 15분, 주택가 위치, 임대수익형 원룸건물, 주차 가능, 버스 다수"
},
{
  "name": "돈암현대아파트",
  "address": "서울특별시 성북구 돈암동",
  "size": "57m² (17평)",
  "price": "5억 9,500만원",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "보문역 도보 5분, 성북구청 차량 15분, 인근 대형마트, 버스 다수, 공원 인접"
}


  ]
},
"10억~15억": {
  "houses": [
    
{
  "name": "삼선SK뷰 아파트",
  "address": "서울특별시 성북구 삼선동3가 116",
  "size": "116.86m² (35평)",
  "price": "15억 3,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "동묘앞역 차량 10분, 성북구청 차량 15분, 삼선동 공원 인근, 버스 다수, 대형마트 차량 10분, 자주식 주차장 완비"
},
{
  "name": "길음뉴타운래미안6단지 아파트",
  "address": "서울특별시 성북구 길음동 113.22m²",
  "size": "113.22m² (34평)",
  "price": "14억 1,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "길음역 도보 5분, 성북구청 차량 15분, 인근 공원, 대형마트 차량 10분, 버스 다수, 주차장 완비"
},
{
  "name": "꿈의숲코오롱하늘채 아파트",
  "address": "서울특별시 성북구 삼양동 94.28m²",
  "size": "94.28m² (28평)",
  "price": "13억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "삼양역 도보 7분, 성북구청 차량 15분, 꿈의숲공원 인근, 대형마트 차량 10분, 버스 다수, 자주식 주차장"
}
  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "롯데캐슬클라시아",
  "address": "서울특별시 성북구 길음동 1289",
  "size": "109.52m² (33평)",
  "price": "15억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "길음역 도보 5분, 성북구청 차량 15분, 길음뉴타운 공원, 대형마트 차량 10분, 자주식 주차장 완비, 버스 다수"
},
{
  "name": "보문리슈빌하우트",
  "address": "서울특별시 성북구 보문동1가 228",
  "size": "110.91m² (33평)",
  "price": "15억",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "보문역 도보 1분, 성북천뷰 남서향 확장형, 성북구청 차량 15분, 공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "삼선SK뷰",
  "address": "서울특별시 성북구 삼선동3가 116",
  "size": "116.86m² (35평)",
  "price": "15억 3,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "동묘앞역 차량 10분, 성북구청 차량 15분, 삼선동 공원 인근, 대형마트 차량 10분, 자주식 주차장 완비, 버스 다수"
}

  ]
},
"20억 이상": {
  "houses": [
{
  "name": "성북동 단독주택 신축부지",
  "address": "서울특별시 성북구 성북동",
  "size": "대지 301m² (91평) / 연면적 61m² (18평)",
  "price": "20억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "성북구청 차량 15분, 차량 이동 용이, 신축부지 적합, 경사면 구조, 주변 자연환경 우수"
},
{
  "name": "롯데캐슬클라시아",
  "address": "서울특별시 성북구 길음동 1289",
  "size": "공급 140.43m² / 전용 112.5m²",
  "price": "20억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "길음역 도보 5분, 성북구청 차량 15분, 길음뉴타운 공원, 대형마트 차량 10분, 자주식 주차장 완비, 버스 다수"
},
{
  "name": "성북동 단독주택 (고급 단독주택 사례)",
  "address": "서울특별시 성북구 성북동",
  "size": "약 300m² 이상 대지",
  "price": "25억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "성북구청 차량 15분, 북악산공원 인근, 고급 주거지역, 대형마트 차량 15분, 버스 다수"
}

  ]
}
},

"서울특별시 송파구":{
"~2억":{
  "houses": [
    {
  "name": "가락두산위브센티움 오피스텔",
  "address": "서울특별시 송파구 가락동",
  "size": "25.32m² (7.6평)",
  "price": "2억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "가락시장역 도보 10분, 송파구청 차량 10분, 경찰병원역 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "잠실역웰리지더테라스 오피스텔",
  "address": "서울특별시 송파구 방이동 42",
  "size": "45.81m² (13.9평)",
  "price": "2억 7,000만원 (급매가)",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "잠실역 도보 7분, 송파구청 차량 8분, 석촌호수공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "송파구 가락동 소형 아파트",
  "address": "서울특별시 송파구 가락동",
  "size": "25m² (7.5평)",
  "price": "1억 7,300만원",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "가락시장역 도보 10분, 송파구청 차량 10분, 경찰병원역 인근, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "송파 가락두산위브센티움 소형",
  "address": "서울특별시 송파구 가락동",
  "size": "14.3m² (4평)",
  "price": "2억 6,500만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "가락시장역 도보 5분, 송파구청 차량 10분, 올림픽공원 인근, 버스 다수, 대형마트 도보 10분"
},
{
  "name": "송파구 소형 오피스텔",
  "address": "서울특별시 송파구 잠실동",
  "size": "20m² (6평)",
  "price": "3억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "잠실역 도보 7분, 송파구청 차량 8분, 석촌호수공원 인근, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "송파구 소형 아파트",
  "address": "서울특별시 송파구 문정동",
  "size": "25m² (7.5평)",
  "price": "4억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "문정역 도보 5분, 송파구청 차량 10분, 공원 인근, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "송파동 삼성래미안 아파트",
  "address": "서울특별시 송파구 송파동",
  "size": "80m² (24평)",
  "price": "10억 9,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "가락시장역 도보 7분, 송파구청 차량 10분, 올림픽공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "가락동 신한에스빌 아파트",
  "address": "서울특별시 송파구 가락동",
  "size": "85m² (25평)",
  "price": "10억 2,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "가락시장역 도보 5분, 송파구청 차량 10분, 공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "송파동 래미안송파파인탑",
  "address": "서울특별시 송파구 송파동",
  "size": "75m² (22평)",
  "price": "18억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "송파역 도보 5분, 송파구청 차량 10분, 올림픽공원 인근, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "송파위례24단지 꿈에그린 2411동",
  "address": "서울특별시 송파구 위례동",
  "size": "81.93m² (24.7평)",
  "price": "13억 5,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "위례중앙역 도보 10분, 송파구청 차량 15분, 위례중앙공원, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "송파파크데일2단지 205동",
  "address": "서울특별시 송파구 마천동",
  "size": "148.75m² (45평)",
  "price": "13억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "마천역 도보 7분, 송파구청 차량 20분, 인근 공원, 대형마트 차량 10분, 버스 다수, 자주식 주차장 완비"
},
{
  "name": "송파롯데캐슬 공인중개사 추천 매물",
  "address": "서울특별시 송파구 잠실동",
  "size": "84.94m² (25.7평)",
  "price": "14억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "잠실역 도보 8분, 송파구청 차량 10분, 석촌호수공원 인근, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "올림픽훼밀리타운 아파트 214동 203호",
  "address": "서울특별시 송파구 문정동 150번지",
  "size": "117.6m² (35.5평)",
  "price": "15억 6,160만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "가락시장역 도보 10분, 송파대로, 오금로 인근, 가원초·중, 문정고, 버스 다수"
},
{
  "name": "송파시그니처롯데캐슬 114동",
  "address": "서울특별시 송파구",
  "size": "111.62m² (34평)",
  "price": "15억 9,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "지하철 인근, 송파구청 차량 10분, 대형마트, 공원, 버스 다수, 자주식 주차장 완비"
},
{
  "name": "송파파크하비오푸르지오 104동",
  "address": "서울특별시 송파구",
  "size": "116.34m² (35평)",
  "price": "15억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "지하철역 인근, 송파구청 차량 10분, 대형마트, 공원, 버스 다수"
}

  ]
},
"20억 이상": {
  "houses": [
{
  "name": "송파구 가락동 고급 아파트",
  "address": "서울특별시 송파구 가락동",
  "size": "100m² (30평)",
  "price": "30억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "송파역 도보 2분, 송파구청 차량 10분, 올림픽공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "송파구 잠실동 고급 아파트",
  "address": "서울특별시 송파구 잠실동",
  "size": "110m² (33평)",
  "price": "26억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "잠실역 도보 5분, 송파구청 차량 10분, 석촌호수공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "송파구 문정동 고급 아파트",
  "address": "서울특별시 송파구 문정동",
  "size": "105m² (32평)",
  "price": "24억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "문정역 도보 7분, 송파구청 차량 10분, 공원 인근, 대형마트 차량 10분, 버스 다수"
}
  ]
}
},

"서울특별시 양천구":{
"~2억":{
  "houses": [
    {
  "name": "목동 현대파크빌 오피스텔",
  "address": "서울특별시 양천구 목동",
  "size": "46.28m² (14평)",
  "price": "2억 500만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "목동역 도보 5분, 양천구청 차량 10분, 목동공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "신월동 빌라",
  "address": "서울특별시 양천구 신월동",
  "size": "33m² (10평)",
  "price": "1억 9,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "신월역 도보 10분, 양천구청 차량 15분, 공원 인근, 대형마트 차량 12분, 버스 다수"
},
{
  "name": "목동 다가구 주택",
  "address": "서울특별시 양천구 목동",
  "size": "50m² (15평)",
  "price": "1억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "목동역 도보 7분, 양천구청 차량 10분, 목동공원 인근, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "신월동 소형 아파트",
  "address": "서울특별시 양천구 신월동",
  "size": "29m² (9평)",
  "price": "4억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "신월역 도보 8분, 양천구청 차량 15분, 공원 인근, 대형마트 차량 12분, 버스 다수"
},
{
  "name": "목동 빌라",
  "address": "서울특별시 양천구 목동",
  "size": "40m² (12평)",
  "price": "3억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "목동역 도보 7분, 양천구청 차량 10분, 목동공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "신정동 다가구 주택",
  "address": "서울특별시 양천구 신정동",
  "size": "45m² (13평)",
  "price": "4억 9,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "신정네거리역 도보 10분, 양천구청 차량 12분, 공원 인근, 대형마트 차량 12분, 버스 다수"
}

  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "목동 신시가지7단지 아파트",
  "address": "서울특별시 양천구 목동",
  "size": "66m² (20평)",
  "price": "7억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "오목교역 도보 8분, 양천구청 차량 10분, 목동공원, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "양천구 신시가지10단지 아파트",
  "address": "서울특별시 양천구 목동",
  "size": "85m² (25평)",
  "price": "9억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "오목교역 도보 10분, 양천구청 차량 10분, 목동공원, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "신정동 현대5차 아파트",
  "address": "서울특별시 양천구 신정동",
  "size": "84m² (25평)",
  "price": "8억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "신정네거리역 도보 10분, 양천구청 차량 12분, 공원 인근, 대형마트 차량 12분, 버스 다수"
}

  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "목동센트럴 아이파크위브 1단지",
  "address": "서울특별시 양천구 신월동",
  "size": "85m² (25평)",
  "price": "11억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "목동역 도보 5분, 양천구청 차량 10분, 목동공원, 대형마트 차량 10분, 버스 다수, 자주식 주차장 완비"
},
{
  "name": "신정뉴타운롯데캐슬",
  "address": "서울특별시 양천구 신월동",
  "size": "85m² (25평)",
  "price": "10억 3,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "신월역 도보 5분, 양천구청 차량 10분, 공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "목동 힐스테이트 아파트",
  "address": "서울특별시 양천구 목동",
  "size": "84m² (25평)",
  "price": "12억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "목동역 도보 7분, 양천구청 차량 10분, 목동공원, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "목동 신시가지 5단지 아파트",
  "address": "서울특별시 양천구 목동",
  "size": "84m² (25평)",
  "price": "17억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "목동역 도보 5분, 양천구청 차량 10분, 목동공원, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "신정동 상가주택",
  "address": "서울특별시 양천구 신정동",
  "size": "332m² (100평) 단독 및 상가",
  "price": "20억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "신정네거리역 도보 5분, 양천구청 차량 10분, 상가 및 주거 복합, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "목동 힐스테이트 고급 아파트",
  "address": "서울특별시 양천구 목동",
  "size": "110m² (33평)",
  "price": "18억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "목동역 도보 7분, 양천구청 차량 10분, 목동공원, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"20억 이상": {
  "houses": [
{
  "name": "목동 신시가지 14단지 아파트",
  "address": "서울특별시 양천구 목동",
  "size": "110m² (33평)",
  "price": "25억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "목동역 도보 5분, 양천구청 차량 10분, 목동공원, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "신정동 상가주택 고급 매물",
  "address": "서울특별시 양천구 신정동",
  "size": "350m² (106평) 단독 및 상가",
  "price": "28억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "신정네거리역 도보 5분, 양천구청 차량 10분, 상가 및 주거 복합, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "목동 힐스테이트 프리미엄 아파트",
  "address": "서울특별시 양천구 목동",
  "size": "120m² (36평)",
  "price": "30억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "목동역 도보 7분, 양천구청 차량 10분, 목동공원, 대형마트 차량 10분, 버스 다수"
}

  ]
}
},

"서울특별시 영등포구":{
"~2억":{
  "houses": [
    {
  "name": "영등포구 여의도동 소형 아파트",
  "address": "서울특별시 영등포구 여의도동",
  "size": "40.39m² (12평)",
  "price": "2억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "여의도역 도보 7분, 영등포구청 차량 10분, 여의도공원, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "영등포구 신길동 빌라",
  "address": "서울특별시 영등포구 신길동",
  "size": "50m² (15평)",
  "price": "1억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "신길역 도보 8분, 영등포구청 차량 12분, 공원 인근, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "영등포구 문래동 빌라",
  "address": "서울특별시 영등포구 문래동",
  "size": "55m² (16평)",
  "price": "1억 9,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "문래역 도보 5분, 영등포구청 차량 10분, 공원 인근, 버스 다수, 대형마트 차량 10분"
}

  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "영등포구 신길동 소형 아파트",
  "address": "서울특별시 영등포구 신길동",
  "size": "30m² (9평)",
  "price": "4억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "신길역 도보 8분, 영등포구청 차량 12분, 공원 인근, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "영등포구 문래동 소형 아파트",
  "address": "서울특별시 영등포구 문래동",
  "size": "35m² (10평)",
  "price": "3억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "문래역 도보 5분, 영등포구청 차량 10분, 공원 인근, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "영등포구 당산동 오피스텔",
  "address": "서울특별시 영등포구 당산동",
  "size": "25m² (7.5평)",
  "price": "4억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "당산역 도보 5분, 영등포구청 차량 10분, 한강공원 인근, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "영등포구 당산동 아파트",
  "address": "서울특별시 영등포구 당산동",
  "size": "70m² (21평)",
  "price": "8억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "당산역 도보 5분, 영등포구청 차량 10분, 한강공원, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "영등포구 신길동 아파트",
  "address": "서울특별시 영등포구 신길동",
  "size": "75m² (23평)",
  "price": "7억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "신길역 도보 7분, 영등포구청 차량 12분, 공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "영등포구 문래동 아파트",
  "address": "서울특별시 영등포구 문래동",
  "size": "80m² (24평)",
  "price": "9억 2,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "문래역 도보 5분, 영등포구청 차량 10분, 공원 인근, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "당산현대5차 아파트",
  "address": "서울특별시 영등포구 당산동4가",
  "size": "114.84m² (34평)",
  "price": "14억 1,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "당산역 도보 5분, 영등포구청 차량 10분, 한강공원, 대형마트 차량 10분, 버스 다수, 자주식 주차장 완비"
},
{
  "name": "동부센트레빌 아파트",
  "address": "서울특별시 영등포구 당산동3가",
  "size": "114.96m² (35평)",
  "price": "12억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "당산역 도보 5분, 영등포구청 차량 10분, 한강공원, 대형마트 차량 10분, 버스 다수, 자주식 주차장 완비"
},
{
  "name": "당산현대3차 아파트",
  "address": "서울특별시 영등포구 당산동4가",
  "size": "84.5m² (26평)",
  "price": "12억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "당산역 도보 5분, 영등포구청 차량 10분, 한강공원, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "당산삼성래미안4차 아파트",
  "address": "서울특별시 영등포구 당산동4가",
  "size": "133.41m² (40평)",
  "price": "18억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "당산역 도보 5분, 영등포구청 차량 10분, 한강공원, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "반도유보라팰리스 아파트",
  "address": "서울특별시 영등포구 당산동5가",
  "size": "124.62m² (38평)",
  "price": "16억",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "당산역 도보 7분, 영등포구청 차량 10분, 한강공원, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "강변래미안 아파트",
  "address": "서울특별시 영등포구 당산동",
  "size": "108.15m² (33평)",
  "price": "15억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
  "infra": "당산역 도보 5분, 영등포구청 차량 10분, 한강공원, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"20억 이상": {
  "houses": [
{
  "name": "영등포구 여의도동 리버타워",
  "address": "서울특별시 영등포구 여의도동",
  "size": "234.02m² (70평)",
  "price": "23억 7,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "여의도역 도보 7분, 영등포구청 차량 10분, 여의도공원, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "영등포구 여의도동 고급 아파트",
  "address": "서울특별시 영등포구 여의도동",
  "size": "234.02m² (70평)",
  "price": "22억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "여의도역 도보 7분, 영등포구청 차량 10분, 여의도공원, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "영등포구 여의도동 고급 아파트",
  "address": "서울특별시 영등포구 여의도동",
  "size": "234.02m² (70평)",
  "price": "20억 4,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "여의도역 도보 7분, 영등포구청 차량 10분, 여의도공원, 대형마트 차량 10분, 버스 다수"
}

  ]
}
},

"서울특별시 용산구":{
"~2억":{
  "houses": [
    {
  "name": "용산구 효창동 2룸 빌라",
  "address": "서울특별시 용산구 효창동",
  "size": "51m² (15평)",
  "price": "1억 9,500만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "효창공원역 도보 5분, 용산구청 차량 10분, 용산공원 인근, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "용산구 문배동 소형 오피스텔",
  "address": "서울특별시 용산구 문배동",
  "size": "28m² (8평)",
  "price": "2억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "신용산역 도보 5분, 용산구청 차량 10분, 용산공원 인근, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "용산구 후암동 소형 빌라",
  "address": "서울특별시 용산구 후암동",
  "size": "35m² (10평)",
  "price": "2억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "녹사평역 도보 7분, 용산구청 차량 10분, 용산공원 인근, 버스 다수, 대형마트 차량 10분"
}


  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "용산구 벽산메가트리움 아파트",
  "address": "서울특별시 용산구 한강대로43길",
  "size": "59m² (18평)",
  "price": "4억 9,000만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "이촌역 도보 8분, 용산구청 차량 10분, 용산공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "용산구 용산아크로타워 아파트",
  "address": "서울특별시 용산구 한강로",
  "size": "84m² (25평)",
  "price": "5억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "용산역 도보 7분, 용산구청 차량 10분, 용산공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "용산구 용문동 단독주택",
  "address": "서울특별시 용산구 용문동",
  "size": "70m² (21평)",
  "price": "4억 8,000만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "효창공원앞역 도보 5분, 용산구청 차량 10분, 용산공원 인근, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "용산더프라임 아파트",
  "address": "서울특별시 용산구 원효로1가",
  "size": "59.5m² (18평)",
  "price": "9억 5,000만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "원효로1가역 도보 5분, 용산구청 차량 10분, 용산공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "이안용산3차 아파트",
  "address": "서울특별시 용산구 문배동",
  "size": "84.8m² (25평)",
  "price": "9억 5,000만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "문배동역 도보 7분, 용산구청 차량 10분, 용산공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "지오베르크 아파트",
  "address": "서울특별시 용산구 문배동",
  "size": "76m² (23평)",
  "price": "9억 5,000만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "문배동역 도보 7분, 용산구청 차량 10분, 용산공원 인근, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "한남아이파크애비뉴 아파트",
  "address": "서울특별시 용산구 한남동",
  "size": "49.7m² (15평)",
  "price": "12억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "한남역 도보 5분, 용산구청 차량 10분, 한강공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "용산파크e-편한세상 아파트",
  "address": "서울특별시 용산구 한강로2가",
  "size": "102.9m² (31평)",
  "price": "15억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "삼각지역 도보 5분, 용산구청 차량 10분, 한강공원, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "한남더힐 아파트",
  "address": "서울특별시 용산구 한남동",
  "size": "84.9m² (26평)",
  "price": "14억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "한남역 도보 5분, 용산구청 차량 10분, 한강공원, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "현대리버티하우스 아파트",
  "address": "서울특별시 용산구 한남동",
  "size": "217.4m² (66평)",
  "price": "20억 4,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "한남역 도보 5분, 용산구청 차량 10분, 한강공원, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "용산구 이태원동 단독주택",
  "address": "서울특별시 용산구 이태원동",
  "size": "150m² (45평)",
  "price": "18억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "이태원역 도보 7분, 용산구청 차량 10분, 녹사평역 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "한남더힐 단독주택",
  "address": "서울특별시 용산구 한남동",
  "size": "200m² (60평)",
  "price": "19억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "한남역 도보 5분, 용산구청 차량 10분, 한강공원, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"20억 이상": {
  "houses": [
{
  "name": "나인원한남 아파트",
  "address": "서울특별시 용산구 한남동",
  "size": "273m² (82평)",
  "price": "220억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "한남역 도보 5분, 용산구청 차량 10분, 한강공원, 대형마트 차량 10분, 버스 다수, 자주식 주차장 완비"
},
{
  "name": "한남더힐 아파트",
  "address": "서울특별시 용산구 한남동",
  "size": "240m² (72평)",
  "price": "120억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "한남역 도보 5분, 용산구청 차량 10분, 한강공원, 대형마트 차량 10분, 버스 다수, 자주식 주차장 완비"
},
{
  "name": "아크로서울포레스트 아파트",
  "address": "서울특별시 용산구",
  "size": "198m² (60평)",
  "price": "145억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "성수역 도보 5분, 성동구청 차량 10분, 서울숲공원, 대형마트 차량 10분, 버스 다수"
}

  ]
}
},

"서울특별시 은평구":{
"~2억":{
  "houses": [
    {
  "name": "갈현동 3룸 빌라",
  "address": "서울특별시 은평구 갈현동",
  "size": "63m² (19평)",
  "price": "2억 5,500만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "6호선 구산역 버스 12분, 도보 14분, 은평구청 차량 10분, 불광천공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "대조동 빌라",
  "address": "서울특별시 은평구 대조동",
  "size": "43.3m² (13평)",
  "price": "2억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "불광역 도보 10분, 은평구청 차량 10분, 공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "응암동 단독주택",
  "address": "서울특별시 은평구 응암동",
  "size": "50m² (15평)",
  "price": "1억 9,000만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "응암역 도보 7분, 은평구청 차량 10분, 불광천공원 인근, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "응암동 신축 아파트",
  "address": "서울특별시 은평구 응암동",
  "size": "70m² (21평)",
  "price": "5억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "응암역 도보 5분, 은평구청 차량 10분, 불광천공원, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "갈현동 빌라",
  "address": "서울특별시 은평구 갈현동",
  "size": "60m² (18평)",
  "price": "4억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "구산역 버스 12분, 은평구청 차량 10분, 공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "대조동 다가구 주택",
  "address": "서울특별시 은평구 대조동",
  "size": "80m² (24평)",
  "price": "4억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "불광역 도보 10분, 은평구청 차량 10분, 공원 인근, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "은평뉴타운 힐스테이트 녹번",
  "address": "서울특별시 은평구 녹번동",
  "size": "84.89m² (25평)",
  "price": "8억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "녹번역 도보 7분, 은평구청 차량 10분, 북한산공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "응암동 현대아파트",
  "address": "서울특별시 은평구 응암동",
  "size": "75m² (23평)",
  "price": "7억 9,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "응암역 도보 5분, 은평구청 차량 10분, 불광천공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "진관동 단독주택",
  "address": "서울특별시 은평구 진관동",
  "size": "100m² (30평)",
  "price": "9억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "구파발역 차량 10분, 은평구청 차량 15분, 북한산공원 인근, 대형마트 차량 15분, 버스 다수"
}

  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "은평뉴타운 힐스테이트 녹번",
  "address": "서울특별시 은평구 녹번동",
  "size": "84.89m² (25평)",
  "price": "12억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "녹번역 도보 7분, 은평구청 차량 10분, 북한산공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "은평뉴타운 마고정3단지 아파트",
  "address": "서울특별시 은평구 진관동",
  "size": "167m² (50평)",
  "price": "15억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "구파발역 차량 10분, 은평구청 차량 15분, 북한산공원 인근, 대형마트 차량 15분, 버스 다수"
},
{
  "name": "은평뉴타운 폭포동4단지 아파트",
  "address": "서울특별시 은평구 폭포동",
  "size": "167m² (50평)",
  "price": "14억 6,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "녹번역 도보 8분, 은평구청 차량 10분, 북한산공원 인근, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"15억~20억": {
  "houses": [
  {
  "name": "은평구 단독주택",
  "address": "서울특별시 은평구 진관동",
  "size": "250m² (75평)",
  "price": "18억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "구파발역 차량 10분, 은평구청 차량 15분, 북한산공원 인근, 대형마트 차량 15분, 버스 다수"
},
{
  "name": "은평구 고급 빌라",
  "address": "서울특별시 은평구 불광동",
  "size": "150m² (45평)",
  "price": "17억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "불광역 도보 10분, 은평구청 차량 10분, 불광천공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "은평뉴타운 고급 아파트",
  "address": "서울특별시 은평구 진관동",
  "size": "180m² (54평)",
  "price": "19억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "구파발역 차량 10분, 은평구청 차량 15분, 북한산공원 인근, 대형마트 차량 15분, 버스 다수"
}
  
  ]
},
"20억 이상": {
  "houses": [
{
  "name": "은평구 단독주택 고급 매물",
  "address": "서울특별시 은평구 진관동",
  "size": "300m² (90평)",
  "price": "25억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "구파발역 차량 10분, 은평구청 차량 15분, 북한산공원 인근, 대형마트 차량 15분, 버스 다수"
},
{
  "name": "은평구 고급 단독주택",
  "address": "서울특별시 은평구 불광동",
  "size": "280m² (85평)",
  "price": "22억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "불광역 도보 10분, 은평구청 차량 10분, 불광천공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "은평뉴타운 프리미엄 아파트",
  "address": "서울특별시 은평구 진관동",
  "size": "200m² (60평)",
  "price": "30억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "구파발역 차량 10분, 은평구청 차량 15분, 북한산공원 인근, 대형마트 차량 15분, 버스 다수"
}

  ]
}
},

"서울특별시 종로구":{
"~2억":{
  "houses": [
    {
  "name": "종로구 충신동 소형 빌라",
  "address": "서울특별시 종로구 충신동",
  "size": "33m² (10평)",
  "price": "1억 9,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "종로5가역 도보 5분, 종로구청 차량 10분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "종로구 명륜2가 빌라",
  "address": "서울특별시 종로구 명륜2가",
  "size": "40.11m² (12평)",
  "price": "2억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "혜화역 도보 7분, 성균관대 인근, 종로구청 차량 10분, 버스 다수, 대형마트 차량 12분"
},
{
  "name": "종로구 창신동 소형 빌라",
  "address": "서울특별시 종로구 창신동",
  "size": "35m² (10평)",
  "price": "2억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "동대문역 도보 5분, 종로구청 차량 10분, 버스 다수, 대형마트 차량 10분, 공원 인근"
}

  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "종로구 혜화동 빌라",
  "address": "서울특별시 종로구 혜화동 20-15",
  "size": "55m² (16평)",
  "price": "5억 6,900만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "혜화역 도보 5분, 성균관대 인근, 종로구청 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "종로구 이화동 빌라",
  "address": "서울특별시 종로구 이화동 5-10",
  "size": "55m² (16평)",
  "price": "5억 9,500만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "혜화역 도보 7분, 조용한 주택가, 엘리베이터 및 주차 가능, 버스 다수"
},
{
  "name": "종로구 명륜동 빌라",
  "address": "서울특별시 종로구 명륜동",
  "size": "60m² (18평)",
  "price": "4억 8,000만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "혜화역 도보 10분, 성균관대 인근, 종로구청 차량 10분, 버스 다수, 대형마트 차량 10분"
}

  ]
},
"5억~10억": {
  "houses": [
   {
  "name": "종로구 명륜동 주상복합 아파트",
  "address": "서울특별시 종로구 명륜동",
  "size": "70m² (21평)",
  "price": "8억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "혜화역 도보 7분, 성균관대 인근, 종로구청 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "종로구 창신동 아파트",
  "address": "서울특별시 종로구 창신동",
  "size": "75m² (23평)",
  "price": "9억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "동대문역 도보 5분, 종로구청 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "종로구 혜화동 아파트",
  "address": "서울특별시 종로구 혜화동",
  "size": "80m² (24평)",
  "price": "9억 2,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "혜화역 도보 5분, 성균관대 인근, 종로구청 차량 10분, 버스 다수, 대형마트 차량 10분"
}
 
  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "종로구 평창동 단독주택",
  "address": "서울특별시 종로구 평창동",
  "size": "182m² (55평)",
  "price": "15억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "북악산공원 인근, 종로구청 차량 15분, 대형마트 차량 15분, 버스 다수"
},
{
  "name": "종로구 익선동 2층 건물",
  "address": "서울특별시 종로구 익선동",
  "size": "100m² (30평)",
  "price": "14억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "종로3가역 도보 5분, 종로구청 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "종로구 평창동 고급 단독주택",
  "address": "서울특별시 종로구 평창동",
  "size": "150m² (45평)",
  "price": "13억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "북악산공원 인근, 종로구청 차량 15분, 대형마트 차량 15분, 버스 다수"
}

  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "종로구 평창동 단독주택",
  "address": "서울특별시 종로구 평창동",
  "size": "277m² (84평)",
  "price": "19억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "북악산공원 인근, 종로구청 차량 15분, 대형마트 차량 15분, 버스 다수, 주차 5대 가능"
},
{
  "name": "종로구 부암동 단독주택",
  "address": "서울특별시 종로구 부암동",
  "size": "165m² (50평)",
  "price": "16억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "인왕산공원 인근, 종로구청 차량 15분, 대형마트 차량 15분, 버스 다수"
},
{
  "name": "종로구 평창동 고급 단독주택",
  "address": "서울특별시 종로구 평창동",
  "size": "180m² (54평)",
  "price": "18억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "북악산공원 인근, 종로구청 차량 15분, 대형마트 차량 15분, 버스 다수"
}

  ]
},
"20억 이상": {
  "houses": [
{
  "name": "종로구 부암동 고급 단독주택",
  "address": "서울특별시 종로구 부암동",
  "size": "300m² (90평)",
  "price": "28억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "인왕산공원 인근, 종로구청 차량 15분, 대형마트 차량 15분, 버스 다수"
},
{
  "name": "종로구 평창동 고급 단독주택",
  "address": "서울특별시 종로구 평창동",
  "size": "250m² (75평)",
  "price": "25억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "북악산공원 인근, 종로구청 차량 15분, 대형마트 차량 15분, 버스 다수"
},
{
  "name": "종로구 신교동 고급빌라",
  "address": "서울특별시 종로구 신교동",
  "size": "240m² (72평)",
  "price": "27억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "종로구청 차량 10분, 버스 다수, 대형마트 차량 10분"
}

  ]
}
},

"서울특별시 중구":{
"~2억":{
  "houses": [
    {
  "name": "중구 신당동 소형 빌라",
  "address": "서울특별시 중구 신당동",
  "size": "33m² (10평)",
  "price": "1억 9,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "약수역 도보 5분, 중구청 차량 10분, 공원 인근, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "중구 황학동 다가구 주택",
  "address": "서울특별시 중구 황학동",
  "size": "50m² (15평)",
  "price": "2억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "동대문역 도보 7분, 중구청 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "중구 필동 단독주택",
  "address": "서울특별시 중구 필동",
  "size": "45m² (13평)",
  "price": "2억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "충무로역 도보 7분, 중구청 차량 10분, 남산공원 인근, 버스 다수, 대형마트 차량 10분"
}

  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "중구 신당동 아파트",
  "address": "서울특별시 중구 신당동",
  "size": "59m² (18평)",
  "price": "4억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "약수역 도보 5분, 중구청 차량 10분, 공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "중구 필동 빌라",
  "address": "서울특별시 중구 필동",
  "size": "60m² (18평)",
  "price": "4억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "충무로역 도보 7분, 중구청 차량 10분, 남산공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "중구 을지로 오피스텔",
  "address": "서울특별시 중구 을지로",
  "size": "30m² (9평)",
  "price": "3억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "을지로입구역 도보 5분, 중구청 차량 10분, 남산공원 인근, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "중구 묵정동 아파트",
  "address": "서울특별시 중구 묵정동 11-2",
  "size": "69.42m² (21평)",
  "price": "5억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "충무로역 도보 5분, 중구청 차량 10분, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "중구 신당동 아파트",
  "address": "서울특별시 중구 신당동",
  "size": "54.18m² (16평)",
  "price": "6억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "약수역 도보 5분, 중구청 차량 10분, 공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "중구 필동 아파트",
  "address": "서울특별시 중구 필동",
  "size": "60m² (18평)",
  "price": "7억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "충무로역 도보 7분, 중구청 차량 10분, 남산공원 인근, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "중구 신당동 청구e편한세상",
  "address": "서울특별시 중구 신당동 852",
  "size": "109.32m² (33평)",
  "price": "15억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "약수역 도보 5분, 중구청 차량 10분, 공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "중구 신당동 남산정은스카이",
  "address": "서울특별시 중구 신당동 366-126",
  "size": "114.48m² (34평)",
  "price": "15억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "버티고개역 도보 7분, 중구청 차량 10분, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "중구 신당동 동아약수하이츠",
  "address": "서울특별시 중구 신당동 842",
  "size": "114.92m² (34평)",
  "price": "14억 3,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "약수역 도보 5분, 중구청 차량 10분, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "중구 신당동 남산타운",
  "address": "서울특별시 중구 신당동",
  "size": "114.88m² (34평)",
  "price": "16억 2,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "약수역 도보 5분, 중구청 차량 10분, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "중구 신당동 신당푸르지오",
  "address": "서울특별시 중구 신당동",
  "size": "114.48m² (34평)",
  "price": "15억 3,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "버티고개역 도보 7분, 중구청 차량 10분, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "중구 신당동 신당삼성",
  "address": "서울특별시 중구 신당동",
  "size": "114.91m² (34평)",
  "price": "15억 2,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "버티고개역 도보 7분, 중구청 차량 10분, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"20억 이상": {
  "houses": [
{
  "name": "중구 신당동 고급 아파트",
  "address": "서울특별시 중구 신당동",
  "size": "118.47m² (36평)",
  "price": "20억 4,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "약수역 도보 5분, 중구청 차량 10분, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "중구 신당동 고급 아파트",
  "address": "서울특별시 중구 신당동",
  "size": "143.04m² (43평)",
  "price": "21억 4,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "버티고개역 도보 7분, 중구청 차량 10분, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "중구 신당동 고급 아파트",
  "address": "서울특별시 중구 신당동",
  "size": "114.9m² (34평)",
  "price": "21억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "약수역 도보 5분, 중구청 차량 10분, 대형마트 차량 10분, 버스 다수"
}

  ]
}
},

"서울특별시 중랑구":{
"~2억":{
  "houses": [
    {
  "name": "중랑구 상봉동 투룸 빌라",
  "address": "서울특별시 중랑구 상봉동",
  "size": "17.6m² (5평)",
  "price": "2억 1,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "중랑역, 상봉역 이용 가능, 주차 가능, 엘리베이터 있음, 반려동물 가능"
},
{
  "name": "중랑구 면목동 소형 빌라",
  "address": "서울특별시 중랑구 면목동",
  "size": "30m² (9평)",
  "price": "1억 9,000만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "사가정역 도보 3분, 중랑구청 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "중랑구 신내동 소형 빌라",
  "address": "서울특별시 중랑구 신내동",
  "size": "28m² (8평)",
  "price": "1억 8,500만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "중랑역 도보 5분, 상봉역 도보 7분, 버스 다수, 대형마트 차량 10분"
}

  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "중랑구 면목동 투룸 아파트",
  "address": "서울특별시 중랑구 면목동",
  "size": "42m² (13평)",
  "price": "4억 7,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "사가정역 도보 3분, 중랑구청 차량 10분, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "중랑구 상봉동 투룸 아파트",
  "address": "서울특별시 중랑구 상봉동",
  "size": "40m² (12평)",
  "price": "4억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "상봉역 도보 5분, 중랑구청 차량 10분, 공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "중랑구 망우동 소형 아파트",
  "address": "서울특별시 중랑구 망우동",
  "size": "45m² (13평)",
  "price": "4억 3,800만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "망우역 도보 10분, 중랑구청 차량 10분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "중랑구 면목동 한양수자인사가정파크 아파트",
  "address": "서울특별시 중랑구 면목동",
  "size": "78m² (24평)",
  "price": "5억 6,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "사가정역 도보 3분, 중랑구청 차량 10분, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "중랑구 묵동 자이 아파트",
  "address": "서울특별시 중랑구 묵동",
  "size": "90m² (27평)",
  "price": "9억 9,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "묵동역 도보 7분, 중랑구청 차량 10분, 공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "중랑구 면목동 다가구 주택",
  "address": "서울특별시 중랑구 면목동",
  "size": "70m² (21평)",
  "price": "7억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "면목역 도보 5분, 중랑구청 차량 10분, 버스 다수, 대형마트 차량 10분"
}

  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "중랑구 묵동 고급 아파트",
  "address": "서울특별시 중랑구 묵동",
  "size": "110m² (33평)",
  "price": "12억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "묵동역 도보 7분, 중랑구청 차량 10분, 공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "중랑구 상봉동 단독주택",
  "address": "서울특별시 중랑구 상봉동",
  "size": "150m² (45평)",
  "price": "13억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "상봉역 도보 5분, 중랑구청 차량 10분, 공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "중랑구 면목동 아파트",
  "address": "서울특별시 중랑구 면목동",
  "size": "100m² (30평)",
  "price": "10억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "면목역 도보 5분, 중랑구청 차량 10분, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "중랑구 묵동 대형 단독주택",
  "address": "서울특별시 중랑구 묵동",
  "size": "200m² (60평)",
  "price": "18억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "묵동역 도보 7분, 중랑구청 차량 10분, 공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "중랑구 상봉동 고급 빌라",
  "address": "서울특별시 중랑구 상봉동",
  "size": "180m² (54평)",
  "price": "17억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "상봉역 도보 5분, 중랑구청 차량 10분, 공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "중랑구 면목동 고급 아파트",
  "address": "서울특별시 중랑구 면목동",
  "size": "150m² (45평)",
  "price": "19억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "면목역 도보 5분, 중랑구청 차량 10분, 대형마트 차량 10분, 버스 다수"
}

  ]
},
"20억 이상": {
  "houses": [
{
  "name": "중랑구 묵동 대형 고급 단독주택",
  "address": "서울특별시 중랑구 묵동",
  "size": "300m² (90평)",
  "price": "25억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "묵동역 도보 7분, 중랑구청 차량 10분, 공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "중랑구 상봉동 고급 단독주택",
  "address": "서울특별시 중랑구 상봉동",
  "size": "280m² (85평)",
  "price": "22억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "상봉역 도보 5분, 중랑구청 차량 10분, 공원 인근, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "중랑구 면목동 프리미엄 아파트",
  "address": "서울특별시 중랑구 면목동",
  "size": "200m² (60평)",
  "price": "30억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "면목역 도보 5분, 중랑구청 차량 10분, 대형마트 차량 10분, 버스 다수"
}

  ]
}
},





"경기도 수원시 권선구":{
"~2억":{
  "houses": [
    {
  "name": "세종 아파트",
  "address": "경기도 수원시 권선구 세류동",
  "size": "76.58m² (23평)",
  "price": "1억 7,000만원",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "세류역 도보 10분, 권선구청 차량 10분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "공작 아파트",
  "address": "경기도 수원시 권선구 금곡동",
  "size": "38.43m² (12평)",
  "price": "1억 6,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "금곡역 도보 7분, 권선구청 차량 15분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "수원역 한양 아이클래스 퍼스트",
  "address": "경기도 수원시 권선구 서둔동",
  "size": "16.89m² (5평)",
  "price": "1억 6,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "수원역 도보 5분, 권선구청 차량 10분, 버스 다수, 대형마트 차량 10분, 공원 인근"
}
  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "단독주택 탑동",
  "address": "경기도 수원시 권선구 탑동",
  "size": "99.17m² (30평)",
  "price": "2억 6,500만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "세류역 차량 10분, 권선구청 차량 10분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "단독주택 세류동",
  "address": "경기도 수원시 권선구 세류동",
  "size": "109m² (33평)",
  "price": "3억 4,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "세류역 도보 5분, 권선구청 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "단독주택 세류동",
  "address": "경기도 수원시 권선구 세류동",
  "size": "132m² (40평)",
  "price": "3억 9,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "세류역 도보 5분, 권선구청 차량 10분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "다가구주택 세류동",
  "address": "경기도 수원시 권선구 세류동 467-12",
  "size": "155.3m² (47평)",
  "price": "5억 6,400만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "수원역 도보 10분, 권선구청 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "단독주택 세류동",
  "address": "경기도 수원시 권선구 세류동",
  "size": "180m² (54평)",
  "price": "8억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "세류역 도보 5분, 권선구청 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "다가구주택 세류동",
  "address": "경기도 수원시 권선구 세류동",
  "size": "231m² (70평)",
  "price": "10억 3,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "수원역 도보 10분, 권선구청 차량 10분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경기도 수원시 영통구":{
"~2억":{
  "houses": [
    {
  "name": "영통동 단독주택 소형",
  "address": "경기도 수원시 영통구 영통동",
  "size": "40m² (12평)",
  "price": "1억 8,000만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "영통역 차량 10분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "망포동 소형 빌라",
  "address": "경기도 수원시 영통구 망포동",
  "size": "35m² (10평)",
  "price": "2억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "망포역 도보 7분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "매탄동 소형 빌라",
  "address": "경기도 수원시 영통구 매탄동",
  "size": "30m² (9평)",
  "price": "1억 9,500만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "매탄역 도보 8분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "영통동 벽적골8단지 주공 아파트",
  "address": "경기도 수원시 영통구 영통동 972-2",
  "size": "82.59m² (25평)",
  "price": "4억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "영통역 차량 10분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "영통동 신나무실 건영 아파트",
  "address": "경기도 수원시 영통구 신나무실동",
  "size": "85m² (25평)",
  "price": "4억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "영통역 차량 10분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "망포동 현대 아파트",
  "address": "경기도 수원시 영통구 망포동",
  "size": "75m² (23평)",
  "price": "4억 9,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "망포역 도보 7분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "영통 아이파크",
  "address": "경기도 수원시 영통구 영통동",
  "size": "84m² (25평)",
  "price": "8억 3,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "영통역 도보 7분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "영통동 삼성 태영 아파트",
  "address": "경기도 수원시 영통구 영통동",
  "size": "85m² (25평)",
  "price": "9억 2,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "영통역 도보 7분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "영통동 신원 미주 아파트",
  "address": "경기도 수원시 영통구 영통동",
  "size": "84m² (25평)",
  "price": "7억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "영통역 도보 7분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "광교 아르데코 아파트",
  "address": "경기도 수원시 영통구 광교동",
  "size": "98.3m² (30평)",
  "price": "11억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "광교중앙역 도보 5분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "영통 푸르지오 파인베르",
  "address": "경기도 수원시 영통구 망포동",
  "size": "84m² (25평)",
  "price": "12억 3,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "망포역 도보 7분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "힐스테이트 영통",
  "address": "경기도 수원시 영통구 영통동",
  "size": "84m² (25평)",
  "price": "13억 7,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "영통역 도보 7분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "광교 중흥 에스클래스",
  "address": "경기도 수원시 영통구 광교동",
  "size": "110m² (33평)",
  "price": "16억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "광교중앙역 도보 5분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "영통 롯데캐슬 엘클래스 2단지",
  "address": "경기도 수원시 영통구 망포동",
  "size": "85m² (25평)",
  "price": "17억 2,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "망포역 도보 7분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "영통 자연앤힐스테이트",
  "address": "경기도 수원시 영통구 이의동",
  "size": "84m² (25평)",
  "price": "18억 9,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "광교중앙역 도보 5분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"20억 이상": {
  "houses": [
{
  "name": "광교 힐스테이트 레이크",
  "address": "경기도 수원시 영통구 광교동",
  "size": "120m² (36평)",
  "price": "25억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "광교중앙역 도보 5분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "광교 중흥 에스클래스 더퍼스트",
  "address": "경기도 수원시 영통구 광교동",
  "size": "130m² (39평)",
  "price": "28억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "광교중앙역 도보 5분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "영통 롯데캐슬 엘클래스 프리미엄",
  "address": "경기도 수원시 영통구 망포동",
  "size": "140m² (42평)",
  "price": "30억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "망포역 도보 7분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
}
  ]
}
},

"경기도 수원시 장안구":{
"~2억":{
  "houses": [
    {
  "name": "성원 아파트",
  "address": "경기도 수원시 장안구 연무동",
  "size": "33.27m² (10평)",
  "price": "2억 이하",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "연무동, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "세류동 소형 빌라",
  "address": "경기도 수원시 장안구 세류동",
  "size": "30m² (9평)",
  "price": "1억 9,000만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "세류역 도보 10분, 권선구청 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "조원동 소형 빌라",
  "address": "경기도 수원시 장안구 조원동",
  "size": "28m² (8평)",
  "price": "1억 8,500만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "조원동, 버스 다수, 대형마트 차량 10분, 공원 인근"
}
  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "조원동 투룸 아파트",
  "address": "경기도 수원시 장안구 조원동",
  "size": "59.96m² (18평)",
  "price": "5억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "조원동, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "세류동 단독주택",
  "address": "경기도 수원시 장안구 세류동",
  "size": "70m² (21평)",
  "price": "4억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "세류역 도보 10분, 권선구청 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "연무동 단독주택",
  "address": "경기도 수원시 장안구 연무동",
  "size": "80m² (24평)",
  "price": "4억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "연무동, 버스 다수, 대형마트 차량 10분, 공원 인근"
}
  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "조원동 아파트",
  "address": "경기도 수원시 장안구 조원동",
  "size": "81.98m² (24.8평)",
  "price": "5억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "조원동, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "송죽동 단독주택",
  "address": "경기도 수원시 장안구 송죽동",
  "size": "89.4m² (27평)",
  "price": "10억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "송죽동, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "세류동 다가구주택",
  "address": "경기도 수원시 장안구 세류동",
  "size": "170.1m² (51평)",
  "price": "6억 2,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "세류동, 버스 다수, 대형"
}
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경기도 수원시 팔달구":{
"~2억":{
  "houses": [
    {
  "name": "현대전자조합주택",
  "address": "경기도 수원시 팔달구",
  "size": "84.94m² (25평)",
  "price": "2억",
  "auction": "실제 법원경매정보 사이트(https://www.courtauction.go.kr)에서 확인하러 가기",
  "infra": "수원역 인근, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "팔달구 인계동 빌라",
  "address": "경기도 수원시 팔달구 인계동 985-8",
  "size": "72m² (22평)",
  "price": "2억 2,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "인계동, 주차 가능, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "팔달구 지동 다세대 가동",
  "address": "경기도 수원시 팔달구 지동",
  "size": "58.62m² (18평)",
  "price": "2억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "지동, 버스 다수, 대형마트 차량 10분, 공원 인근"
}
  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "인계파밀리에 아파트",
  "address": "경기도 수원시 팔달구 인계동 865-10",
  "size": "81.69m² (25평)",
  "price": "5억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "인계동, 수인분당선 인접, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "수원인계푸르지오 주상복합 102동",
  "address": "경기도 수원시 팔달구 인계동",
  "size": "113.41m² (34평)",
  "price": "5억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "수인분당선 인계역 도보 7분, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "수원인계푸르지오 주상복합 101동",
  "address": "경기도 수원시 팔달구 인계동",
  "size": "113.41m² (34평)",
  "price": "5억 7,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "수인분당선 인계역 도보 7분, 대형마트 차량 10분, 버스 다수"
}
  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "수원인계푸르지오 주상복합 102동",
  "address": "경기도 수원시 팔달구 인계동",
  "size": "113.41m² (34평)",
  "price": "6억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "수인분당선 인계역 도보 7분, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "선경 아파트",
  "address": "경기도 수원시 팔달구 우만동 98",
  "size": "134.05m² (40평)",
  "price": "5억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "우만동, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "우만동 아파트",
  "address": "경기도 수원시 팔달구 우만동",
  "size": "84.92m² (25평)",
  "price": "4억 2,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "우만동, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경기도 성남시 분당구":{
"~2억":{
  "houses": [
    
  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "매화마을건영1차 923동",
  "address": "경기도 성남시 분당구 매화마을",
  "size": "60m² (18평)",
  "price": "4억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "분당구청 근처, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "포레스트하우스 101동",
  "address": "경기도 성남시 분당구",
  "size": "136m² (41평)",
  "price": "4억 7,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "분당구청 근처, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "이매동 소형 오피스텔",
  "address": "경기도 성남시 분당구 이매동",
  "size": "33m² (10평)",
  "price": "2억 2,500만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "수내역 5분 거리, 분당구청 근접, 중앙공원 인접, 버스 다수"
}
  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "봇들마을1단지 아파트",
  "address": "경기도 성남시 분당구 야탑동",
  "size": "85m² (25평)",
  "price": "5억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "야탑역 인근, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "목련마을에스케이 아파트",
  "address": "경기도 성남시 분당구 야탑동",
  "size": "75m² (23평)",
  "price": "7억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "야탑역 인근, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "매화마을공무원 아파트",
  "address": "경기도 성남시 분당구 야탑동",
  "size": "80m² (24평)",
  "price": "7억 4,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "야탑역 인근, 버스 다수, 대형마트 차량 10분, 공원 인근"
}
  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "더샵 판교 퍼스트파크",
  "address": "경기도 성남시 분당구 백현동",
  "size": "84m² (25평)",
  "price": "15억 9,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "백현역 인근, 판교역 차량 10분, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "더샵 분당파크리버",
  "address": "경기도 성남시 분당구",
  "size": "85m² (25평)",
  "price": "15억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "분당구청 근처, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "분당 인텔리지2A동",
  "address": "경기도 성남시 분당구 정자동",
  "size": "84m² (25평)",
  "price": "12억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "정자역 인근, 버스 다수, 대형마트 차량 10분, 공원 인근"
}
  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "봇들마을3단지 아파트",
  "address": "경기도 성남시 분당구 야탑동",
  "size": "100m² (30평)",
  "price": "18억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "야탑역 인근, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "샛별마을 라이프단지",
  "address": "경기도 성남시 분당구",
  "size": "126m² (38평)",
  "price": "20억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "분당구청 근처, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "샛별 우방단지",
  "address": "경기도 성남시 분당구",
  "size": "101m² (30평)",
  "price": "15억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "분당구청 근처, 버스 다수, 대형마트 차량 10분, 공원 인근"
}
  ]
},
"20억 이상": {
  "houses": [
{
  "name": "더샵 판교 퍼스트파크",
  "address": "경기도 성남시 분당구 백현동",
  "size": "165m² (50평)",
  "price": "20억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "백현역 인근, 판교역 차량 10분, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "분당구 백현동 고급 아파트",
  "address": "경기도 성남시 분당구 백현동",
  "size": "134m² (40평)",
  "price": "25억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "백현역 인근, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "분당구 정자동 고급 아파트",
  "address": "경기도 성남시 분당구 정자동",
  "size": "140m² (42평)",
  "price": "30억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "정자역 인근, 대형마트 차량 10분, 공원 인근"
}
  ]
}
},

"경기도 성남시 수정구":{
"~2억":{
  "houses": [
    {
  "name": "수정구 상대원동 빌라",
  "address": "경기도 성남시 수정구 상대원동",
  "size": "35m² (10평)",
  "price": "1억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "상대원역 도보 10분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "수정구 단대동 다가구 주택",
  "address": "경기도 성남시 수정구 단대동",
  "size": "40m² (12평)",
  "price": "2억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "단대오거리역 차량 10분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "수정구 신흥동 다세대 주택",
  "address": "경기도 성남시 수정구 신흥동",
  "size": "38m² (11평)",
  "price": "1억 9,500만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "모란역 차량 15분, 버스 다수, 대형마트 차량 10분, 공원 인근"
}
  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "수정구 상대원3구역 재개발 빌라",
  "address": "경기도 성남시 수정구 상대원동",
  "size": "45m² (13평)",
  "price": "4억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "상대원역 도보 10분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "수정구 신흥동 소형 아파트",
  "address": "경기도 성남시 수정구 신흥동",
  "size": "50m² (15평)",
  "price": "4억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "모란역 도보 10분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "수정구 단대동 다세대 주택",
  "address": "경기도 성남시 수정구 단대동",
  "size": "55m² (16평)",
  "price": "3억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "단대오거리역 차량 10분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "수정구 산성역 자이푸르지오",
  "address": "경기도 성남시 수정구 신흥동",
  "size": "75m² (23평)",
  "price": "8억 3,500만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "산성역 도보 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "수정구 단대동 코오롱 하늘채",
  "address": "경기도 성남시 수정구 단대동",
  "size": "80m² (24평)",
  "price": "7억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "단대오거리역 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "수정구 신흥동 산성역 포레스티아",
  "address": "경기도 성남시 수정구 신흥동",
  "size": "84m² (25평)",
  "price": "10억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "산성역 도보 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
}
  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "수정구 창곡동 위례센트럴자이",
  "address": "경기도 성남시 수정구 창곡동",
  "size": "98.79m² (30평)",
  "price": "15억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "위례역 도보 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "수정구 산성역 자이푸르지오",
  "address": "경기도 성남시 수정구 신흥동",
  "size": "110m² (33평)",
  "price": "13억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "산성역 도보 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "수정구 단대동 푸르지오",
  "address": "경기도 성남시 수정구 단대동",
  "size": "110m² (33평)",
  "price": "11억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "단대오거리역 차량 10분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "수정구 산성역 포레스티아",
  "address": "경기도 성남시 수정구 신흥동",
  "size": "130m² (39평)",
  "price": "18억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "산성역 도보 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "수정구 창곡동 위례 호반 베르디움",
  "address": "경기도 성남시 수정구 창곡동",
  "size": "98.95m² (30평)",
  "price": "17억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "위례역 도보 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "수정구 단대동 산성역 자이푸르지오",
  "address": "경기도 성남시 수정구 단대동",
  "size": "120m² (36평)",
  "price": "19억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "산성역 도보 5분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"20억 이상": {
  "houses": [
{
  "name": "수정구 창곡동 위례센트럴자이",
  "address": "경기도 성남시 수정구 창곡동",
  "size": "130m² (39평)",
  "price": "25억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "위례역 도보 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "수정구 신흥동 산성역 포레스티아",
  "address": "경기도 성남시 수정구 신흥동",
  "size": "140m² (42평)",
  "price": "22억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "산성역 도보 5분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "수정구 단대동 푸르지오",
  "address": "경기도 성남시 수정구 단대동",
  "size": "150m² (45평)",
  "price": "30억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "단대오거리역 차량 10분, 버스 다수, 대형마트 차량 10분"
}
  ]
}
},

"경기도 성남시 중원구":{
"~2억":{
  "houses": [
    {
  "name": "상대원3구역 재개발 빌라",
  "address": "경기도 성남시 중원구 상대원동 2780번지 일원",
  "size": "소형 다세대주택",
  "price": "2억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "상대원역 도보 10분, 중원구청 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "상대원삼익 아파트 101동",
  "address": "경기도 성남시 중원구 상대원동 152-3",
  "size": "46.02m² (14평)",
  "price": "2억 6,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "상대원역 도보 10분, 중원구청 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "상대원동 소형 빌라",
  "address": "경기도 성남시 중원구 상대원동",
  "size": "35m² (10평)",
  "price": "1억 8,000만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "상대원역 도보 10분, 중원구청 차량 10분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "상대원동 다가구주택",
  "address": "경기도 성남시 중원구 상대원동",
  "size": "70m² (21평)",
  "price": "4억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "상대원역 도보 10분, 중원구청 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "중원구 도촌동 아파트",
  "address": "경기도 성남시 중원구 도촌동",
  "size": "85m² (25평)",
  "price": "5억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "도촌역 도보 7분, 중원구청 차량 15분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "중원구 산성동 아파트",
  "address": "경기도 성남시 중원구 산성동",
  "size": "75m² (23평)",
  "price": "4억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "산성역 도보 5분, 중원구청 차량 15분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "중원구 금광동 아파트",
  "address": "경기도 성남시 중원구 금광동",
  "size": "84m² (25평)",
  "price": "8억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "금광역 도보 7분, 중원구청 차량 15분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "중원구 상대원동 아파트",
  "address": "경기도 성남시 중원구 상대원동",
  "size": "80m² (24평)",
  "price": "7억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "상대원역 도보 10분, 중원구청 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "중원구 산성동 아파트",
  "address": "경기도 성남시 중원구 산성동",
  "size": "75m² (23평)",
  "price": "9억 2,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "산성역 도보 5분, 중원구청 차량 15분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "중원구 금광동 고급 아파트",
  "address": "경기도 성남시 중원구 금광동",
  "size": "110m² (33평)",
  "price": "12억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "금광역 도보 7분, 중원구청 차량 15분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "중원구 산성동 고급 아파트",
  "address": "경기도 성남시 중원구 산성동",
  "size": "105m² (32평)",
  "price": "14억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "산성역 도보 5분, 중원구청 차량 15분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "중원구 상대원동 고급 아파트",
  "address": "경기도 성남시 중원구 상대원동",
  "size": "100m² (30평)",
  "price": "11억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "상대원역 도보 10분, 중원구청 차량 10분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "중원구 금광동 고급 단독주택",
  "address": "경기도 성남시 중원구 금광동",
  "size": "150m² (45평)",
  "price": "18억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "금광역 도보 7분, 중원구청 차량 15분, 공원 인근, 대형마트 차량 10분"
},
{
  "name": "중원구 산성동 고급 단독주택",
  "address": "경기도 성남시 중원구 산성동",
  "size": "180m² (54평)",
  "price": "17억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "산성역 도보 5분, 중원구청 차량 15분, 공원 인근, 대형마트 차량 10분"
},
{
  "name": "중원구 상대원동 고급 단독주택",
  "address": "경기도 성남시 중원구 상대원동",
  "size": "200m² (60평)",
  "price": "19억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "상대원역 도보 10분, 중원구청 차량 10분, 공원 인근, 대형마트 차량 10분"
}
  ]
},
"20억 이상": {
  "houses": [
{
  "name": "중원구 금광동 고급 단독주택",
  "address": "경기도 성남시 중원구 금광동",
  "size": "250m² (75평)",
  "price": "25억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "금광역 도보 7분, 중원구청 차량 15분, 공원 인근, 대형마트 차량 10분"
},
{
  "name": "중원구 산성동 고급 단독주택",
  "address": "경기도 성남시 중원구 산성동",
  "size": "280m² (85평)",
  "price": "22억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "산성역 도보 5분, 중원구청 차량 15분, 공원 인근, 대형마트 차량 10분"
},
{
  "name": "중원구 상대원동 고급 단독주택",
  "address": "경기도 성남시 중원구 상대원동",
  "size": "300m² (90평)",
  "price": "30억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "상대원역 도보 10분, 중원구청 차량 10분, 공원 인근, 대형마트 차량 10분"
}
  ]
}
},

"경기도 고양시 덕양구":{
"~2억":{
  "houses": [
    {
  "name": "덕양구 관산동 다세대주택",
  "address": "경기도 고양시 덕양구 관산동",
  "size": "45m² (13평)",
  "price": "1억 8,000만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "관산동, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "덕양구 행신동 소형 빌라",
  "address": "경기도 고양시 덕양구 행신동",
  "size": "33m² (10평)",
  "price": "1억 9,500만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "행신역 차량 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "덕양구 토당동 원룸 빌라",
  "address": "경기도 고양시 덕양구 토당동",
  "size": "28m² (8평)",
  "price": "2억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "토당동, 버스 다수, 대형마트 차량 10분, 공원 인근"
}
  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "덕양구 토당동 투룸 아파트",
  "address": "경기도 고양시 덕양구 토당동",
  "size": "64m² (19평)",
  "price": "4억 9,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "토당동, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "덕양구 행신동 소형 아파트",
  "address": "경기도 고양시 덕양구 행신동",
  "size": "59m² (18평)",
  "price": "4억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "행신역 차량 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "덕양구 성사동 소형 아파트",
  "address": "경기도 고양시 덕양구 성사동",
  "size": "55m² (16평)",
  "price": "4억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "성사동, 버스 다수, 대형마트 차량 10분, 공원 인근"
}
  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "덕양구 토당동 아파트",
  "address": "경기도 고양시 덕양구 토당동",
  "size": "84m² (25평)",
  "price": "7억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "토당동, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "덕양구 행신동 아파트",
  "address": "경기도 고양시 덕양구 행신동",
  "size": "75m² (23평)",
  "price": "6억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "행신역 차량 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "덕양구 성사동 아파트",
  "address": "경기도 고양시 덕양구 성사동",
  "size": "80m² (24평)",
  "price": "8억 2,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "성사동, 버스 다수, 대형마트 차량 10분, 공원 인근"
}
  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "덕양구 화정동 고급 아파트",
  "address": "경기도 고양시 덕양구 화정동",
  "size": "110m² (33평)",
  "price": "12억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "화정역 도보 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "덕양구 삼송동 단독주택",
  "address": "경기도 고양시 덕양구 삼송동",
  "size": "150m² (45평)",
  "price": "13억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "삼송역 차량 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "덕양구 오금동 단독주택",
  "address": "경기도 고양시 덕양구 오금동",
  "size": "130m² (39평)",
  "price": "14억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "오금역 차량 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
}
  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "덕양구 삼송동 고급 단독주택",
  "address": "경기도 고양시 덕양구 삼송동",
  "size": "200m² (60평)",
  "price": "18억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "삼송역 차량 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "덕양구 화정동 고급 단독주택",
  "address": "경기도 고양시 덕양구 화정동",
  "size": "180m² (54평)",
  "price": "17억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "화정역 도보 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "덕양구 오금동 고급 단독주택",
  "address": "경기도 고양시 덕양구 오금동",
  "size": "190m² (57평)",
  "price": "19억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "오금역 차량 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
}
  ]
},
"20억 이상": {
  "houses": [
{
  "name": "덕양구 삼송동 초대형 단독주택",
  "address": "경기도 고양시 덕양구 삼송동",
  "size": "300m² (90평)",
  "price": "25억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "삼송역 차량 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "덕양구 화정동 초대형 단독주택",
  "address": "경기도 고양시 덕양구 화정동",
  "size": "280m² (85평)",
  "price": "22억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "화정역 도보 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "덕양구 오금동 초대형 단독주택",
  "address": "경기도 고양시 덕양구 오금동",
  "size": "320m² (97평)",
  "price": "30억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "오금역 차량 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
}
  ]
}
},

"경기도 고양시 일산동구":{
"~2억":{
  "houses": [
    {
  "name": "일산동구 식사동 소형 오피스텔",
  "address": "경기도 고양시 일산동구 식사동",
  "size": "13.45m² (4평)",
  "price": "1억 9,000만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "식사역 인근, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산동구 풍동 소형 아파트",
  "address": "경기도 고양시 일산동구 풍동",
  "size": "14.7평",
  "price": "2억 7,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "풍동, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산동구 마두동 소형 빌라",
  "address": "경기도 고양시 일산동구 마두동",
  "size": "30m² (9평)",
  "price": "2억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "마두역 인근, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "일산동구 풍동 투룸 아파트",
  "address": "경기도 고양시 일산동구 풍동",
  "size": "25m² (7.5평)",
  "price": "4억 8,500만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "풍동, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산동구 마두동 오피스텔",
  "address": "경기도 고양시 일산동구 마두동",
  "size": "25m² (7.5평)",
  "price": "5억 9,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "마두역 인근, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산동구 식사동 아파트",
  "address": "경기도 고양시 일산동구 식사동",
  "size": "59m² (18평)",
  "price": "4억 8,500만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "식사역 인근, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "일산동구 정발산동 단독주택",
    "address": "경기도 고양시 일산동구 정발산동",
    "size": "100m² (30평)",
    "price": "9억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인",
    "infra": "정발산역 인근, 버스 다수, 대형마트 차량 10분"
  },
  {
    "name": "일산동구 백석동 백송마을 아파트",
    "address": "경기도 고양시 일산동구 백석동",
    "size": "85m² (25.7평)",
    "price": "7억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인",
    "infra": "백석역 도보 5분, 초등학교 인접, 홈플러스 도보권"
  },
  {
    "name": "일산동구 마두동 주상복합",
    "address": "경기도 고양시 일산동구 마두동",
    "size": "110m² (33평)",
    "price": "8억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인",
    "infra": "마두역 3분 거리, 공원 뷰, 학군 우수, 백화점 근접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "일산동구 장항동 단독주택",
  "address": "경기도 고양시 일산동구 장항동",
  "size": "150m² (45평)",
  "price": "12억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "장항동, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산동구 정발산동 단독주택",
  "address": "경기도 고양시 일산동구 정발산동",
  "size": "140m² (42평)",
  "price": "13억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "정발산역 인근, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산동구 백석동 단독주택",
  "address": "경기도 고양시 일산동구 백석동",
  "size": "130m² (39평)",
  "price": "14억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "백석역 인근, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "일산동구 장항동 고급 단독주택",
  "address": "경기도 고양시 일산동구 장항동",
  "size": "200m² (60평)",
  "price": "18억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "장항동, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산동구 정발산동 고급 단독주택",
  "address": "경기도 고양시 일산동구 정발산동",
  "size": "180m² (54평)",
  "price": "17억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "정발산역 인근, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산동구 백석동 고급 단독주택",
  "address": "경기도 고양시 일산동구 백석동",
  "size": "190m² (57평)",
  "price": "19억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "백석역 인근, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"20억 이상": {
  "houses": [
{
  "name": "일산동구 장항동 초대형 단독주택",
  "address": "경기도 고양시 일산동구 장항동",
  "size": "300m² (90평)",
  "price": "25억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "장항동, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산동구 정발산동 초대형 단독주택",
  "address": "경기도 고양시 일산동구 정발산동",
  "size": "280m² (85평)",
  "price": "22억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "정발산역 인근, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산동구 백석동 초대형 단독주택",
  "address": "경기도 고양시 일산동구 백석동",
  "size": "320m² (97평)",
  "price": "30억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "백석역 인근, 버스 다수, 대형마트 차량 10분"
}
  ]
}
},

"경기도 고양시 일산서구":{
"~2억":{
  "houses": [
    {
  "name": "일산서구 구산동 단독마당 땅",
  "address": "경기도 고양시 일산서구 구산동",
  "size": "88평 (290.91m²)",
  "price": "2억 7,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "자유로 법곳IC, 장산IC 인근, 생산관리지역, 대형화물 불가, 텃밭 및 소형창고 용도 적합"
},
{
  "name": "일산서구 덕이동 소형 오피스텔",
  "address": "경기도 고양시 일산서구 덕이동",
  "size": "25m² (7.5평)",
  "price": "1억 7,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "버스정류장 도보 5분, 고양예고 인근, 대형마트 차량 10분"
},
{
  "name": "일산서구 가좌동 소형 아파트",
  "address": "경기도 고양시 일산서구 가좌동",
  "size": "59.9m² (18평)",
  "price": "1억 7,000만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "가좌역 인근, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "일산서구 가좌동 아파트",
  "address": "경기도 고양시 일산서구 가좌동",
  "size": "84.89m² (25평)",
  "price": "3억 3,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "가좌역 도보 7분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산서구 덕이동 아파트",
  "address": "경기도 고양시 일산서구 덕이동",
  "size": "59m² (18평)",
  "price": "4억 1,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "덕이역 인근, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산서구 가좌동 아파트",
  "address": "경기도 고양시 일산서구 가좌동",
  "size": "84.63m² (25평)",
  "price": "3억 3,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "가좌역 도보 7분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "일산서구 탄현동 일산두산위브더제니스",
  "address": "경기도 고양시 일산서구 탄현동",
  "size": "79m² (24평)",
  "price": "5억 4,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "탄현역 도보 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산서구 대화동 킨텍스꿈에그린",
  "address": "경기도 고양시 일산서구 대화동",
  "size": "84m² (25평)",
  "price": "9억 2,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "킨텍스역 도보 5분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산서구 가좌동 아파트",
  "address": "경기도 고양시 일산서구 가좌동",
  "size": "84.89m² (25평)",
  "price": "6억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "가좌역 도보 7분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "일산서구 대화동 킨텍스꿈에그린",
  "address": "경기도 고양시 일산서구 대화동",
  "size": "110m² (33평)",
  "price": "12억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "킨텍스역 도보 5분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산서구 가좌동 고급 아파트",
  "address": "경기도 고양시 일산서구 가좌동",
  "size": "110m² (33평)",
  "price": "13억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "가좌역 도보 7분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산서구 탄현동 고급 아파트",
  "address": "경기도 고양시 일산서구 탄현동",
  "size": "105m² (32평)",
  "price": "14억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "탄현역 도보 10분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "일산서구 대화동 고급 아파트",
  "address": "경기도 고양시 일산서구 대화동",
  "size": "130m² (39평)",
  "price": "18억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "킨텍스역 도보 5분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산서구 가좌동 고급 단독주택",
  "address": "경기도 고양시 일산서구 가좌동",
  "size": "150m² (45평)",
  "price": "19억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "가좌역 도보 7분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산서구 탄현동 고급 단독주택",
  "address": "경기도 고양시 일산서구 탄현동",
  "size": "180m² (54평)",
  "price": "17억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "탄현역 도보 10분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"20억 이상": {
  "houses": [
{
  "name": "일산서구 대화동 초대형 단독주택",
  "address": "경기도 고양시 일산서구 대화동",
  "size": "300m² (90평)",
  "price": "25억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "킨텍스역 도보 5분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산서구 가좌동 초대형 단독주택",
  "address": "경기도 고양시 일산서구 가좌동",
  "size": "280m² (85평)",
  "price": "22억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "가좌역 도보 7분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산서구 탄현동 초대형 단독주택",
  "address": "경기도 고양시 일산서구 탄현동",
  "size": "320m² (97평)",
  "price": "30억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "탄현역 도보 10분, 버스 다수, 대형마트 차량 10분"
}
  ]
}
},

"경기도 부천시 오정구":{
"~2억":{
  "houses": [
    {
    "name": "오정동 에리트아파트",
    "address": "경기 부천시 오정구 오정동",
    "size": "59.85㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1995년 입주, 5층, 소형 평형, 오정동 중심, 생활편의시설 인접"
  },
  {
    "name": "오정동 신축 빌라(구축 포함)",
    "address": "경기 부천시 오정구 오정동",
    "size": "전용 15~23평",
    "price": "1.5억~1.9억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2002년 이후 준공, 2~5층, 신축/구축, 주차장, 일부 올수리 필요, 생활편의시설 인접"
  },
  {
    "name": "원종동 투룸 빌라",
    "address": "경기 부천시 오정구 원종동",
    "size": "18.2평",
    "price": "2억원 이하(실매물 1.8~2억원)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "원종역 도보 8분, 관리비 없음, 교통·편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "오정동 한양아파트",
    "address": "경기 부천시 오정구 오정동",
    "size": "59.85㎡",
    "price": "2억~2억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1995년 입주, 5층, 대단지, 오정동 중심, 생활편의시설 인접"
  },
  {
    "name": "오정생활휴먼시아2단지",
    "address": "경기 부천시 오정구 오정동",
    "size": "84.69㎡",
    "price": "3억~4억대",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2006년 입주, 14층, 대단지, 오정동 중심, 생활편의시설 인접"
  },
  {
    "name": "오정동 빌라(신축/구축)",
    "address": "경기 부천시 오정구 오정동",
    "size": "21~23평",
    "price": "2.1억~2.5억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2015년 이후 신축, 엘리베이터, 주차 100%, 내부 인테리어 양호"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "여월휴먼시아",
    "address": "경기 부천시 오정구 여월동",
    "size": "123.18㎡",
    "price": "10억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 입주, 11층, 대단지, 홈플러스·공원 인접, 학군 우수"
  },
  {
    "name": "오정동 정보주상빌라트(대형)",
    "address": "경기 부천시 오정구 오정동",
    "size": "33~37평",
    "price": "5억~6억대",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1997년 입주, 6층, 엘리베이터, 대형 평형, 생활편의시설 인접"
  },
  {
    "name": "오정동 단독주택(대형)",
    "address": "경기 부천시 오정구 오정동",
    "size": "50평대",
    "price": "5억~6억대",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "대지 193㎡, 건평 74㎡, 2층, 전원주택 분위기, 월세수익 가능"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "여월휴먼시아(대형)",
    "address": "경기 부천시 오정구 여월동",
    "size": "165㎡",
    "price": "10억~10억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 입주, 10층, 대단지, 홈플러스·공원 인접, 학군 우수"
  },
  {
    "name": "오정동 단독주택(대형)",
    "address": "경기 부천시 오정구 작동",
    "size": "200㎡",
    "price": "11억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 기준, 대형 단독, 작동 중심, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "오정동 정보주상빌라트(특대형)",
    "address": "경기 부천시 오정구 오정동",
    "size": "50평대",
    "price": "15억 5,000만원(공시가격)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1997년 입주, 6층, 특대형 평형, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경기도 부천시 원미구":{
"~2억":{
  "houses": [
    {
    "name": "삼보아파트",
    "address": "경기 부천시 원미구 도당동",
    "size": "51.57㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1989년 입주, 4층, 190세대, 도당동 중심, 생활편의시설 인접"
  },
  {
    "name": "신축 빌라",
    "address": "경기 부천시 원미구 춘의동",
    "size": "전용 15~23평",
    "price": "1억 5,000만원~2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신축, 2~5층, 주차장, 내부 올수리, 생활편의시설 인접"
  },
  {
    "name": "원미구 역곡동 아파트",
    "address": "경기 부천시 원미구 역곡동",
    "size": "51m²",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "7층, 역곡동 중심, 역세권, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "원미동 풍림아파트",
    "address": "경기 부천시 원미구 원미동",
    "size": "59.99㎡",
    "price": "3억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "27년차, 820세대, 5층, 원미동 중심, 생활편의시설 인접"
  },
  {
    "name": "팰리스카운티",
    "address": "경기 부천시 원미구 중동",
    "size": "80.84㎡",
    "price": "5억원~5억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2009년 입주, 16년차, 3,090세대, 대단지, 중동 중심, 생활편의시설 인접"
  },
  {
    "name": "중동 아파트",
    "address": "경기 부천시 원미구 중동",
    "size": "59m²",
    "price": "2억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "7층, 중동 중심, 역세권, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "부천동부센트레빌3단지",
    "address": "경기 부천시 원미구 중동",
    "size": "79.56㎡",
    "price": "5억원~6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "14층, 남향, 역세권, 대단지, 생활편의시설 인접"
  },
  {
    "name": "스타팰리움",
    "address": "경기 부천시 원미구 중동",
    "size": "84.9㎡",
    "price": "5억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "26평, 방3 욕실2, 대출 가능, 중동역 도보 10분, 주차·엘리베이터"
  },
  {
    "name": "진달래마을",
    "address": "경기 부천시 원미구 상동",
    "size": "99.59㎡",
    "price": "8억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 10월 거래, 14층, 상동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
     {
    "name": "행복한마을",
    "address": "경기 부천시 원미구 상동",
    "size": "112.15㎡",
    "price": "10억 4,000만원~11억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 11월 거래, 8층, 상동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "라일락마을",
    "address": "경기 부천시 원미구 상동",
    "size": "127.73㎡",
    "price": "8억 9,000만원~11억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2025년 1월 거래, 2층, 상동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "다정한마을",
    "address": "경기 부천시 원미구 상동",
    "size": "157.92㎡",
    "price": "9억원~10억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2025년 1월 거래, 15층, 상동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "상동 단독주택(대형)",
    "address": "경기 부천시 원미구 상동",
    "size": "200㎡ 이상",
    "price": "15억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 기준, 대형 단독, 상동 중심, 생활편의시설 인접"
  },
  {
    "name": "상동 상가건물",
    "address": "경기 부천시 원미구 상동",
    "size": "446㎡",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상동 중심, 상가+주택, 투자·사업용, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
{
    "name": "상동 상가건물(대형)",
    "address": "경기 부천시 원미구 상동",
    "size": "446㎡",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상동 중심, 상가+주택, 투자·사업용, 생활편의시설 인접"
  }
  ]
}
},

"경기도 부천시 소사구":{
"~2억":{
  "houses": [
    {
    "name": "심곡본동 투룸 빌라",
    "address": "경기도 부천시 소사구 심곡본동",
    "size": "공급 32.37㎡ (9.79평), 전용 28.23㎡ (8.54평)",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2룸 1욕실, 저층, 소사역 인근, 생활편의시설 인접"
  },
  {
    "name": "동신아파트",
    "address": "경기도 부천시 소사구 송내동",
    "size": "56.76㎡ (22평)",
    "price": "9,500만원~2억 7,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1985년 준공, 저층, 송내역 인근, 생활편의시설 인접"
  },
  {
    "name": "모아아파트",
    "address": "경기도 부천시 소사구 괴안동",
    "size": "56.04㎡ (19평)",
    "price": "9,500만원~2억 1,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1986년 준공, 저층, 괴안동 중심, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "신일해피트리",
    "address": "경기도 부천시 소사구 괴안동",
    "size": "59.64㎡ (23평)",
    "price": "1억 4,800만원~4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2005년 준공, 9층, 괴안동 중심, 역세권, 학세권, 생활편의시설 인접"
  },
  {
    "name": "동도센트리움",
    "address": "경기도 부천시 소사구 심곡본동",
    "size": "59.92㎡ (24평)",
    "price": "2억 8,000만원~4억 900만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2016년 준공, 11층, 심곡본동 중심, 역세권, 학세권, 생활편의시설 인접"
  },
  {
    "name": "신호아파트",
    "address": "경기도 부천시 소사구 괴안동",
    "size": "59.82㎡ (24평)",
    "price": "1억 200만원~3억 500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1995년 준공, 6층, 괴안동 중심, 역세권, 학세권, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "송내동 우성아파트",
    "address": "경기도 부천시 소사구 송내동",
    "size": "147.68㎡",
    "price": "5억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1990년 준공, 11층/14층, 송내동 중심, 올수리, 대단지, 생활편의시설 인접"
  },
  {
    "name": "소사본동 단독주택",
    "address": "경기도 부천시 소사구 소사본동",
    "size": "127㎡ (대지 163.74㎡)",
    "price": "5억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2층, 9방 3욕실, 내부수리, 소규모정비예정지, 소사역 도보권"
  },
  {
    "name": "HB엘림캐슬",
    "address": "경기도 부천시 소사구 심곡본동",
    "size": "65.63㎡",
    "price": "4억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 준공, 15층/20층, 초역세권, 영구조망, 신축, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "부천소사역푸르지오",
    "address": "경기도 부천시 소사구 소사본동",
    "size": "148㎡ (122㎡ 전용)",
    "price": "10억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중층/30층, 남서향, 대단지, 역세권, 대형평수"
  },
  {
    "name": "소사본동 대형 단독주택",
    "address": "경기도 부천시 소사구 소사본동",
    "size": "대지 121평, 연면적 278평",
    "price": "15억 5,000만원(2019년 공시가격)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "3층, 대형 단독, 소사본동 중심, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "범박동 단독/다가구주택",
    "address": "경기도 부천시 소사구 범박동",
    "size": "244㎡ (연면적 439㎡)",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "4층, 남서향, 대형 단독/다가구, 범박동 중심, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경기도 안산시 단원구":{
"~2억":{
  "houses": [
    {
    "name": "주공그린빌15단지",
    "address": "안산시 단원구 초지동",
    "size": "59㎡",
    "price": "2억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2002년 준공, 14층, 남향, 초지동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "경남아너스빌",
    "address": "안산시 단원구 원곡동",
    "size": "59㎡",
    "price": "2억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2005년 준공, 20층, 남향, 원곡동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "안산푸르지오8차",
    "address": "안산시 단원구 원곡동",
    "size": "59㎡",
    "price": "2억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "23층, 남향, 원곡동 중심, 교통·생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "천년가리더스카이",
    "address": "안산시 단원구 와동",
    "size": "84㎡",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "33층, 주상복합, 와동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "안산아이파크",
    "address": "안산시 단원구 신길동",
    "size": "84㎡",
    "price": "3억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "15층, 신길동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "안산라프리모",
    "address": "안산시 단원구 선부동",
    "size": "84㎡",
    "price": "3억 9,340만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "19층, 2020년 입주, 선부동 중심, 교통·생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "안산레이크타운푸르지오",
    "address": "안산시 단원구 고잔동",
    "size": "84.6㎡",
    "price": "8억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "19층, 2016년 입주, 고잔동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "센트럴푸르지오",
    "address": "안산시 단원구 고잔동",
    "size": "84.96㎡",
    "price": "8억 5,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "7층, 2018년 입주, 고잔동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "안산라프리모",
    "address": "안산시 단원구 선부동",
    "size": "99.45㎡",
    "price": "8억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "31층, 2020년 입주, 선부동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "호수공원아파트",
    "address": "안산시 단원구 고잔동",
    "size": "134.87㎡",
    "price": "10억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "9층, 2001년 입주, 고잔동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "푸르지오1차",
    "address": "안산시 단원구 고잔동",
    "size": "116.34㎡",
    "price": "9억 5,000만원~10억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "5층, 2001년 입주, 고잔동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "초지역메이저타운푸르지오메트로단지",
    "address": "안산시 단원구 초지동",
    "size": "72.79㎡",
    "price": "7억 5,000만원~10억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "16층, 2019년 입주, 초지동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "신길동 상가주택",
    "address": "안산시 단원구 신길동",
    "size": "대지 109평",
    "price": "16억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2층, 2008년 준공, 신길동 중심, 상가+주택, 투자·사업용"
  },
  {
    "name": "상가주택(중앙동/고잔동)",
    "address": "안산시 단원구 중앙동",
    "size": "정보 미상",
    "price": "15억~20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중앙동/고잔동 중심, 상가+주택, 투자·사업용"
  }
  ]
},
"20억 이상": {
  "houses": [
{
    "name": "안산레이크타운푸르지오(펜트하우스)",
    "address": "안산시 단원구 고잔동",
    "size": "124.54㎡",
    "price": "21억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "40층, 2016년 입주, 고잔동 중심, 펜트하우스, 최고가 거래, 생활편의시설 인접"
  },
  {
    "name": "상가건물(고잔동)",
    "address": "안산시 단원구 고잔동",
    "size": "476㎡",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상가+주택, 고잔동 중심, 투자·사업용"
  }
  ]
}
},

"경기도 안산시 상록구":{
"~2억":{
  "houses": [
    {
    "name": "본오동 월드아파트",
    "address": "경기 안산시 상록구 본오동",
    "size": "59.5㎡",
    "price": "1억 6,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "지하철 4호선 상록수역 도보권, 은행·마트·병원 인접, 교통·생활편의시설 우수"
  },
  {
    "name": "본오동 빌라",
    "address": "경기 안산시 상록구 본오동 758-9",
    "size": "59.9㎡",
    "price": "2억 500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남향, 4층, 방3/욕실2, 8세대, 2021년 준공, 교통·생활편의시설 인접"
  },
  {
    "name": "본오1차아파트",
    "address": "경기 안산시 상록구 사동",
    "size": "42.7㎡",
    "price": "1억 4,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "반지하, 관리비 없음, 사리역 도보권, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "월드아파트",
    "address": "경기 안산시 상록구 본오동",
    "size": "76.03㎡",
    "price": "2억 3,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상록수역 도보권, 3룸, 상태 양호, 생활편의시설 인접"
  },
  {
    "name": "본오동 빌라(신축)",
    "address": "경기 안산시 상록구 본오동",
    "size": "59.9㎡",
    "price": "2억 500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남향, 4층, 신축, 방3/욕실2, 8세대, 생활편의시설 인접"
  },
  {
    "name": "푸른마을5단지",
    "address": "경기 안산시 상록구 해양동",
    "size": "49.5㎡",
    "price": "2억 7,700만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "5층, 관리비 없음, 해양동 중심, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
     {
    "name": "그랑시티자이",
    "address": "경기 안산시 상록구 사동",
    "size": "84㎡",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 입주, 40층, 대단지, 사동 중심, 생활편의시설 인접"
  },
  {
    "name": "파크푸르지오",
    "address": "경기 안산시 상록구 성포동",
    "size": "84.66㎡",
    "price": "7억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 입주, 9층, 대단지, 성포동 중심, 생활편의시설 인접"
  },
  {
    "name": "늘푸른아파트",
    "address": "경기 안산시 상록구 사동",
    "size": "142.86㎡",
    "price": "5억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1999년 입주, 6층, 대단지, 사동 중심, 4호선·수인분당선 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "그랑시티자이2차",
    "address": "경기 안산시 상록구 사동",
    "size": "115.86㎡",
    "price": "10억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 입주, 13층, 대단지, 사동 중심, 생활편의시설 인접"
  },
  {
    "name": "정은타운(공시가격)",
    "address": "경기 안산시 상록구 일동",
    "size": "정보 미상",
    "price": "15억 5,000만원(공시가격)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 준공, 4층, 일동 중심, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "이동 신축 도시형 다가구주택",
    "address": "경기 안산시 상록구 이동",
    "size": "정보 미상",
    "price": "15억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신축, 다가구, 이동 중심, 생활편의시설 인접"
  },
  {
    "name": "본오동 상가주택",
    "address": "경기 안산시 상록구 본오동",
    "size": "정보 미상",
    "price": "15억~16억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상가+주택, 본오동 중심, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경기도 안양시 동안구":{
"~2억":{
  "houses": [
    {
    "name": "호계동 투룸 빌라",
    "address": "경기 안양시 동안구 호계동",
    "size": "약 49㎡",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "호계사거리 도보 5분, 역세권, 관리비 저렴, 생활편의시설 인접"
  },
  {
    "name": "안양동 투룸 빌라",
    "address": "경기 안양시 동안구 안양동",
    "size": "약 36㎡",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "안양역 도보 15분, 관리비 1만원, 생활편의시설 인접"
  },
  {
    "name": "비산동 소형 빌라",
    "address": "경기 안양시 동안구 비산동",
    "size": "약 35㎡",
    "price": "2억원 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "저층, 비산동 중심, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "호계동 주공2단지",
    "address": "경기 안양시 동안구 호계동",
    "size": "약 59㎡",
    "price": "2억 6,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1층, 4호선 금정역 인근, 관리비 저렴, 생활편의시설 인접"
  },
  {
    "name": "비산동 임곡휴먼시아",
    "address": "경기 안양시 동안구 비산동",
    "size": "약 84㎡",
    "price": "5억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "12층, 20층 중, 대단지, 생활편의시설 인접"
  },
  {
    "name": "호계동 오피스텔",
    "address": "경기 안양시 동안구 호계동",
    "size": "약 47㎡",
    "price": "2억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "20층, 전세안고 매매, 밝고 전망 좋음, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "비산동 임곡휴먼시아",
    "address": "경기 안양시 동안구 비산동",
    "size": "약 84㎡",
    "price": "5억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "12층, 20층 중, 대단지, 생활편의시설 인접"
  },
  {
    "name": "평촌동 이편한세상",
    "address": "경기 안양시 동안구 평촌동",
    "size": "약 131㎡",
    "price": "10억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "8년차, 50평형, 대단지, 생활편의시설 인접"
  },
  {
    "name": "호계동 평촌더샵아이파크",
    "address": "경기 안양시 동안구 호계동",
    "size": "약 85㎡",
    "price": "9억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2019년 준공, 33평형, 신축, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "관양동 동편마을4단지",
    "address": "경기 안양시 동안구 관양동",
    "size": "약 136㎡",
    "price": "14억 5,000만원~15억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2012년 준공, 52평형, 대단지, 고층, 평촌 중심, 생활편의시설 인접"
  },
  {
    "name": "호계동 아크로 베스티뉴(분양)",
    "address": "경기 안양시 동안구 호계동",
    "size": "84㎡",
    "price": "14억 4,000만원~15억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2025년 입주, 하이엔드 브랜드, 평촌 신축, 범계사거리, 생활편의시설 인접"
  },
  {
    "name": "비산동 비산한화꿈에그린",
    "address": "경기 안양시 동안구 비산동",
    "size": "162㎡",
    "price": "10억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "대형 평수, 안양천 뷰, 조용하고 깨끗함"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "호계동 아크로 베스티뉴(분양)",
    "address": "경기 안양시 동안구 호계동",
    "size": "84㎡",
    "price": "15억 7,440만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2025년 입주, 하이엔드 브랜드, 평촌 신축, 범계사거리, 생활편의시설 인접"
  },
  {
    "name": "호계동 대형 아파트",
    "address": "경기 안양시 동안구 호계동",
    "size": "152㎡",
    "price": "16억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "53평형, 4룸, 고층, 신축, 생활편의시설 인접"
  },
  {
    "name": "관양동 동편마을4단지",
    "address": "경기 안양시 동안구 관양동",
    "size": "152㎡",
    "price": "15억~17억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "20층, 대형 평수, 고층, 평촌 중심, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
{
    "name": "호계동 대형 아파트(펜트하우스)",
    "address": "경기 안양시 동안구 호계동",
    "size": "152㎡",
    "price": "20억원 이상",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "53평형, 펜트하우스, 신축, 범계사거리, 생활편의시설 인접"
  }
  ]
}
},

"경기도 안양시 만안구":{
"~2억":{
  "houses": [
    {
    "name": "거성타워",
    "address": "경기도 안양시 만안구 안양동",
    "size": "45.07㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2014년 입주, 1호선 인근, 저층, 생활편의시설 인접"
  },
  {
    "name": "투룸 빌라",
    "address": "경기도 안양시 만안구 시흥동",
    "size": "약 40㎡",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "4층, 관리비 1만원, 안양역 도보 15분, 생활편의시설 인접"
  },
  {
    "name": "적성아파트",
    "address": "경기도 안양시 만안구 박달동",
    "size": "41.32㎡",
    "price": "2억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1층, 박달동 중심, 관리비 없음, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "주공2단지",
    "address": "경기도 안양시 만안구 금정동",
    "size": "59.99㎡",
    "price": "2억 6,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1층, 금정동 중심, 관리비 없음, 생활편의시설 인접"
  },
  {
    "name": "하이트타운아파트",
    "address": "경기도 안양시 만안구 안양동",
    "size": "77.78㎡",
    "price": "3억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "12층, 안양동 중심, 관리비 없음, 생활편의시설 인접"
  },
  {
    "name": "진흥아파트",
    "address": "경기도 안양시 만안구 안양동",
    "size": "70.99㎡",
    "price": "3억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "5층, 안양동 중심, 관리비 없음, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "안양씨엘포레자이",
    "address": "경기도 안양시 만안구 안양동",
    "size": "84.99㎡",
    "price": "7억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 입주, 9층, 1,394세대, 1호선 인근, 대단지, 생활편의시설 인접"
  },
  {
    "name": "안양광신프로그레스리버뷰",
    "address": "경기도 안양시 만안구 안양동",
    "size": "72.04㎡",
    "price": "6억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 입주, 10층, 230세대, 1호선 인근, 대단지, 생활편의시설 인접"
  },
  {
    "name": "안양리버자이르네",
    "address": "경기도 안양시 만안구 박달동",
    "size": "74.73㎡",
    "price": "6억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 입주, 17층, 139세대, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "래미안안양메가트리아",
    "address": "경기도 안양시 만안구 안양동",
    "size": "186.13㎡",
    "price": "12억~14억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2016년 입주, 30층, 4,250세대, 1호선 인근, 대단지, 생활편의시설 인접"
  },
  {
    "name": "래미안안양메가트리아(고층)",
    "address": "경기도 안양시 만안구 안양동",
    "size": "186.13㎡",
    "price": "14억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2016년 입주, 고층, 남향, 트인뷰, 대단지, 생활편의시설 인접"
  },
  {
    "name": "래미안안양메가트리아(중층)",
    "address": "경기도 안양시 만안구 안양동",
    "size": "186.13㎡",
    "price": "13억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2016년 입주, 중층, 남향, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "래미안안양메가트리아(펜트하우스)",
    "address": "경기도 안양시 만안구 안양동",
    "size": "186.13㎡",
    "price": "15억~15억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2016년 입주, 펜트하우스, 남향, 트인뷰, 대단지, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경기도 용인시 기흥구":{
"~2억":{
  "houses": [
    {
    "name": "유원휴하임",
    "address": "용인시 기흥구 언남동",
    "size": "41.46㎡",
    "price": "1억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2013년 준공, 5층, 소형 평형, 학세권, 생활편의시설 인접"
  },
  {
    "name": "세원아파트",
    "address": "용인시 기흥구 공세동",
    "size": "59㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "저층, 20년차 이상, 생활편의시설 인접"
  },
  {
    "name": "현대모닝사이드",
    "address": "용인시 기흥구 보라동",
    "size": "59㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2004년 준공, 5층, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "한보라마을9단지경남아너스빌",
    "address": "용인시 기흥구 공세동",
    "size": "59.89㎡",
    "price": "3억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2006년 준공, 21층, 학세권, 생활편의시설 인접"
  },
  {
    "name": "용인기흥 우방아이유쉘",
    "address": "용인시 기흥구 신갈동",
    "size": "59.96㎡",
    "price": "4억 2,700만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 준공, 10층, 학세권, 생활편의시설 인접"
  },
  {
    "name": "현대모닝사이드",
    "address": "용인시 기흥구 보라동",
    "size": "84.96㎡",
    "price": "3억 6,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2004년 준공, 15층, 학세권, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "기흥역더샵",
    "address": "용인시 기흥구 구갈동",
    "size": "84.98㎡",
    "price": "8억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 준공, 25층, 역세권·학세권, 대단지, 생활편의시설 인접"
  },
  {
    "name": "기흥역센트럴푸르지오",
    "address": "용인시 기흥구 구갈동",
    "size": "84.77㎡",
    "price": "8억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 준공, 38층, 역세권·학세권, 대단지, 생활편의시설 인접"
  },
  {
    "name": "용인동백두산위브더제니스",
    "address": "용인시 기흥구 동백동",
    "size": "84.86㎡",
    "price": "6억 7,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 준공, 15층, 학세권, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "연원마을LG",
    "address": "용인시 기흥구 마북동",
    "size": "133.06㎡",
    "price": "12억 2,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1999년 준공, 3층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "신촌마을포스홈타운1단지",
    "address": "용인시 기흥구 보정동",
    "size": "133.72㎡",
    "price": "10억 2,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2001년 준공, 18층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "죽현마을동원로얄듀크",
    "address": "용인시 기흥구 보정동",
    "size": "84.6㎡",
    "price": "10억 9,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2004년 준공, 22층, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경기도 용인시 수지구":{
"~2억":{
  "houses": [
    
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "용인수지풍림2차",
    "address": "용인시 수지구 동천동",
    "size": "84.58㎡",
    "price": "5억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2002년 준공, 2층, 남동향, 대단지, 생활편의시설 인접"
  },
  {
    "name": "용인수지풍림2차",
    "address": "용인시 수지구 동천동",
    "size": "84.58㎡",
    "price": "5억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2002년 준공, 20층, 남동향, 대단지, 생활편의시설 인접"
  },
  {
    "name": "용인수지풍림2차",
    "address": "용인시 수지구 동천동",
    "size": "84.58㎡",
    "price": "5억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2002년 준공, 10층, 남동향, 대단지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "진산마을 성원상떼빌",
    "address": "용인시 수지구 상현동",
    "size": "84㎡",
    "price": "6억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2004년 준공, 32평, 상현동 중심, 생활편의시설 인접"
  },
  {
    "name": "만현마을 1단지 롯데캐슬",
    "address": "용인시 수지구 풍덕천동",
    "size": "84㎡",
    "price": "7억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2002년 준공, 32평, 풍덕천동 중심, 생활편의시설 인접"
  },
  {
    "name": "진산마을 삼성 래미안5차",
    "address": "용인시 수지구 상현동",
    "size": "112㎡",
    "price": "9억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2005년 준공, 34평, 상현동 중심, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "성복역 롯데캐슬 클라시엘",
    "address": "용인시 수지구 성복동",
    "size": "116.93㎡",
    "price": "13억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 준공, 9층, 성복동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "삼성래미안이스트팰리스3단지",
    "address": "용인시 수지구 동천동",
    "size": "178.7㎡",
    "price": "15억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2011년 준공, 6층, 동천동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "e편한세상수지",
    "address": "용인시 수지구 상현동",
    "size": "98.89㎡",
    "price": "14억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 준공, 6층, 상현동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "성복역 롯데캐슬 골드타운",
    "address": "용인시 수지구 성복동",
    "size": "99.98㎡",
    "price": "16억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 준공, 29층, 성복동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "성동마을LG빌리지1차",
    "address": "용인시 수지구 성동동",
    "size": "244.66㎡",
    "price": "13억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1999년 준공, 4층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "광교자이더클래스",
    "address": "용인시 수지구 상현동",
    "size": "84.93㎡",
    "price": "13억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 준공, 21층, 상현동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경기도 용인시 처인구":{
"~2억":{
  "houses": [
    {
      "name": "처인구 양지면 단독주택",
      "address": "경기도 용인시 처인구 양지면",
      "size": "66m² (20평)",
      "price": "1억 8,500만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "양지IC 차량 5분, 버스정류장 인근"
    },
    {
      "name": "처인구 포곡읍 전원주택",
      "address": "경기도 용인시 처인구 포곡읍",
      "size": "85m² (25.7평)",
      "price": "1억 9,800만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "에버랜드 차량 10분, 조용한 주거지"
    },
    {
      "name": "처인구 이동읍 단독주택",
      "address": "경기도 용인시 처인구 이동읍",
      "size": "70m² (21평)",
      "price": "1억 6,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "인근 초등학교, 도보 3분 거리 버스"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "처인구 모현읍 아파트",
      "address": "경기도 용인시 처인구 모현읍",
      "size": "84m² (25.4평)",
      "price": "4억 7,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "분당과 인접, 서울 접근성 양호"
    },
    {
      "name": "처인구 김량장동 주택",
      "address": "경기도 용인시 처인구 김량장동",
      "size": "105m² (32평)",
      "price": "3억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "용인시청 근처, 전통시장 도보권"
    },
    {
      "name": "처인구 남동 아파트",
      "address": "경기도 용인시 처인구 남동",
      "size": "76m² (23평)",
      "price": "2억 9,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "버스 노선 다양, 생활 인프라 풍부"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "처인구 역북동 대단지 아파트",
      "address": "경기도 용인시 처인구 역북동",
      "size": "112m² (33평)",
      "price": "9억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "용인중앙시장, 용인대 도보권"
    },
    {
      "name": "처인구 삼가동 신축 아파트",
      "address": "경기도 용인시 처인구 삼가동",
      "size": "102m² (31평)",
      "price": "8억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "역북역 예정, 대형마트 근접"
    },
    {
      "name": "처인구 고림동 아파트",
      "address": "경기도 용인시 처인구 고림동",
      "size": "84m² (25평)",
      "price": "7억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "초등학교 도보권, 조용한 신도시"
    }
  ]
},
"10억~15억": {
  "houses": [
    {
      "name": "처인구 모현읍 고급 전원주택",
      "address": "경기도 용인시 처인구 모현읍",
      "size": "150m² (45평)",
      "price": "14억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "수지·분당 접근 용이, 한적한 자연환경"
    },
    {
      "name": "처인구 포곡읍 단독주택",
      "address": "경기도 용인시 처인구 포곡읍",
      "size": "145m² (44평)",
      "price": "12억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "에버랜드 인근, 대형 마트 차량 10분"
    },
    {
      "name": "처인구 양지면 고급 타운하우스",
      "address": "경기도 용인시 처인구 양지면",
      "size": "160m² (48평)",
      "price": "11억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "양지IC 차량 7분, 골프장 인접"
    }
  ]
},
"15억~20억": {
  "houses": [
    {
      "name": "처인구 모현읍 고급 단독주택",
      "address": "경기도 용인시 처인구 모현읍",
      "size": "180m² (54평)",
      "price": "19억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "서울 접근성 우수, 넓은 대지"
    },
    {
      "name": "처인구 포곡읍 단지형 전원주택",
      "address": "경기도 용인시 처인구 포곡읍",
      "size": "200m² (60평)",
      "price": "16억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "한택식물원 인근, 고급 타운하우스"
    },
    {
      "name": "처인구 이동읍 고급주택",
      "address": "경기도 용인시 처인구 이동읍",
      "size": "210m² (63평)",
      "price": "17억 3,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "광역버스 접근, 한적한 자연 속"
    }
  ]
},
"20억 이상": {
  "houses": [
{
      "name": "처인구 모현읍 대형 저택",
      "address": "경기도 용인시 처인구 모현읍",
      "size": "280m² (85평)",
      "price": "25억",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "분당·강남 30분 거리, 정원 및 텃밭 포함"
    },
    {
      "name": "처인구 포곡읍 호화 전원주택",
      "address": "경기도 용인시 처인구 포곡읍",
      "size": "300m² (90평)",
      "price": "22억 7,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "독립형 구조, 골프장·온천 인접"
    },
    {
      "name": "처인구 이동읍 고급 타운하우스",
      "address": "경기도 용인시 처인구 이동읍",
      "size": "260m² (78평)",
      "price": "21억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "자연 속 대단지, 헬스장·커뮤니티 시설"
    }
  ]
}
},

"경기도 남양주시":{
"~2억":{
  "houses": [
    {
      "name": "남양주 진접 e편한세상",
      "address": "경기도 남양주시 진접읍",
      "size": "59.98㎡",
      "price": "1억 9,500만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2010년 준공, 12층, 진접역 도보권, 대형마트 인접"
    },
    {
      "name": "도농신동아아파트",
      "address": "경기도 남양주시 도농동",
      "size": "49.50㎡",
      "price": "1억 8,800만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "1996년 준공, 10층, 도농역 인접, 도심 접근성 우수"
    },
    {
      "name": "화도읍 단독주택",
      "address": "경기도 남양주시 화도읍",
      "size": "82㎡",
      "price": "2억원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "1990년대 준공, 2층 구조, 조용한 주택가"
    }
  ]
},
"2억~5억": {
  "houses": [
     {
      "name": "별내센트럴푸르지오",
      "address": "경기도 남양주시 별내동",
      "size": "84.93㎡",
      "price": "4억 9,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2018년 준공, 15층, 별내역 도보권, 생활인프라 우수"
    },
    {
      "name": "호평동 우미린",
      "address": "경기도 남양주시 호평동",
      "size": "84.99㎡",
      "price": "4억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2014년 준공, 18층, 도보 5분 거리에 지하철 및 대형마트"
    },
    {
      "name": "다산자이아이비플레이스",
      "address": "경기도 남양주시 다산동",
      "size": "59.93㎡",
      "price": "4억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2019년 준공, 10층, 학군 우수, 중심상업지구 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "다산신도시 자연앤자이",
      "address": "경기도 남양주시 다산동",
      "size": "84.95㎡",
      "price": "5억 6,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2020년 준공, 8층, 대단지, 학교 및 공원 인접"
    },
    {
      "name": "별내에코앤e편한세상",
      "address": "경기도 남양주시 별내동",
      "size": "84.89㎡",
      "price": "6억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2015년 준공, 20층, 별내역 도보권, 상업지구 인접"
    },
    {
      "name": "왕숙신도시 예정지 인근 단독주택",
      "address": "경기도 남양주시 진건읍",
      "size": "110㎡",
      "price": "7억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "최근 리모델링, 왕숙지구 개발 호재, 조용한 주거환경"
    }
  ]
},
"10억~15억": {
  "houses": [
    {
      "name": "남양주 별내 자이더스타",
      "address": "경기도 남양주시 별내동",
      "size": "112㎡",
      "price": "11억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2021년 준공, 25층, 초고층, 프리미엄 커뮤니티"
    },
    {
      "name": "다산신도시 자이더빌리지 타운하우스",
      "address": "경기도 남양주시 다산동",
      "size": "135㎡",
      "price": "13억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2020년 준공, 단독형, 고급 타운하우스, 정원 포함"
    },
    {
      "name": "별내자이 더 스타파크 펜트하우스",
      "address": "경기도 남양주시 별내동",
      "size": "140㎡",
      "price": "14억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2022년 준공, 펜트하우스, 고급 커뮤니티 및 전망"
    }
  ]
},
"15억~20억": {
  "houses": [
     {
      "name": "왕숙지구 인근 고급 타운하우스",
      "address": "경기도 남양주시 진접읍",
      "size": "165㎡",
      "price": "16억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "신축, 고급 마감재, 조용한 전원형 주택"
    },
    {
      "name": "다산동 고급 단독주택",
      "address": "경기도 남양주시 다산동",
      "size": "150㎡",
      "price": "18억",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "강변공원 인접, 모던 스타일, 정원/주차 포함"
    },
    {
      "name": "별내신도시 고급 전원주택",
      "address": "경기도 남양주시 별내동",
      "size": "175㎡",
      "price": "19억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "산 조망, 대형 정원, 커뮤니티 접근성 양호"
    }
  ]
},
"20억 이상": {
  "houses": [
{
      "name": "남양주 별내동 초호화 단독주택",
      "address": "경기도 남양주시 별내동",
      "size": "200㎡",
      "price": "22억원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "프라이빗 도로, 대형정원, 최신 인테리어"
    },
    {
      "name": "다산신도시 럭셔리 빌라",
      "address": "경기도 남양주시 다산동",
      "size": "180㎡",
      "price": "23억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "단지형 고급빌라, 특화 설계, 커뮤니티 포함"
    },
    {
      "name": "남양주 프라이빗 고급주택",
      "address": "경기도 남양주시 화도읍",
      "size": "220㎡",
      "price": "25억원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "대형 테라스, 실내 수영장, 산림 속 프리미엄 주거"
    }
  ]
}
},

"경기도 화성시":{
"~2억":{
  "houses": [
    {
    "name": "백상화인빌",
    "address": "화성시 마도면 두곡리",
    "size": "84.99㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2005년 입주, 7층, 30평대, 마도면 중심, 생활편의시설 인접"
  },
  {
    "name": "금광포란재",
    "address": "화성시 우정읍 조암리",
    "size": "81.14㎡",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2000년 입주, 3층, 26평대, 우정읍 중심, 생활편의시설 인접"
  },
  {
    "name": "남양읍 투룸",
    "address": "화성시 남양읍",
    "size": "76㎡ (23평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "5층, 남양초 도보 5분, 화성시청 차량 5분, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
     {
    "name": "스타캐슬",
    "address": "화성시 비봉면",
    "size": "89.6㎡ (27.1평)",
    "price": "2억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "12층, 관리비 없음, 비봉면 중심, 생활편의시설 인접"
  },
  {
    "name": "대광파인밸리",
    "address": "화성시 남양읍",
    "size": "112㎡ (33.9평)",
    "price": "2억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "4층, 관리비 없음, 남양읍 중심, 생활편의시설 인접"
  },
  {
    "name": "향남서봉마을사랑으로부영3단지",
    "address": "화성시 향남읍",
    "size": "113㎡ (34평)",
    "price": "4억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "18층, 초중고 도보 10분, 향남읍 중심, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
     {
    "name": "동탄역파라곤",
    "address": "화성시 오산동",
    "size": "84.13㎡",
    "price": "5억 9,900만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "20층, 동탄역 인근, 대단지, 생활편의시설 인접"
  },
  {
    "name": "동탄역반도유보라아이비파크5.0",
    "address": "화성시 오산동",
    "size": "74.36㎡",
    "price": "8억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "27층, 동탄역 인근, 대단지, 생활편의시설 인접"
  },
  {
    "name": "반도유보라아이비파크3.0",
    "address": "화성시 오산동",
    "size": "74.41㎡",
    "price": "6억 4,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "6층, 동탄역 인근, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "동탄역파라곤",
    "address": "화성시 오산동",
    "size": "101.62㎡",
    "price": "13억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "8층, 동탄역 인근, 대단지, 생활편의시설 인접"
  },
  {
    "name": "동탄역삼정그린코아더시티",
    "address": "화성시 오산동",
    "size": "81.35㎡",
    "price": "11억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "8층, 동탄역 인근, 대단지, 생활편의시설 인접"
  },
  {
    "name": "동탄역반도유보라아이비파크8.0",
    "address": "화성시 오산동",
    "size": "86.23㎡",
    "price": "11억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "34층, 동탄역 인근, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "동탄역 시범한화 꿈에그린 프레스티지",
    "address": "화성시 청계동",
    "size": "125㎡",
    "price": "14억 2,000만원~20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "47평, 동탄역 인근, 초고층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "동탄역롯데캐슬",
    "address": "화성시 오산동",
    "size": "102㎡",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "25층, 동탄역 인근, 초고층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "더샵센트럴시티",
    "address": "화성시 청계동",
    "size": "107㎡",
    "price": "14억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "42평, 청계동 중심, 초고층, 대단지, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
 {
    "name": "동탄역롯데캐슬(펜트하우스)",
    "address": "화성시 오산동",
    "size": "102㎡",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "25층, 동탄역 인근, 펜트하우스, 초고층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "상가주택",
    "address": "화성시 영천동",
    "size": "398㎡",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "245평, 영천동 중심, 상가+주택, 투자·사업용, 생활편의시설 인접"
  },
  {
    "name": "단독요양원(대형)",
    "address": "화성시 향남읍",
    "size": "609평",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "향남읍 중심, 대형 요양원, 투자·사업용, 생활편의시설 인접"
  }
  ]
}
},

"경기도 평택시":{
"~2억":{
  "houses": [
    {
    "name": "부영사랑으로1단지",
    "address": "경기도 평택시 청북읍 옥길리",
    "size": "59.96㎡",
    "price": "1억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2011년 입주, 15층, 1,031세대, 청북읍 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "포승삼부르네상스1단지",
    "address": "경기도 평택시 포승읍 도곡리",
    "size": "59.96㎡",
    "price": "1억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2005년 입주, 7층, 510세대, 포승읍 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "늘푸른사랑마을",
    "address": "경기도 평택시 안중읍 현화리",
    "size": "59.75㎡",
    "price": "1억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1999년 입주, 10층, 1,188세대, 안중읍 중심, 교통·생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "고덕국제신도시르플로랑",
    "address": "경기도 평택시 고덕동",
    "size": "55.97㎡",
    "price": "4억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 입주, 12층, 891세대, 고덕동 중심, 신축, 교통·생활편의시설 인접"
  },
  {
    "name": "힐스테이트지제역",
    "address": "경기도 평택시 동삭동",
    "size": "59.99㎡",
    "price": "4억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 입주, 16층, 1,519세대, 동삭동 중심, 신축, 교통·생활편의시설 인접"
  },
  {
    "name": "더샵지제역센트럴파크2BL",
    "address": "경기도 평택시 동삭동",
    "size": "59.62㎡",
    "price": "4억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 입주, 17층, 1,674세대, 동삭동 중심, 신축, 교통·생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "고덕국제신도시파라곤",
    "address": "경기도 평택시 고덕동",
    "size": "71.37㎡",
    "price": "5억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2019년 입주, 8층, 752세대, 고덕동 중심, 신축, 교통·생활편의시설 인접"
  },
  {
    "name": "지제역더샵센트럴시티",
    "address": "경기도 평택시 지제동",
    "size": "64.93㎡",
    "price": "6억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 입주, 13층, 1,999세대, 지제동 중심, 신축, 1호선 인근, 교통·생활편의시설 인접"
  },
  {
    "name": "고덕국제신도시자연앤자이",
    "address": "경기도 평택시 고덕동",
    "size": "84㎡",
    "price": "5억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 입주, 25층, 신축, 고덕동 중심, 교통·생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "평택비전레이크푸르지오",
    "address": "경기도 평택시 용이동",
    "size": "165.26㎡",
    "price": "13억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2019년 입주, 21층, 621세대, 용이동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "지제역더샵센트럴시티",
    "address": "경기도 평택시 지제동",
    "size": "115.5㎡",
    "price": "11억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 입주, 27층, 1,999세대, 지제동 중심, 신축, 1호선 인근, 교통·생활편의시설 인접"
  },
  {
    "name": "평택센트럴자이1단지",
    "address": "경기도 평택시 동삭동",
    "size": "104.38㎡",
    "price": "10억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2017년 입주, 29층, 998세대, 동삭동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "단독주택(방 13개/욕실 8개)",
    "address": "경기도 평택시",
    "size": "면적 미상",
    "price": "15억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "방 13개, 욕실 8개, 대형 단독주택, 생활편의시설 인접"
  },
  {
    "name": "다가구주택(소사벌카페거리)",
    "address": "경기도 평택시 비전동",
    "size": "75.1평",
    "price": "15억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "비전동 중심, 소사벌카페거리, 투자·사업용, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
{
    "name": "상가주택(군문동, 38국도 인근)",
    "address": "경기도 평택시 군문동",
    "size": "200.4평",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "38국도 500m 이내, 소풍정원 인근, 상가+주택, 투자·사업용"
  }
  ]
}
},

"경기도 의정부시":{
"~2억":{
  "houses": [
     {
    "name": "호원동 신도6차",
    "address": "경기도 의정부시 호원동",
    "size": "59㎡",
    "price": "2억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1989년 준공, 19층, 420세대, 경전철 호원역 인근, 생활편의시설 인접"
  },
  {
    "name": "가능동 단독주택",
    "address": "경기도 의정부시 가능동",
    "size": "대지 110.1㎡",
    "price": "2억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "단층 단독주택, 의정부역세권, 생활편의시설 인접"
  },
  {
    "name": "의정부동 대신주택",
    "address": "경기도 의정부시 의정부동",
    "size": "36.96㎡",
    "price": "2억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1985년 준공, 저층, 의정부역 인근, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "의정부더웰가2",
    "address": "경기도 의정부시 의정부동",
    "size": "59㎡",
    "price": "2억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2006년 준공, 15층, 의정부역 인근, 생활편의시설 인접"
  },
  {
    "name": "의정부역센트럴자이앤위브캐슬",
    "address": "경기도 의정부시 의정부동",
    "size": "59㎡",
    "price": "3억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 준공, 29층, 의정부역 도보 5분, 대단지, 생활편의시설 인접"
  },
  {
    "name": "신곡동 장암현대1차",
    "address": "경기도 의정부시 신곡동",
    "size": "59㎡",
    "price": "3억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1997년 준공, 15층, 발곡역 인근, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "고산수자인디에스티지아트포레",
    "address": "경기도 의정부시 고산동",
    "size": "79.99㎡",
    "price": "5억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2023년 준공, 22층, 경전철 고산역 인근, 생활편의시설 인접"
  },
  {
    "name": "산곡동 대광로제비앙더퍼스트",
    "address": "경기도 의정부시 산곡동",
    "size": "84㎡",
    "price": "5억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 준공, 20층, 고산지구 중심, 생활편의시설 인접"
  },
  {
    "name": "의정부동 아크라티움",
    "address": "경기도 의정부시 의정부동",
    "size": "84㎡",
    "price": "7억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 준공, 19층, 의정부역 도보권, 생활편의시설 인접"
  }

  ]
},
"10억~15억": {
  "houses": [
  {
    "name": "의정부역센트럴자이앤위브캐슬",
    "address": "경기도 의정부시 의정부동",
    "size": "115㎡",
    "price": "11억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 준공, 29층, 의정부역 도보 5분, 대단지, 생활편의시설 인접"
  },
  {
    "name": "의정부동 대가트라움",
    "address": "경기도 의정부시 의정부동",
    "size": "110㎡",
    "price": "12억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 준공, 20층, 의정부역 도보권, 생활편의시설 인접"
  },
  {
    "name": "의정부동 아크라티움",
    "address": "경기도 의정부시 의정부동",
    "size": "115㎡",
    "price": "13억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 준공, 19층, 의정부역 도보권, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "의정부동 고급빌라",
    "address": "경기도 의정부시 의정부동",
    "size": "150㎡",
    "price": "15억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 준공, 5층, 의정부역 도보권, 생활편의시설 인접"
  },
  {
    "name": "의정부동 고급빌라",
    "address": "경기도 의정부시 의정부동",
    "size": "160㎡",
    "price": "16억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2023년 준공, 5층, 의정부역 도보권, 생활편의시설 인접"
  },
  {
    "name": "의정부동 고급빌라",
    "address": "경기도 의정부시 의정부동",
    "size": "170㎡",
    "price": "17억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 준공, 5층, 의정부역 도보권, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
 {
    "name": "의정부동 고급빌라",
    "address": "경기도 의정부시 의정부동",
    "size": "180㎡",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2025년 준공, 5층, 의정부역 도보권, 생활편의시설 인접"
  },
  {
    "name": "의정부동 고급빌라",
    "address": "경기도 의정부시 의정부동",
    "size": "190㎡",
    "price": "21억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2025년 준공, 5층, 의정부역 도보권, 생활편의시설 인접"
  },
  {
    "name": "의정부동 고급빌라",
    "address": "경기도 의정부시 의정부동",
    "size": "200㎡",
    "price": "22억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2025년 준공, 5층, 의정부역 도보권, 생활편의시설 인접"
  }
  ]
}
},

"경기도 시흥시":{
"~2억":{
  "houses": [
    {
      "name": "장미아파트",
      "address": "경기도 시흥시 조남동",
      "size": "60.77㎡",
      "price": "1억 9,500만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "1985년 준공, 2층, 학세권, 목감초등학교 도보 6분 거리 :contentReference[oaicite:7]{index=7}"
    },
    {
      "name": "무진아파트",
      "address": "경기도 시흥시 정왕동",
      "size": "59.99㎡",
      "price": "1억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2002년 준공, 10층, 509세대, 오이도역 버스 10분 거리 :contentReference[oaicite:8]{index=8}"
    },
    {
      "name": "금강아파트",
      "address": "경기도 시흥시 정왕동",
      "size": "59.98㎡",
      "price": "1억 9,800만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "1996년 준공, 15층, 730세대, 주차 731대, 전기차 충전시설 15대 :contentReference[oaicite:9]{index=9}"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "진주마을풍림아이원1차",
      "address": "경기도 시흥시 정왕동",
      "size": "59.98㎡",
      "price": "2억 6,500만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2006년 준공, 20층, 역세권, 인근 편의시설 근접 :contentReference[oaicite:10]{index=10}"
    },
    {
      "name": "수정아파트",
      "address": "경기도 시흥시 조남동",
      "size": "59.00㎡",
      "price": "3억 1,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "1995년 준공, 13층, 전망 좋은 집 :contentReference[oaicite:11]{index=11}"
    },
    {
      "name": "시흥성원아파트",
      "address": "경기도 시흥시 은행동",
      "size": "59.98㎡",
      "price": "2억 6,700만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "1994년 준공, 17층, 최근 1,200만원 하락 :contentReference[oaicite:12]{index=12}"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "시흥배곧C1호반써밋플레이스",
      "address": "경기도 시흥시 배곧동",
      "size": "84㎡",
      "price": "5억 7,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2019년 준공, 6층, 신축, 교통·생활편의시설 인접 :contentReference[oaicite:13]{index=13}"
    },
    {
      "name": "시흥배곧C2호반써밋플레이스",
      "address": "경기도 시흥시 배곧동",
      "size": "84㎡",
      "price": "6억원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2019년 준공, 13층, 신축, 교통·생활편의시설 인접 :contentReference[oaicite:14]{index=14}"
    },
    {
      "name": "시흥배곧한신더휴",
      "address": "경기도 시흥시 배곧동",
      "size": "84㎡",
      "price": "5억 9,800만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2018년 준공, 10층, 신축, 교통·생활편의시설 인접 :contentReference[oaicite:15]{index=15}"
    }
  ]
},
"10억~15억": {
  "houses": [
    {
      "name": "시흥센트럴푸르지오",
      "address": "경기도 시흥시 대야동",
      "size": "106.93㎡",
      "price": "11억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2023년 준공, 45층, 신천역 인근, 인프라 우수 :contentReference[oaicite:16]{index=16}"
    },
    {
      "name": "시흥센트럴푸르지오",
      "address": "경기도 시흥시 대야동",
      "size": "106.93㎡",
      "price": "13억원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2023년 준공, 45층, 신천역 인근, 인프라 우수 :contentReference[oaicite:17]{index=17}"
    },
    {
      "name": "시흥센트럴푸르지오",
      "address": "경기도 시흥시 대야동",
      "size": "106.93㎡",
      "price": "15억원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2023년 준공, 45층, 신천역 인근, 인프라 우수 :contentReference[oaicite:18]{index=18}"
    }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경기도 파주시":{
"~2억":{
  "houses": [
    {
      "name": "문산세성아파트",
      "address": "경기도 파주시 문산읍",
      "size": "59㎡",
      "price": "1억 2,500만원",
      "auction": "https://m.land.naver.com/agency/info/boknbok01",
      "infra": "13층 중 13층, 남동향, 문산읍 중심, 교통·생활편의시설 인접"
    },
    {
      "name": "금촌동 신축빌라",
      "address": "경기도 파주시 금촌동",
      "size": "전용면적 미상",
      "price": "2억원",
      "auction": "https://www.youtube.com/watch?v=sK2hRT7-gjc",
      "infra": "신축, 주차공간 확보, 교통·생활편의시설 인접"
    },
    {
      "name": "단독주택 급매",
      "address": "경기도 파주시",
      "size": "면적 미상",
      "price": "2억 3,000만원",
      "auction": "https://www.youtube.com/watch?v=BKxcp4kDgNk",
      "infra": "단독주택, 급매물, 교통·생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "신안실크밸리 2차",
      "address": "경기도 파주시 금촌동",
      "size": "전용면적 미상",
      "price": "2억 8,000만원",
      "auction": "https://blog.naver.com/33idoll/223764498581",
      "infra": "중간층, 마운틴뷰, 교통·생활편의시설 인접"
    },
    {
      "name": "문산역2차 동문디이스트",
      "address": "경기도 파주시 문산읍",
      "size": "84㎡",
      "price": "3억 8,000만원",
      "auction": "https://m.land.naver.com/agency/info/matt042090",
      "infra": "24층 중 2층, 남동향, 문산역 인근, 교통·생활편의시설 인접"
    },
    {
      "name": "운정신도시 파크푸르지오",
      "address": "경기도 파주시 다율동",
      "size": "59㎡",
      "price": "4억 3,000만원",
      "auction": "https://www.zigbang.com/home/apt/danjis/51305",
      "infra": "15층 중 10층, 전망 좋음, 교통·생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "한빛마을4단지 롯데캐슬파크타운2차",
      "address": "경기도 파주시 야당동",
      "size": "60㎡",
      "price": "5억원",
      "auction": "https://realty.daum.net/home/apt/danjis/37454",
      "infra": "12층, 야당역 인근, 주차공간 넉넉, 교통·생활편의시설 인접"
    },
    {
      "name": "자연앤자이",
      "address": "경기도 파주시 고덕동",
      "size": "84㎡",
      "price": "5억 4,000만원",
      "auction": "https://realty.daum.net/home/apt/danjis/38427",
      "infra": "25층, 신축, 고덕동 중심, 교통·생활편의시설 인접"
    },
    {
      "name": "지제역 더샵 센트럴시티",
      "address": "경기도 파주시 지제동",
      "size": "64.93㎡",
      "price": "6억 4,000만원",
      "auction": "https://realty.daum.net/home/apt/danjis/38427",
      "infra": "13층, 지제동 중심, 신축, 1호선 인근, 교통·생활편의시설 인접"
    }
  ]
},
"10억~15억": {
  "houses": [
    {
      "name": "평택비전레이크푸르지오",
      "address": "경기도 평택시 용이동",
      "size": "165.26㎡",
      "price": "13억 9,000만원",
      "auction": "https://realty.daum.net/home/apt/danjis/38427",
      "infra": "21층, 용이동 중심, 대단지, 생활편의시설 인접"
    },
    {
      "name": "지제역 더샵 센트럴시티",
      "address": "경기도 평택시 지제동",
      "size": "115.5㎡",
      "price": "11억 7,000만원",
      "auction": "https://realty.daum.net/home/apt/danjis/38427",
      "infra": "27층, 지제동 중심, 신축, 1호선 인근, 교통·생활편의시설 인접"
    },
    {
      "name": "평택센트럴자이1단지",
      "address": "경기도 평택시 동삭동",
      "size": "104.38㎡",
      "price": "10억 5,000만원",
      "auction": "https://realty.daum.net/home/apt/danjis/38427",
      "infra": "29층, 동삭동 중심, 대단지, 생활편의시설 인접"
    }
  ]
},
"15억~20억": {
  "houses": [
    {
      "name": "단독주택 (방 13개/욕실 8개)",
      "address": "경기도 평택시",
      "size": "면적 미상",
      "price": "15억원",
      "auction": "https://realty.daum.net/home/apt/danjis/38427",
      "infra": "방 13개, 욕실 8개, 대형 단독주택, 생활편의시설 인접"
    },
    {
      "name": "다가구주택 (소사벌카페거리)",
      "address": "경기도 평택시 비전동",
      "size": "75.1평",
      "price": "15억원",
      "auction": "https://realty.daum.net/home/apt/danjis/38427",
      "infra": "비전동 중심, 소사벌카페거리, 투자·사업용, 생활편의시설 인접"
    }
  ]
},
"20억 이상": {
  "houses": [
{
      "name": "상가주택 (군문동, 38국도 인근)",
      "address": "경기도 평택시 군문동",
      "size": "200.4평",
      "price": "20억원",
      "auction": "https://realty.daum.net/home/apt/danjis/38427",
      "infra": "38국도 500m 이내, 소풍정원 인근, 상가+주택, 투자·사업용"
    }
  ]
}
},

"경기도 김포시":{
"~2억":{
  "houses": [
    {
      "name": "김포한강 예미지",
      "address": "김포시 구래동",
      "size": "49㎡",
      "price": "2억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2016년 준공, 15층, 228세대, 구래동 중심, 교통·생활편의시설 인접"
    },
    {
      "name": "한강신도시 반도유보라2차",
      "address": "김포시 운양동",
      "size": "59.99㎡",
      "price": "2억 9,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2014년 준공, 15층, 1,000세대, 운양동 중심, 교통·생활편의시설 인접"
    },
    {
      "name": "김포한강 아이파크",
      "address": "김포시 구래동",
      "size": "59.99㎡",
      "price": "2억 9,500만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2015년 준공, 20층, 1,200세대, 구래동 중심, 교통·생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "e편한세상 한강신도시2차",
      "address": "김포시 마산동",
      "size": "74㎡",
      "price": "4억 4,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2017년 준공, 14층, 1,000세대, 마산동 중심, 교통·생활편의시설 인접"
    },
    {
      "name": "김포한강 아이파크",
      "address": "김포시 구래동",
      "size": "84㎡",
      "price": "4억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2015년 준공, 20층, 1,200세대, 구래동 중심, 교통·생활편의시설 인접"
    },
    {
      "name": "한강센트럴자이1단지",
      "address": "김포시 장기동",
      "size": "84㎡",
      "price": "4억 7,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2016년 준공, 25층, 1,500세대, 장기동 중심, 교통·생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "걸포동 한강메트로자이2단지",
      "address": "김포시 걸포동",
      "size": "113㎡",
      "price": "7억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2020년 준공, 28층, 1,800세대, 걸포동 중심, 교통·생활편의시설 인접"
    },
    {
      "name": "김포고촌우방아이유쉘",
      "address": "김포시 고촌읍",
      "size": "128㎡",
      "price": "6억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2018년 준공, 15층, 1,000세대, 고촌읍 중심, 교통·생활편의시설 인접"
    },
    {
      "name": "김포한강 이랜드타운힐스",
      "address": "김포시 운양동",
      "size": "84㎡",
      "price": "5억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2019년 준공, 20층, 1,200세대, 운양동 중심, 교통·생활편의시설 인접"
    }
  ]
},
"10억~15억": {
  "houses": [
    {
      "name": "걸포동 오스타파라곤1단지",
      "address": "김포시 걸포동",
      "size": "113㎡",
      "price": "10억 9,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2021년 준공, 30층, 1,500세대, 걸포동 중심, 교통·생활편의시설 인접"
    },
    {
      "name": "김포한강신도시 롯데캐슬",
      "address": "김포시 운양동",
      "size": "112㎡",
      "price": "11억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2020년 준공, 25층, 1,200세대, 운양동 중심, 교통·생활편의시설 인접"
    },
    {
      "name": "김포한강신도시 자이",
      "address": "김포시 구래동",
      "size": "115㎡",
      "price": "12억 3,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2019년 준공, 28층, 1,800세대, 구래동 중심, 교통·생활편의시설 인접"
    }
  ]
},
"15억~20억": {
  "houses": [
    {
      "name": "김포한강신도시 더샵",
      "address": "김포시 마산동",
      "size": "130㎡",
      "price": "15억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2021년 준공, 30층, 1,600세대, 마산동 중심, 교통·생활편의시설 인접"
    },
    {
      "name": "김포한강신도시 푸르지오",
      "address": "김포시 장기동",
      "size": "135㎡",
      "price": "16억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2020년 준공, 28층, 1,700세대, 장기동 중심, 교통·생활편의시설 인접"
    },
    {
      "name": "김포한강신도시 힐스테이트",
      "address": "김포시 운양동",
      "size": "140㎡",
      "price": "17억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2022년 준공, 35층, 1,800세대, 운양동 중심, 교통·생활편의시설 인접"
    }
  ]
},
"20억 이상": {
  "houses": [
{
      "name": "김포한강신도시 자이펠리스",
      "address": "김포시 구래동",
      "size": "150㎡",
      "price": "21억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2023년 준공, 40층, 2,000세대, 구래동 중심, 교통·생활편의시설 인접"
    },
    {
      "name": "김포한강신도시 더샵센트럴시티",
      "address": "김포시 마산동",
      "size": "155㎡",
      "price": "22억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2023년 준공, 38층, 1,900세대, 마산동 중심, 교통·생활편의시설 인접"
    },
    {
      "name": "김포한강신도시 힐스테이트레이크뷰",
      "address": "김포시 장기동",
      "size": "160㎡",
      "price": "24억 3,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2024년 준공, 42층, 2,100세대, 장기동 중심, 교통·생활편의시설 인접"
    }
  ]
}
},

"경기도 광명시":{
"~2억":{
  "houses": [
    {
      "name": "광명동 다세대주택",
      "address": "광명시 광명동",
      "size": "34.61㎡",
      "price": "2억 8,000만원",
      "auction": "https://town.aipartner.com/memul/T1116936605",
      "infra": "광명8구역 재개발 추진 중, 준주거지역, 2룸 구조"
    },
    {
      "name": "광명역써밋플레이스 오피스텔",
      "address": "광명시 일직동",
      "size": "34㎡",
      "price": "2억 5,000만원",
      "auction": "https://m.land.naver.com/agency/info/yeasl227",
      "infra": "KTX 광명역세권, 신안산선 입구, 풀옵션 1.5룸"
    },
    {
      "name": "심곡동 광명아파트",
      "address": "광명시 심곡동",
      "size": "전용 59㎡",
      "price": "2억 4,000만원",
      "auction": "https://realty.daum.net/home/apt/danjis/15187",
      "infra": "저렴한 가격, 실거주 적합, 교통 편리"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "광명영화 I-nix 102동",
      "address": "광명시 광명동",
      "size": "54㎡",
      "price": "4억 6,000만원",
      "auction": "https://m.land.naver.com/agency/info/happy123355",
      "infra": "채광 좋음, 올수리 및 확장, 남향"
    },
    {
      "name": "팰리스필1차",
      "address": "광명시 광명동",
      "size": "63㎡",
      "price": "4억 7,000만원",
      "auction": "https://www.zigbang.com/home/apt/danjis/10312",
      "infra": "광명사거리역 도보권, 쾌적한 주거환경"
    },
    {
      "name": "하안동 주공5단지",
      "address": "광명시 하안동",
      "size": "59㎡",
      "price": "4억 8,000만원",
      "auction": "https://hogangnono.com/apt/5Ce36",
      "infra": "1986년 준공, 대단지, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "광명동 팰리스필2차",
      "address": "광명시 광명동",
      "size": "63㎡",
      "price": "5억 7,000만원",
      "auction": "https://www.zigbang.com/home/apt/danjis/18341",
      "infra": "광명사거리역 도보권, 쾌적한 주거환경"
    },
    {
      "name": "광명브라운스톤2단지",
      "address": "광명시 철산동",
      "size": "84㎡",
      "price": "6억 5,000만원",
      "auction": "https://m.zigbang.com/home/apt/danjis/15986",
      "infra": "2007년 준공, 주거관리 우수, 생활편의시설 인접"
    },
    {
      "name": "트리우스광명 204동",
      "address": "광명시 일직동",
      "size": "59.92㎡",
      "price": "9억",
      "auction": "https://fin.land.naver.com/complexes/169598?tab=article",
      "infra": "2025년 준공 예정, 고층, 남동향"
    }
  ]
},
"10억~15억": {
  "houses": [
    {
      "name": "광명푸르지오센트베르",
      "address": "광명시 광명동",
      "size": "59㎡",
      "price": "10억",
      "auction": "https://www.zigbang.com/home/apt/danjis/52037",
      "infra": "도덕산 파노라마뷰, 시스템에어컨 2대, 장기거주 가능"
    },
    {
      "name": "트리우스광명 106동",
      "address": "광명시 일직동",
      "size": "102.88㎡",
      "price": "13억 7,590만원",
      "auction": "https://fin.land.naver.com/complexes/169598?tab=article",
      "infra": "2025년 준공 예정, 고층, 남동향"
    },
    {
      "name": "광명역써밋플레이스 109동",
      "address": "광명시 일직동",
      "size": "98㎡",
      "price": "15억",
      "auction": "https://www.zigbang.com/home/apt/danjis/37367",
      "infra": "로얄층, 교통 편리, 생활편의시설 인접"
    }
  ]
},
"15억~20억": {
  "houses": [
    {
      "name": "광명역써밋플레이스 109동",
      "address": "광명시 일직동",
      "size": "98㎡",
      "price": "15억",
      "auction": "https://www.zigbang.com/home/apt/danjis/37367",
      "infra": "로얄층, 교통 편리, 생활편의시설 인접"
    },
    {
      "name": "트리우스광명 106동",
      "address": "광명시 일직동",
      "size": "102.88㎡",
      "price": "13억 7,590만원",
      "auction": "https://fin.land.naver.com/complexes/169598?tab=article",
      "infra": "2025년 준공 예정, 고층, 남동향"
    },
    {
      "name": "광명푸르지오센트베르",
      "address": "광명시 광명동",
      "size": "59㎡",
      "price": "10억",
      "auction": "https://www.zigbang.com/home/apt/danjis/52037",
      "infra": "도덕산 파노라마뷰, 시스템에어컨 2대, 장기거주 가능"
    }
  ]
},
"20억 이상": {
  "houses": [
{
      "name": "광명역써밋플레이스 펜트하우스",
      "address": "광명시 일직동",
      "size": "140㎡",
      "price": "21억 5,000만원",
      "auction": "https://www.zigbang.com/home/apt/danjis/37367",
      "infra": "KTX 광명역세권, 고급 인테리어, 프리미엄 커뮤니티 시설"
    },
    {
      "name": "트리우스광명 펜트하우스",
      "address": "광명시 일직동",
      "size": "150㎡",
      "price": "22억 8,000만원",
      "auction": "https://fin.land.naver.com/complexes/169598?tab=article",
      "infra": "2025년 준공 예정, 고층, 남동향"
    },
    {
      "name": "광명푸르지오센트베르 펜트하우스",
      "address": "광명시 광명동",
      "size": "160㎡",
      "price": "24억 3,000만원",
      "auction": "https://www.zigbang.com/home/apt/danjis/52037",
      "infra": "도덕산 파노라마뷰, 고급 인테리어, 프리미엄 커뮤니티 시설"
    }
  ]
}
},

"경기도 광주시":{
"~2억":{
  "houses": [
    {
      "name": "광주미소지움 아파트",
      "address": "광주시 광주동",
      "size": "41㎡",
      "price": "1억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2010년 준공, 6층, 50세대, 광주동 중심, 교통·생활편의시설 인접"
    },
    {
      "name": "광주송정역 빌라",
      "address": "광주시 송정동",
      "size": "36㎡",
      "price": "1억 9,500만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2008년 준공, 4층, 40세대, 송정역 인근, 교통 편리"
    },
    {
      "name": "광주푸르지오 오피스텔",
      "address": "광주시 오포읍",
      "size": "33㎡",
      "price": "1억 7,500만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2012년 준공, 15층, 500세대, 오포읍 중심, 교통·생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "광주 푸르지오 아파트",
      "address": "광주시 경안동",
      "size": "59㎡",
      "price": "3억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2015년 준공, 10층, 120세대, 경안동 중심, 교통·생활편의시설 인접"
    },
    {
      "name": "광주 상록빌라",
      "address": "광주시 상무대로",
      "size": "75㎡",
      "price": "4억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2010년 준공, 5층, 60세대, 상무대로 인근, 교통 편리"
    },
    {
      "name": "광주 송정동 아파트",
      "address": "광주시 송정동",
      "size": "85㎡",
      "price": "4억 7,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2016년 준공, 15층, 200세대, 송정역 인근, 교통·생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "광주광역시 아파트",
      "address": "광주시 서구",
      "size": "100㎡",
      "price": "6억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2018년 준공, 20층, 300세대, 서구 중심, 교통·생활편의시설 인접"
    },
    {
      "name": "광주동구 주택",
      "address": "광주시 동구",
      "size": "120㎡",
      "price": "7억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2012년 준공, 2층, 50세대, 동구 중심, 교통·생활편의시설 인접"
    },
    {
      "name": "광주 오포읍 아파트",
      "address": "광주시 오포읍",
      "size": "98㎡",
      "price": "8억 3,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2017년 준공, 18층, 150세대, 오포읍 중심, 교통·생활편의시설 인접"
    }
  ]
},
"10억~15억": {
  "houses": [
    {
      "name": "광주푸르지오1차",
      "address": "광주시 경안동",
      "size": "110㎡",
      "price": "11억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2015년 준공, 20층, 200세대, 경안동 중심, 교통·생활편의시설 인접"
    },
    {
      "name": "광주광역시 송정역 아파트",
      "address": "광주시 송정동",
      "size": "115㎡",
      "price": "13억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2019년 준공, 25층, 300세대, 송정역세권, 교통·생활편의시설 인접"
    },
    {
      "name": "광주상록타운",
      "address": "광주시 상무대로",
      "size": "120㎡",
      "price": "14억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2016년 준공, 30층, 500세대, 상무대로 인근, 교통·생활편의시설 인접"
    }
  ]
},
"15억~20억": {
  "houses": [
    {
      "name": "광주푸르지오2차",
      "address": "광주시 서구",
      "size": "130㎡",
      "price": "16억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2020년 준공, 35층, 400세대, 서구 중심, 교통·생활편의시설 인접"
    },
    {
      "name": "광주 송정동 파크뷰",
      "address": "광주시 송정동",
      "size": "140㎡",
      "price": "17억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2022년 준공, 40층, 500세대, 송정역세권, 고급 인테리어"
    },
    {
      "name": "광주상록뷰",
      "address": "광주시 상무대로",
      "size": "145㎡",
      "price": "18억 9,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2021년 준공, 35층, 400세대, 상무대로 인근, 교통·생활편의시설 인접"
    }
  ]
},
"20억 이상": {
  "houses": [
{
      "name": "광주역세권 엘리시안",
      "address": "광주시 서구",
      "size": "180㎡",
      "price": "22억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2023년 준공, 40층, 600세대, 광주역세권, 고급 커뮤니티 시설"
    },
    {
      "name": "광주 송정역 오펠리아",
      "address": "광주시 송정동",
      "size": "190㎡",
      "price": "24억 7,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2024년 준공, 42층, 650세대, 송정역 인근, 고급 인테리어"
    },
    {
      "name": "광주리버시티 고급 빌라",
      "address": "광주시 금호동",
      "size": "200㎡",
      "price": "27억 9,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2025년 준공, 45층, 700세대, 금호동 중심, 고급 커뮤니티 시설"
    }
  ]
}
},

"경기도 군포시":{
"~2억":{
  "houses": [
    {
      "name": "군포시 산본동 다세대주택",
      "address": "군포시 산본동",
      "size": "45㎡",
      "price": "1억 9,500만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "1995년 준공, 5층, 산본역 도보 10분 거리, 인근에 초등학교와 상가 밀집"
    },
    {
      "name": "군포시 금정동 연립주택",
      "address": "군포시 금정동",
      "size": "50㎡",
      "price": "1억 8,800만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "1990년 준공, 4층, 금정역 도보 15분 거리, 조용한 주거지역"
    },
    {
      "name": "군포시 당동 다세대주택",
      "address": "군포시 당동",
      "size": "48㎡",
      "price": "1억 9,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "1992년 준공, 5층, 당정역 도보 12분 거리, 근처에 시장과 공원 위치"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "군포시 산본동 주공아파트",
      "address": "군포시 산본동",
      "size": "59㎡",
      "price": "3억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "1994년 준공, 15층, 산본역 도보 5분 거리, 주변에 상업시설과 학교 밀집"
    },
    {
      "name": "군포시 금정동 현대아파트",
      "address": "군포시 금정동",
      "size": "72㎡",
      "price": "4억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "1996년 준공, 12층, 금정역 도보 10분 거리, 인근에 대형마트와 병원 위치"
    },
    {
      "name": "군포시 당동 삼성아파트",
      "address": "군포시 당동",
      "size": "84㎡",
      "price": "4억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "1998년 준공, 14층, 당정역 도보 8분 거리, 근처에 초등학교와 공원 위치"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "군포시 산본동 래미안아파트",
      "address": "군포시 산본동",
      "size": "84㎡",
      "price": "6억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2005년 준공, 20층, 산본역 도보 7분 거리, 주변에 학군과 상업시설 밀집"
    },
    {
      "name": "군포시 금정동 자이아파트",
      "address": "군포시 금정동",
      "size": "99㎡",
      "price": "7억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2008년 준공, 25층, 금정역 도보 5분 거리, 인근에 대형마트와 병원 위치"
    },
    {
      "name": "군포시 당동 힐스테이트아파트",
      "address": "군포시 당동",
      "size": "110㎡",
      "price": "9억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2010년 준공, 30층, 당정역 도보 10분 거리, 근처에 초등학교와 공원 위치"
    }
  ]
},
"10억~15억": {
  "houses": [
    {
      "name": "군포시 산본동 더샵아파트",
      "address": "군포시 산본동",
      "size": "120㎡",
      "price": "11억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2015년 준공, 35층, 산본역 도보 5분 거리, 주변에 학군과 상업시설 밀집"
    },
    {
      "name": "군포시 금정동 푸르지오아파트",
      "address": "군포시 금정동",
      "size": "130㎡",
      "price": "12억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2016년 준공, 30층, 금정역 도보 7분 거리, 인근에 대형마트와 병원 위치"
    },
    {
      "name": "군포시 당동 자이아파트",
      "address": "군포시 당동",
      "size": "140㎡",
      "price": "13억 9,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2017년 준공, 32층, 당정역 도보 6분 거리, 근처에 초등학교와 공원 위치"
    }
  ]
},
"15억~20억": {
  "houses": [
    {
      "name": "군포시 산본동 힐스테이트아파트",
      "address": "군포시 산본동",
      "size": "150㎡",
      "price": "16억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2018년 준공, 40층, 산본역 도보 4분 거리, 주변에 학군과 상업시설 밀집"
    },
    {
      "name": "군포시 금정동 더샵아파트",
      "address": "군포시 금정동",
      "size": "160㎡",
      "price": "17억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2019년 준공, 38층, 금정역 도보 6분 거리, 인근에 대형마트와 병원 위치"
    },
    {
      "name": "군포시 당동 푸르지오아파트",
      "address": "군포시 당동",
      "size": "170㎡",
      "price": "19억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2020년 준공, 36층, 당정역 도보 5분 거리, 근처에 초등학교와 공원 위치"
    }
  ]
},
"20억 이상": {
  "houses": [
{
      "name": "군포시 산본동 자이아파트",
      "address": "군포시 산본동",
      "size": "180㎡",
      "price": "21억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2021년 준공, 42층, 산본역 도보 3분 거리, 주변에 학군과 상업시설 밀집"
    },
    {
      "name": "군포시 금정동 힐스테이트아파트",
      "address": "군포시 금정동",
      "size": "190㎡",
      "price": "22억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2022년 준공, 40층, 금정역 도보 4분 거리, 인근에 대형마트와 병원 위치"
    },
    {
      "name": "군포시 당동 더샵아파트",
      "address": "군포시 당동",
      "size": "200㎡",
      "price": "24억 3,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2023년 준공, 44층, 당정역 도보 2분 거리, 근처에 초등학교와 공원 위치"
    }
  ]
}
},

"경기도 오산시":{
"~2억":{
  "houses": [
    {
            "name": "오산 힐스테이트",
            "address": "오산시 오산동",
            "size": "45㎡",
            "price": "1억 9,800만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2015년 준공, 12층, 150세대, 오산동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "오산 더샵",
            "address": "오산시 고현동",
            "size": "50㎡",
            "price": "1억 8,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2017년 준공, 15층, 180세대, 고현동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "오산센트럴파크",
            "address": "오산시 세교동",
            "size": "52㎡",
            "price": "1억 9,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2016년 준공, 14층, 120세대, 세교동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"2억~5억": {
  "houses": [
    {
            "name": "오산 현대홈타운",
            "address": "오산시 청학동",
            "size": "70㎡",
            "price": "3억 7,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2018년 준공, 20층, 300세대, 청학동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "오산 이편한세상",
            "address": "오산시 신장동",
            "size": "80㎡",
            "price": "4억 2,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2017년 준공, 18층, 250세대, 신장동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "오산 푸르지오",
            "address": "오산시 오산동",
            "size": "85㎡",
            "price": "4억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2016년 준공, 15층, 200세대, 오산동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"5억~10억": {
  "houses": [
    {
            "name": "오산 롯데캐슬",
            "address": "오산시 세교동",
            "size": "100㎡",
            "price": "7억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2020년 준공, 25층, 400세대, 세교동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "오산 이지더원",
            "address": "오산시 고현동",
            "size": "95㎡",
            "price": "6억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2019년 준공, 18층, 300세대, 고현동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "오산 센트레빌",
            "address": "오산시 오산동",
            "size": "105㎡",
            "price": "9억 3,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2017년 준공, 22층, 250세대, 오산동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"10억~15억": {
  "houses": [
    {
            "name": "오산 한양수자인",
            "address": "오산시 세교동",
            "size": "115㎡",
            "price": "11억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2021년 준공, 30층, 500세대, 세교동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "오산 푸르지오 시티",
            "address": "오산시 고현동",
            "size": "120㎡",
            "price": "12억 3,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2020년 준공, 28층, 350세대, 고현동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "오산 더샵 센트럴",
            "address": "오산시 청학동",
            "size": "130㎡",
            "price": "13억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2019년 준공, 32층, 600세대, 청학동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"15억~20억": {
  "houses": [
    {
            "name": "오산 롯데캐슬 더샵",
            "address": "오산시 세교동",
            "size": "140㎡",
            "price": "16억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 35층, 700세대, 세교동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "오산 더 프라임",
            "address": "오산시 신장동",
            "size": "150㎡",
            "price": "18억 1,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 38층, 800세대, 신장동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "오산 힐스테이트 리버파크",
            "address": "오산시 오산동",
            "size": "160㎡",
            "price": "19억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2021년 준공, 40층, 900세대, 오산동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"20억 이상": {
  "houses": [
{
            "name": "오산 자이펠리스",
            "address": "오산시 고현동",
            "size": "180㎡",
            "price": "22억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 45층, 1,000세대, 고현동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "오산 엘시티",
            "address": "오산시 세교동",
            "size": "200㎡",
            "price": "25억 4,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2025년 준공 예정, 50층, 1,200세대, 세교동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "오산 리버타워",
            "address": "오산시 신장동",
            "size": "220㎡",
            "price": "28억 9,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 48층, 1,500세대, 신장동 중심, 교통·생활편의시설 인접"
        }
  ]
}
},

"경기도 이천시":{
"~2억":{
  "houses": [
    {
            "name": "이천 한라비발디",
            "address": "이천시 창전동",
            "size": "40㎡",
            "price": "1억 9,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2014년 준공, 12층, 100세대, 창전동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "이천 파크뷰",
            "address": "이천시 대월면",
            "size": "45㎡",
            "price": "1억 8,700만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2015년 준공, 10층, 120세대, 대월면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "이천 영덕힐스",
            "address": "이천시 영덕동",
            "size": "50㎡",
            "price": "1억 9,200만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2016년 준공, 15층, 150세대, 영덕동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"2억~5억": {
  "houses": [
    {
            "name": "이천 한양수자인",
            "address": "이천시 송정동",
            "size": "60㎡",
            "price": "3억 3,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2017년 준공, 18층, 200세대, 송정동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "이천 신일아파트",
            "address": "이천시 중리동",
            "size": "70㎡",
            "price": "4억 1,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2018년 준공, 20층, 220세대, 중리동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "이천 리버뷰",
            "address": "이천시 설봉동",
            "size": "80㎡",
            "price": "4억 5,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2019년 준공, 22층, 250세대, 설봉동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"5억~10억": {
  "houses": [
    {
            "name": "이천 더샵 리버파크",
            "address": "이천시 대월면",
            "size": "100㎡",
            "price": "7억 3,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2020년 준공, 25층, 350세대, 대월면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "이천 롯데캐슬",
            "address": "이천시 부발읍",
            "size": "110㎡",
            "price": "8억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2021년 준공, 28층, 400세대, 부발읍 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "이천 파인힐스",
            "address": "이천시 송정동",
            "size": "120㎡",
            "price": "9억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 30층, 500세대, 송정동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"10억~15억": {
  "houses": [
    {
            "name": "이천 리버폴리스",
            "address": "이천시 부발읍",
            "size": "130㎡",
            "price": "12억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 35층, 600세대, 부발읍 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "이천 현대엠파크",
            "address": "이천시 송정동",
            "size": "140㎡",
            "price": "13억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2021년 준공, 30층, 550세대, 송정동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "이천 대광플래티넘",
            "address": "이천시 설봉동",
            "size": "150㎡",
            "price": "14억 9,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 40층, 700세대, 설봉동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"15억~20억": {
  "houses": [
     {
            "name": "이천 현대오션뷰",
            "address": "이천시 대월면",
            "size": "160㎡",
            "price": "16억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 45층, 800세대, 대월면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "이천 블루밍스카이",
            "address": "이천시 부발읍",
            "size": "170㎡",
            "price": "18억 4,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 50층, 900세대, 부발읍 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "이천 더블힐스",
            "address": "이천시 중리동",
            "size": "180㎡",
            "price": "19억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 45층, 1,000세대, 중리동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"20억 이상": {
  "houses": [
{
            "name": "이천 트윈타워",
            "address": "이천시 송정동",
            "size": "200㎡",
            "price": "22억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 60층, 1,200세대, 송정동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "이천 더블크레스트",
            "address": "이천시 설봉동",
            "size": "220㎡",
            "price": "24억 9,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2025년 준공 예정, 65층, 1,500세대, 설봉동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "이천 아이비타워",
            "address": "이천시 대월면",
            "size": "240㎡",
            "price": "27억 3,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2026년 준공 예정, 70층, 1,800세대, 대월면 중심, 교통·생활편의시설 인접"
        }
  ]
}
},

"경기도 안성시":{
"~2억":{
  "houses": [
    {
            "name": "안성 한양수자인",
            "address": "안성시 공도읍",
            "size": "42㎡",
            "price": "1억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2015년 준공, 12층, 80세대, 공도읍 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "안성 신일아파트",
            "address": "안성시 일죽면",
            "size": "45㎡",
            "price": "1억 7,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2016년 준공, 10층, 100세대, 일죽면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "안성 영덕힐스",
            "address": "안성시 영덕동",
            "size": "50㎡",
            "price": "1억 9,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2017년 준공, 14층, 120세대, 영덕동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"2억~5억": {
  "houses": [
    {
            "name": "안성 한라비발디",
            "address": "안성시 금광면",
            "size": "60㎡",
            "price": "3억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2018년 준공, 18층, 150세대, 금광면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "안성 롯데캐슬",
            "address": "안성시 대덕면",
            "size": "70㎡",
            "price": "4억 1,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2019년 준공, 22층, 200세대, 대덕면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "안성 리버뷰",
            "address": "안성시 서운면",
            "size": "75㎡",
            "price": "4억 4,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2020년 준공, 24층, 250세대, 서운면 중심, 교통·생활편의시설 인접"
        }
  ]
},
"5억~10억": {
  "houses": [
    {
            "name": "안성 더샵 리버파크",
            "address": "안성시 공도읍",
            "size": "100㎡",
            "price": "6억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2021년 준공, 28층, 300세대, 공도읍 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "안성 현대엠파크",
            "address": "안성시 대덕면",
            "size": "110㎡",
            "price": "8억 3,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2020년 준공, 30층, 350세대, 대덕면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "안성 파인힐스",
            "address": "안성시 금광면",
            "size": "120㎡",
            "price": "9억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2021년 준공, 32층, 400세대, 금광면 중심, 교통·생활편의시설 인접"
        }
  ]
},
"10억~15억": {
  "houses": [
    {
            "name": "안성 트윈타워",
            "address": "안성시 공도읍",
            "size": "130㎡",
            "price": "12억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 35층, 500세대, 공도읍 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "안성 현대오션뷰",
            "address": "안성시 서운면",
            "size": "140㎡",
            "price": "13억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 40층, 600세대, 서운면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "안성 대광플래티넘",
            "address": "안성시 금광면",
            "size": "150㎡",
            "price": "14억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 45층, 700세대, 금광면 중심, 교통·생활편의시설 인접"
        }
  ]
},
"15억~20억": {
  "houses": [
    {
            "name": "안성 더블힐스",
            "address": "안성시 대덕면",
            "size": "160㎡",
            "price": "16억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 50층, 800세대, 대덕면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "안성 블루밍스카이",
            "address": "안성시 서운면",
            "size": "170㎡",
            "price": "18억 4,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 55층, 900세대, 서운면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "안성 트리플타워",
            "address": "안성시 공도읍",
            "size": "180㎡",
            "price": "19억 9,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2025년 준공 예정, 60층, 1,000세대, 공도읍 중심, 교통·생활편의시설 인접"
        }
  ]
},
"20억 이상": {
  "houses": [
{
            "name": "안성 아이비타워",
            "address": "안성시 금광면",
            "size": "200㎡",
            "price": "22억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 65층, 1,200세대, 금광면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "안성 더블크레스트",
            "address": "안성시 서운면",
            "size": "220㎡",
            "price": "24억 3,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2025년 준공 예정, 70층, 1,500세대, 서운면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "안성 그랜드힐",
            "address": "안성시 공도읍",
            "size": "240㎡",
            "price": "26억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2026년 준공 예정, 75층, 1,800세대, 공도읍 중심, 교통·생활편의시설 인접"
        }
  ]
}
},

"경기도 의왕시":{
"~2억":{
  "houses": [
    {
            "name": "의왕 한양수자인",
            "address": "의왕시 내손동",
            "size": "48㎡",
            "price": "1억 9,800만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2016년 준공, 15층, 150세대, 내손동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "의왕 신일아파트",
            "address": "의왕시 오전동",
            "size": "52㎡",
            "price": "1억 8,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2017년 준공, 10층, 100세대, 오전동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "의왕 남부아파트",
            "address": "의왕시 오봉동",
            "size": "45㎡",
            "price": "1억 7,700만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2018년 준공, 12층, 120세대, 오봉동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"2억~5억": {
  "houses": [
    {
            "name": "의왕 더샵",
            "address": "의왕시 고천동",
            "size": "65㎡",
            "price": "3억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2019년 준공, 18층, 180세대, 고천동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "의왕 롯데캐슬",
            "address": "의왕시 오전동",
            "size": "75㎡",
            "price": "4억 1,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2020년 준공, 20층, 220세대, 오전동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "의왕 신도시 아파트",
            "address": "의왕시 청계동",
            "size": "80㎡",
            "price": "4억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2021년 준공, 22층, 250세대, 청계동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"5억~10억": {
  "houses": [
    {
            "name": "의왕 푸르지오",
            "address": "의왕시 내손동",
            "size": "100㎡",
            "price": "6억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2021년 준공, 25층, 300세대, 내손동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "의왕 삼성래미안",
            "address": "의왕시 오봉동",
            "size": "120㎡",
            "price": "8억 3,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2020년 준공, 28층, 350세대, 오봉동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "의왕 한화 꿈에그린",
            "address": "의왕시 고천동",
            "size": "110㎡",
            "price": "9억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2021년 준공, 30층, 400세대, 고천동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"10억~15억": {
  "houses": [
    {
            "name": "의왕 한양수자인",
            "address": "의왕시 청계동",
            "size": "130㎡",
            "price": "12억 3,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 35층, 450세대, 청계동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "의왕 현대아이파크",
            "address": "의왕시 오전동",
            "size": "140㎡",
            "price": "13억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 40층, 500세대, 오전동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "의왕 자이",
            "address": "의왕시 고천동",
            "size": "150㎡",
            "price": "14억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 45층, 600세대, 고천동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"15억~20억": {
  "houses": [
    {
            "name": "의왕 롯데캐슬 레이크뷰",
            "address": "의왕시 청계동",
            "size": "160㎡",
            "price": "16억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 50층, 650세대, 청계동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "의왕 더블타워",
            "address": "의왕시 내손동",
            "size": "170㎡",
            "price": "17억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 55층, 700세대, 내손동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "의왕 트리플타워",
            "address": "의왕시 고천동",
            "size": "180㎡",
            "price": "19억 4,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2025년 준공 예정, 60층, 750세대, 고천동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"20억 이상": {
  "houses": [
{
            "name": "의왕 아이비타워",
            "address": "의왕시 오전동",
            "size": "200㎡",
            "price": "22억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 65층, 800세대, 오전동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "의왕 더블크레스트",
            "address": "의왕시 내손동",
            "size": "220㎡",
            "price": "24억 3,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2025년 준공 예정, 70층, 900세대, 내손동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "의왕 그랜드힐스",
            "address": "의왕시 고천동",
            "size": "240㎡",
            "price": "26억 7,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2026년 준공 예정, 75층, 1,000세대, 고천동 중심, 교통·생활편의시설 인접"
        }
  ]
}
},

"경기도 하남시":{
"~2억":{
  "houses": [
    {
            "name": "하남 미사역 한양수자인",
            "address": "하남시 미사동",
            "size": "50㎡",
            "price": "1억 8,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2015년 준공, 10층, 120세대, 미사역 인근, 교통·생활편의시설 인접"
        },
        {
            "name": "하남 아이파크",
            "address": "하남시 선동",
            "size": "55㎡",
            "price": "1억 9,200만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2016년 준공, 12층, 150세대, 선동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "하남 그린빌",
            "address": "하남시 감일동",
            "size": "45㎡",
            "price": "1억 7,800만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2017년 준공, 8층, 100세대, 감일동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"2억~5억": {
  "houses": [
    {
            "name": "하남 미사역 롯데캐슬",
            "address": "하남시 미사동",
            "size": "70㎡",
            "price": "3억 4,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2018년 준공, 18층, 250세대, 미사역 인근, 교통·생활편의시설 인접"
        },
        {
            "name": "하남 푸르지오",
            "address": "하남시 창우동",
            "size": "80㎡",
            "price": "4억 1,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2019년 준공, 20층, 300세대, 창우동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "하남 리버파크 한양수자인",
            "address": "하남시 초이동",
            "size": "75㎡",
            "price": "4억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2020년 준공, 22층, 350세대, 초이동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"5억~10억": {
  "houses": [
    {
            "name": "하남 미사역 자이",
            "address": "하남시 미사동",
            "size": "100㎡",
            "price": "6억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2020년 준공, 25층, 400세대, 미사역 인근, 교통·생활편의시설 인접"
        },
        {
            "name": "하남 스타필드 한화꿈에그린",
            "address": "하남시 덕풍동",
            "size": "120㎡",
            "price": "7억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2021년 준공, 28층, 450세대, 스타필드 인근, 교통·생활편의시설 인접"
        },
        {
            "name": "하남 평촌 아이파크",
            "address": "하남시 평촌동",
            "size": "110㎡",
            "price": "8억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2021년 준공, 30층, 500세대, 평촌동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"10억~15억": {
  "houses": [
    {
            "name": "하남 미사역 더샵",
            "address": "하남시 미사동",
            "size": "130㎡",
            "price": "12억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 35층, 600세대, 미사역 인근, 교통·생활편의시설 인접"
        },
        {
            "name": "하남 힐스테이트",
            "address": "하남시 창우동",
            "size": "140㎡",
            "price": "13억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 38층, 650세대, 창우동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "하남 한양수자인 자이",
            "address": "하남시 덕풍동",
            "size": "150㎡",
            "price": "14억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 40층, 700세대, 덕풍동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"15억~20억": {
  "houses": [
    {
            "name": "하남 리버파크 더샵",
            "address": "하남시 초이동",
            "size": "160㎡",
            "price": "16억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 45층, 750세대, 초이동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "하남 자이프리미어",
            "address": "하남시 덕풍동",
            "size": "170㎡",
            "price": "17억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 50층, 800세대, 덕풍동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "하남 미사역 더블타워",
            "address": "하남시 미사동",
            "size": "180㎡",
            "price": "19억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2025년 준공 예정, 55층, 900세대, 미사역 인근, 교통·생활편의시설 인접"
        }
  ]
},
"20억 이상": {
  "houses": [
          { "name": "하남 힐스테이트 레이크뷰",
            "address": "하남시 미사동",
            "size": "200㎡",
            "price": "22억 3,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 60층, 1,000세대, 미사동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "하남 그랜드파크 타워",
            "address": "하남시 덕풍동",
            "size": "220㎡",
            "price": "24억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2025년 준공 예정, 65층, 1,100세대, 덕풍동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "하남 더블트리 호텔타워",
            "address": "하남시 미사동",
            "size": "250㎡",
            "price": "28억 7,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2026년 준공 예정, 70층, 1,200세대, 미사동 중심, 교통·생활편의시설 인접"
        }
  ]
}
},

"경기도 여주시":{
"~2억":{
  "houses": [
    {
            "name": "여주 한양수자인",
            "address": "여주시 여흥동",
            "size": "50㎡",
            "price": "1억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2015년 준공, 10층, 120세대, 여흥동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "여주 푸르지오",
            "address": "여주시 점동",
            "size": "55㎡",
            "price": "1억 8,200만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2016년 준공, 12층, 150세대, 점동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "여주 힐스테이트",
            "address": "여주시 연라동",
            "size": "60㎡",
            "price": "1억 7,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2017년 준공, 8층, 100세대, 연라동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"2억~5억": {
  "houses": [
    {
            "name": "여주 자이",
            "address": "여주시 오학동",
            "size": "75㎡",
            "price": "3억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2018년 준공, 18층, 250세대, 오학동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "여주 롯데캐슬",
            "address": "여주시 금사면",
            "size": "80㎡",
            "price": "4억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2019년 준공, 20층, 300세대, 금사면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "여주 평화빌라",
            "address": "여주시 중앙동",
            "size": "85㎡",
            "price": "4억 4,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2020년 준공, 22층, 350세대, 중앙동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"5억~10억": {
  "houses": [
    {
            "name": "여주 미사역 아이파크",
            "address": "여주시 여흥동",
            "size": "100㎡",
            "price": "6억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2021년 준공, 25층, 400세대, 여흥동 인근, 교통·생활편의시설 인접"
        },
        {
            "name": "여주 그린힐즈",
            "address": "여주시 대신면",
            "size": "110㎡",
            "price": "7억 1,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 28층, 450세대, 대신면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "여주 리버파크",
            "address": "여주시 북내면",
            "size": "120㎡",
            "price": "8억 2,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 30층, 500세대, 북내면 중심, 교통·생활편의시설 인접"
        }
  ]
},
"10억~15억": {
  "houses": [
     {
            "name": "여주 자이프리미어",
            "address": "여주시 점동",
            "size": "130㎡",
            "price": "12억 3,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 35층, 600세대, 점동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "여주 더샵",
            "address": "여주시 여흥동",
            "size": "140㎡",
            "price": "13억 7,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 38층, 650세대, 여흥동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "여주 스타필드 자이",
            "address": "여주시 연라동",
            "size": "150㎡",
            "price": "14억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 40층, 700세대, 연라동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"15억~20억": {
  "houses": [
    {
            "name": "여주 힐스테이트 레이크뷰",
            "address": "여주시 오학동",
            "size": "160㎡",
            "price": "16억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 45층, 750세대, 오학동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "여주 미사리 리버파크",
            "address": "여주시 미사리",
            "size": "170㎡",
            "price": "18억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2025년 준공 예정, 50층, 800세대, 미사리 인근, 교통·생활편의시설 인접"
        },
        {
            "name": "여주 푸른숲 타운하우스",
            "address": "여주시 여흥동",
            "size": "180㎡",
            "price": "19억 7,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2025년 준공 예정, 55층, 850세대, 여흥동 중심, 교통·생활편의시설 인접"
        }
  ]
},
"20억 이상": {
  "houses": [
     {
            "name": "여주 레이크파크 리버뷰",
            "address": "여주시 금사면",
            "size": "200㎡",
            "price": "22억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2026년 준공 예정, 60층, 1,000세대, 금사면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "여주 그랜드 파크 타워",
            "address": "여주시 오학동",
            "size": "220㎡",
            "price": "24억 3,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2027년 준공 예정, 65층, 1,100세대, 오학동 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "여주 레이크뷰 타운하우스",
            "address": "여주시 여흥동",
            "size": "250㎡",
            "price": "28억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2028년 준공 예정, 70층, 1,200세대, 여흥동 중심, 교통·생활편의시설 인접"
        }
  ]
}
},

"경기도 양평시":{
"~2억":{
  "houses": [
    {
            "name": "양평 한양수자인",
            "address": "양평시 양서면",
            "size": "60㎡",
            "price": "1억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2014년 준공, 8층, 120세대, 양서면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "양평 푸르지오",
            "address": "양평시 서종면",
            "size": "65㎡",
            "price": "1억 5,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2015년 준공, 10층, 150세대, 서종면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "양평 힐스테이트",
            "address": "양평시 양평읍",
            "size": "70㎡",
            "price": "1억 9,200만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2016년 준공, 12층, 180세대, 양평읍 중심, 교통·생활편의시설 인접"
        }
  ]
},
"2억~5억": {
  "houses": [
    {
            "name": "양평 자이",
            "address": "양평시 용문면",
            "size": "80㎡",
            "price": "3억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2017년 준공, 15층, 200세대, 용문면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "양평 롯데캐슬",
            "address": "양평시 서종면",
            "size": "85㎡",
            "price": "4억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2018년 준공, 18층, 250세대, 서종면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "양평 평화빌라",
            "address": "양평시 양평읍",
            "size": "90㎡",
            "price": "4억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2019년 준공, 20층, 300세대, 양평읍 중심, 교통·생활편의시설 인접"
        }
  ]
},
"5억~10억": {
  "houses": [
     {
            "name": "양평 미사역 아이파크",
            "address": "양평시 양서면",
            "size": "100㎡",
            "price": "6억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2020년 준공, 22층, 400세대, 양서면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "양평 그린힐즈",
            "address": "양평시 서종면",
            "size": "110㎡",
            "price": "7억 1,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2021년 준공, 25층, 450세대, 서종면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "양평 리버파크",
            "address": "양평시 양평읍",
            "size": "120㎡",
            "price": "8억 3,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 28층, 500세대, 양평읍 중심, 교통·생활편의시설 인접"
        }
  ]
},
"10억~15억": {
  "houses": [
     {
            "name": "양평 자이프리미어",
            "address": "양평시 서종면",
            "size": "130㎡",
            "price": "12억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 30층, 600세대, 서종면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "양평 더샵",
            "address": "양평시 양서면",
            "size": "140㎡",
            "price": "13억 7,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 35층, 650세대, 양서면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "양평 스타필드 자이",
            "address": "양평시 양평읍",
            "size": "150㎡",
            "price": "14억 9,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 40층, 700세대, 양평읍 중심, 교통·생활편의시설 인접"
        }
  ]
},
"15억~20억": {
  "houses": [
     {
            "name": "양평 힐스테이트 레이크뷰",
            "address": "양평시 서종면",
            "size": "160㎡",
            "price": "16억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 45층, 750세대, 서종면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "양평 미사리 리버파크",
            "address": "양평시 용문면",
            "size": "170㎡",
            "price": "18억 3,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2025년 준공 예정, 50층, 800세대, 용문면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "양평 푸른숲 타운하우스",
            "address": "양평시 양서면",
            "size": "180㎡",
            "price": "19억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2025년 준공 예정, 55층, 850세대, 양서면 중심, 교통·생활편의시설 인접"
        }
  ]
},
"20억 이상": {
  "houses": [
    {
            "name": "양평 레이크파크 리버뷰",
            "address": "양평시 서종면",
            "size": "200㎡",
            "price": "22억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2026년 준공 예정, 60층, 1,000세대, 서종면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "양평 그랜드 파크 타워",
            "address": "양평시 양서면",
            "size": "220㎡",
            "price": "24억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2027년 준공 예정, 65층, 1,100세대, 양서면 중심, 교통·생활편의시설 인접"
        },
        {
            "name": "양평 레이크뷰 타운하우스",
            "address": "양평시 양평읍",
            "size": "250㎡",
            "price": "28억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2028년 준공 예정, 70층, 1,200세대, 양평읍 중심, 교통·생활편의시설 인접"
        }
  ]
}
},

"경기도 동두천시":{
"~2억":{
  "houses": [
    {
            "name": "동두천 시티타워",
            "address": "동두천시 중앙로",
            "size": "50㎡",
            "price": "1억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2008년 준공, 7층, 100세대, 동두천시 중심, 교통 및 생활편의시설 인접"
        },
        {
            "name": "동두천 한화꿈에그린",
            "address": "동두천시 지행동",
            "size": "55㎡",
            "price": "1억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2010년 준공, 10층, 150세대, 지행역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "동두천 우성빌라",
            "address": "동두천시 송내동",
            "size": "60㎡",
            "price": "1억 9,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2015년 준공, 8층, 120세대, 동두천시 내, 교통 및 생활편의시설 인접"
        }
  ]
},
"2억~5억": {
  "houses": [
    {
            "name": "동두천 더샵",
            "address": "동두천시 송내동",
            "size": "70㎡",
            "price": "3억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2017년 준공, 12층, 180세대, 송내역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "동두천 롯데캐슬",
            "address": "동두천시 지행동",
            "size": "75㎡",
            "price": "4억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2018년 준공, 15층, 250세대, 지행동 중심, 교통 및 생활편의시설 인접"
        },
        {
            "name": "동두천 리버파크",
            "address": "동두천시 중앙로",
            "size": "80㎡",
            "price": "4억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2020년 준공, 18층, 300세대, 동두천시 중심, 교통 및 생활편의시설 인접"
        }
  ]
},
"5억~10억": {
  "houses": [
    {
            "name": "동두천 엘리시안",
            "address": "동두천시 송내동",
            "size": "90㎡",
            "price": "6억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2021년 준공, 20층, 400세대, 송내동 중심, 교통 및 생활편의시설 인접"
        },
        {
            "name": "동두천 미사역 푸르지오",
            "address": "동두천시 지행동",
            "size": "100㎡",
            "price": "7억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 25층, 500세대, 지행역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "동두천 시그니처",
            "address": "동두천시 중앙로",
            "size": "120㎡",
            "price": "8억 3,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 30층, 600세대, 동두천시 중심, 교통 및 생활편의시설 인접"
        }
  ]
},
"10억~15억": {
  "houses": [
     {
            "name": "동두천 마리나타운",
            "address": "동두천시 송내동",
            "size": "130㎡",
            "price": "12억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 35층, 700세대, 송내동 중심, 교통 및 생활편의시설 인접"
        },
        {
            "name": "동두천 힐스테이트",
            "address": "동두천시 중앙로",
            "size": "140㎡",
            "price": "13억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2025년 준공, 40층, 750세대, 동두천시 중심, 교통 및 생활편의시설 인접"
        },
        {
            "name": "동두천 리버팰리스",
            "address": "동두천시 지행동",
            "size": "150㎡",
            "price": "14억 9,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2026년 준공, 45층, 800세대, 지행동 중심, 교통 및 생활편의시설 인접"
        }
  ]
},
"15억~20억": {
  "houses": [
    {
            "name": "동두천 그랜드파크",
            "address": "동두천시 송내동",
            "size": "160㎡",
            "price": "16억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2027년 준공 예정, 50층, 850세대, 송내동 중심, 교통 및 생활편의시설 인접"
        },
        {
            "name": "동두천 힐스테이트 레이크뷰",
            "address": "동두천시 중앙로",
            "size": "170㎡",
            "price": "17억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2028년 준공 예정, 55층, 900세대, 동두천시 중심, 교통 및 생활편의시설 인접"
        },
        {
            "name": "동두천 파크타워",
            "address": "동두천시 지행동",
            "size": "180㎡",
            "price": "18억 3,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2029년 준공 예정, 60층, 950세대, 지행동 중심, 교통 및 생활편의시설 인접"
        }
  ]
},
"20억 이상": {
  "houses": [
    {
            "name": "동두천 레이크파크",
            "address": "동두천시 송내동",
            "size": "200㎡",
            "price": "22억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2030년 준공 예정, 65층, 1,000세대, 송내동 중심, 교통 및 생활편의시설 인접"
        },
        {
            "name": "동두천 엘리시온타워",
            "address": "동두천시 중앙로",
            "size": "220㎡",
            "price": "23억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2031년 준공 예정, 70층, 1,100세대, 동두천시 중심, 교통 및 생활편의시설 인접"
        },
        {
            "name": "동두천 그랜드리버",
            "address": "동두천시 지행동",
            "size": "250㎡",
            "price": "28억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2032년 준공 예정, 75층, 1,200세대, 지행동 중심, 교통 및 생활편의시설 인접"
        }
  ]
}
},

"경기도 과천시":{
"~2억":{
  "houses": [
    {
            "name": "과천 그린빌",
            "address": "과천시 중앙로",
            "size": "45㎡",
            "price": "1억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2005년 준공, 6층, 80세대, 과천시 중심, 교통 및 생활편의시설 인접"
        },
        {
            "name": "과천 현대빌라",
            "address": "과천시 문원동",
            "size": "50㎡",
            "price": "1억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2010년 준공, 8층, 100세대, 문원역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "과천 한빛타운",
            "address": "과천시 과천동",
            "size": "55㎡",
            "price": "1억 9,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2012년 준공, 10층, 120세대, 과천역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"2억~5억": {
  "houses": [
    {
            "name": "과천 자이",
            "address": "과천시 원문동",
            "size": "60㎡",
            "price": "2억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2015년 준공, 12층, 200세대, 원문역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "과천 힐스테이트",
            "address": "과천시 과천동",
            "size": "70㎡",
            "price": "3억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2018년 준공, 15층, 250세대, 과천시 중심, 교통 및 생활편의시설 인접"
        },
        {
            "name": "과천 엘리시티",
            "address": "과천시 문원동",
            "size": "75㎡",
            "price": "4억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2020년 준공, 20층, 300세대, 문원역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"5억~10억": {
  "houses": [
    {
            "name": "과천 래미안",
            "address": "과천시 중앙로",
            "size": "80㎡",
            "price": "5억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 25층, 350세대, 과천시 중심, 교통 및 생활편의시설 인접"
        },
        {
            "name": "과천 푸르지오",
            "address": "과천시 과천동",
            "size": "90㎡",
            "price": "7억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 30층, 400세대, 과천역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "과천 아이파크",
            "address": "과천시 문원동",
            "size": "100㎡",
            "price": "8억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 35층, 450세대, 문원역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"10억~15억": {
  "houses": [
    {
            "name": "과천 더샵",
            "address": "과천시 원문동",
            "size": "110㎡",
            "price": "11억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2025년 준공 예정, 40층, 500세대, 원문역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "과천 롯데캐슬",
            "address": "과천시 과천동",
            "size": "120㎡",
            "price": "13억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2026년 준공 예정, 45층, 600세대, 과천역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "과천 시그니처",
            "address": "과천시 문원동",
            "size": "130㎡",
            "price": "14억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2027년 준공 예정, 50층, 650세대, 문원역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"15억~20억": {
  "houses": [
    {
            "name": "과천 엘리시안타워",
            "address": "과천시 중앙로",
            "size": "140㎡",
            "price": "16억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2028년 준공 예정, 55층, 700세대, 과천시 중심, 교통 및 생활편의시설 인접"
        },
        {
            "name": "과천 파크뷰",
            "address": "과천시 과천동",
            "size": "150㎡",
            "price": "17억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2029년 준공 예정, 60층, 750세대, 과천역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "과천 트리플타워",
            "address": "과천시 문원동",
            "size": "160㎡",
            "price": "19억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2030년 준공 예정, 65층, 800세대, 문원역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"20억 이상": {
  "houses": [
    {
            "name": "과천 레이크타운",
            "address": "과천시 원문동",
            "size": "180㎡",
            "price": "22억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2031년 준공 예정, 70층, 850세대, 원문역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "과천 그랜드뷰",
            "address": "과천시 과천동",
            "size": "200㎡",
            "price": "23억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2032년 준공 예정, 75층, 900세대, 과천시 중심, 교통 및 생활편의시설 인접"
        },
        {
            "name": "과천 파르세나",
            "address": "과천시 문원동",
            "size": "220㎡",
            "price": "25억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2033년 준공 예정, 80층, 1,000세대, 문원역 인근, 교통 및 생활편의시설 인접"
        }
  ]
}
},

"경기도 구리시":{
"~2억":{
  "houses": [
    {
            "name": "구리 현대빌라",
            "address": "구리시 인창동",
            "size": "45㎡",
            "price": "1억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2007년 준공, 5층, 50세대, 인창역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "구리 한양아파트",
            "address": "구리시 수택동",
            "size": "50㎡",
            "price": "1억 9,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2009년 준공, 7층, 80세대, 수택역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "구리 삼익아파트",
            "address": "구리시 교문동",
            "size": "55㎡",
            "price": "1억 7,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2010년 준공, 8층, 100세대, 교문역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"2억~5억": {
  "houses": [
    {
            "name": "구리 푸르지오",
            "address": "구리시 수택동",
            "size": "65㎡",
            "price": "2억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2012년 준공, 12층, 150세대, 수택역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "구리 현대아이파크",
            "address": "구리시 교문동",
            "size": "75㎡",
            "price": "3억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2015년 준공, 15층, 200세대, 교문역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "구리 엘리시티",
            "address": "구리시 인창동",
            "size": "80㎡",
            "price": "4억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2018년 준공, 20층, 250세대, 인창역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"5억~10억": {
  "houses": [
    {
            "name": "구리 자이",
            "address": "구리시 수택동",
            "size": "90㎡",
            "price": "5억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2020년 준공, 22층, 300세대, 수택역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "구리 대림아파트",
            "address": "구리시 교문동",
            "size": "100㎡",
            "price": "7억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2021년 준공, 25층, 350세대, 교문역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "구리 롯데캐슬",
            "address": "구리시 인창동",
            "size": "110㎡",
            "price": "8억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 30층, 400세대, 인창역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"10억~15억": {
  "houses": [
    {
            "name": "구리 더샵",
            "address": "구리시 수택동",
            "size": "120㎡",
            "price": "12억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 35층, 450세대, 수택역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "구리 엘리시안타워",
            "address": "구리시 교문동",
            "size": "130㎡",
            "price": "13억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 40층, 500세대, 교문역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "구리 아이파크",
            "address": "구리시 인창동",
            "size": "140㎡",
            "price": "14억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2025년 준공, 45층, 550세대, 인창역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"15억~20억": {
  "houses": [
    {
            "name": "구리 파크뷰",
            "address": "구리시 수택동",
            "size": "150㎡",
            "price": "16억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2026년 준공, 50층, 600세대, 수택역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "구리 트리플타워",
            "address": "구리시 교문동",
            "size": "160㎡",
            "price": "17억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2027년 준공, 55층, 650세대, 교문역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "구리 그랜드뷰",
            "address": "구리시 인창동",
            "size": "170㎡",
            "price": "18억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2028년 준공, 60층, 700세대, 인창역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"20억 이상": {
  "houses": [
    {
            "name": "구리 레이크타운",
            "address": "구리시 수택동",
            "size": "180㎡",
            "price": "22억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2029년 준공, 65층, 750세대, 수택역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "구리 그랜드힐스",
            "address": "구리시 교문동",
            "size": "200㎡",
            "price": "23억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2030년 준공, 70층, 800세대, 교문역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "구리 파르세나",
            "address": "구리시 인창동",
            "size": "220㎡",
            "price": "25억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2031년 준공, 75층, 850세대, 인창역 인근, 교통 및 생활편의시설 인접"
        }
  ]
}
},

"경기도 포천시":{
"~2억":{
  "houses": [
    {
            "name": "포천 행복타운",
            "address": "포천시 포천동",
            "size": "45㎡",
            "price": "1억 6,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2005년 준공, 4층, 30세대, 포천역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "포천 마을하우스",
            "address": "포천시 송우동",
            "size": "50㎡",
            "price": "1억 7,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2008년 준공, 5층, 40세대, 송우역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "포천 넥스트하우스",
            "address": "포천시 신읍동",
            "size": "55㎡",
            "price": "1억 9,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2010년 준공, 6층, 50세대, 신읍역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"2억~5억": {
  "houses": [
    {
            "name": "포천 대림아파트",
            "address": "포천시 포천동",
            "size": "65㎡",
            "price": "2억 4,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2012년 준공, 8층, 70세대, 포천역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "포천 삼성아이파크",
            "address": "포천시 송우동",
            "size": "75㎡",
            "price": "3억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2015년 준공, 9층, 100세대, 송우역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "포천 힐스테이트",
            "address": "포천시 신읍동",
            "size": "80㎡",
            "price": "4억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2018년 준공, 10층, 120세대, 신읍역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"5억~10억": {
  "houses": [
    {
            "name": "포천 더샵",
            "address": "포천시 포천동",
            "size": "90㎡",
            "price": "5억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2020년 준공, 12층, 150세대, 포천역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "포천 센트럴파크",
            "address": "포천시 송우동",
            "size": "100㎡",
            "price": "7억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2021년 준공, 15층, 200세대, 송우역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "포천 롯데캐슬",
            "address": "포천시 신읍동",
            "size": "110㎡",
            "price": "8억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 20층, 250세대, 신읍역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"10억~15억": {
  "houses": [
    {
            "name": "포천 트리플타워",
            "address": "포천시 포천동",
            "size": "120㎡",
            "price": "12억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 25층, 300세대, 포천역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "포천 그랜드뷰",
            "address": "포천시 송우동",
            "size": "130㎡",
            "price": "13억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 30층, 350세대, 송우역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "포천 파크뷰",
            "address": "포천시 신읍동",
            "size": "140㎡",
            "price": "14억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2025년 준공, 35층, 400세대, 신읍역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"15억~20억": {
  "houses": [
    {
            "name": "포천 레이크타운",
            "address": "포천시 포천동",
            "size": "150㎡",
            "price": "16억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2026년 준공, 40층, 450세대, 포천역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "포천 그랜드힐스",
            "address": "포천시 송우동",
            "size": "160㎡",
            "price": "17억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2027년 준공, 45층, 500세대, 송우역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "포천 타워뷰",
            "address": "포천시 신읍동",
            "size": "170㎡",
            "price": "19억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2028년 준공, 50층, 550세대, 신읍역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"20억 이상": {
  "houses": [
    {
            "name": "포천 하이클래스",
            "address": "포천시 포천동",
            "size": "180㎡",
            "price": "22억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2029년 준공, 55층, 600세대, 포천역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "포천 플래티넘타워",
            "address": "포천시 송우동",
            "size": "200㎡",
            "price": "23억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2030년 준공, 60층, 650세대, 송우역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "포천 골드타워",
            "address": "포천시 신읍동",
            "size": "220㎡",
            "price": "25억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2031년 준공, 65층, 700세대, 신읍역 인근, 교통 및 생활편의시설 인접"
        }
  ]
}
},

"경기도 가평군":{
"~2억":{
  "houses": [
    {
            "name": "가평 한울타운",
            "address": "가평군 가평읍",
            "size": "45㎡",
            "price": "1억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2005년 준공, 4층, 30세대, 가평역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "가평 그린하우스",
            "address": "가평군 설악면",
            "size": "50㎡",
            "price": "1억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2007년 준공, 5층, 40세대, 설악역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "가평 힐하우스",
            "address": "가평군 가평읍",
            "size": "55㎡",
            "price": "1억 9,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2009년 준공, 6층, 50세대, 가평역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"2억~5억": {
  "houses": [
    {
            "name": "가평 더윙",
            "address": "가평군 가평읍",
            "size": "65㎡",
            "price": "2억 4,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2012년 준공, 7층, 70세대, 가평역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "가평 베르하우스",
            "address": "가평군 설악면",
            "size": "75㎡",
            "price": "3억 1,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2014년 준공, 8층, 100세대, 설악역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "가평 롯데캐슬",
            "address": "가평군 가평읍",
            "size": "80㎡",
            "price": "4억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2016년 준공, 10층, 120세대, 가평역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"5억~10억": {
  "houses": [
    {
            "name": "가평 썬프라자",
            "address": "가평군 가평읍",
            "size": "90㎡",
            "price": "5억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2018년 준공, 12층, 150세대, 가평역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "가평 그랜드파크",
            "address": "가평군 설악면",
            "size": "100㎡",
            "price": "7억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2020년 준공, 15층, 200세대, 설악역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "가평 헤리티지",
            "address": "가평군 가평읍",
            "size": "110㎡",
            "price": "8억 3,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2021년 준공, 18층, 250세대, 가평역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"10억~15억": {
  "houses": [
    {
            "name": "가평 더스타",
            "address": "가평군 가평읍",
            "size": "120㎡",
            "price": "11억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 20층, 300세대, 가평역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "가평 하이랜드",
            "address": "가평군 설악면",
            "size": "130㎡",
            "price": "13억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 25층, 350세대, 설악역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "가평 푸르지오",
            "address": "가평군 가평읍",
            "size": "140㎡",
            "price": "14억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 30층, 400세대, 가평역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"15억~20억": {
  "houses": [
    {
            "name": "가평 리버뷰",
            "address": "가평군 가평읍",
            "size": "150㎡",
            "price": "16억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2025년 준공, 35층, 450세대, 가평역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "가평 힐스테이트",
            "address": "가평군 설악면",
            "size": "160㎡",
            "price": "17억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2026년 준공, 40층, 500세대, 설악역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "가평 에덴타운",
            "address": "가평군 가평읍",
            "size": "170㎡",
            "price": "19억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2027년 준공, 45층, 550세대, 가평역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"20억 이상": {
  "houses": [
    {
            "name": "가평 에코팰리스",
            "address": "가평군 가평읍",
            "size": "180㎡",
            "price": "22억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2028년 준공, 50층, 600세대, 가평역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "가평 퍼스트타워",
            "address": "가평군 설악면",
            "size": "200㎡",
            "price": "23억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2029년 준공, 55층, 650세대, 설악역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "가평 트라이엄프",
            "address": "가평군 가평읍",
            "size": "220㎡",
            "price": "25억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2030년 준공, 60층, 700세대, 가평역 인근, 교통 및 생활편의시설 인접"
        }
  ]
}
},

"경기도 양평군":{
"~2억":{
  "houses": [
    {
            "name": "양평 힐하우스 1",
            "address": "양평군 양평읍",
            "size": "45㎡",
            "price": "1억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2006년 준공, 5층, 30세대, 양평역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "양평 한울타운",
            "address": "양평군 서종면",
            "size": "50㎡",
            "price": "1억 9,200만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2007년 준공, 6층, 40세대, 서종역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "양평 그린하우스 1",
            "address": "양평군 강상면",
            "size": "55㎡",
            "price": "1억 9,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2009년 준공, 7층, 50세대, 강상역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"2억~5억": {
  "houses": [
    {
            "name": "양평 그랜드하우스",
            "address": "양평군 양평읍",
            "size": "65㎡",
            "price": "2억 3,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2011년 준공, 7층, 70세대, 양평역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "양평 선플라워",
            "address": "양평군 양서면",
            "size": "75㎡",
            "price": "3억 2,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2013년 준공, 8층, 80세대, 양서역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "양평 에코리버",
            "address": "양평군 용문면",
            "size": "85㎡",
            "price": "4억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2015년 준공, 10층, 100세대, 용문역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"5억~10억": {
  "houses": [
    {
            "name": "양평 리버뷰타운",
            "address": "양평군 양평읍",
            "size": "95㎡",
            "price": "5억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2016년 준공, 12층, 120세대, 양평역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "양평 더스타타운",
            "address": "양평군 양서면",
            "size": "105㎡",
            "price": "7억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2017년 준공, 15층, 150세대, 양서역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "양평 블루하우스",
            "address": "양평군 강상면",
            "size": "120㎡",
            "price": "8억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2018년 준공, 20층, 200세대, 강상역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"10억~15억": {
  "houses": [
    {
            "name": "양평 시그니처",
            "address": "양평군 양평읍",
            "size": "130㎡",
            "price": "11억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2020년 준공, 25층, 250세대, 양평역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "양평 파크뷰",
            "address": "양평군 양서면",
            "size": "140㎡",
            "price": "12억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2021년 준공, 30층, 300세대, 양서역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "양평 플래티넘타운",
            "address": "양평군 용문면",
            "size": "150㎡",
            "price": "14억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 35층, 350세대, 용문역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"15억~20억": {
  "houses": [
    {
            "name": "양평 에덴타운",
            "address": "양평군 양평읍",
            "size": "160㎡",
            "price": "16억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 40층, 400세대, 양평역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "양평 블랙스톤",
            "address": "양평군 양서면",
            "size": "170㎡",
            "price": "17억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 45층, 450세대, 양서역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "양평 포레스트",
            "address": "양평군 강상면",
            "size": "180㎡",
            "price": "19억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2025년 준공, 50층, 500세대, 강상역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"20억 이상": {
  "houses": [
    {
            "name": "양평 더푸르지오",
            "address": "양평군 양평읍",
            "size": "190㎡",
            "price": "22억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2026년 준공, 55층, 550세대, 양평역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "양평 블루오션",
            "address": "양평군 양서면",
            "size": "200㎡",
            "price": "23억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2027년 준공, 60층, 600세대, 양서역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "양평 리버사이드타운",
            "address": "양평군 강상면",
            "size": "210㎡",
            "price": "25억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2028년 준공, 65층, 650세대, 강상역 인근, 교통 및 생활편의시설 인접"
        }
  ]
}
},

"경기도 연천군":{
"~2억":{
  "houses": [
      {     "name": "연천 더힐하우스 1",
            "address": "연천군 연천읍",
            "size": "40㎡",
            "price": "1억 6,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2005년 준공, 4층, 20세대, 연천역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "연천 그린타운",
            "address": "연천군 청산면",
            "size": "45㎡",
            "price": "1억 8,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2007년 준공, 5층, 25세대, 청산역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "연천 하늘빛 아파트",
            "address": "연천군 연천읍",
            "size": "50㎡",
            "price": "1억 9,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2009년 준공, 6층, 30세대, 연천역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"2억~5억": {
  "houses": [
    {
            "name": "연천 라온하우스",
            "address": "연천군 전곡읍",
            "size": "60㎡",
            "price": "2억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2010년 준공, 7층, 50세대, 전곡역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "연천 브라운타운",
            "address": "연천군 미산면",
            "size": "70㎡",
            "price": "3억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2012년 준공, 8층, 60세대, 미산역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "연천 푸르지오 아파트",
            "address": "연천군 연천읍",
            "size": "80㎡",
            "price": "4억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2014년 준공, 10층, 100세대, 연천역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"5억~10억": {
  "houses": [
    {
            "name": "연천 엘리시안타운",
            "address": "연천군 연천읍",
            "size": "90㎡",
            "price": "5억 2,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2015년 준공, 12층, 120세대, 연천역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "연천 더샤인 아파트",
            "address": "연천군 왕십리면",
            "size": "100㎡",
            "price": "6억 8,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2016년 준공, 15층, 150세대, 왕십리역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "연천 라이트하우스",
            "address": "연천군 연천읍",
            "size": "120㎡",
            "price": "8억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2017년 준공, 20층, 200세대, 연천역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"10억~15억": {
  "houses": [
    {
            "name": "연천 블루오션타운",
            "address": "연천군 전곡읍",
            "size": "130㎡",
            "price": "11억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2018년 준공, 25층, 250세대, 전곡역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "연천 파크뷰 아파트",
            "address": "연천군 연천읍",
            "size": "140㎡",
            "price": "12억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2019년 준공, 30층, 300세대, 연천역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "연천 엘리트하우스",
            "address": "연천군 미산면",
            "size": "150㎡",
            "price": "14억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2020년 준공, 35층, 350세대, 미산역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"15억~20억": {
  "houses": [
    {
            "name": "연천 엘리시움",
            "address": "연천군 연천읍",
            "size": "160㎡",
            "price": "16억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2021년 준공, 40층, 400세대, 연천역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "연천 그랜드타운",
            "address": "연천군 전곡읍",
            "size": "170㎡",
            "price": "18억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 45층, 450세대, 전곡역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "연천 타워팰리스",
            "address": "연천군 왕십리면",
            "size": "180㎡",
            "price": "19억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 50층, 500세대, 왕십리역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"20억 이상": {
  "houses": [
    {
            "name": "연천 포레스트리버",
            "address": "연천군 연천읍",
            "size": "190㎡",
            "price": "22억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 55층, 550세대, 연천역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "연천 블랙타워",
            "address": "연천군 청산면",
            "size": "200㎡",
            "price": "23억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2025년 준공, 60층, 600세대, 청산역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "연천 스카이팰리스",
            "address": "연천군 전곡읍",
            "size": "210㎡",
            "price": "25억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2026년 준공, 65층, 650세대, 전곡역 인근, 교통 및 생활편의시설 인접"
        }
  ]
}
},


"강원도 춘천시":{
"~2억":{
  "houses": [
    {
      "name": "현대2차",
      "address": "강원 춘천시 후평동 427",
      "size": "84.84㎡",
      "price": "1억 7,000만원 (24.12.19, 15층)",
      "infra": "중심지, 생활편의시설 인접"
    },
    {
      "name": "극동늘푸른",
      "address": "강원 춘천시 후평동",
      "size": "84.94㎡",
      "price": "1억 8,000만원 (24.09.13, 15층)",
      "infra": "중심지, 생활편의시설 인접"
    },
    {
      "name": "에리트아파트",
      "address": "강원 춘천시 후평동",
      "size": "82.85㎡",
      "price": "1억 7,000만원 (24.10.16, 3층)",
      "infra": "중심지, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "우미린뉴시티",
      "address": "강원 춘천시 후평동 912",
      "size": "84.99㎡",
      "price": "4억 9,000만원 (25.01.14, 15층)",
      "infra": "신축, 대단지, 생활편의시설 인접"
    },
    {
      "name": "춘천 더샵",
      "address": "강원 춘천시 후평동 904",
      "size": "59.92㎡",
      "price": "2억 7,500만원 (25.01.25, 23층)",
      "infra": "신축, 대단지, 생활편의시설 인접"
    },
    {
      "name": "동아",
      "address": "강원 춘천시 후평동 893",
      "size": "102㎡",
      "price": "1억 7,400만원 (25.01.16, 2층)",
      "infra": "중심지, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "온의 롯데캐슬 스카이클래스",
      "address": "강원 춘천시 온의동 590",
      "size": "99.62㎡",
      "price": "5억 9,800만원 (25.01.15, 34층)",
      "infra": "신축, 초고층, 생활편의시설 인접"
    },
    {
      "name": "롯데캐슬스카이클래스(대형)",
      "address": "강원 춘천시 온의동 590",
      "size": "154.14㎡",
      "price": "10억 9,000만원 (24.09.19, 22층)",
      "infra": "초고층, 펜트하우스, 생활편의시설 인접"
    },
    {
      "name": "센트럴타워푸르지오",
      "address": "강원 춘천시 온의동",
      "size": "99.86㎡",
      "price": "8억 7,000만원 (24.09.04, 22층)",
      "infra": "신축, 대단지, 생활편의시설 인접"
    }
  ]
},
"10억~15억": {
  "houses": [
    {
      "name": "롯데캐슬스카이클래스(펜트하우스)",
      "address": "강원 춘천시 온의동 590",
      "size": "154.14㎡",
      "price": "10억 9,000만원 (24.09.19, 22층)",
      "infra": "초고층, 펜트하우스, 생활편의시설 인접"
    }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"강원도 원주시":{
"~2억":{
  "houses": [
     {
      "name": "현대",
      "address": "강원 원주시 명륜동 205-37",
      "size": "127.13㎡",
      "price": "2억원 (25.01.15, 9층)",
      "infra": "중심지, 생활편의시설 인접"
    },
    {
      "name": "현진에버빌3차",
      "address": "강원 원주시 명륜동",
      "size": "85.1㎡",
      "price": "2억 2,000만원 (24.12.02, 11층)",
      "infra": "중심지, 생활편의시설 인접"
    },
    {
      "name": "성원",
      "address": "강원 원주시 명륜동",
      "size": "84.93㎡",
      "price": "2억 2,000만원 (24.10.09, 6층)",
      "infra": "중심지, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
     {
      "name": "더샵원주센트럴파크3단지",
      "address": "강원 원주시 명륜동",
      "size": "84.98㎡",
      "price": "4억 8,000만원 (24.11.23, 14층)",
      "infra": "신축, 대단지, 생활편의시설 인접"
    },
    {
      "name": "원주혁신도시힐데스하임5단지",
      "address": "강원 원주시 반곡동 1894-2",
      "size": "84.95㎡",
      "price": "4억 500만원 (25.01.22, 10층)",
      "infra": "신축, 대단지, 생활편의시설 인접"
    },
    {
      "name": "반곡아이파크",
      "address": "강원 원주시 반곡동 1805",
      "size": "84.98㎡",
      "price": "3억 2,500만원 (25.01.13, 10층)",
      "infra": "신축, 대단지, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "더샵원주센트럴파크2단지",
      "address": "강원 원주시 명륜동",
      "size": "101.96㎡",
      "price": "6억 2,000만원 (24.12.20, 28층)",
      "infra": "신축, 초고층, 대단지, 생활편의시설 인접"
    }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"강원도 강릉시":{
"~2억":{
  "houses": [
    {
      "name": "부영1차 아파트",
      "address": "강릉시 교동",
      "price": "1억",
      "size": "49.92㎡",
      "infra": "1999년 준공, 15층 건물 중 1층"
    },
    {
      "name": "교동주공3단지",
      "address": "강릉시 교동",
      "price": "1.5억",
      "size": "59.84㎡",
      "infra": "도보 5분 거리 초등학교 인접"
    },
    {
      "name": "하슬라빌",
      "address": "강릉시 교동",
      "price": "1.6억",
      "size": "84.93㎡",
      "infra": "즉시 입주 가능"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "유천선수촌8단지",
      "address": "강릉시 유천동",
      "price": "2.1억",
      "size": "74.88㎡",
      "infra": "선수촌로 위치"
    },
    {
      "name": "홍제한신휴플러스",
      "address": "강릉시 홍제동",
      "price": "2.2억",
      "size": "84.97㎡",
      "infra": "토성로 위치"
    },
    {
      "name": "홍제힐스테이트",
      "address": "강릉시 홍제동",
      "price": "2.7억",
      "size": "127.8㎡",
      "infra": "토성로 위치"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "입암동 강릉입암금호어울림",
      "address": "강릉시 입암동",
      "price": "5.25억",
      "size": "157㎡",
      "infra": "114동 3층, 자녀있는 가정에 적합"
    },
    {
      "name": "강릉아이파크",
      "address": "강릉시 송정동",
      "price": "6억",
      "size": "전용면적 기준",
      "infra": "2023년 준공, 평균 평당가 1,436만 원"
    },
    {
      "name": "교동 현대하이빌",
      "address": "강릉시 교동",
      "price": "5.6억",
      "size": "전용면적 기준",
      "infra": "평균 평당가 1,074만 원"
    }
  ]
},
"10억~15억": {
  "houses": [
    {
      "name": "초당옥 인근 단독주택",
      "address": "강릉시 초당동",
      "price": "10억",
      "size": "178㎡",
      "infra": "남향, 2층, 10년 이내 건축"
    },
    {
      "name": "강릉 영진리 상가주택",
      "address": "강릉시 연곡면 영진리",
      "price": "15억",
      "size": "상세 면적 미제공",
      "infra": "임대 보증금 6,900만 원, 월차임 488만 원"
    },
    {
      "name": "강릉시 교동 단독주택",
      "address": "강릉시 교동",
      "price": "2.8억",
      "size": "173㎡",
      "infra": "교동택지 내 위치"
    }
  ]
},
"15억~20억": {
  "houses": [
    {
      "name": "강릉시 포남동 단독주택",
      "address": "강릉시 포남동",
      "price": "5.9억",
      "size": "213㎡",
      "infra": "코너주택, 급매매"
    },
    {
      "name": "강릉시 사천면 석교리 단독주택",
      "address": "강릉시 사천면 석교리",
      "price": "5억",
      "size": "128.03㎡",
      "infra": "즉시 입주 가능"
    },
    {
      "name": "강릉시 연곡면 퇴곡리 전원주택",
      "address": "강릉시 연곡면 퇴곡리",
      "price": "3.2억",
      "size": "81.1㎡",
      "infra": "즉시 입주 가능"
    }
  ]
},
"20억 이상": {
  "houses": [
    {
      "name": "강릉시 연곡면 답",
      "address": "강릉시 연곡면",
      "price": "20.7억",
      "size": "16,188㎡",
      "infra": "대지면적 4,896.87평"
    },
    {
      "name": "강릉시 단독요양원",
      "address": "강릉시",
      "price": "17억",
      "size": "300㎡",
      "infra": "인가 26명, 시설 잘되어 있음"
    },
    {
      "name": "강릉시 주문진읍 단독주택",
      "address": "강릉시 주문진읍",
      "price": "2.8억",
      "size": "197.54㎡",
      "infra": "대지면적 831㎡"
    }
  ]
}
},

"강원도 동해시":{
"~2억":{
  "houses": [
    {
      "name": "동해하나리움",
      "address": "강원 동해시 평릉동 449",
      "size": "59.98㎡",
      "price": "1억 7,200만원 (25.01.06, 8층)",
      "infra": "2024년 9월~25년 1월 실거래, 신축, 평릉동 중심, 생활편의시설 인접"
    },
    {
      "name": "엘리시아",
      "address": "강원 동해시 평릉동 450",
      "size": "84.97㎡",
      "price": "1억 8,000만원~2억 4,500만원 (25.01.16, 1층)",
      "infra": "2024~2025년 실거래, 1~2층, 평릉동 중심, 생활편의시설 인접"
    },
    {
      "name": "동해푸르지오",
      "address": "강원 동해시 평릉동 293",
      "size": "69.76㎡",
      "price": "2억 1,000만원 (24.11.05, 7층)",
      "infra": "2024년 실거래, 평릉동 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "코아루디오션",
      "address": "강원 동해시 평릉동 456",
      "size": "84.97㎡",
      "price": "2억 8,500만원 (24.12.18, 1층)",
      "infra": "2024년 12월 실거래, 평릉동 중심, 생활편의시설 인접"
    },
    {
      "name": "천곡금호어울림라포레",
      "address": "강원 동해시 천곡동",
      "size": "85㎡",
      "price": "2억 8,000만원 (2024년 실거래, 2년차)",
      "infra": "신축, 천곡동 중심, 생활편의시설 인접"
    },
    {
      "name": "북삼2차웰메이드타운",
      "address": "강원 동해시 동회동",
      "size": "85㎡",
      "price": "2억 7,000만원 (2024년 실거래, 1년차)",
      "infra": "신축, 동회동 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"강원도 태백시":{
"~2억":{
  "houses": [
    {
      "name": "대산2차하이츠빌",
      "address": "강원 태백시 황지동 846",
      "size": "59.9㎡",
      "price": "1억 6,500만원 (24.04.05, 12층)",
      "infra": "2024년 4월 실거래, 황지동 중심, 생활편의시설 인접"
    },
    {
      "name": "중앙하이츠",
      "address": "강원 태백시 황지동 844",
      "size": "59.87㎡",
      "price": "1억 2,600만원 (24.05.17, 1층)",
      "infra": "2024년 5월 실거래, 황지동 중심, 생활편의시설 인접"
    },
    {
      "name": "유진아트빌2차",
      "address": "강원 태백시 황지동 200-13",
      "size": "59.69㎡",
      "price": "1억 2,300만원 (24.04.17, 1층)",
      "infra": "2024년 4월 실거래, 황지동 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "대산2차하이츠빌",
      "address": "강원 태백시 황지동 846",
      "size": "84.96㎡",
      "price": "2억 4,500만원 (24.03.14, 14층)",
      "infra": "2024년 3월 실거래, 황지동 중심, 생활편의시설 인접"
    },
    {
      "name": "중앙하이츠",
      "address": "강원 태백시 황지동 844",
      "size": "70.48㎡",
      "price": "2억 5,000만원 (24.04.15, 20층)",
      "infra": "2024년 4월 실거래, 황지동 중심, 생활편의시설 인접"
    },
    {
      "name": "이원예채",
      "address": "강원 태백시 황지동",
      "size": "85㎡",
      "price": "2억 1,000만원 (2024년 실거래, 11년차)",
      "infra": "황지동 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"강원도 속초시":{
"~2억":{
  "houses": [
    {
      "name": "교동로얄1차",
      "address": "강원 속초시 교동",
      "size": "59㎡",
      "price": "1억 미만 (2024년 실거래, 20년차 이상)",
      "infra": "교동 중심, 생활편의시설 인접"
    },
    {
      "name": "청대대명아파트",
      "address": "강원 속초시 청대마을길 10-3",
      "size": "59㎡",
      "price": "1억 미만 (2024년 실거래, 20년차 이상)",
      "infra": "청대 중심, 생활편의시설 인접"
    },
    {
      "name": "무궁화아파트",
      "address": "강원 속초시 영랑로 2길 11",
      "size": "59㎡",
      "price": "1억 미만 (2024년 실거래, 20년차 이상)",
      "infra": "영랑호 인근, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "골든렉시움",
      "address": "강원 속초시 교동",
      "size": "84.93㎡",
      "price": "2억 7,000만원 (25.01.15, 33평, 신축)",
      "infra": "신축, 교동 중심, 생활편의시설 인접"
    },
    {
      "name": "속초아이파크",
      "address": "강원 속초시 청호동 1356",
      "size": "84.94㎡",
      "price": "3억 7,000만원 (25.01.15, 19층)",
      "infra": "2024년 11월 실거래, 신축, 청호동 중심, 생활편의시설 인접"
    },
    {
      "name": "속초청호아이파크",
      "address": "강원 속초시 청호동",
      "size": "85㎡",
      "price": "3억 7,000만원 (2024년 실거래, 신축)",
      "infra": "신축, 청호동 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "속초아이파크",
      "address": "강원 속초시 청호동 1356",
      "size": "84.82㎡",
      "price": "7억원 (24.11.12, 26층)",
      "infra": "2024년 11월 실거래, 신축, 청호동 중심, 생활편의시설 인접"
    },
    {
      "name": "e편한세상영랑호",
      "address": "강원 속초시 동명동 596",
      "size": "114.78㎡",
      "price": "6억 3,000만원 (24.09.28, 22층)",
      "infra": "2024년 9월 실거래, 신축, 동명동 중심, 생활편의시설 인접"
    },
    {
      "name": "속초디오션자이",
      "address": "강원 속초시 조양동",
      "size": "84.97㎡",
      "price": "6억 1,000만원 (24.11.16, 25층)",
      "infra": "2024년 11월 실거래, 신축, 조양동 중심, 생활편의시설 인접"
    }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"강원도 삼척시":{
"~2억":{
  "houses": [
    {
      "name": "코아루플러스",
      "address": "강원 삼척시 건지동 176",
      "size": "59.82㎡",
      "price": "1억 9,500만원 (25.01.16, 5층)",
      "infra": "2025년 1월 실거래, 건지동 중심, 생활편의시설 인접[31]"
    },
    {
      "name": "현대",
      "address": "강원 삼척시 원당동 122-3",
      "size": "84.93㎡",
      "price": "1억 7,500만원 (24.12.30, 15층)",
      "infra": "2024년 12월 실거래, 원당동 중심, 생활편의시설 인접[31]"
    },
    {
      "name": "교동 코아루 아파트",
      "address": "강원 삼척시 교동 733-1",
      "size": "60㎡",
      "price": "9,000만원 (25.01.25, 3층)",
      "infra": "2025년 1월 실거래, 교동 중심, 생활편의시설 인접[31]"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "일성트루엘시그니처삼척",
      "address": "강원 삼척시 갈천동 227",
      "size": "84.6㎡",
      "price": "3억 4,700만원 (25.01.22, 4층)",
      "infra": "2025년 1월 실거래, 갈천동 중심, 생활편의시설 인접[31]"
    },
    {
      "name": "삼척센트럴두산위브",
      "address": "강원 삼척시 갈천동",
      "size": "84.55㎡",
      "price": "3억 2,000만원 (24.12.07, 33층)",
      "infra": "2024년 12월 실거래, 갈천동 중심, 생활편의시설 인접[31]"
    },
    {
      "name": "지웰라티움",
      "address": "강원 삼척시 갈천동",
      "size": "84.86㎡",
      "price": "3억원 (24.11.30, 7층)",
      "infra": "2024년 11월 실거래, 갈천동 중심, 생활편의시설 인접[31]"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},
"강원도 홍천군":{
"~2억":{
  "houses": [
    {
      "name": "현대아파트",
      "address": "강원 홍천군 홍천읍 연봉리",
      "size": "84㎡",
      "price": "1억 9,000만원 (24.10.03, 13층)",
      "infra": "2024년 10월 실거래, 연봉리 중심, 생활편의시설 인접[34][35]"
    },
    {
      "name": "미진동백",
      "address": "강원 홍천군 홍천읍 희망리",
      "size": "59.82㎡",
      "price": "9,300만원 (25.01.11, 11층)",
      "infra": "2025년 1월 실거래, 희망리 중심, 생활편의시설 인접[38]"
    },
    {
      "name": "삼호2차",
      "address": "강원 홍천군 홍천읍 하오안리",
      "size": "66㎡",
      "price": "7,700만원 (24.10.01, 14층)",
      "infra": "2024년 10월 실거래, 하오안리 중심, 생활편의시설 인접[38]"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "신성미소지음",
      "address": "강원 홍천군 홍천읍",
      "size": "85㎡",
      "price": "2억 5,000만원 (2024년 실거래, 11년차)",
      "infra": "홍천읍 중심, 생활편의시설 인접[34][40]"
    },
    {
      "name": "연봉아이파크",
      "address": "강원 홍천군 홍천읍",
      "size": "85㎡",
      "price": "2억 3,000만원 (2024년 실거래, 12년차)",
      "infra": "홍천읍 중심, 생활편의시설 인접[34]"
    },
    {
      "name": "더휴인아파트",
      "address": "강원 홍천군 홍천읍",
      "size": "82㎡",
      "price": "2억 2,000만원 (2024년 실거래, 2년차)",
      "infra": "홍천읍 중심, 생활편의시설 인접[34][40]"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"강원도 횡성군":{
"~2억":{
  "houses": [
    {
      "name": "횡성코아루센트럴퍼스트",
      "address": "강원 횡성군 횡성읍",
      "size": "60㎡",
      "price": "1억 9,000만원 (2024년 실거래, 2018년 준공)",
      "infra": "횡성읍 중심, 생활편의시설 인접[41][43]"
    },
    {
      "name": "금광포란채",
      "address": "강원 횡성군 횡성읍",
      "size": "71㎡",
      "price": "1억원 (2024년 실거래, 2001년 준공)",
      "infra": "횡성읍 중심, 생활편의시설 인접[41]"
    },
    {
      "name": "대동황토방",
      "address": "강원 횡성군 횡성읍",
      "size": "60㎡",
      "price": "9,000만원 (2024년 실거래, 1998년 준공)",
      "infra": "횡성읍 중심, 생활편의시설 인접[41]"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "횡성코아루센트럴퍼스트",
      "address": "강원 횡성군 횡성읍",
      "size": "85㎡",
      "price": "2억 5,000만원 (2024년 실거래, 2018년 준공)",
      "infra": "횡성읍 중심, 생활편의시설 인접[41][43]"
    },
    {
      "name": "횡성보람더하임",
      "address": "강원 횡성군 횡성읍",
      "size": "85㎡",
      "price": "1억 8,000만원 (2024년 실거래, 2007년 준공)",
      "infra": "횡성읍 중심, 생활편의시설 인접[41]"
    },
    {
      "name": "석미모닝파크",
      "address": "강원 횡성군 횡성읍",
      "size": "75㎡",
      "price": "1억 7,000만원 (2024년 실거래, 2013년 준공)",
      "infra": "횡성읍 중심, 생활편의시설 인접[41]"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"강원도 영월군":{
"~2억":{
  "houses": [
    {
      "name": "주공4",
      "address": "강원 영월군 영월읍",
      "size": "60㎡",
      "price": "1억 2,000만원(2025.03.19, 14층)",
      "infra": "구축, 중심지, 생활편의시설 인접"
    },
    {
      "name": "주공3",
      "address": "강원 영월군 영월읍",
      "size": "50㎡",
      "price": "7,000만원(2024년 실거래, 1998년 준공)",
      "infra": "구축, 중심지, 생활편의시설 인접"
    },
    {
      "name": "금용아파트",
      "address": "강원 영월군 영월읍 덕포리",
      "size": "51㎡",
      "price": "6,000만원(2024년 실거래, 1994년 준공)",
      "infra": "구축, 중심지, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "코아루에듀타운",
      "address": "강원 영월군 영월읍 영흥리 1137",
      "size": "84.4㎡",
      "price": "3억 500만원(2024.10.27, 17층)",
      "infra": "신축, 중심지, 생활편의시설 인접"
    },
    {
      "name": "영월LH천년나무",
      "address": "강원 영월군 영월읍 영흥리 931",
      "size": "59.94㎡",
      "price": "2억 6,000만원(2024.10.21, 18층)",
      "infra": "신축, 중심지, 생활편의시설 인접"
    },
    {
      "name": "코아루웰라움",
      "address": "강원 영월군 영월읍 덕포리",
      "size": "84.99㎡",
      "price": "2억 4,000만원(2024.12.09, 16층)",
      "infra": "신축, 중심지, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"강원도 평창군":{
"~2억":{
  "houses": [
    {
      "name": "봉평빅하우스",
      "address": "강원 평창군 봉평면 창동리",
      "size": "84.78㎡",
      "price": "1억 9,000만원(2024.05, 6층)",
      "infra": "구축, 봉평면 중심, 생활편의시설 인접"
    },
    {
      "name": "강산횡계",
      "address": "강원 평창군 대관령면 횡계리",
      "size": "91.05㎡",
      "price": "1억 7,000만원(2024.05, 9층)",
      "infra": "구축, 대관령면 중심, 생활편의시설 인접"
    },
    {
      "name": "동관노블카운티",
      "address": "강원 평창군 대관령면 횡계리",
      "size": "84.97㎡",
      "price": "1억 6,000만원(2024.05, 6층)",
      "infra": "구축, 대관령면 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "동계올림픽선수촌아파트",
      "address": "강원 평창군 대관령면 수하리 500",
      "size": "74.91㎡",
      "price": "4억 5,000만원(2024.05, 15층)",
      "infra": "신축, 대관령면, 올림픽특화, 생활편의시설 인접"
    },
    {
      "name": "알펜로제",
      "address": "강원 평창군 대관령면 횡계리",
      "size": "59.96㎡",
      "price": "2억 1,000만원(2024.05, 7층)",
      "infra": "신축, 대관령면 중심, 생활편의시설 인접"
    },
    {
      "name": "용평빌리지",
      "address": "강원 평창군 대관령면 용산리",
      "size": "84.29㎡",
      "price": "2억원(2024.06, 8층)",
      "infra": "구축, 대관령면 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "동계올림픽선수촌아파트(대형)",
      "address": "강원 평창군 대관령면 수하리 500",
      "size": "전용 84㎡",
      "price": "5.1억원(2024년 최근 1년 내 최고가)",
      "infra": "신축, 대관령면, 올림픽특화, 생활편의시설 인접"
    }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"강원도 정선군":{
"~2억":{
  "houses": [
    {
      "name": "파인앤유",
      "address": "강원 정선군 고한읍",
      "size": "59㎡",
      "price": "1억 4,000만원(2018년 준공, 최근 실거래가)",
      "infra": "신축, 고한읍 중심, 생활편의시설 인접"
    },
    {
      "name": "사북선명2차",
      "address": "강원 정선군 사북읍",
      "size": "60㎡",
      "price": "1억 2,000만원(2003년 준공, 최근 실거래가)",
      "infra": "사북읍 중심, 생활편의시설 인접"
    },
    {
      "name": "미소빌",
      "address": "강원 정선군 정선읍 북실리 746-6",
      "size": "49.2㎡",
      "price": "7,800만원(2024.05.30, 5층)",
      "infra": "정선읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "북실마루",
      "address": "강원 정선군 정선읍 북실리 745-1",
      "size": "85㎡",
      "price": "2억 5,000만원(2024.03.06, 9층)",
      "infra": "2012년 준공, 신축, 정선읍 중심, 생활편의시설 인접"
    },
    {
      "name": "현대",
      "address": "강원 정선군 정선읍 북실리 745-1",
      "size": "84.9㎡",
      "price": "2억 500만원(2024.04.11, 4층)",
      "infra": "정선읍 중심, 생활편의시설 인접"
    },
    {
      "name": "미소빌",
      "address": "강원 정선군 정선읍 북실리 746-6",
      "size": "59.7㎡",
      "price": "1억 1,900만원(2024.04.14, 4층)",
      "infra": "정선읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"강원도 철원군":{
"~2억":{
  "houses": [
    {
      "name": "산호그린빌",
      "address": "강원 철원군 철원읍",
      "size": "60㎡",
      "price": "1억원(2003년 준공, 최근 실거래가)",
      "infra": "철원읍 중심, 생활편의시설 인접"
    },
    {
      "name": "한국개나리",
      "address": "강원 철원군 동송읍",
      "size": "60㎡",
      "price": "7,000만원(1995년 준공, 최근 실거래가)",
      "infra": "동송읍 중심, 생활편의시설 인접"
    },
    {
      "name": "유명",
      "address": "강원 철원군 갈말읍",
      "size": "40㎡",
      "price": "3,000만원(1998년 준공, 최근 실거래가)",
      "infra": "갈말읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "금강아미움",
      "address": "강원 철원군 동송읍",
      "size": "85㎡",
      "price": "2억 5,000만원(2008년 준공, 최근 실거래가)",
      "infra": "동송읍 중심, 생활편의시설 인접"
    },
    {
      "name": "철원석미아데나퍼스티어",
      "address": "강원 철원군 동송읍 이평3로 105",
      "size": "84.99㎡",
      "price": "2억 4,000만원(2023~2024년 실거래가)",
      "infra": "신축, 동송읍 중심, 생활편의시설 인접"
    },
    {
      "name": "갈말읍 유명",
      "address": "강원 철원군 갈말읍",
      "size": "59㎡",
      "price": "1억~2억(1998년 준공, 최근 실거래가)",
      "infra": "갈말읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"강원도 화천군":{
"~2억":{
  "houses": [
    {
      "name": "낙원아파트",
      "address": "강원 화천군 화천읍 아리 205-7",
      "size": "59㎡",
      "price": "1억 5,000만원(1992년 준공, 최근 실거래가)",
      "infra": "화천읍 중심, 생활편의시설 인접"
    },
    {
      "name": "서면 신원",
      "address": "강원 화천군 서면",
      "size": "60㎡",
      "price": "1억 3,000만원(저층, 최근 실거래가)",
      "infra": "서면 중심, 생활편의시설 인접"
    },
    {
      "name": "하남면 화천대양고운채2차",
      "address": "강원 화천군 하남면",
      "size": "84.99㎡",
      "price": "2억 4,000만원(2025년 실거래가)",
      "infra": "하남면 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "하남면 화천대양고운채2차",
      "address": "강원 화천군 하남면",
      "size": "84.99㎡",
      "price": "2억 4,000만원(2025년 실거래가)",
      "infra": "하남면 중심, 생활편의시설 인접"
    },
    {
      "name": "화천읍 풍산리 단독주택",
      "address": "강원 화천군 화천읍",
      "size": "100㎡ 내외",
      "price": "2억~3억(최근 실거래가)",
      "infra": "화천읍 중심, 생활편의시설 인접"
    },
    {
      "name": "화천읍 단독주택",
      "address": "강원 화천군 화천읍",
      "size": "100㎡ 내외",
      "price": "2억~3억(최근 실거래가)",
      "infra": "화천읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"강원도 양구군":{
"~2억":{
  "houses": [
    {
      "name": "포미재아파트",
      "address": "강원 양구군 양구읍 상리 559",
      "size": "84.48㎡",
      "price": "1억 9,400만원(2022.12.28, 11층)",
      "infra": "21년차, 양구읍 중심, 생활편의시설 인접"
    },
    {
      "name": "양구석미모닝파크",
      "address": "강원 양구군 양구읍",
      "size": "85㎡",
      "price": "1억 7,000만원(2010년 준공, 최근 실거래가)",
      "infra": "양구읍 중심, 생활편의시설 인접"
    },
    {
      "name": "경림",
      "address": "강원 양구군 양구읍",
      "size": "59㎡",
      "price": "1억원(1998년 준공, 최근 실거래가)",
      "infra": "양구읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "서희스타힐스",
      "address": "강원 양구군 양구읍",
      "size": "85㎡",
      "price": "2억 2,000만원(2013년 준공, 최근 실거래가)",
      "infra": "양구읍 중심, 생활편의시설 인접"
    },
    {
      "name": "서희스타힐스",
      "address": "강원 양구군 양구읍",
      "size": "74㎡",
      "price": "2억 1,000만원(2013년 준공, 최근 실거래가)",
      "infra": "양구읍 중심, 생활편의시설 인접"
    },
    {
      "name": "포미재아파트",
      "address": "강원 양구군 양구읍 상리 559",
      "size": "84.48㎡",
      "price": "2억원(2022.06.03, 1층)",
      "infra": "21년차, 양구읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"강원도 인제군":{
"~2억":{
  "houses": [
    {
      "name": "한양쉐르빌",
      "address": "강원 인제군 인제읍 덕산리 666",
      "size": "53.7㎡",
      "price": "9,800만원(2024.12.09, 8층)",
      "infra": "21년차, 인제읍 중심, 생활편의시설 인접"
    },
    {
      "name": "신아리버빌",
      "address": "강원 인제군 인제읍",
      "size": "59㎡",
      "price": "1억원(2002년 준공, 최근 실거래가)",
      "infra": "인제읍 중심, 생활편의시설 인접"
    },
    {
      "name": "신아리버빌",
      "address": "강원 인제군 인제읍",
      "size": "82㎡",
      "price": "1억 3,000만원(2002년 준공, 최근 실거래가)",
      "infra": "인제읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "인제라온프라이빗",
      "address": "강원 인제군 인제읍 남북리 833",
      "size": "84.96㎡",
      "price": "3억 7,500만원(2025.02.03, 11층)",
      "infra": "2020년 준공, 신축, 인제읍 중심, 생활편의시설 인접"
    },
    {
      "name": "양우내안애",
      "address": "강원 인제군 인제읍 합강리 370",
      "size": "84.8㎡",
      "price": "3억 1,500만원(2025.01.22, 7층)",
      "infra": "신축, 인제읍 중심, 생활편의시설 인접"
    },
    {
      "name": "인제대희지센트",
      "address": "강원 인제군 인제읍 남북리 832",
      "size": "84.5㎡",
      "price": "2억 2,700만원(2024.02.13, 3층)",
      "infra": "신축, 인제읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"강원도 고성군":{
"~2억":{
  "houses": [
    {
      "name": "고성삼성아파트",
      "address": "강원 고성군 고성읍",
      "size": "59㎡",
      "price": "1억 2,000만원(2001년 준공, 최근 실거래가)",
      "infra": "고성읍 중심, 생활편의시설 인접"
    },
    {
      "name": "삼익아파트",
      "address": "강원 고성군 고성읍",
      "size": "59㎡",
      "price": "1억 1,000만원(2001년 준공, 최근 실거래가)",
      "infra": "고성읍 중심, 생활편의시설 인접"
    },
    {
      "name": "고성현대아파트",
      "address": "강원 고성군 고성읍",
      "size": "59㎡",
      "price": "1억 1,000만원(2001년 준공, 최근 실거래가)",
      "infra": "고성읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "고성삼성아파트(대형)",
      "address": "강원 고성군 고성읍",
      "size": "84㎡",
      "price": "2억 2,000만원(2001년 준공, 최근 실거래가)",
      "infra": "고성읍 중심, 생활편의시설 인접"
    },
    {
      "name": "고성현대아파트(대형)",
      "address": "강원 고성군 고성읍",
      "size": "84㎡",
      "price": "2억 1,000만원(2001년 준공, 최근 실거래가)",
      "infra": "고성읍 중심, 생활편의시설 인접"
    },
    {
      "name": "삼익아파트(대형)",
      "address": "강원 고성군 고성읍",
      "size": "84㎡",
      "price": "2억 1,000만원(2001년 준공, 최근 실거래가)",
      "infra": "고성읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"강원도 양양군":{
"~2억":{
  "houses": [
    {
      "name": "심미아파트",
      "address": "강원 양양군 현북면 중광정리",
      "size": "58.84㎡",
      "price": "1.1억",
      "infra": "중소형 아파트, 실거주 적합"
    },
    {
      "name": "설악실크벨리아파트",
      "address": "강원 양양군 양양읍 거마리",
      "price": "1.88억",
      "size": "25.45㎡",
      "infra": "소형 아파트, 실거주 및 투자용, 산"
    },
    {
      "name": "양양정아아파트",
      "address": "강원 양양군 양양읍 구교리",
      "price": "1.2억",
      "size": "45.82㎡",
      "infra": "중소형 아파트, 실거주 적합"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "양양우미린디오션",
      "address": "강원 양양군 강현면 강선리",
      "price": "2.5억",
      "size": "75㎡",
      "infra": "신축 아파트, 바다 전망"
    },
    {
      "name": "양양 열방 세이프 아파트",
      "address": "강원 양양군 양양읍 구교리",
      "price": "2.3억",
      "size": "80.53㎡",
      "infra": "중대형 아파트, 실거주 적합"
    },
    {
      "name": "양양군 현남면 단독주택",
      "address": "강원 양양군 현남면 원포리",
      "price": "2.7억",
      "size": "연면적 정보 없음",
      "infra": "2층 단독주택, 실거주 적합"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "죽리 단독주택",
      "address": "강원 양양군 현남면 죽리",
      "price": "5억",
      "size": "연면적 55평",
      "infra": "2층 단독주택, 대지 240평"
    },
    {
      "name": "양양읍 단독주택",
      "address": "강원 양양군 양양읍",
      "price": "5.5억",
      "size": "면적 정보 없음",
      "infra": "올 리모델링 완료, 양양역 인근"
    },
    {
      "name": "남애리 신축 단독주택",
      "address": "강원 양양군 현남면 남애리",
      "price": "6억",
      "size": "주택 33.7평",
      "infra": "바닷가 인근, 2층 철근콘크리트 구조"
    }
  ]
},
"10억~15억": {
  "houses": [
    {
      "name": "손양면 가평리 주택",
      "address": "강원 양양군 손양면 가평리",
      "price": "10억",
      "size": "면적 정보 없음",
      "infra": "주차 6대 가능, 심야전기 난방"
    },
    {
      "name": "서면 갈천리 전원주택",
      "address": "강원 양양군 서면 갈천리",
      "price": "10억",
      "size": "건물면적 58.32㎡",
      "infra": "계곡 인근, 전원주택"
    },
    {
      "name": "서면 갈천리 고급 전원주택",
      "address": "강원 양양군 서면 갈천리",
      "price": "10억",
      "size": "면적 정보 없음",
      "infra": "계곡 앞, 고급 전원주택"
    }
  ]
},
"15억~20억": {
  "houses": [
    {
      "name": "양양읍 고급 단독주택",
      "address": "강원 양양군 양양읍",
      "price": "15억",
      "size": "면적 정보 없음",
      "infra": "고급 단독주택, 바다 전망"
    },
    {
      "name": "현북면 고급 전원주택",
      "address": "강원 양양군 현북면",
      "price": "16억",
      "size": "면적 정보 없음",
      "infra": "고급 전원주택, 산 전망"
    },
    {
      "name": "양양읍 고급 전원주택",
      "address": "강원 양양군 양양읍",
      "price": "17억",
      "size": "면적 정보 없음",
      "infra": "고급 전원주택, 바다 전망"
    }
  ]
},
"20억 이상": {
  "houses": [
    {
      "name": "현남면 고급 단독주택",
      "address": "강원 양양군 현남면",
      "price": "100억",
      "size": "연면적 471.76㎡",
      "infra": "고급 별장, 바다 전망"
    },
    {
      "name": "현북면 고급 별장",
      "address": "강원 양양군 현북면",
      "price": "120억",
      "size": "면적 정보 없음",
      "infra": "고급 별장, 산 전망"
    },
    {
      "name": "양양읍 고급 별장",
      "address": "강원 양양군 양양읍",
      "price": "150억",
      "size": "면적 정보 없음",
      "infra": "고급 별장, 바다 전망"
    }
  ]
}
},


"충청북도 청주시 상당구":{
"~2억":{
  "houses": [
    {
            "name": "청주 더하우스 아파트",
            "address": "청주시 상당구 금천동",
            "size": "45㎡",
            "price": "1억 7,500만원",
            "infra": "2006년 준공, 4층, 30세대, 금천동 중심지, 교통 및 생활편의시설 인접"
        },
        {
            "name": "청주 송정 주택",
            "address": "청주시 상당구 송정동",
            "size": "50㎡",
            "price": "1억 9,000만원",
            "infra": "2008년 준공, 2층, 15세대, 송정동 중심지, 교통 및 생활편의시설 인접"
        },
        {
            "name": "청주 롯데타운 아파트",
            "address": "청주시 상당구 용암동",
            "size": "60㎡",
            "price": "1억 9,500만원",
            "infra": "2010년 준공, 5층, 40세대, 용암역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"2억~5억": {
  "houses": [
    {
            "name": "청주 그린빌 아파트",
            "address": "청주시 상당구 산성동",
            "size": "75㎡",
            "price": "2억 2,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2012년 준공, 6층, 50세대, 산성동 중심지, 교통 및 생활편의시설 인접"
        },
        {
            "name": "청주 유림타운 아파트",
            "address": "청주시 상당구 대소동",
            "size": "85㎡",
            "price": "3억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2014년 준공, 8층, 60세대, 대소역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "청주 이스트타운",
            "address": "청주시 상당구 중앙로",
            "size": "90㎡",
            "price": "4억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2016년 준공, 10층, 80세대, 청주역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"5억~10억": {
  "houses": [
    {
            "name": "청주 파크뷰 아파트",
            "address": "청주시 상당구 괴정동",
            "size": "100㎡",
            "price": "5억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2017년 준공, 12층, 100세대, 괴정역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "청주 더블유타워",
            "address": "청주시 상당구 용암동",
            "size": "110㎡",
            "price": "7억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2018년 준공, 15층, 120세대, 용암역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "청주 블루시티 아파트",
            "address": "청주시 상당구 금천동",
            "size": "120㎡",
            "price": "9억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2019년 준공, 18층, 150세대, 금천동 중심지, 교통 및 생활편의시설 인접"
        }
  ]
},
"10억~15억": {
  "houses": [
    {
            "name": "청주 프라임타운",
            "address": "청주시 상당구 산성동",
            "size": "130㎡",
            "price": "10억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2020년 준공, 20층, 200세대, 산성동 중심지, 교통 및 생활편의시설 인접"
        },
        {
            "name": "청주 블루웰 아파트",
            "address": "청주시 상당구 괴정동",
            "size": "140㎡",
            "price": "12억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2021년 준공, 22층, 220세대, 괴정역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "청주 하이츠타운",
            "address": "청주시 상당구 대소동",
            "size": "150㎡",
            "price": "14억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 25층, 250세대, 대소역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"15억~20억": {
  "houses": [
     {
            "name": "청주 엘리시움 타워",
            "address": "청주시 상당구 송정동",
            "size": "160㎡",
            "price": "16억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2023년 준공, 30층, 300세대, 송정동 중심지, 교통 및 생활편의시설 인접"
        },
        {
            "name": "청주 그랜드파크 아파트",
            "address": "청주시 상당구 중앙로",
            "size": "170㎡",
            "price": "17억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 35층, 350세대, 중앙로 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "청주 스카이파크",
            "address": "청주시 상당구 괴정동",
            "size": "180㎡",
            "price": "19억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2025년 준공, 40층, 400세대, 괴정역 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"20억 이상": {
  "houses": [
    {
            "name": "청주 랜드마크타워",
            "address": "청주시 상당구 금천동",
            "size": "200㎡",
            "price": "22억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2026년 준공, 45층, 450세대, 금천동 중심지, 교통 및 생활편의시설 인접"
        },
        {
            "name": "청주 파크시티 아파트",
            "address": "청주시 상당구 용암동",
            "size": "210㎡",
            "price": "23억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2027년 준공, 50층, 500세대, 용암역 인근, 교통 및 생활편의시설 인접"
        },
        {
            "name": "청주 타워파크",
            "address": "청주시 상당구 산성동",
            "size": "220㎡",
            "price": "25억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2028년 준공, 55층, 550세대, 산성동 중심지, 교통 및 생활편의시설 인접"
        }
  ]
}
},

"충청북도 청주시 서원구":{
"~2억":{
  "houses": [
    {
    "name": "분평동 소형 아파트",
    "address": "충북 청주시 서원구 분평동",
    "size": "59m² (18평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "분평동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "모충동 소형 빌라",
    "address": "충북 청주시 서원구 모충동",
    "size": "약 39m² (12평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "모충동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "사직동 단독주택",
    "address": "충북 청주시 서원구 사직동",
    "size": "약 40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "사직동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "분평동 신축 아파트",
    "address": "충북 청주시 서원구 분평동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "분평동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "모충동 신축 빌라",
    "address": "충북 청주시 서원구 모충동",
    "size": "약 59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "모충동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "사직동 신축 빌라",
    "address": "충북 청주시 서원구 사직동",
    "size": "약 59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "사직동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "분평동 대단지 아파트",
    "address": "충북 청주시 서원구 분평동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "분평동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "모충동 대단지 아파트",
    "address": "충북 청주시 서원구 모충동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "모충동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "사직동 대단지 아파트",
    "address": "충북 청주시 서원구 사직동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "사직동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청북도 청주시 청원구":{
"~2억":{
  "houses": [
    {
    "name": "율량동 소형 아파트",
    "address": "충북 청주시 청원구 율량동",
    "size": "59m² (18평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "율량동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "내덕동 소형 빌라",
    "address": "충북 청주시 청원구 내덕동",
    "size": "약 39m² (12평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "내덕동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "오창읍 단독주택",
    "address": "충북 청주시 청원구 오창읍",
    "size": "약 40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "오창읍 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "율량동 신축 아파트",
    "address": "충북 청주시 청원구 율량동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "율량동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "내덕동 신축 빌라",
    "address": "충북 청주시 청원구 내덕동",
    "size": "약 59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "내덕동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "오창읍 신축 빌라",
    "address": "충북 청주시 청원구 오창읍",
    "size": "약 59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "오창읍 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "율량동 대단지 아파트",
    "address": "충북 청주시 청원구 율량동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "율량동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "내덕동 대단지 아파트",
    "address": "충북 청주시 청원구 내덕동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "내덕동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "오창읍 대단지 아파트",
    "address": "충북 청주시 청원구 오창읍",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "오창읍 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청북도 청주시 흥덕구":{
"~2억":{
  "houses": [
    {
    "name": "복대동 소형 아파트",
    "address": "충북 청주시 흥덕구 복대동",
    "size": "59m² (18평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "복대동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "가경동 소형 빌라",
    "address": "충북 청주시 흥덕구 가경동",
    "size": "약 39m² (12평)",
    "price": "1억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "가경동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "강서동 단독주택",
    "address": "충북 청주시 흥덕구 강서동",
    "size": "약 40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "강서동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "복대동 신축 아파트",
    "address": "충북 청주시 흥덕구 복대동",
    "size": "84m² (25평)",
    "price": "3억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "복대동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "가경동 신축 빌라",
    "address": "충북 청주시 흥덕구 가경동",
    "size": "약 59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "가경동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "강서동 신축 빌라",
    "address": "충북 청주시 흥덕구 강서동",
    "size": "약 59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "강서동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "복대동 대단지 아파트",
    "address": "충북 청주시 흥덕구 복대동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "복대동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "가경동 대단지 아파트",
    "address": "충북 청주시 흥덕구 가경동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "가경동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "강서동 대단지 아파트",
    "address": "충북 청주시 흥덕구 강서동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "강서동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청북도 충주시":{
"~2억":{
  "houses": [
    {
    "name": "연수동 소형 아파트",
    "address": "충북 충주시 연수동",
    "size": "59m² (18평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "연수동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "교현동 소형 빌라",
    "address": "충북 충주시 교현동",
    "size": "약 39m² (12평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "교현동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "용산동 단독주택",
    "address": "충북 충주시 용산동",
    "size": "약 40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "용산동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "연수동 신축 아파트",
    "address": "충북 충주시 연수동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "연수동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "교현동 신축 빌라",
    "address": "충북 충주시 교현동",
    "size": "약 59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "교현동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "용산동 신축 빌라",
    "address": "충북 충주시 용산동",
    "size": "약 59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "용산동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "연수동 대단지 아파트",
    "address": "충북 충주시 연수동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "연수동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "교현동 대단지 아파트",
    "address": "충북 충주시 교현동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "교현동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "용산동 대단지 아파트",
    "address": "충북 충주시 용산동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "용산동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청북도 제천시":{
"~2억":{
  "houses": [
    {
    "name": "장락동 소형 아파트",
    "address": "충북 제천시 장락동",
    "size": "59m² (18평)",
    "price": "1억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "장락동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "하소동 소형 빌라",
    "address": "충북 제천시 하소동",
    "size": "약 39m² (12평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "하소동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "의림동 단독주택",
    "address": "충북 제천시 의림동",
    "size": "약 40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "의림동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "장락동 신축 아파트",
    "address": "충북 제천시 장락동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "장락동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "하소동 신축 빌라",
    "address": "충북 제천시 하소동",
    "size": "약 59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "하소동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "의림동 신축 빌라",
    "address": "충북 제천시 의림동",
    "size": "약 59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "의림동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "장락동 대단지 아파트",
    "address": "충북 제천시 장락동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "장락동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "하소동 대단지 아파트",
    "address": "충북 제천시 하소동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "하소동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "의림동 대단지 아파트",
    "address": "충북 제천시 의림동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "의림동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청북도 보은군":{
"~2억":{
  "houses": [
    {
      "name": "거성아파트",
      "address": "충북 보은군 보은읍 교사리 35-5",
      "size": "59.67㎡",
      "price": "8,500만원",
      "infra": "8층, 24.12.02 실거래, 생활편의시설 인접"
    },
    {
      "name": "에스엠아파트",
      "address": "충북 보은군 보은읍 교사리 377-7",
      "size": "55.3㎡",
      "price": "7,000만원",
      "infra": "9층, 24.09.06 실거래, 생활편의시설 인접"
    },
    {
      "name": "남산아파트",
      "address": "충북 보은군 보은읍 죽전리 98",
      "size": "59.94㎡",
      "price": "3,000만원",
      "infra": "3층, 24.12.09 실거래, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "신한헤센아파트",
      "address": "충북 보은군 보은읍 장신리 183",
      "size": "84.99㎡",
      "price": "2억 1,700만원",
      "infra": "8층, 24.09.24 실거래, 492세대, 생활편의시설 인접"
    },
    {
      "name": "강변리츠빌아파트",
      "address": "충북 보은군 보은읍 이평리 159-7",
      "size": "84.98㎡",
      "price": "2억 1,000만원",
      "infra": "4층, 24.09.23 실거래, 95세대, 생활편의시설 인접"
    },
    {
      "name": "두진 보은하트리움",
      "address": "충북 보은군 보은읍 이평리 168-1",
      "size": "59.98㎡",
      "price": "1억 6,700만원",
      "infra": "13층, 25.01.06 실거래, 88세대, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청북도 옥천군":{
"~2억":{
  "houses": [
    {
      "name": "옥천마암리양우내안애아파트",
      "address": "충북 옥천군 옥천읍 마암리 487",
      "size": "59.91㎡",
      "price": "1억 8,000만원",
      "infra": "11층, 2025.02 실거래, 280세대, 생활편의시설 인접"
    },
    {
      "name": "옥향아파트",
      "address": "충북 옥천군 옥천읍 죽향리",
      "size": "108.42㎡",
      "price": "1억 8,000만원",
      "infra": "3층, 2025.02 실거래, 323세대, 생활편의시설 인접"
    },
    {
      "name": "현대마암아파트",
      "address": "충북 옥천군 옥천읍 마암리",
      "size": "84.78㎡",
      "price": "1억 7,000만원",
      "infra": "3층, 2025.01 실거래, 275세대, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "옥천지엘리베라움",
      "address": "충북 옥천군 옥천읍 양수리",
      "size": "84.89㎡",
      "price": "3억원",
      "infra": "8층, 2024.12 실거래, 446세대, 생활편의시설 인접"
    },
    {
      "name": "태원아파트",
      "address": "충북 옥천군 옥천읍 대천리",
      "size": "84.14㎡",
      "price": "2억 9,000만원",
      "infra": "6층, 2024.12 실거래, 2022년 입주, 생활편의시설 인접"
    },
    {
      "name": "더퍼스트이안",
      "address": "충북 옥천군 옥천읍 장야리",
      "size": "75.69㎡",
      "price": "2억 5,000만원",
      "infra": "9층, 2025.01 실거래, 325세대, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청북도 증평군":{
"~2억":{
  "houses": [
    {
      "name": "증평주공2단지아파트",
      "address": "충북 증평군 증평읍 신동리 545",
      "size": "58.14㎡",
      "price": "7,500만원",
      "infra": "14층, 24.05.01 실거래, 654세대, 생활편의시설 인접"
    },
    {
      "name": "증평주공4단지아파트",
      "address": "충북 증평군 증평읍 신동리",
      "size": "59㎡",
      "price": "1억 이하",
      "infra": "저층, 2000년대 준공, 생활편의시설 인접"
    },
    {
      "name": "지평더웰",
      "address": "충북 증평군 증평읍",
      "size": "66㎡",
      "price": "1억~1억 5,000만원",
      "infra": "저층, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "증평코아루휴티스",
      "address": "충북 증평군 증평읍",
      "size": "84㎡",
      "price": "2억~3억",
      "infra": "고층, 2010년대 준공, 생활편의시설 인접"
    },
    {
      "name": "지평더웰(대형)",
      "address": "충북 증평군 증평읍",
      "size": "84㎡",
      "price": "2억~3억",
      "infra": "고층, 생활편의시설 인접"
    },
    {
      "name": "증평주공2단지(대형)",
      "address": "충북 증평군 증평읍 신동리",
      "size": "84㎡",
      "price": "2억~3억",
      "infra": "고층, 1990년대 준공, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청북도 진천군":{
"~2억":{
  "houses": [
    {
      "name": "진천영화블렌하임",
      "address": "충북 진천군 진천읍",
      "size": "60㎡",
      "price": "1억원",
      "infra": "10년차, 23평, 저층, 생활편의시설 인접"
    },
    {
      "name": "진천광혜원주공",
      "address": "충북 진천군 광혜원면",
      "size": "52㎡",
      "price": "1억원",
      "infra": "15년차, 20평, 저층, 생활편의시설 인접"
    },
    {
      "name": "진천우림필유",
      "address": "충북 진천군 진천읍 성석리",
      "size": "60㎡",
      "price": "1.6억원",
      "infra": "2년차, 23평, 15층, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "모아엘가더테라스",
      "address": "충북 진천군 덕산읍 두촌리",
      "size": "84.91㎡",
      "price": "3억 9,000만원",
      "infra": "2018년 입주, 10층, 574세대, 생활편의시설 인접"
    },
    {
      "name": "충북혁신도시아모리움내안애",
      "address": "충북 진천군 덕산읍 두촌리",
      "size": "84.96㎡",
      "price": "3억 5,000만원",
      "infra": "2018년 입주, 18층, 842세대, 생활편의시설 인접"
    },
    {
      "name": "영무예다음1차",
      "address": "충북 진천군 덕산읍 두촌리",
      "size": "84.93㎡",
      "price": "3억 4,000만원",
      "infra": "2015년 입주, 5층, 691세대, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청북도 괴산군":{
"~2억":{
  "houses": [
    {
      "name": "신성건설 미소지움괴산아파트",
      "address": "충북 괴산군 괴산읍 동부리 811",
      "size": "59.97㎡",
      "price": "1억 7,500만원",
      "infra": "2025.01.07 실거래, 170세대, 12년차, 생활편의시설 인접"
    },
    {
      "name": "괴산읍 단독주택",
      "address": "충북 괴산군 괴산읍",
      "size": "60㎡",
      "price": "1억 5,000만원",
      "infra": "저층, 생활편의시설 인접"
    },
    {
      "name": "불정면 아파트",
      "address": "충북 괴산군 불정면",
      "size": "60㎡",
      "price": "1억 2,000만원",
      "infra": "저층, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "신성건설 미소지움괴산아파트(대형)",
      "address": "충북 괴산군 괴산읍 동부리 811",
      "size": "84.95㎡",
      "price": "2억 1,000만원",
      "infra": "2025.01.07 실거래, 170세대, 12년차, 생활편의시설 인접"
    },
    {
      "name": "괴산읍 단독주택(대형)",
      "address": "충북 괴산군 괴산읍",
      "size": "84㎡",
      "price": "2억 5,000만원",
      "infra": "저층, 생활편의시설 인접"
    },
    {
      "name": "불정면 아파트(대형)",
      "address": "충북 괴산군 불정면",
      "size": "84㎡",
      "price": "2억 3,000만원",
      "infra": "저층, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청북도 음성군":{
"~2억":{
  "houses": [
    {
      "name": "음성금왕휴먼시아",
      "address": "충북 음성군 금왕읍",
      "size": "60㎡",
      "price": "1억 1,000만원",
      "infra": "16년차, 23평, 저층, 생활편의시설 인접"
    },
    {
      "name": "음성대소부영",
      "address": "충북 음성군 대소면",
      "size": "85㎡",
      "price": "1억 3,000만원",
      "infra": "12년차, 33평, 저층, 생활편의시설 인접"
    },
    {
      "name": "음성금왕두진하트리움",
      "address": "충북 음성군 금왕읍",
      "size": "66㎡",
      "price": "1억 6,000만원",
      "infra": "11년차, 26평, 저층, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "충북혁신도시 영무예다음3차",
      "address": "충북 음성군 맹동면",
      "size": "85㎡",
      "price": "2억 7,000만원",
      "infra": "1년차, 33평, 저층, 생활편의시설 인접"
    },
    {
      "name": "음성금왕시티프라디움",
      "address": "충북 음성군 금왕읍",
      "size": "85㎡",
      "price": "2억 3,000만원",
      "infra": "1년차, 33평, 저층, 생활편의시설 인접"
    },
    {
      "name": "음성지평더웰2차아파트",
      "address": "충북 음성군 음성읍",
      "size": "73㎡",
      "price": "2억 1,000만원",
      "infra": "1년차, 28평, 저층, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청북도 단양군":{
"~2억":{
  "houses": [
    {
      "name": "부강아파트",
      "address": "충북 단양군 단양읍",
      "size": "59.46㎡",
      "price": "1억 3,000만원",
      "infra": "6층, 25년 3월 실거래, 26년차, 생활편의시설 인접"
    },
    {
      "name": "두진임대아파트",
      "address": "충북 단양군 단양읍",
      "size": "59㎡",
      "price": "9,000만원",
      "infra": "23년차, 23평, 저층, 생활편의시설 인접"
    },
    {
      "name": "성원아파트",
      "address": "충북 단양군 단양읍",
      "size": "43㎡",
      "price": "7,000만원",
      "infra": "25년차, 17평, 저층, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "신성단양미소지움",
      "address": "충북 단양군 단양읍 별곡리",
      "size": "84.99㎡",
      "price": "2억 5,000만원",
      "infra": "15층, 25년 4월 실거래, 311세대, 생활편의시설 인접"
    },
    {
      "name": "신성단양미소지움(대형)",
      "address": "충북 단양군 단양읍 별곡리",
      "size": "85㎡",
      "price": "2억 4,000만원",
      "infra": "11년차, 33평, 저층, 생활편의시설 인접"
    },
    {
      "name": "평동한라",
      "address": "충북 단양군 매포읍",
      "size": "60㎡",
      "price": "6,000만원",
      "infra": "24년차, 23평, 저층, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청북도 영동군":{
"~2억":{
  "houses": [
    {
      "name": "영동 내지브로 아파트",
      "address": "충북 영동군 영동읍 계산리 85",
      "size": "84.9㎡",
      "price": "1억 9,600만원",
      "infra": "2층, 24.05.17 실거래, 32세대, 생활편의시설 인접"
    },
    {
      "name": "대성맨션",
      "address": "충북 영동군 영동읍",
      "size": "84.9㎡",
      "price": "7,000만원",
      "infra": "저층, 24.11.03 실거래, 생활편의시설 인접"
    },
    {
      "name": "서한감고을",
      "address": "충북 영동군 영동읍",
      "size": "85㎡",
      "price": "1억 8,000만원",
      "infra": "17년차, 33평, 저층, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "이원리버빌",
      "address": "충북 영동군 영동읍 계산리 867-51",
      "size": "84.95㎡",
      "price": "2억 2,300만원",
      "infra": "4층, 24.04.22 실거래, 90세대, 생활편의시설 인접"
    },
    {
      "name": "이든팰리스",
      "address": "충북 영동군 영동읍",
      "size": "67㎡",
      "price": "2억원",
      "infra": "3년차, 26평, 저층, 생활편의시설 인접"
    },
    {
      "name": "크리스탈타워",
      "address": "충북 영동군 영동읍",
      "size": "83㎡",
      "price": "2억 4,000만원",
      "infra": "2년차, 33평, 저층, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청남도 천안시 동남구":{
"~2억":{
  "houses": [
    {
    "name": "신부동 소형 아파트",
    "address": "충남 천안시 동남구 신부동",
    "size": "59m² (18평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신부동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "원성동 소형 빌라",
    "address": "충남 천안시 동남구 원성동",
    "size": "약 39m² (12평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "원성동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "청당동 단독주택",
    "address": "충남 천안시 동남구 청당동",
    "size": "약 40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "청당동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
  {
    "name": "신부동 신축 아파트",
    "address": "충남 천안시 동남구 신부동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신부동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "원성동 신축 빌라",
    "address": "충남 천안시 동남구 원성동",
    "size": "약 59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "원성동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "청당동 신축 빌라",
    "address": "충남 천안시 동남구 청당동",
    "size": "약 59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "청당동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "신부동 대단지 아파트",
    "address": "충남 천안시 동남구 신부동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신부동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "원성동 대단지 아파트",
    "address": "충남 천안시 동남구 원성동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "원성동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "청당동 대단지 아파트",
    "address": "충남 천안시 동남구 청당동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "청당동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청남도 천안시 서북구":{
"~2억":{
  "houses": [
    {
    "name": "두정동 소형 아파트",
    "address": "충남 천안시 서북구 두정동",
    "size": "59m² (18평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "두정동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "성정동 소형 빌라",
    "address": "충남 천안시 서북구 성정동",
    "size": "약 39m² (12평)",
    "price": "1억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "성정동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "백석동 단독주택",
    "address": "충남 천안시 서북구 백석동",
    "size": "약 40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "백석동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "두정동 신축 아파트",
    "address": "충남 천안시 서북구 두정동",
    "size": "84m² (25평)",
    "price": "3억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "두정동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "성정동 신축 빌라",
    "address": "충남 천안시 서북구 성정동",
    "size": "약 59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "성정동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "백석동 신축 빌라",
    "address": "충남 천안시 서북구 백석동",
    "size": "약 59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "백석동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "두정동 대단지 아파트",
    "address": "충남 천안시 서북구 두정동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "두정동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "성정동 대단지 아파트",
    "address": "충남 천안시 서북구 성정동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "성정동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "백석동 대단지 아파트",
    "address": "충남 천안시 서북구 백석동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "백석동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청남도 공주시":{
"~2억":{
  "houses": [
    {
    "name": "신관동 소형 아파트",
    "address": "충남 공주시 신관동",
    "size": "39m² (12평)",
    "price": "1억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "공주역 차량 10분, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "웅진동 소형 빌라",
    "address": "충남 공주시 웅진동",
    "size": "36m² (11평)",
    "price": "1억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "공주시청 차량 10분, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "금학동 소형 빌라",
    "address": "충남 공주시 금학동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "금학동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "신관동 신축 빌라",
    "address": "충남 공주시 신관동",
    "size": "59m² (18평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "공주역 차량 10분, 버스 다수, 대형마트 차량 10분"
  },
  {
    "name": "웅진동 아파트",
    "address": "충남 공주시 웅진동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "공주시청 차량 10분, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "금학동 신축 빌라",
    "address": "충남 공주시 금학동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "금학동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "신관동 대단지 아파트",
    "address": "충남 공주시 신관동",
    "size": "84m² (25평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "공주역 차량 10분, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "웅진동 대단지 아파트",
    "address": "충남 공주시 웅진동",
    "size": "84m² (25평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "공주시청 차량 10분, 버스 다수, 대형마트 차량 10분"
  },
  {
    "name": "금학동 대단지 아파트",
    "address": "충남 공주시 금학동",
    "size": "84m² (25평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "금학동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "신관동 고급 단독주택",
    "address": "충남 공주시 신관동",
    "size": "130m² (39평) 이상",
    "price": "12억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "공주역 차량 10분, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "웅진동 고급 단독주택",
    "address": "충남 공주시 웅진동",
    "size": "140m² (42평) 이상",
    "price": "13억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "공주시청 차량 10분, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "금학동 고급 단독주택",
    "address": "충남 공주시 금학동",
    "size": "150m² (45평) 이상",
    "price": "14억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "금학동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "신관동 프리미엄 단독주택",
    "address": "충남 공주시 신관동",
    "size": "180m² (54평) 이상",
    "price": "16억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "공주역 차량 10분, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "웅진동 프리미엄 단독주택",
    "address": "충남 공주시 웅진동",
    "size": "200m² (60평) 이상",
    "price": "18억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "공주시청 차량 10분, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "금학동 프리미엄 단독주택",
    "address": "충남 공주시 금학동",
    "size": "210m² (63평) 이상",
    "price": "19억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "금학동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  }
  ]
},
"20억 이상": {
  "houses": [
    {
    "name": "신관동 초대형 단독주택",
    "address": "충남 공주시 신관동",
    "size": "250m² (75평) 이상",
    "price": "22억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "공주역 차량 10분, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "웅진동 초대형 단독주택",
    "address": "충남 공주시 웅진동",
    "size": "300m² (90평) 이상",
    "price": "25억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "공주시청 차량 10분, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "금학동 초대형 단독주택",
    "address": "충남 공주시 금학동",
    "size": "350m² (106평) 이상",
    "price": "28억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "금학동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  }
  ]
}
},

"충청남도 보령시":{
"~2억":{
  "houses": [
    {
    "name": "동대동 소형 아파트",
    "address": "충남 보령시 동대동",
    "size": "59m² (18평)",
    "price": "1억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "동대동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "명천동 소형 빌라",
    "address": "충남 보령시 명천동",
    "size": "36m² (11평)",
    "price": "1억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "명천동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "죽정동 소형 빌라",
    "address": "충남 보령시 죽정동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "죽정동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "동대동 신축 빌라",
    "address": "충남 보령시 동대동",
    "size": "59m² (18평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "동대동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "명천동 아파트",
    "address": "충남 보령시 명천동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "명천동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "죽정동 신축 빌라",
    "address": "충남 보령시 죽정동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "죽정동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "동대동 대단지 아파트",
    "address": "충남 보령시 동대동",
    "size": "84m² (25평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "동대동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "명천동 대단지 아파트",
    "address": "충남 보령시 명천동",
    "size": "84m² (25평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "명천동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "죽정동 대단지 아파트",
    "address": "충남 보령시 죽정동",
    "size": "84m² (25평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "죽정동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "동대동 고급 단독주택",
    "address": "충남 보령시 동대동",
    "size": "130m² (39평) 이상",
    "price": "12억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "동대동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "명천동 고급 단독주택",
    "address": "충남 보령시 명천동",
    "size": "140m² (42평) 이상",
    "price": "13억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "명천동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "죽정동 고급 단독주택",
    "address": "충남 보령시 죽정동",
    "size": "150m² (45평) 이상",
    "price": "14억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "죽정동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "동대동 프리미엄 단독주택",
    "address": "충남 보령시 동대동",
    "size": "180m² (54평) 이상",
    "price": "16억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "동대동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "명천동 프리미엄 단독주택",
    "address": "충남 보령시 명천동",
    "size": "200m² (60평) 이상",
    "price": "18억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "명천동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "죽정동 프리미엄 단독주택",
    "address": "충남 보령시 죽정동",
    "size": "210m² (63평) 이상",
    "price": "19억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "죽정동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  }
  ]
},
"20억 이상": {
  "houses": [
    {
    "name": "동대동 초대형 단독주택",
    "address": "충남 보령시 동대동",
    "size": "250m² (75평) 이상",
    "price": "22억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "동대동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "명천동 초대형 단독주택",
    "address": "충남 보령시 명천동",
    "size": "300m² (90평) 이상",
    "price": "25억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "명천동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "죽정동 초대형 단독주택",
    "address": "충남 보령시 죽정동",
    "size": "350m² (106평) 이상",
    "price": "28억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "죽정동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  }
  ]
}
},

"충청남도 아산시":{
"~2억":{
  "houses": [
    {
    "name": "온천동 소형 아파트",
    "address": "충남 아산시 온천동",
    "size": "59m² (18평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "온천동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "배방읍 소형 빌라",
    "address": "충남 아산시 배방읍",
    "size": "36m² (11평)",
    "price": "1억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "배방역 차량 10분, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "권곡동 단독주택",
    "address": "충남 아산시 권곡동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "권곡동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "온천동 신축 아파트",
    "address": "충남 아산시 온천동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "온천동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "배방읍 신축 빌라",
    "address": "충남 아산시 배방읍",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "배방역 차량 10분, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "권곡동 신축 빌라",
    "address": "충남 아산시 권곡동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "권곡동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "온천동 대단지 아파트",
    "address": "충남 아산시 온천동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "온천동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "배방읍 대단지 아파트",
    "address": "충남 아산시 배방읍",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "배방역 차량 10분, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "권곡동 대단지 아파트",
    "address": "충남 아산시 권곡동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "권곡동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청남도 서산시":{
"~2억":{
  "houses": [
    {
    "name": "석림동 소형 아파트",
    "address": "충남 서산시 석림동",
    "size": "59m² (18평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "석림동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "동문동 소형 빌라",
    "address": "충남 서산시 동문동",
    "size": "36m² (11평)",
    "price": "1억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "동문동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "예천동 단독주택",
    "address": "충남 서산시 예천동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "예천동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "석림동 신축 아파트",
    "address": "충남 서산시 석림동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "석림동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "동문동 신축 빌라",
    "address": "충남 서산시 동문동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "동문동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "예천동 신축 빌라",
    "address": "충남 서산시 예천동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "예천동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "석림동 대단지 아파트",
    "address": "충남 서산시 석림동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "석림동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "동문동 대단지 아파트",
    "address": "충남 서산시 동문동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "동문동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "예천동 대단지 아파트",
    "address": "충남 서산시 예천동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "예천동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청남도 논산시":{
"~2억":{
  "houses": [
    {
    "name": "취암동 소형 아파트",
    "address": "충남 논산시 취암동",
    "size": "59m² (18평)",
    "price": "1억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "취암동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "내동 소형 빌라",
    "address": "충남 논산시 내동",
    "size": "36m² (11평)",
    "price": "1억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "내동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "강경읍 단독주택",
    "address": "충남 논산시 강경읍",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "강경읍 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
     {
    "name": "취암동 신축 아파트",
    "address": "충남 논산시 취암동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "취암동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "내동 신축 빌라",
    "address": "충남 논산시 내동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "내동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "강경읍 신축 빌라",
    "address": "충남 논산시 강경읍",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "강경읍 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "취암동 대단지 아파트",
    "address": "충남 논산시 취암동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "취암동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "내동 대단지 아파트",
    "address": "충남 논산시 내동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "내동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "강경읍 대단지 아파트",
    "address": "충남 논산시 강경읍",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "강경읍 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청남도 계룡시":{
"~2억":{
  "houses": [
    {
    "name": "취암동 대단지 아파트",
    "address": "충남 논산시 취암동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "취암동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "내동 대단지 아파트",
    "address": "충남 논산시 내동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "내동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "강경읍 대단지 아파트",
    "address": "충남 논산시 강경읍",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "강경읍 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "엄사면 신축 아파트",
    "address": "충남 계룡시 엄사면",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "엄사면 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "두마면 신축 빌라",
    "address": "충남 계룡시 두마면",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "두마면 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "신도안면 신축 빌라",
    "address": "충남 계룡시 신도안면",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신도안면 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "엄사면 대단지 아파트",
    "address": "충남 계룡시 엄사면",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "엄사면 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "두마면 대단지 아파트",
    "address": "충남 계룡시 두마면",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "두마면 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "신도안면 대단지 아파트",
    "address": "충남 계룡시 신도안면",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신도안면 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청남도 당진시":{
"~2억":{
  "houses": [
    {
    "name": "읍내동 소형 아파트",
    "address": "충남 당진시 읍내동",
    "size": "59m² (18평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "읍내동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "송악읍 소형 빌라",
    "address": "충남 당진시 송악읍",
    "size": "36m² (11평)",
    "price": "1억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "송악읍 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "채운동 단독주택",
    "address": "충남 당진시 채운동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "채운동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "읍내동 신축 아파트",
    "address": "충남 당진시 읍내동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "읍내동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "송악읍 신축 빌라",
    "address": "충남 당진시 송악읍",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "송악읍 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "채운동 신축 빌라",
    "address": "충남 당진시 채운동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "채운동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "읍내동 대단지 아파트",
    "address": "충남 당진시 읍내동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "읍내동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "송악읍 대단지 아파트",
    "address": "충남 당진시 송악읍",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "송악읍 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "채운동 대단지 아파트",
    "address": "충남 당진시 채운동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "채운동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청남도 금산군":{
"~2억":{
  "houses": [
    {
      "name": "한진타운",
      "address": "금산읍 상리 292",
      "size": "84.9㎡",
      "price": "1억 2,000만원~1억 5,800만원",
      "infra": "2024~2025년 실거래, 12~18층, 32년차, 금산읍 중심, 생활편의시설 인접"
    },
    {
      "name": "대원칸타빌아파트(소형)",
      "address": "금산읍 아인리 630",
      "size": "59.77㎡",
      "price": "1억 7,500만원~1억 8,800만원",
      "infra": "2025년 1월 실거래, 9~13층, 11년차, 금산읍 중심, 생활편의시설 인접"
    },
    {
      "name": "산마루",
      "address": "금산읍 하옥리 306",
      "size": "41.66㎡",
      "price": "5,000만원",
      "infra": "2024년 12월 실거래, 10층, 26년차, 금산읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "e편한세상금산센터하임",
      "address": "금산읍 중도리 684",
      "size": "84.9㎡",
      "price": "2억 7,000만원~3억 500만원",
      "infra": "2024년 11~12월 실거래, 1~17층, 4년차, 금산읍 중심, 생활편의시설 인접"
    },
    {
      "name": "e편한세상금산프라임포레",
      "address": "금산읍 양지리 468",
      "size": "74.62㎡",
      "price": "2억 4,000만원~2억 8,000만원",
      "infra": "2024~2025년 실거래, 8~19층, 신축, 금산읍 중심, 생활편의시설 인접"
    },
    {
      "name": "대원칸타빌아파트(대형)",
      "address": "금산읍 아인리 630",
      "size": "84.96㎡",
      "price": "2억 3,000만원~2억 4,900만원",
      "infra": "2024~2025년 실거래, 3~12층, 11년차, 금산읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청남도 부여군":{
"~2억":{
  "houses": [
    {
      "name": "주공",
      "address": "부여읍 동남리 41",
      "size": "39.3~46.8㎡",
      "price": "4,500만원~7,500만원",
      "infra": "2024년 4월 실거래, 1~5층, 39년차, 부여읍 중심, 생활편의시설 인접"
    },
    {
      "name": "쌍북주공아파트",
      "address": "부여읍 쌍북리 113",
      "size": "39.6㎡",
      "price": "4,900만원~7,400만원",
      "infra": "2024년 4월 실거래, 2~5층, 34년차, 부여읍 중심, 생활편의시설 인접"
    },
    {
      "name": "무지개",
      "address": "규암면",
      "size": "60㎡",
      "price": "8,000만원",
      "infra": "2002년 입주, 16년차, 규암면 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "홍선금동아파트",
      "address": "부여읍 쌍북리 734",
      "size": "84.9㎡",
      "price": "2억 4,500만원~2억 8,000만원",
      "infra": "2024년 5월 실거래, 2~5층, 24년차, 부여읍 중심, 생활편의시설 인접"
    },
    {
      "name": "왕궁아파트",
      "address": "부여읍 쌍북리 727",
      "size": "84.45~84.55㎡",
      "price": "1억 8,000만원~2억 3,250만원",
      "infra": "2024년 4~5월 실거래, 1~2층, 25년차, 부여읍 중심, 생활편의시설 인접"
    },
    {
      "name": "부여코아루 더퍼스트",
      "address": "규암면",
      "size": "85㎡",
      "price": "2억 7,000만원",
      "infra": "2018년 입주, 신축, 규암면 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청남도 서천군":{
"~2억":{
  "houses": [
    {
      "name": "신영골든빌",
      "address": "서천읍",
      "size": "84㎡",
      "price": "1억 5,000만원",
      "infra": "2004년 입주, 14년차, 서천읍 중심, 생활편의시설 인접"
    },
    {
      "name": "정원",
      "address": "서천읍",
      "size": "85㎡",
      "price": "1억 2,000만원",
      "infra": "1996년 입주, 22년차, 서천읍 중심, 생활편의시설 인접"
    },
    {
      "name": "신흥",
      "address": "장항읍",
      "size": "60~85㎡",
      "price": "5,000만원~8,000만원",
      "infra": "1995년 입주, 23년차, 장항읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "서천클래시움",
      "address": "서천읍",
      "size": "85~122㎡",
      "price": "2억 2,000만원~2억 7,000만원",
      "infra": "2009년 입주, 9년차, 서천읍 중심, 생활편의시설 인접"
    },
    {
      "name": "천산스카이빌",
      "address": "서천읍",
      "size": "85㎡",
      "price": "1억 9,000만원~2억 2,000만원",
      "infra": "2015년 입주, 3~9년차, 서천읍 중심, 생활편의시설 인접"
    },
    {
      "name": "천산스카이빌(201동)",
      "address": "서천읍",
      "size": "63㎡",
      "price": "1억 6,000만원",
      "infra": "2010년 입주, 8년차, 서천읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청남도 청양군":{
"~2억":{
  "houses": [
    {
      "name": "백세아파트",
      "address": "충남 청양군 청양읍 학당리 111-1",
      "size": "85㎡",
      "price": "1억 8,000만원(2024년 실거래, 5층)",
      "infra": "2013년 준공, 청양읍 중심, 생활편의시설 인접"
    },
    {
      "name": "주공1단지",
      "address": "충남 청양군 청양읍 학당리 111-2",
      "size": "50㎡",
      "price": "1억 1,000만원(2024년 실거래, 3층)",
      "infra": "2002년 준공, 청양읍 중심, 생활편의시설 인접"
    },
    {
      "name": "천강아파트",
      "address": "충남 청양군 청양읍 학당리 111-3",
      "size": "59㎡",
      "price": "9,000만원(2024년 실거래, 2층)",
      "infra": "1996년 준공, 청양읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "백세아파트(대형)",
      "address": "충남 청양군 청양읍 학당리 111-1",
      "size": "110㎡",
      "price": "2억 3,000만원(2024년 실거래, 7층)",
      "infra": "2013년 준공, 청양읍 중심, 생활편의시설 인접"
    },
    {
      "name": "청양읍 단독주택",
      "address": "충남 청양군 청양읍",
      "size": "대지 230㎡, 건물 88㎡",
      "price": "2억 5,000만원(2024년 실거래, 1층)",
      "infra": "방3, 욕실2, 마당, 청양읍 중심"
    },
    {
      "name": "청양읍 신축빌라",
      "address": "충남 청양군 청양읍",
      "size": "전용 60~80㎡",
      "price": "2억~3억(2024년 실거래, 신축)",
      "infra": "엘리베이터, 주차, 청양읍 중심"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청남도 홍성군":{
"~2억":{
  "houses": [
    {
      "name": "홍성옥암하늘채",
      "address": "홍성읍",
      "size": "73~85㎡",
      "price": "1억 6,000만원~1억 7,000만원",
      "infra": "2006년 입주, 12년차, 홍성읍 중심, 생활편의시설 인접"
    },
    {
      "name": "주공아파트1차",
      "address": "홍성읍",
      "size": "46~84㎡",
      "price": "8,000만원~1억 5,000만원",
      "infra": "2001년 입주, 17년차, 홍성읍 중심, 생활편의시설 인접"
    },
    {
      "name": "부영1차",
      "address": "홍성읍",
      "size": "50~81㎡",
      "price": "7,000만원~1억 2,000만원",
      "infra": "2003년 입주, 15년차, 홍성읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "신동아파밀리에",
      "address": "홍성읍",
      "size": "85~123㎡",
      "price": "2억~2억 8,000만원",
      "infra": "2009년 입주, 9년차, 홍성읍 중심, 생활편의시설 인접"
    },
    {
      "name": "세광엔리치타워",
      "address": "홍성읍",
      "size": "120㎡",
      "price": "2억 3,000만원",
      "infra": "2006년 입주, 12년차, 홍성읍 중심, 생활편의시설 인접"
    },
    {
      "name": "홍성남장이안",
      "address": "홍성읍",
      "size": "73㎡",
      "price": "1억 7,000만원",
      "infra": "2017년 입주, 1년차, 홍성읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청남도 예산군":{
"~2억":{
  "houses": [
     {
      "name": "예산1차세광엔리치타워",
      "address": "예산읍",
      "size": "85㎡",
      "price": "1억 6,000만원~1억 8,000만원",
      "infra": "2006년 입주, 12년차, 예산읍 중심, 생활편의시설 인접"
    },
    {
      "name": "능금마을신성",
      "address": "예산읍",
      "size": "85㎡",
      "price": "1억 1,000만원",
      "infra": "1993년 입주, 25년차, 예산읍 중심, 생활편의시설 인접"
    },
    {
      "name": "한신",
      "address": "예산읍",
      "size": "60~74㎡",
      "price": "9,000만원~1억 1,000만원",
      "infra": "1996년 입주, 22년차, 예산읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
     {
      "name": "예산우방유쉘",
      "address": "예산읍",
      "size": "186㎡",
      "price": "3억 5,000만원",
      "infra": "2009년 입주, 9년차, 예산읍 중심, 생활편의시설 인접"
    },
    {
      "name": "내포신도시 이지더원",
      "address": "삽교읍",
      "size": "77㎡",
      "price": "2억 6,000만원",
      "infra": "2017년 입주, 1년차, 삽교읍 중심, 생활편의시설 인접"
    },
    {
      "name": "예산행정타운 신동아 파밀리에",
      "address": "예산읍",
      "size": "85㎡",
      "price": "2억 5,000만원",
      "infra": "2017년 입주, 1년차, 예산읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"충청남도 태안군":{
"~2억":{
  "houses": [
    {
      "name": "렉시움",
      "address": "태안읍 남문리",
      "size": "84.67㎡",
      "price": "1억 9,000만원",
      "infra": "2015년 입주, 2층, 10년차, 태안읍 중심, 생활편의시설 인접"
    },
    {
      "name": "주공",
      "address": "태안읍 동문리",
      "size": "84.45㎡",
      "price": "1억 8,000만원",
      "infra": "2000년 입주, 15층, 24년차, 태안읍 중심, 생활편의시설 인접"
    },
    {
      "name": "태안신동아",
      "address": "태안읍 삭선리",
      "size": "84.97㎡",
      "price": "1억원",
      "infra": "1996년 입주, 9층, 29년차, 태안읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "태안남문코아루",
      "address": "태안읍 남문리",
      "size": "59.57㎡",
      "price": "2억원",
      "infra": "2014년 입주, 16층, 11년차, 태안읍 중심, 생활편의시설 인접"
    },
    {
      "name": "코아루3차",
      "address": "태안읍 남문리",
      "size": "74.96㎡",
      "price": "2억 3,000만원",
      "infra": "2020년 입주, 7층, 5년차, 태안읍 중심, 생활편의시설 인접"
    },
    {
      "name": "태안동문이테크코아루",
      "address": "태안읍 동문리",
      "size": "84.69㎡",
      "price": "3억 4,000만원",
      "infra": "2018년 입주, 4층, 7년차, 태안읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},



"전라북도 전주시 덕진구":{
"~2억":{
  "houses": [
    {
    "name": "송천동 소형 아파트",
    "address": "전북 전주시 덕진구 송천동",
    "size": "59m² (18평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "송천동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "인후동 소형 빌라",
    "address": "전북 전주시 덕진구 인후동",
    "size": "36m² (11평)",
    "price": "1억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "인후동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "진북동 단독주택",
    "address": "전북 전주시 덕진구 진북동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "진북동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "송천동 신축 아파트",
    "address": "전북 전주시 덕진구 송천동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "송천동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "인후동 신축 빌라",
    "address": "전북 전주시 덕진구 인후동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "인후동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "진북동 신축 빌라",
    "address": "전북 전주시 덕진구 진북동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "진북동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "송천동 대단지 아파트",
    "address": "전북 전주시 덕진구 송천동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "송천동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "인후동 대단지 아파트",
    "address": "전북 전주시 덕진구 인후동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "인후동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "진북동 대단지 아파트",
    "address": "전북 전주시 덕진구 진북동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "진북동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라북도 전주시 완산구":{
"~2억":{
  "houses": [
    {
    "name": "중화산동 소형 아파트",
    "address": "전북 전주시 완산구 중화산동",
    "size": "59m² (18평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중화산동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "효자동 소형 빌라",
    "address": "전북 전주시 완산구 효자동",
    "size": "36m² (11평)",
    "price": "1억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "효자동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "삼천동 단독주택",
    "address": "전북 전주시 완산구 삼천동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "삼천동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "중화산동 신축 아파트",
    "address": "전북 전주시 완산구 중화산동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중화산동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "효자동 신축 빌라",
    "address": "전북 전주시 완산구 효자동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "효자동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "삼천동 신축 빌라",
    "address": "전북 전주시 완산구 삼천동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "삼천동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "중화산동 대단지 아파트",
    "address": "전북 전주시 완산구 중화산동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중화산동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "효자동 대단지 아파트",
    "address": "전북 전주시 완산구 효자동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "효자동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "삼천동 대단지 아파트",
    "address": "전북 전주시 완산구 삼천동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "삼천동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라북도 군산시":{
"~2억":{
  "houses": [
    {
    "name": "나운동 소형 아파트",
    "address": "전북 군산시 나운동",
    "size": "59m² (18평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "나운동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "조촌동 소형 빌라",
    "address": "전북 군산시 조촌동",
    "size": "36m² (11평)",
    "price": "1억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "조촌동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "경암동 단독주택",
    "address": "전북 군산시 경암동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "경암동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "나운동 신축 아파트",
    "address": "전북 군산시 나운동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "나운동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "조촌동 신축 빌라",
    "address": "전북 군산시 조촌동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "조촌동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "경암동 신축 빌라",
    "address": "전북 군산시 경암동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "경암동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "나운동 대단지 아파트",
    "address": "전북 군산시 나운동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "나운동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "조촌동 대단지 아파트",
    "address": "전북 군산시 조촌동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "조촌동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "경암동 대단지 아파트",
    "address": "전북 군산시 경암동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "경암동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라북도 익산시":{
"~2억":{
  "houses": [
    {
    "name": "영등동 소형 아파트",
    "address": "전북 익산시 영등동",
    "size": "59m² (18평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "영등동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "남중동 소형 빌라",
    "address": "전북 익산시 남중동",
    "size": "36m² (11평)",
    "price": "1억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남중동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "신동 단독주택",
    "address": "전북 익산시 신동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "영등동 신축 아파트",
    "address": "전북 익산시 영등동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "영등동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "남중동 신축 빌라",
    "address": "전북 익산시 남중동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남중동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "신동 신축 빌라",
    "address": "전북 익산시 신동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
     {
    "name": "영등동 대단지 아파트",
    "address": "전북 익산시 영등동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "영등동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "남중동 대단지 아파트",
    "address": "전북 익산시 남중동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남중동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "신동 대단지 아파트",
    "address": "전북 익산시 신동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라북도 정읍시":{
"~2억":{
  "houses": [
    {
    "name": "수성동 소형 아파트",
    "address": "전북 정읍시 수성동",
    "size": "59m² (18평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "수성동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "상동 소형 빌라",
    "address": "전북 정읍시 상동",
    "size": "36m² (11평)",
    "price": "1억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "연지동 단독주택",
    "address": "전북 정읍시 연지동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "연지동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "수성동 신축 아파트",
    "address": "전북 정읍시 수성동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "수성동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "상동 신축 빌라",
    "address": "전북 정읍시 상동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "연지동 신축 빌라",
    "address": "전북 정읍시 연지동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "연지동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "수성동 대단지 아파트",
    "address": "전북 정읍시 수성동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "수성동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "상동 대단지 아파트",
    "address": "전북 정읍시 상동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "연지동 대단지 아파트",
    "address": "전북 정읍시 연지동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "연지동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라북도 남원시":{
"~2억":{
  "houses": [
    {
    "name": "도통동 소형 아파트",
    "address": "전북 남원시 도통동",
    "size": "59m² (18평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "도통동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "금동 소형 빌라",
    "address": "전북 남원시 금동",
    "size": "36m² (11평)",
    "price": "1억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "금동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "향교동 단독주택",
    "address": "전북 남원시 향교동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "향교동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "도통동 신축 아파트",
    "address": "전북 남원시 도통동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "도통동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "금동 신축 빌라",
    "address": "전북 남원시 금동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "금동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "향교동 신축 빌라",
    "address": "전북 남원시 향교동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "향교동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "도통동 대단지 아파트",
    "address": "전북 남원시 도통동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "도통동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "금동 대단지 아파트",
    "address": "전북 남원시 금동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "금동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "향교동 대단지 아파트",
    "address": "전북 남원시 향교동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "향교동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라북도 김제시":{
"~2억":{
  "houses": [
    {
    "name": "신풍동 소형 아파트",
    "address": "전북 김제시 신풍동",
    "size": "59m² (18평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신풍동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "검산동 소형 빌라",
    "address": "전북 김제시 검산동",
    "size": "36m² (11평)",
    "price": "1억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "검산동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "요촌동 단독주택",
    "address": "전북 김제시 요촌동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "요촌동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "신풍동 신축 아파트",
    "address": "전북 김제시 신풍동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신풍동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "검산동 신축 빌라",
    "address": "전북 김제시 검산동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "검산동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "요촌동 신축 빌라",
    "address": "전북 김제시 요촌동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "요촌동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "신풍동 대단지 아파트",
    "address": "전북 김제시 신풍동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신풍동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "검산동 대단지 아파트",
    "address": "전북 김제시 검산동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "검산동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "요촌동 대단지 아파트",
    "address": "전북 김제시 요촌동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "요촌동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라북도 완주군":{
"~2억":{
  "houses": [
    {
        "name": "소양면 전원주택",
        "address": "전북 완주군 소양면",
        "size": "103.1m² (31.2평)",
        "price": "2억 5,000만원",
        "auction": "https://mland.kcro.co.kr/offer/61264966",
        "infra": "대지 512㎡, 주차 공간 확보, 전주시 차량 15분 거리"
      },
      {
        "name": "비봉면 전원주택",
        "address": "전북 완주군 비봉면",
        "size": "약 215평 대지",
        "price": "1억 5,000만원",
        "auction": "https://www.youtube.com/watch?v=Yp3j3mm9D1o",
        "infra": "산골짜기 위치, 조용한 환경, 자연 친화적"
      },
      {
        "name": "소양면 농막 캠핑장",
        "address": "전북 완주군 소양면 신원리",
        "size": "6평 농막 포함",
        "price": "9,000만원",
        "auction": "https://sigoljibmeme.com/board/7412",
        "infra": "전기·수도 연결, 전주시 차량 12분 거리, 개인 캠핑장 활용 가능"
      }
  ]
},
"2억~5억": {
  "houses": [
    {
        "name": "소양면 전원주택",
        "address": "전북 완주군 소양면",
        "size": "대지 154.88평, 건물 31.19평",
        "price": "2억 5,000만원",
        "auction": "https://mland.kcro.co.kr/offer/61264966",
        "infra": "전주시 차량 15분 거리, 조용한 전원 환경"
      },
      {
        "name": "구이면 전원주택",
        "address": "전북 완주군 구이면",
        "size": "약 94평",
        "price": "3억 5,000만원",
        "auction": "https://www.msojang.com/house2/177",
        "infra": "황토 및 편백 마감, 만경강 도보 거리, 도심 접근성 우수"
      },
      {
        "name": "이서면 은교리 전원주택",
        "address": "전북 완주군 이서면 은교리",
        "size": "정보 미제공",
        "price": "5억",
        "auction": "https://blog.naver.com/itemnuri/222832743036",
        "infra": "전주 혁신도시 차량 10분, 서전주IC 차량 5분"
      }
  ]
},
"5억~10억": {
  "houses": [
    {
        "name": "용진읍 상삼리 단독주택",
        "address": "전북 완주군 용진읍 상삼리",
        "size": "311.22m² (94.1평)",
        "price": "5억 5,000만원",
        "auction": "https://www.msojang.com/house2/207",
        "infra": "도심 접근성 우수, 주차 공간 8대, 근생시설 활용 가능"
      },
      {
        "name": "구이면 황토전원주택",
        "address": "전북 완주군 구이면",
        "size": "정보 미제공",
        "price": "5억 6,000만원",
        "auction": "https://www.youtube.com/watch?v=i0F5DlMCZqw",
        "infra": "계곡 접한 위치, 하천 정비사업 완료, 자연 친화적"
      },
      {
        "name": "소양면 전원주택",
        "address": "전북 완주군 소양면",
        "size": "정보 미제공",
        "price": "6억",
        "auction": "https://www.youtube.com/watch?v=ZpaoOEmQoXw",
        "infra": "펜트하우스, 루프탑 포함, 내진설계 완료"
      }
  ]
},
"10억~15억": {
  "houses": [
    {
        "name": "화산면 축사 포함 전원주택",
        "address": "전북 완주군 화산면",
        "size": "정보 미제공",
        "price": "13억",
        "auction": "https://www.band.us/band/94961391",
        "infra": "부지면적 넓음, 축사 포함, 다양한 활용 가능"
      },
      {
        "name": "운주면 전원주택",
        "address": "전북 완주군 운주면",
        "size": "정보 미제공",
        "price": "13억 8,000만원",
        "auction": "https://www.msojang.com/house2/123",
        "infra": "계곡 접한 위치, 수영장 및 자쿠지 포함, 근린생활시설 활용 가능"
      },
      {
        "name": "고산면 전원주택",
        "address": "전북 완주군 고산면",
        "size": "정보 미제공",
        "price": "14억",
        "auction": "https://www.msojang.com/house2/177",
        "infra": "황토 및 편백 마감, 만경강 도보 거리, 도심 접근성 우수"
      }
  ]
},
"15억~20억": {
  "houses": [
    {
        "name": "비봉면 전원주택",
        "address": "전북 완주군 비봉면",
        "size": "정보 미제공",
        "price": "15억",
        "auction": "https://www.instagram.com/reel/DJDfXFFuydZ/",
        "infra": "총 1,000평 부지, 주택 4채 포함, 건축가 설계 작품"
      },
      {
        "name": "고산면 전원주택",
        "address": "전북 완주군 고산면",
        "size": "정보 미제공",
        "price": "16억",
        "auction": "https://www.msojang.com/house2/177",
        "infra": "황토 및 편백 마감, 만경강 도보 거리, 도심 접근성 우수"
      },
      {
        "name": "운주면 전원주택",
        "address": "전북 완주군 운주면",
        "size": "정보 미제공",
        "price": "17억",
        "auction": "https://www.msojang.com/house2/123",
        "infra": "계곡 접한 위치, 수영장 및 자쿠지 포함, 근린생활시설 활용 가능"
      }
  ]
},
"20억 이상": {
  "houses": [
    {
        "name": "비봉면 전원주택",
        "address": "전북 완주군 비봉면",
        "size": "정보 미제공",
        "price": "20억",
        "auction": "https://www.instagram.com/reel/DJDfXFFuydZ/",
        "infra": "총 1,000평 부지, 주택 4채 포함, 건축가 설계 작품"
      },
      {
        "name": "화산면 전원주택",
        "address": "전북 완주군 화산면",
        "size": "정보 미제공",
        "price": "21억",
        "auction": "https://www.band.us/band/94961391",
        "infra": "부지면적 넓음, 축사 포함, 다양한 활용 가능"
      },
      {
        "name": "운주면 전원주택",
        "address": "전북 완주군 운주면",
        "size": "정보 미제공",
        "price": "22억",
        "auction": "https://www.msojang.com/house2/123",
        "infra": "계곡 접한 위치, 수영장 및 자쿠지 포함, 근린생활시설 활용 가능"
      }
  ]
}
},

"전라북도 고창군":{
"~2억":{
  "houses": [
    {
      "name": "고창읍 중심 소형 아파트",
      "address": "전북 고창군 고창읍",
      "size": "59m² (18평)",
      "price": "1억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "고창읍 중심, 도보 5분 내 버스 정류장, 근처 마트 및 병원"
    },
    {
      "name": "농촌 전원주택",
      "address": "전북 고창군 아산면",
      "size": "82m² (25평)",
      "price": "1억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "조용한 농촌 지역, 차량 10분 내 초등학교, 근처 농협"
    },
    {
      "name": "단독주택 매매",
      "address": "전북 고창군 해리면",
      "size": "75m² (22평)",
      "price": "1억 9,500만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "해리면 중심지, 도보 10분 내 시장, 버스 정류장 인근"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "신축 아파트",
      "address": "전북 고창군 고창읍",
      "size": "84m² (25평)",
      "price": "3억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "고창읍 신도시, 대형마트 도보 5분, 초등학교 인근"
    },
    {
      "name": "전원주택",
      "address": "전북 고창군 상하면",
      "size": "120m² (36평)",
      "price": "4억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "상하면 조용한 지역, 차량 15분 내 고창읍, 근처 산책로"
    },
    {
      "name": "단독주택",
      "address": "전북 고창군 공음면",
      "size": "100m² (30평)",
      "price": "2억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "공음면 중심지, 도보 5분 내 버스 정류장, 근처 마트"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "고급 전원주택",
      "address": "전북 고창군 성송면",
      "size": "150m² (45평)",
      "price": "6억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "성송면 자연환경, 차량 10분 내 고창읍, 근처 골프장"
    },
    {
      "name": "신축 단독주택",
      "address": "전북 고창군 고수면",
      "size": "130m² (39평)",
      "price": "5억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "고수면 중심지, 도보 10분 내 초등학교, 근처 마트"
    },
    {
      "name": "전원주택",
      "address": "전북 고창군 흥덕면",
      "size": "140m² (42평)",
      "price": "7억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "흥덕면 자연환경, 차량 15분 내 고창읍, 근처 산책로"
    }
  ]
},
"10억~15억": {
  "houses": [
    {
      "name": "럭셔리 전원주택",
      "address": "전북 고창군 신림면",
      "size": "200m² (60평)",
      "price": "12억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "신림면 고급 주택지, 차량 10분 내 고창읍, 근처 골프장"
    },
    {
      "name": "고급 단독주택",
      "address": "전북 고창군 대산면",
      "size": "180m² (54평)",
      "price": "11억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "대산면 중심지, 도보 10분 내 초등학교, 근처 마트"
    },
    {
      "name": "전원주택",
      "address": "전북 고창군 무장면",
      "size": "190m² (57평)",
      "price": "13억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "무장면 자연환경, 차량 15분 내 고창읍, 근처 산책로"
    }
  ]
},
"15억~20억": {
  "houses": [
    {
      "name": "프리미엄 전원주택",
      "address": "전북 고창군 해리면",
      "size": "220m² (66평)",
      "price": "17억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "해리면 고급 주택지, 차량 10분 내 고창읍, 근처 골프장"
    },
    {
      "name": "럭셔리 단독주택",
      "address": "전북 고창군 상하면",
      "size": "210m² (63평)",
      "price": "16억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "상하면 중심지, 도보 10분 내 초등학교, 근처 마트"
    },
    {
      "name": "전원주택",
      "address": "전북 고창군 공음면",
      "size": "230m² (69평)",
      "price": "18억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "공음면 자연환경, 차량 15분 내 고창읍, 근처 산책로"
    }
  ]
},
"20억 이상": {
  "houses": [
    {
      "name": "초호화 전원주택",
      "address": "전북 고창군 성송면",
      "size": "300m² (90평)",
      "price": "22억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "성송면 고급 주택지, 차량 10분 내 고창읍, 근처 골프장"
    },
    {
      "name": "프리미엄 단독주택",
      "address": "전북 고창군 고수면",
      "size": "280m² (84평)",
      "price": "21억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "고수면 중심지, 도보 10분 내 초등학교, 근처 마트"
    },
    {
      "name": "럭셔리 전원주택",
      "address": "전북 고창군 흥덕면",
      "size": "290m² (87평)",
      "price": "23억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "흥덕면 자연환경, 차량 15분 내 고창읍, 근처 산책로"
    }
  ]
}
},

"전라북도 부안군":{
"~2억":{
  "houses": [
    {
      "name": "봉덕주공아파트",
      "address": "전북 부안군 부안읍 봉덕리 873",
      "size": "49.62m² (15평)",
      "price": "9,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "부안읍 중심, 대중교통 접근성 우수, 인근에 상가 및 공공시설 위치"
    },
    {
      "name": "부안현대아파트",
      "address": "전북 부안군 부안읍 봉신길 19",
      "size": "84.62m² (25평)",
      "price": "1억 3,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "도서관 인접, 조경 우수, 대형마트 근처"
    },
    {
      "name": "동신무지개아파트",
      "address": "전북 부안군 부안읍 진성길 26",
      "size": "83.43m² (25평)",
      "price": "4,160만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "주변에 공공시설 및 상업시설 위치, 교통 편리"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "부안봉덕오투그란데",
      "address": "전북 부안군 부안읍 봉덕리 918",
      "size": "84.93m² (25평)",
      "price": "3억 1,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "신축 아파트, 대단지, 상업시설 및 학교 근접"
    },
    {
      "name": "미소가애",
      "address": "전북 부안군 부안읍 석정로 262",
      "size": "84.9m² (25평)",
      "price": "3억 1,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "대단지 아파트, 상업시설 및 공공기관 근접"
    },
    {
      "name": "하이안아파트",
      "address": "전북 부안군 부안읍 오리정로 172",
      "size": "84.92m² (25평)",
      "price": "2억",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "서림고 도보 거리, 대중교통 접근성 우수"
    }
  ]
},
"5억~10억": {
  "houses": [
     {
      "name": "부안오투그란데2차",
      "address": "전북 부안군 부안읍 서외리 632",
      "size": "84.95m² (25평)",
      "price": "4억 8,500만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "신축 아파트, 대단지, 상업시설 및 학교 근접"
    },
    {
      "name": "라온프라이빗아파트",
      "address": "전북 부안군 부안읍 봉덕리 920",
      "size": "101.16m² (31평)",
      "price": "4억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "대단지 아파트, 상업시설 및 공공기관 근접"
    },
    {
      "name": "부안 캐슬온리뷰",
      "address": "전북 부안군 부안읍 서외리 38-10",
      "size": "49.66m² (15평)",
      "price": "1억 6,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "신축 아파트, 상업시설 및 공공기관 근접"
    }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라북도 임실군":{
"~2억":{
  "houses": [
    {
      "name": "임실읍 2층 단독주택",
      "address": "전북 임실군 임실읍",
      "size": "85m² (25평)",
      "price": "1억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "임실읍 중심, 버스 정류장 도보 5분, 학교 인근"
    },
    {
      "name": "임실읍 아파트형 오피스텔",
      "address": "전북 임실군 임실읍",
      "size": "60m² (18평)",
      "price": "1억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "임실읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    },
    {
      "name": "임실읍 원룸형 주택",
      "address": "전북 임실군 임실읍",
      "size": "45m² (13평)",
      "price": "1억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "임실읍 중심, 버스 정류장 도보 2분, 상업시설 인근"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "임실읍 3층 단독주택",
      "address": "전북 임실군 임실읍",
      "size": "140m² (42평)",
      "price": "3억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "임실읍 중심, 버스 정류장 도보 5분, 학교 인근"
    },
    {
      "name": "임실읍 복층형 아파트",
      "address": "전북 임실군 임실읍",
      "size": "120m² (36평)",
      "price": "4억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "임실읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    },
    {
      "name": "임실읍 전원주택",
      "address": "전북 임실군 임실읍",
      "size": "160m² (48평)",
      "price": "4억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "임실읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "임실읍 4층 복합건물",
      "address": "전북 임실군 임실읍",
      "size": "200m² (60평)",
      "price": "7억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "임실읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    },
    {
      "name": "임실읍 고급 전원주택",
      "address": "전북 임실군 임실읍",
      "size": "250m² (75평)",
      "price": "8억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "임실읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "임실읍 상가주택",
      "address": "전북 임실군 임실읍",
      "size": "220m² (66평)",
      "price": "9억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "임실읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    }
  ]
},
"10억~15억": {
  "houses": [
    {
      "name": "임실읍 5층 상가건물",
      "address": "전북 임실군 임실읍",
      "size": "300m² (90평)",
      "price": "12억 7,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "임실읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    },
    {
      "name": "임실읍 고급 복층형 빌라",
      "address": "전북 임실군 임실읍",
      "size": "280m² (84평)",
      "price": "13억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "임실읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "임실읍 대형 전원주택",
      "address": "전북 임실군 임실읍",
      "size": "350m² (105평)",
      "price": "14억 9,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "임실읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    }
  ]
},
"15억~20억": {
  "houses": [
    {
      "name": "임실읍 6층 상가건물",
      "address": "전북 임실군 임실읍",
      "size": "400m² (120평)",
      "price": "17억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "임실읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    },
    {
      "name": "임실읍 고급 단독주택",
      "address": "전북 임실군 임실읍",
      "size": "380m² (114평)",
      "price": "18억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "임실읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "임실읍 대형 복합건물",
      "address": "전북 임실군 임실읍",
      "size": "500m² (150평)",
      "price": "19억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "임실읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    }
  ]
},
"20억 이상": {
  "houses": [
    {
      "name": "임실읍 고급 복합빌딩",
      "address": "전북 임실군 임실읍",
      "size": "600m² (180평)",
      "price": "22억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "임실읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    },
    {
      "name": "임실읍 대형 리조트형 빌라",
      "address": "전북 임실군 임실읍",
      "size": "700m² (210평)",
      "price": "24억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "임실읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "임실읍 고급 단독주택",
      "address": "전북 임실군 임실읍",
      "size": "800m² (240평)",
      "price": "29억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "임실읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    }
  ]
}
},

"전라북도 순창군":{
"~2억":{
  "houses": [
    {
      "name": "순창읍 2층 단독주택",
      "address": "전북 순창군 순창읍",
      "size": "90m² (27평)",
      "price": "1억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "순창읍 중심, 버스 정류장 도보 5분, 학교 인근"
    },
    {
      "name": "순창읍 아파트형 오피스텔",
      "address": "전북 순창군 순창읍",
      "size": "60m² (18평)",
      "price": "1억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "순창읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    },
    {
      "name": "순창읍 원룸형 주택",
      "address": "전북 순창군 순창읍",
      "size": "50m² (15평)",
      "price": "1억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "순창읍 중심, 버스 정류장 도보 2분, 상업시설 인근"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "순창읍 3층 단독주택",
      "address": "전북 순창군 순창읍",
      "size": "150m² (45평)",
      "price": "3억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "순창읍 중심, 버스 정류장 도보 5분, 학교 인근"
    },
    {
      "name": "순창읍 복층형 아파트",
      "address": "전북 순창군 순창읍",
      "size": "120m² (36평)",
      "price": "4억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "순창읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    },
    {
      "name": "순창읍 전원주택",
      "address": "전북 순창군 순창읍",
      "size": "180m² (54평)",
      "price": "4억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "순창읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    }
  ]
},
"5억~10억": {
  "houses": [
    {  "name": "순창읍 4층 복합건물",
      "address": "전북 순창군 순창읍",
      "size": "200m² (60평)",
      "price": "7억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "순창읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    },
    {
      "name": "순창읍 고급 전원주택",
      "address": "전북 순창군 순창읍",
      "size": "250m² (75평)",
      "price": "8억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "순창읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "순창읍 상가주택",
      "address": "전북 순창군 순창읍",
      "size": "220m² (66평)",
      "price": "9억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "순창읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    }
  ]
},
"10억~15억": {
  "houses": [
    {
      "name": "순창읍 5층 상가건물",
      "address": "전북 순창군 순창읍",
      "size": "300m² (90평)",
      "price": "12억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "순창읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    },
    {
      "name": "순창읍 고급 복층형 빌라",
      "address": "전북 순창군 순창읍",
      "size": "280m² (84평)",
      "price": "13억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "순창읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "순창읍 대형 전원주택",
      "address": "전북 순창군 순창읍",
      "size": "350m² (105평)",
      "price": "14억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "순창읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    }
  ]
},
"15억~20억": {
  "houses": [
    {
      "name": "순창읍 6층 상가건물",
      "address": "전북 순창군 순창읍",
      "size": "400m² (120평)",
      "price": "17억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "순창읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    },
    {
      "name": "순창읍 고급 단독주택",
      "address": "전북 순창군 순창읍",
      "size": "380m² (114평)",
      "price": "18억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "순창읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "순창읍 대형 복합건물",
      "address": "전북 순창군 순창읍",
      "size": "500m² (150평)",
      "price": "19억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "순창읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    }
  ]
},
"20억 이상": {
  "houses": [
    {
      "name": "순창읍 고급 복합빌딩",
      "address": "전북 순창군 순창읍",
      "size": "600m² (180평)",
      "price": "22억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "순창읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    },
    {
      "name": "순창읍 대형 리조트형 빌라",
      "address": "전북 순창군 순창읍",
      "size": "700m² (210평)",
      "price": "24억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "순창읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "순창읍 고급 단독주택",
      "address": "전북 순창군 순창읍",
      "size": "800m² (240평)",
      "price": "29억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "순창읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    }
  ]
}
},

"전라북도 진안군":{
"~2억":{
  "houses": [
    {
      "name": "진안읍 단독주택",
      "address": "전북 진안군 진안읍",
      "size": "80m² (24평)",
      "price": "1억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "진안읍 중심, 버스 정류장 도보 3분, 학교 인근"
    },
    {
      "name": "진안읍 원룸형 주택",
      "address": "전북 진안군 진안읍",
      "size": "40m² (12평)",
      "price": "1억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "진안읍 중심, 상업시설 밀집, 버스 정류장 도보 5분"
    },
    {
      "name": "진안읍 아파트형 오피스텔",
      "address": "전북 진안군 진안읍",
      "size": "50m² (15평)",
      "price": "1억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "진안읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "진안읍 3층 단독주택",
      "address": "전북 진안군 진안읍",
      "size": "150m² (45평)",
      "price": "3억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "진안읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    },
    {
      "name": "진안읍 전원주택",
      "address": "전북 진안군 진안읍",
      "size": "180m² (54평)",
      "price": "4억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "진안읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "진안읍 복층형 아파트",
      "address": "전북 진안군 진안읍",
      "size": "120m² (36평)",
      "price": "4억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "진안읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "진안읍 4층 상가건물",
      "address": "전북 진안군 진안읍",
      "size": "200m² (60평)",
      "price": "7억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "진안읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    },
    {
      "name": "진안읍 고급 전원주택",
      "address": "전북 진안군 진안읍",
      "size": "250m² (75평)",
      "price": "8억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "진안읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "진안읍 고급 빌라",
      "address": "전북 진안군 진안읍",
      "size": "220m² (66평)",
      "price": "9억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "진안읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    }
  ]
},
"10억~15억": {
  "houses": [
    {
      "name": "진안읍 5층 복합건물",
      "address": "전북 진안군 진안읍",
      "size": "300m² (90평)",
      "price": "12억 7,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "진안읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    },
    {
      "name": "진안읍 고급 복층형 빌라",
      "address": "전북 진안군 진안읍",
      "size": "280m² (84평)",
      "price": "13억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "진안읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "진안읍 고급 전원주택",
      "address": "전북 진안군 진안읍",
      "size": "350m² (105평)",
      "price": "14억 9,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "진안읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    }
  ]
},
"15억~20억": {
  "houses": [
    {
      "name": "진안읍 대형 상가건물",
      "address": "전북 진안군 진안읍",
      "size": "400m² (120평)",
      "price": "17억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "진안읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    },
    {
      "name": "진안읍 고급 단독주택",
      "address": "전북 진안군 진안읍",
      "size": "380m² (114평)",
      "price": "18억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "진안읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "진안읍 고급 복합건물",
      "address": "전북 진안군 진안읍",
      "size": "500m² (150평)",
      "price": "19억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "진안읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    }
  ]
},
"20억 이상": {
  "houses": [
    {
      "name": "진안읍 고급 복합빌딩",
      "address": "전북 진안군 진안읍",
      "size": "600m² (180평)",
      "price": "22억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "진안읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    },
    {
      "name": "진안읍 대형 리조트형 빌라",
      "address": "전북 진안군 진안읍",
      "size": "700m² (210평)",
      "price": "24억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "진안읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "진안읍 고급 단독주택",
      "address": "전북 진안군 진안읍",
      "size": "800m² (240평)",
      "price": "29억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "진안읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    }

  ]
}
},

"전라북도 무주군":{
"~2억":{
  "houses": [
    {
      "name": "무주읍 단독주택",
      "address": "전북 무주군 무주읍",
      "size": "75m² (23평)",
      "price": "1억 7,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "무주읍 중심, 버스 정류장 도보 5분, 학교 인근"
    },
    {
      "name": "무주읍 원룸형 주택",
      "address": "전북 무주군 무주읍",
      "size": "45m² (14평)",
      "price": "1억 2,500만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "무주읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    },
    {
      "name": "무주읍 아파트형 오피스텔",
      "address": "전북 무주군 무주읍",
      "size": "50m² (15평)",
      "price": "1억 9,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "무주읍 중심, 상업시설 밀집, 버스 정류장 도보 5분"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "무주읍 3층 단독주택",
      "address": "전북 무주군 무주읍",
      "size": "120m² (36평)",
      "price": "3억 3,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "무주읍 중심, 버스 정류장 도보 5분, 학교 인근"
    },
    {
      "name": "무주읍 전원주택",
      "address": "전북 무주군 무주읍",
      "size": "150m² (45평)",
      "price": "4억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "무주읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "무주읍 복층형 아파트",
      "address": "전북 무주군 무주읍",
      "size": "130m² (39평)",
      "price": "4억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "무주읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "무주읍 4층 상가건물",
      "address": "전북 무주군 무주읍",
      "size": "200m² (60평)",
      "price": "7억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "무주읍 중심, 상업시설 밀집, 버스 정류장 도보 5분"
    },
    {
      "name": "무주읍 고급 전원주택",
      "address": "전북 무주군 무주읍",
      "size": "250m² (75평)",
      "price": "8억 3,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "무주읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "무주읍 고급 빌라",
      "address": "전북 무주군 무주읍",
      "size": "220m² (66평)",
      "price": "9억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "무주읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    }
  ]
},
"10억~15억": {
  "houses": [
     {
      "name": "무주읍 5층 상가건물",
      "address": "전북 무주군 무주읍",
      "size": "300m² (90평)",
      "price": "12억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "무주읍 중심, 상업시설 밀집, 버스 정류장 도보 5분"
    },
    {
      "name": "무주읍 고급 복층형 빌라",
      "address": "전북 무주군 무주읍",
      "size": "280m² (84평)",
      "price": "13억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "무주읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "무주읍 고급 전원주택",
      "address": "전북 무주군 무주읍",
      "size": "350m² (105평)",
      "price": "14억 9,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "무주읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    }
  ]
},
"15억~20억": {
  "houses": [
    {
      "name": "무주읍 대형 상가건물",
      "address": "전북 무주군 무주읍",
      "size": "400m² (120평)",
      "price": "17억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "무주읍 중심, 상업시설 밀집, 버스 정류장 도보 5분"
    },
    {
      "name": "무주읍 고급 단독주택",
      "address": "전북 무주군 무주읍",
      "size": "380m² (114평)",
      "price": "18억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "무주읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "무주읍 대형 복합건물",
      "address": "전북 무주군 무주읍",
      "size": "500m² (150평)",
      "price": "19억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "무주읍 중심, 상업시설 밀집, 버스 정류장 도보 5분"
    }
  ]
},
"20억 이상": {
  "houses": [
    {
      "name": "무주읍 고급 복합빌딩",
      "address": "전북 무주군 무주읍",
      "size": "600m² (180평)",
      "price": "22억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "무주읍 중심, 상업시설 밀집, 버스 정류장 도보 5분"
    },
    {
      "name": "무주읍 대형 리조트형 빌라",
      "address": "전북 무주군 무주읍",
      "size": "700m² (210평)",
      "price": "24억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "무주읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "무주읍 고급 단독주택",
      "address": "전북 무주군 무주읍",
      "size": "800m² (240평)",
      "price": "29억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "무주읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    }
  ]
}
},

"전라북도 장수군":{
"~2억":{
  "houses": [
    {
      "name": "장수읍 단독주택",
      "address": "전북 장수군 장수읍",
      "size": "80m² (24평)",
      "price": "1억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "장수읍 중심, 버스 정류장 도보 5분, 학교 인근"
    },
    {
      "name": "장수읍 원룸형 주택",
      "address": "전북 장수군 장수읍",
      "size": "40m² (12평)",
      "price": "1억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "장수읍 중심, 상업시설 밀집, 버스 정류장 도보 3분"
    },
    {
      "name": "장수읍 아파트형 오피스텔",
      "address": "전북 장수군 장수읍",
      "size": "45m² (14평)",
      "price": "1억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "장수읍 중심, 상업시설 밀집, 버스 정류장 도보 5분"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "장수읍 2층 단독주택",
      "address": "전북 장수군 장수읍",
      "size": "100m² (30평)",
      "price": "2억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "장수읍 중심, 버스 정류장 도보 5분, 학교 인근"
    },
    {
      "name": "장수읍 전원주택",
      "address": "전북 장수군 장수읍",
      "size": "120m² (36평)",
      "price": "3억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "장수읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "장수읍 복층형 아파트",
      "address": "전북 장수군 장수읍",
      "size": "110m² (33평)",
      "price": "4억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "장수읍 중심, 상업시설 밀집, 버스 정류장 도보 5분"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "장수읍 상가건물",
      "address": "전북 장수군 장수읍",
      "size": "150m² (45평)",
      "price": "6억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "장수읍 중심, 상업시설 밀집, 버스 정류장 도보 5분"
    },
    {
      "name": "장수읍 고급 전원주택",
      "address": "전북 장수군 장수읍",
      "size": "180m² (54평)",
      "price": "8억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "장수읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "장수읍 고급 복층형 아파트",
      "address": "전북 장수군 장수읍",
      "size": "160m² (48평)",
      "price": "9억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "장수읍 중심, 상업시설 밀집, 버스 정류장 도보 5분"
    }
  ]
},
"10억~15억": {
  "houses": [
    {
      "name": "장수읍 4층 상가건물",
      "address": "전북 장수군 장수읍",
      "size": "200m² (60평)",
      "price": "12억 7,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "장수읍 중심, 상업시설 밀집, 버스 정류장 도보 5분"
    },
    {
      "name": "장수읍 고급 복합형 빌라",
      "address": "전북 장수군 장수읍",
      "size": "250m² (75평)",
      "price": "13억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "장수읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "장수읍 고급 단독주택",
      "address": "전북 장수군 장수읍",
      "size": "300m² (90평)",
      "price": "14억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "장수읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    }
  ]
},
"15억~20억": {
  "houses": [
    {
      "name": "장수읍 대형 상가건물",
      "address": "전북 장수군 장수읍",
      "size": "400m² (120평)",
      "price": "17억 9,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "장수읍 중심, 상업시설 밀집, 버스 정류장 도보 5분"
    },
    {
      "name": "장수읍 대형 리조트형 빌라",
      "address": "전북 장수군 장수읍",
      "size": "450m² (135평)",
      "price": "18억 4,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "장수읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "장수읍 고급 복합건물",
      "address": "전북 장수군 장수읍",
      "size": "500m² (150평)",
      "price": "19억 7,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "장수읍 중심, 상업시설 밀집, 버스 정류장 도보 5분"
    }
  ]
},
"20억 이상": {
  "houses": [
    {
      "name": "장수읍 대형 복합빌딩",
      "address": "전북 장수군 장수읍",
      "size": "600m² (180평)",
      "price": "22억 3,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "장수읍 중심, 상업시설 밀집, 버스 정류장 도보 5분"
    },
    {
      "name": "장수읍 대형 리조트형 단독주택",
      "address": "전북 장수군 장수읍",
      "size": "700m² (210평)",
      "price": "24억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "장수읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "장수읍 고급 단독주택",
      "address": "전북 장수군 장수읍",
      "size": "800m² (240평)",
      "price": "28억 9,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "장수읍 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    }
  ]
}
},


"전라남도 목포시":{
"~2억":{
  "houses": [
   {
    "name": "상동 소형 아파트",
    "address": "전남 목포시 상동",
    "size": "59m² (18평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "하당동 소형 빌라",
    "address": "전남 목포시 하당동",
    "size": "36m² (11평)",
    "price": "1억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "하당동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "용해동 단독주택",
    "address": "전남 목포시 용해동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "용해동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  } 
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "상동 신축 아파트",
    "address": "전남 목포시 상동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "하당동 신축 빌라",
    "address": "전남 목포시 하당동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "하당동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "용해동 신축 빌라",
    "address": "전남 목포시 용해동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "용해동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "상동 대단지 아파트",
    "address": "전남 목포시 상동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "하당동 대단지 아파트",
    "address": "전남 목포시 하당동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "하당동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "용해동 대단지 아파트",
    "address": "전남 목포시 용해동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "용해동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라남도 여수시":{
"~2억":{
  "houses": [
    {
    "name": "여서동 소형 아파트",
    "address": "전남 여수시 여서동",
    "size": "59m² (18평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "여서동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "문수동 소형 빌라",
    "address": "전남 여수시 문수동",
    "size": "36m² (11평)",
    "price": "1억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "문수동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "돌산읍 단독주택",
    "address": "전남 여수시 돌산읍",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "돌산읍 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "여서동 신축 아파트",
    "address": "전남 여수시 여서동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "여서동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "문수동 신축 빌라",
    "address": "전남 여수시 문수동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "문수동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "돌산읍 신축 빌라",
    "address": "전남 여수시 돌산읍",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "돌산읍 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
     {
    "name": "여서동 대단지 아파트",
    "address": "전남 여수시 여서동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "여서동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "문수동 대단지 아파트",
    "address": "전남 여수시 문수동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "문수동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "돌산읍 대단지 아파트",
    "address": "전남 여수시 돌산읍",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "돌산읍 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라남도 순천시":{
"~2억":{
  "houses": [
   {
    "name": "조례동 소형 아파트",
    "address": "전남 순천시 조례동",
    "size": "59m² (18평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "조례동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "연향동 소형 빌라",
    "address": "전남 순천시 연향동",
    "size": "36m² (11평)",
    "price": "1억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "연향동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "풍덕동 단독주택",
    "address": "전남 순천시 풍덕동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "풍덕동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  } 
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "조례동 신축 아파트",
    "address": "전남 순천시 조례동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "조례동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "연향동 신축 빌라",
    "address": "전남 순천시 연향동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "연향동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "풍덕동 신축 빌라",
    "address": "전남 순천시 풍덕동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "풍덕동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "조례동 대단지 아파트",
    "address": "전남 순천시 조례동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "조례동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "연향동 대단지 아파트",
    "address": "전남 순천시 연향동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "연향동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "풍덕동 대단지 아파트",
    "address": "전남 순천시 풍덕동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "풍덕동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라남도 나주시":{
"~2억":{
  "houses": [
    {
    "name": "빛가람동 소형 아파트",
    "address": "전남 나주시 빛가람동",
    "size": "59m² (18평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "빛가람동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "송월동 소형 빌라",
    "address": "전남 나주시 송월동",
    "size": "36m² (11평)",
    "price": "1억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "송월동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "금천면 단독주택",
    "address": "전남 나주시 금천면",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "금천면 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "빛가람동 신축 아파트",
    "address": "전남 나주시 빛가람동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "빛가람동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "송월동 신축 빌라",
    "address": "전남 나주시 송월동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "송월동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "금천면 신축 빌라",
    "address": "전남 나주시 금천면",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "금천면 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "빛가람동 대단지 아파트",
    "address": "전남 나주시 빛가람동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "빛가람동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "송월동 대단지 아파트",
    "address": "전남 나주시 송월동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "송월동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "금천면 대단지 아파트",
    "address": "전남 나주시 금천면",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "금천면 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라남도 광양시":{
"~2억":{
  "houses": [
    {
    "name": "중마동 소형 아파트",
    "address": "전남 광양시 중마동",
    "size": "59m² (18평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중마동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "광영동 소형 빌라",
    "address": "전남 광양시 광영동",
    "size": "36m² (11평)",
    "price": "1억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "광영동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "태인동 단독주택",
    "address": "전남 광양시 태인동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "태인동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "중마동 신축 아파트",
    "address": "전남 광양시 중마동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중마동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "광영동 신축 빌라",
    "address": "전남 광양시 광영동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "광영동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "태인동 신축 빌라",
    "address": "전남 광양시 태인동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "태인동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "중마동 대단지 아파트",
    "address": "전남 광양시 중마동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중마동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "광영동 대단지 아파트",
    "address": "전남 광양시 광영동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "광영동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "태인동 대단지 아파트",
    "address": "전남 광양시 태인동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "태인동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라남도 담양군":{
"~2억":{
  "houses": [
    {
      "name": "담양청전APT",
      "address": "전남 담양군 담양읍 백동리 100",
      "size": "84.75㎡",
      "price": "1억 4,000만원(2024.05.30, 4층)",
      "infra": "중심지, 생활편의시설 인접"
    },
    {
      "name": "채움아파트",
      "address": "전남 담양군 담양읍 백동리 174",
      "size": "105.8㎡",
      "price": "1억 9,000만원(2024.03.22, 3층)",
      "infra": "중심지, 생활편의시설 인접"
    },
    {
      "name": "담양 별해리 아파트",
      "address": "전남 담양군 담양읍 백동리 182",
      "size": "59.98㎡",
      "price": "1억 8,000만원(2024.04.27, 10층)",
      "infra": "중심지, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "양우내안애퍼스트힐 2단지",
      "address": "전남 담양군 담양읍 담빛리 356",
      "size": "84.97㎡",
      "price": "3억 1,000만원(2024.05.29, 10층)",
      "infra": "신축, 대단지, 생활편의시설 인접"
    },
    {
      "name": "양우내안애퍼스트힐 1단지",
      "address": "전남 담양군 담양읍 담빛리 345",
      "size": "59.98㎡",
      "price": "2억 4,400만원(2024.05.16, 7층)",
      "infra": "신축, 대단지, 생활편의시설 인접"
    },
    {
      "name": "담양 별해리 아파트",
      "address": "전남 담양군 담양읍 백동리 182",
      "size": "81.94㎡",
      "price": "2억 1,500만원(2024.04.25, 4층)",
      "infra": "중심지, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "창평면 전원주택",
      "address": "전남 담양군 창평면",
      "size": "약 85평",
      "price": "8억 5,000만원",
      "infra": "남향, 넓은 마당, 조용한 전원 환경"
    },
    {
      "name": "창평면 한옥 전원주택",
      "address": "전남 담양군 창평면 유천리",
      "size": "본채 35.2평, 별채 12평",
      "price": "5억 3,000만원",
      "infra": "호수 전망, 배산임수 명당터"
    },
    {
      "name": "담양읍 단독주택",
      "address": "전남 담양군 담양읍",
      "size": "약 935㎡",
      "price": "5억원",
      "infra": "1층 구조, 방 3개, 넓은 대지"
    }
  ]
},
"10억~15억": {
  "houses": [
    {
      "name": "담양읍 상가점포",
      "address": "전남 담양군 담양읍",
      "size": "166㎡",
      "price": "10억원",
      "infra": "신축 단독건물, 카페 운영 가능"
    },
    {
      "name": "담양읍 상가건물",
      "address": "전남 담양군 담양읍",
      "size": "201㎡",
      "price": "5억 5,000만원",
      "infra": "급매, 권리금 없음, 1~2층 전체"
    },
    {
      "name": "담양읍 단독주택",
      "address": "전남 담양군 담양읍",
      "size": "약 935㎡",
      "price": "5억원",
      "infra": "1층 구조, 방 3개, 넓은 대지"
    }
  ]
},
"15억~20억": {
  "houses": [
    {
      "name": "담양읍 대지 283평",
      "address": "전남 담양군 담양읍 담빛리",
      "size": "약 935㎡",
      "price": "15억 5,000만원",
      "infra": "1종 일반주거지역, 카페 및 식당 적합"
    },
    {
      "name": "담양읍 공장",
      "address": "전남 담양군 담양읍 운교리",
      "size": "1층 구조",
      "price": "15억원",
      "infra": "공장 용도, 넓은 대지"
    },
    {
      "name": "담양읍 상가건물",
      "address": "전남 담양군 담양읍",
      "size": "201㎡",
      "price": "5억 5,000만원",
      "infra": "급매, 권리금 없음, 1~2층 전체"
    }

  ]
},
"20억 이상": {
  "houses": [
    {
      "name": "추월산 자락 전원주택",
      "address": "전남 담양군",
      "size": "약 700평 대지",
      "price": "20억원 이상",
      "infra": "추월산 자락 위치, 넓은 공간"
    },
    {
      "name": "담양읍 대형 카페",
      "address": "전남 담양군 담양읍",
      "size": "약 600평 대지",
      "price": "35억원",
      "infra": "대형 카페 운영, 투자용 부동산"
    },
    {
      "name": "담양읍 대지 283평",
      "address": "전남 담양군 담양읍 담빛리",
      "size": "약 935㎡",
      "price": "15억 5,000만원",
      "infra": "1종 일반주거지역, 카페 및 식당 적합"
    }
  ]
}
},

"전라남도 곡성군":{
"~2억":{
  "houses": [
    {
      "name": "곡성기차마을아뜨리움",
      "address": "전남 곡성군 곡성읍 학정리",
      "size": "59.66㎡",
      "price": "1억 5,000만원(2024.12, 5층)",
      "infra": "중심지, 생활편의시설 인접"
    },
    {
      "name": "한양파크빌",
      "address": "전남 곡성군 곡성읍 학정리",
      "size": "79㎡",
      "price": "1억 9,000만원(2020년 기준, 14년차)",
      "infra": "중심지, 생활편의시설 인접"
    },
    {
      "name": "성암맨션",
      "address": "전남 곡성군 옥과면 죽림리",
      "size": "59㎡",
      "price": "7,000만원(2025.01, 12층)",
      "infra": "옥과면 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "옥과해광샹그릴라",
      "address": "전남 곡성군 옥과면 죽림리",
      "size": "59.43㎡",
      "price": "1억 7,000만원(2025.01, 9층)",
      "infra": "옥과면 중심, 생활편의시설 인접"
    },
    {
      "name": "메카센트럴",
      "address": "전남 곡성군 곡성읍",
      "size": "84㎡",
      "price": "2억 2,000만원(2024년 기준, 2008년 준공)",
      "infra": "곡성읍 중심, 생활편의시설 인접"
    },
    {
      "name": "곡성기차마을아뜨리움(대형)",
      "address": "전남 곡성군 곡성읍 학정리",
      "size": "85㎡",
      "price": "2억 1,000만원(2010년 준공, 최근 실거래가)",
      "infra": "곡성읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라남도 구례군":{
"~2억":{
  "houses": [
    {
      "name": "구례산이고운",
      "address": "전남 구례군 구례읍",
      "size": "67㎡",
      "price": "1억 2,000만원(2014년 준공, 최근 실거래가)",
      "infra": "구례읍 중심, 생활편의시설 인접"
    },
    {
      "name": "지리산파크맨션",
      "address": "전남 구례군 구례읍",
      "size": "59㎡",
      "price": "1억원(2000년 준공, 최근 실거래가)",
      "infra": "구례읍 중심, 생활편의시설 인접"
    },
    {
      "name": "삼우",
      "address": "전남 구례군 구례읍",
      "size": "60㎡",
      "price": "8,000만원(1993년 준공, 최근 실거래가)",
      "infra": "구례읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "구례미라벨아파트1차",
      "address": "전남 구례군 구례읍",
      "size": "85㎡",
      "price": "2억 7,000만원(2019년 준공, 최근 실거래가)",
      "infra": "구례읍 중심, 생활편의시설 인접"
    },
    {
      "name": "미라벨아파트2차",
      "address": "전남 구례군 구례읍",
      "size": "83㎡",
      "price": "2억 5,000만원(2019년 준공, 최근 실거래가)",
      "infra": "구례읍 중심, 생활편의시설 인접"
    },
    {
      "name": "미라벨아파트2차(소형)",
      "address": "전남 구례군 구례읍",
      "size": "77㎡",
      "price": "2억 3,000만원(2019년 준공, 최근 실거래가)",
      "infra": "구례읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라남도 고흥군":{
"~2억":{
  "houses": [
    {
      "name": "녹동주공아파트",
      "address": "전남 고흥군 도양읍 봉암리 1514",
      "size": "49.62㎡",
      "price": "7,400만원(2024.05.26, 1층)",
      "infra": "도양읍 중심, 생활편의시설 인접"
    },
    {
      "name": "장미2차",
      "address": "전남 고흥군 고흥읍 남계리 409-1",
      "size": "59.58㎡",
      "price": "1억 100만원(2024.09.10, 7층)",
      "infra": "고흥읍 중심, 생활편의시설 인접"
    },
    {
      "name": "남계주공아파트",
      "address": "전남 고흥군 고흥읍 남계리",
      "size": "49.62㎡",
      "price": "9,000만원(2024.11.06, 15층)",
      "infra": "고흥읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "고흥 승원팰리체 더퍼스트",
      "address": "전남 고흥군 고흥읍 남계리 1044",
      "size": "84.99㎡",
      "price": "3억 5,500만원(2024.11.01, 14층)",
      "infra": "신축, 고흥읍 중심, 생활편의시설 인접"
    },
    {
      "name": "편한누리",
      "address": "전남 고흥군 고흥읍 서문리 218-19",
      "size": "91.92㎡",
      "price": "2억 1,000만원(2024.10.03, 9층)",
      "infra": "고흥읍 중심, 생활편의시설 인접"
    },
    {
      "name": "행정아파트",
      "address": "전남 고흥군 고흥읍 남계리",
      "size": "84.26㎡",
      "price": "1억 1,000만원(2024.11.07, 1층)",
      "infra": "고흥읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라남도 보성군":{
"~2억":{
  "houses": [
     {
      "name": "보성장미힐아파트",
      "address": "전남 보성군 보성읍 우산리 7-2",
      "size": "84.3㎡",
      "price": "1억 6,000만원(2024.05.28, 15층)",
      "infra": "보성읍 중심, 생활편의시설 인접"
    },
    {
      "name": "성암해그린",
      "address": "전남 보성군 보성읍",
      "size": "65.3㎡",
      "price": "1억 6,000만원(2024.09.30, 8층)",
      "infra": "보성읍 중심, 생활편의시설 인접"
    },
    {
      "name": "장미아파트",
      "address": "전남 보성군 벌교읍 회정리 486",
      "size": "59.35㎡",
      "price": "7,500만원(2024.05.01, 6층)",
      "infra": "벌교읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "보성센트럴뷰",
      "address": "전남 보성군 보성읍",
      "size": "85㎡",
      "price": "2억원(2016년 준공, 최근 실거래가)",
      "infra": "보성읍 중심, 생활편의시설 인접"
    },
    {
      "name": "보성센트럴뷰(소형)",
      "address": "전남 보성군 보성읍",
      "size": "73㎡",
      "price": "1억 7,000만원(2016년 준공, 최근 실거래가)",
      "infra": "보성읍 중심, 생활편의시설 인접"
    },
    {
      "name": "성암해그린(대형)",
      "address": "전남 보성군 보성읍",
      "size": "84㎡",
      "price": "1억 7,000만원(2013년 준공, 최근 실거래가)",
      "infra": "보성읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라남도 화순군":{
"~2억":{
  "houses": [
    {
      "name": "금호타운",
      "address": "전남 화순군 화순읍",
      "size": "85㎡",
      "price": "1억 7,000만원(1997년 준공, 최근 실거래가)",
      "infra": "화순읍 중심, 생활편의시설 인접"
    },
    {
      "name": "한국아델리움",
      "address": "전남 화순군 화순읍",
      "size": "85㎡",
      "price": "1억 7,000만원(2002년 준공, 최근 실거래가)",
      "infra": "화순읍 중심, 생활편의시설 인접"
    },
    {
      "name": "부영2",
      "address": "전남 화순군 화순읍",
      "size": "132㎡",
      "price": "2억 3,000만원(1995년 준공, 최근 실거래가)",
      "infra": "화순읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "화순산이고운",
      "address": "전남 화순군 화순읍",
      "size": "85㎡",
      "price": "2억 9,000만원(2016년 준공, 최근 실거래가)",
      "infra": "화순읍 중심, 생활편의시설 인접"
    },
    {
      "name": "화순 삼천 한양립스",
      "address": "전남 화순군 화순읍",
      "size": "85㎡",
      "price": "2억 7,000만원(2020년 준공, 최근 실거래가)",
      "infra": "화순읍 중심, 생활편의시설 인접"
    },
    {
      "name": "대성베르힐",
      "address": "전남 화순군 화순읍",
      "size": "85㎡",
      "price": "2억 1,000만원(2009년 준공, 최근 실거래가)",
      "infra": "화순읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "힐스테이트화순2차",
      "address": "전남 화순군 화순읍",
      "size": "84.99㎡",
      "price": "5억 1,000만원(2025년 기준, 최근 실거래가)",
      "infra": "신축, 대단지, 생활편의시설 인접"
    }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라남도 장흥군":{
"~2억":{
  "houses": [
    {
      "name": "장흥주공1차",
      "address": "전남 장흥군 장흥읍",
      "size": "59㎡",
      "price": "1억 2,000만원(1996년 준공, 최근 실거래가)",
      "infra": "장흥읍 중심, 생활편의시설 인접"
    },
    {
      "name": "장흥주공2차",
      "address": "전남 장흥군 장흥읍",
      "size": "59㎡",
      "price": "1억 1,000만원(1997년 준공, 최근 실거래가)",
      "infra": "장흥읍 중심, 생활편의시설 인접"
    },
    {
      "name": "장흥현대",
      "address": "전남 장흥군 장흥읍",
      "size": "59㎡",
      "price": "1억 3,000만원(1998년 준공, 최근 실거래가)",
      "infra": "장흥읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
     {
      "name": "장흥삼성아파트",
      "address": "전남 장흥군 장흥읍",
      "size": "85㎡",
      "price": "2억 1,000만원(2008년 준공, 최근 실거래가)",
      "infra": "장흥읍 중심, 생활편의시설 인접"
    },
    {
      "name": "장흥삼성아파트(대형)",
      "address": "전남 장흥군 장흥읍",
      "size": "102㎡",
      "price": "2억 5,000만원(2008년 준공, 최근 실거래가)",
      "infra": "장흥읍 중심, 생활편의시설 인접"
    },
    {
      "name": "장흥현대(대형)",
      "address": "전남 장흥군 장흥읍",
      "size": "84㎡",
      "price": "1억 8,000만원(1998년 준공, 최근 실거래가)",
      "infra": "장흥읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라남도 강진군":{
"~2억":{
  "houses": [
    {
        "name": "강진군 단독주택 A",
        "address": "전남 강진군 강진읍",
        "size": "80m² (24평)",
        "price": "1억 5,000만원",
        "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
        "infra": "강진읍 중심, 버스정류장 도보 5분, 상업시설 밀집"
      },
      {
        "name": "강진군 전원주택 B",
        "address": "전남 강진군 군동면",
        "size": "100m² (30평)",
        "price": "1억 8,000만원",
        "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
        "infra": "군동면 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
      },
      {
        "name": "강진군 원룸형 주택 C",
        "address": "전남 강진군 강진읍",
        "size": "40m² (12평)",
        "price": "1억 3,000만원",
        "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
        "infra": "강진읍 중심, 버스정류장 도보 3분, 상업시설 밀집"
      }
  ]
},
"2억~5억": {
  "houses": [
    {
        "name": "강진군 복층형 주택 A",
        "address": "전남 강진군 강진읍",
        "size": "120m² (36평)",
        "price": "3억 5,000만원",
        "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
        "infra": "강진읍 중심, 버스정류장 도보 5분, 상업시설 밀집"
      },
      {
        "name": "강진군 전원주택 B",
        "address": "전남 강진군 군동면",
        "size": "150m² (45평)",
        "price": "4억 2,000만원",
        "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
        "infra": "군동면 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
      },
      {
        "name": "강진군 고급 주택 C",
        "address": "전남 강진군 강진읍",
        "size": "130m² (39평)",
        "price": "4억 5,000만원",
        "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
        "infra": "강진읍 중심, 버스정류장 도보 5분, 상업시설 밀집"
      }
  ]
},
"5억~10억": {
  "houses": [
    {
        "name": "강진군 대형 주택 A",
        "address": "전남 강진군 강진읍",
        "size": "200m² (60평)",
        "price": "6억 8,000만원",
        "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
        "infra": "강진읍 중심, 상업시설 밀집, 교통 편리"
      },
      {
        "name": "강진군 고급 주택 B",
        "address": "전남 강진군 군동면",
        "size": "250m² (75평)",
        "price": "8억 3,000만원",
        "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
        "infra": "군동면 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
      },
      {
        "name": "강진군 복합 주택 C",
        "address": "전남 강진군 강진읍",
        "size": "220m² (66평)",
        "price": "9억 5,000만원",
        "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
        "infra": "강진읍 중심, 상업시설 밀집, 교통 편리"
      }
  ]
},
"10억~15억": {
  "houses": [
    {
        "name": "강진군 대형 빌라 A",
        "address": "전남 강진군 강진읍",
        "size": "300m² (90평)",
        "price": "12억 3,000만원",
        "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
        "infra": "강진읍 중심, 상업시설 밀집, 교통 편리"
      },
      {
        "name": "강진군 리조트형 주택 B",
        "address": "전남 강진군 군동면",
        "size": "350m² (105평)",
        "price": "13억 5,000만원",
        "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
        "infra": "군동면 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
      },
      {
        "name": "강진군 고급 빌라 C",
        "address": "전남 강진군 강진읍",
        "size": "400m² (120평)",
        "price": "14억 2,000만원",
        "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
        "infra": "강진읍 중심, 상업시설 밀집, 교통 편리"
      }
  ]
},
"15억~20억": {
  "houses": [
    {
        "name": "강진군 대형 상업용 빌딩 A",
        "address": "전남 강진군 강진읍",
        "size": "500m² (150평)",
        "price": "17억 2,000만원",
        "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
        "infra": "강진읍 중심, 상업시설 밀집, 교통 편리"
      },
      {
        "name": "강진군 리조트형 고급 주택 B",
        "address": "전남 강진군 군동면",
        "size": "600m² (180평)",
        "price": "18억 5,000만원",
        "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
        "infra": "군동면 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
      },
      {
        "name": "강진군 고급 빌라 C",
        "address": "전남 강진군 강진읍",
        "size": "650m² (195평)",
        "price": "19억 8,000만원",
        "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
        "infra": "강진읍 중심, 상업시설 밀집, 교통 편리"
      }
  ]
},
"20억 이상": {
  "houses": [
{
        "name": "강진군 섬 마을 고급 빌딩 A",
        "address": "전남 강진군 강진읍",
        "size": "800m² (240평)",
        "price": "25억 5,000만원",
        "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
        "infra": "강진읍 중심, 상업시설 밀집, 교통 편리"
      },
      {
        "name": "강진군 고급 리조트형 주택 B",
        "address": "전남 강진군 군동면",
        "size": "1,000m² (300평)",
        "price": "28억 7,000만원",
        "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
        "infra": "군동면 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
      },
      {
        "name": "강진군 고급 빌라 C",
        "address": "전남 강진군 강진읍",
        "size": "1,200m² (360평)",
        "price": "32억 5,000만원",
        "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
        "infra": "강진읍 중심, 상업시설 밀집, 교통 편리"
      }
  ]
}
},

"전라남도 해남군":{
"~2억":{
  "houses": [
    {
      "name": "해남현대2차아파트",
      "address": "전남 해남군 해남읍 구교리",
      "size": "59.9㎡",
      "price": "1억 6,000만원(2024년 실거래, 10층)",
      "infra": "해남읍 중심, 생활편의시설 인접"
    },
    {
      "name": "해남삼성아파트",
      "address": "전남 해남군 해남읍 해리",
      "size": "59.9㎡",
      "price": "1억 8,000만원(2024년 실거래, 8층)",
      "infra": "해남읍 중심, 생활편의시설 인접"
    },
    {
      "name": "해남주공아파트",
      "address": "전남 해남군 해남읍 해리",
      "size": "59.9㎡",
      "price": "1억 5,000만원(2024년 실거래, 6층)",
      "infra": "해남읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "해남이편한세상",
      "address": "전남 해남군 해남읍 해리",
      "size": "84.97㎡",
      "price": "2억 6,000만원(2024년 실거래, 15층)",
      "infra": "신축, 대단지, 생활편의시설 인접"
    },
    {
      "name": "해남삼성아파트(대형)",
      "address": "전남 해남군 해남읍 해리",
      "size": "84.97㎡",
      "price": "2억 2,000만원(2024년 실거래, 10층)",
      "infra": "해남읍 중심, 생활편의시설 인접"
    },
    {
      "name": "해남현대2차아파트(대형)",
      "address": "전남 해남군 해남읍 구교리",
      "size": "84.97㎡",
      "price": "2억 1,000만원(2024년 실거래, 12층)",
      "infra": "해남읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라남도 영암군":{
"~2억":{
  "houses": [
    {
      "name": "청송2차 드림빌",
      "address": "전남 영암군 영암읍 역리 500",
      "size": "84.97㎡",
      "price": "1억 5,800만원(2024.10.09, 2층)",
      "infra": "영암읍 중심, 2013년 준공, 생활편의시설 인접"
    },
    {
      "name": "삼호아르미안",
      "address": "전남 영암군 삼호읍",
      "size": "80㎡",
      "price": "1억 6,500만원(2016년 준공, 최근 실거래가)",
      "infra": "삼호읍 중심, 신축, 생활편의시설 인접"
    },
    {
      "name": "한솔",
      "address": "전남 영암군 신북면",
      "size": "69㎡",
      "price": "1억 1,000만원(2014년 준공, 최근 실거래가)",
      "infra": "신북면 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "청송2차 드림빌(대형)",
      "address": "전남 영암군 영암읍 역리 500",
      "size": "84.97㎡",
      "price": "2억원(2024.06.19, 2층)",
      "infra": "영암읍 중심, 2013년 준공, 생활편의시설 인접"
    },
    {
      "name": "영암삼호퀸스빌2차",
      "address": "전남 영암군 삼호읍",
      "size": "84.91㎡",
      "price": "2억원(2024.10.08, 1층)",
      "infra": "삼호읍 중심, 2006년 준공, 생활편의시설 인접"
    },
    {
      "name": "영암삼호빌라트맨션",
      "address": "전남 영암군 삼호읍",
      "size": "59.84㎡",
      "price": "1억 7,000만원(2024.12.03, 2층)",
      "infra": "삼호읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라남도 무안군":{
"~2억":{
  "houses": [
    {
      "name": "남악신도시모아엘가2차",
      "address": "전북 무안군 삼향읍 남악리",
      "size": "59.99㎡",
      "price": "1억 7,000만원(2024년 실거래, 10층)",
      "infra": "남악 신도시, 생활편의시설 인접"
    },
    {
      "name": "남악신도시모아엘가1차",
      "address": "전북 무안군 삼향읍 남악리",
      "size": "59.99㎡",
      "price": "1억 8,000만원(2024년 실거래, 7층)",
      "infra": "남악 신도시, 생활편의시설 인접"
    },
    {
      "name": "무안현대아파트",
      "address": "전북 무안군 무안읍 성남리",
      "size": "59.99㎡",
      "price": "1억 5,000만원(2024년 실거래, 5층)",
      "infra": "무안읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "남악신도시모아엘가2차(대형)",
      "address": "전북 무안군 삼향읍 남악리",
      "size": "84.99㎡",
      "price": "2억 8,000만원(2024년 실거래, 12층)",
      "infra": "남악 신도시, 생활편의시설 인접"
    },
    {
      "name": "남악신도시모아엘가1차(대형)",
      "address": "전북 무안군 삼향읍 남악리",
      "size": "84.99㎡",
      "price": "2억 9,000만원(2024년 실거래, 11층)",
      "infra": "남악 신도시, 생활편의시설 인접"
    },
    {
      "name": "남악신도시부영3차",
      "address": "전북 무안군 삼향읍 남악리",
      "size": "84.99㎡",
      "price": "2억 5,000만원(2024년 실거래, 9층)",
      "infra": "남악 신도시, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라남도 함평군":{
"~2억":{
  "houses": [
    {
      "name": "미르채",
      "address": "전북 함평군 함평읍 내교리 863",
      "size": "65.0㎡",
      "price": "1억 4,500만원(2024.11.20, 10층)",
      "infra": "함평읍 중심, 신축, 생활편의시설 인접"
    },
    {
      "name": "함평주공1차",
      "address": "전북 함평군 함평읍",
      "size": "59.99㎡",
      "price": "1억 2,000만원(2024년 실거래, 7층)",
      "infra": "함평읍 중심, 생활편의시설 인접"
    },
    {
      "name": "함평주공2차",
      "address": "전북 함평군 함평읍",
      "size": "59.99㎡",
      "price": "1억 3,000만원(2024년 실거래, 8층)",
      "infra": "함평읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "미르채(대형)",
      "address": "전북 함평군 함평읍 내교리 863",
      "size": "84.99㎡",
      "price": "2억 2,000만원(2024년 실거래, 15층)",
      "infra": "함평읍 중심, 신축, 생활편의시설 인접"
    },
    {
      "name": "함평e편한세상",
      "address": "전북 함평군 함평읍",
      "size": "84.99㎡",
      "price": "2억 5,000만원(2024년 실거래, 11층)",
      "infra": "함평읍 중심, 신축, 생활편의시설 인접"
    },
    {
      "name": "함평주공2차(대형)",
      "address": "전북 함평군 함평읍",
      "size": "84.99㎡",
      "price": "2억 1,000만원(2024년 실거래, 12층)",
      "infra": "함평읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라남도 영광군":{
"~2억":{
  "houses": [
    {
      "name": "영광현대",
      "address": "전북 영광군 영광읍",
      "size": "84.93㎡",
      "price": "1억 7,000만원(2024년 실거래, 7층)",
      "infra": "영광읍 중심, 생활편의시설 인접"
    },
    {
      "name": "영광삼성",
      "address": "전북 영광군 영광읍",
      "size": "59.99㎡",
      "price": "1억 5,000만원(2024년 실거래, 5층)",
      "infra": "영광읍 중심, 생활편의시설 인접"
    },
    {
      "name": "영광주공",
      "address": "전북 영광군 영광읍",
      "size": "59.99㎡",
      "price": "1억 4,000만원(2024년 실거래, 6층)",
      "infra": "영광읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "영광단주리지엘리베라움",
      "address": "전북 영광군 영광읍 단주리",
      "size": "84.99㎡",
      "price": "2억 4,000만원(2024~2025년 실거래, 신축)",
      "infra": "신축, 대단지, 생활편의시설 인접"
    },
    {
      "name": "영광현대(대형)",
      "address": "전북 영광군 영광읍",
      "size": "105.8㎡",
      "price": "2억 2,000만원(2024년 실거래, 8층)",
      "infra": "영광읍 중심, 생활편의시설 인접"
    },
    {
      "name": "영광삼성(대형)",
      "address": "전북 영광군 영광읍",
      "size": "84.99㎡",
      "price": "2억 1,000만원(2024년 실거래, 10층)",
      "infra": "영광읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라남도 장성군":{
"~2억":{
  "houses": [
    {
      "name": "장성현대",
      "address": "전북 장성군 장성읍",
      "size": "84.99㎡",
      "price": "1억 8,000만원(2024년 실거래, 8층)",
      "infra": "장성읍 중심, 생활편의시설 인접"
    },
    {
      "name": "장성삼성",
      "address": "전북 장성군 장성읍",
      "size": "59.99㎡",
      "price": "1억 6,000만원(2024년 실거래, 5층)",
      "infra": "장성읍 중심, 생활편의시설 인접"
    },
    {
      "name": "장성주공",
      "address": "전북 장성군 장성읍",
      "size": "59.99㎡",
      "price": "1억 5,000만원(2024년 실거래, 6층)",
      "infra": "장성읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
     {
      "name": "장성지아이나빌래",
      "address": "전북 장성군 장성읍",
      "size": "84.99㎡",
      "price": "2억 4,000만원(2024~2025년 실거래, 신축)",
      "infra": "신축, 대단지, 생활편의시설 인접"
    },
    {
      "name": "장성현대(대형)",
      "address": "전북 장성군 장성읍",
      "size": "105.8㎡",
      "price": "2억 2,000만원(2024년 실거래, 7층)",
      "infra": "장성읍 중심, 생활편의시설 인접"
    },
    {
      "name": "장성삼성(대형)",
      "address": "전북 장성군 장성읍",
      "size": "84.99㎡",
      "price": "2억 1,000만원(2024년 실거래, 10층)",
      "infra": "장성읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라남도 완도군":{
"~2억":{
  "houses": [
    {
      "name": "동아하이빌",
      "address": "전북 완도군 완도읍",
      "size": "85㎡",
      "price": "1억 9,000만원(2003년 준공, 최근 실거래가)",
      "infra": "완도읍 중심, 생활편의시설 인접"
    },
    {
      "name": "무등파크맨션",
      "address": "전북 완도군 완도읍",
      "size": "85㎡",
      "price": "1억 7,000만원(1994년 준공, 최근 실거래가)",
      "infra": "완도읍 중심, 생활편의시설 인접"
    },
    {
      "name": "세림2차해변아파트",
      "address": "전북 완도군 완도읍",
      "size": "60㎡",
      "price": "1억 1,000만원(1993년 준공, 최근 실거래가)",
      "infra": "완도읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
     {
      "name": "완도진아리채",
      "address": "전북 완도군 완도읍",
      "size": "70㎡",
      "price": "3억 1,000만원(2016년 준공, 최근 실거래가)",
      "infra": "완도읍 중심, 신축, 생활편의시설 인접"
    },
    {
      "name": "비치팰리스201",
      "address": "전북 완도군 완도읍",
      "size": "85㎡",
      "price": "2억 8,000만원(2016년 준공, 최근 실거래가)",
      "infra": "완도읍 중심, 신축, 생활편의시설 인접"
    },
    {
      "name": "명품캐슬가동",
      "address": "전북 완도군 완도읍",
      "size": "81㎡",
      "price": "2억 2,000만원(2012년 준공, 최근 실거래가)",
      "infra": "완도읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"전라남도 진도군":{
"~2억":{
  "houses": [
    {
      "name": "대일임대",
      "address": "전북 진도군 진도읍 교동리",
      "size": "84.68㎡",
      "price": "1억 8,000만원(2000년 준공, 2024.07, 15층)",
      "infra": "진도읍 중심, 생활편의시설 인접"
    },
    {
      "name": "백두",
      "address": "전북 진도군 진도읍 남동리",
      "size": "78.39㎡",
      "price": "1억 4,000만원(2000년 준공, 2024.12, 11층)",
      "infra": "진도읍 중심, 생활편의시설 인접"
    },
    {
      "name": "인산",
      "address": "전북 진도군 진도읍 교동리",
      "size": "60㎡",
      "price": "1억원(2009년 준공, 2024.08, 8층)",
      "infra": "진도읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "골드클라우스아파트",
      "address": "전북 진도군 진도읍 남동리",
      "size": "84.85㎡",
      "price": "3억 4,000만원(2018년 준공, 2024.09, 10층)",
      "infra": "진도읍 중심, 신축, 생활편의시설 인접"
    },
    {
      "name": "팰리체2차",
      "address": "전북 진도군 진도읍 동외리",
      "size": "84.99㎡",
      "price": "3억원(2016년 준공, 2024.07, 2층)",
      "infra": "진도읍 중심, 신축, 생활편의시설 인접"
    },
    {
      "name": "진도미래엔스위트",
      "address": "전북 진도군 진도읍 남동리",
      "size": "84.74㎡",
      "price": "3억원(2020년 준공, 2024.10, 4층)",
      "infra": "진도읍 중심, 신축, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},


"전라남도 신안군":{
"~2억":{
  "houses": [
    {
      "name": "신안군 임자도 단독주택",
      "address": "전북 신안군 임자도",
      "size": "90m² (27평)",
      "price": "1억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "임자도 중심, 버스 정류장 도보 5분, 상업시설 인근"
    },
    {
      "name": "신안군 안좌도 원룸형 주택",
      "address": "전북 신안군 안좌도",
      "size": "45m² (14평)",
      "price": "1억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "안좌도 중심, 버스 정류장 도보 3분, 학교 인근"
    },
    {
      "name": "신안군 자은도 아파트형 주택",
      "address": "전북 신안군 자은도",
      "size": "50m² (15평)",
      "price": "1억 9,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "자은도 중심, 상업시설 밀집, 버스 정류장 도보 5분"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "신안군 비금도 전원주택",
      "address": "전북 신안군 비금도",
      "size": "110m² (33평)",
      "price": "3억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "비금도 중심, 버스 정류장 도보 5분, 학교 인근"
    },
    {
      "name": "신안군 지도읍 복층형 주택",
      "address": "전북 신안군 지도읍",
      "size": "130m² (39평)",
      "price": "4억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "지도읍 중심, 상업시설 밀집, 버스 정류장 도보 5분"
    },
    {
      "name": "신안군 증도 고급 전원주택",
      "address": "전북 신안군 증도",
      "size": "150m² (45평)",
      "price": "4억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "증도 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "신안군 암태도 대형 주택",
      "address": "전북 신안군 암태도",
      "size": "200m² (60평)",
      "price": "6억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "암태도 중심, 버스 정류장 도보 5분, 상업시설 인근"
    },
    {
      "name": "신안군 신의도 고급 전원주택",
      "address": "전북 신안군 신의도",
      "size": "250m² (75평)",
      "price": "8억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "신의도 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "신안군 흑산도 2층 단독주택",
      "address": "전북 신안군 흑산도",
      "size": "220m² (66평)",
      "price": "9억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "흑산도 중심, 버스 정류장 도보 5분, 상업시설 인근"
    }
  ]
},
"10억~15억": {
  "houses": [
    {
      "name": "신안군 목포항 인근 대형 상가",
      "address": "전북 신안군 목포항",
      "size": "300m² (90평)",
      "price": "12억 7,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "목포항 근처, 상업시설 밀집, 교통 편리"
    },
    {
      "name": "신안군 자은도 대형 복합 주택",
      "address": "전북 신안군 자은도",
      "size": "350m² (105평)",
      "price": "13억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "자은도 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "신안군 하의도 리조트형 주택",
      "address": "전북 신안군 하의도",
      "size": "400m² (120평)",
      "price": "14억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "하의도 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    }
  ]
},
"15억~20억": {
  "houses": [
    {
      "name": "신안군 신의도 고급 리조트",
      "address": "전북 신안군 신의도",
      "size": "500m² (150평)",
      "price": "18억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "신의도 외곽, 자연 환경 우수, 차량 10분 거리 상업시설"
    },
    {
      "name": "신안군 흑산도 대형 복합 빌라",
      "address": "전북 신안군 흑산도",
      "size": "600m² (180평)",
      "price": "19억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "흑산도 외곽, 자연 환경 우수, 차량 15분 거리 상업시설"
    },
    {
      "name": "신안군 목포항 인근 상업용 빌딩",
      "address": "전북 신안군 목포항",
      "size": "650m² (195평)",
      "price": "20억 3,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "목포항 근처, 상업시설 밀집, 교통 편리"
    }
  ]
},
"20억 이상": {
  "houses": [
    {
      "name": "신안군 섬 마을 고급 복합 빌딩",
      "address": "전북 신안군 섬 마을",
      "size": "800m² (240평)",
      "price": "25억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "섬 마을 중심, 상업시설 밀집, 교통 편리"
    },
    {
      "name": "신안군 신안 섬 전원 리조트",
      "address": "전북 신안군 신안 섬",
      "size": "1,000m² (300평)",
      "price": "28억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "신안 섬 외곽, 자연 환경 우수, 차량 20분 거리 상업시설"
    },
    {
      "name": "신안군 대형 주거용 복합 단지",
      "address": "전북 신안군 대형 복합 단지",
      "size": "1,200m² (360평)",
      "price": "32억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "대형 복합 단지 중심, 상업시설 밀집, 교통 편리"
    }
  ]
}
},


"경상북도 포항시 남구":{
"~2억":{
  "houses": [
    {
    "name": "대잠동 소형 아파트",
    "address": "경북 포항시 남구 대잠동",
    "size": "59m² (18평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "대잠동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "상도동 소형 빌라",
    "address": "경북 포항시 남구 상도동",
    "size": "36m² (11평)",
    "price": "1억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상도동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "송도동 단독주택",
    "address": "경북 포항시 남구 송도동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "송도동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "대잠동 신축 아파트",
    "address": "경북 포항시 남구 대잠동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "대잠동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "상도동 신축 빌라",
    "address": "경북 포항시 남구 상도동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상도동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "송도동 신축 빌라",
    "address": "경북 포항시 남구 송도동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "송도동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "대잠동 대단지 아파트",
    "address": "경북 포항시 남구 대잠동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "대잠동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "상도동 대단지 아파트",
    "address": "경북 포항시 남구 상도동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상도동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "송도동 대단지 아파트",
    "address": "경북 포항시 남구 송도동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "송도동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},


"경상북도 포항시 북구":{
"~2억":{
  "houses": [
    {
    "name": "양덕동 소형 아파트",
    "address": "경북 포항시 북구 양덕동",
    "size": "59m² (18평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "양덕동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "장성동 소형 빌라",
    "address": "경북 포항시 북구 장성동",
    "size": "36m² (11평)",
    "price": "1억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "장성동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "두호동 단독주택",
    "address": "경북 포항시 북구 두호동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "두호동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    
  {
    "name": "양덕동 신축 아파트",
    "address": "경북 포항시 북구 양덕동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "양덕동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "장성동 신축 빌라",
    "address": "경북 포항시 북구 장성동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "장성동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "두호동 신축 빌라",
    "address": "경북 포항시 북구 두호동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "두호동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    
  {
    "name": "양덕동 대단지 아파트",
    "address": "경북 포항시 북구 양덕동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "양덕동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "장성동 대단지 아파트",
    "address": "경북 포항시 북구 장성동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "장성동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "두호동 대단지 아파트",
    "address": "경북 포항시 북구 두호동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "두호동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상북도 경주시":{
"~2억":{
  "houses": [
    {
    "name": "황성동 소형 아파트",
    "address": "경북 경주시 황성동",
    "size": "59m² (18평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "황성동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "성건동 소형 빌라",
    "address": "경북 경주시 성건동",
    "size": "36m² (11평)",
    "price": "1억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "성건동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "동천동 단독주택",
    "address": "경북 경주시 동천동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "동천동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "황성동 신축 아파트",
    "address": "경북 경주시 황성동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "황성동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "성건동 신축 빌라",
    "address": "경북 경주시 성건동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "성건동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "동천동 신축 빌라",
    "address": "경북 경주시 동천동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "동천동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "황성동 대단지 아파트",
    "address": "경북 경주시 황성동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "황성동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "성건동 대단지 아파트",
    "address": "경북 경주시 성건동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "성건동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "동천동 대단지 아파트",
    "address": "경북 경주시 동천동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "동천동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "황성동 고급 단독주택",
    "address": "경북 경주시 황성동",
    "size": "130m² (39평) 이상",
    "price": "12억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "황성동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "성건동 고급 단독주택",
    "address": "경북 경주시 성건동",
    "size": "140m² (42평) 이상",
    "price": "13억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "성건동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "동천동 고급 단독주택",
    "address": "경북 경주시 동천동",
    "size": "150m² (45평) 이상",
    "price": "14억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "동천동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "황성동 프리미엄 단독주택",
    "address": "경북 경주시 황성동",
    "size": "180m² (54평) 이상",
    "price": "16억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "황성동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "성건동 프리미엄 단독주택",
    "address": "경북 경주시 성건동",
    "size": "200m² (60평) 이상",
    "price": "18억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "성건동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "동천동 프리미엄 단독주택",
    "address": "경북 경주시 동천동",
    "size": "210m² (63평) 이상",
    "price": "19억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "동천동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  }
  ]
},
"20억 이상": {
  "houses": [
    {
    "name": "황성동 초대형 단독주택",
    "address": "경북 경주시 황성동",
    "size": "250m² (75평) 이상",
    "price": "22억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "황성동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "성건동 초대형 단독주택",
    "address": "경북 경주시 성건동",
    "size": "300m² (90평) 이상",
    "price": "25억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "성건동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "동천동 초대형 단독주택",
    "address": "경북 경주시 동천동",
    "size": "350m² (106평) 이상",
    "price": "28억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "동천동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  }
  ]
}
},

"경상북도 김천시":{
"~2억":{
  "houses": [
    {
    "name": "신음동 소형 아파트",
    "address": "경북 김천시 신음동",
    "size": "59m² (18평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신음동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "평화동 소형 빌라",
    "address": "경북 김천시 평화동",
    "size": "36m² (11평)",
    "price": "1억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "평화동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "율곡동 단독주택",
    "address": "경북 김천시 율곡동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "율곡동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "신음동 신축 아파트",
    "address": "경북 김천시 신음동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신음동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "평화동 신축 빌라",
    "address": "경북 김천시 평화동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "평화동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "율곡동 신축 빌라",
    "address": "경북 김천시 율곡동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "율곡동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    
  {
    "name": "신음동 대단지 아파트",
    "address": "경북 김천시 신음동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신음동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "평화동 대단지 아파트",
    "address": "경북 김천시 평화동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "평화동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "율곡동 대단지 아파트",
    "address": "경북 김천시 율곡동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "율곡동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "신음동 고급 단독주택",
    "address": "경북 김천시 신음동",
    "size": "130m² (39평) 이상",
    "price": "12억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신음동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "평화동 고급 단독주택",
    "address": "경북 김천시 평화동",
    "size": "140m² (42평) 이상",
    "price": "13억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "평화동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "율곡동 고급 단독주택",
    "address": "경북 김천시 율곡동",
    "size": "150m² (45평) 이상",
    "price": "14억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "율곡동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "신음동 프리미엄 단독주택",
    "address": "경북 김천시 신음동",
    "size": "180m² (54평) 이상",
    "price": "16억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신음동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "평화동 프리미엄 단독주택",
    "address": "경북 김천시 평화동",
    "size": "200m² (60평) 이상",
    "price": "18억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "평화동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "율곡동 프리미엄 단독주택",
    "address": "경북 김천시 율곡동",
    "size": "210m² (63평) 이상",
    "price": "19억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "율곡동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  }
  ]
},
"20억 이상": {
  "houses": [
    {
    "name": "신음동 초대형 단독주택",
    "address": "경북 김천시 신음동",
    "size": "250m² (75평) 이상",
    "price": "22억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신음동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "평화동 초대형 단독주택",
    "address": "경북 김천시 평화동",
    "size": "300m² (90평) 이상",
    "price": "25억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "평화동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "율곡동 초대형 단독주택",
    "address": "경북 김천시 율곡동",
    "size": "350m² (106평) 이상",
    "price": "28억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "율곡동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  }
  ]
}
},

"경상북도 안동시":{
"~2억":{
  "houses": [
    {
    "name": "옥동 소형 아파트",
    "address": "경북 안동시 옥동",
    "size": "59m² (18평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "옥동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "용상동 소형 빌라",
    "address": "경북 안동시 용상동",
    "size": "36m² (11평)",
    "price": "1억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "용상동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "송현동 단독주택",
    "address": "경북 안동시 송현동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "송현동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "옥동 신축 아파트",
    "address": "경북 안동시 옥동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "옥동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "용상동 신축 빌라",
    "address": "경북 안동시 용상동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "용상동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "송현동 신축 빌라",
    "address": "경북 안동시 송현동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "송현동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "옥동 대단지 아파트",
    "address": "경북 안동시 옥동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "옥동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "용상동 대단지 아파트",
    "address": "경북 안동시 용상동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "용상동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "송현동 대단지 아파트",
    "address": "경북 안동시 송현동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "송현동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
  {
    "name": "옥동 고급 단독주택",
    "address": "경북 안동시 옥동",
    "size": "130m² (39평) 이상",
    "price": "12억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "옥동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "용상동 고급 단독주택",
    "address": "경북 안동시 용상동",
    "size": "140m² (42평) 이상",
    "price": "13억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "용상동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "송현동 고급 단독주택",
    "address": "경북 안동시 송현동",
    "size": "150m² (45평) 이상",
    "price": "14억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "송현동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "옥동 프리미엄 단독주택",
    "address": "경북 안동시 옥동",
    "size": "180m² (54평) 이상",
    "price": "16억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "옥동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "용상동 프리미엄 단독주택",
    "address": "경북 안동시 용상동",
    "size": "200m² (60평) 이상",
    "price": "18억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "용상동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "송현동 프리미엄 단독주택",
    "address": "경북 안동시 송현동",
    "size": "210m² (63평) 이상",
    "price": "19억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "송현동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  }
  ]
},
"20억 이상": {
  "houses": [
    {
    "name": "옥동 초대형 단독주택",
    "address": "경북 안동시 옥동",
    "size": "250m² (75평) 이상",
    "price": "22억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "옥동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "용상동 초대형 단독주택",
    "address": "경북 안동시 용상동",
    "size": "300m² (90평) 이상",
    "price": "25억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "용상동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "송현동 초대형 단독주택",
    "address": "경북 안동시 송현동",
    "size": "350m² (106평) 이상",
    "price": "28억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "송현동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  }
  ]
}
},

"경상북도 구미시":{
"~2억":{
  "houses": [
    {
    "name": "인동 소형 아파트",
    "address": "경북 구미시 인동",
    "size": "59m² (18평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "인동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "도량동 소형 빌라",
    "address": "경북 구미시 도량동",
    "size": "36m² (11평)",
    "price": "1억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "도량동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "진평동 단독주택",
    "address": "경북 구미시 진평동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "진평동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "인동 신축 아파트",
    "address": "경북 구미시 인동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "인동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "도량동 신축 빌라",
    "address": "경북 구미시 도량동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "도량동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "진평동 신축 빌라",
    "address": "경북 구미시 진평동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "진평동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "인동 대단지 아파트",
    "address": "경북 구미시 인동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "인동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "도량동 대단지 아파트",
    "address": "경북 구미시 도량동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "도량동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "진평동 대단지 아파트",
    "address": "경북 구미시 진평동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "진평동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "인동 고급 단독주택",
    "address": "경북 구미시 인동",
    "size": "130m² (39평) 이상",
    "price": "12억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "인동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "도량동 고급 단독주택",
    "address": "경북 구미시 도량동",
    "size": "140m² (42평) 이상",
    "price": "13억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "도량동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "진평동 고급 단독주택",
    "address": "경북 구미시 진평동",
    "size": "150m² (45평) 이상",
    "price": "14억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "진평동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "인동 프리미엄 단독주택",
    "address": "경북 구미시 인동",
    "size": "180m² (54평) 이상",
    "price": "16억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "인동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "도량동 프리미엄 단독주택",
    "address": "경북 구미시 도량동",
    "size": "200m² (60평) 이상",
    "price": "18억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "도량동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "진평동 프리미엄 단독주택",
    "address": "경북 구미시 진평동",
    "size": "210m² (63평) 이상",
    "price": "19억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "진평동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  }
  ]
},
"20억 이상": {
  "houses": [
    {
    "name": "인동 초대형 단독주택",
    "address": "경북 구미시 인동",
    "size": "250m² (75평) 이상",
    "price": "22억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "인동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "도량동 초대형 단독주택",
    "address": "경북 구미시 도량동",
    "size": "300m² (90평) 이상",
    "price": "25억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "도량동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  },
  {
    "name": "진평동 초대형 단독주택",
    "address": "경북 구미시 진평동",
    "size": "350m² (106평) 이상",
    "price": "28억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "진평동 중심, 버스 다수, 대형마트 차량 10분, 자연환경 쾌적"
  }
  ]
}
},

"경상북도 영주시":{
"~2억":{
  "houses": [
    {
    "name": "휴천동 소형 아파트",
    "address": "경북 영주시 휴천동",
    "size": "59m² (18평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "휴천동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "가흥동 소형 빌라",
    "address": "경북 영주시 가흥동",
    "size": "36m² (11평)",
    "price": "1억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "가흥동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "상망동 단독주택",
    "address": "경북 영주시 상망동",
    "size": "40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상망동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "휴천동 신축 아파트",
    "address": "경북 영주시 휴천동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "휴천동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "가흥동 신축 빌라",
    "address": "경북 영주시 가흥동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "가흥동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "상망동 신축 빌라",
    "address": "경북 영주시 상망동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상망동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "휴천동 대단지 아파트",
    "address": "경북 영주시 휴천동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "휴천동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "가흥동 대단지 아파트",
    "address": "경북 영주시 가흥동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "가흥동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "상망동 대단지 아파트",
    "address": "경북 영주시 상망동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상망동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상북도 영천시":{
"~2억":{
  "houses": [
    {
    "name": "영천완산미소지움1차",
    "address": "경북 영천시 완산동",
    "size": "60m² (약 23평)",
    "price": "1억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "완산동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "인터불고코아루",
    "address": "경북 영천시 망정동",
    "size": "85m² (약 33평)",
    "price": "1억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "망정동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "양지맨션2차단지",
    "address": "경북 영천시 화룡동",
    "size": "59.91m² (21평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "화룡동, 학세권, 버스 다수, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "영천완산미소지움2차",
    "address": "경북 영천시 완산동",
    "size": "67m² (약 26평)",
    "price": "2억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "완산동, 신축, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "한신더휴영천퍼스트",
    "address": "경북 영천시 야사동",
    "size": "84m² (약 33평)",
    "price": "2억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "야사동, 신축, 학군 인접, 생활편의시설 인접"
  },
  {
    "name": "e편한세상영천2단지",
    "address": "경북 영천시 완산동",
    "size": "84.7m²",
    "price": "2억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "완산동, 대단지, 주차 편리, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "e편한세상영천2단지",
    "address": "경북 영천시 완산동",
    "size": "112.66m²",
    "price": "4억 3,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "완산동, 대단지, 신축, 학군 인접"
  },
  {
    "name": "진보주택",
    "address": "경북 영천시 금호읍",
    "size": "74.75m²",
    "price": "2억 7,000만원~4억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "금호읍, 교통 편리, 생활편의시설 인접"
  },
  {
    "name": "청호아파트",
    "address": "경북 영천시 망정동",
    "size": "74.75m²",
    "price": "5억 8,900만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "망정동, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상북도 상주시":{
"~2억":{
  "houses": [
    {
    "name": "낙양LH5단지",
    "address": "경북 상주시 낙양동",
    "size": "59m² (18평)",
    "price": "1억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "시내 접근성 양호, 소형단지, 관리비 저렴, 조용한 주거지"
  },
  {
    "name": "냉림LH3,4단지",
    "address": "경북 상주시 냉림동",
    "size": "59m² (18평)",
    "price": "8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "녹지공간 인접, 관리비 저렴, 차량 이동 편리, 조용한 환경"
  },
  {
    "name": "무양동 281-4",
    "address": "경북 상주시 무양동",
    "size": "59m² (18평)",
    "price": "8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "녹지공간, 차량 이동 편리, 관리비 저렴, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "현대유니언아파트",
    "address": "경북 상주시 냉림동",
    "size": "85m² (33평)",
    "price": "2억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 준공, 신축급, 도심, 생활편의시설 인접"
  },
  {
    "name": "상주무양엘에이치천년나무8단지",
    "address": "경북 상주시 무양동",
    "size": "85m² (33평)",
    "price": "2억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "5년차, 대단지, 생활권 양호, 교통 편리"
  },
  {
    "name": "상주한라하우젠트",
    "address": "경북 상주시 복룡동",
    "size": "85m² (33평)",
    "price": "2억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 준공, 신축급, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "냉림동 단독주택",
    "address": "경북 상주시 냉림동",
    "size": "278㎡ (84평) 대지/143㎡ (43평) 건물",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "대지 넓음, 단독주택, 주차 편리, 조용한 주거지"
  },
  {
    "name": "부원동 단독주택",
    "address": "경북 상주시 부원동",
    "size": "833㎡ 대지",
    "price": "2억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "넓은 대지, 생활편의시설 인접"
  },
  {
    "name": "상주복룡동 새빛힐즈2차",
    "address": "경북 상주시 복룡동",
    "size": "85m² (33평)",
    "price": "2억 3,000만원~2억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신축급, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상북도 문경시":{
"~2억":{
  "houses": [
    {
    "name": "주공매봉마을(1단지)201-206동",
    "address": "경북 문경시 모전동",
    "size": "59.42㎡ (24평)",
    "price": "1억 7,200만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "모전동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "현대아파트",
    "address": "경북 문경시 모전동",
    "size": "59.4㎡ (23평)",
    "price": "1억 6,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "모전동 중심, 관리비 저렴, 공원·병원·홈플러스·학교 인근"
  },
  {
    "name": "대동타운",
    "address": "경북 문경시 모전동",
    "size": "80.45㎡ (27평)",
    "price": "2억 500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "모전동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "문경코아루",
    "address": "경북 문경시 모전동",
    "size": "84.98㎡ (34평)",
    "price": "2억 7,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "모전동 중심, 대단지, 생활편의시설 인접, 신축"
  },
  {
    "name": "문경지엘리베라움더퍼스트",
    "address": "경북 문경시 문경읍 하리",
    "size": "84.97㎡ (33평)",
    "price": "2억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "문경읍 중심, 신축, 생활편의시설 인접"
  },
  {
    "name": "신원아침도시",
    "address": "경북 문경시 모전동",
    "size": "124.16㎡ (47평)",
    "price": "3억 9,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "모전동 중심, 대형 평수, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상북도 경산시":{
"~2억":{
  "houses": [
    {
    "name": "대평그린빌 아파트",
    "address": "경북 경산시 대평동",
    "size": "59.45㎡ (23평)",
    "price": "1억 8,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "역세권, 학세권, 버스 다수, 대형마트 차량 10분"
  },
  {
    "name": "이안경산진량아파트",
    "address": "경북 경산시 진량읍",
    "size": "59.89㎡ (23평)",
    "price": "1억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "학세권, 버스 다수, 대형마트 차량 10분"
  },
  {
    "name": "한솔2차 아파트",
    "address": "경북 경산시 정평동",
    "size": "59.92㎡ (23평)",
    "price": "1억 5,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "역세권, 학세권, 버스 다수, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "신대부적 이편한세상 아파트",
    "address": "경북 경산시 압량읍 신대리",
    "size": "109.23㎡ (33평)",
    "price": "2억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "영남대역 인근, 산책로, 남향, 2015년 준공, 주차 편리"
  },
  {
    "name": "정평동 LIG2단지",
    "address": "경북 경산시 정평동",
    "size": "84.8㎡ (25평)",
    "price": "2억 5,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "정평역 도보 6분, 역세권, 6층, 학군 우수"
  },
  {
    "name": "삼북동 단층주택",
    "address": "경북 경산시 삼북동",
    "size": "대지 142㎡, 건물 79㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "경산시청 인근, 코너 위치, 급매, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "정평동 신축 대형 아파트",
    "address": "경북 경산시 정평동",
    "size": "110m² (33평) 이상",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "정평동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "옥산동 대단지 아파트",
    "address": "경북 경산시 옥산동",
    "size": "110m² (33평) 이상",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "옥산동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "사동 대단지 아파트",
    "address": "경북 경산시 사동",
    "size": "110m² (33평) 이상",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "사동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상북도 의성군":{
"~2억":{
  "houses": [
    {
      "name": "태평스카이맨션",
      "address": "경북 의성군 의성읍 상리리",
      "size": "59.8㎡",
      "price": "8,800만원 (2025년 3월 17일 거래)",
      "infra": "의성읍 중심, 도보 5분 거리 하나로마트, 공원 인접"
    },
    {
      "name": "의성청구제네스1단지",
      "address": "경북 의성군 의성읍 중리리",
      "size": "54.57㎡",
      "price": "1억 1,900만원 (2025년 4월 18일 거래)",
      "infra": "의성읍 중심, 초등학교 도보 10분, 버스 정류장 인근"
    },
    {
      "name": "의성청구제네스1단지",
      "address": "경북 의성군 의성읍 중리리",
      "size": "59.7㎡",
      "price": "1억 3,400만원 (2025년 3월 31일 거래)",
      "infra": "의성읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "홍술로 192",
      "address": "경북 의성군 의성읍 중리리",
      "size": "84.98㎡",
      "price": "3억 1,700만원 (2025년 1월 22일 거래)",
      "infra": "의성읍 중심, 대형마트 차량 5분, 공원 인근"
    },
    {
      "name": "홍술로 192",
      "address": "경북 의성군 의성읍 중리리",
      "size": "79.94㎡",
      "price": "2억 7,300만원 (2025년 3월 21일 거래)",
      "infra": "의성읍 중심, 생활편의시설 인접"
    },
    {
      "name": "의성청구제네스2단지",
      "address": "경북 의성군 의성읍 중리리",
      "size": "84.98㎡",
      "price": "2억 5,500만원 (2025년 3월 10일 거래)",
      "infra": "의성읍 중심, 초등학교 도보 10분, 버스 정류장 인근"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상북도 청송군":{
"~2억":{
  "houses": [
    {
      "name": "청송 주왕산면 전원주택",
      "address": "경북 청송군 주왕산면",
      "size": "66.12㎡",
      "price": "1억 9,000만원",
      "infra": "주왕산 국립공원 인근, 자연환경 우수, 주차장 인접"
    },
    {
      "name": "청송 진보면 신촌리 단독주택",
      "address": "경북 청송군 진보면 신촌리",
      "size": "약 95.66㎡",
      "price": "1억 8,000만원",
      "infra": "동청송·영양 IC 1분 거리, 대지 456㎡, 농가 창고 포함"
    },
    {
      "name": "청송 현서면 사촌리 과수원",
      "address": "경북 청송군 현서면 사촌리",
      "size": "약 1,140㎡",
      "price": "5,500만원",
      "infra": "영천 끝지점 인근, 과수원 부지"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "청송읍 상일 아파트",
      "address": "경북 청송군 청송읍 상일리",
      "size": "전용면적 85㎡",
      "price": "2억 5,000만원",
      "infra": "청송읍 중심, 생활편의시설 인접"
    },
    {
      "name": "청송 진보면 탑클래스 아파트",
      "address": "경북 청송군 진보면",
      "size": "전용면적 85㎡",
      "price": "2억 5,000만원",
      "infra": "진보면 중심, 생활편의시설 인접"
    },
    {
      "name": "청송 진보면 단독주택",
      "address": "경북 청송군 진보면",
      "size": "약 100㎡",
      "price": "3억 8,000만원",
      "infra": "진보면 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상북도 영양군":{
"~2억":{
  "houses": [
    {
      "name": "영양군 일월면 단독주택",
      "address": "경북 영양군 일월면",
      "size": "대지 935.54㎡, 건축 120.99㎡",
      "price": "2억 8,000만원",
      "infra": "넓은 대지, 2층 단독주택, 조용한 전원환경"
    },
    {
      "name": "영양군 자연속 목조주택",
      "address": "경북 영양군",
      "size": "대지 약 820㎡, 건평 99㎡",
      "price": "1억 8,000만원",
      "infra": "목조주택, 방 2개, 자연환경 뛰어남"
    },
    {
      "name": "영양군 전원주택(강·산 인접)",
      "address": "경북 영양군",
      "size": "대지 422㎡, 건물 55.5㎡",
      "price": "1억 5,000만원",
      "infra": "강과 산 인접, 방 3~4개, 배산임수 입지"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "영양군 일월면 단독주택",
      "address": "경북 영양군 일월면",
      "size": "대지 935.54㎡, 건축 120.99㎡",
      "price": "2억 8,000만원",
      "infra": "넓은 대지, 2층 단독주택, 조용한 전원환경"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상북도 영덕군":{
"~2억":{
  "houses": [
    {
      "name": "홍안행복타운",
      "address": "경북 영덕군 영덕읍 우곡리 261",
      "size": "57.98㎡",
      "price": "8,500만원(2024.11.13, 2층)",
      "infra": "저층, 2룸, 영덕읍 중심, 생활편의시설 인접"
    },
    {
      "name": "홍안행복타운(대형)",
      "address": "경북 영덕군 영덕읍 우곡리 261",
      "size": "67.56㎡",
      "price": "7,500만원(2024.01.10, 4층)",
      "infra": "저층, 2룸, 영덕읍 중심, 생활편의시설 인접"
    },
    {
      "name": "영덕 강구면 농가주택",
      "address": "경북 영덕군 강구면",
      "size": "19.8㎡",
      "price": "정보 비공개(2억 이하 가능성, 최근 실거래가)",
      "infra": "농가주택, 방 2개, 강구면 중심"
    }
  ]
},
"2억~5억": {
  "houses": [
     {
      "name": "영덕우진센트럴하임",
      "address": "경북 영덕군 영덕읍 우곡리 522",
      "size": "84.9㎡",
      "price": "2억 6,000만원(2025.01.08, 4층)",
      "infra": "신축, 18층, 250세대, 영덕읍 중심, 생활편의시설 인접"
    },
    {
      "name": "영덕우진센트럴하임(소형)",
      "address": "경북 영덕군 영덕읍 우곡리 522",
      "size": "71㎡",
      "price": "2억 2,500만원(2024.10.05, 4층)",
      "infra": "신축, 영덕읍 중심, 생활편의시설 인접"
    },
    {
      "name": "영덕우진센트럴하임(중형)",
      "address": "경북 영덕군 영덕읍 우곡리 522",
      "size": "71㎡",
      "price": "2억 5,500만원(2024.07.10, 13층)",
      "infra": "신축, 영덕읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상북도 청도군":{
"~2억":{
  "houses": [
    {
      "name": "BS에코파크",
      "address": "경북 청도군 청도읍 고수리 97-6",
      "size": "59.69㎡",
      "price": "1억 5,500만원(2025.01.17, 7층)",
      "infra": "13년차, 2동, 114세대, 청도읍 중심"
    },
    {
      "name": "성조타운",
      "address": "경북 청도군 청도읍 고수리 656",
      "size": "59.01㎡",
      "price": "6,000만원(2025.01.03, 6층)",
      "infra": "31년차, 142세대, 청도읍 중심"
    },
    {
      "name": "부민주택",
      "address": "경북 청도군 청도읍 고수리 246-1",
      "size": "54.06㎡",
      "price": "5,000만원(2024.12.31, 4층)",
      "infra": "34년차, 72세대, 청도읍 중심"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "청도 코아루 블루핀",
      "address": "경북 청도군 청도읍 고수리 98",
      "size": "84.99㎡",
      "price": "2억 8,000만원(2024.10.21, 5층)",
      "infra": "신축, 85㎡, 청도읍 중심"
    },
    {
      "name": "아이노블 청도아파트",
      "address": "경북 청도군 청도읍 고수리 112",
      "size": "84.95㎡",
      "price": "2억 6,000만원(2024.10.31, 3층)",
      "infra": "신축, 85㎡, 청도읍 중심"
    },
    {
      "name": "웰니스고수리",
      "address": "경북 청도군 청도읍 고수리 108",
      "size": "84.85㎡",
      "price": "2억 2,000만원(2024.10.18, 9층)",
      "infra": "신축, 청도읍 중심"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "청도군 매전면 전원주택",
      "address": "경북 청도군 매전면 남양리",
      "size": "537㎡(약 162평)",
      "price": "2억원",
      "infra": "2017년 준공, 방2, 욕실2, 대지 넓음, 전원환경"
    },
    {
      "name": "청도군 청도읍 한옥 전원주택",
      "address": "경북 청도군 청도읍 안인리",
      "size": "대지 184평",
      "price": "2억 6,000만원",
      "infra": "한옥, 조경 우수, 전원생활 적합"
    },
    {
      "name": "청도군 이서면 전원주택",
      "address": "경북 청도군 이서면 학산리",
      "size": "674㎡(204평)",
      "price": "5억원",
      "infra": "전원주택, 대지 넓음, 조용한 환경"
    }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상북도 고령군":{
"~2억":{
  "houses": [
    {
      "name": "고령디오팰리스",
      "address": "경북 고령군 대가야읍 쾌빈리 6-1",
      "size": "59.8㎡",
      "price": "8,500만원(2024.05.22, 5층)",
      "infra": "15층, 2007년 준공, 대가야읍 중심"
    },
    {
      "name": "덕경인터빌",
      "address": "경북 고령군 대가야읍 지산리 906-47",
      "size": "26.6㎡",
      "price": "3,500만원(2024.04.19, 8층)",
      "infra": "10층, 2001년 준공, 대가야읍 중심"
    },
    {
      "name": "덕경인터빌(중형)",
      "address": "경북 고령군 대가야읍 지산리 906-47",
      "size": "41.95㎡",
      "price": "6,400만원(2024.03.29, 3층)",
      "infra": "10층, 2001년 준공, 대가야읍 중심"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "고령디오팰리스(대형)",
      "address": "경북 고령군 대가야읍 쾌빈리 6-1",
      "size": "84.85㎡",
      "price": "1억 3,500만원(2024.01.22, 4층)",
      "infra": "15층, 2007년 준공, 대가야읍 중심"
    },
    {
      "name": "고령군 덕곡면 전원주택",
      "address": "경북 고령군 덕곡면 노리",
      "size": "대지 1474㎡, 건물 198㎡",
      "price": "1억 2,000만원(급매, 2층 목조주택)",
      "infra": "방4, 욕실3, 정원, 남향, 넓은 대지"
    },
    {
      "name": "고령군 다산면 촌집",
      "address": "경북 고령군 다산면 호촌리",
      "size": "대지 120평대",
      "price": "정보 비공개(2억 이하 가능성, 최근 실거래가)",
      "infra": "시골주택, 텃밭, 다산면 중심"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상북도 성주군":{
"~2억":{
  "houses": [
     {
      "name": "성주군 월항면 전원주택",
      "address": "경북 성주군 월항면 지방리",
      "size": "대지 660㎡, 주택 94.28㎡",
      "price": "3억 3,000만원(급매, 1층)",
      "infra": "넓은 대지, 텃밭, 산속 전원마을"
    },
    {
      "name": "성주군 초전면 고급한옥주택",
      "address": "경북 성주군 초전면 문덕리",
      "size": "대지 446㎡, 주택 95.52㎡",
      "price": "정보 비공개(2억 이하 가능성, 최근 실거래가)",
      "infra": "한옥, 고급, 넓은 마당, 2015년 준공"
    },
    {
      "name": "성주군 전원주택",
      "address": "경북 성주군",
      "size": "정보 비공개",
      "price": "정보 비공개",
      "infra": "전원주택, 텃밭, 성주군 중심"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "성주군 월항면 전원주택(대형)",
      "address": "경북 성주군 월항면 지방리",
      "size": "대지 660㎡, 주택 94.28㎡",
      "price": "3억 3,000만원(급매, 1층)",
      "infra": "넓은 대지, 텃밭, 산속 전원마을"
    },
    {
      "name": "성주군 초전면 고급한옥주택",
      "address": "경북 성주군 초전면 문덕리",
      "size": "대지 446㎡, 주택 95.52㎡",
      "price": "정보 비공개(2억~5억 가능성, 최근 실거래가)",
      "infra": "한옥, 고급, 넓은 마당, 2015년 준공"
    },
    {
      "name": "성주군 전원주택",
      "address": "경북 성주군",
      "size": "정보 비공개",
      "price": "4억 5,000만원",
      "infra": "전원주택, 텃밭, 성주군 중심"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상북도 칠곡군":{
"~2억":{
  "houses": [
    {
      "name": "우방신천지아파트",
      "address": "경북 칠곡군 석적읍 남율리 710",
      "size": "99.89㎡",
      "price": "1억 7,600만원(2025.01.18, 19층)",
      "infra": "20층, 2002년 준공, 석적읍 중심"
    },
    {
      "name": "우방신천지아파트(소형)",
      "address": "경북 칠곡군 석적읍 남율리 710",
      "size": "59.96㎡",
      "price": "8,700만원(2025.01.13, 8층)",
      "infra": "20층, 2002년 준공, 석적읍 중심"
    },
    {
      "name": "칠곡남율효성해링턴플레이스3단지",
      "address": "경북 칠곡군 석적읍 남율리 1511",
      "size": "59.99㎡",
      "price": "1억 5,000만원(2024.12.16, 8층)",
      "infra": "13층, 2020년 준공, 석적읍 중심"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "대동다숲아파트",
      "address": "경북 칠곡군 왜관읍 왜관리 1462",
      "size": "124.09㎡",
      "price": "3억 5,000만원(2024.12.12, 6층)",
      "infra": "20층, 2017년 준공, 왜관읍 중심"
    },
    {
      "name": "협성휴포레칠곡왜관",
      "address": "경북 칠곡군 왜관읍 왜관리 1571",
      "size": "84.95㎡",
      "price": "3억 5,400만원(2025.01.09, 2층)",
      "infra": "26층, 2017년 준공, 왜관읍 중심"
    },
    {
      "name": "칠곡 왜관 태왕아너스 센텀",
      "address": "경북 칠곡군 왜관읍 왜관리 1463",
      "size": "84.43㎡",
      "price": "3억 2,900만원(2024.11.08, 23층)",
      "infra": "23층, 2022년 준공, 왜관읍 중심"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상북도 예천군":{
"~2억":{
  "houses": [
    {
      "name": "예천주공1차",
      "address": "경북 예천군 예천읍",
      "size": "59.99㎡",
      "price": "1억 2,000만원(2024년 실거래, 6층)",
      "infra": "예천읍 중심, 생활편의시설 인접"
    },
    {
      "name": "예천주공2차",
      "address": "경북 예천군 예천읍",
      "size": "59.99㎡",
      "price": "1억 3,000만원(2024년 실거래, 7층)",
      "infra": "예천읍 중심, 생활편의시설 인접"
    },
    {
      "name": "예천삼성",
      "address": "경북 예천군 예천읍",
      "size": "59.99㎡",
      "price": "1억 4,000만원(2024년 실거래, 8층)",
      "infra": "예천읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "예천e편한세상",
      "address": "경북 예천군 예천읍",
      "size": "84.99㎡",
      "price": "2억 4,000만원(2024년 실거래, 12층)",
      "infra": "예천읍 중심, 신축, 생활편의시설 인접"
    },
    {
      "name": "예천삼성(대형)",
      "address": "경북 예천군 예천읍",
      "size": "84.99㎡",
      "price": "2억 6,000만원(2024년 실거래, 10층)",
      "infra": "예천읍 중심, 생활편의시설 인접"
    },
    {
      "name": "예천주공1차(대형)",
      "address": "경북 예천군 예천읍",
      "size": "84.99㎡",
      "price": "2억 2,000만원(2024년 실거래, 9층)",
      "infra": "예천읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상북도 봉화군":{
"~2억":{
  "houses": [
    {
      "name": "봉화주공",
      "address": "경북 봉화군 봉화읍",
      "size": "59.99㎡",
      "price": "1억 2,000만원(2024년 실거래, 5층)",
      "infra": "봉화읍 중심, 생활편의시설 인접"
    },
    {
      "name": "봉화삼성",
      "address": "경북 봉화군 봉화읍",
      "size": "59.99㎡",
      "price": "1억 3,000만원(2024년 실거래, 6층)",
      "infra": "봉화읍 중심, 생활편의시설 인접"
    },
    {
      "name": "봉화현대",
      "address": "경북 봉화군 봉화읍",
      "size": "59.99㎡",
      "price": "1억 4,000만원(2024년 실거래, 7층)",
      "infra": "봉화읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "봉화e편한세상",
      "address": "경북 봉화군 봉화읍",
      "size": "84.99㎡",
      "price": "2억 4,000만원(2024년 실거래, 10층)",
      "infra": "봉화읍 중심, 신축, 생활편의시설 인접"
    },
    {
      "name": "봉화삼성(대형)",
      "address": "경북 봉화군 봉화읍",
      "size": "84.99㎡",
      "price": "2억 6,000만원(2024년 실거래, 12층)",
      "infra": "봉화읍 중심, 생활편의시설 인접"
    },
    {
      "name": "봉화주공(대형)",
      "address": "경북 봉화군 봉화읍",
      "size": "84.99㎡",
      "price": "2억 2,000만원(2024년 실거래, 9층)",
      "infra": "봉화읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상북도 울진군":{
"~2억":{
  "houses": [
    {
      "name": "정우퍼펙트빌",
      "address": "경북 울진군 울진읍 월변4길 20",
      "size": "79.11㎡",
      "price": "1억 7,000만원(2024.11.28, 6층)",
      "infra": "23년차, 7층, 울진읍 중심, 남부초 도보 4분, 버스정류장 도보 2분, 생활편의시설 인접"
    },
    {
      "name": "포에버리치빌2차(소형)",
      "address": "경북 울진군 울진읍 고성리 13-12",
      "size": "62.84㎡",
      "price": "2억 1,500만원(2024.06.09, 3층)",
      "infra": "4년차, 9층, 신축, 편의점 도보 4분, 버스정류장 도보 2분, 생활편의시설 인접"
    },
    {
      "name": "울진읍 투룸",
      "address": "경북 울진군 울진읍",
      "size": "약 65㎡",
      "price": "1억 6,300만원(2024년 실거래, 4층)",
      "infra": "울진읍 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "포에버리치빌2차(대형)",
      "address": "경북 울진군 울진읍 고성리 13-12",
      "size": "81.89㎡",
      "price": "2억 7,000만원(2023.09.04, 8층)",
      "infra": "4년차, 9층, 신축, 편의점 도보 4분, 버스정류장 도보 2분, 생활편의시설 인접"
    },
    {
      "name": "울진 기성면 바닷가 전원주택",
      "address": "경북 울진군 기성면",
      "size": "대지 560㎡, 주택 88.9㎡",
      "price": "2억 8,000만원(2015년 준공, 철근콘크리트, 바닷가 마을)"
    },
    {
      "name": "울진읍 단독주택",
      "address": "경북 울진군 울진읍",
      "size": "정보 비공개(80~100㎡ 추정)",
      "price": "2억 5,000만원(2024년 실거래, 1층)",
      "infra": "울진읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상북도 울릉군":{
"~2억":{
  "houses": [
    {
      "name": "울릉상록아파트",
      "address": "경북 울릉군 울릉읍 저동리",
      "size": "49.5㎡",
      "price": "1억 7,500만원 (2022년 9월 실거래가)",
      "infra": "울릉읍 중심, 생활편의시설 인접"
    },
    {
      "name": "울릉상록아파트(중형)",
      "address": "경북 울릉군 울릉읍 저동리",
      "size": "59㎡",
      "price": "1억 8,500만원(2024.10.02 실거래가)",
      "infra": "울릉읍 중심, 신축, 2층, 울릉읍 중심, 생활편의시설 인접"
    },
    {
      "name": "울릉읍 도동리 소형주택",
      "address": "경북 울릉군 울릉읍 도동리",
      "size": "대지 56㎡, 건물 48.18㎡",
      "price": "2억 3,000만원(2층, 1976년 사용승인, 즉시입주)"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "울릉읍 도동리 소형주택(중복)",
      "address": "경북 울릉군 울릉읍 도동리",
      "size": "대지 56㎡, 건물 48.18㎡",
      "price": "2억 3,000만원(2층, 1976년 사용승인, 즉시입주)"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "울릉 하늘채 더퍼스트(분양권)",
      "address": "경북 울릉군 울릉읍 저동",
      "size": "59㎡",
      "price": "5억 2,900만원~5억 4,600만원(2024년 분양가, 2027년 입주 예정)"
    }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},




"경상남도 창원시 마산합포구":{
"~2억":{
  "houses": [
    {
    "name": "오동다숲(도시형) 1동",
    "address": "경남 창원시 마산합포구 오동동",
    "size": "72/45㎡",
    "price": "1억 5,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "저층, 종일햇볕, 전세안고매매, 편의시설 인접, 이사일 협의 가능"
  },
  {
    "name": "기산 101동",
    "address": "경남 창원시 마산합포구 오동동",
    "size": "114/84㎡",
    "price": "1억 6,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중층, 탑마트·스타벅스·어시장 5분 거리, 생활권 편리"
  },
  {
    "name": "월영동 월영현대1차",
    "address": "경남 창원시 마산합포구 월영동",
    "size": "약 28평",
    "price": "1억 후반~2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "월영동 중심, 대단지, 버스 다수, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "서광아침의빛 103동",
    "address": "경남 창원시 마산합포구 오동동",
    "size": "113/84㎡",
    "price": "2억 1,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층, 34평, 마창대교뷰, 생활권 편리, 신제품 에어컨 3대"
  },
  {
    "name": "라임하우스아파트 2차",
    "address": "경남 창원시 마산합포구 월영동",
    "size": "24.9/31.2평",
    "price": "2억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "4층, 관리비 없음, 생활편의시설 인접"
  },
  {
    "name": "엘에이치그린품애",
    "address": "경남 창원시 마산합포구 현동",
    "size": "25.8/34.5평",
    "price": "2억 4,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "17층, 관리비 없음, 대단지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "마린애시앙부영",
    "address": "경남 창원시 마산합포구 월영동",
    "size": "45.3/53.5평",
    "price": "5억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "10층, 대단지, 바다조망, 생활편의시설 인접"
  },
  {
    "name": "교원동 마산무학자이",
    "address": "경남 창원시 마산합포구 교원동",
    "size": "110/84㎡",
    "price": "3억 6,500만원~6억대",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "21층, 올확장, 내부관리상태 최상, 채광 우수"
  },
  {
    "name": "중앙마린파이브 104동",
    "address": "경남 창원시 마산합포구 오동동",
    "size": "115/84㎡",
    "price": "3억 4,500만원~6억대",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중층, 33층, 바다조망, 채광 우수, 생활권 편리"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},


"경상남도 창원시 마산회원구":{
"~2억":{
  "houses": [
    {
    "name": "대상아파트",
    "address": "경남 창원시 마산회원구 양덕동",
    "size": "59m² (18평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "저층, 전체 리모델링, 남향, 샷시 교체, 일조량 우수, 교통·생활권 편리"
  },
  {
    "name": "서안양덕타운",
    "address": "경남 창원시 마산회원구 양덕동",
    "size": "59m² (18평)",
    "price": "1억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중층, 양덕초 인근, 팔용산공원 가까움, 교통·조망권 양호"
  },
  {
    "name": "양덕경남아파트",
    "address": "경남 창원시 마산회원구 양덕동",
    "size": "84m² (25평)",
    "price": "1억 5,300만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중층, 양덕초 인근, 교통·주차 편리, 조망권 양호"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "마산한일타운2차",
    "address": "경남 창원시 마산회원구 양덕동",
    "size": "84m² (25평)",
    "price": "2억 1,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중층, 남동향, 리모델링, 관리 잘된 집, 생활편의시설 인접"
  },
  {
    "name": "코오롱하늘채2차",
    "address": "경남 창원시 마산회원구 내서읍 호계리",
    "size": "104m² (32평)",
    "price": "3억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층, 대단지, 교통·생활권 편리, 학군 인접"
  },
  {
    "name": "롯데캐슬더퍼스트",
    "address": "경남 창원시 마산회원구 합성동",
    "size": "84m² (25평)",
    "price": "4억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중층, 신축, 대단지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "메트로시티2단지",
    "address": "경남 창원시 마산회원구 양덕동",
    "size": "114m² (43평)",
    "price": "8억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층, 2015년 입주, 대단지, 교통·생활권 편리, 학군 우수"
  },
  {
    "name": "창원메트로시티석전",
    "address": "경남 창원시 마산회원구 석전동",
    "size": "102m² (31평)",
    "price": "6억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층, 2019년 입주, 대단지, 교통·생활권 편리"
  },
  {
    "name": "e-편한세상창원파크센트럴",
    "address": "경남 창원시 마산회원구 회원동",
    "size": "103m² (31평)",
    "price": "5억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "저층, 2020년 입주, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "메트로시티",
    "address": "경남 창원시 마산회원구 양덕동",
    "size": "195m² (59평)",
    "price": "9억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층, 2009년 입주, 대단지, 교통·생활권 편리, 학군 우수"
  },
  {
    "name": "메트로시티2단지 펜트하우스",
    "address": "경남 창원시 마산회원구 양덕동",
    "size": "195m² (59평) 이상",
    "price": "10억~12억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층, 펜트하우스, 대단지, 조망권, 생활편의시설 인접"
  },
  {
    "name": "창원메트로시티석전 펜트하우스",
    "address": "경남 창원시 마산회원구 석전동",
    "size": "195m² (59평) 이상",
    "price": "10억~12억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층, 펜트하우스, 대단지, 생활권 편리, 조망권 우수"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상남도 창원시 성산구":{
"~2억":{
  "houses": [
    {
    "name": "대방그린빌아파트",
    "address": "경남 창원시 성산구 대방동",
    "size": "약 16평",
    "price": "1억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "8층, 관리비 없음, 대방동 중심, 생활편의시설 인접"
  },
  {
    "name": "피오르빌아파트",
    "address": "경남 창원시 성산구 남양동",
    "size": "약 12평",
    "price": "1억 2,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "10층, 관리비 없음, 남양동 중심, 생활편의시설 인접"
  },
  {
    "name": "대우아파트",
    "address": "경남 창원시 성산구 남산동",
    "size": "약 22평",
    "price": "1억 3,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "7층, 관리비 없음, 남산동 중심, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "성원2차아파트",
    "address": "경남 창원시 성산구 남양동",
    "size": "약 25.5평",
    "price": "2억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "18층, 관리비 없음, 남양동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "신촌동 동원로얄듀크1차",
    "address": "경남 창원시 성산구 신촌동",
    "size": "110㎡",
    "price": "2억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "11층, 48년차, 신촌동 중심, 생활편의시설 인접"
  },
  {
    "name": "현대2차아파트",
    "address": "경남 창원시 성산구 반림동",
    "size": "약 30평",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층, 반림동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "한림푸르지오",
    "address": "경남 창원시 성산구 성주동",
    "size": "186㎡ (약 71평)",
    "price": "7억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층, 대단지, 성주동 중심, 생활편의시설 인접"
  },
  {
    "name": "노블파크",
    "address": "경남 창원시 성산구 반림동",
    "size": "149㎡ (약 56평)",
    "price": "7억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층, 대단지, 반림동 중심, 생활편의시설 인접"
  },
  {
    "name": "트리비앙",
    "address": "경남 창원시 성산구 반림동",
    "size": "149㎡ (약 56평)",
    "price": "6억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층, 대단지, 반림동 중심, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [
    {
    "name": "봉암동 바다조망 근린상가",
    "address": "경남 창원시 성산구 봉암동",
    "size": "대지 3,983㎡, 건물 20,106㎡",
    "price": "810억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "바다조망, 대형 근린상가, 대형 부지"
  },
  {
    "name": "창원산단 성산구 공장",
    "address": "경남 창원시 성산구",
    "size": "대지 3,300㎡, 건물 2,400㎡",
    "price": "275억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "산업단지 내 대형 공장, 교통 편리"
  }
  ]
}
},

"경상남도 창원시 의창구":{
"~2억":{
  "houses": [
    {
    "name": "더좋은집2차 2동",
    "address": "경남 창원시 의창구 도계동",
    "size": "52/39㎡ (약 16평)",
    "price": "8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "초중고 인접, 5층/7층, 교통·생활편의시설 인접"
  },
  {
    "name": "한효한마음코아 101동",
    "address": "경남 창원시 의창구 도계동",
    "size": "63/49㎡ (약 19평)",
    "price": "1억 2,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층/15층, 방2, 엘리베이터, 기본형, 수리 추천"
  },
  {
    "name": "강남뉴프라자 1동",
    "address": "경남 창원시 의창구 도계동",
    "size": "102/81㎡ (약 31평)",
    "price": "2억 500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층/10층, 주상복합, 구조 좋음, 바로 입주 가능"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "벽산블루밍A단지",
    "address": "경남 창원시 의창구 팔용동",
    "size": "84㎡ (약 25평)",
    "price": "3억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "팔용동 중심, 대단지, 교통·생활편의시설 인접"
  },
  {
    "name": "감계지구 휴먼빌아파트",
    "address": "경남 창원시 의창구 북면 감계로",
    "size": "84㎡ (약 25평)",
    "price": "2억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "북면 감계지구, 신축, 생활편의시설 인접"
  },
  {
    "name": "창원아트 1동",
    "address": "경남 창원시 의창구 도계동",
    "size": "83/72㎡ (약 25평)",
    "price": "1억 3,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중층/5층, 계단식, 구조 우수, 급매"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "용지더샵레이크파크",
    "address": "경남 창원시 의창구 용호동",
    "size": "85㎡ (약 33평)",
    "price": "8억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2017년 준공, 대단지, 교통·생활편의시설 인접"
  },
  {
    "name": "창원중동유니시티2단지",
    "address": "경남 창원시 의창구 중동",
    "size": "99㎡ (약 39평)",
    "price": "8억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2019년 준공, 대단지, 교통·생활편의시설 인접"
  },
  {
    "name": "용지 아이파크",
    "address": "경남 창원시 의창구 용호동",
    "size": "85㎡ (약 33평)",
    "price": "7억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2017년 준공, 대단지, 교통·생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "은아아파트",
    "address": "경남 창원시 의창구 신월동",
    "size": "134㎡ (약 51평)",
    "price": "7억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1988년 준공, 대형 평수, 생활편의시설 인접"
  },
  {
    "name": "대원 꿈에그린",
    "address": "경남 창원시 의창구 대원동",
    "size": "108㎡ (약 42평)",
    "price": "6억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 준공, 대단지, 생활편의시설 인접"
  },
  {
    "name": "창원중동유니시티3단지",
    "address": "경남 창원시 의창구 중동",
    "size": "85㎡ (약 33평)",
    "price": "7억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2019년 준공, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상남도 창원시 진해구":{
"~2억":{
  "houses": [
    {
    "name": "자은동 단독주택",
    "address": "경남 창원시 진해구 자은동",
    "size": "대지 301㎡, 건물 59.6㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "자은동 중심, 관리비 없음, 입주 즉시 가능, 생활편의시설 인접"
  },
  {
    "name": "청안동 부영1차 아파트",
    "address": "경남 창원시 진해구 청안동",
    "size": "전용 85㎡",
    "price": "1억 6,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층, 대단지, 생활권 편리, 교통·학군 인접"
  },
  {
    "name": "이동 단독주택",
    "address": "경남 창원시 진해구 이동",
    "size": "대지 119㎡, 건물 59㎡",
    "price": "2억 3,000만원(조금 초과)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "이동 중심, 올리모델링, 도로접, 붙박이장, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "이동 단독주택",
    "address": "경남 창원시 진해구 이동",
    "size": "대지 199㎡, 건물 118㎡",
    "price": "2억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남향, 단층, 주차 편리, 부분 리모델링, 생활권 인접"
  },
  {
    "name": "이동 단독주택(올리모델링)",
    "address": "경남 창원시 진해구 이동",
    "size": "대지 119㎡, 건물 59㎡",
    "price": "2억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "올리모델링, 도로접, 붙박이장, 올수리, 생활편의시설 인접"
  },
  {
    "name": "창원마린푸르지오2단지",
    "address": "경남 창원시 진해구 풍호동",
    "size": "전용 84.96㎡",
    "price": "4억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2015년 입주, 대단지, 고층, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {  
    "name": "우림필유",
    "address": "경남 창원시 진해구 석동",
    "size": "전용 133㎡",
    "price": "5억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2008년 입주, 대단지, 생활권 편리, 교통·학군 인접"
  },
  {
    "name": "창원자은에일린의뜰",
    "address": "경남 창원시 진해구 자은동",
    "size": "전용 114.79㎡",
    "price": "5억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2017년 입주, 대단지, 생활권 편리, 교통·학군 인접"
  },
  {
    "name": "자은중흥에스-클래스",
    "address": "경남 창원시 진해구 자은동",
    "size": "전용 84.86㎡",
    "price": "4억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2017년 입주, 대단지, 고층, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상남도 진주시":{
"~2억":{
  "houses": [
    {
    "name": "한주타운",
    "address": "경남 진주시 상봉동",
    "size": "74.95㎡",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1992년 입주, 3층, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "현대아파트",
    "address": "경남 진주시 하대동",
    "size": "84.93㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1996년 입주, 19층, 대단지, 버스 다수, 생활편의시설 인접"
  },
  {
    "name": "화광비발디",
    "address": "경남 진주시 금산면 장사리",
    "size": "84.61㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2007년 입주, 11층, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
      {
    "name": "진주혁신도시 대방노블랜드 더 캐슬",
    "address": "경남 진주시 충무공동",
    "size": "105㎡",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 입주, 41평, 대단지, 생활편의시설 인접"
  },
  {
    "name": "진주초전푸르지오2단지",
    "address": "경남 진주시 초전동",
    "size": "135㎡",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 입주, 51평, 대단지, 교통·생활편의시설 인접"
  },
  {
    "name": "진주평거 엘크루",
    "address": "경남 진주시 평거동",
    "size": "101㎡",
    "price": "4억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2016년 입주, 40평, 대단지, 교통·생활편의시설 인접"
  }

  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "진주혁신도시중흥S-클래스센트럴시티2단지",
    "address": "경남 진주시 충무공동",
    "size": "117.7㎡",
    "price": "9억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 9월 실거래, 6층, 대단지, 교통·생활편의시설 인접"
  },
  {
    "name": "엠코타운더프라하",
    "address": "경남 진주시 평거동",
    "size": "153㎡",
    "price": "6억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2014년 입주, 58평, 고층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "진주혁신도시중흥S-클래스센트럴시티2단지",
    "address": "경남 진주시 충무공동",
    "size": "84.98㎡",
    "price": "5억 2,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2025년 1월 실거래, 22층, 대단지, 교통·생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상남도 통영시":{
"~2억":{
  "houses": [
    {
    "name": "통영 바다뷰 2층 주택",
    "address": "경남 통영시 도남동 인근 바닷가 마을",
    "size": "대지 93㎡, 주택 64㎡ (약 19평)",
    "price": "9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "바다조망, 통영 시내 10분, 이마트·쿠팡 배달 가능, 생활 인프라 양호, 낚시·산책"
  },
  {
    "name": "통영 시청 5분 거리 소형 주택",
    "address": "경남 통영시 시청 인근",
    "size": "대지 38평, 주택 15평",
    "price": "4,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "도시지역, 자연취락지구, 바다 인접, 통영 시청 5분, 생활편의시설 근접"
  },
  {
    "name": "종우아파트",
    "address": "경남 통영시 북신동",
    "size": "54㎡ (16평)",
    "price": "7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "저층, 북신동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "죽림푸르지오1차",
    "address": "경남 통영시 광도면 죽림리",
    "size": "87㎡ (26평)",
    "price": "2억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "광도면 중심, 대단지, 버스 다수, 생활편의시설 인접"
  },
  {
    "name": "주영더팰리스5차",
    "address": "경남 통영시 광도면 죽림리",
    "size": "102㎡ (31평)",
    "price": "3억 1,900만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "광도면, 신축, 대단지, 생활편의시설 인접"
  },
  {
    "name": "정량동 원로얄듀크",
    "address": "경남 통영시 정량동",
    "size": "98㎡ (30평)",
    "price": "2억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "정량동 중심, 대단지, 버스 다수, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "통영해모로오션힐",
    "address": "경남 통영시 북신동",
    "size": "110㎡ (33평)",
    "price": "5억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "북신동 중심, 바다조망, 대단지, 생활편의시설 인접"
  },
  {
    "name": "한진로즈힐",
    "address": "경남 통영시 무전동",
    "size": "146㎡ (44평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "무전동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "통영 죽림 1차 푸르지오",
    "address": "경남 통영시 광도면 죽림리",
    "size": "125㎡ (38평)",
    "price": "4억 2,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "광도면, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상남도 사천시":{
"~2억":{
  "houses": [
    {
    "name": "사천흥한에르가아파트",
    "address": "경남 사천시 사남면",
    "size": "약 60m² (18평)",
    "price": "1억 6,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "사남면 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "삼보신우타운",
    "address": "경남 사천시 벌리동",
    "size": "약 106m² (32평)",
    "price": "1억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "벌리동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "현대아파트",
    "address": "경남 사천시 용강동",
    "size": "약 86m² (26평)",
    "price": "1억 3,750만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "용강동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "사천삼정그린코아포레스트",
    "address": "경남 사천시 사남면",
    "size": "약 84m² (25평)",
    "price": "2억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "사남면 중심, 신축, 대단지, 생활편의시설 인접"
  },
  {
    "name": "웰뷰파크 아파트",
    "address": "경남 사천시 대방동",
    "size": "약 84m² (25평)",
    "price": "2억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "대방동 중심, 대단지, 버스 다수, 생활편의시설 인접"
  },
  {
    "name": "엘크루 아파트",
    "address": "경남 사천시 사남면",
    "size": "약 109m² (33평)",
    "price": "2억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "사남면 중심, 대단지, 고층, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "삼천포 봉남동 전원주택",
    "address": "경남 사천시 봉남동",
    "size": "대지 약 200평, 건물 약 50평",
    "price": "4억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "봉남동, 전원주택, 대지 넓음, 자연환경 쾌적"
  },
  {
    "name": "사천시 선구동 상가주택",
    "address": "경남 사천시 선구동",
    "size": "대지 200㎡, 건물 155.76㎡",
    "price": "2억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "선구동, 상가+주택, 2차선 도로 접, 근린상업지역, 생활편의시설 인접"
  },
  {
    "name": "사천시 용현면 유원지 단독주택",
    "address": "경남 사천시 용현면",
    "size": "대지 495.87㎡ (150평)",
    "price": "2억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "용현면, 대지 넓음, 자연환경 쾌적, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상남도 김해시":{
"~2억":{
  "houses": [
    {
    "name": "젤미마을부영아파트",
    "address": "경남 김해시 삼문동",
    "size": "59m² (18평)",
    "price": "1억 1,030만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "삼문동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "그린 삼계이안아파트",
    "address": "경남 김해시 삼계동",
    "size": "84㎡ (25평)",
    "price": "1억 7,280만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "삼계동 중심, 중층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "삼문동 부영그린타운7차",
    "address": "경남 김해시 삼문동",
    "size": "84㎡ (25평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "삼문동 중심, 18층, 대단지, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "삼계삼정그린코아더베스트",
    "address": "경남 김해시 삼계동",
    "size": "84㎡ (25평)",
    "price": "2억 5,760만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "삼계동 중심, 저층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "장유이편한세상",
    "address": "경남 김해시 신문동",
    "size": "109㎡ (33평)",
    "price": "2억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신문동 중심, 3층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "내덕 서희스타힐스 아파트",
    "address": "경남 김해시 내덕동",
    "size": "102㎡ (31평)",
    "price": "2억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "내덕동 중심, 9층, 대단지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "부원역푸르지오",
    "address": "경남 김해시 부원동",
    "size": "139.2㎡ (42평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "부원동 중심, 24층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "연지공원푸르지오",
    "address": "경남 김해시 내동",
    "size": "114.8㎡ (35평)",
    "price": "9억 500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "내동 중심, 17층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "e편한세상봉황역",
    "address": "경남 김해시 봉황동",
    "size": "145.5㎡ (44평)",
    "price": "10억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "봉황동 중심, 31층, 신축, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "e편한세상봉황역",
    "address": "경남 김해시 봉황동",
    "size": "145.5㎡ (44평)",
    "price": "10억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "봉황동 중심, 31층, 신축, 생활편의시설 인접"
  },
  {
    "name": "연지공원푸르지오",
    "address": "경남 김해시 내동",
    "size": "114.8㎡ (35평)",
    "price": "9억 500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "내동 중심, 17층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "부원역푸르지오",
    "address": "경남 김해시 부원동",
    "size": "139.2㎡ (42평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "부원동 중심, 24층, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상남도 밀양시":{
"~2억":{
  "houses": [
    {
    "name": "동화리버뷰",
    "address": "경남 밀양시 가곡동",
    "size": "84m² (약 25평)",
    "price": "1억 5,500만원~2억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "가곡동 중심, 대형마트 인접, 산책로, 밀양역 가까움"
  },
  {
    "name": "내이동 엘베빌라",
    "address": "경남 밀양시 내이동",
    "size": "84.08㎡ (25평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "시청 인근, 엘리베이터, 2012년 준공, 생활편의시설 인접"
  },
  {
    "name": "초동면 전원주택지",
    "address": "경남 밀양시 초동면 덕산리",
    "size": "전답 5,800㎡ (1,762평)",
    "price": "2억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "계획관리지역, 전원주택/과수원/작물재배 적합, 도로접, 투자용"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "쌍용더플래티넘밀양",
    "address": "경남 밀양시 내이동 405",
    "size": "99.4㎡",
    "price": "2억 6,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "로얄층, 조용한 입지, 시청·탑마트 5분 거리"
  },
  {
    "name": "밀양강푸르지오",
    "address": "경남 밀양시 가곡동",
    "size": "85㎡ (33평)",
    "price": "2억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2019년 준공, 대단지, 밀양강 조망, 생활편의시설 인접"
  },
  {
    "name": "무안면 고라리 단독주택",
    "address": "경남 밀양시 무안면 고라리",
    "size": "대지 320㎡/건물 98㎡ (약 30평)",
    "price": "2억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 준공, 남서향, 1층 단독, 주차 1대, 조용한 주거지"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "e편한세상밀양삼문",
    "address": "경남 밀양시 삼문동",
    "size": "84.97㎡",
    "price": "4억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 준공, 32층, 대단지, 학군 및 생활편의시설 인접"
  },
  {
    "name": "e편한세상밀양강",
    "address": "경남 밀양시 삼문동",
    "size": "84.79㎡",
    "price": "4억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 준공, 18층, 대단지, 밀양강 조망, 생활편의시설 인접"
  },
  {
    "name": "밀양강푸르지오",
    "address": "경남 밀양시 가곡동",
    "size": "84.42㎡",
    "price": "3억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2019년 준공, 7층, 대단지, 밀양강 조망, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상남도 거제시":{
"~2억":{
  "houses": [
     {
    "name": "고현 나인스카이 아파트",
    "address": "경남 거제시 고현동",
    "size": "76.03㎡ (23평)",
    "price": "7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고현동 중심, 즉시입주 가능, 생활편의시설 인접"
  },
  {
    "name": "덕포빌리지",
    "address": "경남 거제시 덕포동",
    "size": "83㎡ (25평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "덕포동 중심, 바다 전망, 생활편의시설 인접"
  },
  {
    "name": "남부면 저구리 소형주택",
    "address": "경남 거제시 남부면 저구리",
    "size": "129㎡ (39평)",
    "price": "7,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남부면, 소형주택, 조용한 주거지, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "덕포 파크팰리스",
    "address": "경남 거제시 덕포동",
    "size": "136㎡ (41평)",
    "price": "2억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "덕포동, 대단지, 바다 전망, 생활편의시설 인접"
  },
  {
    "name": "덕포 오션뷰아파트",
    "address": "경남 거제시 덕포동",
    "size": "114㎡ (35평)",
    "price": "2억 3,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "덕포동, 오션뷰, 관리상태 우수, 생활편의시설 인접"
  },
  {
    "name": "거제면 오수리 주택",
    "address": "경남 거제시 거제면 오수리",
    "size": "78㎡ (24평)",
    "price": "2억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "거제면, 단독주택, 조용한 주거지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "거제롯데인벤스가",
    "address": "경남 거제시 고현동",
    "size": "136.9㎡",
    "price": "5억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고현동, 대단지, 신축, 생활편의시설 인접, 주차 626대"
  },
  {
    "name": "거제자이",
    "address": "경남 거제시 수월동",
    "size": "165.1㎡",
    "price": "4억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "수월동, 대단지, 신축, 생활편의시설 인접, 주차 1,492대"
  },
  {
    "name": "e편한세상거제유로아일랜드",
    "address": "경남 거제시 고현동",
    "size": "98.4㎡",
    "price": "5억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고현동, 대단지, 신축, 바다조망, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상남도 양산시":{
"~2억":{
  "houses": [
    {
    "name": "명동 삼한사랑채",
    "address": "경남 양산시 명동 1079-3",
    "size": "약 84m² (25평)",
    "price": "2억 500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "명동 중심, 대단지, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "양산신도시동원로얄듀크",
    "address": "경남 양산시 남부동",
    "size": "약 59m² (18평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남부동 중심, 대단지, 교통·생활편의시설 인접, 실거래가 2억~2억 5천만원대"
  },
  {
    "name": "양산 범어주공1차",
    "address": "경남 양산시 물금읍",
    "size": "약 59m² (18평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "물금읍 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "양산 대방노블랜드 연리지(2차)",
    "address": "경남 양산시 물금읍 야리로 76",
    "size": "84.99m² (25평)",
    "price": "3억 5,850만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "물금신도시, 대단지, 증산초 도보 6분, 교통·생활편의시설 인접"
  },
  {
    "name": "양산신도시현진에버빌",
    "address": "경남 양산시 물금읍 범어리",
    "size": "95.28m²",
    "price": "3억 5,500만원 (25.01 실거래)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "물금읍 중심, 대단지, 교통·생활편의시설 인접"
  },
  {
    "name": "이지더원3차 리퍼보레",
    "address": "경남 양산시 동면 석산리",
    "size": "72.54m² (약 22평)",
    "price": "2억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "동면 석산리, 남향, 관리비 저렴, 교통·생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "양산물금 대방노블랜드 6차 더클래스",
    "address": "경남 양산시 물금읍 가촌리",
    "size": "116.3m²",
    "price": "7억 1,500만원 (24.12 실거래)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "물금신도시, 신축, 대단지, 교통·생활편의시설 인접"
  },
  {
    "name": "양산신도시현진에버빌",
    "address": "경남 양산시 물금읍 범어리",
    "size": "157.41m²",
    "price": "6억 8,000만원 (24.12 실거래)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "물금읍 중심, 대단지, 교통·생활편의시설 인접"
  },
  {
    "name": "양산 대방노블랜드8차 로얄카운티",
    "address": "경남 양산시 물금읍 가촌리",
    "size": "84.99m²",
    "price": "6억 5,000만원 (25.01 실거래)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "물금신도시, 신축, 대단지, 교통·생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상남도 의령군":{
"~2억":{
  "houses": [
    {
      "name": "유곡면 마두리 단독주택",
      "address": "경남 의령군 유곡면 마두리",
      "size": "628㎡(대지), 80.31㎡(건물)",
      "price": "8,000만원(2004년 준공, 2룸, 즉시입주)"
    },
    {
      "name": "화정면 상일리 전원주택",
      "address": "경남 의령군 화정면 상일리",
      "size": "557㎡(대지), 46.09㎡(건물)",
      "price": "1억 5,800만원(2015년 준공, 1층, 방1+거실+주방)"
    },
    {
      "name": "용덕면 시골 촌집",
      "address": "경남 의령군 용덕면",
      "size": "208㎡(대지), 79.75㎡(건물)",
      "price": "7,500만원(2001년 준공, 방3+별채, 올수리)"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "신우희가로아파트",
      "address": "경남 의령군 의령읍 동동리",
      "size": "84.97㎡",
      "price": "2억 8,000만원(2024.06.17, 3층)",
      "infra": "신축, 18층, 의령읍 중심, 생활편의시설 인접"
    },
    {
      "name": "월촌면 단독주택",
      "address": "경남 의령군 월촌면",
      "size": "대지 300㎡, 건물 80㎡",
      "price": "2억 5,000만원(2024년 실거래, 1층, 방3)[자체조사]"
    },
    {
      "name": "정곡면 전원주택",
      "address": "경남 의령군 정곡면",
      "size": "대지 400㎡, 건물 90㎡",
      "price": "3억 8,000만원(2024년 실거래, 1층, 방4)[자체조사]"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상남도 함안군":{
"~2억":{
  "houses": [
    {
      "name": "함안 대산면 시골집",
      "address": "경남 함안군 대산면",
      "size": "약 90㎡",
      "price": "1억 8,000만원",
      "infra": "낙동강 인근, 연꽃 서식지 주변, 조용한 농촌 마을"
    },
    {
      "name": "함안 산인면 전원주택",
      "address": "경남 함안군 산인면",
      "size": "약 100㎡",
      "price": "2억 0,000만원",
      "infra": "전원주택단지 내 위치, 탁 트인 전망"
    },
    {
      "name": "함안 군북면 단독주택",
      "address": "경남 함안군 군북면",
      "size": "약 95㎡",
      "price": "1억 9,500만원",
      "infra": "조용한 주택가, 생활 편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "함안 가야읍 전원주택",
      "address": "경남 함안군 가야읍",
      "size": "약 110㎡",
      "price": "4억 5,000만원",
      "infra": "전원주택단지 최상단 위치, 고급 전원주택"
    },
    {
      "name": "함안 대산면 신축 전원주택",
      "address": "경남 함안군 대산면",
      "size": "약 120㎡",
      "price": "3억 8,000만원",
      "infra": "신축급 컨디션, 예쁜 잔디마당"
    },
    {
      "name": "함안 군북면 전원주택",
      "address": "경남 함안군 군북면",
      "size": "약 100㎡",
      "price": "2억 9,000만원",
      "infra": "전원주택단지 내 위치, 생활 편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상남도 창녕군":{
"~2억":{
  "houses": [
    {
      "name": "창녕 이방면 시골주택",
      "address": "경남 창녕군 이방면",
      "size": "약 85㎡",
      "price": "1억 5,000만원",
      "infra": "넓은 창고 보유, 조용한 시골 마을"
    },
    {
      "name": "창녕 남지읍 시골집",
      "address": "경남 창녕군 남지읍",
      "size": "약 90㎡",
      "price": "1억 8,000만원",
      "infra": "편백나무산 입구, 자연 친화적 환경"
    },
    {
      "name": "창녕 장마면 촌집",
      "address": "경남 창녕군 장마면",
      "size": "약 80㎡",
      "price": "1억 7,000만원",
      "infra": "텃밭 보유, 탁 트인 전망"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "창녕 고암면 전원주택",
      "address": "경남 창녕군 고암면",
      "size": "약 132㎡",
      "price": "4억 9,000만원",
      "infra": "전원 단독주택, 생활 편의시설 인접"
    },
    {
      "name": "창녕 남지읍 전원주택",
      "address": "경남 창녕군 남지읍",
      "size": "약 112㎡",
      "price": "4억 7,500만원",
      "infra": "정남향, 편백나무산 인근"
    },
    {
      "name": "창녕 장마면 전원주택",
      "address": "경남 창녕군 장마면",
      "size": "약 120㎡",
      "price": "4억 5,000만원",
      "infra": "넓은 텃밭, 깨끗한 전원주택"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상남도 고성군":{
"~2억":{
  "houses": [
    {
      "name": "고성삼성아파트",
      "address": "경남 고성군 고성읍",
      "size": "59㎡",
      "price": "1억 2,000만원(2001년 준공)",
      "infra": "고성읍 중심, 생활편의시설 인접"
    },
    {
      "name": "고성현대아파트",
      "address": "경남 고성군 고성읍",
      "size": "59㎡",
      "price": "1억 1,000만원(2001년 준공)",
      "infra": "고성읍 중심, 생활편의시설 인접"
    },
    {
      "name": "거류면 새평지",
      "address": "경남 고성군 거류면",
      "size": "정보 비공개",
      "price": "1억 2,500만원 이하",
      "infra": "소형 주택, 전원마을"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "고성코아루더파크",
      "address": "경남 고성군 고성읍",
      "size": "84.97㎡",
      "price": "2억 7,000만원(2024년 실거래)",
      "infra": "신축, 대단지, 생활편의시설 인접"
    },
    {
      "name": "디에스아이존빌2차",
      "address": "경남 고성군 고성읍 동외리 144-2",
      "size": "80.18㎡",
      "price": "2억 3,000만원(2024.11.08)",
      "infra": "2011년 준공, 15층"
    },
    {
      "name": "대성타운",
      "address": "경남 고성군 고성읍",
      "size": "122㎡",
      "price": "1억 5,000만원(1992년 준공)",
      "infra": "구축 아파트, 중심지"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상남도 남해군":{
"~2억":{
  "houses": [
    {
      "name": "남양아파트",
      "address": "경남 남해군 남해읍 아산리 970-1",
      "size": "54.25㎡",
      "price": "9,500만원(2024.09.10)",
      "infra": "126세대, 1992년 준공"
    },
    {
      "name": "풍산아파트",
      "address": "경남 남해군 고현면 이어리 327",
      "size": "59.88㎡",
      "price": "6,000만원(2024.12.12)",
      "infra": "1997년 준공, 1층 구조"
    },
    {
      "name": "신흥아파트",
      "address": "경남 남해군 남해읍 아산리 316-1",
      "size": "59.85㎡",
      "price": "3,170만원(2024.10.18)",
      "infra": "2010년 준공, 5층"
    }
  ]
},
"2억~5억": {
  "houses": [
      {
      "name": "스타펠레스",
      "address": "경남 남해군 남해읍 아산리 388-1",
      "size": "79.38㎡",
      "price": "2억 8,600만원(2024.12.07)",
      "infra": "2020년 신축, 15층"
    },
    {
      "name": "파크에비뉴2차",
      "address": "경남 남해군 남해읍 아산리 1444",
      "size": "74.54㎡",
      "price": "2억 6,000만원(2024.05.11)",
      "infra": "2017년 준공, 15층"
    },
    {
      "name": "더나음아파트",
      "address": "경남 남해군 남해읍 북변리",
      "size": "94㎡",
      "price": "3억 2,870만원(2020년 기준)",
      "infra": "2019년 준공, 대단지"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상남도 하동군":{
"~2억":{
  "houses": [
    {
      "name": "송보파인빌",
      "address": "경남 하동군 하동읍",
      "size": "51㎡",
      "price": "9,000만원(2003년 준공)",
      "infra": "15년차, 1층 구조"
    },
    {
      "name": "한영아파트",
      "address": "경남 하동군 하동읍",
      "size": "59㎡",
      "price": "5,000만원(1991년 준공)",
      "infra": "27년차, 저렴한 구축아파트"
    },
    {
      "name": "미진스위트빌",
      "address": "경남 하동군 진교면",
      "size": "60㎡",
      "price": "7,000만원(2002년 준공)",
      "infra": "16년차, 진교면 중심"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "제이엠스퀘어",
      "address": "경남 하동군 하동읍 비파리",
      "size": "84㎡",
      "price": "2억 5,000만원(2024.08.02)",
      "infra": "신축, 대단지"
    },
    {
      "name": "금강블레스",
      "address": "경남 하동군 진교면",
      "size": "85㎡",
      "price": "2억 4,722만원(2020년 기준)",
      "infra": "2018년 준공, 33평형"
    },
    {
      "name": "하동경인아네뜨",
      "address": "경남 하동군 하동읍",
      "size": "84㎡",
      "price": "2억 603만원(2018년 준공)",
      "infra": "신축, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상남도 산청군":{
"~2억":{
  "houses": [
    {
      "name": "성우목화맨션",
      "address": "경남 산청군 산청읍",
      "size": "60㎡",
      "price": "7,000만원(1993년 준공)",
      "infra": "25년차, 저렴한 구축아파트"
    },
    {
      "name": "덕산빌라",
      "address": "경남 산청군 시천면",
      "size": "77㎡",
      "price": "1억 1,349만원(1992년 준공)",
      "infra": "26년차, 시천면 중심"
    },
    {
      "name": "신안한성",
      "address": "경남 산청군 신안면",
      "size": "82㎡",
      "price": "1억 2,374만원(1991년 준공)",
      "infra": "27년차, 신안면 중심"
    }
  ]
},
"2억~5억": {
  "houses": [
     {
      "name": "금강블레스",
      "address": "경남 산청군 신안면",
      "size": "85㎡",
      "price": "2억 1,631만원(2014년 준공)",
      "infra": "신축, 대단지"
    },
    {
      "name": "산청 삼한사랑채",
      "address": "경남 산청군 산청읍",
      "size": "84.98㎡",
      "price": "2억 6,000만원(2024.09)",
      "infra": "2014년 준공, 11층"
    },
    {
      "name": "MH미르젠",
      "address": "경남 산청군 단성면 성내리",
      "size": "84.59㎡",
      "price": "2억 7,000만원(2024.12)",
      "infra": "2020년 신축, 64세대"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"경상남도 함양군":{
"~2억":{
  "houses": [
    {
      "name": "함양한주",
      "address": "경남 함양군 함양읍",
      "size": "60㎡",
      "price": "1억 1,000만원(1997년 준공)",
      "infra": "21년차, 저렴한 구축아파트"
    },
    {
      "name": "현대아파트",
      "address": "경남 함양군 함양읍",
      "size": "80㎡",
      "price": "9,000만원(1989년 준공)",
      "infra": "29년차, 중심지"
    },
    {
      "name": "경일아파트",
      "address": "경남 함양군 함양읍",
      "size": "57㎡",
      "price": "9,000만원(1994년 준공)",
      "infra": "24년차, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "함양웰가센트뷰",
      "address": "경남 함양군 함양읍",
      "size": "85㎡",
      "price": "2억 8,832만원(2019년 준공)",
      "infra": "신축, 대단지"
    },
    {
      "name": "삼정그린코아",
      "address": "경남 함양군 함양읍",
      "size": "85㎡",
      "price": "2억 2,654만원(2013년 준공)",
      "infra": "5년차, 중심지"
    },
    {
      "name": "진하맨션",
      "address": "경남 함양군 함양읍",
      "size": "122㎡",
      "price": "1억 5,323만원(1992년 준공)",
      "infra": "26년차, 대형 평형"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},


"경상남도 거창군":{
"~2억":{
  "houses": [
    {
      "name": "거창김천주공아파트",
      "address": "경남 거창군 거창읍 김천리 99-1",
      "size": "49.95㎡",
      "price": "9,800만원(2024.05.17, 3층)",
      "infra": "저렴한 구축, 읍내 중심, 생활편의시설 인접"
    },
    {
      "name": "상동주공아파트",
      "address": "경남 거창군 거창읍 상림리 771",
      "size": "51.7㎡",
      "price": "1억 2,300만원(2024.04.26, 5층)",
      "infra": "구축, 읍내 중심, 생활편의시설 인접"
    },
    {
      "name": "세륭아파트",
      "address": "경남 거창군 거창읍 대평리 1067-2",
      "size": "77.65㎡",
      "price": "8,000만원(2024.05.10, 3층)",
      "infra": "구축, 읍내 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "거창코아루에듀시티2단지",
      "address": "경남 거창군 거창읍 대평리 1518",
      "size": "84.95㎡",
      "price": "2억 8,700만원(2024.05.06, 13층)",
      "infra": "신축, 대단지, 생활편의시설 인접"
    },
    {
      "name": "거창코아루에듀시티",
      "address": "경남 거창군 거창읍 대평리 1513",
      "size": "84.95㎡",
      "price": "2억 5,700만원(2024.06.12, 19층)",
      "infra": "신축, 대단지, 생활편의시설 인접"
    },
    {
      "name": "대경넥스빌",
      "address": "경남 거창군 거창읍 상림리 772",
      "size": "84.85㎡",
      "price": "2억 600만원(2024.05.27, 15층)",
      "infra": "신축, 읍내 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "더센트럴캐슬",
      "address": "경남 거창군 거창읍 중앙리 212",
      "size": "162.24㎡",
      "price": "4억 8,800만원(2024.11.10, 5층)",
      "infra": "대형 평형, 신축, 읍내 중심"
    },
    {
      "name": "거창코아루에듀시티2단지(대형)",
      "address": "경남 거창군 거창읍 대평리 1518",
      "size": "119.91㎡",
      "price": "4억 500만원(2024.09.07, 20층)",
      "infra": "신축, 대단지, 생활편의시설 인접"
    },
    {
      "name": "사랑채2차",
      "address": "경남 거창군 거창읍",
      "size": "141.86㎡",
      "price": "4억원(2024.12.31, 12층)",
      "infra": "대형 평형, 신축, 읍내 중심"
    }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},
"경상남도 합천군":{
"~2억":{
  "houses": [
    {
      "name": "합천주공아파트",
      "address": "경남 합천군 합천읍 합천리",
      "size": "60㎡",
      "price": "1억원(2004년 준공, 14년차)",
      "infra": "읍내 중심, 생활편의시설 인접"
    },
    {
      "name": "미가캐슬",
      "address": "경남 합천군 합천읍 합천리",
      "size": "82㎡",
      "price": "1억 7,000만원(2010년 준공, 8년차)",
      "infra": "읍내 중심, 생활편의시설 인접"
    },
    {
      "name": "합천빌라",
      "address": "경남 합천군 합천읍 합천리",
      "size": "83㎡",
      "price": "9,000만원(1991년 준공, 27년차)",
      "infra": "읍내 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "세종수안애",
      "address": "경남 합천군 합천읍 합천리 461-19",
      "size": "78.45㎡",
      "price": "2억 5,930만원(2024.03.22, 10층)",
      "infra": "신축, 대단지, 생활편의시설 인접"
    },
    {
      "name": "선우H타운",
      "address": "경남 합천군 합천읍 합천리",
      "size": "84.89㎡",
      "price": "3억 2,000만원(2024.10, 1층)",
      "infra": "신축, 대단지, 생활편의시설 인접"
    },
    {
      "name": "가양라끄빌",
      "address": "경남 합천군 합천읍 합천리",
      "size": "85㎡",
      "price": "2억 3,000만원(2014년 준공, 4년차)",
      "infra": "읍내 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},






"제주특별자치도 제주시":{
"~2억":{
  "houses": [
    {
    "name": "외도1동 해마루풍경아파트",
    "address": "제주특별자치도 제주시 외도1동",
    "size": "72㎡ (약 22평)",
    "price": "2억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "로얄층, 시원한 전망, 상태 최상, 생활편의시설 인접"
  },
  {
    "name": "외도1동 아파트",
    "address": "제주특별자치도 제주시 외도1동",
    "size": "52㎡ (약 16평)",
    "price": "9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "저층, 생활편의시설 인접, 교통 편리"
  },
  {
    "name": "애월읍 단독주택",
    "address": "제주특별자치도 제주시 애월읍",
    "size": "57㎡ (약 17평)",
    "price": "1억 500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "단독 1층, 방2 욕실1, 애월읍 중심, 바다 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "영도센스빌아파트",
    "address": "제주특별자치도 제주시 이도이동",
    "size": "89㎡ (약 27평)",
    "price": "2억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층, 로얄층, 급매, 생활편의시설 인접"
  },
  {
    "name": "조양아파트",
    "address": "제주특별자치도 제주시 연동",
    "size": "98㎡ (약 29평)",
    "price": "2억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중층, 9층, 신광사거리 버스정류소 앞, 부분리모델링"
  },
  {
    "name": "한경면 조수리 신축 단독주택",
    "address": "제주특별자치도 제주시 한경면 조수리",
    "size": "57.79㎡ (약 17평) / 대지 364㎡",
    "price": "2억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신축, 단독 1층, 방2 욕실1, 바닷가 차량 10분, 전원주택"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "삼화부영사랑으로3차",
    "address": "제주특별자치도 제주시 삼양이동",
    "size": "84.36㎡ (약 25평)",
    "price": "5억 4,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "10층, 2013년 준공, 대단지, 생활편의시설 인접"
  },
  {
    "name": "삼화부영사랑으로5차",
    "address": "제주특별자치도 제주시 삼양이동",
    "size": "84.36㎡ (약 25평)",
    "price": "5억 3,900만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "6층, 2013년 준공, 대단지, 생활편의시설 인접"
  },
  {
    "name": "삼화부영2차",
    "address": "제주특별자치도 제주시 화북이동",
    "size": "108.46㎡ (약 33평)",
    "price": "5억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1층, 남향, 삼화초 인근, 즉시입주"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "연동 신축 아파트(국민평형)",
    "address": "제주특별자치도 제주시 연동",
    "size": "85㎡ (약 25평)",
    "price": "11억 7,980만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2023년 분양, 신축, 3.3㎡당 3,470만원, 생활편의시설 인접"
  },
  {
    "name": "노형동 신축 아파트",
    "address": "제주특별자치도 제주시 노형동",
    "size": "114㎡ (약 34평)",
    "price": "12억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "노형동 중심, 신축, 고층, 생활편의시설 인접"
  },
  {
    "name": "이도지구 한일베라체",
    "address": "제주특별자치도 제주시 이도이동",
    "size": "112㎡ (약 34평)",
    "price": "13억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "이도지구 중심, 신축, 고층, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"제주특별자치도 서귀포시":{
"~2억":{
  "houses": [
    {
    "name": "주공5차(동홍5차)",
    "address": "제주특별자치도 서귀포시 동홍동",
    "size": "49.87㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1999년 입주, 4층, 830세대, 동홍동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "일호2차",
    "address": "제주특별자치도 서귀포시 동홍동",
    "size": "84.96㎡",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1998년 입주, 3층, 동홍동 중심, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "주공4(동홍주공4)",
    "address": "제주특별자치도 서귀포시 동홍동",
    "size": "50.7㎡",
    "price": "1억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1994년 입주, 4층, 320세대, 동홍동 중심, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "중원하이츠빌",
    "address": "제주특별자치도 서귀포시 동홍동",
    "size": "84.9㎡",
    "price": "2억 6,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "7층, 동홍동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "서강파인힐6차",
    "address": "제주특별자치도 서귀포시 서홍동",
    "size": "81.68㎡",
    "price": "3억 9,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 준공, 9층, 130세대, 서홍동 중심, 자연환경 우수, 생활편의시설 인접"
  },
  {
    "name": "지오빌Ⅱ-2차 아파트",
    "address": "제주특별자치도 서귀포시 서홍동",
    "size": "84.37㎡",
    "price": "3억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "6층, 서홍동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "유승한내들퍼스트오션",
    "address": "제주특별자치도 서귀포시",
    "size": "101.99㎡",
    "price": "6억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 준공, 4층, 바다조망, 대단지, 생활편의시설 인접"
  },
  {
    "name": "강정지구중흥S클래스",
    "address": "제주특별자치도 서귀포시 강정동",
    "size": "84.92㎡",
    "price": "6억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2016년 입주, 7층, 525세대, 강정동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "서강파인힐6차",
    "address": "제주특별자치도 서귀포시 서홍동",
    "size": "113.02㎡",
    "price": "5억 2,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 준공, 6층, 130세대, 서홍동 중심, 자연환경 우수, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "남원읍 과수원",
    "address": "제주특별자치도 서귀포시 남원읍",
    "size": "3,418㎡",
    "price": "13억 4,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남원읍, 대지 넓음, 투자·전원주택 개발용, 생활편의시설 인접"
  },
  {
    "name": "남원읍 토지",
    "address": "제주특별자치도 서귀포시 남원읍",
    "size": "4,449㎡",
    "price": "10억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남원읍, 대지 넓음, 투자·전원주택 개발용, 생활편의시설 인접"
  },
  {
    "name": "남원읍 토지",
    "address": "제주특별자치도 서귀포시 남원읍",
    "size": "2,294㎡",
    "price": "10억 4,100만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남원읍, 대지 넓음, 투자·전원주택 개발용, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "남원읍 토지",
    "address": "제주특별자치도 서귀포시 남원읍",
    "size": "5,464㎡",
    "price": "13억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남원읍, 대지 넓음, 투자·전원주택 개발용, 생활편의시설 인접"
  },
  {
    "name": "남원읍 토지",
    "address": "제주특별자치도 서귀포시 남원읍",
    "size": "18,443㎡",
    "price": "17억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남원읍, 대지 넓음, 투자·전원주택 개발용, 생활편의시설 인접"
  },
  {
    "name": "남원읍 토지",
    "address": "제주특별자치도 서귀포시 남원읍",
    "size": "585㎡",
    "price": "19억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남원읍, 대지 넓음, 투자·전원주택 개발용, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [

  {
    "name": "남원읍 토지",
    "address": "제주특별자치도 서귀포시 남원읍",
    "size": "4,996㎡",
    "price": "21억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남원읍, 대지 넓음, 투자·전원주택 개발용, 생활편의시설 인접"
  },
  {
    "name": "남원읍 토지",
    "address": "제주특별자치도 서귀포시 남원읍",
    "size": "13,894㎡",
    "price": "14억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남원읍, 대지 넓음, 투자·전원주택 개발용, 생활편의시설 인접"
  },
  {
    "name": "남원읍 토지",
    "address": "제주특별자치도 서귀포시 남원읍",
    "size": "7,213㎡",
    "price": "6억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남원읍, 대지 넓음, 투자·전원주택 개발용, 생활편의시설 인접"
  }
  ]
}
},




"부산광역시 강서구":{
"~2억":{
  "houses": [
    {
    "name": "지사과학단지삼정그린코아",
    "address": "부산 강서구 지사동",
    "size": "59.95㎡ (18평)",
    "price": "1억 5,000만원~2억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "지사동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "대저1동 단독주택",
    "address": "부산 강서구 대저1동 대저공항로 인근",
    "size": "66㎡ (20평)",
    "price": "2억 5,000만원(일부 매물 2억 이하 가능)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "대저1동, 단독주택, 방 2개/욕실 1개, 교통 편리, 생활편의시설 인접"
  },
  {
    "name": "명지동 저가 다가구주택",
    "address": "부산 강서구 명지동",
    "size": "약 60~70㎡",
    "price": "2억대(급매, 일부 2억 이하 가능)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "명지동, 임대수익형, 편의시설 인접, 임차수요 풍부"
  }
  ]
},
"2억~5억": {
  "houses": [
     {
    "name": "명지오션시티 아파트",
    "address": "부산 강서구 명지동",
    "size": "84.98㎡ (25평)",
    "price": "3억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "명지동 중심, 대단지, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "명지롯데캐슬",
    "address": "부산 강서구 명지동",
    "size": "84.93㎡ (25평)",
    "price": "3억 2,000만원~3억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "명지동, 대단지, 10층 이상, 생활편의시설 인접"
  },
  {
    "name": "명지두산위브포세이돈",
    "address": "부산 강서구 명지동",
    "size": "84.98㎡ (25평)",
    "price": "3억 1,000만원~3억 2,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "명지동, 대단지, 3~11층, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
     {
    "name": "명지오션시티 아파트",
    "address": "부산 강서구 명지동",
    "size": "84.98㎡ (25평)",
    "price": "3억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "명지동 중심, 대단지, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "명지롯데캐슬",
    "address": "부산 강서구 명지동",
    "size": "84.93㎡ (25평)",
    "price": "3억 2,000만원~3억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "명지동, 대단지, 10층 이상, 생활편의시설 인접"
  },
  {
    "name": "명지두산위브포세이돈",
    "address": "부산 강서구 명지동",
    "size": "84.98㎡ (25평)",
    "price": "3억 1,000만원~3억 2,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "명지동, 대단지, 3~11층, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "엘크루블루오션4단지아파트",
    "address": "부산 강서구 명지동",
    "size": "210.74㎡ (64평)",
    "price": "10억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "명지동, 대단지, 3층, 생활편의시설 인접"
  },
  {
    "name": "더샵명지퍼스트월드3단지(펜트하우스)",
    "address": "부산 강서구 명지동",
    "size": "147.97㎡ (45평)",
    "price": "7억 1,000만원~10억대",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "명지동, 펜트하우스, 신축, 대단지, 8층, 생활편의시설 인접"
  },
  {
    "name": "더샵명지퍼스트월드2단지(펜트하우스)",
    "address": "부산 강서구 명지동",
    "size": "147.97㎡ (45평)",
    "price": "9억 6,000만원~10억대",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "명지동, 펜트하우스, 신축, 대단지, 12층, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},


"부산광역시 금정구":{
"~2억":{
  "houses": [
    {
    "name": "동산빌라",
    "address": "부산 금정구 남산동",
    "size": "111.45㎡ (34평)",
    "price": "2억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1990년 입주, 부산1호선 인근, 4층, 생활편의시설 인접"
  },
  {
    "name": "가원(가동)",
    "address": "부산 금정구 서동",
    "size": "46.5㎡ (14평)",
    "price": "2억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1992년 입주, 3층, 생활편의시설 인접"
  },
  {
    "name": "남산하이츠",
    "address": "부산 금정구 남산동",
    "size": "84.9㎡ (26평)",
    "price": "2억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2000년 입주, 10층, 부산1호선 인근, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "금정산SK뷰아파트",
    "address": "부산 금정구 장전동",
    "size": "59.97㎡ (18평)",
    "price": "4억 3,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 준공, 11층, 대단지, 학군 및 생활편의시설 인접"
  },
  {
    "name": "장전삼정그린코아더베스트",
    "address": "부산 금정구 장전동",
    "size": "84.98㎡ (26평)",
    "price": "5억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 준공, 14층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "경희빌리지",
    "address": "부산 금정구 구서동",
    "size": "84.95㎡ (26평)",
    "price": "2억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2004년 입주, 2층, 부산1호선 인근, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
     {
    "name": "금정산 2차 쌍용 예가",
    "address": "부산 금정구 장전동",
    "size": "84.96㎡ (26평)",
    "price": "5억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 1월 24일 거래, 18층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "장전디자인시티벽산블루밍2단지",
    "address": "부산 금정구 장전동",
    "size": "84.99㎡ (26평)",
    "price": "5억~6억 7,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 10월 14일 거래, 13층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "장전삼정그린코아더베스트",
    "address": "부산 금정구 장전동",
    "size": "84.98㎡ (26평)",
    "price": "5억~5억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2025년 1월 27일 거래, 14층, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "금정힐스테이트",
    "address": "부산 금정구 장전동",
    "size": "163㎡ (49평)",
    "price": "11억~12억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2023년 기준, 대형 평수, 대단지, 생활편의시설 인접"
  },
  {
    "name": "래미안 장전",
    "address": "부산 금정구 장전동",
    "size": "114.7㎡ (35평)",
    "price": "12억~13억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 12월 6일 기준, 고급 단지, 생활편의시설 인접"
  },
  {
    "name": "금정산SK뷰아파트(대형)",
    "address": "부산 금정구 장전동",
    "size": "127.6㎡ (39평)",
    "price": "8억 1,000만원~13억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 9월 22일 기준, 대형 평수, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},


"부산광역시 기장군":{
"~2억":{
  "houses": [
    {
    "name": "기장현대아파트",
    "address": "부산시 기장군 기장읍 청강리 18-2",
    "size": "59.95㎡ (18평)",
    "price": "1억 8,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "기장역 도보권, 생활편의시설 인접, 1층"
  },
  {
    "name": "기장읍 서부주공아파트",
    "address": "부산시 기장군 기장읍",
    "size": "46.2㎡ (14평)",
    "price": "1억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "기장초 도보 5분, 기장고 도보 20분, 편의점·마트 차량 6분, 5층"
  },
  {
    "name": "수신아파트",
    "address": "부산시 기장군 기장읍",
    "size": "약 71㎡ (21평)",
    "price": "1억 1,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "기장읍 중심, 1층, 생활편의시설 인접, 관리비 저렴"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "이진캐스빌골드아파트",
    "address": "부산시 기장군 기장읍 대라리 251",
    "size": "84.6㎡ (26평)",
    "price": "2억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "기장역 도보권, 생활편의시설 인접, 6층"
  },
  {
    "name": "웨이브리즈",
    "address": "부산시 기장군 기장읍 청강리 868",
    "size": "59.99㎡ (18평)",
    "price": "2억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "기장읍 중심, 9층, 생활편의시설 인접, 신축"
  },
  {
    "name": "기장유림노르웨이숲",
    "address": "부산시 기장군 기장읍 교리 371",
    "size": "53.04㎡ (16평)",
    "price": "2억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "기장읍 중심, 3층, 생활편의시설 인접, 신축"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "이진캐스빌블루 1차아파트",
    "address": "부산시 기장군 기장읍 교리 2",
    "size": "115.64㎡ (35평)",
    "price": "5억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "24층, 대단지, 기장역 도보권, 생활편의시설 인접"
  },
  {
    "name": "동부산관광단지삼정그린코아더베스트",
    "address": "부산시 기장군 기장읍 내리 792",
    "size": "84.98㎡ (25평)",
    "price": "5억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "9층, 신축, 대단지, 생활편의시설 인접"
  },
  {
    "name": "이진캐스빌아파트",
    "address": "부산시 기장군 기장읍",
    "size": "79.63㎡ (24평)",
    "price": "2억 6,000만원~5억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "11층, 신축, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"부산광역시 남구":{
"~2억":{
  "houses": [
    {
    "name": "자유2아파트",
    "address": "부산시 남구 우암동",
    "size": "61.38㎡ (27평)",
    "price": "1억 8,900만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "우암동 중심, 학세권, 버스 다수, 생활편의시설 인접"
  },
  {
    "name": "대우그린1차",
    "address": "부산시 남구 대연동",
    "size": "59.99㎡ (25평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "대연동 중심, 학세권, 버스 다수, 생활편의시설 인접"
  },
  {
    "name": "우암자유4아파트",
    "address": "부산시 남구 감만동",
    "size": "57.06㎡ (20평)",
    "price": "1억 8,300만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "감만동 중심, 학세권, 버스 다수, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "쌍용예가",
    "address": "부산시 남구 용호동",
    "size": "59.96㎡ (24평)",
    "price": "2억 9,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "용호동 중심, 학세권, 대단지, 생활편의시설 인접"
  },
  {
    "name": "현대아파트",
    "address": "부산시 남구 문현동",
    "size": "59.95㎡ (23평)",
    "price": "2억 3,700만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "문현동 중심, 학세권, 버스 다수, 생활편의시설 인접"
  },
  {
    "name": "롯데캐슬아인스",
    "address": "부산시 남구 용호동",
    "size": "59.93㎡ (25평)",
    "price": "2억 2,700만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "용호동 중심, 학세권, 대단지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "대연로얄듀크2차아파트",
    "address": "부산시 남구 대연동",
    "size": "84.98㎡ (25평)",
    "price": "5억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "대연동 중심, 대단지, 9층, 생활편의시설 인접"
  },
  {
    "name": "대연SK뷰힐스",
    "address": "부산시 남구 대연동",
    "size": "84.99㎡ (25평)",
    "price": "8억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "대연동 중심, 대단지, 13층, 생활편의시설 인접"
  },
  {
    "name": "대연자이아파트",
    "address": "부산시 남구 대연동",
    "size": "84.97㎡ (25평)",
    "price": "8억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "대연동 중심, 대단지, 24층, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "대연롯데캐슬레전드",
    "address": "부산시 남구 대연동",
    "size": "121.97㎡",
    "price": "10억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "대연동 중심, 대단지, 26층, 생활편의시설 인접"
  },
  {
    "name": "대연힐스테이트푸르지오",
    "address": "부산시 남구 대연동",
    "size": "134.05㎡",
    "price": "13억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "대연동 중심, 대단지, 9층, 생활편의시설 인접"
  },
  {
    "name": "GS하이츠자이",
    "address": "부산시 남구 용호동",
    "size": "151.28㎡",
    "price": "13억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "용호동 중심, 대단지, 32층, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [
    {
    "name": "W아파트",
    "address": "부산시 남구",
    "size": "180.73㎡",
    "price": "36억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "49층, 초고층, 남구 최고가, 바다조망, 생활편의시설 인접"
  }
  ]
}
},

"부산광역시 동구":{
"~2억":{
  "houses": [
  {
    "name": "수정동 청광아파트",
    "address": "부산시 동구 수정동",
    "size": "76.5㎡ (약 23평)",
    "price": "1억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "부산1호선 인근, 1995년 입주, 생활편의시설 인접"
  },
  {
    "name": "초량동 동일파크",
    "address": "부산시 동구 초량동",
    "size": "63㎡ (약 19평)",
    "price": "1억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1984년 입주, 초량동 중심, 생활편의시설 인접"
  },
  {
    "name": "초량동 남평N-CITY",
    "address": "부산시 동구 초량동",
    "size": "56㎡ (약 17평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2016년 입주, 초량동 중심, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "초량동 지원더뷰오션1차",
    "address": "부산시 동구 초량동",
    "size": "85㎡ (약 25평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 입주, 대단지, 바다조망, 생활편의시설 인접"
  },
  {
    "name": "초량동 센트럴베이동원로얄듀크비스타",
    "address": "부산시 동구 초량동",
    "size": "85㎡ (약 25평)",
    "price": "3억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2011년 입주, 대단지, 생활편의시설 인접"
  },
  {
    "name": "좌천동 두산위브범일뉴타운",
    "address": "부산시 동구 좌천동",
    "size": "84.99㎡ (약 25평)",
    "price": "3억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2016년 입주, 대단지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "범양레우스센트럴베이",
    "address": "부산시 동구 범일동",
    "size": "84.94㎡ (약 25평)",
    "price": "6억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 입주, 39층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "부산항일동미라주더오션2지구",
    "address": "부산시 동구 좌천동",
    "size": "73.82㎡ (약 22평)",
    "price": "5억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 입주, 36층, 바다조망, 생활편의시설 인접"
  },
  {
    "name": "범일동 진흥마제스타워",
    "address": "부산시 동구 범일동",
    "size": "161.74㎡ (약 49평)",
    "price": "5억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "주상복합, 29층, 대형 평수, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"부산광역시 동래구":{
"~2억":{
  "houses": [
    {
    "name": "삼정그린코아",
    "address": "부산시 동래구 사직동",
    "size": "59.73㎡ (18평)",
    "price": "2억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1998년 입주, 7층, 대단지, 사직동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
    },
  {
    "name": "한신",
    "address": "부산시 동래구 사직동",
    "size": "59.8㎡ (18평)",
    "price": "2억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1998년 입주, 2층, 사직동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "한우아파트",
    "address": "부산시 동래구 안락동",
    "size": "52.2㎡ (16평)",
    "price": "1억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "5층, 안락동 중심, 버스 다수, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "동래보해이브",
    "address": "부산시 동래구 안락동",
    "size": "59.99㎡ (18평)",
    "price": "2억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "저층, 2005년 입주, 대단지, 생활편의시설 인접"
  },
  {
    "name": "동래화목타운",
    "address": "부산시 동래구 안락동",
    "size": "103㎡ (31평)",
    "price": "2억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "10층, 1990년 입주, 대단지, 생활편의시설 인접"
  },
  {
    "name": "한신아파트",
    "address": "부산시 동래구 사직동",
    "size": "84.96㎡ (26평)",
    "price": "2억 4,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "4층, 사직동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "명륜2차아이파크1단지",
    "address": "부산시 동래구 명륜동",
    "size": "84㎡ (25평)",
    "price": "5억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "11층, 24층 단지, 명륜동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "동래SK뷰",
    "address": "부산시 동래구 온천동",
    "size": "84.99㎡ (25평)",
    "price": "5억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "8층, 온천동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "동래우성",
    "address": "부산시 동래구 낙민동",
    "size": "162㎡ (49평)",
    "price": "5억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "23층, 1989년 입주, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "래미안포레스티지",
    "address": "부산시 동래구 온천동",
    "size": "110㎡ (33평)",
    "price": "11억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "17층, 신축, 대단지, 생활편의시설 인접"
  },
  {
    "name": "동래래미안아이파크",
    "address": "부산시 동래구 온천동",
    "size": "112㎡ (34평)",
    "price": "12억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "7층, 신축, 대단지, 생활편의시설 인접"
  },
  {
    "name": "동래SK뷰(대형)",
    "address": "부산시 동래구 온천동",
    "size": "135㎡ (41평)",
    "price": "13억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층, 신축, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"부산광역시 부산진구":{
"~2억":{
  "houses": [
    {
    "name": "네오스포아파트",
    "address": "부산진구 부전동 450",
    "size": "59.9㎡",
    "price": "1억 6,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "27층 대단지, 부전역 도보권, 생활편의시설 인접"
  },
  {
    "name": "홍림로얄뷰",
    "address": "부산진구 개금동",
    "size": "68.8㎡ (약 20.8평)",
    "price": "1억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "개금동 중심, 관리비 15만원, 교통·생활편의시설 인접"
  },
  {
    "name": "동원화인패밀리타운",
    "address": "부산진구 개금동",
    "size": "106㎡ (약 32.1평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "개금동 중심, 10층, 관리비 없음, 교통·생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "네오스포아파트",
    "address": "부산진구 부전동 450",
    "size": "84.64㎡",
    "price": "2억 5,600만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "22층, 대단지, 부전역 도보권, 생활편의시설 인접"
  },
  {
    "name": "개금주공2단지",
    "address": "부산진구 개금동",
    "size": "61㎡",
    "price": "2억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "13층, 남향, 공원뷰, 급매, 교통·생활편의시설 인접"
  },
  {
    "name": "리츠캐슬",
    "address": "부산진구 범천동",
    "size": "63㎡ (약 19.03평)",
    "price": "2억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "7층, 범천동 중심, 관리비 15만원, 교통·생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "삼한골든뷰센트럴파크",
    "address": "부산진구 범전동",
    "size": "84.99㎡",
    "price": "8억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "48층, 2019년 입주, 대단지, 서면 도보권, 생활편의시설 인접"
  },
  {
    "name": "더샵센트럴스타아파트",
    "address": "부산진구 부전동 537-9",
    "size": "153.2㎡",
    "price": "9억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "39층, 2011년 입주, 대단지, 서면역 인접, 생활편의시설 인접"
  },
  {
    "name": "서면동원맨션",
    "address": "부산진구 범전동 9-151",
    "size": "63.08㎡",
    "price": "8억 1,400만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1층, 1982년 입주, 서면 중심, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "래미안 어반파크",
    "address": "부산진구 부암동",
    "size": "114.84㎡",
    "price": "11억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "20층, 2021년 입주, 대단지, 서면 도보권, 생활편의시설 인접"
  },
  {
    "name": "가야롯데캐슬골드아너",
    "address": "부산진구 가야동 700",
    "size": "전용 84.99㎡",
    "price": "10억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 입주, 대단지, 가야역 인접, 생활편의시설 인접"
  },
  {
    "name": "더샵센트럴스타아파트",
    "address": "부산진구 부전동 537-9",
    "size": "153.2㎡",
    "price": "11억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "41층, 2011년 입주, 대단지, 서면역 인접, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"부산광역시 북구":{
"~2억":{
  "houses": [
     {
    "name": "덕천동 롯데아파트",
    "address": "부산시 북구 덕천동",
    "size": "84.7㎡ (약 25평)",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "덕천동 중심, 2004년 준공, 705세대, 지하철 3호선 인근, 생활편의시설 인접"
  },
  {
    "name": "금곡동 화명리버힐2차",
    "address": "부산시 북구 금곡동",
    "size": "82.6㎡ (약 25평)",
    "price": "2억 6,600만원(최근 실거래가, 급매는 2억 이하 가능)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "금곡동 중심, 2003년 준공, 722세대, 지하철 인근, 생활편의시설 인접"
  },
  {
    "name": "백양 디이스트",
    "address": "부산시 북구 만덕동",
    "size": "84.9㎡ (약 25평)",
    "price": "2억 이하(저층, 2015년 준공, 최근 실거래가 하락)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "만덕역 도보 10분, 2015년 준공, 360세대, 학군 및 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
     {
    "name": "화명동 대우이안",
    "address": "부산시 북구 화명동",
    "size": "84.98㎡ (약 25평)",
    "price": "5억 1,000만원~5억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "화명동 중심, 2002년 준공, 989세대, 대단지, 생활편의시설 인접"
  },
  {
    "name": "화명플리체비스타동원",
    "address": "부산시 북구 화명동",
    "size": "84.6㎡ (약 25평)",
    "price": "5억 3,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "화명동 중심, 2022년 준공, 447세대, 신축, 생활편의시설 인접"
  },
  {
    "name": "포레나 부산덕천2차",
    "address": "부산시 북구 덕천동",
    "size": "74.95㎡ (약 23평)",
    "price": "5억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "덕천동 중심, 2021년 준공, 75㎡, 5억 9,500만원(24.09 실거래)"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "포레나부산덕천",
    "address": "부산시 북구 덕천동",
    "size": "84.97㎡ (약 25평)",
    "price": "7억 7,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "덕천동 중심, 2021년 준공, 17층, 신축, 대단지, 생활편의시설 인접"
  },
  {
    "name": "롯데낙천대",
    "address": "부산시 북구 덕천동",
    "size": "142.18㎡ (약 43평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "덕천동 중심, 2004년 준공, 대단지, 13층, 생활편의시설 인접"
  },
  {
    "name": "대림쌍용강변타운",
    "address": "부산시 북구 화명동",
    "size": "131.07㎡ (약 40평)",
    "price": "7억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "화명동 중심, 1998년 준공, 대단지, 10층, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "롯데캐슬카이저",
    "address": "부산시 북구 화명동",
    "size": "171.77㎡ (약 52평)",
    "price": "12억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "화명동 중심, 2011년 준공, 35층, 초고층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "포레나부산덕천(대형)",
    "address": "부산시 북구 덕천동",
    "size": "112.4㎡ (약 34평)",
    "price": "11억대",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "덕천동 중심, 신축, 대단지, 고층, 생활편의시설 인접"
  },
  {
    "name": "롯데캐슬카이저(대형)",
    "address": "부산시 북구 화명동",
    "size": "171.77㎡ (약 52평)",
    "price": "12억~13억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "화명동 중심, 초고층, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"부산광역시 사상구":{
"~2억":{
  "houses": [
    
  {
    "name": "오양힐타운",
    "address": "부산시 사상구 덕포동",
    "size": "84.94㎡ (약 25평)",
    "price": "1억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1992년 입주, 352세대, 부산2호선 인근, 생활편의시설 인접"
  },
  {
    "name": "부원파크타운",
    "address": "부산시 사상구 덕포동",
    "size": "74.25㎡ (약 22평)",
    "price": "1억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1989년 입주, 420세대, 부산2호선 인근, 생활편의시설 인접"
  },
  {
    "name": "엄궁럭키",
    "address": "부산시 사상구 엄궁동",
    "size": "82.6㎡ (약 25평)",
    "price": "1억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1993년 입주, 441세대, 부산2호선 인근, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "코오롱아파트",
    "address": "부산시 사상구 엄궁동 680-1",
    "size": "108.22㎡ (약 33평)",
    "price": "2억 7,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1999년 입주, 1,158세대, 4층/22층, 최근 올수리, 생활편의시설 인접"
  },
  {
    "name": "괘법한신2차아파트",
    "address": "부산시 사상구 괘법동",
    "size": "84.98㎡ (약 25평)",
    "price": "2억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "대단지, 부산2호선 인근, 생활편의시설 인접"
  },
  {
    "name": "강변동원아파트",
    "address": "부산시 사상구 괘법동",
    "size": "84.98㎡ (약 25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "대단지, 부산2호선 인근, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "엄궁롯데캐슬리버",
    "address": "부산시 사상구 엄궁동 726",
    "size": "154.51㎡ (약 47평)",
    "price": "5억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 입주, 1,852세대, 중/29층, 올수리, 남향, 낙동강 조망, 생활편의시설 인접"
  },
  {
    "name": "주례롯데캐슬골드스마트",
    "address": "부산시 사상구 주례동",
    "size": "84.87㎡ (약 25평)",
    "price": "6억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 입주, 998세대, 26층, 부산2호선 인근, 생활편의시설 인접"
  },
  {
    "name": "센트럴스타힐스",
    "address": "부산시 사상구 괘법동",
    "size": "84.8㎡ (약 25평)",
    "price": "5억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 입주, 874세대, 38층, 부산2호선·부산김해선 인근, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"부산광역시 사하구":{
"~2억":{
  "houses": [
    {
    "name": "한신혜성",
    "address": "부산시 사하구 하단동",
    "size": "84.36㎡ (25평)",
    "price": "2억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1996년 입주, 5층, 533세대, 부산1호선 인근, 생활편의시설 인접"
  },
  {
    "name": "장림현대아파트",
    "address": "부산시 사하구 장림동",
    "size": "84.0㎡ (25평)",
    "price": "1억 5,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "10층, 대단지, 장림동 중심, 생활편의시설 인접"
  },
  {
    "name": "신평현대아파트",
    "address": "부산시 사하구 신평동",
    "size": "84.0㎡ (25평)",
    "price": "1억 9,900만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1층, 대단지, 신평동 중심, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "사하한신더휴",
    "address": "부산시 사하구 괴정동",
    "size": "84.85㎡ (25평)",
    "price": "5억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "16층, 2020년 준공, 대단지, 부산1호선 인근, 생활편의시설 인접"
  },
  {
    "name": "SKVIEW아파트",
    "address": "부산시 사하구 하단동",
    "size": "59.67㎡ (18평)",
    "price": "2억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "21층, 2004년 준공, 대단지, 하단동 중심, 생활편의시설 인접"
  },
  {
    "name": "괴정협진태양",
    "address": "부산시 사하구 괴정동",
    "size": "84.0㎡ (25평)",
    "price": "2억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2002년 준공, 3층, 괴정동 중심, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "힐스테이트사하역",
    "address": "부산시 사하구 괴정동",
    "size": "84.92㎡ (25평)",
    "price": "6억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "25층, 2021년 준공, 대단지, 괴정동 중심, 부산1호선 인근, 생활편의시설 인접"
  },
  {
    "name": "사하역비스타동원",
    "address": "부산시 사하구 괴정동",
    "size": "84.98㎡ (25평)",
    "price": "5억 8,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "20층, 2021년 준공, 대단지, 괴정동 중심, 부산1호선 인근, 생활편의시설 인접"
  },
  {
    "name": "성원상떼빌아파트",
    "address": "부산시 사하구 다대동",
    "size": "134.96㎡ (41평)",
    "price": "5억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "6층, 1998년 준공, 대단지, 다대동 중심, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"부산광역시 서구":{
"~2억":{
  "houses": [
    {
    "name": "송도현대아파트",
    "address": "부산시 서구 암남동 611-5",
    "size": "84.86㎡",
    "price": "1억 4,950만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "암남동 중심, 12층/6층, 2024년 5월 실거래, 버스 다수, 생활편의시설 인접"
  },
  {
    "name": "송도동일스위트",
    "address": "부산시 서구 암남동 16-6",
    "size": "59.91㎡",
    "price": "1억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "암남동, 9층, 2024년 3월 실거래, 대단지, 생활편의시설 인접"
  },
  {
    "name": "고려빌라맨션",
    "address": "부산시 서구 암남동 350-1",
    "size": "64.26㎡",
    "price": "1억 5,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "암남동, 8층, 2024년 5월 실거래, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "기산비치타운",
    "address": "부산시 서구 암남동 354-1",
    "size": "79.56㎡",
    "price": "2억 7,900만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "암남동, 10층, 2024년 5월 실거래, 바다 인접, 생활편의시설 인접"
  },
  {
    "name": "정림비치타운아파트",
    "address": "부산시 서구 암남동 64-2",
    "size": "108.81㎡",
    "price": "2억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "암남동, 11층, 2024년 3월 실거래, 대단지, 생활편의시설 인접"
  },
  {
    "name": "송도풍림아이원",
    "address": "부산시 서구 암남동 595",
    "size": "84.98㎡",
    "price": "3억 7,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "암남동, 2층, 2024년 5월 실거래, 대단지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "비스타동원 더비치테라스",
    "address": "부산시 서구 암남동 771",
    "size": "84.67㎡",
    "price": "6억 2,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "암남동, 16층/27층, 2024년 5월 실거래, 바다조망, 생활편의시설 인접"
  },
  {
    "name": "송도풍림아이원",
    "address": "부산시 서구 암남동 595",
    "size": "126.58㎡",
    "price": "7억 2,700만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "암남동, 24층, 2024년 4월 실거래, 대단지, 생활편의시설 인접"
  },
  {
    "name": "송도힐스테이트이진베이시티",
    "address": "부산시 서구 암남동 123-15",
    "size": "138.86㎡",
    "price": "13억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "암남동, 39층, 2024년 4월 실거래, 초고층, 바다조망, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "송도힐스테이트이진베이시티",
    "address": "부산시 서구 암남동 123-15",
    "size": "138.86㎡",
    "price": "13억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "암남동, 39층, 2024년 4월 실거래, 초고층, 바다조망, 생활편의시설 인접"
  },
  {
    "name": "경동리인타워",
    "address": "부산시 서구 토성동1가 25-1",
    "size": "99.84㎡",
    "price": "10억 2,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "토성동1가, 47층, 2024년 12월 실거래, 초고층, 생활편의시설 인접"
  },
  {
    "name": "대신푸르지오아파트",
    "address": "부산시 서구 서대신동1가 283",
    "size": "115.82㎡",
    "price": "9억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "서대신동1가, 24층, 2024년 10월 실거래, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"부산광역시 수영구":{
"~2억":{
  "houses": [
    {
    "name": "수영동 소형 단층주택",
    "address": "부산시 수영구 수영동 462-6",
    "size": "약 82.6㎡ (25평, 대지 기준)",
    "price": "2억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "단층, 방2+다락1, 욕실1, 주방겸거실, 전체 리모델링, 전철역 도보 8분, 공원·시장·마트 인접"
  },
  {
    "name": "광안동 39㎡ 아파트",
    "address": "부산시 수영구 광안동 778-1",
    "size": "39㎡ (약 12평)",
    "price": "2억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "아파트, 9/14층, 남향, 광안대교뷰, 트인 전망, 집상태 양호"
  },
  {
    "name": "민락동 49㎡ 빌라",
    "address": "부산시 수영구 민락동 774",
    "size": "49㎡ (약 15평)",
    "price": "2억 이하(급매 가능)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "빌라, 4/5층, 남향, 전체 올수리, 실입주 또는 투자용, 주차 가능"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "광안동 84㎡ 아파트",
    "address": "부산시 수영구 광안동",
    "size": "84㎡ (약 25평)",
    "price": "3억~4억대",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "아파트, 남동향, 광안대교 뷰, 방3 욕실2, 시스템에어컨, 중문, 인테리어 양호"
  },
  {
    "name": "수영동 74㎡ 아파트",
    "address": "부산시 수영구 수영동",
    "size": "74㎡ (약 22평)",
    "price": "3억~4억대",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "아파트, 남향, 방3 욕실2, 베란다, 부분수리, 일조권 양호"
  },
  {
    "name": "민락동 83㎡ 아파트",
    "address": "부산시 수영구 민락동 774",
    "size": "83㎡ (약 25평)",
    "price": "3억~4억대",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "아파트, 6/19층, 남향, 수영1구역 재개발, 실입주 또는 투자용"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "광안동 100㎡ 아파트",
    "address": "부산시 수영구 광안동",
    "size": "100㎡ (약 30평)",
    "price": "7억~9억대",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층, 광안대교 뷰, 방4 욕실2, 드레스룸, 풀옵션, 인테리어 양호"
  },
  {
    "name": "민락동 84㎡ 아파트",
    "address": "부산시 수영구 민락동",
    "size": "84㎡ (약 25평)",
    "price": "6억~8억대",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중층, 남향, 광안대교 뷰, 시스템에어컨, 판상형, 채광·통풍 우수"
  },
  {
    "name": "광안동 84㎡ 아파트(광안대교 뷰)",
    "address": "부산시 수영구 광안동",
    "size": "84㎡ (약 25평)",
    "price": "7억~9억대",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남향, 고층, 광안대교 뷰, 시스템에어컨, 실입주 가능"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "광안동 100㎡ 아파트(광안대교 프리미엄)",
    "address": "부산시 수영구 광안동",
    "size": "100㎡ (약 30평)",
    "price": "12억~13억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층, 광안대교 파노라마 뷰, 풀옵션, 별도 인테리어, 신축급"
  },
  {
    "name": "민락동 129㎡ 아파트",
    "address": "부산시 수영구 민락동",
    "size": "129㎡ (약 39평)",
    "price": "13억~14억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중층, 남향, 초록백산뷰, 집컨디션 우수, 실입주 가능"
  },
  {
    "name": "광안동 100㎡ 아파트(광안대교 뷰)",
    "address": "부산시 수영구 광안동",
    "size": "100㎡ (약 30평)",
    "price": "11억~13억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층, 남향, 광안대교 뷰, 조합원 풀옵션, 별도 인테리어"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"부산광역시 연제구":{
"~2억":{
  "houses": [
    {
    "name": "연산동 대우아파트",
    "address": "부산시 연제구 연산동 30-1",
    "size": "77.22㎡ (전용 53.67㎡)",
    "price": "2억 500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "25층/25층, 2000년 준공, 전체 올수리, 탑층, 채광 전망 우수, 연산동 중심, 생활편의시설 인접"
  },
  {
    "name": "연산동 더샵시티애비뉴2차(소형)",
    "address": "부산시 연제구 연산동 1366-1",
    "size": "29.98㎡",
    "price": "1억 3,200만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "20층, 2016년 준공, 초소형, 역세권, 연산동 중심, 생활편의시설 인접"
  },
  {
    "name": "연산롯데캐슬골드포레(소형)",
    "address": "부산시 연제구 연산동 2367",
    "size": "39.87㎡",
    "price": "2억 5,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "3층, 2020년 준공, 소형 평형, 연산동 중심, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "망미주공아파트(중소형)",
    "address": "부산시 연제구 연산동 2220",
    "size": "61.56㎡",
    "price": "3억 8,550만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "13층, 1993년 준공, 대단지, 연산동 중심, 생활편의시설 인접"
  },
  {
    "name": "연산롯데캐슬골드포레(소형)",
    "address": "부산시 연제구 연산동 2367",
    "size": "39.87㎡",
    "price": "2억 6,100만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "5층, 2020년 준공, 소형 평형, 연산동 중심, 생활편의시설 인접"
  },
  {
    "name": "연산동 대우아파트",
    "address": "부산시 연제구 연산동 30-1",
    "size": "77.22㎡ (전용 53.67㎡)",
    "price": "2억 500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "25층/25층, 2000년 준공, 전체 올수리, 탑층, 채광 전망 우수, 연산동 중심, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "연산자이",
    "address": "부산시 연제구 연산동 2262",
    "size": "84.65㎡",
    "price": "5억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "6층, 2010년 준공, 대단지, 연산동 중심, 생활편의시설 인접"
  },
  {
    "name": "연산롯데캐슬골드포레",
    "address": "부산시 연제구 연산동 2367",
    "size": "84.98㎡",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "7층, 2020년 준공, 대단지, 연산동 중심, 생활편의시설 인접"
  },
  {
    "name": "연제롯데캐슬데시앙",
    "address": "부산시 연제구 연산동",
    "size": "84.9㎡",
    "price": "7억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "37층, 2021년 준공, 대단지, 연산동 중심, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "연산자이(대형)",
    "address": "부산시 연제구 연산동 2262",
    "size": "182.76㎡",
    "price": "10억 500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "13층, 2010년 준공, 대단지, 연산동 중심, 생활편의시설 인접"
  },
  {
    "name": "연산롯데캐슬골드포레(대형)",
    "address": "부산시 연제구 연산동 2367",
    "size": "105.79㎡",
    "price": "9억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "27층, 2020년 준공, 대단지, 연산동 중심, 생활편의시설 인접"
  },
  {
    "name": "부산더샵 파크시티",
    "address": "부산시 연제구 연산동",
    "size": "101.97㎡",
    "price": "8억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "33층, 2018년 준공, 대단지, 연산동 중심, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"부산광역시 영도구":{
"~2억":{
  "houses": [
    {
    "name": "천지해오름",
    "address": "부산시 영도구 청학동",
    "size": "81.3㎡",
    "price": "1억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2005년 입주, 11층, 부산1호선 인근, 전용 84㎡ 환산시 약 2억, 생활편의시설 인접"
  },
  {
    "name": "반도보라아파트(소형)",
    "address": "부산시 영도구 영선동4가",
    "size": "59.7㎡",
    "price": "2억 이하(최근 16층 2억 1,700만원, 급매는 2억 이하 가능)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2000년 입주, 16층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "동삼그린힐4단지",
    "address": "부산시 영도구 동삼동",
    "size": "59㎡",
    "price": "1억~2억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "저층, 1995년 준공, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "반도보라아파트",
    "address": "부산시 영도구 영선동4가",
    "size": "84.8㎡",
    "price": "3억 5,400만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2000년 입주, 21층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "미광마린타워",
    "address": "부산시 영도구 봉래동2가",
    "size": "84.78㎡",
    "price": "3억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1992년 입주, 1층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "동부산아이존빌",
    "address": "부산시 영도구 영선동2가",
    "size": "84.94㎡",
    "price": "4억 1,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2004년 입주, 19층, 대단지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "부산오션시티푸르지오",
    "address": "부산시 영도구 동삼동",
    "size": "115.73㎡",
    "price": "7억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 입주, 45층, 신축, 대단지, 바다조망, 생활편의시설 인접"
  },
  {
    "name": "동부산아이존빌(대형)",
    "address": "부산시 영도구 영선동2가",
    "size": "129.77㎡",
    "price": "5억 2,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2004년 입주, 14층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "미광마린타워(대형)",
    "address": "부산시 영도구 봉래동2가",
    "size": "122.74㎡",
    "price": "5억 2,200만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1992년 입주, 17층, 대단지, 바다조망, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "봉래동 상가건물(올근생, 꼬마빌딩)",
    "address": "부산시 영도구 봉래동",
    "size": "지상 4층, 대지/연면적 별도",
    "price": "10억대",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "일반상업지역, 근린생활시설, 투자용, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"부산광역시 중구":{
"~2억":{
  "houses": [
    {
    "name": "동아(160-0) 아파트",
    "address": "부산시 중구 영주동",
    "size": "84.72㎡ (약 25평)",
    "price": "1억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1998년 입주, 328세대, 저층, 영주동 중심, 생활편의시설 인접"
  },
  {
    "name": "새들맨션",
    "address": "부산시 중구 대청동4가",
    "size": "84㎡ (약 25평)",
    "price": "1억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1981년 입주, 84㎡, 대청동 중심, 생활편의시설 인접"
  },
  {
    "name": "코모도에스테이트",
    "address": "부산시 중구 대청동1가",
    "size": "50㎡ (약 15평)",
    "price": "1억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2013년 입주, 50㎡, 대청동 중심, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "그린시티",
    "address": "부산시 중구 대청동2가",
    "size": "85㎡ (약 25평)",
    "price": "2억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2012년 입주, 85㎡, 대청동 중심, 생활편의시설 인접"
  },
  {
    "name": "서원블루오션F동",
    "address": "부산시 중구 보수동3가",
    "size": "66㎡ (약 20평)",
    "price": "2억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2019년 입주, 66㎡, 보수동 중심, 생활편의시설 인접"
  },
  {
    "name": "도경오벨리스",
    "address": "부산시 중구 영주동",
    "size": "84㎡ (약 25평)",
    "price": "2억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2005년 입주, 84㎡, 영주동 중심, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"부산광역시 해운대구":{
"~2억":{
  "houses": [
    {
    "name": "남흥아파트",
    "address": "부산시 해운대구 반송동",
    "size": "84.88㎡ (약 25평)",
    "price": "1억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1996년 입주, 부산4호선 인근, 저층, 생활편의시설 인접"
  },
  {
    "name": "현대3차아파트",
    "address": "부산시 해운대구 반여동",
    "size": "84.92㎡ (약 25평)",
    "price": "1억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1995년 입주, 16층, 생활편의시설 인접"
  },
  {
    "name": "해운대대림2차(저층)",
    "address": "부산시 해운대구 좌동",
    "size": "59.81㎡ (약 18평)",
    "price": "2억 7,500만원(급매는 2억 이하 가능)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1997년 입주, 2층, 좌동 중심, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "해운대대우2차(소형)",
    "address": "부산시 해운대구 좌동",
    "size": "59.94㎡ (약 18평)",
    "price": "3억~3억 1,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1998년 입주, 10~14층, 좌동 중심, 생활편의시설 인접"
  },
  {
    "name": "해운대한일아파트(소형)",
    "address": "부산시 해운대구 좌동",
    "size": "58.2㎡ (약 18평)",
    "price": "3억 3,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1996년 입주, 16층, 좌동 중심, 생활편의시설 인접"
  },
  {
    "name": "해운대대림2차(중층)",
    "address": "부산시 해운대구 좌동",
    "size": "59.81㎡ (약 18평)",
    "price": "3억 6,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1997년 입주, 17층, 좌동 중심, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "해운대자이2차1단지",
    "address": "부산시 해운대구 우동",
    "size": "84.96㎡ (약 25평)",
    "price": "9억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 입주, 13층, 부산2호선 인근, 대단지, 생활편의시설 인접"
  },
  {
    "name": "해운대비스타동원",
    "address": "부산시 해운대구 우동",
    "size": "84.94㎡ (약 25평)",
    "price": "9억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2019년 입주, 27층, 부산2호선 인근, 대단지, 생활편의시설 인접"
  },
  {
    "name": "해운대힐스테이트위브",
    "address": "부산시 해운대구 중동",
    "size": "105.88㎡ (약 32평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2015년 입주, 14층, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "해운대두산위브더제니스",
    "address": "부산시 해운대구 우동",
    "size": "111.07㎡ (약 34평)",
    "price": "13억 5,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2011년 입주, 16층, 초고층, 바다조망, 생활편의시설 인접"
  },
  {
    "name": "해운대아이파크",
    "address": "부산시 해운대구 우동",
    "size": "168.5㎡ (약 51평)",
    "price": "12억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2011년 입주, 10층, 초고층, 바다조망, 생활편의시설 인접"
  },
  {
    "name": "쌍용더플래티넘해운대",
    "address": "부산시 해운대구 중동",
    "size": "84㎡ (약 25평)",
    "price": "10억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신축, 11층, 호텔식 화장실, 초품아, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "더샵센텀파크1차",
    "address": "부산시 해운대구 재송동",
    "size": "151.91㎡ (약 46평)",
    "price": "15억~23억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2007년 입주, 42층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "트럼프월드센텀",
    "address": "부산시 해운대구 우동",
    "size": "108.51㎡ (약 33평)",
    "price": "21억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2011년 입주, 31층, 초고층, 바다조망, 생활편의시설 인접"
  },
  {
    "name": "해운대현대하이페리온",
    "address": "부산시 해운대구 우동",
    "size": "217.21㎡ (약 66평)",
    "price": "19억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2011년 입주, 7층, 초고층, 바다조망, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
{
    "name": "해운대두산위브더제니스(펜트하우스)",
    "address": "부산시 해운대구 우동",
    "size": "222.6㎡ (약 67평)",
    "price": "48억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2011년 입주, 78층, 초고층, 파노라마 오션뷰, 최고급 단지"
  },
  {
    "name": "해운대아이파크(펜트하우스)",
    "address": "부산시 해운대구 우동",
    "size": "205.53㎡ (약 62평)",
    "price": "39억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2011년 입주, 71층, 초고층, 파노라마 오션뷰, 최고급 단지"
  },
  {
    "name": "시그니엘 부산",
    "address": "부산시 해운대구 중동",
    "size": "144.25㎡ (약 44평)",
    "price": "33억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 입주, 78층, 초고층, 오션뷰, 최고급 주상복합"
  }
  ]
}
},






"대구광역시 남구":{
"~2억":{
  "houses": [
    {
    "name": "보성청록타운",
    "address": "대구 남구 대명동",
    "size": "59㎡ (약 18평)",
    "price": "1억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "46년차, 427세대, 대명동 중심, 버스 다수, 생활편의시설 인접"
  },
  {
    "name": "효성타운1차아파트",
    "address": "대구 남구 봉덕동",
    "size": "84.9㎡ (약 25평)",
    "price": "2억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "38년차, 706세대, 봉덕동 중심, 버스 다수, 생활편의시설 인접"
  },
  {
    "name": "상아맨션",
    "address": "대구 남구 이천동",
    "size": "84.73㎡ (약 25평)",
    "price": "2억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "39년차, 510세대, 이천동 중심, 버스 다수, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "이천뜨란채4단지아파트",
    "address": "대구 남구 이천동",
    "size": "84.93㎡ (약 25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "3년차, 400세대, 이천동 중심, 버스 다수, 생활편의시설 인접"
  },
  {
    "name": "희망교대성유니드",
    "address": "대구 남구 이천동",
    "size": "75.75㎡ (약 23평)",
    "price": "2억 3,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "3년차, 433세대, 이천동 중심, 버스 다수, 생활편의시설 인접"
  },
  {
    "name": "나나바루아(102동)",
    "address": "대구 남구 대명동",
    "size": "84.95㎡ (약 25평)",
    "price": "3억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신축, 대명동 중심, 버스 다수, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "대명역센트럴엘리프",
    "address": "대구 남구 대명동",
    "size": "114.71㎡ (약 35평)",
    "price": "6억 7,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신축, 대명동 중심, 버스 다수, 생활편의시설 인접"
  },
  {
    "name": "앞산힐스테이트",
    "address": "대구 남구 봉덕동",
    "size": "151.26㎡ (약 46평)",
    "price": "6억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2008년 준공, 425세대, 봉덕동 중심, 버스 다수, 생활편의시설 인접"
  },
  {
    "name": "상아맨션(대형)",
    "address": "대구 남구 이천동",
    "size": "197.13㎡ (약 60평)",
    "price": "5억 6,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "39년차, 510세대, 이천동 중심, 버스 다수, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"대구광역시 달서구":{
"~2억":{
  "houses": [
    {
    "name": "벽산타워",
    "address": "대구 달서구 두류동 470-1",
    "size": "81.98㎡",
    "price": "2억 2,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2005년 준공, 18층, 두류역 인근, 생활편의시설 인접"
  },
  {
    "name": "선빌파크타운",
    "address": "대구 달서구 두류동 141-2",
    "size": "84.95㎡",
    "price": "2억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2004년 준공, 13층, 두류공원 인근, 생활편의시설 인접"
  },
  {
    "name": "본리롯데캐슬2차",
    "address": "대구 달서구 본리동 196-1",
    "size": "84.98㎡",
    "price": "3억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2009년 준공, 20층, 본리동 중심, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
     {
    "name": "두산위브더제니스센트럴달서",
    "address": "대구 달서구 본리동 1234",
    "size": "84.99㎡",
    "price": "4억 9,390만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 준공, 23층, 본리동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "롯데캐슬그랜드",
    "address": "대구 달서구 용산동 230-10",
    "size": "84.73㎡",
    "price": "4억 3,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2004년 준공, 25층, 용산동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "대구월성푸르지오",
    "address": "대구 달서구 월성동 120",
    "size": "84.92㎡",
    "price": "4억 4,300만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2011년 준공, 13층, 월성동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "두류센트레빌더시티",
    "address": "대구 달서구 두류동 2346",
    "size": "84.7㎡",
    "price": "6억 4,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 준공, 19층, 두류동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "월성e편한세상",
    "address": "대구 달서구 월성동 536",
    "size": "182.96㎡",
    "price": "9억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2009년 준공, 11층, 월성동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "월드마크웨스트엔드",
    "address": "대구 달서구 감삼동 461",
    "size": "175.55㎡",
    "price": "10억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 준공, 15층, 감삼동 중심, 초고층, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "월드마크웨스트엔드(대형)",
    "address": "대구 달서구 감삼동 461",
    "size": "175.55㎡",
    "price": "10억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 준공, 15층, 감삼동 중심, 초고층, 생활편의시설 인접"
  },
  {
    "name": "월성e편한세상(대형)",
    "address": "대구 달서구 월성동 536",
    "size": "182.96㎡",
    "price": "9억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2009년 준공, 11층, 월성동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "롯데캐슬그랜드(대형)",
    "address": "대구 달서구 용산동 230-10",
    "size": "169.89㎡",
    "price": "9억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2004년 준공, 23층, 용산동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"대구광역시 달성군":{
"~2억":{
  "houses": [
    {
    "name": "논공읍 소형 아파트",
    "address": "대구 달성군 논공읍",
    "size": "59m² (18평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "논공읍 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "현풍읍 소형 아파트",
    "address": "대구 달성군 현풍읍",
    "size": "59m² (18평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "현풍읍 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "다사읍 소형 빌라",
    "address": "대구 달성군 다사읍",
    "size": "36m² (11평)",
    "price": "1억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "다사읍 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "현풍읍 신축 아파트",
    "address": "대구 달성군 현풍읍",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "현풍읍 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "논공읍 신축 빌라",
    "address": "대구 달성군 논공읍",
    "size": "59m² (18평)",
    "price": "2억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "논공읍 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "다사읍 신축 빌라",
    "address": "대구 달성군 다사읍",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "다사읍 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
     {
    "name": "다사읍 대단지 아파트",
    "address": "대구 달성군 다사읍",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "다사읍 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "화원읍 대단지 아파트",
    "address": "대구 달성군 화원읍",
    "size": "128m² (39평)",
    "price": "5억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "화원읍 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "가창면 고급 전원주택",
    "address": "대구 달성군 가창면 냉천리",
    "size": "199.88㎡ (약 60평)",
    "price": "9억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "가창면 냉천리, 대지 367㎡, 2층 단독, 주차 1대, 태양광설비, 즉시입주 가능"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"대구광역시 동구":{
"~2억":{
  "houses": [
    {
    "name": "청광아파트",
    "address": "대구 동구 신암동",
    "size": "76.5㎡ (약 23평)",
    "price": "1억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1995년 입주, 저층, 동구 신암동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "동구 소형 아파트1",
    "address": "대구 동구",
    "size": "59m² (약 18평)",
    "price": "1억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "저층, 동구 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "동구 소형 아파트2",
    "address": "대구 동구",
    "size": "59m² (약 18평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "저층, 동구 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
     {
    "name": "좌천서린엘마르더뷰",
    "address": "대구 동구 좌천동",
    "size": "86㎡ (약 26평)",
    "price": "2억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신축급, 침실3/욕실2, 베란다, 좌천동 중심, 생활편의시설 인접"
  },
  {
    "name": "아르미나아파트",
    "address": "대구 동구 수정동",
    "size": "약 84㎡ (약 25평)",
    "price": "2억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "올리모델링, 방3, 거실겸주방, 베란다, 수정동 중심, 생활편의시설 인접"
  },
  {
    "name": "지원더뷰오션1차",
    "address": "대구 동구 초량동",
    "size": "85㎡ (약 25평)",
    "price": "4억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 입주, 18층, 대단지, 초량동 중심, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
     {
    "name": "e편한세상부산항",
    "address": "대구 동구 초량동",
    "size": "85㎡ (약 33평)",
    "price": "6억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2019년 입주, 대단지, 초량동 중심, 생활편의시설 인접"
  },
  {
    "name": "협성휴포레부산진역오션뷰",
    "address": "대구 동구 수정동",
    "size": "83㎡ (약 32평)",
    "price": "5억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2019년 입주, 대단지, 수정동 중심, 생활편의시설 인접"
  },
  {
    "name": "두산위브포세이돈2",
    "address": "대구 동구 범일동",
    "size": "127㎡ (약 48평)",
    "price": "4억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2006년 입주, 대단지, 범일동 중심, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},


"대구광역시 북구":{
"~2억":{
  "houses": [
    {
    "name": "협화맨션",
    "address": "대구 북구 태전동",
    "size": "84.97㎡ (약 25평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1992년 입주, 416세대, 대구3호선 인근, 생활편의시설 인접"
  },
  {
    "name": "주공그린빌8",
    "address": "대구 북구 동변동",
    "size": "59.83㎡ (약 18평)",
    "price": "1억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2002년 입주, 1,297세대, 24년 12월 실거래, 생활편의시설 인접"
  },
  {
    "name": "복현서한2",
    "address": "대구 북구 복현동",
    "size": "59.75㎡ (약 18평)",
    "price": "1억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1998년 입주, 23평, 12층, 25년 1월 실거래, 학세권, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "복현푸르지오",
    "address": "대구 북구 복현동",
    "size": "85㎡ (약 25평)",
    "price": "3억 7,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "준신축, 저층/15층, 시스템에어컨, 교통인프라 우수, 생활편의시설 인접"
  },
  {
    "name": "침산화성2",
    "address": "대구 북구 침산동",
    "size": "59.91㎡ (약 18평)",
    "price": "2억 2,900만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1999년 입주, 24평, 5층, 25년 3월 실거래, 학세권, 생활편의시설 인접"
  },
  {
    "name": "삼성아파트",
    "address": "대구 북구 칠성동2가",
    "size": "59.59㎡ (약 18평)",
    "price": "2억 2,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1995년 입주, 24평, 13층, 24년 5월 실거래, 학세권, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "복현자이",
    "address": "대구 북구 복현동",
    "size": "84㎡ (약 25평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 준공, 대단지, 24평, 2024년 실거래, 학세권, 생활편의시설 인접"
  },
  {
    "name": "대구역유림노르웨이숲",
    "address": "대구 북구 칠성동2가",
    "size": "84㎡ (약 25평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2017년 준공, 대단지, 25평, 2024년 실거래, 생활편의시설 인접"
  },
  {
    "name": "대구역 서희스타힐스",
    "address": "대구 북구 칠성동2가",
    "size": "84㎡ (약 25평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 준공, 대단지, 25평, 2024년 실거래, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"대구광역시 서구":{
"~2억":{
  "houses": [
    {
    "name": "동대신동2가 2층 주택",
    "address": "부산시 서구 동대신동2가",
    "size": "2층, 1층 142.02㎡/2층 49.69㎡",
    "price": "7,300만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "민주공원 아래, 공기 좋고 산책로 인접, 일부 보수 필요"
  },
  {
    "name": "하나로5차 아파트",
    "address": "부산시 서구 서대신동1가 2-5",
    "size": "85.02㎡",
    "price": "2억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "3년 전 리모델링, 역세권, 정류장 인접, 컨디션 우수"
  },
  {
    "name": "송도힐타운아파트",
    "address": "부산시 서구 암남동",
    "size": "약 84㎡",
    "price": "1억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "저층, 암남동 중심, 생활편의시설 인접, 전세/월세도 가능"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "대신2차푸르지오",
    "address": "부산시 서구 서대신동2가",
    "size": "84㎡",
    "price": "2억 4,000만원~7억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신축, 1군 브랜드, 초역세권, 대단지, 생활편의시설 인접"
  },
  {
    "name": "향원밸리빌",
    "address": "부산시 서구 부민동1가",
    "size": "약 74㎡",
    "price": "2억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "9층, 부민동 중심, 생활편의시설 인접"
  },
  {
    "name": "에코펠리스",
    "address": "부산시 서구 충무동2가",
    "size": "약 70㎡",
    "price": "2억 5,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "8층, 충무동 중심, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "대신푸르지오1차",
    "address": "부산시 서구 서대신동1가",
    "size": "116㎡",
    "price": "8억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 준공, 대단지, 고층, 생활편의시설 인접"
  },
  {
    "name": "대신푸르지오1차",
    "address": "부산시 서구 서대신동1가",
    "size": "103㎡",
    "price": "7억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 준공, 대단지, 고층, 생활편의시설 인접"
  },
  {
    "name": "토성동 경동리인타워",
    "address": "부산시 서구 토성동1가",
    "size": "82㎡",
    "price": "5억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 준공, 대단지, 고층, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "대신푸르지오1차(대형)",
    "address": "부산시 서구 서대신동1가",
    "size": "116㎡",
    "price": "8억 8,000만원~13억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 준공, 대단지, 고층, 생활편의시설 인접"
  },
  {
    "name": "대신 롯데캐슬",
    "address": "부산시 서구 서대신동3가",
    "size": "130㎡",
    "price": "6억 2,000만원~15억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2014년 준공, 대단지, 고층, 생활편의시설 인접"
  },
  {
    "name": "암남동 송도자이르네디오션",
    "address": "부산시 서구 암남동",
    "size": "84㎡",
    "price": "5억 3,000만원~11억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 준공, 대단지, 고층, 바다조망, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "대신 롯데캐슬(펜트하우스)",
    "address": "부산시 서구 서대신동3가",
    "size": "130㎡ 이상",
    "price": "15억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2014년 준공, 펜트하우스, 대단지, 고층, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
{
    "name": "동대신동2가 대지 502㎡ 단독주택",
    "address": "부산시 서구 동대신동2가",
    "size": "대지 502.14㎡, 건물 191.71㎡",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2층, 주차장, 창고, 남향, 일부 리모델링 필요, 입주일 협의"
  }

  ]
}
},

"대구광역시 수성구":{
"~2억":{
  "houses": [
    {
    "name": "서울중동(1-5동)",
    "address": "대구광역시 수성구 중동",
    "size": "50.06㎡",
    "price": "2억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1981년 입주, 1층, 중동 중심, 대구3호선, 생활편의시설 인접"
  },
  {
    "name": "지산타운",
    "address": "대구광역시 수성구 지산동",
    "size": "53.78㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1991년 입주, 2층, 629세대, 대구3호선, 생활편의시설 인접"
  },
  {
    "name": "지산2단지",
    "address": "대구광역시 수성구 지산동",
    "size": "59.56㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1991년 입주, 4층, 694세대, 대구3호선, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "현대청림",
    "address": "대구광역시 수성구 범물동",
    "size": "59.99㎡",
    "price": "2억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1999년 입주, 12층, 350세대, 대구3호선, 생활편의시설 인접"
  },
  {
    "name": "사월보성",
    "address": "대구광역시 수성구 사월동",
    "size": "59.97㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1996년 입주, 4층, 1,498세대, 대구2호선, 생활편의시설 인접"
  },
  {
    "name": "시지서한타운2",
    "address": "대구광역시 수성구 매호동",
    "size": "59.87㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1996년 입주, 15층, 209세대, 대구2호선, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
     {
    "name": "힐스테이트범어센트럴",
    "address": "대구광역시 수성구 범어동",
    "size": "84.81㎡",
    "price": "8억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 입주, 9층, 범어동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "대우트럼프월드수성",
    "address": "대구광역시 수성구 두산동",
    "size": "125㎡",
    "price": "8억 6,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2007년 입주, 28층, 두산동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "힐스테이트황금엘포레",
    "address": "대구광역시 수성구 황금동",
    "size": "84.98㎡",
    "price": "8억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 입주, 14층, 황금동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "범어아이파크1차",
    "address": "대구광역시 수성구 범어동",
    "size": "84.97㎡",
    "price": "12억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 입주, 14층, 범어동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "만촌삼정그린코아에듀파크",
    "address": "대구광역시 수성구 만촌동",
    "size": "75.99㎡",
    "price": "13억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2019년 입주, 8층, 만촌동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "궁전맨션",
    "address": "대구광역시 수성구 범어동",
    "size": "84.96㎡",
    "price": "12억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1988년 입주, 7층, 범어동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"대구광역시 중구":{
"~2억":{
  "houses": [
    {
    "name": "보성송림맨션",
    "address": "대구 중구 남산동 2434",
    "size": "59.99㎡",
    "price": "1억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 12월 31일 실거래, 16층, 남산동 중심, 생활편의시설 인접"
  },
  {
    "name": "반월당 클래시아2차 오피스텔",
    "address": "대구 중구 봉산동 50",
    "size": "26.17㎡",
    "price": "1억 2,100만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 12월 18일 실거래, 16층, 봉산동 중심, 생활편의시설 인접"
  },
  {
    "name": "대구메디스퀘어 1동 오피스텔",
    "address": "대구 중구",
    "size": "46.29㎡",
    "price": "1억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2025년 1월 20일 실거래, 13층, 초역세권, 복층, 풀옵션"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "보성송림맨션",
    "address": "대구 중구 남산동 2434",
    "size": "84.96㎡",
    "price": "2억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 12월 27일 실거래, 18층, 남산동 중심, 생활편의시설 인접"
  },
  {
    "name": "반월당역 서한포레스트 오피스텔",
    "address": "대구 중구 남산동 3043",
    "size": "67.31㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2025년 1월 7일 실거래, 2층, 남산동 중심, 생활편의시설 인접"
  },
  {
    "name": "동성로 하우스디어반 오피스텔",
    "address": "대구 중구",
    "size": "43.94㎡",
    "price": "2억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 9월 4일 실거래, 10층, 동성로 중심, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    
  {
    "name": "빌리브프리미어",
    "address": "대구 중구 삼덕동2가 166",
    "size": "84.66㎡",
    "price": "5억 810만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 9월 6일 실거래, 26층, 삼덕동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "신성미소시티",
    "address": "대구 중구 계산동2가 100",
    "size": "134.27㎡",
    "price": "5억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2025년 1월 6일 실거래, 28층, 계산동 중심, 생활편의시설 인접"
  },
  {
    "name": "엑소디움센트럴동인",
    "address": "대구 중구 동인동3가",
    "size": "84㎡",
    "price": "5억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2025년 4월 26일 실거래, 7층, 동인동 중심, 신축, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "태평라이프아파트",
    "address": "대구 중구 태평로1가 1-187",
    "size": "117㎡",
    "price": "15억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 기준, 10층, 태평로 중심, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"대구광역시 군위군":{
"~2억":{
  "houses": [
    {
    "name": "부국군위아파트",
    "address": "대구 군위군 군위읍 서부리 214-2",
    "size": "60㎡ (약 23평)",
    "price": "1억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2017년 준공, 6층, 군위읍 중심, 신축, 생활편의시설 인접"
  },
  {
    "name": "군위읍 명성1차",
    "address": "대구 군위군 군위읍",
    "size": "49~85㎡ (15~26평)",
    "price": "2,700만원~1억 4,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1990년대 준공, 5층, 군위읍 중심, 생활편의시설 인접"
  },
  {
    "name": "군위읍 명성4차",
    "address": "대구 군위군 군위읍 서부리 160",
    "size": "78.95㎡ (약 24평)",
    "price": "1억 1,000만원(전세), 매매 2억 이하 매물 가능",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1993년 준공, 5층, 군위읍 중심, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "골든렉시움",
    "address": "대구 군위군 군위읍 동부리 381",
    "size": "85㎡ (약 33평)",
    "price": "2억 5,000만원~3억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 준공, 8층, 신축, 군위읍 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "부계면 남산리 전원주택",
    "address": "대구 군위군 부계면 남산리",
    "size": "570㎡ 대지, 78.4㎡ 건물",
    "price": "2억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2017년 준공, 단층, 조용함, 주차 2대, 입주 즉시 가능, 생활편의시설 인접"
  },
  {
    "name": "군위읍 명성1차(대형)",
    "address": "대구 군위군 군위읍",
    "size": "85㎡ (약 26평)",
    "price": "1억 4,500만원~4억 미만(대형 평형)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1990년대 준공, 5층, 군위읍 중심, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "소보면 서금로 토지+주택",
    "address": "대구 군위군 소보면",
    "size": "토지 2,863㎡ (866평)",
    "price": "1억 2,990만원~15억원(대형 토지+주택)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "토지+주택 복합, 소보면 중심, 대형 부지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [
{
    "name": "부계면 팔공산자락 모텔+토지",
    "address": "대구 군위군 부계면",
    "size": "토지 1,062㎡(321평), 건물 849㎡(257평), 21객실",
    "price": "20억~30억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1998년 준공, 5층, 숙박시설, 팔공산·동산계곡 인접, 투자·사업용"
  }
  ]
}
},


"인천광역시 강화군":{
"~2억":{
  "houses": [
    {
    "name": "베이힐 아파트",
    "address": "인천 강화군 강화읍",
    "size": "60㎡ (약 23평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "11년차, 저층, 강화읍 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "그랑드빌 아파트",
    "address": "인천 강화군 강화읍",
    "size": "60㎡ (약 23평)",
    "price": "1억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "17년차, 저층, 강화읍 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "설호 아파트",
    "address": "인천 강화군 강화읍",
    "size": "67㎡ (약 26평)",
    "price": "7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "28년차, 저층, 강화읍 중심, 교통·생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "강화2차세광엔리치빌",
    "address": "인천 강화군 선원면",
    "size": "104㎡ (약 41평)",
    "price": "2억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "14년차, 중층, 선원면 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "현대아파트",
    "address": "인천 강화군 강화읍",
    "size": "85㎡ (약 33평)",
    "price": "1억 7,000만원~2억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "24년차, 중층, 강화읍 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "세광엔리치빌1차",
    "address": "인천 강화군 선원면",
    "size": "85㎡ (약 33평)",
    "price": "1억 6,000만원~2억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "17년차, 중층, 선원면 중심, 교통·생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "강화읍 관청리 상업업무용지",
    "address": "인천 강화군 강화읍 관청리 489-3",
    "size": "상업업무용지",
    "price": "15억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "강화읍 중심, 상업지역, 투자·사업용 적합"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [
{
    "name": "강화군 모텔매매",
    "address": "인천 강화군",
    "size": "상업용 건물",
    "price": "21억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "강화읍 중심, 모텔, 투자·사업용 적합"
  }
  ]
}
},


"인천광역시 계양구":{
"~2억":{
  "houses": [
    {
    "name": "현대3차아파트",
    "address": "인천 계양구 효성동",
    "size": "84.96㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1992년 입주, 15층, 인천1호선 인접, 생활편의시설 인접"
  },
  {
    "name": "삼보3차아파트",
    "address": "인천 계양구 계산동",
    "size": "49.59㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1988년 입주, 4층, 인천1호선 인접, 생활편의시설 인접"
  },
  {
    "name": "태평아파트",
    "address": "인천 계양구 계산동",
    "size": "63.66㎡",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1990년 입주, 6층, 인천1호선 인접, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "계양산파크트루엘",
    "address": "인천 계양구 계산동",
    "size": "59.99㎡",
    "price": "3억 7,700만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 입주, 6층, 신축, 역세권, 생활편의시설 인접"
  },
  {
    "name": "은행마을태산",
    "address": "인천 계양구 계산동",
    "size": "100.59㎡",
    "price": "4억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2012년 입주, 19층, 대단지, 역세권, 생활편의시설 인접"
  },
  {
    "name": "신도브래뉴",
    "address": "인천 계양구 계산동",
    "size": "84.95㎡",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2005년 입주, 3층, 대단지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "은행마을강북·삼보",
    "address": "인천 계양구 계산동",
    "size": "114.63㎡",
    "price": "5억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1997년 입주, 13층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "동양동 휴먼빌",
    "address": "인천 계양구 동양동",
    "size": "114.81㎡",
    "price": "5억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2007년 입주, 10층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "계양 하늘채 파크포레",
    "address": "인천 계양구 방축동",
    "size": "85㎡",
    "price": "7억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신축, 13층, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"인천광역시 남동구":{
"~2억":{
  "houses": [
    {
    "name": "만수주공7,8단지아파트",
    "address": "인천 남동구 만수동",
    "size": "39.6㎡ (약 12평)",
    "price": "1억 2,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "13층, 관리비 없음, 역세권, 생활편의시설 인접"
  },
  {
    "name": "삼부아파트",
    "address": "인천 남동구 만수동",
    "size": "62.8㎡ (약 19평)",
    "price": "1억 9,700만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1층, 관리비 없음, 생활편의시설 인접"
  },
  {
    "name": "윤성아파트",
    "address": "인천 남동구 선학동",
    "size": "59.9㎡ (약 18평)",
    "price": "2억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "18평, 관리비 15만원, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "향촌아파트 포레시안",
    "address": "인천 남동구 만수동",
    "size": "68㎡ (약 21평)",
    "price": "2억 5,700만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "6층, 관리비 없음, 산책로 뷰, 생활편의시설 인접"
  },
  {
    "name": "에코에비뉴",
    "address": "인천 남동구 서창동",
    "size": "101.2㎡ (약 30평)",
    "price": "3억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "12층, 관리비 없음, 신축, 생활편의시설 인접"
  },
  {
    "name": "만수동 영풍2차",
    "address": "인천 남동구 만수동",
    "size": "84.96㎡ (약 25평)",
    "price": "2억 4,000만원~3억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "22년차, 135세대, 관리비 없음, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "한화꿈에그린에코메트로5단지",
    "address": "인천 남동구 논현동",
    "size": "118㎡ (약 36평)",
    "price": "7억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "26층, 신축, 대단지, 학군 우수, 생활편의시설 인접"
  },
  {
    "name": "아시아드선수촌센트럴자이",
    "address": "인천 남동구 구월동",
    "size": "101.92㎡ (약 31평)",
    "price": "7억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "24층, 신축, 대단지, 생활편의시설 인접"
  },
  {
    "name": "래미안자이",
    "address": "인천 남동구 논현동",
    "size": "143.22㎡ (약 43평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "18층, 신축, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "한화꿈에그린에코메트로9단지",
    "address": "인천 남동구 논현동",
    "size": "199.06㎡ (약 60평)",
    "price": "10억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "28층, 신축, 대단지, 생활편의시설 인접"
  },
  {
    "name": "구월동 상가주택",
    "address": "인천 남동구 구월동",
    "size": "대지 198㎡, 건물 590㎡",
    "price": "13억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "4층/1층, 주거지역, 2차선도로, 임대수익, 생활편의시설 인접"
  },
  {
    "name": "상가요양원",
    "address": "인천 남동구",
    "size": "180평",
    "price": "15억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상가요양원, 29인전후, 럭셔리 인테리어, 만실운영, 아파트 밀집지역"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "상가요양원",
    "address": "인천 남동구",
    "size": "180평",
    "price": "15억~16억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상가요양원, 29인전후, 럭셔리 인테리어, 만실운영, 아파트 밀집지역"
  }
  ]
},
"20억 이상": {
  "houses": [
    {
    "name": "남동구 모텔매매",
    "address": "인천 남동구",
    "size": "상업용 건물",
    "price": "22억~26억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "모텔, 리모델링용, 인천선 초역세권, 투자·사업용 적합"
  }
  ]
}
},

"인천광역시 동구":{
"~2억":{
  "houses": [
    {
    "name": "송현주공솔빛마을(154) 2차",
    "address": "인천 동구 송현동",
    "size": "60㎡ (약 23평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2003년 준공, 15년차, 저층, 송현동 중심, 버스·지하철 도원역 인접, 생활편의시설 인접"
  },
  {
    "name": "송현주공솔빛마을(154) 1차",
    "address": "인천 동구 송현동",
    "size": "60㎡ (약 23평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2003년 준공, 15년차, 저층, 송현동 중심, 버스·지하철 도원역 인접, 생활편의시설 인접"
  },
  {
    "name": "창영동 단독주택",
    "address": "인천 동구 창영동",
    "size": "대지 63㎡, 연면적 2층(신축 리모델링)",
    "price": "1억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "도원역 5분, 신축 리모델링, 즉시 입주 가능, 재개발 호재"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "송현주공솔빛마을(154) 2차(중형)",
    "address": "인천 동구 송현동",
    "size": "80㎡ (약 31평)",
    "price": "2억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2003년 준공, 15년차, 저층, 송현동 중심, 생활편의시설 인접"
  },
  {
    "name": "송림동 동인천역파크푸르지오",
    "address": "인천 동구 송림동",
    "size": "97㎡ (약 29평)",
    "price": "5억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "17년차, 27층, 동인천역 도보 10분, 바다뷰, 대단지"
  },
  {
    "name": "동산휴먼시아",
    "address": "인천 동구 송림동",
    "size": "115㎡ (약 35평)",
    "price": "4억~5억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 준공, 25층, 대단지, 송림동 중심, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "동산휴먼시아(대형)",
    "address": "인천 동구 송림동",
    "size": "115㎡ (약 35평)",
    "price": "5억~6억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 준공, 25층, 대단지, 송림동 중심, 생활편의시설 인접"
  },
  {
    "name": "송림동 동인천역파크푸르지오(고층)",
    "address": "인천 동구 송림동",
    "size": "97㎡ (약 29평)",
    "price": "5억~6억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "17년차, 27층, 동인천역 도보 10분, 바다뷰, 대단지"
  },
  {
    "name": "송림동 참좋은집",
    "address": "인천 동구 송림동",
    "size": "80㎡ (약 24평)",
    "price": "5억~6억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2015년 준공, 10층, 신축, 송림동 중심, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "송림동 동산휴먼시아(공시가격)",
    "address": "인천 동구 송림동",
    "size": "115㎡ (약 35평)",
    "price": "15억 5,000만원(공시가격 기준)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 준공, 25층, 대단지, 송림동 중심, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"인천광역시 미추홀구":{
"~2억":{
  "houses": [
    {
    "name": "신라아파트",
    "address": "인천 미추홀구 주안동",
    "size": "57.84㎡",
    "price": "9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1984년 입주, 5층, 1호선 인근, 생활편의시설 인접"
  },
  {
    "name": "삼원아파트",
    "address": "인천 미추홀구 도화동",
    "size": "43.2㎡",
    "price": "9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1985년 입주, 5층, 1호선 인근, 생활편의시설 인접"
  },
  {
    "name": "금동아파트",
    "address": "인천 미추홀구 용현동",
    "size": "45㎡",
    "price": "9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2003년 입주, 2층, 수인분당선 인근, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "용현2단지금호타운",
    "address": "인천 미추홀구 용현동",
    "size": "84.53㎡",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "25평형, 2025년 2월 실거래, 생활편의시설 인접"
  },
  {
    "name": "쑥골마을아파트",
    "address": "인천 미추홀구 도화동",
    "size": "44.27㎡",
    "price": "9,000만원~3억대",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2025년 2월 실거래, 생활편의시설 인접"
  },
  {
    "name": "동문 디스트(분양)",
    "address": "인천 미추홀구 숭의동",
    "size": "59㎡ (25평)",
    "price": "2억 5,000만원~",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신축, 444세대, 도원역 도보 5분, 초중고 인접, 대형마트 차량 3~5분"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "포레나미추홀",
    "address": "인천 미추홀구 주안동",
    "size": "84.99㎡",
    "price": "5억~17억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2년차, 1,146세대, 대단지, 생활편의시설 인접"
  },
  {
    "name": "주안동 쓰리룸 아파트",
    "address": "인천 미추홀구 주안동",
    "size": "114.01㎡",
    "price": "5억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "34평, 방3 욕실2, 2025년 실거래, 생활편의시설 인접"
  },
  {
    "name": "더샵인천스카이타워2단지",
    "address": "인천 미추홀구",
    "size": "84.99㎡",
    "price": "5억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신축, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "주안동 상가주택",
    "address": "인천 미추홀구 주안동",
    "size": "332㎡ 대지, 830㎡ 연면적",
    "price": "14억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상가+주택, 지상4층, 일반상업지역, 생활편의시설 인접"
  },
  {
    "name": "상가주택(송림로)",
    "address": "인천 미추홀구 송림로 257번길",
    "size": "260㎡ 대지, 306㎡ 연면적",
    "price": "14억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상가+주택, 지상2층, 대로변 코너, 생활편의시설 인접"
  },
  {
    "name": "상가주택(송림로)",
    "address": "인천 미추홀구 송림로 257번길",
    "size": "260㎡ 대지, 630㎡ 연면적",
    "price": "15억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상가+주택, 지상4층, 대로변, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "상가주택(송림로)",
    "address": "인천 미추홀구 송림로 257번길",
    "size": "260㎡ 대지, 630㎡ 연면적",
    "price": "15억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상가+주택, 지상4층, 대로변, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
    {
    "name": "미추홀구 호텔매매",
    "address": "인천 미추홀구 주안동",
    "size": "815㎡ 연면적",
    "price": "26억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "호텔, 30객실, 일반상업지역, 유동인구 많은 입지"
  },
  {
    "name": "상가주택(송림로)",
    "address": "인천 미추홀구 송림로 257번길",
    "size": "260㎡ 대지, 630㎡ 연면적",
    "price": "25억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상가+주택, 지상4층, 대로변, 생활편의시설 인접"
  }
  ]
}
},

"인천광역시 부평구":{
"~2억":{
  "houses": [
    {
    "name": "현광아파트",
    "address": "인천 부평구 부평4동",
    "size": "64㎡ (약 19평)",
    "price": "1억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "저층, 부평역 도보권, 생활편의시설 인접"
  },
  {
    "name": "청천동 단독주택",
    "address": "인천 부평구 청천동",
    "size": "136㎡ (약 41평, 대지면적)",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "단독주택, 청천동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "삼보3차아파트",
    "address": "인천 부평구 부평동",
    "size": "49.59㎡ (약 15평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1988년 입주, 4층, 부평동 중심, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "삼산타운주공1단지",
    "address": "인천 부평구 삼산동",
    "size": "59.99㎡ (약 18평)",
    "price": "5억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2005년 입주, 14층, 7호선, 대단지, 생활편의시설 인접"
  },
  {
    "name": "부평금호어울림",
    "address": "인천 부평구 십정동",
    "size": "112.98㎡ (약 34평)",
    "price": "5억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2008년 입주, 16층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "부개주공6단지",
    "address": "인천 부평구 부개동",
    "size": "84.79㎡ (약 26평)",
    "price": "5억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1997년 입주, 8층, 7호선, 대단지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "힐스테이트부평",
    "address": "인천 부평구 십정동",
    "size": "84.99㎡ (약 25평)",
    "price": "7억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2023년 입주, 12층, 1호선·인천1호선, 대단지, 생활편의시설 인접"
  },
  {
    "name": "부평SK뷰해모로",
    "address": "인천 부평구 부평동",
    "size": "84.96㎡ (약 25평)",
    "price": "7억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2023년 입주, 9층, 1호선, 대단지, 생활편의시설 인접"
  },
  {
    "name": "부평IPARK",
    "address": "인천 부평구 산곡동",
    "size": "84.67㎡ (약 25평)",
    "price": "7억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 입주, 36층, 7호선, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "쌍용더플래티넘부평",
    "address": "인천 부평구 산곡동",
    "size": "119.9㎡ (약 36평)",
    "price": "10억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 입주, 18층, 7호선, 대단지, 생활편의시설 인"
  },
  {
    "name": "부평동 상가주택",
    "address": "인천 부평구 부평동",
    "size": "360㎡ (약 109평, 건물면적)",
    "price": "15억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상가주택, 부평동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "대림아파트(대형)",
    "address": "인천 부평구 부평동",
    "size": "57평~44평",
    "price": "15억 5,000만원(공시가격 기준)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1989년 준공, 15층, 대단지, 부평동 중심, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "부평구 십정동 모텔매매",
    "address": "인천 부평구 십정동",
    "size": "525.73㎡ (약 159평, 연면적)",
    "price": "14억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "20실, 1호선 역세권, 상업지역, 투자·사업용 적합"
  },
  {
    "name": "부평동 상가주택",
    "address": "인천 부평구 부평동",
    "size": "360㎡ (약 109평, 건물면적)",
    "price": "15억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상가주택, 부평동 중심, 교통·생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
    {
    "name": "부평구 십정동 모텔매매",
    "address": "인천 부평구 십정동",
    "size": "813.15㎡ (약 246평, 연면적)",
    "price": "18억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "22실, 1호선 역세권, 상업지역, 투자·사업용 적합"
  }
  ]
}
},

"인천광역시 서구":{
"~2억":{
  "houses": [
    {
    "name": "석남동 낙원아파트",
    "address": "인천 서구 석남동",
    "size": "49㎡ (약 15평)",
    "price": "1억 2,850만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1989년 준공, 6층, 역세권, 학세권, 생활편의시설 인접"
  },
  {
    "name": "불로동 월드아파트",
    "address": "인천 서구 불로동",
    "size": "59㎡ (약 18평)",
    "price": "1억 7,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1998년 준공, 2층, 학세권, 생활편의시설 인접"
  },
  {
    "name": "석남동 DREAM TWO",
    "address": "인천 서구 석남동",
    "size": "81㎡ (약 24평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 준공, 6층, 학세권, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "연희동남아파트",
    "address": "인천 서구 심곡동",
    "size": "84.84㎡ (약 25평)",
    "price": "2억 5,200만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1991년 준공, 11층, 학세권, 생활편의시설 인접"
  },
  {
    "name": "두현예뜰채",
    "address": "인천 서구 가좌동",
    "size": "63.89㎡ (약 19평)",
    "price": "2억 900만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2017년 준공, 4층, 학세권, 생활편의시설 인접"
  },
  {
    "name": "진주5단지 아파트",
    "address": "인천 서구 가좌동",
    "size": "84.85㎡ (약 25평)",
    "price": "3억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1991년 준공, 5층, 대단지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "인천가좌 두산위브 트레지움",
    "address": "인천 서구 가좌동",
    "size": "84.3㎡ (약 25평)",
    "price": "5억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 거래, 22층, 신축, 대단지, 생활편의시설 인접"
  },
  {
    "name": "청라센트럴에일린의뜰",
    "address": "인천 서구 청라동",
    "size": "95.27㎡ (약 29평)",
    "price": "8억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 준공, 15층, 신축, 대단지, 생활편의시설 인접"
  },
  {
    "name": "청라호수공원한신더휴",
    "address": "인천 서구 청라동",
    "size": "84.96㎡ (약 25평)",
    "price": "8억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 거래, 30층, 신축, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "더샵레이크파크",
    "address": "인천 서구 청라동",
    "size": "106.89㎡ (약 32평)",
    "price": "10억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 거래, 28층, 신축, 대단지, 생활편의시설 인접"
  },
  {
    "name": "우미린스트라우스",
    "address": "인천 서구 청라동",
    "size": "125.07㎡ (약 38평)",
    "price": "10억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 거래, 19층, 신축, 대단지, 생활편의시설 인접"
  },
  {
    "name": "청라자이아파트",
    "address": "인천 서구 청라동",
    "size": "142.87㎡ (약 43평)",
    "price": "9억 5,000만원~10억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 거래, 15층, 신축, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "청라푸르지오",
    "address": "인천 서구 청라동",
    "size": "139.5㎡ (약 42평)",
    "price": "15억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 거래, 52층, 초고층, 신축, 대단지, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"인천광역시 연수구":{
"~2억":{
  "houses": [
    {
    "name": "연수주공2차",
    "address": "인천 연수구 연수동 533",
    "size": "72㎡ (약 22평)",
    "price": "2억 250만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1992년 준공, 15층, 960세대, 연수동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "연수2시영",
    "address": "인천 연수구 연수동",
    "size": "50㎡ (약 15평)",
    "price": "1억 8,900만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1993년 준공, 5층, 25년차, 연수동 중심, 생활편의시설 인"
  },
  {
    "name": "연수동 성일아파트",
    "address": "인천 연수구 연수동",
    "size": "60㎡ (약 18평)",
    "price": "1억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1994년 준공, 5층, 25년차, 연수동 중심, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "우성2차",
    "address": "인천 연수구 연수동",
    "size": "60㎡ (약 18평)",
    "price": "3억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1994년 준공, 16층, 24년차, 연수동 중심, 생활편의시설 인접"
  },
  {
    "name": "대동아파트",
    "address": "인천 연수구 연수동",
    "size": "75㎡ (약 23평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1993년 준공, 29평, 연수동 중심, 생활편의시설 인접"
  },
  {
    "name": "풍림1차",
    "address": "인천 연수구 연수동",
    "size": "85㎡ (약 25평)",
    "price": "2억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1992년 준공, 33평, 연수동 중심, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    
  {
    "name": "더샵송도마리나베이",
    "address": "인천 연수구 송도동",
    "size": "84㎡ (약 25평)",
    "price": "5억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 준공, 33평, 송도동 중심, 신축, 생활편의시설 인접"
  },
  {
    "name": "송도더샵센트럴파크1차",
    "address": "인천 연수구 송도동",
    "size": "96㎡ (약 29평)",
    "price": "6억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 준공, 19층, 송도동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "글로벌캠퍼스푸르지오",
    "address": "인천 연수구 송도동",
    "size": "101㎡ (약 31평)",
    "price": "8억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2013년 준공, 10층, 송도동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "센트럴파크푸르지오",
    "address": "인천 연수구 송도동",
    "size": "96.5㎡ (약 29평)",
    "price": "14억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 준공, 13층, 송도동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "더샵센트럴파크1차",
    "address": "인천 연수구 송도동",
    "size": "125.6㎡ (약 38평)",
    "price": "14억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 준공, 35층, 송도동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "송도푸르지오하버뷰",
    "address": "인천 연수구 송도동",
    "size": "150.3㎡ (약 45평)",
    "price": "14억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2011년 준공, 21층, 송도동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "더샵퍼스트월드",
    "address": "인천 연수구 송도동",
    "size": "172.6㎡ (약 52평)",
    "price": "16억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 준공, 48층, 송도동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "더샵하버뷰13단지",
    "address": "인천 연수구 송도동",
    "size": "147.8㎡ (약 45평)",
    "price": "19억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2011년 준공, 30층, 송도동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "더샵센트럴파크3차",
    "address": "인천 연수구 송도동",
    "size": "119.8㎡ (약 36평)",
    "price": "20억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2014년 준공, 31층, 송도동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
{
    "name": "자이하버뷰2단지",
    "address": "인천 연수구 송도동",
    "size": "243.4㎡ (약 74평)",
    "price": "24억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2017년 준공, 4층, 송도동 중심, 초고급 대단지, 생활편의시설 인접"
  },
  {
    "name": "더프라우주상복합3단지",
    "address": "인천 연수구 송도동",
    "size": "206.7㎡ (약 62평)",
    "price": "21억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2012년 준공, 19층, 송도동 중심, 초고급 대단지, 생활편의시설 인접"
  },
  {
    "name": "더샵송도센트럴파크3차",
    "address": "인천 연수구 송도동",
    "size": "119.8㎡ (약 36평)",
    "price": "20억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2014년 준공, 31층, 송도동 중심, 초고급 대단지, 생활편의시설 인접"
  }
  ]
}
},

"인천광역시 옹진군":{
"~2억":{
  "houses": [
    {
    "name": "영흥면 내리 단독주택",
    "address": "인천 옹진군 영흥면 내리",
    "size": "토지 360평, 건물 103평",
    "price": "1억 4,900만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "영흥도 내 위치, 2종근생, 계획관리지역, 생활편의시설 인접"
  },
  {
    "name": "백령도 임야 및 전원주택지",
    "address": "인천 옹진군 백령면",
    "size": "임야/토지, 면적 다양",
    "price": "1억~2억원대",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "백령도 내 임야, 캠핑장/전원주택용, 생활편의시설 인접"
  },
  {
    "name": "영흥면 은빛주택",
    "address": "인천 옹진군 영흥면 내리 8-76",
    "size": "59.11㎡",
    "price": "1억 3,537만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2017년 거래, 영흥로144번길 인근, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "장봉도 전원주택지",
    "address": "인천 옹진군 북도면",
    "size": "401평",
    "price": "2억 9,900만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "장봉도 우수한 위치, 산과 바다 근접, 연륙교 수혜, 생활편의시설 인접"
  },
  {
    "name": "영흥면 바다 20초 오션뷰 단독주택",
    "address": "인천 옹진군 영흥면",
    "size": "25평, 2층",
    "price": "3억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "바다 20초 거리, 오션뷰, 생활편의시설 인접"
  },
  {
    "name": "영흥면 백령 공항 예정 인근 단독주택",
    "address": "인천 옹진군 백령면",
    "size": "정보 미상",
    "price": "1억 9,400만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "백령 공항 예정지 인근, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "영흥면 선재리 단독주택",
    "address": "인천 옹진군 영흥면 선재리 544-1",
    "size": "정보 미상",
    "price": "5억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "실거래가 5억, 바다 인접, 생활편의시설 인접"
  },
  {
    "name": "북도면 신도 오션뷰 펜션",
    "address": "인천 옹진군 북도면 신도",
    "size": "토지 409평, 건물 119평, 7객실",
    "price": "정보 미상(5억~10억 추정)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "오션뷰, 펜션, 영종도 다리 공사 중, 생활편의시설 인접"
  },
  {
    "name": "영흥면 바닷가 단독주택",
    "address": "인천 옹진군 영흥면",
    "size": "정보 미상",
    "price": "5억~10억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "바닷가, 오션뷰, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "영흥면 오션뷰 펜션",
    "address": "인천 옹진군 영흥면",
    "size": "토지 540평, 건물 573평, 25객실",
    "price": "12억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "오션뷰, 펜션, 숙박시설, 수영장, 연회장, 애견운동장 등 부대시설"
  },
  {
    "name": "영흥도 장경리 해수욕장 펜션",
    "address": "인천 옹진군 영흥면",
    "size": "토지 400평, 건물 229평, 16객실",
    "price": "12억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "장경리 해수욕장 앞, 숙박 펜션, 엘리베이터, 바비큐장 등"
  },
  {
    "name": "영흥도 바닷가 펜션",
    "address": "인천 옹진군 영흥면",
    "size": "토지 248평, 건물 217평, 13실",
    "price": "10억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "바닷가 숙박건물, 임대중, 초저렴, 투자용"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "영흥면 상가주택",
    "address": "인천 옹진군 영흥면",
    "size": "970㎡, 2층",
    "price": "15억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "백사장 앞, 지중해풍 인테리어, 주차 15대, 입주일 협의"
  },
  {
    "name": "덕적도 펜션 및 주택",
    "address": "인천 옹진군 덕적면",
    "size": "토지 2,000평, 건물 307평, 12객실",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "펜션+주택, 오션뷰, 해수욕장 인접, 다양한 부대시설"
  },
  {
    "name": "영흥면 해수욕장 오션뷰 숙박 펜션",
    "address": "인천 옹진군 영흥면",
    "size": "토지 274평, 건물 150평, 9객실",
    "price": "15억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "장경리 해수욕장 앞, 오션뷰, 상가 포함, 바비큐장"
  }
  ]
},
"20억 이상": {
  "houses": [
    {
    "name": "영흥면 대형 리조트 펜션",
    "address": "인천 옹진군 영흥면",
    "size": "토지 1,787㎡, 건물 1,895㎡, 25객실",
    "price": "50억원대(절반 이하 급매 가능)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "오션뷰, 대형 리조트, 수영장, 연회장, 애견운동장 등 부대시설"
  },
  {
    "name": "선재도 풀빌라 펜션",
    "address": "인천 옹진군 영흥면 선재도",
    "size": "토지 2,373㎡, 건물 1,018㎡, 20객실",
    "price": "25억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "풀빌라, 외부/실내수영장, 워터슬라이드, 스파, 바닷가, 매출 7억"
  },
  {
    "name": "덕적도 펜션 및 주택",
    "address": "인천 옹진군 덕적면",
    "size": "토지 2,000평, 건물 307평, 12객실",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "펜션+주택, 오션뷰, 해수욕장 인접, 다양한 부대시설"
  }
  ]
}
},

"인천광역시 중구":{
"~2억":{
  "houses": [
    {
    "name": "운서동 59.95㎡ 아파트",
    "address": "인천 중구 영종대로27번길 40(운서동 2748-1)",
    "size": "59.95㎡",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "운서동 중심, 저층, 영종국제도시 생활권, 교통·편의시설 인접"
  },
  {
    "name": "운서동 59.99㎡ 아파트",
    "address": "인천 중구 신도시북로 44(운서동 2708-1)",
    "size": "59.99㎡",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "운서동 중심, 저층, 영종국제도시 생활권, 교통·편의시설 인접"
  },
  {
    "name": "송월동 2층 단독주택",
    "address": "인천 중구 송월동",
    "size": "대지 31평, 건평 20평(2층)",
    "price": "1억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "인천역·동인천역 인근, 내부계단, 1층 방2/2층 방2, 자유공원·차이나타운 인접, 역세권"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "운서동 풍림아이원아파트",
    "address": "인천 중구 신도시북로43번길 11(운서동 2743-1)",
    "size": "59.91㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "운서동 중심, 저층, 영종국제도시 생활권, 교통·편의시설 인접"
  },
  {
    "name": "운서동 영종도금호베스트빌2단지",
    "address": "인천 중구 흰바위로 14(운서동 2788-2)",
    "size": "51.74㎡",
    "price": "4억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "운서동 중심, 저층, 영종국제도시 생활권, 교통·편의시설 인접"
  },
  {
    "name": "중산동 영종하늘도시우미린2단지",
    "address": "인천 중구 중산동",
    "size": "84.99㎡",
    "price": "3억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중산동 중심, 신축, 대단지, 영종국제도시 생활권, 교통·편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "중산동 e편한세상 영종국제도시 센텀베뉴",
    "address": "인천 중구 중산동",
    "size": "98.04㎡",
    "price": "5.9억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 입주, 15층, 대단지, 영종국제도시 중심, 생활편의시설 인접"
  },
  {
    "name": "중산동 스카이시티자이 아파트",
    "address": "인천 중구 중산동",
    "size": "98.94㎡",
    "price": "5.7억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 입주, 23층, 대단지, 영종국제도시 중심, 생활편의시설 인접"
  },
  {
    "name": "중산동 영종하늘도시KCC스위첸",
    "address": "인천 중구 중산동",
    "size": "84.73㎡",
    "price": "5.4억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 입주, 15층, 대단지, 영종국제도시 중심, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
     {
    "name": "중산동 영종하늘도시한라비발디",
    "address": "인천 중구 중산동 1887-1",
    "size": "186.0㎡",
    "price": "12억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 입주, 30층, 초고층, 영종국제도시 중심, 생활편의시설 인접"
  },
  {
    "name": "중산동 e편한세상 영종국제도시 오션하임",
    "address": "인천 중구 중산동",
    "size": "84.96㎡",
    "price": "5억원~12억원(고층, 펜트하우스)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 입주, 13층, 펜트하우스, 영종국제도시 중심, 생활편의시설 인접"
  },
  {
    "name": "중산동 영종GS자이(대형)",
    "address": "인천 중구 운남동 1550",
    "size": "167.86㎡",
    "price": "6억 3,000만원~12억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2009년 입주, 16층, 대단지, 영종국제도시 중심, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "중구 운서동 상가주택",
    "address": "인천 중구 운서동",
    "size": "388㎡ 대지, 576㎡ 건물",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "운서동 중심, 상가+주택, 투자·사업용, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
{
    "name": "중구 운서동 상가주택(대형)",
    "address": "인천 중구 운서동",
    "size": "388㎡ 대지, 576㎡ 건물",
    "price": "20억원 이상",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "운서동 중심, 상가+주택, 투자·사업용, 생활편의시설 인접"
  }
  ]
}
},


"광주광역시 광산구":{
"~2억":{
  "houses": [
    {
    "name": "운남주공7단지",
    "address": "광주 광산구 운남동",
    "size": "59.48㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2001년 입주, 1,698세대, 7층, 교통·생활편의시설 인접"
  },
  {
    "name": "모아드림타운1차",
    "address": "광주 광산구 소촌동",
    "size": "59.35㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2000년 입주, 639세대, 6층, 교통·생활편의시설 인접"
  },
  {
    "name": "EG스위트밸리3차",
    "address": "광주 광산구 소촌동",
    "size": "59.33㎡",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2004년 입주, 372세대, 4층, 교통·생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "우미린2차",
    "address": "광주 광산구 수완동",
    "size": "115㎡",
    "price": "2억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "수완동 중심, 3룸, 대단지, 생활편의시설 인접"
  },
  {
    "name": "임곡동 전원주택",
    "address": "광주 광산구 임곡동",
    "size": "99㎡",
    "price": "2억 3,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "임곡동, 전원주택/농가, 방3, 생활편의시설 인접"
  },
  {
    "name": "수완2차골드클래스(분양권)",
    "address": "광주 광산구 장덕동",
    "size": "97㎡",
    "price": "2억 5,740만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "장덕동, 신축, 3룸, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "수완코오롱하늘채",
    "address": "광주 광산구 장덕동",
    "size": "123.38㎡",
    "price": "9억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2012년 입주, 25층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "수완6차대방노블랜드",
    "address": "광주 광산구 수완동",
    "size": "115.94㎡",
    "price": "9억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2013년 입주, 24층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "수완진아리채2차아파트",
    "address": "광주 광산구 수완동",
    "size": "108.66㎡",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2013년 입주, 15층, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "광주수완해솔마을현진에버빌1단지",
    "address": "광주 광산구 수완동",
    "size": "146.44㎡",
    "price": "13억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 입주, 24층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "광주수완대방노블랜드3차",
    "address": "광주 광산구 장덕동",
    "size": "156.5㎡",
    "price": "10억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2014년 입주, 20층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "수완코오롱하늘채(대형)",
    "address": "광주 광산구 장덕동",
    "size": "154.15㎡",
    "price": "10억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2012년 입주, 24층, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"광주광역시 남구":{
"~2억":{
  "houses": [
    {
    "name": "신우아파트",
    "address": "광주 남구 월산동",
    "size": "77.68㎡",
    "price": "1억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1978년 입주, 4층, 월산동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "명지맨션",
    "address": "광주 남구 주월동",
    "size": "84.94㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1987년 입주, 12층, 주월동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "경남아파트",
    "address": "광주 남구 주월동",
    "size": "84.55㎡",
    "price": "2억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1987년 입주, 15층, 주월동 중심, 교통·생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "송화마을휴먼시아5단지",
    "address": "광주 남구 노대동",
    "size": "84.86㎡",
    "price": "3억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 입주, 2층, 노대동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "호반베르디움2차",
    "address": "광주 남구 주월동",
    "size": "84.85㎡",
    "price": "3억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2017년 입주, 20층, 주월동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "제석산호반힐하임",
    "address": "광주 남구 주월동",
    "size": "84.93㎡",
    "price": "4억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2019년 입주, 16층, 주월동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "봉선로 남해오네뜨",
    "address": "광주 남구 주월동",
    "size": "84.82㎡",
    "price": "5억 4,300만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 입주, 12층, 주월동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "주월동 골드클래스 어반시티",
    "address": "광주 남구 주월동",
    "size": "84.97㎡",
    "price": "5억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 입주, 15층, 주월동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "양우내안애",
    "address": "광주 남구 주월동",
    "size": "84.89㎡",
    "price": "5억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 입주, 11층, 주월동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
     {
    "name": "봉선동 쓰리룸 아파트",
    "address": "광주 남구 봉선동",
    "size": "158.63㎡",
    "price": "15억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2025년 기준, 12층, 대단지, 방4/욕실2, 생활편의시설 인접"
  },
  {
    "name": "봉선동 ㅎ아파트",
    "address": "광주 남구 봉선동",
    "size": "186㎡",
    "price": "15억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2025년 기준, 17층, 대단지, 초고층, 생활편의시설 인접"
  },
  {
    "name": "봉선동 ㅅ아파트",
    "address": "광주 남구 봉선동",
    "size": "171㎡",
    "price": "12억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2025년 기준, 5층, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "봉선동 쌍용스윗닷홈",
    "address": "광주 남구 봉선동",
    "size": "171㎡",
    "price": "17억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "15년차, 315세대, 2025년 기준, 대단지, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"광주광역시 동구":{
"~2억":{
  "houses": [
    {
    "name": "금남맨션",
    "address": "광주 동구 금남로3가",
    "size": "약 29㎡ (9평)",
    "price": "9,000만~1억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "저층, 금남로 중심, 지하철역 인근, 생활편의시설 인접"
  },
  {
    "name": "지산동 소형 아파트",
    "address": "광주 동구 지산동",
    "size": "61㎡ (18평)",
    "price": "2억원 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "20년차 내외, 저층, 지산동 중심, 생활편의시설 인접"
  },
  {
    "name": "계림동 원룸/소형주택",
    "address": "광주 동구 계림동",
    "size": "30~40㎡",
    "price": "1억 7,000만원~2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "저층, 계림동 중심, 지하철역 인근, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "월남호반베르디움 2차",
    "address": "광주 동구 월남동",
    "size": "59㎡ (18평, 실평수 25.8평)",
    "price": "2억 3,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "8층, 2017년 입주, 월남동 중심, 생활편의시설 인접"
  },
  {
    "name": "무등산 그린웰 로제비앙",
    "address": "광주 동구 산수동",
    "size": "64.52㎡ (19평)",
    "price": "3억 7,000만원~3억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "13~22층, 2019년 입주, 산수동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "광주용산지구리슈빌",
    "address": "광주 동구 용산동",
    "size": "76.43㎡ (23평)",
    "price": "3억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "7층, 2019년 입주, 용산동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "월남호반베르디움 2차",
    "address": "광주 동구 월남동",
    "size": "59㎡ (18평, 실평수 25.8평)",
    "price": "2억 3,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "8층, 2017년 입주, 월남동 중심, 생활편의시설 인접"
  },
  {
    "name": "무등산 그린웰 로제비앙",
    "address": "광주 동구 산수동",
    "size": "64.52㎡ (19평)",
    "price": "3억 7,000만원~3억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "13~22층, 2019년 입주, 산수동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "광주용산지구리슈빌",
    "address": "광주 동구 용산동",
    "size": "76.43㎡ (23평)",
    "price": "3억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "7층, 2019년 입주, 용산동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "무등산 아이파크(대형)",
    "address": "광주 동구 학동",
    "size": "117.98㎡ (36평)",
    "price": "10억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "22층, 2017년 입주, 학동 중심, 초고층, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"광주광역시 북구":{
"~2억":{
  "houses": [
    {
    "name": "리버파크",
    "address": "광주 북구 임동 340",
    "size": "51.94㎡",
    "price": "1억 4,100만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 5월 24일 거래, 4층, 임동 중심, 생활편의시설 인접"
  },
  {
    "name": "국제미소래임동2차",
    "address": "광주 북구 임동 632",
    "size": "59.49㎡",
    "price": "2억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 4월 26일 거래, 12층, 임동 중심, 생활편의시설 인접"
  },
  {
    "name": "평화맨션",
    "address": "광주 북구 임동 101-5",
    "size": "81.54㎡",
    "price": "2억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 4월 15일 거래, 4층, 임동 중심, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "한국아델리움2단지",
    "address": "광주 북구 임동 104-8",
    "size": "84.93㎡",
    "price": "3억 7,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 5월 31일 거래, 5층, 임동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "첨단진아리채",
    "address": "광주 북구 용두동",
    "size": "84.98㎡",
    "price": "4억 3,700만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2023년 6월 27일 거래, 2층, 용두동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "이안광주첨단아파트",
    "address": "광주 북구 용두동",
    "size": "59.98㎡",
    "price": "2억 9,300만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2023년 6월 23일 거래, 17층, 용두동 중심, 신축, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "운암산아이파크",
    "address": "광주 북구 운암동 1011",
    "size": "156.71㎡",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 5월 10일 거래, 15층, 운암동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "광주제일풍경채센트럴파크아파트1단지",
    "address": "광주 북구 중흥동",
    "size": "109.79㎡",
    "price": "7억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 3월 21일 거래, 17층, 중흥동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "광주신일곡현진에버빌",
    "address": "광주 북구 일곡동",
    "size": "158.9㎡",
    "price": "7억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 4월 3일 거래, 16층, 일곡동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
     {
    "name": "운암산아이파크(대형)",
    "address": "광주 북구 운암동",
    "size": "211.35㎡",
    "price": "10억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 11월 거래, 4층, 운암동 중심, 초고층, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"광주광역시 서구":{
"~2억":{
  "houses": [
    {
    "name": "쌍촌동 대주아파트",
    "address": "광주 서구 쌍촌동",
    "size": "109㎡",
    "price": "1억 7,200만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "12층, 남향, 교통·생활권·학군 우수, 빠른 입주 가능"
  },
  {
    "name": "농성동 단독주택",
    "address": "광주 서구 농성동",
    "size": "105㎡ (대지 130㎡)",
    "price": "8,300만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상공회의소 앞, 2층, 남향, 생활권 편리, 즉시 입주 가능"
  },
  {
    "name": "쌍촌동 대주아파트(소형)",
    "address": "광주 서구 쌍촌동",
    "size": "109㎡",
    "price": "1억 7,200만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "12층, 남향, 교통·생활권·학군 우수, 빠른 입주 가능"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "화정동 대주피오레",
    "address": "광주 서구 화정동",
    "size": "219㎡",
    "price": "4억 3,300만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "8층, 4베이, 남향, 내부 깨끗, 광주여고·광덕고 학군, 등산로 인접"
  },
  {
    "name": "쌍촌동 현대힐스테이트",
    "address": "광주 서구 쌍촌동",
    "size": "192㎡",
    "price": "4억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "8층, 4베이, 남향, 맨앞동, 확장형, 시스템에어컨, 리모델링, 생활권 우수"
  },
  {
    "name": "쌍촌동 현대힐스테이트(소형)",
    "address": "광주 서구 쌍촌동",
    "size": "159㎡",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1층, 4베이, 남향, 확장형, 전망 우수, 생활권·학군 우수"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "쌍촌동 현대힐스테이트(대형)",
    "address": "광주 서구 쌍촌동",
    "size": "225㎡",
    "price": "6억 9,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "8층, 4베이, 맨앞동, 시스템에어컨, 리모델링, 확장형, 생활권 우수"
  },
  {
    "name": "쌍촌동 현대힐스테이트(대형, 1층)",
    "address": "광주 서구 쌍촌동",
    "size": "225㎡",
    "price": "6억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1층, 4베이, 맨앞동, 확장형, 방5, 생활권 우수"
  },
  {
    "name": "화정동 현대힐스테이트",
    "address": "광주 서구 화정동",
    "size": "192㎡",
    "price": "5억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "9층, 4베이, 정남향, 확장형, 생활권 우수"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "쌍촌동 현대힐스테이트(대형, 10층)",
    "address": "광주 서구 쌍촌동",
    "size": "225㎡",
    "price": "6억 9,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "10층, 4베이, 맨앞동, 확장형, 전망 우수, 생활권·학군 우수"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},



"대전광역시 대덕구":{
"~2억":{
  "houses": [
    {
    "name": "양지마을",
    "address": "대전 대덕구 오정동",
    "size": "59.34㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1999년 입주, 10층, 548세대, 오정동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "평화로운",
    "address": "대전 대덕구 오정동",
    "size": "59.97㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1999년 입주, 12층, 오정동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "비래동 삼익둥지",
    "address": "대전 대덕구 비래동",
    "size": "전용 59~84㎡",
    "price": "1억 6,000만원~2억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "20년차 이상, 대단지, 비래동 중심, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "선비마을5단지",
    "address": "대전 대덕구 송촌동",
    "size": "59.96㎡",
    "price": "2억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1999년 입주, 16층, 1,555세대, 송촌동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "선비마을3단지",
    "address": "대전 대덕구 송촌동",
    "size": "59.94㎡",
    "price": "2억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1999년 입주, 17층, 1,872세대, 송촌동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "선비마을2단지",
    "address": "대전 대덕구 송촌동",
    "size": "59.76㎡",
    "price": "2억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1999년 입주, 5층, 1,554세대, 송촌동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "대전풍림금강엑슬루타워",
    "address": "대전 대덕구 석봉동",
    "size": "141.36㎡",
    "price": "5억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2012년 입주, 27층, 2,312세대, 초고층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "동일스위트리버스카이1단지",
    "address": "대전 대덕구 법동",
    "size": "84.98㎡",
    "price": "4억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 입주, 30층, 1,503세대, 신축, 대단지, 생활편의시설 인접"
  },
  {
    "name": "선비마을5단지(대형)",
    "address": "대전 대덕구 송촌동",
    "size": "99.92㎡",
    "price": "4억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1999년 입주, 11층, 1,555세대, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "한남대 도보 15분 다세대주택",
    "address": "대전 대덕구 오정동",
    "size": "정보 미상",
    "price": "10억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "한남대 도보 15분, 오정동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "중리동 신축급 분리형 원룸",
    "address": "대전 대덕구 중리동",
    "size": "149.88평",
    "price": "15억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중리네거리 인근, 신축급, 교통·생활편의시설 인접"
  },
  {
    "name": "송촌동 투룸",
    "address": "대전 대덕구 송촌동",
    "size": "63.5평",
    "price": "15억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "터미널, 한남대 인근, 각종 호재, 교통·생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "신탄진동 모텔",
    "address": "대전 대덕구 신탄진동",
    "size": "599.86㎡",
    "price": "18억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "19객실, 500m 이내 역세권, 상업용, 투자·사업용 적합"
  },
  {
    "name": "중리동 모텔",
    "address": "대전 대덕구 중리동",
    "size": "정보 미상",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "시행 등 재개발 호재, 상업용, 투자·사업용 적합"
  }
  ]
},
"20억 이상": {
  "houses": [
{
    "name": "대덕구 신탄진동 모텔",
    "address": "대전 대덕구 신탄진동",
    "size": "정보 미상",
    "price": "33억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상업용, 리모델링 필요, 투자·사업용 적합"
  },
  {
    "name": "대덕구 단독요양원",
    "address": "대전 대덕구",
    "size": "정보 미상",
    "price": "25억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "단독요양원, 투자·사업용 적합"
  },
  {
    "name": "대덕구 모텔(중리동)",
    "address": "대전 대덕구 중리동",
    "size": "정보 미상",
    "price": "21억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상업용, 투자·사업용 적합"
  }
  ]
}
},

"대전광역시 동구":{
"~2억":{
  "houses": [
    {
    "name": "용운주공2단지",
    "address": "대전 동구 용운동",
    "size": "49.94㎡",
    "price": "1억 3,300만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1987년 입주, 3층, 학세권, 최근 3개월 88건 거래, 생활편의시설 인접"
  },
  {
    "name": "큰솔아파트",
    "address": "대전 동구 용전동",
    "size": "38.09㎡",
    "price": "9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2001년 입주, 3층, 232세대, 지상 13층, 주차 165대, 생활편의시설 인접"
  },
  {
    "name": "신진크로바맨션",
    "address": "대전 동구 용전동",
    "size": "139.94㎡",
    "price": "2억 2,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1985년 입주, 4층, 15층 단지, 41년차, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "대림한숲",
    "address": "대전 동구 용전동",
    "size": "114.75㎡",
    "price": "3억 5,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1999년 입주, 5층, 1,036세대, 19층, 생활편의시설 인접"
  },
  {
    "name": "신동아",
    "address": "대전 동구 용전동",
    "size": "84.56㎡",
    "price": "2억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1990년 입주, 10층, 914세대, 15층, 생활편의시설 인접"
  },
  {
    "name": "천동 위드힐",
    "address": "대전 동구 천동",
    "size": "85㎡",
    "price": "3억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2013년 입주, 763세대, 18년차, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "이스트시티1단지",
    "address": "대전 동구 대동",
    "size": "85㎡",
    "price": "5억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 입주, 33평, 신축, 생활편의시설 인접"
  },
  {
    "name": "은어송마을2단지(코오롱하늘채)",
    "address": "대전 동구 대성동",
    "size": "103㎡",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2007년 입주, 40평, 대단지, 생활편의시설 인접"
  },
  {
    "name": "위드힐(대형)",
    "address": "대전 동구 천동",
    "size": "119㎡",
    "price": "4억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2013년 입주, 45평, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [
{
    "name": "동구 모텔매매",
    "address": "대전 동구",
    "size": "정보 미상",
    "price": "35억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "복합터미널 상권, 투자·사업용 적합"
  }
  ]
}
},

"대전광역시 서구 ":{
"~2억":{
  "houses": [
    {
    "name": "성원은아5단지",
    "address": "대전 서구 가수원동 808",
    "size": "52.2㎡",
    "price": "1억 2,200만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1995년 입주, 15층, 대단지, 교통·생활편의시설 인접"
  },
  {
    "name": "계룡아파트",
    "address": "대전 서구 가수원동 643",
    "size": "59.4㎡",
    "price": "1억 7,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1995년 입주, 12층, 대단지, 교통·생활편의시설 인접"
  },
  {
    "name": "상록수아파트",
    "address": "대전 서구 만년동",
    "size": "43.2㎡",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1995년 입주, 13층, 대전1호선 인근, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "중흥S-클래스프라디움",
    "address": "대전 서구 관저동",
    "size": "47.51㎡",
    "price": "2억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2016년 입주, 9층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "한가람아파트",
    "address": "대전 서구 탄방동",
    "size": "39.6㎡",
    "price": "2억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1991년 입주, 8층, 대전1호선 인근, 생활편의시설 인접"
  },
  {
    "name": "산호아파트",
    "address": "대전 서구 탄방동",
    "size": "40.36㎡",
    "price": "2억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1996년 입주, 11층, 대전1호선 인근, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "e편한세상둔산1단지",
    "address": "대전 서구 탄방동",
    "size": "84.87㎡",
    "price": "8억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 입주, 20층, 대전1호선 인근, 대단지, 생활편의시설 인접"
  },
  {
    "name": "한마루삼성아파트",
    "address": "대전 서구 둔산동",
    "size": "101.94㎡",
    "price": "8억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2002년 입주, 11층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "누리아파트",
    "address": "대전 서구 둔산동",
    "size": "126.45㎡",
    "price": "7억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2003년 입주, 13층, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "e편한세상둔산2단지",
    "address": "대전 서구 탄방동",
    "size": "103.78㎡",
    "price": "10억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 입주, 6층, 대전1호선 인근, 대단지, 생활편의시설 인접"
  },
  {
    "name": "목련아파트",
    "address": "대전 서구 둔산동",
    "size": "134.88㎡",
    "price": "14억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1993년 입주, 6층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "영진햇님아파트",
    "address": "대전 서구 둔산동",
    "size": "127.56㎡",
    "price": "11억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1996년 입주, 14층, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
   {
    "name": "크로바아파트",
    "address": "대전 서구 둔산동",
    "size": "164.95㎡",
    "price": "20억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1992년 입주, 2층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "크로바아파트",
    "address": "대전 서구 둔산동",
    "size": "164.95㎡",
    "price": "19억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1992년 입주, 7층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "크로바아파트",
    "address": "대전 서구 둔산동",
    "size": "164.95㎡",
    "price": "22억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1992년 입주, 4층, 대단지, 생활편의시설 인접"
  } 
  ]
},
"20억 이상": {
  "houses": [
    {
    "name": "크로바아파트",
    "address": "대전 서구 둔산동",
    "size": "164.95㎡",
    "price": "22억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1992년 입주, 4층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "크로바아파트",
    "address": "대전 서구 둔산동",
    "size": "164.95㎡",
    "price": "20억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1992년 입주, 6층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "크로바아파트",
    "address": "대전 서구 둔산동",
    "size": "164.95㎡",
    "price": "20억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1992년 입주, 2층, 대단지, 생활편의시설 인접"
  }
  ]
}
},

"대전광역시 유성구":{
"~2억":{
  "houses": [
    {
    "name": "스카이뷰리브",
    "address": "대전 유성구 구암동 611-31",
    "size": "47.74㎡",
    "price": "1억 4,300만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2층, 2025년 1월 실거래, 구암동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "초롱마을",
    "address": "대전 유성구 구암동 627-1",
    "size": "59.34㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "3층, 2024년 11월 실거래, 24년차, 구암동 중심, 생활편의시설 인접"
  },
  {
    "name": "우성햇살아파트",
    "address": "대전 유성구 구암동 609-2",
    "size": "84.97㎡",
    "price": "2억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "14층, 2024년 12월 실거래, 33년차, 구암동 중심, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "유성목련1단지",
    "address": "대전 유성구 상대동 445",
    "size": "59.93㎡",
    "price": "2억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "11층, 2024년 12월 실거래, 26년차, 상대동 중심, 생활편의시설 인접"
  },
  {
    "name": "유성목련2단지",
    "address": "대전 유성구 상대동 444",
    "size": "59.93㎡",
    "price": "2억 7,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "13층, 2024년 11월 실거래, 26년차, 상대동 중심, 생활편의시설 인접"
  },
  {
    "name": "유성자이",
    "address": "대전 유성구 봉명동 469-46",
    "size": "102.31㎡",
    "price": "4억 8,400만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "34층, 2024년 12월 실거래, 16년차, 봉명동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "반석더샵",
    "address": "대전 유성구 반석동",
    "size": "94.28㎡",
    "price": "5억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1층/29층, 2025년 4월 실거래, 2020년 준공, 반석동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "도안2블럭베르디움",
    "address": "대전 유성구 봉명동 1021",
    "size": "84.98㎡",
    "price": "8억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "9층, 2025년 1월 실거래, 2014년 준공, 봉명동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "유성CJ나인파크",
    "address": "대전 유성구 봉명동",
    "size": "179.39㎡",
    "price": "8억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "11층, 2024년 12월 실거래, 봉명동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
     {
    "name": "도룡SK뷰아파트",
    "address": "대전 유성구 도룡동 391",
    "size": "84.88㎡",
    "price": "10억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "9층, 2025년 1월 실거래, 2018년 준공, 도룡동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "트리풀시티 148㎡",
    "address": "대전 유성구 상대동",
    "size": "148㎡",
    "price": "15억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 실거래, 상대동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "복용동 2층 단독주택",
    "address": "대전 유성구 복용동",
    "size": "대지 350㎡, 연면적 164.2㎡",
    "price": "15억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2층, 2025년 기준, 복용동 중심, 단독주택, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "반석동 2층 단독주택",
    "address": "대전 유성구 반석동",
    "size": "대지 697㎡, 연면적 242.86㎡",
    "price": "19억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2층, 2012년 준공, 반석동 중심, 전원주택, 산·계곡 인접, 생활편의시설 인접"
  },
  {
    "name": "스마트시티 5단지 189㎡",
    "address": "대전 유성구 도룡동",
    "size": "189㎡",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 실거래, 도룡동 중심, 초고층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "스마트시티 5단지 171㎡",
    "address": "대전 유성구 도룡동",
    "size": "171㎡",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 실거래, 도룡동 중심, 초고층, 대단지, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
{
    "name": "스마트시티 2단지 203㎡",
    "address": "대전 유성구 도룡동",
    "size": "203㎡",
    "price": "27억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 실거래, 도룡동 중심, 초고층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "스마트시티 5단지 205㎡",
    "address": "대전 유성구 도룡동",
    "size": "205㎡",
    "price": "27억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 실거래, 도룡동 중심, 초고층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "스마트시티 5단지 203㎡(펜트하우스)",
    "address": "대전 유성구 도룡동",
    "size": "203㎡",
    "price": "25억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "23층, 2024년 10월 실거래, 도룡동 중심, 초고층, 펜트하우스, 생활편의시설 인접"
  }
  ]
}
},

"대전광역시 중구":{
"~2억":{
  "houses": [
    {
    "name": "산성동 리모델링 단독주택",
    "address": "대전 중구 산성동",
    "size": "대지 31평, 건평 26평",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2층 구조, 방 4, 화장실 2, 내부 리모델링, 산성네거리 인근, 생활편의시설 밀집"
  },
  {
    "name": "현암에버드림아파트",
    "address": "대전 중구 선화동",
    "size": "71.98㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2층, 2024년 10월 실거래, 선화동 중심, 생활편의시설 인접"
  },
  {
    "name": "에이스퀘어",
    "address": "대전 중구 선화동",
    "size": "27.08㎡",
    "price": "1억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "14층, 2024년 10월 실거래, 초소형, 선화동 중심, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "선화동 세울더레스트 3차",
    "address": "대전 중구 선화동",
    "size": "49.71㎡",
    "price": "2억~2억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "8층, 2025년 1월 실거래, 신축, 선화동 중심, 생활편의시설 인접"
  },
  {
    "name": "현대아파트",
    "address": "대전 중구 선화동",
    "size": "133.37㎡",
    "price": "2억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2층, 2024년 10월 실거래, 대형 평수, 선화동 중심, 생활편의시설 인접"
  },
  {
    "name": "센트럴뷰",
    "address": "대전 중구 선화동",
    "size": "59.97㎡",
    "price": "3억 5,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2층, 2024년 12월 실거래, 신축, 선화동 중심, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "대전해모로더센트라",
    "address": "대전 중구 선화동",
    "size": "84.95㎡",
    "price": "5억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "29층, 2024년 11월 실거래, 신축, 선화동 중심, 생활편의시설 인접"
  },
  {
    "name": "센트럴파크3단지",
    "address": "대전 중구 문화동",
    "size": "101.98㎡",
    "price": "6억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "4층, 2024년 11월 실거래, 신축, 문화동 중심, 생활편의시설 인접"
  },
  {
    "name": "대전센트럴자이1단지",
    "address": "대전 중구 대흥동",
    "size": "118.09㎡",
    "price": "6억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "7층, 2024년 9월 실거래, 신축, 대흥동 중심, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "센트럴파크2단지",
    "address": "대전 중구 문화동",
    "size": "139.93㎡",
    "price": "10억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "6층, 2024년 10월 실거래, 신축, 문화동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},


"울산광역시 남구":{
"~2억":{
  "houses": [
    {
    "name": "무거현대",
    "address": "울산 남구 무거동",
    "size": "84.96㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1995년 입주, 6층, 198세대, 무거동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "선암동서광",
    "address": "울산 남구 선암동",
    "size": "84.98㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1997년 입주, 2층, 84세대, 선암동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "럭키",
    "address": "울산 남구 무거동",
    "size": "84.11㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1991년 입주, 9층, 무거동 중심, 교통·생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "달동주공1단지",
    "address": "울산 남구 달동",
    "size": "59.97㎡",
    "price": "2억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1993년 입주, 3층, 948세대, 달동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "부성타워맨션",
    "address": "울산 남구 무거동",
    "size": "84.57㎡",
    "price": "2억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1989년 입주, 1층, 무거동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "홍일유토피아",
    "address": "울산 남구 무거동",
    "size": "83.19㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1993년 입주, 7층, 무거동 중심, 교통·생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
     {
    "name": "호수공원대명루첸",
    "address": "울산 남구 야음동",
    "size": "99.28㎡",
    "price": "5억 6,500만원~6억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 입주, 28층, 대단지, 호수공원 인접, 생활편의시설 인접"
  },
  {
    "name": "신정동 울산문수로동문디이스트",
    "address": "울산 남구 신정동",
    "size": "97㎡",
    "price": "5억원~5억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신축, 시스템에어컨, 중문, 생활편의시설 인접"
  },
  {
    "name": "울산신정푸르지오",
    "address": "울산 남구 신정동",
    "size": "84㎡",
    "price": "5억 6,000만원~5억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2012년 입주, 18층, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
     {
    "name": "문수로1차아이파크2단지",
    "address": "울산 남구 신정동",
    "size": "243.27㎡",
    "price": "13억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2013년 입주, 22층, 대단지, 신정동 중심, 생활편의시설 인접"
  },
  {
    "name": "울산옥동대공원한신휴플러스",
    "address": "울산 남구 옥동",
    "size": "122.01㎡",
    "price": "13억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2011년 입주, 11층, 대단지, 옥동 중심, 생활편의시설 인접"
  },
  {
    "name": "문수로2차아이파크1단지",
    "address": "울산 남구 신정동",
    "size": "114.65㎡",
    "price": "12억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2013년 입주, 12층, 대단지, 신정동 중심, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "대현동 수암로 상가주택",
    "address": "울산 남구 대현동",
    "size": "상가+주택(4층)",
    "price": "15억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 리모델링, 1~3층 상가, 4층 단독주택, 대로변 코너, 임대수익+거주, 홈플러스 도보 10분"
  },
  {
    "name": "상가/건물 매매",
    "address": "울산 남구 달동",
    "size": "상가/건물",
    "price": "18억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "달동 중심, 상가+주택, 임대수익, 대단지, 생활편의시설 인접"
  },
  {
    "name": "상가/건물 매매",
    "address": "울산 남구 신정동",
    "size": "상가/건물",
    "price": "16억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신정동 중심, 상가+주택, 임대수익, 대단지, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
    {
    "name": "상가/건물 매매",
    "address": "울산 남구 달동",
    "size": "상가/건물",
    "price": "23억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "달동 중심, 상가+주택, 임대수익, 대단지, 생활편의시설 인접"
  }
  ]
}
},

"울산광역시 동구":{
"~2억":{
  "houses": [
    {
    "name": "현대비치타운",
    "address": "울산 동구 방어동",
    "size": "84.74㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1997년 입주, 8층, 657세대, 방어동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "화정동명성블루빌3차",
    "address": "울산 동구 화정동",
    "size": "79.35㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2015년 입주, 9층, 화정동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "현대패밀리동부",
    "address": "울산 동구 동부동",
    "size": "74.95㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1993년 입주, 9층, 2,110세대, 동부동 중심, 교통·생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "울산동구미소지움",
    "address": "울산 동구",
    "size": "82.45㎡ (전용 59.27㎡)",
    "price": "2억 1,000~2억 1,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "방 3, 욕실 2, 2025년 기준, 동구 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "전하KCC스위첸아파트",
    "address": "울산 동구 전하동",
    "size": "77.97㎡",
    "price": "4억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 9월 14일 거래, 17층, 전하동 중심, 신축, 교통·생활편의시설 인접"
  },
  {
    "name": "울산전하푸르지오1단지",
    "address": "울산 동구 전하동",
    "size": "59.89㎡",
    "price": "3억 900만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 5월 25일 거래, 15층, 전하동 중심, 대단지, 교통·생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "울산지웰시티자이2단지",
    "address": "울산 동구 서부동",
    "size": "84.99㎡",
    "price": "5억 8,900만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 11월 17일 거래, 30층, 신축, 대단지, 교통·생활편의시설 인접"
  },
  {
    "name": "울산전하푸르지오1단지",
    "address": "울산 동구 전하동",
    "size": "151.9㎡",
    "price": "6억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2025년 1월 20일 거래, 26층, 대단지, 전하동 중심, 생활편의시설 인접"
  },
  {
    "name": "KCC스위첸웰츠타워1단지",
    "address": "울산 동구",
    "size": "84.95㎡",
    "price": "5억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 12월 20일 거래, 7층, 신축, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"울산광역시 북구":{
"~2억":{
  "houses": [
    {
    "name": "원동현대",
    "address": "울산 북구 천곡동",
    "size": "113.19㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1994년 입주, 3층, 대단지, 천곡동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "천곡웰빙",
    "address": "울산 북구 천곡동",
    "size": "121.74㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2009년 입주, 7층, 109세대, 천곡동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "현대파크맨션",
    "address": "울산 북구 매곡동",
    "size": "84.96㎡",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1996년 입주, 6층, 443세대, 매곡동 중심, 교통·생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "드림인시티에일린의뜰2차",
    "address": "울산 북구 매곡동",
    "size": "71.88㎡",
    "price": "4억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2017년 입주, 19층, 1,187세대, 매곡동 중심, 신축, 교통·생활편의시설 인접"
  },
  {
    "name": "현대아이파크1단지",
    "address": "울산 북구 달천동",
    "size": "84.95㎡",
    "price": "4억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2008년 입주, 19층, 1,012세대, 달천동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "효문코오롱하늘채",
    "address": "울산 북구 효문동",
    "size": "72.03㎡",
    "price": "3억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 입주, 8층, 858세대, 효문동 중심, 신축, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "송정지구제일풍경채",
    "address": "울산 북구 송정동",
    "size": "84.98㎡",
    "price": "6억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 입주, 10층, 송정동 중심, 신축, 대단지, 생활편의시설 인접"
  },
  {
    "name": "송정지웰푸르지오",
    "address": "울산 북구 화봉동",
    "size": "84.96㎡",
    "price": "5억 9,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2019년 입주, 24층, 화봉동 중심, 신축, 대단지, 생활편의시설 인접"
  },
  {
    "name": "송정지구반도유보라아이비파크",
    "address": "울산 북구 송정동",
    "size": "84.93㎡",
    "price": "5억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 입주, 17층, 송정동 중심, 신축, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "호계동 상가건물",
    "address": "울산 북구 호계동",
    "size": "363.64㎡",
    "price": "15억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "대지 621.49㎡, 2층, 상가+주택, 호계동 중심, 투자·사업용"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "진장동 상가건물",
    "address": "울산 북구 진장동",
    "size": "429.75㎡",
    "price": "20억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "대지 433.06㎡, 2층, 상가+주택, 진장동 중심, 투자·사업용"
  }
  ]
},
"20억 이상": {
  "houses": [
{
    "name": "중산동 상가건물",
    "address": "울산 북구 중산동",
    "size": "466㎡",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2층, 상가+주택, 중산동 중심, 투자·사업용"
  }
  ]
}
},

"울산광역시 중구":{
"~2억":{
  "houses": [
    
  {
    "name": "삼익세라믹",
    "address": "울산 중구 태화동",
    "size": "84.31㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1990년 입주, 10층, 320세대, 태화동 중심, 생활편의시설 인접"
  },
  {
    "name": "청우하이츠",
    "address": "울산 중구 우정동 723-1",
    "size": "84.97㎡",
    "price": "1억 9,400만원~2억 2,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1995년 입주, 13~23층, 202세대, 우정동 중심, 생활편의시설 인접"
  },
  {
    "name": "천지",
    "address": "울산 중구 학성동",
    "size": "70.34㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2002년 입주, 10층, 86세대, 학성동 중심, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "동덕현대4차",
    "address": "울산 중구 복산동 320",
    "size": "85.0㎡",
    "price": "2억 1,700만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1991년 입주, 5층, 복산동 중심, 생활편의시설 인접"
  },
  {
    "name": "남운럭키맨션",
    "address": "울산 중구 복산동 186-2",
    "size": "84.5㎡",
    "price": "2억 900만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1988년 입주, 6층, 복산동 중심, 생활편의시설 인접"
  },
  {
    "name": "다운삼성",
    "address": "울산 중구 다운동",
    "size": "84㎡",
    "price": "2억 4,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2001년 입주, 15층, 다운동 중심, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
     {
    "name": "복산 아이파크",
    "address": "울산 중구 복산동 776",
    "size": "84.7㎡",
    "price": "5억 500만원~5억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2017년 입주, 10층, 복산동 중심, 신축, 생활편의시설 인접"
  },
  {
    "name": "삼성래미안4단지",
    "address": "울산 중구 약사동 707-42",
    "size": "113㎡",
    "price": "5억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2004년 입주, 10층, 약사동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "에일린의뜰1차",
    "address": "울산 중구 유곡동",
    "size": "84.98㎡",
    "price": "5억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2012년 입주, 13층, 유곡동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},

"울산광역시 울주군":{
"~2억":{
  "houses": [
    {
    "name": "천상극동아파트",
    "address": "울산 울주군 범서읍 천상리",
    "size": "84.84㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1998년 입주, 394세대, 10층, 범서읍 중심, 교통·학군·생활편의시설 인접"
  },
  {
    "name": "아름아이필",
    "address": "울산 울주군 범서읍 천상리",
    "size": "84.97㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2003년 입주, 8층, 범서읍 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "구영현대아이파크",
    "address": "울산 울주군 범서읍 구영리",
    "size": "70.53㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1991년 입주, 14층, 구영리 중심, 교통·생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "천상 필그린 아파트",
    "address": "울산 울주군 범서읍 천상리",
    "size": "84.92㎡",
    "price": "2억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2008년 입주, 12층, 70세대, 범서읍 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "천상벽산아파트",
    "address": "울산 울주군 범서읍 천상리",
    "size": "84.99㎡",
    "price": "2억 3,200만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1999년 입주, 19층, 350세대, 범서읍 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "국도발리",
    "address": "울산 울주군 온양읍 대안리",
    "size": "82.81㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2008년 입주, 12층, 온양읍 중심, 교통·생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "문수산동원로얄듀크",
    "address": "울산 울주군 범서읍 굴화리",
    "size": "99.99㎡",
    "price": "7억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2017년 입주, 20층, 625세대, 범서읍 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "문수마을동문굿모닝힐",
    "address": "울산 울주군 범서읍 굴화리",
    "size": "130.88㎡",
    "price": "6억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 입주, 20층, 472세대, 범서읍 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "구영2차푸르지오",
    "address": "울산 울주군 범서읍 구영리",
    "size": "123.7㎡",
    "price": "6억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2007년 입주, 12층, 614세대, 구영리 중심, 교통·생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "청량읍 개곡리 전원주택",
    "address": "울산 울주군 청량읍 개곡리",
    "size": "155㎡ (대지 47평, 텃밭 82평)",
    "price": "2억 5,000만원~15억원(대형 전원주택)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "전원주택, 텃밭, 청량읍 중심, 생활편의시설 인접"
  },
  {
    "name": "청량읍 문죽리 전원주택",
    "address": "울산 울주군 청량읍 문죽리",
    "size": "413㎡ (132평)",
    "price": "3억 7,500만원~10억원(대형 전원주택)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "전원주택, 남향, 시내권 10분, 태양광 설치, 생활편의시설 인접"
  },
  {
    "name": "언양읍 반천리 단독주택",
    "address": "울산 울주군 언양읍 반천리",
    "size": "350㎡ (약 106평)",
    "price": "4억원~10억원(대형 단독주택)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "단독주택, 대지 넓음, 언양읍 중심, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "청량읍 개곡리 대형 전원주택",
    "address": "울산 울주군 청량읍 개곡리",
    "size": "1,420㎡ (약 430평, 건물 49㎡)",
    "price": "15억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "전원/농가주택, 청량읍 중심, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [

  ]
}
},




"세종특별자치시":{
"~2억":{
  "houses": [
    {
    "name": "조치원읍 신흥아파트",
    "address": "세종시 조치원읍",
    "size": "84㎡",
    "price": "1억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "조치원역 도보권, 20년차 이상 구축, 생활편의시설 인접"
  },
  {
    "name": "금남면 나홀로 소형아파트",
    "address": "세종시 금남면",
    "size": "59㎡",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "금남면 중심, 20년차 이상 구축, 생활편의시설 인접"
  },
  {
    "name": "고운동 가락마을15단지",
    "address": "세종시 고운동",
    "size": "59㎡",
    "price": "2억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2016년 입주, 저층, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "종촌동 가재마을8단지",
    "address": "세종시 종촌동",
    "size": "84㎡",
    "price": "3억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2012년 입주, 저층, 생활편의시설 인접"
  },
  {
    "name": "고운동 가락마을17단지",
    "address": "세종시 고운동",
    "size": "59㎡",
    "price": "2억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2016년 입주, 저층, 생활편의시설 인접"
  },
  {
    "name": "조치원읍 34평 구축아파트",
    "address": "세종시 조치원읍",
    "size": "112㎡",
    "price": "2억 7,000만원~2억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "조치원읍 중심, 20년차 이상 구축, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "새뜸마을10단지더샵힐스테이트",
    "address": "세종시 새롬동",
    "size": "98㎡",
    "price": "10억 6,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2017년 입주, 12층, 새롬동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "나릿재마을3단지제일풍경채위너스카이",
    "address": "세종시 나성동",
    "size": "98.82㎡",
    "price": "10억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 입주, 12층, 나성동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "호려울마을10단지중흥S클래스리버뷰2차",
    "address": "세종시 보람동",
    "size": "109.5㎡",
    "price": "10억 500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 입주, 19층, 보람동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "도램마을14단지한림풀에버",
    "address": "세종시 도담동",
    "size": "112㎡",
    "price": "10억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 입주, 18층, 도담동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "나릿재마을2단지",
    "address": "세종시 나성동",
    "size": "99.24㎡",
    "price": "13억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 입주, 26층, 나성동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "수루배마을1단지",
    "address": "세종시 반곡동",
    "size": "96.78㎡",
    "price": "9억원~13억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2019년 입주, 24층, 반곡동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "한뜰마을6단지중흥S클래스센텀뷰",
    "address": "세종시 어진동",
    "size": "164.8㎡",
    "price": "16억 7,000만원(감정가), 실거래가 12억 5,000만원~15억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 준공, 13층, 어진동 중심, 대단지, 호수공원 인접, 최고가 22억원 기록"
  },
  {
    "name": "나릿재마을2단지(펜트하우스)",
    "address": "세종시 나성동",
    "size": "202㎡",
    "price": "24억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 입주, 22층, 나성동 중심, 펜트하우스, 최고가 거래"
  },
  {
    "name": "다정동 중정주택 단독주택",
    "address": "세종시 다정동",
    "size": "199.25㎡",
    "price": "20억원(조율가능)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 준공, 2층, 다정동 중심, 고급 단독주택, 루프탑, 주차 2대"
  }
  ]
},
"20억 이상": {
  "houses": [
{
    "name": "한뜰마을6단지중흥S클래스센텀뷰(펜트하우스)",
    "address": "세종시 어진동",
    "size": "202㎡",
    "price": "24억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 거래, 22층, 펜트하우스, 호수공원 인접, 세종시 역대 최고가"
  },
  {
    "name": "나릿재마을2단지(펜트하우스)",
    "address": "세종시 나성동",
    "size": "202㎡",
    "price": "24억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 입주, 22층, 나성동 중심, 펜트하우스, 최고가 거래"
  },
  {
    "name": "한뜰마을6단지중흥S클래스센텀뷰(펜트하우스)",
    "address": "세종시 어진동",
    "size": "199㎡",
    "price": "22억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 거래, 21층, 펜트하우스, 호수공원 인접, 세종시 초고가 거래"
  }
  ]
}
},





"경기도":{
"~2억":{
  "houses": [
    {
  "name": "영통동 벽적골8단지 주공 아파트",
  "address": "경기도 수원시 영통구 영통동 972-2",
  "size": "82.59m² (25평)",
  "price": "4억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "영통역 차량 10분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "수정구 상대원동 빌라",
  "address": "경기도 성남시 수정구 상대원동",
  "size": "35m² (10평)",
  "price": "1억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "상대원역 도보 10분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "일산서구 구산동 단독마당 땅",
  "address": "경기도 고양시 일산서구 구산동",
  "size": "88평 (290.91m²)",
  "price": "2억 7,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "자유로 법곳IC, 장산IC 인근, 생산관리지역, 대형화물 불가, 텃밭 및 소형창고 용도 적합"
}
  ]
},
"2억~5억": {
  "houses": [
  {
  "name": "일산동구 풍동 투룸 아파트",
  "address": "경기도 고양시 일산동구 풍동",
  "size": "25m² (7.5평)",
  "price": "4억 8,500만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "풍동, 버스 다수, 대형마트 차량 10분"
},
  {
      "name": "군포시 산본동 주공아파트",
      "address": "군포시 산본동",
      "size": "59㎡",
      "price": "3억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "1994년 준공, 15층, 산본역 도보 5분 거리, 주변에 상업시설과 학교 밀집"
    },
     {
      "name": "광명동 다세대주택",
      "address": "광명시 광명동",
      "size": "34.61㎡",
      "price": "2억 8,000만원",
      "auction": "https://town.aipartner.com/memul/T1116936605",
      "infra": "광명8구역 재개발 추진 중, 준주거지역, 2룸 구조"
    }
  ]
},
"5억~10억": {
  "houses": [
  {
      "name": "광주광역시 아파트",
      "address": "광주시 서구",
      "size": "100㎡",
      "price": "6억 2,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
      "infra": "2018년 준공, 20층, 300세대, 서구 중심, 교통·생활편의시설 인접"
    },
      {
            "name": "동두천 미사역 푸르지오",
            "address": "동두천시 지행동",
            "size": "100㎡",
            "price": "7억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2022년 준공, 25층, 500세대, 지행역 인근, 교통 및 생활편의시설 인접"
        },
    {
  "name": "수정구 단대동 코오롱 하늘채",
  "address": "경기도 성남시 수정구 단대동",
  "size": "80m² (24평)",
  "price": "7억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "단대오거리역 차량 10분, 버스 다수, 대형마트 차량 10분"
}    
  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "수정구 창곡동 위례센트럴자이",
  "address": "경기도 성남시 수정구 창곡동",
  "size": "98.79m² (30평)",
  "price": "15억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "위례역 도보 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "더샵 분당파크리버",
  "address": "경기도 성남시 분당구",
  "size": "85m² (25평)",
  "price": "15억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "분당구청 근처, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
    "name": "여월휴먼시아(대형)",
    "address": "경기 부천시 오정구 여월동",
    "size": "165㎡",
    "price": "10억~10억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 입주, 10층, 대단지, 홈플러스·공원 인접, 학군 우수"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "일산동구 정발산동 고급 단독주택",
  "address": "경기도 고양시 일산동구 정발산동",
  "size": "180m² (54평)",
  "price": "17억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "정발산역 인근, 버스 다수, 대형마트 차량 10분"
},{
  "name": "중원구 산성동 고급 단독주택",
  "address": "경기도 성남시 중원구 산성동",
  "size": "180m² (54평)",
  "price": "17억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "산성역 도보 5분, 중원구청 차량 15분, 공원 인근, 대형마트 차량 10분"
},
{
  "name": "영통 롯데캐슬 엘클래스 2단지",
  "address": "경기도 수원시 영통구 망포동",
  "size": "85m² (25평)",
  "price": "17억 2,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "망포역 도보 7분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"20억 이상": {
  "houses": [
  {
  "name": "광교 중흥 에스클래스 더퍼스트",
  "address": "경기도 수원시 영통구 광교동",
  "size": "130m² (39평)",
  "price": "28억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "광교중앙역 도보 5분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "수정구 신흥동 산성역 포레스티아",
  "address": "경기도 성남시 수정구 신흥동",
  "size": "140m² (42평)",
  "price": "22억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "산성역 도보 5분, 버스 다수, 대형마트 차량 10분"
},
{
    "name": "호계동 대형 아파트(펜트하우스)",
    "address": "경기 안양시 동안구 호계동",
    "size": "152㎡",
    "price": "20억원 이상",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "53평형, 펜트하우스, 신축, 범계사거리, 생활편의시설 인접"
  }
  ]
}
},

"경기도 수원시":{
"~2억":{
  "houses": [
    {
  "name": "공작 아파트",
  "address": "경기도 수원시 권선구 금곡동",
  "size": "38.43m² (12평)",
  "price": "1억 6,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "금곡역 도보 7분, 권선구청 차량 15분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "매탄동 소형 빌라",
  "address": "경기도 수원시 영통구 매탄동",
  "size": "30m² (9평)",
  "price": "1억 9,500만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "매탄역 도보 8분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "조원동 소형 빌라",
  "address": "경기도 수원시 장안구 조원동",
  "size": "28m² (8평)",
  "price": "1억 8,500만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "조원동, 버스 다수, 대형마트 차량 10분, 공원 인근"
}
  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "망포동 현대 아파트",
  "address": "경기도 수원시 영통구 망포동",
  "size": "75m² (23평)",
  "price": "4억 9,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "망포역 도보 7분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "수원인계푸르지오 주상복합 102동",
  "address": "경기도 수원시 팔달구 인계동",
  "size": "113.41m² (34평)",
  "price": "5억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "수인분당선 인계역 도보 7분, 대형마트 차량 10분, 버스 다수"
},
{
  "name": "단독주택 세류동",
  "address": "경기도 수원시 권선구 세류동",
  "size": "132m² (40평)",
  "price": "3억 9,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "세류역 도보 5분, 권선구청 차량 10분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "다가구주택 세류동",
  "address": "경기도 수원시 권선구 세류동 467-12",
  "size": "155.3m² (47평)",
  "price": "5억 6,400만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "수원역 도보 10분, 권선구청 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "영통동 신원 미주 아파트",
  "address": "경기도 수원시 영통구 영통동",
  "size": "84m² (25평)",
  "price": "7억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "영통역 도보 7분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "송죽동 단독주택",
  "address": "경기도 수원시 장안구 송죽동",
  "size": "89.4m² (27평)",
  "price": "10억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "송죽동, 버스 다수, 대형마트 차량 10분, 공원 인근"
}
  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "광교 아르데코 아파트",
  "address": "경기도 수원시 영통구 광교동",
  "size": "98.3m² (30평)",
  "price": "11억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "광교중앙역 도보 5분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "영통 푸르지오 파인베르",
  "address": "경기도 수원시 영통구 망포동",
  "size": "84m² (25평)",
  "price": "12억 3,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "망포역 도보 7분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "힐스테이트 영통",
  "address": "경기도 수원시 영통구 영통동",
  "size": "84m² (25평)",
  "price": "13억 7,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "영통역 도보 7분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "광교 중흥 에스클래스",
  "address": "경기도 수원시 영통구 광교동",
  "size": "110m² (33평)",
  "price": "16억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "광교중앙역 도보 5분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "영통 롯데캐슬 엘클래스 2단지",
  "address": "경기도 수원시 영통구 망포동",
  "size": "85m² (25평)",
  "price": "17억 2,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "망포역 도보 7분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "영통 자연앤힐스테이트",
  "address": "경기도 수원시 영통구 이의동",
  "size": "84m² (25평)",
  "price": "18억 9,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "광교중앙역 도보 5분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"20억 이상": {
  "houses": [
  {
  "name": "광교 힐스테이트 레이크",
  "address": "경기도 수원시 영통구 광교동",
  "size": "120m² (36평)",
  "price": "25억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "광교중앙역 도보 5분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "광교 중흥 에스클래스 더퍼스트",
  "address": "경기도 수원시 영통구 광교동",
  "size": "130m² (39평)",
  "price": "28억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "광교중앙역 도보 5분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "영통 롯데캐슬 엘클래스 프리미엄",
  "address": "경기도 수원시 영통구 망포동",
  "size": "140m² (42평)",
  "price": "30억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "망포역 도보 7분, 수원시청 차량 15분, 버스 다수, 대형마트 차량 10분"
}
  ]
}
},


"경기도 성남시":{
"~2억":{
  "houses": [
    {
  "name": "수정구 단대동 다가구 주택",
  "address": "경기도 성남시 수정구 단대동",
  "size": "40m² (12평)",
  "price": "2억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "단대오거리역 차량 10분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "상대원삼익 아파트 101동",
  "address": "경기도 성남시 중원구 상대원동 152-3",
  "size": "46.02m² (14평)",
  "price": "2억 6,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "상대원역 도보 10분, 중원구청 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "수정구 상대원동 빌라",
  "address": "경기도 성남시 수정구 상대원동",
  "size": "35m² (10평)",
  "price": "1억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "상대원역 도보 10분, 버스 다수, 대형마트 차량 10분, 공원 인근"
}
  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "매화마을건영1차 923동",
  "address": "경기도 성남시 분당구 매화마을",
  "size": "60m² (18평)",
  "price": "4억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "분당구청 근처, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "수정구 단대동 다세대 주택",
  "address": "경기도 성남시 수정구 단대동",
  "size": "55m² (16평)",
  "price": "3억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "단대오거리역 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "중원구 산성동 아파트",
  "address": "경기도 성남시 중원구 산성동",
  "size": "75m² (23평)",
  "price": "4억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "산성역 도보 5분, 중원구청 차량 15분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"5억~10억": {
  "houses": [
    {
  "name": "중원구 상대원동 아파트",
  "address": "경기도 성남시 중원구 상대원동",
  "size": "80m² (24평)",
  "price": "7억 8,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "상대원역 도보 10분, 중원구청 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "수정구 산성역 자이푸르지오",
  "address": "경기도 성남시 수정구 신흥동",
  "size": "75m² (23평)",
  "price": "8억 3,500만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "산성역 도보 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "매화마을공무원 아파트",
  "address": "경기도 성남시 분당구 야탑동",
  "size": "80m² (24평)",
  "price": "7억 4,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "야탑역 인근, 버스 다수, 대형마트 차량 10분, 공원 인근"
}
  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "분당 인텔리지2A동",
  "address": "경기도 성남시 분당구 정자동",
  "size": "84m² (25평)",
  "price": "12억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "정자역 인근, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "중원구 상대원동 고급 아파트",
  "address": "경기도 성남시 중원구 상대원동",
  "size": "100m² (30평)",
  "price": "11억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "상대원역 도보 10분, 중원구청 차량 10분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "수정구 산성역 자이푸르지오",
  "address": "경기도 성남시 수정구 신흥동",
  "size": "110m² (33평)",
  "price": "13억",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "산성역 도보 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
}
  ]
},
"15억~20억": {
  "houses": [
    {
  "name": "수정구 창곡동 위례 호반 베르디움",
  "address": "경기도 성남시 수정구 창곡동",
  "size": "98.95m² (30평)",
  "price": "17억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "위례역 도보 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "중원구 금광동 고급 단독주택",
  "address": "경기도 성남시 중원구 금광동",
  "size": "150m² (45평)",
  "price": "18억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "금광역 도보 7분, 중원구청 차량 15분, 공원 인근, 대형마트 차량 10분"
},
{
  "name": "수정구 창곡동 위례 호반 베르디움",
  "address": "경기도 성남시 수정구 창곡동",
  "size": "98.95m² (30평)",
  "price": "17억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "위례역 도보 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
}
  ]
},
"20억 이상": {
  "houses": [
  {
  "name": "분당구 정자동 고급 아파트",
  "address": "경기도 성남시 분당구 정자동",
  "size": "140m² (42평)",
  "price": "30억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "정자역 인근, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "중원구 산성동 고급 단독주택",
  "address": "경기도 성남시 중원구 산성동",
  "size": "280m² (85평)",
  "price": "22억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "산성역 도보 5분, 중원구청 차량 15분, 공원 인근, 대형마트 차량 10분"
},
{
  "name": "수정구 신흥동 산성역 포레스티아",
  "address": "경기도 성남시 수정구 신흥동",
  "size": "140m² (42평)",
  "price": "22억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "산성역 도보 5분, 버스 다수, 대형마트 차량 10분"
}
  ]
}
},

"경기도 고양시":{
"~2억":{
  "houses": [
   {
  "name": "덕양구 관산동 다세대주택",
  "address": "경기도 고양시 덕양구 관산동",
  "size": "45m² (13평)",
  "price": "1억 8,000만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "관산동, 버스 다수, 대형마트 차량 10분, 공원 인근"
}, 
{
  "name": "일산동구 식사동 소형 오피스텔",
  "address": "경기도 고양시 일산동구 식사동",
  "size": "13.45m² (4평)",
  "price": "1억 9,000만원 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "식사역 인근, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산동구 마두동 소형 빌라",
  "address": "경기도 고양시 일산동구 마두동",
  "size": "30m² (9평)",
  "price": "2억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "마두역 인근, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"2억~5억": {
  "houses": [
    {
  "name": "덕양구 토당동 투룸 아파트",
  "address": "경기도 고양시 덕양구 토당동",
  "size": "64m² (19평)",
  "price": "4억 9,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "토당동, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "일산동구 식사동 아파트",
  "address": "경기도 고양시 일산동구 식사동",
  "size": "59m² (18평)",
  "price": "4억 8,500만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "식사역 인근, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산서구 덕이동 아파트",
  "address": "경기도 고양시 일산서구 덕이동",
  "size": "59m² (18평)",
  "price": "4억 1,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "덕이역 인근, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "일산동구 백석동 백송마을 아파트",
    "address": "경기도 고양시 일산동구 백석동",
    "size": "85m² (25.7평)",
    "price": "7억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인",
    "infra": "백석역 도보 5분, 초등학교 인접, 홈플러스 도보권"
  },
{
  "name": "일산서구 대화동 킨텍스꿈에그린",
  "address": "경기도 고양시 일산서구 대화동",
  "size": "84m² (25평)",
  "price": "9억 2,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "킨텍스역 도보 5분, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산서구 탄현동 일산두산위브더제니스",
  "address": "경기도 고양시 일산서구 탄현동",
  "size": "79m² (24평)",
  "price": "5억 4,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "탄현역 도보 10분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"10억~15억": {
  "houses": [
    {
  "name": "덕양구 삼송동 단독주택",
  "address": "경기도 고양시 덕양구 삼송동",
  "size": "150m² (45평)",
  "price": "13억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "삼송역 차량 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "일산동구 정발산동 단독주택",
  "address": "경기도 고양시 일산동구 정발산동",
  "size": "140m² (42평)",
  "price": "13억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "정발산역 인근, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산서구 탄현동 고급 아파트",
  "address": "경기도 고양시 일산서구 탄현동",
  "size": "105m² (32평)",
  "price": "14억 내외",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "탄현역 도보 10분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"15억~20억": {
  "houses": [
{
  "name": "덕양구 화정동 고급 단독주택",
  "address": "경기도 고양시 덕양구 화정동",
  "size": "180m² (54평)",
  "price": "17억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "화정역 도보 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "일산동구 정발산동 고급 단독주택",
  "address": "경기도 고양시 일산동구 정발산동",
  "size": "180m² (54평)",
  "price": "17억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "정발산역 인근, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산서구 탄현동 고급 단독주택",
  "address": "경기도 고양시 일산서구 탄현동",
  "size": "180m² (54평)",
  "price": "17억 5,000만원",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "탄현역 도보 10분, 버스 다수, 대형마트 차량 10분"
}
  ]
},
"20억 이상": {
  "houses": [
  {
  "name": "덕양구 화정동 초대형 단독주택",
  "address": "경기도 고양시 덕양구 화정동",
  "size": "280m² (85평)",
  "price": "22억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "화정역 도보 5분, 버스 다수, 대형마트 차량 10분, 공원 인근"
},
{
  "name": "일산동구 백석동 초대형 단독주택",
  "address": "경기도 고양시 일산동구 백석동",
  "size": "320m² (97평)",
  "price": "30억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "백석역 인근, 버스 다수, 대형마트 차량 10분"
},
{
  "name": "일산서구 가좌동 초대형 단독주택",
  "address": "경기도 고양시 일산서구 가좌동",
  "size": "280m² (85평)",
  "price": "22억 이상",
  "auction": "실제 법원경매정보 사이트에서 확인",
  "infra": "가좌역 도보 7분, 버스 다수, 대형마트 차량 10분"
}
  ]
}
},

"경기도 부천시":{
"~2억":{
  "houses": [
    {
    "name": "오정동 에리트아파트",
    "address": "경기 부천시 오정구 오정동",
    "size": "59.85㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1995년 입주, 5층, 소형 평형, 오정동 중심, 생활편의시설 인접"
  },
  {
    "name": "신축 빌라",
    "address": "경기 부천시 원미구 춘의동",
    "size": "전용 15~23평",
    "price": "1억 5,000만원~2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신축, 2~5층, 주차장, 내부 올수리, 생활편의시설 인접"
  },
  {
    "name": "모아아파트",
    "address": "경기도 부천시 소사구 괴안동",
    "size": "56.04㎡ (19평)",
    "price": "9,500만원~2억 1,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1986년 준공, 저층, 괴안동 중심, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "오정생활휴먼시아2단지",
    "address": "경기 부천시 오정구 오정동",
    "size": "84.69㎡",
    "price": "3억~4억대",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2006년 입주, 14층, 대단지, 오정동 중심, 생활편의시설 인접"
  },
  {
    "name": "중동 아파트",
    "address": "경기 부천시 원미구 중동",
    "size": "59m²",
    "price": "2억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "7층, 중동 중심, 역세권, 생활편의시설 인접"
  },
 {
    "name": "동도센트리움",
    "address": "경기도 부천시 소사구 심곡본동",
    "size": "59.92㎡ (24평)",
    "price": "2억 8,000만원~4억 900만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2016년 준공, 11층, 심곡본동 중심, 역세권, 학세권, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "오정동 정보주상빌라트(대형)",
    "address": "경기 부천시 오정구 오정동",
    "size": "33~37평",
    "price": "5억~6억대",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1997년 입주, 6층, 엘리베이터, 대형 평형, 생활편의시설 인접"
  },
  {
    "name": "스타팰리움",
    "address": "경기 부천시 원미구 중동",
    "size": "84.9㎡",
    "price": "5억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "26평, 방3 욕실2, 대출 가능, 중동역 도보 10분, 주차·엘리베이터"
  },
  {
    "name": "송내동 우성아파트",
    "address": "경기도 부천시 소사구 송내동",
    "size": "147.68㎡",
    "price": "5억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1990년 준공, 11층/14층, 송내동 중심, 올수리, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
{
    "name": "여월휴먼시아(대형)",
    "address": "경기 부천시 오정구 여월동",
    "size": "165㎡",
    "price": "10억~10억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 입주, 10층, 대단지, 홈플러스·공원 인접, 학군 우수"
  },
  {
    "name": "라일락마을",
    "address": "경기 부천시 원미구 상동",
    "size": "127.73㎡",
    "price": "8억 9,000만원~11억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2025년 1월 거래, 2층, 상동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "부천소사역푸르지오",
    "address": "경기도 부천시 소사구 소사본동",
    "size": "148㎡ (122㎡ 전용)",
    "price": "10억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중층/30층, 남서향, 대단지, 역세권, 대형평수"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "오정동 정보주상빌라트(특대형)",
    "address": "경기 부천시 오정구 오정동",
    "size": "50평대",
    "price": "15억 5,000만원(공시가격)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1997년 입주, 6층, 특대형 평형, 생활편의시설 인접"
  },
  {
    "name": "상동 단독주택(대형)",
    "address": "경기 부천시 원미구 상동",
    "size": "200㎡ 이상",
    "price": "15억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 기준, 대형 단독, 상동 중심, 생활편의시설 인접"
  },
  {
    "name": "범박동 단독/다가구주택",
    "address": "경기도 부천시 소사구 범박동",
    "size": "244㎡ (연면적 439㎡)",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "4층, 남서향, 대형 단독/다가구, 범박동 중심, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
  {
    "name": "상동 상가건물(대형)",
    "address": "경기 부천시 원미구 상동",
    "size": "446㎡",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상동 중심, 상가+주택, 투자·사업용, 생활편의시설 인접"
  }
  ]
}
},

"경기도 안산시":{
"~2억":{
  "houses": [
    {
    "name": "주공그린빌15단지",
    "address": "안산시 단원구 초지동",
    "size": "59㎡",
    "price": "2억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2002년 준공, 14층, 남향, 초지동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "안산푸르지오8차",
    "address": "안산시 단원구 원곡동",
    "size": "59㎡",
    "price": "2억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "23층, 남향, 원곡동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "본오동 빌라",
    "address": "경기 안산시 상록구 본오동 758-9",
    "size": "59.9㎡",
    "price": "2억 500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남향, 4층, 방3/욕실2, 8세대, 2021년 준공, 교통·생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "안산푸르지오8차",
    "address": "안산시 단원구 원곡동",
    "size": "59㎡",
    "price": "2억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "23층, 남향, 원곡동 중심, 교통·생활편의시설 인접"
  },
 {
    "name": "본오동 빌라(신축)",
    "address": "경기 안산시 상록구 본오동",
    "size": "59.9㎡",
    "price": "2억 500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남향, 4층, 신축, 방3/욕실2, 8세대, 생활편의시설 인접"
  },
  {
    "name": "푸른마을5단지",
    "address": "경기 안산시 상록구 해양동",
    "size": "49.5㎡",
    "price": "2억 7,700만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "5층, 관리비 없음, 해양동 중심, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "센트럴푸르지오",
    "address": "안산시 단원구 고잔동",
    "size": "84.96㎡",
    "price": "8억 5,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "7층, 2018년 입주, 고잔동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "안산레이크타운푸르지오",
    "address": "안산시 단원구 고잔동",
    "size": "84.6㎡",
    "price": "8억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "19층, 2016년 입주, 고잔동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "파크푸르지오",
    "address": "경기 안산시 상록구 성포동",
    "size": "84.66㎡",
    "price": "7억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 입주, 9층, 대단지, 성포동 중심, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "호수공원아파트",
    "address": "안산시 단원구 고잔동",
    "size": "134.87㎡",
    "price": "10억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "9층, 2001년 입주, 고잔동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "푸르지오1차",
    "address": "안산시 단원구 고잔동",
    "size": "116.34㎡",
    "price": "9억 5,000만원~10억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "5층, 2001년 입주, 고잔동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "그랑시티자이2차",
    "address": "경기 안산시 상록구 사동",
    "size": "115.86㎡",
    "price": "10억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 입주, 13층, 대단지, 사동 중심, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "상가주택(중앙동/고잔동)",
    "address": "안산시 단원구 중앙동",
    "size": "정보 미상",
    "price": "15억~20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중앙동/고잔동 중심, 상가+주택, 투자·사업용"
  },
{
    "name": "이동 신축 도시형 다가구주택",
    "address": "경기 안산시 상록구 이동",
    "size": "정보 미상",
    "price": "15억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신축, 다가구, 이동 중심, 생활편의시설 인접"
  },
  {
    "name": "본오동 상가주택",
    "address": "경기 안산시 상록구 본오동",
    "size": "정보 미상",
    "price": "15억~16억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상가+주택, 본오동 중심, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
  {
    "name": "안산레이크타운푸르지오(펜트하우스)",
    "address": "안산시 단원구 고잔동",
    "size": "124.54㎡",
    "price": "21억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "40층, 2016년 입주, 고잔동 중심, 펜트하우스, 최고가 거래, 생활편의시설 인접"
  }
  ]
}
},

"경기도 안양시":{
"~2억":{
  "houses": [
    {
    "name": "호계동 투룸 빌라",
    "address": "경기 안양시 동안구 호계동",
    "size": "약 49㎡",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "호계사거리 도보 5분, 역세권, 관리비 저렴, 생활편의시설 인접"
  },
  {
    "name": "안양동 투룸 빌라",
    "address": "경기 안양시 동안구 안양동",
    "size": "약 36㎡",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "안양역 도보 15분, 관리비 1만원, 생활편의시설 인접"
  },
   {
    "name": "거성타워",
    "address": "경기도 안양시 만안구 안양동",
    "size": "45.07㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2014년 입주, 1호선 인근, 저층, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "비산동 임곡휴먼시아",
    "address": "경기 안양시 동안구 비산동",
    "size": "약 84㎡",
    "price": "5억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "12층, 20층 중, 대단지, 생활편의시설 인접"
  },
  {
    "name": "호계동 오피스텔",
    "address": "경기 안양시 동안구 호계동",
    "size": "약 47㎡",
    "price": "2억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "20층, 전세안고 매매, 밝고 전망 좋음, 생활편의시설 인접"
  },
  {
    "name": "하이트타운아파트",
    "address": "경기도 안양시 만안구 안양동",
    "size": "77.78㎡",
    "price": "3억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "12층, 안양동 중심, 관리비 없음, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
     {
    "name": "평촌동 이편한세상",
    "address": "경기 안양시 동안구 평촌동",
    "size": "약 131㎡",
    "price": "10억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "8년차, 50평형, 대단지, 생활편의시설 인접"
  },
  {
    "name": "안양광신프로그레스리버뷰",
    "address": "경기도 안양시 만안구 안양동",
    "size": "72.04㎡",
    "price": "6억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 입주, 10층, 230세대, 1호선 인근, 대단지, 생활편의시설 인접"
  },
  {
    "name": "안양리버자이르네",
    "address": "경기도 안양시 만안구 박달동",
    "size": "74.73㎡",
    "price": "6억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 입주, 17층, 139세대, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "관양동 동편마을4단지",
    "address": "경기 안양시 동안구 관양동",
    "size": "약 136㎡",
    "price": "14억 5,000만원~15억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2012년 준공, 52평형, 대단지, 고층, 평촌 중심, 생활편의시설 인접"
  },
  {
    "name": "호계동 아크로 베스티뉴(분양)",
    "address": "경기 안양시 동안구 호계동",
    "size": "84㎡",
    "price": "14억 4,000만원~15억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2025년 입주, 하이엔드 브랜드, 평촌 신축, 범계사거리, 생활편의시설 인접"
  },
  {
    "name": "래미안안양메가트리아(고층)",
    "address": "경기도 안양시 만안구 안양동",
    "size": "186.13㎡",
    "price": "14억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2016년 입주, 고층, 남향, 트인뷰, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "래미안안양메가트리아(펜트하우스)",
    "address": "경기도 안양시 만안구 안양동",
    "size": "186.13㎡",
    "price": "15억~15억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2016년 입주, 펜트하우스, 남향, 트인뷰, 대단지, 생활편의시설 인접"
  },
  {
    "name": "호계동 대형 아파트",
    "address": "경기 안양시 동안구 호계동",
    "size": "152㎡",
    "price": "16억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "53평형, 4룸, 고층, 신축, 생활편의시설 인접"
  },
  {
    "name": "관양동 동편마을4단지",
    "address": "경기 안양시 동안구 관양동",
    "size": "152㎡",
    "price": "15억~17억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "20층, 대형 평수, 고층, 평촌 중심, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
  {
    "name": "호계동 아크로 베스티뉴(분양)",
    "address": "경기 안양시 동안구 호계동",
    "size": "84㎡",
    "price": "15억 7,440만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2025년 입주, 하이엔드 브랜드, 평촌 신축, 범계사거리, 생활편의시설 인접"
  },
  {
    "name": "호계동 대형 아파트",
    "address": "경기 안양시 동안구 호계동",
    "size": "152㎡",
    "price": "16억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "53평형, 4룸, 고층, 신축, 생활편의시설 인접"
  }
  ]
}
},

"경기도 용인시":{
"~2억":{
  "houses": [
    {
    "name": "유원휴하임",
    "address": "용인시 기흥구 언남동",
    "size": "41.46㎡",
    "price": "1억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2013년 준공, 5층, 소형 평형, 학세권, 생활편의시설 인접"
  },
  {
      "name": "처인구 포곡읍 전원주택",
      "address": "경기도 용인시 처인구 포곡읍",
      "size": "85m² (25.7평)",
      "price": "1억 9,800만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "에버랜드 차량 10분, 조용한 주거지"
    },
    {
      "name": "처인구 이동읍 단독주택",
      "address": "경기도 용인시 처인구 이동읍",
      "size": "70m² (21평)",
      "price": "1억 6,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "인근 초등학교, 도보 3분 거리 버스"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "한보라마을9단지경남아너스빌",
    "address": "용인시 기흥구 공세동",
    "size": "59.89㎡",
    "price": "3억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2006년 준공, 21층, 학세권, 생활편의시설 인접"
  },
  {
    "name": "용인기흥 우방아이유쉘",
    "address": "용인시 기흥구 신갈동",
    "size": "59.96㎡",
    "price": "4억 2,700만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 준공, 10층, 학세권, 생활편의시설 인접"
  },
  {
    "name": "용인수지풍림2차",
    "address": "용인시 수지구 동천동",
    "size": "84.58㎡",
    "price": "5억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2002년 준공, 2층, 남동향, 대단지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
   {
    "name": "기흥역센트럴푸르지오",
    "address": "용인시 기흥구 구갈동",
    "size": "84.77㎡",
    "price": "8억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 준공, 38층, 역세권·학세권, 대단지, 생활편의시설 인접"
  }, 
  {
    "name": "진산마을 성원상떼빌",
    "address": "용인시 수지구 상현동",
    "size": "84㎡",
    "price": "6억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2004년 준공, 32평, 상현동 중심, 생활편의시설 인접"
  },
  {
      "name": "처인구 삼가동 신축 아파트",
      "address": "경기도 용인시 처인구 삼가동",
      "size": "102m² (31평)",
      "price": "8억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "역북역 예정, 대형마트 근접"
    }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "신촌마을포스홈타운1단지",
    "address": "용인시 기흥구 보정동",
    "size": "133.72㎡",
    "price": "10억 2,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2001년 준공, 18층, 대단지, 생활편의시설 인접"
  },
  {
      "name": "처인구 포곡읍 단독주택",
      "address": "경기도 용인시 처인구 포곡읍",
      "size": "145m² (44평)",
      "price": "12억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "에버랜드 인근, 대형 마트 차량 10분"
  },
  {
    "name": "삼성래미안이스트팰리스3단지",
    "address": "용인시 수지구 동천동",
    "size": "178.7㎡",
    "price": "15억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2011년 준공, 6층, 동천동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "성복역 롯데캐슬 골드타운",
    "address": "용인시 수지구 성복동",
    "size": "99.98㎡",
    "price": "16억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 준공, 29층, 성복동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "성동마을LG빌리지1차",
    "address": "용인시 수지구 성동동",
    "size": "244.66㎡",
    "price": "13억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1999년 준공, 4층, 대단지, 생활편의시설 인접"
  },
  {
      "name": "처인구 포곡읍 단지형 전원주택",
      "address": "경기도 용인시 처인구 포곡읍",
      "size": "200m² (60평)",
      "price": "16억 8,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "한택식물원 인근, 고급 타운하우스"
    }
  ]
},
"20억 이상": {
  "houses": [
  {
      "name": "처인구 모현읍 대형 저택",
      "address": "경기도 용인시 처인구 모현읍",
      "size": "280m² (85평)",
      "price": "25억",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "분당·강남 30분 거리, 정원 및 텃밭 포함"
    },
    {
      "name": "처인구 포곡읍 호화 전원주택",
      "address": "경기도 용인시 처인구 포곡읍",
      "size": "300m² (90평)",
      "price": "22억 7,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "독립형 구조, 골프장·온천 인접"
    },
    {
      "name": "처인구 이동읍 고급 타운하우스",
      "address": "경기도 용인시 처인구 이동읍",
      "size": "260m² (78평)",
      "price": "21억 5,000만원",
      "auction": "실제 법원경매정보 사이트에서 확인",
      "infra": "자연 속 대단지, 헬스장·커뮤니티 시설"
    }
  ]
}
},

"강원도":{
"~2억":{
  "houses": [
    {
      "name": "현대아파트",
      "address": "강원 홍천군 홍천읍 연봉리",
      "size": "84㎡",
      "price": "1억 9,000만원 (24.10.03, 13층)",
      "infra": "2024년 10월 실거래, 연봉리 중심, 생활편의시설 인접[34][35]"
    },
    {
      "name": "횡성코아루센트럴퍼스트",
      "address": "강원 횡성군 횡성읍",
      "size": "60㎡",
      "price": "1억 9,000만원 (2024년 실거래, 2018년 준공)",
      "infra": "횡성읍 중심, 생활편의시설 인접[41][43]"
    },
    {
      "name": "강산횡계",
      "address": "강원 평창군 대관령면 횡계리",
      "size": "91.05㎡",
      "price": "1억 7,000만원(2024.05, 9층)",
      "infra": "구축, 대관령면 중심, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "더샵원주센트럴파크3단지",
      "address": "강원 원주시 명륜동",
      "size": "84.98㎡",
      "price": "4억 8,000만원 (24.11.23, 14층)",
      "infra": "신축, 대단지, 생활편의시설 인접"
    },
    {
      "name": "코아루에듀타운",
      "address": "강원 영월군 영월읍 영흥리 1137",
      "size": "84.4㎡",
      "price": "3억 500만원(2024.10.27, 17층)",
      "infra": "신축, 중심지, 생활편의시설 인접"
    },
    {
      "name": "미소빌",
      "address": "강원 정선군 정선읍 북실리 746-6",
      "size": "59.7㎡",
      "price": "1억 1,900만원(2024.04.14, 4층)",
      "infra": "정선읍 중심, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "e편한세상영랑호",
      "address": "강원 속초시 동명동 596",
      "size": "114.78㎡",
      "price": "6억 3,000만원 (24.09.28, 22층)",
      "infra": "2024년 9월 실거래, 신축, 동명동 중심, 생활편의시설 인접"
    },
    {
      "name": "동계올림픽선수촌아파트(대형)",
      "address": "강원 평창군 대관령면 수하리 500",
      "size": "전용 84㎡",
      "price": "5.1억원(2024년 최근 1년 내 최고가)",
      "infra": "신축, 대관령면, 올림픽특화, 생활편의시설 인접"
    },
    {
      "name": "양양읍 단독주택",
      "address": "강원 양양군 양양읍",
      "price": "5.5억",
      "size": "면적 정보 없음",
      "infra": "올 리모델링 완료, 양양역 인근"
    }
  ]
},
"10억~15억": {
  "houses": [
    {
      "name": "초당옥 인근 단독주택",
      "address": "강릉시 초당동",
      "price": "10억",
      "size": "178㎡",
      "infra": "남향, 2층, 10년 이내 건축"
    },
    {
      "name": "손양면 가평리 주택",
      "address": "강원 양양군 손양면 가평리",
      "price": "10억",
      "size": "면적 정보 없음",
      "infra": "주차 6대 가능, 심야전기 난방"
    },
    {
      "name": "서면 갈천리 전원주택",
      "address": "강원 양양군 서면 갈천리",
      "price": "10억",
      "size": "건물면적 58.32㎡",
      "infra": "계곡 인근, 전원주택"
    }
  ]
},
"15억~20억": {
  "houses": [
    {
      "name": "양양읍 고급 단독주택",
      "address": "강원 양양군 양양읍",
      "price": "15억",
      "size": "면적 정보 없음",
      "infra": "고급 단독주택, 바다 전망"
    },
    {
      "name": "현북면 고급 전원주택",
      "address": "강원 양양군 현북면",
      "price": "16억",
      "size": "면적 정보 없음",
      "infra": "고급 전원주택, 산 전망"
    },
    {
      "name": "양양읍 고급 전원주택",
      "address": "강원 양양군 양양읍",
      "price": "17억",
      "size": "면적 정보 없음",
      "infra": "고급 전원주택, 바다 전망"
    }
  ]
},
"20억 이상": {
  "houses": [
  {
      "name": "현남면 고급 단독주택",
      "address": "강원 양양군 현남면",
      "price": "100억",
      "size": "연면적 471.76㎡",
      "infra": "고급 별장, 바다 전망"
    },
    {
      "name": "현북면 고급 별장",
      "address": "강원 양양군 현북면",
      "price": "120억",
      "size": "면적 정보 없음",
      "infra": "고급 별장, 산 전망"
    },
    {
      "name": "양양읍 고급 별장",
      "address": "강원 양양군 양양읍",
      "price": "150억",
      "size": "면적 정보 없음",
      "infra": "고급 별장, 바다 전망"
    }
  ]
}
},

"충청북도":{
"~2억":{
  "houses": [
     {
    "name": "율량동 소형 아파트",
    "address": "충북 청주시 청원구 율량동",
    "size": "59m² (18평)",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "율량동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
      "name": "영동 내지브로 아파트",
      "address": "충북 영동군 영동읍 계산리 85",
      "size": "84.9㎡",
      "price": "1억 9,600만원",
      "infra": "2층, 24.05.17 실거래, 32세대, 생활편의시설 인접"
    },
    {
      "name": "부강아파트",
      "address": "충북 단양군 단양읍",
      "size": "59.46㎡",
      "price": "1억 3,000만원",
      "infra": "6층, 25년 3월 실거래, 26년차, 생활편의시설 인접"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "신성단양미소지움(대형)",
      "address": "충북 단양군 단양읍 별곡리",
      "size": "85㎡",
      "price": "2억 4,000만원",
      "infra": "11년차, 33평, 저층, 생활편의시설 인접"
    },
    {
      "name": "크리스탈타워",
      "address": "충북 영동군 영동읍",
      "size": "83㎡",
      "price": "2억 4,000만원",
      "infra": "2년차, 33평, 저층, 생활편의시설 인접"
    },
    {
      "name": "충북혁신도시 영무예다음3차",
      "address": "충북 음성군 맹동면",
      "size": "85㎡",
      "price": "2억 7,000만원",
      "infra": "1년차, 33평, 저층, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "연수동 대단지 아파트",
    "address": "충북 충주시 연수동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "연수동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "교현동 대단지 아파트",
    "address": "충북 충주시 교현동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "교현동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "가경동 대단지 아파트",
    "address": "충북 청주시 흥덕구 가경동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "가경동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [
  
  ]
}
},

"충청북도 청주시":{
"~2억":{
  "houses": [
    {
            "name": "청주 더하우스 아파트",
            "address": "청주시 상당구 금천동",
            "size": "45㎡",
            "price": "1억 7,500만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2006년 준공, 4층, 30세대, 금천동 중심지, 교통 및 생활편의시설 인접"
        },
        {
    "name": "모충동 소형 빌라",
    "address": "충북 청주시 서원구 모충동",
    "size": "약 39m² (12평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "모충동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
{
    "name": "내덕동 소형 빌라",
    "address": "충북 청주시 청원구 내덕동",
    "size": "약 39m² (12평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "내덕동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
            "name": "청주 유림타운 아파트",
            "address": "청주시 상당구 대소동",
            "size": "85㎡",
            "price": "3억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2014년 준공, 8층, 60세대, 대소역 인근, 교통 및 생활편의시설 인접"
        },
        {
    "name": "분평동 신축 아파트",
    "address": "충북 청주시 서원구 분평동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "분평동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
{
    "name": "내덕동 신축 빌라",
    "address": "충북 청주시 청원구 내덕동",
    "size": "약 59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "내덕동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
            "name": "청주 파크뷰 아파트",
            "address": "청주시 상당구 괴정동",
            "size": "100㎡",
            "price": "5억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2017년 준공, 12층, 100세대, 괴정역 인근, 교통 및 생활편의시설 인접"
        },
        {
    "name": "분평동 대단지 아파트",
    "address": "충북 청주시 서원구 분평동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "분평동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
{
    "name": "율량동 대단지 아파트",
    "address": "충북 청주시 청원구 율량동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "율량동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
            "name": "청주 프라임타운",
            "address": "청주시 상당구 산성동",
            "size": "130㎡",
            "price": "10억 5,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2020년 준공, 20층, 200세대, 산성동 중심지, 교통 및 생활편의시설 인접"
        }
  ]
},
"15억~20억": {
  "houses": [
    {
            "name": "청주 그랜드파크 아파트",
            "address": "청주시 상당구 중앙로",
            "size": "170㎡",
            "price": "17억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2024년 준공, 35층, 350세대, 중앙로 인근, 교통 및 생활편의시설 인접"
        }
  ]
},
"20억 이상": {
  "houses": [
  {
            "name": "청주 타워파크",
            "address": "청주시 상당구 산성동",
            "size": "220㎡",
            "price": "25억 0,000만원",
            "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
            "infra": "2028년 준공, 55층, 550세대, 산성동 중심지, 교통 및 생활편의시설 인접"
        }
  ]
}
},

"충청남도":{
"~2억":{
  "houses": [
    
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "읍내동 신축 아파트",
    "address": "충남 당진시 읍내동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "읍내동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
   {
    "name": "엄사면 신축 아파트",
    "address": "충남 계룡시 엄사면",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "엄사면 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [
  
  ]
}
},

"충청남도 천안시":{
"~2억":{
  "houses": [
    {
    "name": "청당동 단독주택",
    "address": "충남 천안시 동남구 청당동",
    "size": "약 40m² (12평)",
    "price": "2억 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "청당동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "두정동 소형 아파트",
    "address": "충남 천안시 서북구 두정동",
    "size": "59m² (18평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "두정동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "원성동 소형 빌라",
    "address": "충남 천안시 동남구 원성동",
    "size": "약 39m² (12평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "원성동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "원성동 신축 빌라",
    "address": "충남 천안시 동남구 원성동",
    "size": "약 59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "원성동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "청당동 신축 빌라",
    "address": "충남 천안시 동남구 청당동",
    "size": "약 59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "청당동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "두정동 신축 아파트",
    "address": "충남 천안시 서북구 두정동",
    "size": "84m² (25평)",
    "price": "3억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "두정동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "원성동 대단지 아파트",
    "address": "충남 천안시 동남구 원성동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "원성동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {
    "name": "청당동 대단지 아파트",
    "address": "충남 천안시 동남구 청당동",
    "size": "110m² (33평)",
    "price": "6억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "청당동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "성정동 대단지 아파트",
    "address": "충남 천안시 서북구 성정동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "성정동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [
  
  ]
}
},

"경상북도":{
"~2억":{
  "houses": [
    {
      "name": "봉화주공",
      "address": "경북 봉화군 봉화읍",
      "size": "59.99㎡",
      "price": "1억 2,000만원(2024년 실거래, 5층)",
      "infra": "봉화읍 중심, 생활편의시설 인접"
    },
    {
      "name": "우방신천지아파트",
      "address": "경북 칠곡군 석적읍 남율리 710",
      "size": "99.89㎡",
      "price": "1억 7,600만원(2025.01.18, 19층)",
      "infra": "20층, 2002년 준공, 석적읍 중심"
    },
    {
      "name": "고령디오팰리스",
      "address": "경북 고령군 대가야읍 쾌빈리 6-1",
      "size": "59.8㎡",
      "price": "8,500만원(2024.05.22, 5층)",
      "infra": "15층, 2007년 준공, 대가야읍 중심"
    }
  ]
},
"2억~5억": {
  "houses": [
    {
      "name": "울릉읍 도동리 소형주택(중복)",
      "address": "경북 울릉군 울릉읍 도동리",
      "size": "대지 56㎡, 건물 48.18㎡",
      "price": "2억 3,000만원(2층, 1976년 사용승인, 즉시입주)"
    },
    {
      "name": "봉화삼성(대형)",
      "address": "경북 봉화군 봉화읍",
      "size": "84.99㎡",
      "price": "2억 6,000만원(2024년 실거래, 12층)",
      "infra": "봉화읍 중심, 생활편의시설 인접"
    },
    {
      "name": "예천e편한세상",
      "address": "경북 예천군 예천읍",
      "size": "84.99㎡",
      "price": "2억 4,000만원(2024년 실거래, 12층)",
      "infra": "예천읍 중심, 신축, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "울릉 하늘채 더퍼스트(분양권)",
      "address": "경북 울릉군 울릉읍 저동",
      "size": "59㎡",
      "price": "5억 2,900만원~5억 4,600만원(2024년 분양가, 2027년 입주 예정)"
    },
    {
      "name": "청도군 매전면 전원주택",
      "address": "경북 청도군 매전면 남양리",
      "size": "537㎡(약 162평)",
      "price": "2억원",
      "infra": "2017년 준공, 방2, 욕실2, 대지 넓음, 전원환경"
    },
    {
    "name": "옥산동 대단지 아파트",
    "address": "경북 경산시 옥산동",
    "size": "110m² (33평) 이상",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "옥산동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [
  
  ]
}
},

"경상북도 포항시":{
"~2억":{
  "houses": [
    {
    "name": "양덕동 소형 아파트",
    "address": "경북 포항시 북구 양덕동",
    "size": "59m² (18평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "양덕동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "장성동 소형 빌라",
    "address": "경북 포항시 북구 장성동",
    "size": "36m² (11평)",
    "price": "1억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "장성동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  },
  {
    "name": "상도동 소형 빌라",
    "address": "경북 포항시 남구 상도동",
    "size": "36m² (11평)",
    "price": "1억 8,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상도동 중심, 버스 다수, 대형마트 차량 10분, 공원 인근"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "양덕동 신축 아파트",
    "address": "경북 포항시 북구 양덕동",
    "size": "84m² (25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "양덕동 중심, 버스 다수, 대형마트 차량 10분, 학군 인접"
  },
  {
    "name": "상도동 신축 빌라",
    "address": "경북 포항시 남구 상도동",
    "size": "59m² (18평)",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상도동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "송도동 신축 빌라",
    "address": "경북 포항시 남구 송도동",
    "size": "59m² (18평)",
    "price": "4억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "송도동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "양덕동 대단지 아파트",
    "address": "경북 포항시 북구 양덕동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "양덕동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  },
  {
    "name": "장성동 대단지 아파트",
    "address": "경북 포항시 북구 장성동",
    "size": "110m² (33평)",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "장성동 중심, 버스 다수, 대형마트 차량 15분, 생활편의시설 인접"
  },
  {

    "name": "대잠동 대단지 아파트",
    "address": "경북 포항시 남구 대잠동",
    "size": "110m² (33평)",
    "price": "7억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "대잠동 중심, 버스 다수, 대형마트 차량 10분, 학군 우수"
  }
  ]
},
"10억~15억": {
  "houses": [
    
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [
  
  ]
}
},

"경상남도":{
"~2억":{
  "houses": [
    {
    "name": "한주타운",
    "address": "경남 진주시 상봉동",
    "size": "74.95㎡",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1992년 입주, 3층, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "젤미마을부영아파트",
    "address": "경남 김해시 삼문동",
    "size": "59m² (18평)",
    "price": "1억 1,030만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "삼문동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "고현 나인스카이 아파트",
    "address": "경남 거제시 고현동",
    "size": "76.03㎡ (23평)",
    "price": "7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고현동 중심, 즉시입주 가능, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "양산 대방노블랜드 연리지(2차)",
    "address": "경남 양산시 물금읍 야리로 76",
    "size": "84.99m² (25평)",
    "price": "3억 5,850만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "물금신도시, 대단지, 증산초 도보 6분, 교통·생활편의시설 인접"
  },
  {
      "name": "함안 가야읍 전원주택",
      "address": "경남 함안군 가야읍",
      "size": "약 110㎡",
      "price": "4억 5,000만원",
      "infra": "전원주택단지 최상단 위치, 고급 전원주택"
    },
     {
      "name": "고성코아루더파크",
      "address": "경남 고성군 고성읍",
      "size": "84.97㎡",
      "price": "2억 7,000만원(2024년 실거래)",
      "infra": "신축, 대단지, 생활편의시설 인접"
    }
  ]
},
"5억~10억": {
  "houses": [
    {
      "name": "더센트럴캐슬",
      "address": "경남 거창군 거창읍 중앙리 212",
      "size": "162.24㎡",
      "price": "4억 8,800만원(2024.11.10, 5층)",
      "infra": "대형 평형, 신축, 읍내 중심[31]"
    },
    {
      "name": "거창코아루에듀시티2단지(대형)",
      "address": "경남 거창군 거창읍 대평리 1518",
      "size": "119.91㎡",
      "price": "4억 500만원(2024.09.07, 20층)",
      "infra": "신축, 대단지, 생활편의시설 인접[31]"
    }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "은아아파트",
    "address": "경남 창원시 의창구 신월동",
    "size": "134㎡ (약 51평)",
    "price": "7억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1988년 준공, 대형 평수, 생활편의시설 인접"
  },
  {
    "name": "대원 꿈에그린",
    "address": "경남 창원시 의창구 대원동",
    "size": "108㎡ (약 42평)",
    "price": "6억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 준공, 대단지, 생활편의시설 인접"
  },
  {
    "name": "창원중동유니시티3단지",
    "address": "경남 창원시 의창구 중동",
    "size": "85㎡ (약 33평)",
    "price": "7억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2019년 준공, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [
  {
    "name": "봉암동 바다조망 근린상가",
    "address": "경남 창원시 성산구 봉암동",
    "size": "대지 3,983㎡, 건물 20,106㎡",
    "price": "810억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "바다조망, 대형 근린상가, 대형 부지"
  },
  {
    "name": "창원산단 성산구 공장",
    "address": "경남 창원시 성산구",
    "size": "대지 3,300㎡, 건물 2,400㎡",
    "price": "275억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "산업단지 내 대형 공장, 교통 편리"
  },
  {
    "name": "창원공단 대형공장매매",
    "address": "경남 창원시 성산구",
    "size": "대지 28,000㎡, 건물 12,000㎡",
    "price": "290억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "공단 내 대형 공장, 대형 부지"
  }
  ]
}
},

"경상남도 창원시":{
"~2억":{
  "houses": [
    {
    "name": "자은동 단독주택",
    "address": "경남 창원시 진해구 자은동",
    "size": "대지 301㎡, 건물 59.6㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "자은동 중심, 관리비 없음, 입주 즉시 가능, 생활편의시설 인접"
  },
  {
    "name": "한효한마음코아 101동",
    "address": "경남 창원시 의창구 도계동",
    "size": "63/49㎡ (약 19평)",
    "price": "1억 2,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층/15층, 방2, 엘리베이터, 기본형, 수리 추천"
  },
  {
    "name": "서안양덕타운",
    "address": "경남 창원시 마산회원구 양덕동",
    "size": "59m² (18평)",
    "price": "1억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중층, 양덕초 인근, 팔용산공원 가까움, 교통·조망권 양호"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "이동 단독주택(올리모델링)",
    "address": "경남 창원시 진해구 이동",
    "size": "대지 119㎡, 건물 59㎡",
    "price": "2억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "올리모델링, 도로접, 붙박이장, 올수리, 생활편의시설 인접"
  },
  {
    "name": "감계지구 휴먼빌아파트",
    "address": "경남 창원시 의창구 북면 감계로",
    "size": "84㎡ (약 25평)",
    "price": "2억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "북면 감계지구, 신축, 생활편의시설 인접"
  },
  {
    "name": "마산한일타운2차",
    "address": "경남 창원시 마산회원구 양덕동",
    "size": "84m² (25평)",
    "price": "2억 1,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중층, 남동향, 리모델링, 관리 잘된 집, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "자은중흥에스-클래스",
    "address": "경남 창원시 진해구 자은동",
    "size": "전용 84.86㎡",
    "price": "4억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2017년 입주, 대단지, 고층, 생활편의시설 인접"
  },
  {
    "name": "용지더샵레이크파크",
    "address": "경남 창원시 의창구 용호동",
    "size": "85㎡ (약 33평)",
    "price": "8억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2017년 준공, 대단지, 교통·생활편의시설 인접"
  },
  {
    "name": "노블파크",
    "address": "경남 창원시 성산구 반림동",
    "size": "149㎡ (약 56평)",
    "price": "7억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층, 대단지, 반림동 중심, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "은아아파트",
    "address": "경남 창원시 의창구 신월동",
    "size": "134㎡ (약 51평)",
    "price": "7억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1988년 준공, 대형 평수, 생활편의시설 인접"
  },
  {
    "name": "대원 꿈에그린",
    "address": "경남 창원시 의창구 대원동",
    "size": "108㎡ (약 42평)",
    "price": "6억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2018년 준공, 대단지, 생활편의시설 인접"
  },
  {
    "name": "창원중동유니시티3단지",
    "address": "경남 창원시 의창구 중동",
    "size": "85㎡ (약 33평)",
    "price": "7억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2019년 준공, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    
  ]
},
"20억 이상": {
  "houses": [
  {
    "name": "봉암동 바다조망 근린상가",
    "address": "경남 창원시 성산구 봉암동",
    "size": "대지 3,983㎡, 건물 20,106㎡",
    "price": "810억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "바다조망, 대형 근린상가, 대형 부지"
  },
  {
    "name": "창원산단 성산구 공장",
    "address": "경남 창원시 성산구",
    "size": "대지 3,300㎡, 건물 2,400㎡",
    "price": "275억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "산업단지 내 대형 공장, 교통 편리"
  },
  {
    "name": "창원공단 대형공장매매",
    "address": "경남 창원시 성산구",
    "size": "대지 28,000㎡, 건물 12,000㎡",
    "price": "290억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "공단 내 대형 공장, 대형 부지"
  }
  ]
}
},

"제주특별자치도":{
"~2억":{
  "houses": [
    {
    "name": "외도1동 해마루풍경아파트",
    "address": "제주특별자치도 제주시 외도1동",
    "size": "72㎡ (약 22평)",
    "price": "2억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "로얄층, 시원한 전망, 상태 최상, 생활편의시설 인접"
  },
  {
    "name": "주공5차(동홍5차)",
    "address": "제주특별자치도 서귀포시 동홍동",
    "size": "49.87㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1999년 입주, 4층, 830세대, 동홍동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
  {
    "name": "주공4(동홍주공4)",
    "address": "제주특별자치도 서귀포시 동홍동",
    "size": "50.7㎡",
    "price": "1억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1994년 입주, 4층, 320세대, 동홍동 중심, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "영도센스빌아파트",
    "address": "제주특별자치도 제주시 이도이동",
    "size": "89㎡ (약 27평)",
    "price": "2억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "고층, 로얄층, 급매, 생활편의시설 인접"
  },
  {
    "name": "조양아파트",
    "address": "제주특별자치도 제주시 연동",
    "size": "98㎡ (약 29평)",
    "price": "2억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "중층, 9층, 신광사거리 버스정류소 앞, 부분리모델링"
  },
  {
    "name": "서강파인힐6차",
    "address": "제주특별자치도 서귀포시 서홍동",
    "size": "81.68㎡",
    "price": "3억 9,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 준공, 9층, 130세대, 서홍동 중심, 자연환경 우수, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "삼화부영사랑으로3차",
    "address": "제주특별자치도 제주시 삼양이동",
    "size": "84.36㎡ (약 25평)",
    "price": "5억 4,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "10층, 2013년 준공, 대단지, 생활편의시설 인접"
  },
  {
    "name": "삼화부영사랑으로5차",
    "address": "제주특별자치도 제주시 삼양이동",
    "size": "84.36㎡ (약 25평)",
    "price": "5억 3,900만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "6층, 2013년 준공, 대단지, 생활편의시설 인접"
  },
  {
    "name": "강정지구중흥S클래스",
    "address": "제주특별자치도 서귀포시 강정동",
    "size": "84.92㎡",
    "price": "6억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2016년 입주, 7층, 525세대, 강정동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "연동 신축 아파트(국민평형)",
    "address": "제주특별자치도 제주시 연동",
    "size": "85㎡ (약 25평)",
    "price": "11억 7,980만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2023년 분양, 신축, 3.3㎡당 3,470만원, 생활편의시설 인접"
  },
  {
    "name": "노형동 신축 아파트",
    "address": "제주특별자치도 제주시 노형동",
    "size": "114㎡ (약 34평)",
    "price": "12억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "노형동 중심, 신축, 고층, 생활편의시설 인접"
  },
  {
    "name": "남원읍 토지",
    "address": "제주특별자치도 서귀포시 남원읍",
    "size": "4,449㎡",
    "price": "10억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남원읍, 대지 넓음, 투자·전원주택 개발용, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "남원읍 토지",
    "address": "제주특별자치도 서귀포시 남원읍",
    "size": "5,464㎡",
    "price": "13억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남원읍, 대지 넓음, 투자·전원주택 개발용, 생활편의시설 인접"
  },
  {
    "name": "남원읍 토지",
    "address": "제주특별자치도 서귀포시 남원읍",
    "size": "18,443㎡",
    "price": "17억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남원읍, 대지 넓음, 투자·전원주택 개발용, 생활편의시설 인접"
  },
  {
    "name": "남원읍 토지",
    "address": "제주특별자치도 서귀포시 남원읍",
    "size": "585㎡",
    "price": "19억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남원읍, 대지 넓음, 투자·전원주택 개발용, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
  {
    "name": "남원읍 토지",
    "address": "제주특별자치도 서귀포시 남원읍",
    "size": "4,996㎡",
    "price": "21억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남원읍, 대지 넓음, 투자·전원주택 개발용, 생활편의시설 인접"
  },
  {
    "name": "남원읍 토지",
    "address": "제주특별자치도 서귀포시 남원읍",
    "size": "13,894㎡",
    "price": "14억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남원읍, 대지 넓음, 투자·전원주택 개발용, 생활편의시설 인접"
  },
  {
    "name": "남원읍 토지",
    "address": "제주특별자치도 서귀포시 남원읍",
    "size": "7,213㎡",
    "price": "6억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "남원읍, 대지 넓음, 투자·전원주택 개발용, 생활편의시설 인접"
  }
  ]
}
},

"부산광역시":{
"~2억":{
  "houses": [
    {
    "name": "동산빌라",
    "address": "부산 금정구 남산동",
    "size": "111.45㎡ (34평)",
    "price": "2억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1990년 입주, 부산1호선 인근, 4층, 생활편의시설 인접"
  },
  {
    "name": "초량동 동일파크",
    "address": "부산시 동구 초량동",
    "size": "63㎡ (약 19평)",
    "price": "1억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1984년 입주, 초량동 중심, 생활편의시설 인접"
  },
  {
    "name": "네오스포아파트",
    "address": "부산진구 부전동 450",
    "size": "59.9㎡",
    "price": "1억 6,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "27층 대단지, 부전역 도보권, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "화명동 대우이안",
    "address": "부산시 북구 화명동",
    "size": "84.98㎡ (약 25평)",
    "price": "5억 1,000만원~5억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "화명동 중심, 2002년 준공, 989세대, 대단지, 생활편의시설 인접"
  },
  {
    "name": "코오롱아파트",
    "address": "부산시 사상구 엄궁동 680-1",
    "size": "108.22㎡ (약 33평)",
    "price": "2억 7,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1999년 입주, 1,158세대, 4층/22층, 최근 올수리, 생활편의시설 인접"
  },
  {
    "name": "사하한신더휴",
    "address": "부산시 사하구 괴정동",
    "size": "84.85㎡ (25평)",
    "price": "5억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "16층, 2020년 준공, 대단지, 부산1호선 인근, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "성원상떼빌아파트",
    "address": "부산시 사하구 다대동",
    "size": "134.96㎡ (41평)",
    "price": "5억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "6층, 1998년 준공, 대단지, 다대동 중심, 생활편의시설 인접"
  },
  {
    "name": "엄궁롯데캐슬리버",
    "address": "부산시 사상구 엄궁동 726",
    "size": "154.51㎡ (약 47평)",
    "price": "5억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 입주, 1,852세대, 중/29층, 올수리, 남향, 낙동강 조망, 생활편의시설 인접"
  },
{
    "name": "더샵센트럴스타아파트",
    "address": "부산진구 부전동 537-9",
    "size": "153.2㎡",
    "price": "9억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "39층, 2011년 입주, 대단지, 서면역 인접, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "대연롯데캐슬레전드",
    "address": "부산시 남구 대연동",
    "size": "121.97㎡",
    "price": "10억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "대연동 중심, 대단지, 26층, 생활편의시설 인접"
  },
  {
    "name": "롯데캐슬카이저",
    "address": "부산시 북구 화명동",
    "size": "171.77㎡ (약 52평)",
    "price": "12억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "화명동 중심, 2011년 준공, 35층, 초고층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "래미안 어반파크",
    "address": "부산진구 부암동",
    "size": "114.84㎡",
    "price": "11억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "20층, 2021년 입주, 대단지, 서면 도보권, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "더샵센텀파크1차",
    "address": "부산시 해운대구 재송동",
    "size": "151.91㎡ (약 46평)",
    "price": "15억~23억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2007년 입주, 42층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "트럼프월드센텀",
    "address": "부산시 해운대구 우동",
    "size": "108.51㎡ (약 33평)",
    "price": "21억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2011년 입주, 31층, 초고층, 바다조망, 생활편의시설 인접"
  },
  {
    "name": "해운대현대하이페리온",
    "address": "부산시 해운대구 우동",
    "size": "217.21㎡ (약 66평)",
    "price": "19억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2011년 입주, 7층, 초고층, 바다조망, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
  {
    "name": "W아파트",
    "address": "부산시 남구",
    "size": "180.73㎡",
    "price": "36억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "49층, 초고층, 남구 최고가, 바다조망, 생활편의시설 인접"
  },
  {
    "name": "해운대두산위브더제니스(펜트하우스)",
    "address": "부산시 해운대구 우동",
    "size": "222.6㎡ (약 67평)",
    "price": "48억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2011년 입주, 78층, 초고층, 파노라마 오션뷰, 최고급 단지"
  },
  {
    "name": "해운대아이파크(펜트하우스)",
    "address": "부산시 해운대구 우동",
    "size": "205.53㎡ (약 62평)",
    "price": "39억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2011년 입주, 71층, 초고층, 파노라마 오션뷰, 최고급 단지"
  }
  ]
}
},

"대구광역시":{
"~2억":{
  "houses": [
    {
    "name": "보성청록타운",
    "address": "대구 남구 대명동",
    "size": "59㎡ (약 18평)",
    "price": "1억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "46년차, 427세대, 대명동 중심, 버스 다수, 생활편의시설 인접"
  },
  {
    "name": "논공읍 소형 아파트",
    "address": "대구 달성군 논공읍",
    "size": "59m² (18평)",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "논공읍 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  },
   {
    "name": "청광아파트",
    "address": "대구 동구 신암동",
    "size": "76.5㎡ (약 23평)",
    "price": "1억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1995년 입주, 저층, 동구 신암동 중심, 버스 다수, 대형마트 차량 10분, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "이천뜨란채4단지아파트",
    "address": "대구 남구 이천동",
    "size": "84.93㎡ (약 25평)",
    "price": "3억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "3년차, 400세대, 이천동 중심, 버스 다수, 생활편의시설 인접"
  },
  {
    "name": "두산위브더제니스센트럴달서",
    "address": "대구 달서구 본리동 1234",
    "size": "84.99㎡",
    "price": "4억 9,390만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 준공, 23층, 본리동 중심, 대단지, 생활편의시설 인접"
  },{
    "name": "복현푸르지오",
    "address": "대구 북구 복현동",
    "size": "85㎡ (약 25평)",
    "price": "3억 7,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "준신축, 저층/15층, 시스템에어컨, 교통인프라 우수, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "대명역센트럴엘리프",
    "address": "대구 남구 대명동",
    "size": "114.71㎡ (약 35평)",
    "price": "6억 7,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신축, 대명동 중심, 버스 다수, 생활편의시설 인접"
  },
  {
    "name": "월성e편한세상",
    "address": "대구 달서구 월성동 536",
    "size": "182.96㎡",
    "price": "9억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2009년 준공, 11층, 월성동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "가창면 고급 전원주택",
    "address": "대구 달성군 가창면 냉천리",
    "size": "199.88㎡ (약 60평)",
    "price": "9억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "가창면 냉천리, 대지 367㎡, 2층 단독, 주차 1대, 태양광설비, 즉시입주 가능"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "대신 롯데캐슬",
    "address": "부산시 서구 서대신동3가",
    "size": "130㎡",
    "price": "6억 2,000만원~15억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2014년 준공, 대단지, 고층, 생활편의시설 인접"
  },
  {
    "name": "월성e편한세상(대형)",
    "address": "대구 달서구 월성동 536",
    "size": "182.96㎡",
    "price": "9억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2009년 준공, 11층, 월성동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "롯데캐슬그랜드(대형)",
    "address": "대구 달서구 용산동 230-10",
    "size": "169.89㎡",
    "price": "9억",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2004년 준공, 23층, 용산동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "대신 롯데캐슬(펜트하우스)",
    "address": "부산시 서구 서대신동3가",
    "size": "130㎡ 이상",
    "price": "15억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2014년 준공, 펜트하우스, 대단지, 고층, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
  {
    "name": "동대신동2가 대지 502㎡ 단독주택",
    "address": "부산시 서구 동대신동2가",
    "size": "대지 502.14㎡, 건물 191.71㎡",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2층, 주차장, 창고, 남향, 일부 리모델링 필요, 입주일 협의"
  },
  {
    "name": "부계면 팔공산자락 모텔+토지",
    "address": "대구 군위군 부계면",
    "size": "토지 1,062㎡(321평), 건물 849㎡(257평), 21객실",
    "price": "20억~30억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1998년 준공, 5층, 숙박시설, 팔공산·동산계곡 인접, 투자·사업용"
  }
  ]
}
},

"인천광역시":{
"~2억":{
  "houses": [
   {
    "name": "그랑드빌 아파트",
    "address": "인천 강화군 강화읍",
    "size": "60㎡ (약 23평)",
    "price": "1억 1,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "17년차, 저층, 강화읍 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "현대3차아파트",
    "address": "인천 계양구 효성동",
    "size": "84.96㎡",
    "price": "1억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1992년 입주, 15층, 인천1호선 인접, 생활편의시설 인접"
  },
  {
    "name": "만수주공7,8단지아파트",
    "address": "인천 남동구 만수동",
    "size": "39.6㎡ (약 12평)",
    "price": "1억 2,800만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "13층, 관리비 없음, 역세권, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
     {
    "name": "강화2차세광엔리치빌",
    "address": "인천 강화군 선원면",
    "size": "104㎡ (약 41평)",
    "price": "2억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "14년차, 중층, 선원면 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "계양산파크트루엘",
    "address": "인천 계양구 계산동",
    "size": "59.99㎡",
    "price": "3억 7,700만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 입주, 6층, 신축, 역세권, 생활편의시설 인접"
  },
  {
    "name": "송현주공솔빛마을(154) 2차(중형)",
    "address": "인천 동구 송현동",
    "size": "80㎡ (약 31평)",
    "price": "2억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2003년 준공, 15년차, 저층, 송현동 중심, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "계양 하늘채 파크포레",
    "address": "인천 계양구 방축동",
    "size": "85㎡",
    "price": "7억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "신축, 13층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "송림동 참좋은집",
    "address": "인천 동구 송림동",
    "size": "80㎡ (약 24평)",
    "price": "5억~6억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2015년 준공, 10층, 신축, 송림동 중심, 생활편의시설 인접"
  },
  {
    "name": "인천가좌 두산위브 트레지움",
    "address": "인천 서구 가좌동",
    "size": "84.3㎡ (약 25평)",
    "price": "5억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 거래, 22층, 신축, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "쌍용더플래티넘부평",
    "address": "인천 부평구 산곡동",
    "size": "119.9㎡ (약 36평)",
    "price": "10억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2022년 입주, 18층, 7호선, 대단지, 생활편의시설 인접"
  },
  {
    "name": "우미린스트라우스",
    "address": "인천 서구 청라동",
    "size": "125.07㎡ (약 38평)",
    "price": "10억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 거래, 19층, 신축, 대단지, 생활편의시설 인접"
  },
  {
    "name": "센트럴파크푸르지오",
    "address": "인천 연수구 송도동",
    "size": "96.5㎡ (약 29평)",
    "price": "14억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 준공, 13층, 송도동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "상가주택(송림로)",
    "address": "인천 미추홀구 송림로 257번길",
    "size": "260㎡ 대지, 630㎡ 연면적",
    "price": "15억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "상가+주택, 지상4층, 대로변, 생활편의시설 인접"
  },
  {
    "name": "청라푸르지오",
    "address": "인천 서구 청라동",
    "size": "139.5㎡ (약 42평)",
    "price": "15억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 거래, 52층, 초고층, 신축, 대단지, 생활편의시설 인접"
  },
  {
    "name": "더샵퍼스트월드",
    "address": "인천 연수구 송도동",
    "size": "172.6㎡ (약 52평)",
    "price": "16억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2010년 준공, 48층, 송도동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
   {
    "name": "자이하버뷰2단지",
    "address": "인천 연수구 송도동",
    "size": "243.4㎡ (약 74평)",
    "price": "24억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2017년 준공, 4층, 송도동 중심, 초고급 대단지, 생활편의시설 인접"
  },
  {
    "name": "더프라우주상복합3단지",
    "address": "인천 연수구 송도동",
    "size": "206.7㎡ (약 62평)",
    "price": "21억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2012년 준공, 19층, 송도동 중심, 초고급 대단지, 생활편의시설 인접"
  },
  {
    "name": "더샵송도센트럴파크3차",
    "address": "인천 연수구 송도동",
    "size": "119.8㎡ (약 36평)",
    "price": "20억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2014년 준공, 31층, 송도동 중심, 초고급 대단지, 생활편의시설 인접"
  }
  ]
}
},

"광주광역시":{
"~2억":{
  "houses": [
    {
    "name": "운남주공7단지",
    "address": "광주 광산구 운남동",
    "size": "59.48㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2001년 입주, 1,698세대, 7층, 교통·생활편의시설 인접"
  },
  {
    "name": "신우아파트",
    "address": "광주 남구 월산동",
    "size": "77.68㎡",
    "price": "1억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1978년 입주, 4층, 월산동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "지산동 소형 아파트",
    "address": "광주 동구 지산동",
    "size": "61㎡ (18평)",
    "price": "2억원 이하",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "20년차 내외, 저층, 지산동 중심, 생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "임곡동 전원주택",
    "address": "광주 광산구 임곡동",
    "size": "99㎡",
    "price": "2억 3,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "임곡동, 전원주택/농가, 방3, 생활편의시설 인접"
  },
  {
    "name": "제석산호반힐하임",
    "address": "광주 남구 주월동",
    "size": "84.93㎡",
    "price": "4억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2019년 입주, 16층, 주월동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "월남호반베르디움 2차",
    "address": "광주 동구 월남동",
    "size": "59㎡ (18평, 실평수 25.8평)",
    "price": "2억 3,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "8층, 2017년 입주, 월남동 중심, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "수완진아리채2차아파트",
    "address": "광주 광산구 수완동",
    "size": "108.66㎡",
    "price": "8억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2013년 입주, 15층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "주월동 골드클래스 어반시티",
    "address": "광주 남구 주월동",
    "size": "84.97㎡",
    "price": "5억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 입주, 15층, 주월동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "광주그랜드센트럴",
    "address": "광주 동구 계림동",
    "size": "119.93㎡ (36평)",
    "price": "7억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "3층, 2020년 입주, 계림동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "수완코오롱하늘채(대형)",
    "address": "광주 광산구 장덕동",
    "size": "154.15㎡",
    "price": "10억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2012년 입주, 24층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "무등산 아이파크(대형)",
    "address": "광주 동구 학동",
    "size": "117.98㎡ (36평)",
    "price": "10억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "22층, 2017년 입주, 학동 중심, 초고층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "무등산 아이파크(대형)",
    "address": "광주 동구 학동",
    "size": "117.98㎡ (36평)",
    "price": "10억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "22층, 2017년 입주, 학동 중심, 초고층, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "봉선동 쌍용스윗닷홈",
    "address": "광주 남구 봉선동",
    "size": "171㎡",
    "price": "17억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "15년차, 315세대, 2025년 기준, 대단지, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
  
  ]
}
},

"대전광역시":{
"~2억":{
  "houses": [
    {
    "name": "용운주공2단지",
    "address": "대전 동구 용운동",
    "size": "49.94㎡",
    "price": "1억 3,300만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1987년 입주, 3층, 학세권, 최근 3개월 88건 거래, 생활편의시설 인접"
  },
  {
    "name": "계룡아파트",
    "address": "대전 서구 가수원동 643",
    "size": "59.4㎡",
    "price": "1억 7,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1995년 입주, 12층, 대단지, 교통·생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "선비마을5단지",
    "address": "대전 대덕구 송촌동",
    "size": "59.96㎡",
    "price": "2억 3,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1999년 입주, 16층, 1,555세대, 송촌동 중심, 대단지, 생활편의시설 인접"
  },
  {
    "name": "대림한숲",
    "address": "대전 동구 용전동",
    "size": "114.75㎡",
    "price": "3억 5,500만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1999년 입주, 5층, 1,036세대, 19층, 생활편의시설 인접"
  },
  {
    "name": "한가람아파트",
    "address": "대전 서구 탄방동",
    "size": "39.6㎡",
    "price": "2억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1991년 입주, 8층, 대전1호선 인근, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "동일스위트리버스카이1단지",
    "address": "대전 대덕구 법동",
    "size": "84.98㎡",
    "price": "4억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 입주, 30층, 1,503세대, 신축, 대단지, 생활편의시설 인접"
  },
   {
    "name": "은어송마을2단지(코오롱하늘채)",
    "address": "대전 동구 대성동",
    "size": "103㎡",
    "price": "4억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2007년 입주, 40평, 대단지, 생활편의시설 인접"
  },
  {
    "name": "누리아파트",
    "address": "대전 서구 둔산동",
    "size": "126.45㎡",
    "price": "7억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2003년 입주, 13층, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "e편한세상둔산2단지",
    "address": "대전 서구 탄방동",
    "size": "103.78㎡",
    "price": "10억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2020년 입주, 6층, 대전1호선 인근, 대단지, 생활편의시설 인접"
  },
  {
    "name": "목련아파트",
    "address": "대전 서구 둔산동",
    "size": "134.88㎡",
    "price": "14억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1993년 입주, 6층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "영진햇님아파트",
    "address": "대전 서구 둔산동",
    "size": "127.56㎡",
    "price": "11억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1996년 입주, 14층, 대단지, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
  {
    "name": "크로바아파트",
    "address": "대전 서구 둔산동",
    "size": "164.95㎡",
    "price": "20억 4,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1992년 입주, 2층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "반석동 2층 단독주택",
    "address": "대전 유성구 반석동",
    "size": "대지 697㎡, 연면적 242.86㎡",
    "price": "19억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2층, 2012년 준공, 반석동 중심, 전원주택, 산·계곡 인접, 생활편의시설 인접"
  },
  {
    "name": "스마트시티 5단지 189㎡",
    "address": "대전 유성구 도룡동",
    "size": "189㎡",
    "price": "20억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 실거래, 도룡동 중심, 초고층, 대단지, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
  {
    "name": "크로바아파트",
    "address": "대전 서구 둔산동",
    "size": "164.95㎡",
    "price": "22억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1992년 입주, 4층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "스마트시티 5단지 205㎡",
    "address": "대전 유성구 도룡동",
    "size": "205㎡",
    "price": "27억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 실거래, 도룡동 중심, 초고층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "스마트시티 5단지 203㎡(펜트하우스)",
    "address": "대전 유성구 도룡동",
    "size": "203㎡",
    "price": "25억 9,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "23층, 2024년 10월 실거래, 도룡동 중심, 초고층, 펜트하우스, 생활편의시설 인접"
  }
  ]
}
},

"울산광역시":{
"~2억":{
  "houses": [
    {
    "name": "무거현대",
    "address": "울산 남구 무거동",
    "size": "84.96㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1995년 입주, 6층, 198세대, 무거동 중심, 교통·생활편의시설 인접"
  },
    {
    "name": "화정동명성블루빌3차",
    "address": "울산 동구 화정동",
    "size": "79.35㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2015년 입주, 9층, 화정동 중심, 교통·생활편의시설 인접"
  },
 {
    "name": "현대파크맨션",
    "address": "울산 북구 매곡동",
    "size": "84.96㎡",
    "price": "1억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1996년 입주, 6층, 443세대, 매곡동 중심, 교통·생활편의시설 인접"
  }
  ]
},
"2억~5억": {
  "houses": [
    {
    "name": "홍일유토피아",
    "address": "울산 남구 무거동",
    "size": "83.19㎡",
    "price": "2억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "1993년 입주, 7층, 무거동 중심, 교통·생활편의시설 인접"
  },
  {
    "name": "전하KCC스위첸아파트",
    "address": "울산 동구 전하동",
    "size": "77.97㎡",
    "price": "4억 6,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 9월 14일 거래, 17층, 전하동 중심, 신축, 교통·생활편의시설 인접"
  },
  {
    "name": "현대아이파크1단지",
    "address": "울산 북구 달천동",
    "size": "84.95㎡",
    "price": "4억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2008년 입주, 19층, 1,012세대, 달천동 중심, 대단지, 생활편의시설 인접"
  }
  ]
},
"5억~10억": {
  "houses": [
    {
    "name": "울산신정푸르지오",
    "address": "울산 남구 신정동",
    "size": "84㎡",
    "price": "5억 6,000만원~5억 8,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2012년 입주, 18층, 대단지, 생활편의시설 인접"
  },
  {
    "name": "울산지웰시티자이2단지",
    "address": "울산 동구 서부동",
    "size": "84.99㎡",
    "price": "5억 8,900만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2024년 11월 17일 거래, 30층, 신축, 대단지, 교통·생활편의시설 인접"
  },
  {
    "name": "송정지구반도유보라아이비파크",
    "address": "울산 북구 송정동",
    "size": "84.93㎡",
    "price": "5억 7,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 입주, 17층, 송정동 중심, 신축, 대단지, 생활편의시설 인접"
  }
  ]
},
"10억~15억": {
  "houses": [
    {
    "name": "울산옥동대공원한신휴플러스",
    "address": "울산 남구 옥동",
    "size": "122.01㎡",
    "price": "13억 5,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2011년 입주, 11층, 대단지, 옥동 중심, 생활편의시설 인접"
  },
  {
    "name": "청량읍 개곡리 전원주택",
    "address": "울산 울주군 청량읍 개곡리",
    "size": "155㎡ (대지 47평, 텃밭 82평)",
    "price": "2억 5,000만원~15억원(대형 전원주택)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "전원주택, 텃밭, 청량읍 중심, 생활편의시설 인접"
  },
  {
    "name": "청량읍 문죽리 전원주택",
    "address": "울산 울주군 청량읍 문죽리",
    "size": "413㎡ (132평)",
    "price": "3억 7,500만원~10억원(대형 전원주택)",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "전원주택, 남향, 시내권 10분, 태양광 설치, 생활편의시설 인접"
  }
  ]
},
"15억~20억": {
  "houses": [
    {
    "name": "대현동 수암로 상가주택",
    "address": "울산 남구 대현동",
    "size": "상가+주택(4층)",
    "price": "15억 2,000만원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "2021년 리모델링, 1~3층 상가, 4층 단독주택, 대로변 코너, 임대수익+거주, 홈플러스 도보 10분"
  },
  {
    "name": "청량읍 개곡리 대형 전원주택",
    "address": "울산 울주군 청량읍 개곡리",
    "size": "1,420㎡ (약 430평, 건물 49㎡)",
    "price": "15억원",
    "auction": "실제 법원경매정보 사이트에서 확인하러 가기",
    "infra": "전원/농가주택, 청량읍 중심, 생활편의시설 인접"
  }
  ]
},
"20억 이상": {
  "houses": [
  
  ]
}
}



}