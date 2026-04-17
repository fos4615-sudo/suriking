const REQUEST_STORAGE_KEY = "jipsuriwang-requests-v3";
const WORKER_STORAGE_KEY = "jipsuriwang-workers-v2";
const AUTH_STORAGE_KEY = "jipsuriwang-auth-v1";
const STAGES = ["요청", "낙찰", "공사중", "공사완료", "입금완료"];

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const CATEGORY_CONFIG = [
  { id: "누수·방수", icon: "💧" },
  { id: "전기·조명", icon: "⚡" },
  { id: "배관·설비", icon: "🔧" },
  { id: "도배·도장", icon: "🎨" },
  { id: "목공·바닥재", icon: "🪵" },
  { id: "냉난방·보일러", icon: "❄️" },
  { id: "창호·새시", icon: "🪟" },
  { id: "철거·리모델링", icon: "🏗️" }
];

const demoRequests = [
  {
    id: createId(),
    category: "누수·방수",
    title: "욕실 타일 보수 및 실리콘 교체",
    location: "서울 송파구 잠실동",
    description: "욕실 벽면 타일 일부가 들떠 있어 보수하고, 세면대 주변 실리콘도 다시 시공해야 합니다.",
    budget: 420000,
    dueDate: "2026-04-25",
    requester: "박서연",
    images: [],
    status: "낙찰",
    customerConfirmed: false,
    awardedBidId: null,
    bids: [
      { id: createId(), workerName: "강도윤 타일", workerPhone: "010-3345-2291", amount: 390000, note: "타일 보수 후 방수 실리콘까지 한 번에 마감합니다." },
      { id: createId(), workerName: "튼튼집수리", workerPhone: "010-7741-8820", amount: 360000, note: "1일 내 작업 가능하며 폐기물 정리 포함입니다." },
      { id: createId(), workerName: "송파홈케어", workerPhone: "010-5512-7784", amount: 405000, note: "욕실 부분 철거 없이 보수 위주로 신속 시공합니다." }
    ]
  },
  {
    id: createId(),
    category: "도배·도장",
    title: "거실 도배와 누수 흔적 보수",
    location: "경기 성남시 분당구",
    description: "천장 누수 흔적 보수 후 거실 전체 도배를 희망합니다. 주말 작업 가능 여부가 중요합니다.",
    budget: 780000,
    dueDate: "2026-04-30",
    requester: "이정민",
    images: [],
    status: "공사중",
    customerConfirmed: false,
    awardedBidId: null,
    bids: [
      { id: createId(), workerName: "도배마스터", workerPhone: "010-9352-4481", amount: 760000, note: "누수 흔적 퍼티 보수와 친환경 벽지 시공 포함입니다." },
      { id: createId(), workerName: "분당도배라인", workerPhone: "010-2209-1045", amount: 735000, note: "주말 양일 작업 가능하며 천장 프라이머 처리까지 진행합니다." },
      { id: createId(), workerName: "깔끔인테리어", workerPhone: "010-8167-9922", amount: 770000, note: "오염 방지 커버링과 폐자재 수거까지 포함합니다." }
    ]
  },
  {
    id: createId(),
    category: "배관·설비",
    title: "주방 싱크대 수전 교체와 배수 점검",
    location: "서울 마포구 공덕동",
    description: "기존 수전에서 물이 새고 배수 속도가 느려 수전 교체와 배수관 막힘 점검이 필요합니다.",
    budget: 230000,
    dueDate: "2026-04-22",
    requester: "최유진",
    images: [],
    status: "요청",
    customerConfirmed: false,
    awardedBidId: null,
    bids: [
      { id: createId(), workerName: "맑은배관서비스", workerPhone: "010-3412-8840", amount: 190000, note: "수전 자재 포함 가능하며 배수관 내시경 점검 가능합니다." },
      { id: createId(), workerName: "공덕설비119", workerPhone: "010-6618-7411", amount: 175000, note: "당일 방문 가능하고 간단한 배수관 세척 서비스 포함입니다." },
      { id: createId(), workerName: "마포홈리페어", workerPhone: "010-9013-2287", amount: 210000, note: "국산 수전 제품 기준 교체 및 누수 테스트까지 진행합니다." }
    ]
  },
  {
    id: createId(),
    category: "창호·새시",
    title: "방충망 교체와 창문 틈새 보수",
    location: "인천 연수구 송도동",
    description: "거실과 작은방 방충망이 찢어져 있어 교체하고, 창문 틈새 바람막이 보수도 함께 원합니다.",
    budget: 310000,
    dueDate: "2026-04-27",
    requester: "한지우",
    images: [],
    status: "공사완료",
    customerConfirmed: false,
    awardedBidId: null,
    bids: [
      { id: createId(), workerName: "송도창호케어", workerPhone: "010-1187-5460", amount: 280000, note: "미세방충망 교체와 틈새 실링 보강 작업을 함께 진행합니다." },
      { id: createId(), workerName: "연수구집닥터", workerPhone: "010-7315-6628", amount: 295000, note: "방충망 샘플 지참 후 현장 맞춤 시공 가능합니다." }
    ]
  },
  {
    id: createId(),
    category: "냉난방·보일러",
    title: "보일러 배관 점검 및 온수 불량 수리",
    location: "대전 유성구 봉명동",
    description: "온수 온도가 일정하지 않고 보일러 배관 쪽에서 소음이 있어 점검과 부분 수리가 필요합니다.",
    budget: 560000,
    dueDate: "2026-05-02",
    requester: "오현우",
    images: [],
    status: "입금완료",
    customerConfirmed: true,
    awardedBidId: null,
    bids: [
      { id: createId(), workerName: "유성보일러전문", workerPhone: "010-4991-3302", amount: 520000, note: "배관 에어빼기와 순환펌프 점검 포함, 부품 교체 시 추가 설명드립니다." },
      { id: createId(), workerName: "따뜻한집설비", workerPhone: "010-6577-1843", amount: 540000, note: "야간 긴급 점검 가능하며 온수 라인 테스트 장비 보유 중입니다." },
      { id: createId(), workerName: "대전홈닥터", workerPhone: "010-2874-9156", amount: 550000, note: "보일러 제조사별 수리 경험이 많고 작업 후 1주 추적 점검 가능합니다." }
    ]
  }
];

