import copy
import json

STAGES = ["요청", "낙찰", "공사중", "공사완료", "입금완료"]


def build_test_requests():
    return [
        {
            "id": "REQ-101",
            "category": "누수·방수",
            "title": "욕실 바닥 누수 긴급 보수",
            "location": "서울 송파구",
            "description": "욕실 바닥 틈새 누수와 실리콘 재시공이 필요합니다.",
            "budget": 380000,
            "dueDate": "2026-04-20",
            "requester": "박서연",
            "status": "요청",
            "customerConfirmed": False,
            "awardedBidId": None,
            "bids": [
                {"id": "BID-101-1", "workerName": "튼튼집수리", "workerPhone": "010-7741-8820", "amount": 340000, "note": "당일 방문 후 바로 방수 실리콘 작업 가능합니다."},
                {"id": "BID-101-2", "workerName": "맑은방수케어", "workerPhone": "010-5321-1184", "amount": 320000, "note": "누수 원인 점검 포함으로 진행합니다."},
                {"id": "BID-101-3", "workerName": "안심누수119", "workerPhone": "010-2477-6631", "amount": 360000, "note": "주말 작업 가능하며 1회 점검 포함입니다."},
            ],
        },
        {
            "id": "REQ-102",
            "category": "배관·설비",
            "title": "싱크대 배수관 교체",
            "location": "서울 마포구",
            "description": "싱크대 배수관 누수와 수전 흔들림 보수가 필요합니다.",
            "budget": 240000,
            "dueDate": "2026-04-21",
            "requester": "최유진",
            "status": "요청",
            "customerConfirmed": False,
            "awardedBidId": None,
            "bids": [
                {"id": "BID-102-1", "workerName": "공덕설비119", "workerPhone": "010-6618-7411", "amount": 190000, "note": "배수관과 수전 고정까지 한 번에 가능합니다."},
                {"id": "BID-102-2", "workerName": "맑은배관서비스", "workerPhone": "010-3412-8840", "amount": 175000, "note": "배수관 세척과 교체 동시 작업 가능합니다."},
                {"id": "BID-102-3", "workerName": "우리동네설비팀", "workerPhone": "010-7188-2403", "amount": 210000, "note": "자재 포함 기준입니다."},
            ],
        },
        {
            "id": "REQ-103",
            "category": "도배·도장",
            "title": "거실 벽지 교체 및 부분 도장",
            "location": "경기 성남시",
            "description": "거실 한쪽 벽지 교체와 문틀 부분 도장이 필요합니다.",
            "budget": 690000,
            "dueDate": "2026-04-24",
            "requester": "이정민",
            "status": "요청",
            "customerConfirmed": False,
            "awardedBidId": None,
            "bids": [
                {"id": "BID-103-1", "workerName": "분당도배라인", "workerPhone": "010-2209-1045", "amount": 650000, "note": "벽지와 문틀 도장 함께 진행합니다."},
                {"id": "BID-103-2", "workerName": "깔끔도장하우스", "workerPhone": "010-2214-6012", "amount": 620000, "note": "도배 후 부분 도장과 보양 정리 포함입니다."},
                {"id": "BID-103-3", "workerName": "하루도배팀", "workerPhone": "010-5528-4416", "amount": 640000, "note": "1일 시공 완료 기준입니다."},
            ],
        },
    ]


def choose_lowest_bid(request):
    lowest_bid = min(request["bids"], key=lambda bid: bid["amount"])
    request["awardedBidId"] = lowest_bid["id"]
    request["status"] = "낙찰"
    return lowest_bid


def move_to_stage(request, stage):
    current_index = STAGES.index(request["status"])
    next_index = STAGES.index(stage)
    assert next_index == current_index + 1, f"단계 순서 오류: {request['status']} -> {stage}"
    request["status"] = stage


def approve_by_requester(request):
    assert request["status"] == "공사완료", "공사완료 상태에서만 최종 승인이 가능합니다."
    request["customerConfirmed"] = True


def get_visible_requests(requests, role, name):
    if role == "requester":
        return [request for request in requests if request["requester"] == name]
    if role == "worker":
        return [
            request
            for request in requests
            if any(bid["workerName"] == name for bid in request["bids"])
        ]
    return requests


def get_visible_bids(request, role, name):
    if role == "worker":
        return [bid for bid in request["bids"] if bid["workerName"] == name]
    return request["bids"]


def validate_request_flow(request):
    assert request["budget"] > 0, "예산은 0보다 커야 합니다."
    assert len(request["bids"]) >= 2, "입찰은 최소 2개 이상이어야 테스트 의미가 있습니다."
    assert all(bid["amount"] <= request["budget"] for bid in request["bids"]), "입찰 금액이 예산을 초과했습니다."

    awarded = choose_lowest_bid(request)
    assert request["status"] == "낙찰", "낙찰 단계로 이동하지 못했습니다."
    assert awarded["amount"] == min(bid["amount"] for bid in request["bids"]), "최저가 낙찰이 아닙니다."

    move_to_stage(request, "공사중")
    assert request["status"] == "공사중", "공사중 단계 이동 실패"

    move_to_stage(request, "공사완료")
    assert request["status"] == "공사완료", "공사완료 단계 이동 실패"
    assert request["customerConfirmed"] is False, "공사완료 직후에는 요청자 승인이 없어야 합니다."

    approve_by_requester(request)
    assert request["customerConfirmed"] is True, "요청자 최종 승인 처리 실패"

    move_to_stage(request, "입금완료")
    assert request["status"] == "입금완료", "입금완료 단계 이동 실패"

    return {
        "request_id": request["id"],
        "category": request["category"],
        "requester": request["requester"],
        "awarded_worker": awarded["workerName"],
        "awarded_amount": awarded["amount"],
        "requester_approved": request["customerConfirmed"],
        "final_status": request["status"],
    }


def validate_personal_visibility(requests):
    requester_view = get_visible_requests(requests, "requester", "박서연")
    assert len(requester_view) == 1, "수리요청자는 자신의 요청만 봐야 합니다."
    assert requester_view[0]["requester"] == "박서연", "다른 수리요청자의 요청이 섞였습니다."

    worker_view = get_visible_requests(requests, "worker", "공덕설비119")
    assert len(worker_view) == 1, "공사작업자는 참여한 요청만 봐야 합니다."
    assert worker_view[0]["id"] == "REQ-102", "다른 요청이 작업자 화면에 노출되었습니다."

    worker_bids = get_visible_bids(worker_view[0], "worker", "공덕설비119")
    assert len(worker_bids) == 1, "공사작업자는 자신의 입찰만 봐야 합니다."
    assert worker_bids[0]["workerName"] == "공덕설비119", "다른 작업자 입찰이 노출되었습니다."


def main():
    requests = build_test_requests()
    results = []
    validate_personal_visibility(copy.deepcopy(requests))

    for index, request in enumerate(requests, start=1):
      result = validate_request_flow(copy.deepcopy(request))
      result["simulation_round"] = index
      results.append(result)

    print("집수리왕 절차 모의테스트 3회 결과")
    print("검증 순서: 요청 -> 입찰 -> 최저가 낙찰 -> 공사중 -> 공사완료 -> 요청자 최종 승인 -> 입금완료")
    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
