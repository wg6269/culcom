'use client';

import { useState } from 'react';

type TabKey = 'level0' | 'level1' | 'level2' | 'freetalking';

interface Panel {
  key: TabKey;
  label: string;
  badge: string;
  title: string;
  target: string;
  targetItems: string[];
  itemHeader: string;
  items: string[];
}

const PANELS: Panel[] = [
  {
    key: 'level0',
    label: 'Level 0',
    badge: '👶 Level 0',
    title: '왕초보 : "머릿속에 단어는 맴도는데, 문장으로 안 나와요..” ',
    target: '대상',
    targetItems: [
      "✔ '단어 나열'이 한계인 분",
      '✔ 용기는 있지만 방법이 막막한 분',
    ],
    itemHeader: '[커리큘럼 안내: "말문이 트이는 기분 좋은 경험"]',
    items: [
      '✔ 한 문장의 뼈대 세우기 (기초 단어 & 문법)',
      '✔ 성취감을 주는 셀프 복습',
      '✔ 단어에서 문장으로, 퀀텀 점프',
      '✔ 해외여행 100% 활용하기 (실전 시뮬레이션)',
    ],
  },
  {
    key: 'level1',
    label: 'Level 1 : 단어의 나열을 넘어 문장으로',
    badge: '🌱 Level 1',
    title: '"머릿속에 있는 영어를 입 밖으로 꺼내는 시간"',
    target: '대상',
    targetItems: [
      "✔ '단어 조립'이 어려운 분",
      "✔ 시험용 영어에만 익숙한 분",
      "✔ 여행지에서 \'진짜 대화\'를 하고 싶은 분",
      '✔ 토스 레벨5, 오픽 IL~IM이상 목표하시는분',
    ],
    itemHeader: '[커리큘럼 안내: "생각하는 영어가 아닌 말하는 영어"]\n',
    items: [
      '✔ 원어민이 매일 쓰는 \'만능 패턴\' 장착',
      '✔ 단어 조립법 익히기 (말문 트기 훈련)',
      '✔ 어색함 제로! 리얼 스몰톡(Small Talk)',
      '✔ 상황별 서바이벌 회화',
    ],
  },
  {
    key: 'level2',
    label: 'Level 2 : 교과서를 넘어 \'진짜 영어\'의 세계로',
    badge: '🚀 Level 2',
    title: '"문법은 맞는데 왜 어색할까요? 이제는 \'공부\'가 아닌 \'경험\'이 필요할 때"',
    target: '대상',
    targetItems: [
      "✔ '원어민 속도'에 당황하는 분",
      "✔ 기본기는 있지만 2%가 부족한 분",
      "✔ 토스 LV6이상 오픽 IM이상 목표하시는 분",
    ],
    itemHeader: '[커리큘럼 안내: "살아있는 영어, 감각으로 익히다"]',
    items: [
      '✔ 공부식 영어가 아닌 \'체험식 영어\'',
      '✔ 0.1초 만에 반응하는 \'실전 대화 속도\'',
      '✔ 원어민의 한 끗 차이, \'구동사(Phrasal Verbs)\' 정복',
      '✔ 뉘앙스의 차이를 이해하는 세련된 회화',
    ],
  },
  {
    key: 'freetalking',
    label: '프리토킹 : 일상을 넘어 프로페셔널의 세계로',
    badge: '💬 Free Talking',
    title: '프리토킹',
    target: '대상',
    targetItems: [
      "✔ 스몰톡의 한계를 느끼는 분",
      "✔ OPIc AL이나 토익 스피킹 최고 등급을 목표하시는 분",
      "✔ 글로벌 비즈니스 매너가 고픈 직장인",
    ],
    itemHeader: '[커리큘럼 안내: "성과로 증명되는 고품격 회화"]',
    items: [
      '✔ OPIc / 토스 완벽 대비 (Logic Building)',
      '✔ 실전 비즈니스 영어 & 세련된 애티튜드',
      '✔ 원어민의 \'Real\' 실전 표현 마스터',
      '✔ 다국적 원어민과의 글로벌 네트워킹',
    ],
  },
];

export default function ProgramTabsClient() {
  const [active, setActive] = useState<TabKey>('level0');
  return (
    <>
      <div className="program-tabs fade-up">
        {PANELS.map(p => (
          <button
            key={p.key}
            type="button"
            className={`tab-btn${active === p.key ? ' active' : ''}`}
            onClick={() => setActive(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="program-panels">
        {PANELS.map(p => (
          <div
            key={p.key}
            className={`program-panel${active === p.key ? ' active' : ''}`}
            id={`tab-${p.key}`}
          >
            <div className="program-badge">{p.badge}</div>
            <h3 className="program-title">{p.title}</h3>
            <p className="program-target">
              <a
                href="https://pf-link.kakao.com/qr/_kXQxlX/pages/_xlM?query=state%3D1"
                target="_blank"
                rel="noopener noreferrer"
              >
                {p.target}
              </a>
            </p>
            <ul className="program-target-items">
              {p.targetItems.map(it => (
                <li key={it}>{it}</li>
              ))}
            </ul>
            <div className="program-item-header">{p.itemHeader}</div>
            <ul className="program-list">
              {p.items.map(it => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