const demoWorkers = [
  {
    id: createId(),
    category: "누수·방수",
    name: "튼튼집수리",
    phone: "010-7741-8820",
    specialty: "욕실 보수, 타일, 실리콘",
    coverage: "서울 송파구, 강동구",
    intro: "소규모 욕실 보수와 방수 마감 작업을 빠르게 처리하는 현장 중심 작업팀입니다.",
    completedJobs: 128,
    performance: "욕실 타일·실리콘 보수 128건 완료",
    images: []
  },
  {
    id: createId(),
    category: "누수·방수",
    name: "맑은방수케어",
    phone: "010-5321-1184",
    specialty: "옥상 방수, 외벽 누수, 욕실 방수",
    coverage: "서울 강남구, 서초구",
    intro: "누수 원인 진단부터 방수 마감까지 단계별로 사진 보고를 제공하는 팀입니다.",
    completedJobs: 102,
    performance: "옥상·욕실 방수 102건 완료",
    images: []
  },
  {
    id: createId(),
    category: "누수·방수",
    name: "안심누수119",
    phone: "010-2477-6631",
    specialty: "천장 누수, 베란다 방수, 실리콘 보강",
    coverage: "인천, 부천, 김포",
    intro: "소형 누수 긴급출동과 생활방수 보수 공사를 빠르게 처리합니다.",
    completedJobs: 89,
    performance: "생활 누수 보수 89건 완료",
    images: []
  },
  {
    id: createId(),
    category: "전기·조명",
    name: "우리집전기맨",
    phone: "010-9042-7510",
    specialty: "조명 교체, 스위치, 콘센트 증설",
    coverage: "서울 중구, 성동구",
    intro: "가정집 전기 트러블과 조명 교체를 안전 기준에 맞춰 시공합니다.",
    completedJobs: 111,
    performance: "전기·조명 시공 111건 완료",
    images: []
  },
  {
    id: createId(),
    category: "전기·조명",
    name: "밝은조명서비스",
    phone: "010-6752-3304",
    specialty: "LED 조명, 레일등, 간접조명",
    coverage: "경기 고양시, 파주시",
    intro: "주거 공간 분위기에 맞는 조명 교체와 전기 점검을 함께 제공합니다.",
    completedJobs: 76,
    performance: "LED·조명 교체 76건 완료",
    images: []
  },
  {
    id: createId(),
    category: "전기·조명",
    name: "전기닥터24",
    phone: "010-4118-9026",
    specialty: "누전 점검, 차단기, 전등 불량 수리",
    coverage: "수원, 화성, 오산",
    intro: "누전과 전등 불량 등 긴급 전기 문제를 신속히 확인하는 작업자입니다.",
    completedJobs: 134,
    performance: "가정집 전기 점검 134건 완료",
    images: []
  },
  {
    id: createId(),
    category: "배관·설비",
    name: "공덕설비119",
    phone: "010-6618-7411",
    specialty: "배수관, 수전 교체, 배관 막힘 점검",
    coverage: "서울 마포구, 서대문구",
    intro: "소형 배관 설비와 수전 교체를 당일 대응 중심으로 처리합니다.",
    completedJobs: 83,
    performance: "수전·배수 설비 83건 완료",
    images: []
  },
  {
    id: createId(),
    category: "배관·설비",
    name: "맑은배관서비스",
    phone: "010-3412-8840",
    specialty: "싱크대 배수, 하수구 막힘, 수전 교체",
    coverage: "서울 마포구, 용산구",
    intro: "주방과 욕실 배수 문제를 진단 장비로 확인하고 자재 교체까지 진행합니다.",
    completedJobs: 97,
    performance: "배관·수전 수리 97건 완료",
    images: []
  },
  {
    id: createId(),
    category: "배관·설비",
    name: "우리동네설비팀",
    phone: "010-7188-2403",
    specialty: "변기, 세면대, 급수 배관 보수",
    coverage: "서울 노원구, 도봉구",
    intro: "생활 설비 전반을 빠르게 보수하고 간단한 부속 교체도 즉시 대응합니다.",
    completedJobs: 115,
    performance: "생활 설비 보수 115건 완료",
    images: []
  },
  {
    id: createId(),
    category: "도배·도장",
    name: "분당도배라인",
    phone: "010-2209-1045",
    specialty: "도배, 누수 흔적 보수, 천장 마감",
    coverage: "성남, 용인, 수원",
    intro: "거실 도배와 누수 흔적 복원에 강하고, 주말 공사 대응 경험이 많은 팀입니다.",
    completedJobs: 94,
    performance: "거실·천장 도배 94건 완료",
    images: []
  },
  {
    id: createId(),
    category: "도배·도장",
    name: "깔끔도장하우스",
    phone: "010-2214-6012",
    specialty: "벽지 교체, 방문 도장, 곰팡이 흔적 보수",
    coverage: "서울 은평구, 마포구",
    intro: "부분 도장과 거실 도배를 함께 진행하며 오염 방지 보양 작업에 강합니다.",
    completedJobs: 88,
    performance: "도배·도장 88건 완료",
    images: []
  },
  {
    id: createId(),
    category: "도배·도장",
    name: "하루도배팀",
    phone: "010-5528-4416",
    specialty: "소형 도배, 천장 벽지, 친환경 자재",
    coverage: "성남, 하남, 광주",
    intro: "1일 시공 위주의 신속 도배 작업으로 실거주 고객 만족도가 높은 팀입니다.",
    completedJobs: 63,
    performance: "소형 도배 63건 완료",
    images: []
  },
  {
    id: createId(),
    category: "목공·바닥재",
    name: "원목하우스팀",
    phone: "010-7144-1290",
    specialty: "걸레받이, 몰딩, 마루 보수",
    coverage: "서울 강서구, 양천구",
    intro: "부분 목공과 바닥재 마감 보수 작업을 섬세하게 진행합니다.",
    completedJobs: 84,
    performance: "목공·바닥재 84건 완료",
    images: []
  },
  {
    id: createId(),
    category: "목공·바닥재",
    name: "우리집목공소",
    phone: "010-2471-7814",
    specialty: "문틀 보수, 수납장 수리, 마루 소음",
    coverage: "성남, 하남, 송파",
    intro: "생활 목공 수리와 마루 소음 해결 경험이 풍부한 작업자입니다.",
    completedJobs: 69,
    performance: "생활 목공 69건 완료",
    images: []
  },
  {
    id: createId(),
    category: "목공·바닥재",
    name: "바닥재리페어",
    phone: "010-9305-6612",
    specialty: "장판, 강마루, 바닥 틈새 보수",
    coverage: "수원, 용인, 광교",
    intro: "바닥재 들뜸과 찍힘 보수를 중심으로 부분 교체 작업도 수행합니다.",
    completedJobs: 91,
    performance: "바닥재 보수 91건 완료",
    images: []
  },
  {
    id: createId(),
    category: "냉난방·보일러",
    name: "유성보일러전문",
    phone: "010-4991-3302",
    specialty: "보일러, 난방배관, 온수 불량 수리",
    coverage: "대전 유성구, 서구",
    intro: "보일러 배관 소음과 온수 불량 원인 진단에 특화된 설비 작업자입니다.",
    completedJobs: 176,
    performance: "보일러·난방 설비 176건 완료",
    images: []
  },
  {
    id: createId(),
    category: "냉난방·보일러",
    name: "따뜻한집설비",
    phone: "010-6577-1843",
    specialty: "온수 불량, 배관 세척, 보일러 점검",
    coverage: "대전 서구, 유성구",
    intro: "온수 라인 점검과 보일러 정기 관리 경험이 많은 난방 전문 작업자입니다.",
    completedJobs: 149,
    performance: "보일러 정비 149건 완료",
    images: []
  },
  {
    id: createId(),
    category: "냉난방·보일러",
    name: "한겨울보일러",
    phone: "010-8630-2294",
    specialty: "보일러 교체, 난방 불량, 배관 소음",
    coverage: "청주, 세종",
    intro: "노후 보일러 교체와 난방배관 소음 진단을 꼼꼼히 진행합니다.",
    completedJobs: 92,
    performance: "난방·보일러 92건 완료",
    images: []
  },
  {
    id: createId(),
    category: "창호·새시",
    name: "송도창호케어",
    phone: "010-1187-5460",
    specialty: "방충망, 새시, 틈새 보수",
    coverage: "인천 연수구, 남동구",
    intro: "방충망 교체와 창틀 단열 보강 작업을 꼼꼼하게 마감합니다.",
    completedJobs: 67,
    performance: "창호·방충망 67건 완료",
    images: []
  },
  {
    id: createId(),
    category: "창호·새시",
    name: "창문고침센터",
    phone: "010-6021-5518",
    specialty: "창문 틈새, 샷시 조정, 문풍지 보강",
    coverage: "인천 연수구, 미추홀구",
    intro: "창호 단열 성능을 높이는 보수 작업과 샷시 틀 교정을 함께 진행합니다.",
    completedJobs: 74,
    performance: "샷시·창호 보수 74건 완료",
    images: []
  },
  {
    id: createId(),
    category: "창호·새시",
    name: "미세방충망프로",
    phone: "010-8254-4039",
    specialty: "방충망 교체, 롤 방충망, 창틀 수리",
    coverage: "부천, 인천, 시흥",
    intro: "미세방충망 교체와 창틀 부속 교체를 깔끔하게 마무리합니다.",
    completedJobs: 58,
    performance: "방충망 교체 58건 완료",
    images: []
  },
  {
    id: createId(),
    category: "철거·리모델링",
    name: "바른철거리모델링",
    phone: "010-5104-9832",
    specialty: "부분 철거, 주방 리모델링, 욕실 개보수",
    coverage: "서울 관악구, 동작구",
    intro: "소규모 철거부터 리모델링 마감까지 일정 관리 중심으로 진행합니다.",
    completedJobs: 73,
    performance: "부분 철거·리모델링 73건 완료",
    images: []
  },
  {
    id: createId(),
    category: "철거·리모델링",
    name: "집새로공간",
    phone: "010-8422-3140",
    specialty: "상가 철거, 내부 구조 변경, 마감 공정",
    coverage: "서울 영등포구, 구로구",
    intro: "공정별 협업 경험이 많아 리모델링 일정 조율이 안정적인 팀입니다.",
    completedJobs: 66,
    performance: "리모델링 공정 66건 완료",
    images: []
  },
  {
    id: createId(),
    category: "철거·리모델링",
    name: "한번에리모델링",
    phone: "010-3619-2488",
    specialty: "부분 철거, 욕실 확장, 거실 리뉴얼",
    coverage: "용인, 성남, 수지",
    intro: "철거 후 후속 마감까지 연결되는 올인원 리모델링 대응이 가능합니다.",
    completedJobs: 82,
    performance: "주거 리모델링 82건 완료",
    images: []
  }
];

