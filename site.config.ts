/* ==========================================================================
   ★ 사이트 내용 설정 파일
   --------------------------------------------------------------------------
   사이트에 보이는 글자(이름, 소개, 메뉴, 연락처 등)는 대부분 여기에 있습니다.
   따옴표 " " 안의 글자만 바꾸고 저장하면 화면에 바로 반영됩니다.
   (따옴표, 쉼표, 중괄호 { } 는 지우지 않도록 조심!)
   ========================================================================== */

import type { Item } from "@/lib/types";

export const siteConfig = {
  /* 브라우저 탭 제목과 검색 결과에 보이는 정보 */
  name: "해보자",
  title: "해보자 — 나의 첫 웹사이트",
  description: "바이브 코딩으로 만든 나의 웹사이트입니다.",

  /* 상단 메뉴 (href 의 #이름 은 아래 섹션의 id 와 같아야 해당 위치로 이동) */
  nav: [
    { label: "생각", href: "#think" },
    { label: "계획", href: "#plan" },
    { label: "실천", href: "#do" },
    { label: "결과", href: "#result" },
    { label: "소식", href: "#news" },
  ],

  /* 상단 메뉴 오른쪽 버튼 (누르면 새 탭에서 관리자 페이지가 열림) */
  secretButton: { label: "비밀 버튼", href: "/admin" },

  /* 첫 화면(히어로) */
  hero: {
    eyebrow: "Hello, World",
    title: "생각을 바로\n화면으로 만듭니다",
    description:
      "이 문장을 바꿔 나를 소개해 보세요. site.config.ts 파일에서 글자만 바꾸면 여기가 바뀝니다.",
    primaryCta: { label: "더 알아보기", href: "#think" },
    secondaryCta: { label: "소식 보기", href: "#news" },
    /* 첫 화면 오른쪽 이정표의 글자 (\n 은 줄바꿈). 필요 없으면 "" 로 비우기
       - board  : 맨 위 보라색 큰 판
       - sticker: 큰 판에 붙은 분홍 스티커
       - hoverText: 큰 판에 마우스를 올리면 튀어나오는 말풍선 글자
       - 아래 화살표 표지판은 steps(생각, 계획, 실천, 결과)의 title 을 써서, 누르면 해당 섹션으로 이동 */
    decor: {
      board: "나의\n이정표",
      sticker: "START!",
      hoverText: "I CAN DO IT!",
    },
  },

  /* 단계 섹션 4개 (생각 → 계획 → 실천 → 결과). 첫 화면 이정표와 상단 메뉴도 이 순서를 따릅니다.
     - key  : 섹션 주소(#think 처럼)이자 관리자에서 카드를 등록하는 이름 (영문 소문자, 바꾸지 않기)
     - 카드(사진, 링크 등)는 관리자 페이지에서 단계별로 추가할 수 있습니다
     - signTip : 첫 화면 이정표의 표지판에 마우스를 올리면 나오는 한마디 */
  steps: [
    {
      key: "think",
      eyebrow: "Step 01 · Think",
      title: "생각",
      description: "무엇을 하고 싶은지 떠올려 보는 단계입니다. 여기에 나의 아이디어를 적어 보세요.",
      signTip: "첫걸음 떼면 별거 아니야!",
    },
    {
      key: "plan",
      eyebrow: "Step 02 · Plan",
      title: "계획",
      description: "생각을 실제로 옮기기 위한 순서와 준비물을 정리하는 단계입니다.",
      signTip: "시작이 반이야!",
    },
    {
      key: "do",
      eyebrow: "Step 03 · Do",
      title: "실천",
      description: "계획한 것을 하나씩 직접 해 보는 단계입니다. 작게라도 바로 시작해요.",
      signTip: "인생은 생각보다 짧아!",
    },
    {
      key: "result",
      eyebrow: "Step 04 · Result",
      title: "결과",
      description: "해 보고 나서 얻은 것과 배운 점을 정리하는 단계입니다.",
      signTip: "GOOD!!!",
    },
  ],

  /* 생각 필름 (01 생각 섹션 안의 필름 띠, 칸을 누르면 기록 칸이 열림)
     - 필름 칸은 관리자 페이지의 「생각 필름」 탭에서 추가한 카드로 채워집니다. (제목, 설명, 사진, 링크)
     - 아직 카드가 없을 때는 아래 samples 가 대신 보입니다. */
  thoughts: {
    eyebrow: "Thinking Film",
    title: "생각 필름",
    description: "떠오른 생각을 한 컷씩 필름에 남겨 둡니다. 옆으로 넘겨 보세요.",
    filmLabel: "HAEBOJA\nFILM",
    /* 필름 칸을 누르면 아래에 열리는 기록 칸 */
    pickHint: "필름 칸을 누르면 아래에 그 주제의 기록을 적을 수 있어요.",
    notesTitle: "기록",
    notesEmpty: "아직 기록이 없어요. 꼬리표를 고르고 첫 기록을 남겨 보세요!",
    addLabel: "추가",
    noteTags: {
      study: ["자격증", "수료", "강의", "독서"],
      work: ["프로젝트", "성과", "교육", "회의"],
      habit: ["운동", "기상", "기록", "독서"],
      future: ["목표", "꿈", "계획", "도전"],
    },
    notePlaceholders: {
      study: "예) 독서지도사 2급 수료",
      work: "예) 디지털튜터 수업 10회 진행",
      habit: "예) 아침 6시 기상 7일째",
      future: "예) 2027년 도서관 강사 되기",
    },
    samples: [
      { title: "공부", description: "모르는 걸 알게 되는 기쁨. 하루 30분이라도 꾸준히 배우기." },
      { title: "일", description: "맡은 일은 끝까지, 작은 성과도 잊지 않게 기록해 두기." },
      { title: "습관", description: "좋은 습관 하나가 내일의 나를 만든다. 작게, 매일." },
      { title: "미래", description: "1년 뒤의 나에게 부끄럽지 않게, 오늘 한 걸음 더." },
    ],
  },

  /* 일정표 (02 계획 섹션 안) — 다이어리처럼 한 달을 1일부터 말일까지 세로로 보여줌
     - 화면에서 '계획 추가'로 직접 적고, 계획을 눌러 고치거나 지울 수 있어요 (이 브라우저에 저장)
     - months : 처음 보여줄 예시 계획 (year = 연도, month = 달). 그 달을 화면에서 고치면 저장한 내용이 대신 보여요
     - events : 그 달의 계획. start ~ end = 며칠부터 며칠까지 (하루짜리면 둘을 같게)
                기간 계획(start ≠ end)은 오른쪽에 세로 막대로 그 기간 동안 쭉 표시됨
                time = 시간(없어도 됨), note = 짧은 메모(없어도 됨) */
  schedule: {
    boardTitle: "CALENDAR SCHEDULE",
    addLabel: "계획 추가",
    searchPlaceholder: "저장한 계획 찾기 (예: 자격증, 강의)",
    months: [
      {
        year: 2026,
        month: 11,
        events: [
          { start: 3, end: 3, time: "7PM", title: "아이디어 모으기" },
          { start: 7, end: 7, time: "8PM", title: "목표 정하기" },
          { start: 10, end: 10, time: "7PM", title: "준비물 체크" },
          { start: 14, end: 20, time: "9PM", title: "작은 실험 주간", note: "매일 30분씩, 작게 해 보기!" },
          { start: 23, end: 29, time: "", title: "자격증 집중 공부", note: "하루 1시간" },
          { start: 27, end: 27, time: "8PM", title: "실험 결과 정리" },
        ],
      },
      {
        year: 2026,
        month: 12,
        events: [
          { start: 1, end: 1, time: "7PM", title: "중간 점검" },
          { start: 5, end: 5, time: "8PM", title: "계획 다듬기" },
          { start: 7, end: 18, time: "", title: "본격 실천 기간", note: "매일 기록 남기기" },
          { start: 12, end: 12, time: "7PM", title: "본격 실천 시작!" },
          { start: 21, end: 27, time: "9PM", title: "한 해 돌아보기 주간", note: "잘한 점 3개, 아쉬운 점 1개" },
          { start: 31, end: 31, time: "7PM", title: "새해 계획 세우기" },
        ],
      },
    ],
  },

  /* 실천 레이스 (03 실천 섹션 안). 출발 → 1~15번 칸 → 도착이 뱀처럼 이어진 퍼즐입니다.
     주사위 없이, 칸을 눌러 내 캐릭터 말을 지금 하고 있는 실천 계획 칸에 놓습니다.
     캐릭터가 있는 칸에는 위쪽 줄에서 성공·보류·재도전 표시를 붙일 수 있어요.
     (말 위치와 표시는 이 브라우저에 기억돼서 다음에 와도 그대로예요)
     - missions : tile = 칸 번호(1~15), text = 그 칸의 실천 계획
     - statuses : 위쪽 '결과 표시' 줄의 버튼. cheer = 표시할 때 팡팡 튀어나오는 응원 말
                  (성공은 폭죽도 함께 터짐) */
  actionGame: {
    boardTitle: "실천 레이스",
    hint: "칸을 눌러 내 캐릭터를 지금 하고 있는 실천 계획에 놓아 보세요!",
    startLabel: "출발",
    goalLabel: "도착",
    resetLabel: "출발로 돌아가기",
    /* 캐릭터가 있는 칸에 붙일 수 있는 결과 표시 (key 는 바꾸지 말고 label 만 바꾸기) */
    statusPrompt: "결과 표시:",
    textPlaceholder: "이 칸에서 할 일 (예: 토익 접수하기)",
    statusHint: "칸을 눌러 캐릭터를 놓은 뒤 결과를 표시해 보세요:",
    statuses: [
      { key: "done", label: "성공", cheer: "최고야!" },
      { key: "hold", label: "보류", cheer: "화이팅!" },
      { key: "retry", label: "재도전", cheer: "다시 해보자!" },
    ],
    goalMessage: "도착! 오늘도 해냈어요!",
    puzzleDoneMessage: "15칸을 모두 성공해서 그림이 완성됐어요! 정말 대단해요!",
    missions: [
      { tile: 1, text: "교육 신청하기" },
      { tile: 3, text: "교육 듣기" },
      { tile: 4, text: "스터디 참여하기" },
      { tile: 6, text: "자격증 공부하기" },
      { tile: 7, text: "모의시험 보기" },
      { tile: 9, text: "시험 응시하기" },
      { tile: 11, text: "자격증 따기" },
      { tile: 13, text: "이력서 쓰기" },
      { tile: 15, text: "지원하기" },
    ],
  },

  /* 성과 뽑기 기계 (04 결과 섹션 안) + 옆의 성과 트로피
     - 기계 안의 캡슐 = 관리자 페이지 「성과 (트로피)」 탭에 등록한 카드의 '제목' (몇 단어로 짧게!)
       아직 등록한 카드가 없으면 아래 samples 가 대신 보입니다. 캡슐은 최대 9개까지 보여요.
     - 캡슐을 눌러 고른 뒤 '선택해서 담기'를 누르면 집게가 꺼내서 트로피에 담아 줍니다 */
  clawGame: {
    title: "나의 성과",
    vendingTitle: "MY ACHIEVEMENTS",
    soldLabel: "담았어요",
    trayLabel: "TAKE OUT",
    mascotMessages: ["골라 봐요! 다 내 성과예요", "이렇게 많이 해냈다니!", "트로피를 꽉 채워 봐요!"],
    hint: "진열된 성과를 눌러 고른 뒤 ‘선택해서 담기’를 눌러 보세요!",
    pickLabel: "선택해서 담기",
    resetLabel: "다시 꺼내기",
    trophyTitle: "나의 성과 트로피",
    trophyPlate: "MY TROPHY",
    trophyCheer: "+1 성과!",
    trophyEmpty: "고른 성과가 트로피에 담겨요",
    doneMessage: "모든 성과를 트로피에 담았어요! 정말 멋져요!",
    samples: ["매일 30분 운동", "책 3권 완독", "새벽 기상 성공", "포트폴리오 완성", "저축 목표 달성", "첫 발표 무사히"],
  },

  /* 성과 그래프 (04 결과 섹션 안, 트로피 아래)
     - months : 달마다 성공한 실천 개수 (막대 그래프). 달을 더하거나 숫자를 바꾸면 그래프가 바뀝니다
     - 오른쪽 칸들은 실천 레이스에서 표시한 성공·보류·재도전 개수를 자동으로 셉니다 */
  achievements: {
    boardTitle: "성과 그래프",
    chartTitle: "달마다 성공한 실천",
    unit: "개",
    months: [
      { label: "7월", value: 2 },
      { label: "8월", value: 3 },
      { label: "9월", value: 5 },
      { label: "10월", value: 4 },
      { label: "11월", value: 7 },
      { label: "12월", value: 9 },
    ],
    statusTitle: "실천 레이스 결과",
    adviceTitle: "그래프가 알려주는 조언",
    rateLabel: "성공률",
    emptyStatus: "실천 레이스에서 결과를 표시하면 여기에 쌓여요",
  },

  /* 보상 룰렛 (04 결과 섹션 안, 성과 그래프 아래)
     - 이번 달 성공 개수는 위 achievements.months 에서 이번 달 숫자를 씀 (예: "11월")
     - rules   : 기준. 한 달에 min 개 이상 성공하면 그 달에 spins 번 돌릴 수 있음 (가장 높은 기준 하나만 적용)
     - rewards : 처음 룰렛 칸. 화면의 '보상 목록 고치기'에서 바꿀 수 있고, 바꾼 목록은 이 브라우저에 저장됨
       cat 은 buy(사고 싶은 것) / have(갖고 싶은 것) / do(하고 싶은 것), emoji 는 룰렛 칸에 크게 보이는 그림 */
  roulette: {
    boardTitle: "보상 룰렛",
    rules: [
      { min: 5, spins: 1 },
      { min: 10, spins: 2 },
    ],
    categories: [
      { key: "buy", label: "사고 싶은 것" },
      { key: "have", label: "갖고 싶은 것" },
      { key: "do", label: "하고 싶은 것" },
    ],
    rewards: [
      { cat: "do", emoji: "🏖️", text: "바다 보러 1박 2일 여행" },
      { cat: "buy", emoji: "👟", text: "갖고 싶던 러닝화" },
      { cat: "do", emoji: "🍣", text: "오마카세 저녁" },
      { cat: "have", emoji: "🎧", text: "노이즈캔슬링 헤드폰" },
      { cat: "do", emoji: "💆", text: "전신 마사지 90분" },
      { cat: "buy", emoji: "📚", text: "서점에서 책 3권 마음껏" },
      { cat: "have", emoji: "💐", text: "나에게 주는 꽃다발" },
      { cat: "do", emoji: "🛌", text: "알람 없이 늦잠 자는 날" },
    ],
    spinLabel: "룰렛 돌리기",
    winLabel: "당첨!",
    listTitle: "보상 목록",
    historyTitle: "당첨 기록",
  },

  /* 관심사 소식함 (맨 아래, 예전 '연락처' 자리)
     - topics       : 관심사 기사. query 로 인터넷 뉴스를 찾아 섞어서 보여줌 (1시간마다 새로 가져옴)
     - noticeQueries: '알아둘 소식' 칸에 보여줄 모집·자격증·지역 소식 검색어
     - notices      : 뉴스를 못 가져올 때 대신 보여줄 소식 (직접 적어 두는 메모로 써도 좋아요)
     - quotes       : 동기부여 한마디. by 에 말한 사람 이름을 적으면 아래에 함께 보여요
     - intervalSec  : 몇 초마다 다음 글로 넘어갈지 */
  interests: {
    eyebrow: "Growth Letter",
    title: "오늘의 성장 레터",
    description: "힘이 되는 한마디와 도움이 되는 정보를 모았어요. 잠시 기다리면 다음 글이 보여요.",
    articlesTitle: "관심사 기사",
    noticesTitle: "알아둘 소식",
    quotesTitle: "오늘의 한마디",
    readLabel: "기사 보기",
    intervalSec: 7,
    topics: [
      { label: "강사", query: "천안 강사" },
      { label: "AI", query: "AI 교육" },
      { label: "AI 지도", query: "AI 교육 지도 교사" },
      { label: "AI 수업", query: "AI 수업" },
      { label: "디지털튜터", query: "디지털튜터" },
      { label: "독서지도", query: "독서지도" },
      { label: "도서관", query: "도서관 프로그램" },
    ],
    noticeQueries: [
      { label: "모집·공고", query: "디지털튜터 모집" },
      { label: "자격증", query: "독서지도사 자격증" },
      { label: "천안 소식", query: "천안 도서관 강좌" },
    ],
    notices: [
      { label: "체크", text: "관심 있는 기관의 강사·튜터 모집 공고는 기관 홈페이지 '알림/공지' 게시판을 자주 확인해요." },
      { label: "자격증", text: "응시하려는 자격증의 시험 일정과 접수 기간을 달력(02 계획)에 미리 적어 두기!" },
      { label: "도서관", text: "가까운 도서관의 강좌·동아리 프로그램은 매달 초에 새로 올라오는 경우가 많아요." },
    ],
    quotes: [
      { text: "완벽하게 시작하려다 아무것도 못 한다. 일단 시작하면 완벽해질 기회가 생긴다.", by: "" },
      { text: "오늘 공부한 1시간은 사라지지 않는다. 내일의 나에게 그대로 쌓인다.", by: "" },
      { text: "남과 비교하지 말고 어제의 나와 비교하자. 그거면 충분하다.", by: "" },
      { text: "못하는 게 아니라, 아직 안 해 본 것뿐이다.", by: "" },
      { text: "포기하고 싶은 그 순간이 바로 실력이 느는 순간이다.", by: "" },
      { text: "작은 약속을 지키는 사람이 큰 꿈도 이룬다.", by: "" },
      { text: "지금 힘든 건 오르막길을 걷고 있다는 증거다.", by: "" },
    ],
  },

  /* 소개 섹션 (지금은 첫 페이지에서 빠져 있음 — 다시 쓰려면 app/page.tsx 에 <About /> 추가) */
  about: {
    eyebrow: "About",
    title: "소개",
    paragraphs: [
      "여기에 나 또는 우리 팀, 가게, 프로젝트에 대한 소개를 적습니다.",
      "두 번째 문단도 필요하면 이렇게 줄을 추가하면 됩니다.",
    ],
  },

  /* 기능(항목) 섹션의 제목 (지금은 첫 페이지에서 빠져 있음 — 다시 쓰려면 app/page.tsx 에 <Features /> 추가) */
  features: {
    eyebrow: "Features",
    title: "기능",
    description: "관리자 페이지에서 카드를 추가·수정·삭제할 수 있는 영역입니다.",
  },

  /* 연락처 섹션 */
  contact: {
    eyebrow: "Contact",
    title: "함께 이야기해요",
    description: "궁금한 점이 있다면 언제든 연락 주세요.",
    email: "hello@example.com",
    links: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "GitHub", href: "https://github.com" },
    ],
  },

  /* 맨 아래(푸터) */
  footer: {
    tagline: "오늘의 한 걸음이 내일의 이정표가 돼요.",
    copyright: "© 2026 해보자. All rights reserved.",
    backToTop: "맨 위로",
  },

  /* 관리자 페이지에서 관리할 섹션 목록.
     key  = 데이터베이스에 저장되는 이름(영문 소문자),
     label = 관리자 화면에 보이는 이름.
     예) 포트폴리오라면 { key: "works", label: "작업물" } 을 추가 */
  adminSections: [
    { key: "think", label: "생각 필름" },
    { key: "plan", label: "계획" },
    { key: "do", label: "실천" },
    { key: "result", label: "성과 (트로피)" },
  ],
};

/* Supabase를 아직 연결하지 않았을 때 대신 보여줄 예시 카드.
   Supabase를 연결하면 이 내용 대신 관리자 페이지에서 등록한 카드가 보입니다. */
export const sampleItems: Item[] = [
  {
    id: "sample-1",
    section: "features",
    title: "첫 번째 기능",
    description: "카드 하나에 제목, 설명, 이미지, 링크를 넣을 수 있어요.",
    image_url: null,
    link_url: null,
    sort_order: 1,
    is_visible: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "sample-2",
    section: "features",
    title: "두 번째 기능",
    description: "관리자 페이지에서 순서를 바꾸거나 숨길 수도 있어요.",
    image_url: null,
    link_url: null,
    sort_order: 2,
    is_visible: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "sample-3",
    section: "features",
    title: "세 번째 기능",
    description: "포트폴리오라면 작업물, 가게라면 메뉴처럼 자유롭게 쓰세요.",
    image_url: null,
    link_url: null,
    sort_order: 3,
    is_visible: true,
    created_at: "2026-01-01T00:00:00Z",
  },
];
