
package com.example.apart.service;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.*;
import java.util.*;
import java.util.regex.*;
import java.time.Duration;


@Service
public class RecommendationService {


    @Value("${huggingface.api.key}")
    private String apiKey;

    public List<Map<String, Object>> getRecommendations(String age, String hobby, String facility,
                                                        String budget, String housingType, String familyType) {


        String prompt = String.format("""
                나이: %s세, 취미: %s, 원하는 시설: %s, 예산: %s, 주거형태: %s, 가족 형태: %s인 가구
                위 조건에 가장 적합한, 대한민국 내 실제 존재하는 지역의 집 3개 추천해줘.
                그리고 매번 다른 집으로 추천해줘.

                아래 중요한 6가지 조건을 반드시 지켜줘:
                1. 아래 예시 형식과 항목 순서, 띄어쓰기, 줄바꿈을 반드시 지켜서 3개만 작성해줘.
                2. 아래 예시 외에 다른 설명, JSON, 번호, 불릿, 추가 문장 등은 절대 포함하지 마.
                3. 이름에는 '아이파크삼성'과 같이, 실제 아파트 브랜드명과 단지명을 구체적으로 작성해줘.
                4. 사용자가 요청한 %s에 맞는 주거형태로 추천해줘. 만약 사용자가 '주택'을 원했다면, 주택만 추천해야 돼.
                5. 예산은 반드시 %s 이하여야 해. 이 예산을 초과하는 매물은 추천하지 마. 주변시설은 3개까지만 답해줘.
                6. 위도/경도는 추천 집에 알맞는, 대한민국 실제 좌표로 생성해.
        
                예시:
                이름: 세종 새뜸마을 4단지
                주소: 세종특별자치시 새롬동 554
                크기: 전용 84㎡(34평)
                가격: 6억 7천만원
                경매 정보: 2025년 3월 18일 경매
                주변 시설: 피트니스 최고급 시설, 공원, 코스트코/이마트, 세종 충남대병원
                위도: 36.486551
                경도: 127.246473

                이런 형식으로 3개만, 줄바꿈으로 구분해서, 대한민국 집 3개를 추천해줘.
                """, age, hobby, facility, budget, housingType, familyType, housingType, budget);




                // 예시:
                // 이름: 세종 새뜸마을 4단지
                // 주소: 세종특별자치시 새롬동 554
                // 크기: 전용 84㎡(34평)
                // 가격: 6억 7천만원
                // 경매 정보: 2025년 3월 18일 경매
                // 주변 시설: 피트니스 최고급 시설, 공원, 코스트코/이마트, 세종 충남대병원
                // 위도: 36.486551
                // 경도: 127.246473

                // 예시:
                // 이름: 해운대 아이파크
                // 주소: 부산 해운대구 우동 1234
                // 크기: 전용 84㎡(34평)
                // 가격: 10억 5천만원
                // 경매 정보: 2025년 4월 8일 경매
                // 주변 시설: 해운대 해수욕장, 동백섬, 센텀시티
                // 위도: 35.157133
                // 경도: 129.142794



        // String prompt = String.format("""
        //         나이: %s세, 취미: %s, 원하는 시설: %s, 예산: %s, 주거형태: %s, 가족 형태: %s인 가구
        //         위 조건에 가장 잘 맞는 대한민국의 집 3곳을 추천해줘.

        //         아래 중요한 5가지 조건을 반드시 지켜줘:
        //         1. 아래 예시 형식과 항목 순서, 띄어쓰기, 줄바꿈을 반드시 지켜서 3개만 작성해줘.
        //         2. 아래 예시 외에 다른 설명, JSON, 번호, 불릿, 추가 문장 등은 절대 포함하지 마.
        //         3. 이름에는 '삼성동 아파트'와 같은 동네+건물유형이 아닌 '아이파크삼성'와 같은 실제 아파트 브랜드명과 단지명을 구체적으로 작성해줘.
        //         4. 주거형태는 사용자가 요청한 %s에 맞춰서 추천해줘. 사용자가 '주택'을 원했다면 아파트가 아닌 주택만 추천해야 돼.
        //         5. 예산은 반드시 %s 이하여야 해. 이 예산을 초과하는 매물은 추천하지 마. 주변시설은 3개까지만 답해줘.
        
        //         예시:
        //         이름: 해운대 아이파크
        //         주소: 부산 해운대구 우동 1234
        //         크기: 전용 84㎡(34평)
        //         가격: 10억 5천만원
        //         경매 정보: 2025년 4월 8일 경매
        //         주변 시설: 해운대 해수욕장, 동백섬, 센텀시티
        //         위도: 35.157133
        //         경도: 129.142794

        //         이런 형식으로 3개만, 줄바꿈으로 구분해서, 대한민국 집 3곳을 추천해줘.
        //         """, age, hobby, facility, budget, housingType, familyType, housingType, budget);

        try {
            System.out.println("🟡 [API 호출 준비]");
            System.out.println("📤 프롬프트:\n" + prompt);


            // 1. HttpClient 생성 & 연결 타임아웃 설정
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10)) // 연결 타임아웃 10초
                    .build();