const demoAccounts = [
  { role: "requester", name: "김민수", loginId: "requester01", password: "1234" },
  { role: "requester", name: "박서연", loginId: "requester02", password: "1234" },
  { role: "worker", name: "튼튼집수리", loginId: "worker01", password: "1234" },
  { role: "worker", name: "공덕설비119", loginId: "worker02", password: "1234" }
];

demoRequests[0].awardedBidId = demoRequests[0].bids[1].id;
demoRequests[1].awardedBidId = demoRequests[1].bids[1].id;
demoRequests[3].awardedBidId = demoRequests[3].bids[0].id;
demoRequests[4].awardedBidId = demoRequests[4].bids[0].id;

const state = {
  requests: loadCollection(REQUEST_STORAGE_KEY, demoRequests),
  workers: loadCollection(WORKER_STORAGE_KEY, demoWorkers),
  home: {
    activeCategory: "누수·방수",
    selectedWorkerId: null,
    quickMessage: ""
  },
  auth: loadAuth()
};

const requestForm = document.querySelector("#requestForm");
const workerForm = document.querySelector("#workerForm");
const quickRequestForm = document.querySelector("#quickRequestForm");
const requestList = document.querySelector("#requestList");
const workerList = document.querySelector("#workerList");
const categoryMenu = document.querySelector("#categoryMenu");
const homeWorkerList = document.querySelector("#homeWorkerList");
const homeWorkerTitle = document.querySelector("#homeWorkerTitle");
const selectedWorkerSummary = document.querySelector("#selectedWorkerSummary");
const summaryCards = document.querySelector("#summaryCards");
const adminSummary = document.querySelector("#adminSummary");
const adminStatusList = document.querySelector("#adminStatusList");
const seedDemoBtn = document.querySelector("#seedDemoBtn");
const topNavMenu = document.querySelector("#topNavMenu");
const pageSections = document.querySelectorAll(".page-section");
const loginStatus = document.querySelector("#loginStatus");
const loginForm = document.querySelector("#loginForm");
const loginRoleTabs = document.querySelector("#loginRoleTabs");
const loginRole = document.querySelector("#loginRole");
const loginMessage = document.querySelector("#loginMessage");
const requestTemplate = document.querySelector("#requestCardTemplate");
const bidTemplate = document.querySelector("#bidItemTemplate");
const workerCardTemplate = document.querySelector("#workerCardTemplate");
const requestImagesInput = document.querySelector("#requestImagesInput");
const workerImagesInput = document.querySelector("#workerImagesInput");
const quickRequestImagesInput = document.querySelector("#quickRequestImagesInput");
const requestImagePreview = document.querySelector("#requestImagePreview");
const workerImagePreview = document.querySelector("#workerImagePreview");
const quickRequestImagePreview = document.querySelector("#quickRequestImagePreview");
const quickCategory = document.querySelector("#quickCategory");
const quickWorkerName = document.querySelector("#quickWorkerName");
const quickWorkerPhone = document.querySelector("#quickWorkerPhone");

requestForm.addEventListener("submit", handleCreateRequest);
workerForm.addEventListener("submit", handleCreateWorker);
quickRequestForm.addEventListener("submit", handleCreateQuickRequest);
loginForm.addEventListener("submit", handleLogin);
loginRoleTabs.addEventListener("click", handleRoleTabClick);
seedDemoBtn.addEventListener("click", resetDemoData);
topNavMenu.addEventListener("click", handleNavClick);
categoryMenu.addEventListener("click", handleCategoryClick);
homeWorkerList.addEventListener("click", handleHomeWorkerClick);
requestImagesInput.addEventListener("change", () => updateImagePreview(requestImagesInput, requestImagePreview));
workerImagesInput.addEventListener("change", () => updateImagePreview(workerImagesInput, workerImagePreview));
quickRequestImagesInput.addEventListener("change", () => updateImagePreview(quickRequestImagesInput, quickRequestImagePreview));

