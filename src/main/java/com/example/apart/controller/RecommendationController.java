package com.example.apart.controller;

import com.example.apart.service.RecommendationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Collections;

@Controller
public class RecommendationController {

    private final RecommendationService recommendationService;

    @Value("${naver.client.id}")
    private String naverMapClientId;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping("/recommend")
    public String getRecommendations(@RequestParam Map<String, String> params, Model model) {
        String age = params.get("age");
        String hobby = params.get("hobby");
        String facility = params.getOrDefault("facility", "");
        String budget = params.get("budget");
        String housingType = params.get("housingType");
        String familyType = params.get("familyType");




        // 1. 예산 검증: 한글 단위 포함 여부
            if (budget == null || !budget.matches(".*[억천백만원].*")) {
                // 🔼 에러 메시지 추가
                model.addAttribute("errorMessage", "예산을 반드시 '10억 5천만원' 등 한글 단위로 입력해주세요!");
                
                // 2. 사용자가 입력한 값을 폼에 다시 표시
                model.addAttribute("age", age);
                model.addAttribute("hobby", hobby);
                model.addAttribute("facility", facility);
                model.addAttribute("budget", budget);
                model.addAttribute("housingType", housingType);
                model.addAttribute("familyType", familyType);
                
                // 3. 추천 결과는 보여주지 않음
                model.addAttribute("recommendations", Collections.emptyList());
                model.addAttribute("naverMapClientId", naverMapClientId);
                
                return "index"; // 폼 페이지로 리턴
            }







        System.out.println("📥 [요청 파라미터]");
        System.out.println("나이: " + age + ", 취미: " + hobby + ", 시설: " + facility + ", 예산: " + budget + ", 주거형태: " + housingType + ", 가족 형태: " + familyType);

        try {
            List<Map<String, Object>> recommendations = recommendationService.getRecommendations(
                age, hobby, facility, budget, housingType, familyType
            );

            System.out.println("📦 [최종 추천 결과 전달] " + recommendations.size() + "건");
            model.addAttribute("recommendations", recommendations);

        } catch (Exception e) {
            System.out.println("🔴 [AI 추천 실패] " + e.getMessage());
            model.addAttribute("errorMessage", "AI 응답을 연결할 수 없어요ㅠㅠ 대신 다른 결과를 보여드릴게요!");
            model.addAttribute("recommendations", recommendationService.getFallbackData());
        }

        // 입력값들도 model에 추가 : 결과페이지 제공 후에도, 입력값 유지            
        model.addAttribute("age", age);
        model.addAttribute("hobby", hobby);
        model.addAttribute("facility", facility);
        model.addAttribute("budget", budget);
        model.addAttribute("housingType", housingType);
        model.addAttribute("familyType", familyType);

        model.addAttribute("naverMapClientId", naverMapClientId);
        return "index";
    }

    @GetMapping("/")
    public String index() {
        return "index";
    }
}