            // JSON 바디 안전하게 생성
            // 1. 파라미터 객체 생성
            JSONObject parameters = new JSONObject();
            parameters.put("max_new_tokens", 500);
            
            // 2. 전체 바디 객체 생성
            JSONObject body = new JSONObject();
            body.put("inputs", prompt);
            body.put("parameters", parameters);
            
            // 3. 안전하게 직렬화
            String requestBody = body.toString();


            // HttpRequest 생성 & 요청 타임아웃 설정
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(90)) // 요청 타임아웃 90초
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();


            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("🟢 [API 응답 수신]");
            System.out.println("📥 응답 원문:\n" + response.body());

            List<Map<String, Object>> parsed = parseRecommendations(response.body(), budget);

            if (parsed.isEmpty()) {
                System.out.println("🟠 [파싱 실패] → 폴백 데이터 사용");
                return getFallbackData();
            }
            
            return parsed;

        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    private List<Map<String, Object>> parseRecommendations(String response, String budget) {
        List<Map<String, Object>> results = new ArrayList<>();
        long userBudget = parseKoreanMoney(budget); // 사용자 예산 변환
    
        try {

            // 1. 응답이 JSON 배열 형태인지 확인하고 파싱
            JSONArray arr = new JSONArray(response);
            if (arr.length() == 0) {
                System.out.println("⚠️ [추천 결과 없음] 응답 배열이 비어 있음");
                return results;
            }
            String text = arr.getJSONObject(0).optString("generated_text", "");
            if (text.isEmpty()) {
                System.out.println("⚠️ [추천 결과 없음] generated_text 필드 없음");
                return results;
            }


            


            // 2. 기존 파싱 로직에 text만 전달
            // "이름: "이 새 항목의 시작이므로 lookahead로 분리
            String[] items = text.split("(?=이름: )");
            int idx = 1;
            for (String item : items) {
                if (item.trim().isEmpty()) continue;
    
                Map<String, Object> map = new HashMap<>();
                try {
                    map.put("name", extractField(item, "이름: (.*?)\\n"));
                    map.put("address", extractField(item, "주소: (.*?)\\n"));
                    map.put("size", extractField(item, "크기: (.*?)\\n"));
                    map.put("price", extractField(item, "가격: (.*?)\\n"));
                    map.put("auction", extractField(item, "경매 정보: (.*?)\\n"));
                    map.put("facilities", extractField(item, "주변 시설: (.*?)\\n"));
    
                    String latStr = extractField(item, "위도: (.*?)\\n");
                    String lngStr = extractField(item, "경도: (.*?)\\n");
    
                    // 위도 처리
                    try {
                        if (latStr.matches(".*X.*")) {
                            System.out.println("⚠️ [위도 기본값 사용] 원본: " + latStr);
                            map.put("lat", 37.5665);
                        } else {
                            map.put("lat", Double.parseDouble(latStr));
                        }
                    } catch (Exception e) {
                        System.out.println("⚠️ [위도 변환 실패] idx=" + idx + " | 값: " + latStr + " | 원본: " + item);
                        map.put("lat", 37.5665);
                    }

                    // 경도 처리
                    try {
                        if (lngStr.matches(".*X.*")) {
                            System.out.println("⚠️ [경도 기본값 사용] 원본: " + lngStr);
                            map.put("lng", 126.9780);
                        } else {
                            map.put("lng", Double.parseDouble(lngStr));
                        }
                    } catch (Exception e) {
                        System.out.println("⚠️ [경도 변환 실패] idx=" + idx + " | 값: " + lngStr + " | 원본: " + item);
                        map.put("lng", 126.9780);
                    }

                    


                    // 필수 필드 체크
                    if (map.get("name") == null || map.get("address") == null ||
                        ((String)map.get("name")).isEmpty() || ((String)map.get("address")).isEmpty()) {
                        System.out.println("⚠️ [필수 필드 누락] idx=" + idx + " | 원본: " + item);
                        continue;
                    }
    


                    // 예산 비교: price(한글) → 숫자 변환 후 예산 이내만 추가
                    String priceStr = (String) map.get("price");
                    long price = parseKoreanMoney(priceStr);
                    if (price > 0 && price <= userBudget) {
                        results.add(map);
                    } else {
                        System.out.println("❌ [예산 초과] " + priceStr + " > " + budget);
                    }

                } catch (Exception e) {
                    System.out.println("🔴 [항목 파싱 중 오류] idx=" + idx + " | 원본: " + item);
                    e.printStackTrace();
                }
                idx++;
            }


    
            System.out.println("✅ [추천 결과 파싱 완료] 총 " + results.size() + "건");
            for (Map<String, Object> result : results) {
                System.out.println(result);
            } 
        } catch (Exception e) {
            System.out.println("🔴 [추천 결과 전체 파싱 중 오류]");
            e.printStackTrace();
        }
        return results;
    }



    // 한글 금액 → 숫자 변환
    public long parseKoreanMoney(String money) {
        if (money == null || money.isEmpty()) return 0;
        money = money.replaceAll("\\s+", ""); // 공백 제거
        
        // 숫자만 있는 경우
        if (money.matches("[0-9]+")) {
            try {
                return Long.parseLong(money);
            } catch (Exception e) {
                return 0;
            }
        }
        
        long total = 0;

        Pattern eok = Pattern.compile("([0-9]+)억");
        Pattern cheon = Pattern.compile("([0-9]+)천");
        Pattern baek = Pattern.compile("([0-9]+)백");
        Pattern man = Pattern.compile("([0-9]+)만");

        Matcher m = eok.matcher(money);
        if (m.find()) total += Long.parseLong(m.group(1)) * 100_000_000L;
        m = cheon.matcher(money);
        if (m.find()) total += Long.parseLong(m.group(1)) * 10_000_000L;
        m = baek.matcher(money);
        if (m.find()) total += Long.parseLong(m.group(1)) * 1_000_000L;
        m = man.matcher(money);
        if (m.find()) total += Long.parseLong(m.group(1)) * 10_000L;

        // "5천만원" 등 단독 케이스
        if (total == 0) {
            try {
                total = Long.parseLong(money.replaceAll("[^0-9]", ""));
            } catch (Exception ignore) {}
        }
        return total;
    }


    
    
    // 필드 추출 유틸 (없으면 빈 문자열 반환)
    private String extractField(String text, String regex) {
        Matcher m = Pattern.compile(regex, Pattern.MULTILINE).matcher(text);
        return m.find() ? m.group(1).trim() : "";
    }
    


    public List<Map<String, Object>> getFallbackData() {
        List<Map<String, Object>> fallback = new ArrayList<>();

        Map<String, Object> item1 = new HashMap<>();
        item1.put("name", "서초구 반포자이");
        item1.put("address", "서울 서초구 반포동 20");
        item1.put("size", "전용 84㎡");
        item1.put("price", "12억 5천만원");
        item1.put("auction", "없음");
        item1.put("facilities", "반포한강공원, 고속터미널역, 신세계백화점");
        item1.put("lat", 37.508401);
        item1.put("lng", 127.013900);

        Map<String, Object> item2 = new HashMap<>();
        item2.put("name", "해운대 아이파크");
        item2.put("address", "부산 해운대구 우동 1234");
        item2.put("size", "전용 102㎡");
        item2.put("price", "8억 9천만원");
        item2.put("auction", "2025년 12월 경매 예정");
        item2.put("facilities", "해운대 해수욕장, 동백섬, 센텀시티");
        item2.put("lat", 35.157133);
        item2.put("lng", 129.142794);

        Map<String, Object> item3 = new HashMap<>();
        item3.put("name", "분당 퍼스트파크");
        item3.put("address", "경기 성남시 분당구 서현동 567");
        item3.put("size", "전용 66㎡");
        item3.put("price", "6억 2천만원");
        item3.put("auction", "있음");
        item3.put("facilities", "이마트, 분당선 서현역, 카페거리");
        item3.put("lat", 37.3855);
        item3.put("lng", 127.1233);

        fallback.add(item1);
        fallback.add(item2);
        fallback.add(item3);

        return fallback;
    }
}