render();

function loadCollection(key, fallback) {
  const saved = localStorage.getItem(key);
  if (!saved) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return structuredClone(fallback);
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function saveAll() {
  localStorage.setItem(REQUEST_STORAGE_KEY, JSON.stringify(state.requests));
  localStorage.setItem(WORKER_STORAGE_KEY, JSON.stringify(state.workers));
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state.auth));
}

function loadAuth() {
  const saved = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!saved) {
    return { currentUser: null };
  }

  try {
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === "object" ? parsed : { currentUser: null };
  } catch {
    return { currentUser: null };
  }
}

function getCurrentUser() {
  return state.auth.currentUser;
}

function isRole(role) {
  return getCurrentUser()?.role === role;
}

function getVisibleRequests() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return state.requests;
  }

  if (currentUser.role === "requester") {
    return state.requests.filter((request) => request.requester === currentUser.name);
  }

  if (currentUser.role === "worker") {
    return state.requests.filter((request) =>
      request.bids.some((bid) => bid.workerName === currentUser.name)
    );
  }

  return state.requests;
}

function getVisibleWorkers() {
  const currentUser = getCurrentUser();
  if (currentUser?.role === "worker") {
    return state.workers.filter((worker) => worker.name === currentUser.name);
  }
  return state.workers;
}

function getVisibleBids(request) {
  const currentUser = getCurrentUser();
  if (currentUser?.role === "worker") {
    return request.bids.filter((bid) => bid.workerName === currentUser.name);
  }
  return request.bids;
}

function getAwardedBid(request) {
  return request.bids.find((bid) => bid.id === request.awardedBidId) || null;
}

function isRequesterOwner(request) {
  return isRole("requester") && request.requester === getCurrentUser().name;
}

function isWorkerParticipant(request) {
  return isRole("worker") && request.bids.some((bid) => bid.workerName === getCurrentUser().name);
}

function isAwardedWorker(request) {
  const awardedBid = getAwardedBid(request);
  return isRole("worker") && awardedBid?.workerName === getCurrentUser().name;
}

function canAccessPage(page) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return true;
  }

  if (currentUser.role === "requester") {
    return page !== "admin" && page !== "worker";
  }

  if (currentUser.role === "worker") {
    return page !== "admin" && page !== "requester";
  }

  return true;
}

function getDefaultPage() {
  if (isRole("requester")) {
    return "requester";
  }
  if (isRole("worker")) {
    return "worker";
  }
  return "home";
}

function getActivePage() {
  return document.querySelector(".page-section.is-active")?.dataset.page || "home";
}

function syncNavVisibility() {
  topNavMenu.querySelectorAll(".nav-button").forEach((button) => {
    const isVisible = canAccessPage(button.dataset.page);
    button.hidden = !isVisible;
  });
}

function syncRoleBasedForms() {
  const requesterInput = requestForm.querySelector('input[name="requester"]');
  const quickRequesterInput = quickRequestForm.querySelector('input[name="requester"]');
  const workerNameInput = workerForm.querySelector('input[name="name"]');
  const workerSubmitButton = workerForm.querySelector('button[type="submit"]');
  const quickSubmitButton = quickRequestForm.querySelector('button[type="submit"]');
  const currentUser = getCurrentUser();
  const workerProfile = isRole("worker") ? getVisibleWorkers()[0] : null;

  if (workerProfile) {
    state.home.activeCategory = workerProfile.category;
  }

  requesterInput.readOnly = isRole("requester");
  quickRequesterInput.readOnly = isRole("requester");
  workerNameInput.readOnly = isRole("worker");

  requesterInput.value = isRole("requester") ? currentUser.name : requesterInput.value;
  quickRequesterInput.value = isRole("requester") ? currentUser.name : quickRequesterInput.value;
  workerNameInput.value = isRole("worker") ? currentUser.name : workerNameInput.value;

  quickSubmitButton.disabled = isRole("worker");
  quickSubmitButton.textContent = isRole("worker") ? "작업자 로그인 상태에서는 바로 요청을 만들 수 없습니다" : "바로 요청 생성하기";
  workerSubmitButton.textContent = isRole("worker") ? "내 작업자 정보 저장하기" : "공사작업자 등록하기";
}

function ensureActivePageIsAllowed() {
  const activePage = getActivePage();
  if (!canAccessPage(activePage)) {
    setActivePage(getDefaultPage());
  }
}

function canCurrentUserSubmitBid(request) {
  if (request.status !== "요청" || request.awardedBidId) {
    return false;
  }

  const currentUser = getCurrentUser();
  if (!currentUser) {
    return true;
  }

  return currentUser.role === "worker";
}

function canCurrentUserAwardBid(request) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return true;
  }
  return currentUser.role === "requester" && request.requester === currentUser.name;
}

function canCurrentUserRunWorkflow(request) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return true;
  }

  if (request.status === "낙찰" || request.status === "공사중") {
    return currentUser.role === "worker" && isAwardedWorker(request);
  }

  if (request.status === "공사완료") {
    return currentUser.role === "requester" && request.requester === currentUser.name;
  }

  return currentUser.role === "requester" && request.requester === currentUser.name;
}

function getRoleScopedEmptyMessage(type) {
  if (type === "requests") {
    if (isRole("requester")) {
      return "현재 로그인한 수리요청자의 요청 내역이 아직 없습니다.";
    }
    if (isRole("worker")) {
      return "현재 로그인한 공사작업자가 참여한 요청 내역이 아직 없습니다.";
    }
    return "아직 등록된 수리 요청이 없습니다.";
  }

  if (type === "workers") {
    if (isRole("worker")) {
      return "현재 로그인한 공사작업자의 등록 정보가 아직 없습니다.";
    }
    return "아직 등록된 공사작업자가 없습니다.";
  }

  return "표시할 데이터가 없습니다.";
}

function resetDemoData() {
  state.requests = structuredClone(demoRequests);
  state.workers = structuredClone(demoWorkers);
  state.home.activeCategory = "누수·방수";
  state.home.selectedWorkerId = null;
  state.home.quickMessage = "";
  saveAll();
  requestForm.reset();
  workerForm.reset();
  quickRequestForm.reset();
  requestImagePreview.innerHTML = "";
  workerImagePreview.innerHTML = "";
  quickRequestImagePreview.innerHTML = "";
  render();
}

function handleRoleTabClick(event) {
  const button = event.target.closest(".role-tab");
  if (!button) {
    return;
  }

  loginRole.value = button.dataset.role;
  loginRoleTabs.querySelectorAll(".role-tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.role === button.dataset.role);
  });
}

