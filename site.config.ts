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
    { label: "연락처", href: "#contact" },
  ],

  /* 화면 가장자리에 떠서 스크롤을 따라오는 응원 친구들 (순서대로 오른쪽 위, 왼쪽 가운데, 오른쪽 아래)
     icon 은 lightbulb(아이디어), biceps(화이팅), thumbs(최고) 중 하나 */
  cheerBuddies: [
    { icon: "lightbulb", label: "아이디어!" },
    { icon: "biceps", label: "화이팅!" },
    { icon: "thumbs", label: "최고야!" },
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
    secondaryCta: { label: "연락하기", href: "#contact" },
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

  /* 생각 필름 (01 생각과 02 계획 사이의 필름 띠)
     - 필름 칸은 관리자 페이지의 「생각 필름」 탭에서 추가한 카드로 채워집니다. (제목, 설명, 사진, 링크)
     - 아직 카드가 없을 때는 아래 samples 가 대신 보입니다. */
  thoughts: {
    eyebrow: "Thinking Film",
    title: "생각 필름",
    description: "떠오른 생각을 한 컷씩 필름에 남겨 둡니다. 옆으로 넘겨 보세요.",
    filmLabel: "HAEBOJA\nFILM",
    samples: [
      { title: "아침 산책", description: "걷다 보면 머릿속이 정리된다. 내일도 걸어야지." },
      { title: "작게 시작", description: "완벽한 계획보다 오늘의 한 걸음이 더 크다." },
      { title: "기록 습관", description: "떠오른 건 바로 적기. 잊어버리기 전에!" },
      { title: "새로운 도전", description: "해 본 적 없는 걸 한 달에 하나씩 해 보기." },
    ],
  },

  /* 일정표 (02 계획 섹션 안의 달력 보드)
     - months : 달마다 하나씩. month 는 크게 보이는 달 숫자
     - events : 그 달의 일정. day = 크게 보이는 날짜(예: "14–20"), time = 시간 알약,
                title = 일정 이름, date = 아래 작은 날짜, note = 짧은 메모(없어도 됨),
                wide: true 면 칸을 두 배로 넓게 */
  schedule: {
    boardTitle: "CALENDAR SCHEDULE",
    months: [
      {
        month: "11",
        events: [
          { day: "03", time: "7PM", title: "아이디어 모으기", date: "11.03" },
          { day: "07", time: "8PM", title: "목표 정하기", date: "11.07" },
          { day: "10", time: "7PM", title: "준비물 체크", date: "11.10" },
          {
            day: "14–20",
            time: "9PM",
            title: "작은 실험 주간",
            date: "11.14 – 11.20",
            note: "매일 30분씩, 작게 해 보기!",
            wide: true,
          },
          { day: "27", time: "8PM", title: "실험 결과 정리", date: "11.27" },
        ],
      },
      {
        month: "12",
        events: [
          { day: "01", time: "7PM", title: "중간 점검", date: "12.01" },
          { day: "05", time: "8PM", title: "계획 다듬기", date: "12.05" },
          { day: "12", time: "7PM", title: "본격 실천 시작!", date: "12.12" },
          {
            day: "24",
            time: "9PM",
            title: "한 해 돌아보기",
            date: "12.24",
            note: "잘한 점 3개, 아쉬운 점 1개",
            wide: true,
          },
          { day: "31", time: "7PM", title: "새해 계획 세우기", date: "12.31" },
        ],
      },
    ],
  },

  /* 실천 레이스 (03 실천 섹션 안). 칸은 0(출발) ~ 19(도착) 20칸이 뱀처럼 이어집니다.
     주사위 없이, 칸을 눌러 내 캐릭터 말을 지금 하고 있는 실천 계획 칸에 놓습니다.
     캐릭터가 있는 칸에는 성공·보류·재도전·취소 표시를 붙일 수 있어요.
     (말 위치와 표시는 이 브라우저에 기억돼서 다음에 와도 그대로예요)
     - missions : tile = 칸 번호(1~18), text = 그 칸의 실천 계획
     - jumps    : 사다리 그림 (앞으로 가는 사다리 = upText, 뒤로 돌아가는 사다리 = downText) */
  actionGame: {
    boardTitle: "실천 레이스",
    hint: "칸을 눌러 내 캐릭터를 지금 하고 있는 실천 계획에 놓아 보세요!",
    startLabel: "출발",
    goalLabel: "도착",
    resetLabel: "출발로 돌아가기",
    upText: "2단계 실천 시작!",
    downText: "한 번 더 복습!",
    /* 캐릭터가 있는 칸에 붙일 수 있는 결과 표시 (key 는 바꾸지 말고 label 만 바꾸기) */
    statusPrompt: "결과 표시:",
    statuses: [
      { key: "done", label: "성공" },
      { key: "hold", label: "보류" },
      { key: "retry", label: "재도전" },
      { key: "cancel", label: "취소" },
    ],
    goalMessage: "도착! 오늘도 해냈어요!",
    missions: [
      { tile: 1, text: "교육 신청하기" },
      { tile: 3, text: "교육 듣기" },
      { tile: 4, text: "스터디 참여하기" },
      { tile: 7, text: "자격증 공부하기" },
      { tile: 10, text: "모의시험 보기" },
      { tile: 12, text: "시험 응시하기" },
      { tile: 14, text: "자격증 따기" },
      { tile: 17, text: "이력서 쓰기" },
      { tile: 18, text: "지원하기" },
    ],
    jumps: [
      { from: 2, to: 8 },
      { from: 6, to: 13 },
      { from: 16, to: 9 },
    ],
  },

  /* 성과 뽑기 기계 (04 결과 섹션 안) + 옆의 성과 트로피
     - 기계 안의 캡슐 = 관리자 페이지 「성과 (트로피)」 탭에 등록한 카드의 '제목' (몇 단어로 짧게!)
       아직 등록한 카드가 없으면 아래 samples 가 대신 보입니다. 캡슐은 최대 9개까지 보여요.
     - 캡슐을 눌러 고른 뒤 '선택해서 담기'를 누르면 집게가 꺼내서 트로피에 담아 줍니다 */
  clawGame: {
    title: "나의 성과",
    hint: "담고 싶은 성과 캡슐을 눌러 고른 뒤 ‘선택해서 담기’를 눌러 보세요!",
    pickLabel: "선택해서 담기",
    resetLabel: "다시 꺼내기",
    trophyTitle: "나의 성과 트로피",
    trophyPlate: "MY TROPHY",
    trophyEmpty: "고른 성과가 트로피에 담겨요",
    doneMessage: "모든 성과를 트로피에 담았어요! 정말 멋져요!",
    samples: ["매일 30분 운동", "책 3권 완독", "새벽 기상 성공", "포트폴리오 완성", "저축 목표 달성", "첫 발표 무사히"],
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
    copyright: "© 2026 해보자. All rights reserved.",
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