function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const role = formData.get("role");
  const loginId = String(formData.get("loginId")).trim();
  const password = String(formData.get("password")).trim();

  const account = demoAccounts.find((item) =>
    item.role === role &&
    item.loginId === loginId &&
    item.password === password
  );

  if (!account) {
    loginMessage.className = "login-message is-error";
    loginMessage.textContent = "로그인 정보가 맞지 않습니다. 테스트 계정을 확인해 주세요.";
    return;
  }

  state.auth.currentUser = {
    role: account.role,
    loginId: account.loginId,
    name: account.name
  };
  saveAll();

  loginMessage.className = "login-message is-success";
  loginMessage.textContent = `${state.auth.currentUser.name}님이 ${account.role === "requester" ? "수리요청자" : "공사작업자"}로 로그인되었습니다.`;
  event.currentTarget.reset();
  loginRole.value = role;
  render();
  setActivePage(account.role === "requester" ? "requester" : "worker");
}

async function handleCreateRequest(event) {
  event.preventDefault();
  if (isRole("worker")) {
    return;
  }
  const formData = new FormData(event.currentTarget);
  const images = await readImagesFromInput(requestImagesInput);

  state.requests.unshift({
    id: createId(),
    category: formData.get("category") || "기타",
    title: formData.get("title").trim(),
    location: formData.get("location").trim(),
    description: formData.get("description").trim(),
    budget: Number(formData.get("budget")),
    dueDate: formData.get("dueDate"),
    requester: formData.get("requester").trim(),
    images,
    status: "요청",
    customerConfirmed: false,
    awardedBidId: null,
    bids: []
  });

  saveAll();
  event.currentTarget.reset();
  requestImagePreview.innerHTML = "";
  render();
}

async function handleCreateWorker(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const images = await readImagesFromInput(workerImagesInput);
  const currentUser = getCurrentUser();
  const workerName = isRole("worker") ? currentUser.name : formData.get("name").trim();
  const workerPayload = {
    id: createId(),
    category: formData.get("category"),
    name: workerName,
    phone: formData.get("phone").trim(),
    specialty: formData.get("specialty").trim(),
    coverage: formData.get("coverage").trim(),
    intro: formData.get("intro").trim(),
    completedJobs: Number(formData.get("completedJobs")),
    performance: formData.get("performance").trim(),
    images
  };
  const existingIndex = state.workers.findIndex((worker) => worker.name === workerName);

  if (existingIndex >= 0) {
    state.workers[existingIndex] = {
      ...state.workers[existingIndex],
      ...workerPayload,
      id: state.workers[existingIndex].id
    };
  } else {
    state.workers.unshift(workerPayload);
  }

  saveAll();
  event.currentTarget.reset();
  workerImagePreview.innerHTML = "";
  render();
}

async function handleCreateQuickRequest(event) {
  event.preventDefault();
  if (isRole("worker")) {
    return;
  }
  const selectedWorker = getSelectedWorker();
  if (!selectedWorker) {
    selectedWorkerSummary.textContent = "작업자를 먼저 선택해 주세요.";
    return;
  }

  const formData = new FormData(event.currentTarget);
  const images = await readImagesFromInput(quickRequestImagesInput);
  const agreedAmount = Number(formData.get("agreedAmount"));
  const bidId = createId();

  state.requests.unshift({
    id: createId(),
    category: formData.get("category"),
    title: formData.get("title").trim(),
    location: formData.get("location").trim(),
    description: formData.get("description").trim(),
    budget: Number(formData.get("desiredAmount")),
    dueDate: formData.get("dueDate"),
    requester: formData.get("requester").trim(),
    images,
    status: "낙찰",
    customerConfirmed: false,
    awardedBidId: bidId,
    bids: [
      {
        id: bidId,
        workerName: selectedWorker.name,
        workerPhone: selectedWorker.phone,
        amount: agreedAmount,
        note: formData.get("note").trim()
      }
    ]
  });

  saveAll();
  event.currentTarget.reset();
  quickRequestImagePreview.innerHTML = "";
  state.home.quickMessage = `${selectedWorker.name} 작업자에게 바로 요청이 등록되었고 합의 금액 ${formatCurrency(agreedAmount)}으로 낙찰 처리되었습니다.`;
  populateQuickRequestFields();
  setActivePage("market");
  render();
}

function render() {
  syncNavVisibility();
  renderLoginStatus();
  renderSummary();
  renderHomeCategories();
  renderHomeWorkers();
  renderAdminMenu();
  renderWorkers();
  renderRequests();
  syncRoleBasedForms();
  populateQuickRequestFields();
  ensureActivePageIsAllowed();
}

function renderLoginStatus() {
  const currentUser = state.auth.currentUser;
  if (!currentUser) {
    loginStatus.innerHTML = `
      <div class="login-badge">
        <strong>로그인 안됨</strong>
        <small>로그인 메뉴에서 수리요청자 또는 공사작업자로 로그인하세요.</small>
      </div>
    `;
    return;
  }

  loginStatus.innerHTML = `
    <div class="login-badge is-active">
      <strong>${currentUser.name}</strong>
      <small>${currentUser.role === "requester" ? "수리요청자" : "공사작업자"} · ${currentUser.loginId}</small>
      <button type="button" class="logout-button" id="logoutButton">로그아웃</button>
    </div>
  `;

  document.querySelector("#logoutButton").addEventListener("click", () => {
    state.auth.currentUser = null;
    saveAll();
    render();
    setActivePage("home");
  });
}

function handleNavClick(event) {
  const button = event.target.closest(".nav-button");
  if (!button) {
    return;
  }
  setActivePage(button.dataset.page);
}

function setActivePage(page) {
  const safePage = canAccessPage(page) ? page : getDefaultPage();
  topNavMenu.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.page === safePage);
  });
  pageSections.forEach((section) => {
    section.classList.toggle("is-active", section.dataset.page === safePage);
  });
}

function handleCategoryClick(event) {
  const button = event.target.closest(".category-card");
  if (!button) {
    return;
  }
  state.home.activeCategory = button.dataset.category;
  state.home.selectedWorkerId = null;
  state.home.quickMessage = "";
  renderHomeCategories();
  renderHomeWorkers();
  populateQuickRequestFields();
}

function handleHomeWorkerClick(event) {
  const button = event.target.closest(".supplier-card__select");
  if (!button) {
    return;
  }
  state.home.selectedWorkerId = button.dataset.workerId;
  state.home.quickMessage = "";
  renderHomeWorkers();
  populateQuickRequestFields();
  quickRequestForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderSummary() {
  const visibleRequests = getVisibleRequests();
  const awardedCount = visibleRequests.filter((item) => item.awardedBidId).length;
  const paidCount = visibleRequests.filter((item) => item.status === "입금완료").length;
  const totalBudget = visibleRequests.reduce((sum, item) => sum + item.budget, 0);
  const totalBids = visibleRequests.reduce((sum, item) => sum + getVisibleBids(item).length, 0);

  summaryCards.innerHTML = [
    { label: "등록된 요청", value: `${visibleRequests.length}건` },
    { label: "누적 입찰", value: `${totalBids}건` },
    { label: paidCount > 0 ? "입금 완료" : "낙찰 완료", value: `${paidCount > 0 ? paidCount : awardedCount}건` },
    { label: "등록 예산 합계", value: formatCurrency(totalBudget) }
  ].map((card) => `
    <div class="summary-card${card.label === "등록 예산 합계" ? " summary-card--budget" : ""}">
      <span>${card.label}</span>
      <strong>${card.value}</strong>
    </div>
  `).join("");
}

function renderHomeCategories() {
  categoryMenu.innerHTML = CATEGORY_CONFIG.map((category) => {
    const progressCount = getVisibleRequests().filter((request) => request.category === category.id && request.status !== "입금완료").length;
    const isActive = category.id === state.home.activeCategory;
    return `
      <button type="button" class="category-card${isActive ? " is-active" : ""}" data-category="${category.id}">
        <span class="category-card__icon">${category.icon}</span>
        <strong>${category.id}</strong>
        <small>▶ 진행 ${progressCount}건</small>
      </button>
    `;
  }).join("");
}

function renderHomeWorkers() {
  const workers = getVisibleWorkers().filter((worker) => worker.category === state.home.activeCategory);
  const activeCategory = CATEGORY_CONFIG.find((item) => item.id === state.home.activeCategory);
  homeWorkerTitle.textContent = activeCategory ? `${activeCategory.id} 공급자 리스트` : "공사작업자 리스트";

  if (!workers.length) {
    homeWorkerList.innerHTML = `<div class="empty-state">이 분야에 등록된 공급자가 아직 없습니다.</div>`;
    return;
  }

  homeWorkerList.innerHTML = workers.map((worker) => `
    <article class="supplier-card${worker.id === state.home.selectedWorkerId ? " is-active" : ""}">
      <div class="supplier-card__top">
        <div>
          <strong>${worker.name}</strong>
          <p>${worker.specialty}</p>
        </div>
        <span>${worker.completedJobs}건 완료</span>
      </div>
      <p class="supplier-card__meta">${worker.coverage} · ${worker.performance}</p>
      <button type="button" class="ghost-button supplier-card__select" data-worker-id="${worker.id}">
        ${worker.id === state.home.selectedWorkerId ? "선택 완료" : "바로 요청하기"}
      </button>
    </article>
  `).join("");
}

function populateQuickRequestFields() {
  const selectedWorker = getSelectedWorker();
  quickCategory.value = state.home.activeCategory || "";
  quickWorkerName.value = selectedWorker ? selectedWorker.name : "";
  quickWorkerPhone.value = selectedWorker ? selectedWorker.phone : "";

  if (isRole("worker")) {
    selectedWorkerSummary.className = "selected-worker-summary empty-state";
    selectedWorkerSummary.textContent = "공사작업자 로그인 상태에서는 작업자 선택만 확인할 수 있고 바로 요청 생성은 수리요청자만 가능합니다.";
    return;
  }

  if (!selectedWorker) {
    selectedWorkerSummary.className = "selected-worker-summary empty-state";
    selectedWorkerSummary.textContent = "왼쪽에서 분야와 작업자를 먼저 선택해 주세요.";
    return;
  }

  selectedWorkerSummary.className = "selected-worker-summary";
  selectedWorkerSummary.innerHTML = `
    <strong>${selectedWorker.name}</strong>
    <span>${selectedWorker.category} · ${selectedWorker.specialty}</span>
    <small>${selectedWorker.coverage} | ${selectedWorker.performance}</small>
    ${state.home.quickMessage ? `<p class="selected-worker-summary__message">${state.home.quickMessage}</p>` : ""}
  `;
}

function getSelectedWorker() {
  return getVisibleWorkers().find((worker) => worker.id === state.home.selectedWorkerId) || null;
}

function renderAdminMenu() {
  const requesterCount = new Set(state.requests.map((item) => item.requester)).size;
  const workerNames = new Set([
    ...state.workers.map((worker) => worker.name),
    ...state.requests.flatMap((request) => request.bids.map((bid) => bid.workerName))
  ]);
  const inProgressCount = state.requests.filter((item) => item.status === "공사중").length;
  const pendingCount = state.requests.filter((item) => item.status === "요청").length;

  adminSummary.innerHTML = [
    { label: "수리요청자 현황", value: `${requesterCount}명`, description: "현재 요청을 올린 수리요청자 수" },
    { label: "공사작업자 현황", value: `${workerNames.size}명`, description: "등록 및 입찰 참여 작업자 수" },
    { label: "공사 진행중", value: `${inProgressCount}건`, description: "현재 시공 단계인 요청 수" },
    { label: "확인 필요 요청", value: `${pendingCount}건`, description: "아직 낙찰 전인 요청 수" }
  ].map((item) => `
    <div class="summary-card admin-summary-card">
      <span>${item.label}</span>
      <strong>${item.value}</strong>
      <small>${item.description}</small>
    </div>
  `).join("");

  adminStatusList.innerHTML = state.requests.map((request) => {
    const awardedBid = request.bids.find((bid) => bid.id === request.awardedBidId);
    const lowestBid = request.bids.length ? [...request.bids].sort((a, b) => a.amount - b.amount)[0] : null;
    const note = getAdminNote(request, awardedBid);
    const amountLine = awardedBid
      ? `${formatCurrency(request.budget)} / ${formatCurrency(awardedBid.amount)}`
      : `${formatCurrency(request.budget)} / 미선정`;

    return `
      <div class="admin-table admin-table--row">
        <span><strong>${request.title}</strong><small>${request.category} · ${request.location}</small></span>
        <span><strong>${request.requester}</strong><small>${formatDate(request.dueDate)} 완료 희망</small></span>
        <span><strong>${awardedBid ? awardedBid.workerName : "미선정"}</strong><small>${awardedBid ? awardedBid.workerPhone : "입찰 선택 대기"}</small></span>
        <span><strong>${request.status}</strong><small>${STAGES.indexOf(request.status) + 1} / ${STAGES.length} 단계</small></span>
        <span><strong>${request.bids.length}건 입찰</strong><small>${lowestBid ? `최저가 ${formatCurrency(lowestBid.amount)}` : "입찰 없음"}</small></span>
        <span><strong>${amountLine}</strong><small>예산 / 현재 낙찰가</small></span>
        <span><strong>${note.title}</strong><small>${note.body}</small></span>
      </div>
    `;
  }).join("");
}

function renderWorkers() {
  const visibleWorkers = getVisibleWorkers();
  workerList.innerHTML = "";

  if (!visibleWorkers.length) {
    workerList.innerHTML = `<div class="empty-state">${getRoleScopedEmptyMessage("workers")}</div>`;
    return;
  }

  visibleWorkers.forEach((worker) => {
    const fragment = workerCardTemplate.content.cloneNode(true);
    fragment.querySelector(".worker-name").textContent = worker.name;
    fragment.querySelector(".worker-category").textContent = worker.category;
    fragment.querySelector(".worker-specialty").textContent = worker.specialty;
    fragment.querySelector(".worker-metric").innerHTML = `<span>누적 완료</span><strong>${worker.completedJobs}건</strong>`;
    fragment.querySelector(".worker-phone").textContent = worker.phone;
    fragment.querySelector(".worker-coverage").textContent = worker.coverage;
    fragment.querySelector(".worker-performance").textContent = worker.performance;
    fragment.querySelector(".worker-intro").textContent = worker.intro;
    renderImages(fragment.querySelector(".worker-images"), worker.images);
    workerList.appendChild(fragment);
  });
}

function renderRequests() {
  const visibleRequests = getVisibleRequests();
  requestList.innerHTML = "";

  if (!visibleRequests.length) {
    requestList.innerHTML = `<div class="empty-state">${getRoleScopedEmptyMessage("requests")}</div>`;
    return;
  }

  visibleRequests.forEach((request) => {
    const fragment = requestTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".request-card");
    const bidList = fragment.querySelector(".bid-list");
    const bidForm = fragment.querySelector(".bid-form");
    const stageButtons = fragment.querySelector(".stage-buttons");
    const awardCaption = fragment.querySelector(".award-caption");
    const awardedSummary = fragment.querySelector(".awarded-summary");
    const approvalBox = fragment.querySelector(".approval-box");
    const workflowBox = fragment.querySelector(".workflow-box");

    card.dataset.status = request.status;
    fragment.querySelector(".status-badge").textContent = `${request.category} · ${request.status}`;
    fragment.querySelector(".request-id").textContent = `요청번호 ${request.id.slice(0, 8)}`;
    fragment.querySelector(".request-title").textContent = request.title;
    fragment.querySelector(".request-desc").textContent = request.description;
    fragment.querySelector(".request-budget").textContent = formatCurrency(request.budget);
    fragment.querySelector(".request-requester").textContent = request.requester;
    fragment.querySelector(".request-location").textContent = request.location;
    fragment.querySelector(".request-due").textContent = formatDate(request.dueDate);
    fragment.querySelector(".request-lowest").textContent = getLowestBidLabel(request);
    renderImages(fragment.querySelector(".request-images"), request.images);

    renderWorkflowBox(request, workflowBox);
    renderApprovalBox(request, approvalBox);
    stageButtons.style.display = getCurrentUser() ? "none" : "";

    STAGES.forEach((stage) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `stage-button${stage === request.status ? " is-active" : ""}`;
      button.textContent = stage;
      button.disabled = !canMoveToStage(request, stage);
      button.addEventListener("click", () => {
        if (stage !== "입금완료" && request.status === "입금완료") {
          request.customerConfirmed = true;
        }
        request.status = stage;
        if (stage !== "입금완료" && stage !== "공사완료") {
          request.customerConfirmed = false;
        }
        saveAll();
        render();
      });
      stageButtons.appendChild(button);
    });

    const awardedBid = getAwardedBid(request);
    const visibleBids = getVisibleBids(request);
    const bidLocked = Boolean(request.awardedBidId) || request.status !== "요청";
    const canSubmitBid = canCurrentUserSubmitBid(request);

    if (bidLocked || !canSubmitBid) {
      bidForm.style.display = "none";
      if (awardedBid) {
        awardedSummary.innerHTML = `
          <div class="award-lock-box">
            <strong>${awardedBid.workerName} 작업자가 낙찰되어 추가 입찰이 닫혔습니다.</strong>
            <small>${awardedBid.workerPhone} · 낙찰가 ${formatCurrency(awardedBid.amount)}</small>
            <small>${awardedBid.note}</small>
          </div>
        `;
      } else if (isRole("requester")) {
        awardedSummary.innerHTML = `
          <div class="award-lock-box">
            <strong>수리요청자 로그인 상태에서는 입찰 등록 대신 입찰 비교와 낙찰 선택만 가능합니다.</strong>
            <small>아래 입찰 목록에서 작업자를 비교한 뒤 낙찰자를 선택해 주세요.</small>
          </div>
        `;
      } else {
        awardedSummary.innerHTML = `
          <div class="award-lock-box">
            <strong>현재 단계에서는 새 입찰을 받을 수 없습니다.</strong>
            <small>요청 상태에서만 새로운 입찰 등록이 가능합니다.</small>
          </div>
        `;
      }
    } else {
      awardedSummary.innerHTML = "";
      bidForm.style.display = "";
      if (isRole("worker")) {
        const workerProfile = getVisibleWorkers()[0];
        bidForm.querySelector('input[name="workerName"]').value = getCurrentUser().name;
        bidForm.querySelector('input[name="workerPhone"]').value = workerProfile?.phone || "";
        bidForm.querySelector('input[name="workerName"]').readOnly = true;
        bidForm.querySelector('input[name="workerPhone"]').readOnly = true;
      }
      bidForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(bidForm);
        request.bids.push({
          id: createId(),
          workerName: formData.get("workerName").trim(),
          workerPhone: formData.get("workerPhone").trim(),
          amount: Number(formData.get("amount")),
          note: formData.get("note").trim()
        });
        saveAll();
        render();
      });
    }

    if (!visibleBids.length) {
      bidList.innerHTML = `<div class="empty-state">아직 입찰이 없습니다. 첫 작업자가 되어보세요.</div>`;
      awardCaption.textContent = "현재 등록된 작업자가 없어 낙찰 전 단계입니다.";
    } else {
      const sortedBids = [...visibleBids].sort((a, b) => a.amount - b.amount);
      awardCaption.textContent = awardedBid
        ? `${awardedBid.workerName} 작업자가 낙찰되었습니다. 수리요청자가 단계별로 확인 후 대금을 지급할 수 있습니다.`
        : isRole("worker")
          ? "현재 로그인한 공사작업자의 입찰 내역만 표시됩니다."
          : "입찰가를 비교한 뒤 수리요청자가 직접 작업자를 선택할 수 있습니다.";

      sortedBids.forEach((bid) => {
        const bidFragment = bidTemplate.content.cloneNode(true);
        const bidItem = bidFragment.querySelector(".bid-item");
        const button = bidFragment.querySelector(".select-bid-btn");
        const isAwarded = bid.id === request.awardedBidId;

        if (isAwarded) {
          bidItem.classList.add("is-awarded");
          bidFragment.querySelector(".bid-badge").textContent = "낙찰";
        }

        bidFragment.querySelector(".bid-worker").textContent = bid.workerName;
        bidFragment.querySelector(".bid-note").textContent = bid.note;
        bidFragment.querySelector(".bid-phone").textContent = bid.workerPhone;
        bidFragment.querySelector(".bid-item__price").textContent = formatCurrency(bid.amount);

        const canAward = canCurrentUserAwardBid(request);
        button.disabled = isAwarded || bidLocked || !canAward;
        button.textContent = isAwarded ? "선택 완료" : bidLocked ? "낙찰 마감" : canAward ? "이 작업자 낙찰" : "요청자만 선택 가능";
        button.addEventListener("click", () => {
          if (bidLocked || !canAward) {
            return;
          }
          request.awardedBidId = bid.id;
          if (request.status === "요청") {
            request.status = "낙찰";
          }
          saveAll();
          render();
        });

        bidList.appendChild(bidFragment);
      });
    }

    requestList.appendChild(fragment);
  });
}

function renderImages(container, images = []) {
  container.innerHTML = "";
  if (!images.length) {
    return;
  }

  container.innerHTML = images.slice(0, 2).map((src, index) => `
    <figure class="image-card">
      <img src="${src}" alt="첨부 이미지 ${index + 1}">
    </figure>
  `).join("");
}

function updateImagePreview(input, previewContainer) {
  previewContainer.innerHTML = "";
  const files = Array.from(input.files || []).slice(0, 2);
  if ((input.files || []).length > 2) {
    input.value = "";
    previewContainer.innerHTML = `<div class="empty-state">이미지는 최대 2장까지만 등록할 수 있습니다.</div>`;
    return;
  }

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      previewContainer.insertAdjacentHTML("beforeend", `
        <figure class="image-card is-preview">
          <img src="${reader.result}" alt="${file.name}">
        </figure>
      `);
    };
    reader.readAsDataURL(file);
  });
}

function readImagesFromInput(input) {
  const files = Array.from(input.files || []).slice(0, 2);
  return Promise.all(files.map((file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  })));
}

function getLowestBidLabel(request) {
  if (!request.bids.length) {
    return "입찰 대기중";
  }

  const lowestBid = [...request.bids].sort((a, b) => a.amount - b.amount)[0];
  return `${formatCurrency(lowestBid.amount)} / ${lowestBid.workerName}`;
}

function canMoveToStage(request, stage) {
  const currentIndex = STAGES.indexOf(request.status);
  const nextIndex = STAGES.indexOf(stage);

  if (nextIndex < currentIndex) {
    return true;
  }
  if ((stage === "낙찰" || stage === "공사중") && !request.awardedBidId) {
    return false;
  }
  if (stage === "공사완료" && request.status === "요청") {
    return false;
  }
  if (stage === "입금완료" && request.status !== "공사완료") {
    return false;
  }
  if (stage === "입금완료" && !request.customerConfirmed) {
    return false;
  }
  return nextIndex <= currentIndex + 1;
}

function renderApprovalBox(request, container) {
  if (request.status === "공사완료" && !request.customerConfirmed && isRequesterOwner(request)) {
    container.innerHTML = `
      <button type="button" class="approve-button">요청자 최종 승인</button>
      <small class="approval-note">공사완료 후 요청자가 승인해야만 입금완료로 진행됩니다.</small>
    `;
    container.querySelector(".approve-button").addEventListener("click", () => {
      request.customerConfirmed = true;
      saveAll();
      render();
    });
    return;
  }

  if (request.status === "공사완료" && request.customerConfirmed) {
    container.innerHTML = `
      <div class="approval-complete">
        <strong>요청자 최종 승인 완료</strong>
        <small>이제 입금완료 단계로 진행할 수 있습니다.</small>
      </div>
    `;
    return;
  }

  if (request.status === "입금완료") {
    container.innerHTML = `
      <div class="approval-complete">
        <strong>요청자 승인 및 입금 완료</strong>
        <small>전체 거래 절차가 정상적으로 마무리되었습니다.</small>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="approval-pending">
      <strong>진행 순서</strong>
      <small>요청 → 입찰 → 최저가 낙찰 → 공사중 → 공사완료 → 요청자 최종 승인 → 입금완료</small>
    </div>
  `;
}

function renderWorkflowBox(request, container) {
  const action = getWorkflowAction(request);

  if (!action) {
    container.innerHTML = `
      <div class="workflow-state">
        <strong>현재 단계: ${request.status}</strong>
        <small>모든 절차가 완료되었거나 다음 작업이 없습니다.</small>
      </div>
    `;
    return;
  }

  const canRunAction = !action.disabled && canCurrentUserRunWorkflow(request);
  const helperMessage = canRunAction
    ? `다음 단계: ${action.nextLabel}`
    : `${action.nextLabel} 처리는 현재 담당자만 진행할 수 있습니다.`;

  container.innerHTML = `
    <div class="workflow-state">
      <strong>현재 단계: ${request.status}</strong>
      <small>${helperMessage}</small>
    </div>
    <button type="button" class="workflow-button${action.disabled || !canRunAction ? " is-disabled" : ""}" ${action.disabled || !canRunAction ? "disabled" : ""}>${action.buttonLabel}</button>
  `;

  if (!action.disabled && canRunAction) {
    container.querySelector(".workflow-button").addEventListener("click", () => {
      action.run();
      saveAll();
      render();
    });
  }
}

function getWorkflowAction(request) {
  if (request.status === "요청" && !request.awardedBidId) {
    return {
      nextLabel: "입찰 대기 중",
      buttonLabel: "낙찰자 선택 후 진행",
      disabled: true,
      run: () => {}
    };
  }

  if (request.status === "낙찰") {
    return {
      nextLabel: "공사중",
      buttonLabel: "공사진행 시작",
      run: () => {
        request.status = "공사중";
      }
    };
  }

  if (request.status === "공사중") {
    return {
      nextLabel: "공사완료",
      buttonLabel: "공사완료 처리",
      run: () => {
        request.status = "공사완료";
        request.customerConfirmed = false;
      }
    };
  }

  if (request.status === "공사완료" && !request.customerConfirmed) {
    return {
      nextLabel: "요청자 최종 승인",
      buttonLabel: "요청자 최종 승인",
      run: () => {
        request.customerConfirmed = true;
      }
    };
  }

  if (request.status === "공사완료" && request.customerConfirmed) {
    return {
      nextLabel: "입금완료",
      buttonLabel: "입금 완료 처리",
      run: () => {
        request.status = "입금완료";
      }
    };
  }

  return null;
}

function getAdminNote(request, awardedBid) {
  if (!awardedBid) {
    return { title: "작업자 선택 필요", body: "수리요청자가 입찰을 비교한 뒤 낙찰자를 정해야 합니다." };
  }
  if (request.status === "낙찰") {
    return { title: "공사 시작 전 확인", body: "일정과 작업 범위를 다시 확인한 뒤 공사중으로 전환합니다." };
  }
  if (request.status === "공사중") {
    return { title: "시공 진행 확인", body: "수리요청자가 중간 진행 상황을 확인하는 단계입니다." };
  }
  if (request.status === "공사완료") {
    return { title: "완료 검수 대기", body: "수리요청자 최종 확인 후 입금완료로 넘어갈 수 있습니다." };
  }
  if (request.status === "입금완료") {
    return { title: "정산 완료", body: "작업자에게 대금 지급이 끝난 거래입니다." };
  }
  return { title: "요청 접수", body: "입찰이 더 들어오거나 수리요청자 선택이 필요합니다." };
}

function formatCurrency(value) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0
  }).format(value);
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(value));
}
