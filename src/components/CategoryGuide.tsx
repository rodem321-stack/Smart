import React, { useState } from 'react';
import { BookOpen, CheckCircle, XCircle, AlertTriangle, Search, Info } from 'lucide-react';

interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  badgeColor: string;
  doList: string[];
  dontList: string[];
  specialTips: string;
}

const CATEGORIES_DATA: CategoryInfo[] = [
  {
    id: 'plastic',
    name: '플라스틱류 (PET/PP/PE/PS)',
    icon: '🥤',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    doList: [
      '내용물(음료, 유제품, 주방세제 등)을 깨끗이 비우고 물로 세척',
      '부착된 라벨 비닐 스티커는 떼어내어 비닐류로 따로 배출',
      '투명 페트병은 라벨 제거 후 착착 압착하여 뚜껑을 닫아 전용 수거함에 배출',
    ],
    dontList: [
      '음식물이나 기름때로 오염되어 지워지지 않는 플라스틱',
      '알약 포장재, 칫솔, 카세트테이프, 장난감류 (복합 재질로 종량제 배출)',
      '실리콘, 고무, PVC 소재 제품',
    ],
    specialTips: '투명 페트병은 고품질 의류 섬유로 재활용되므로 유색 플라스틱과 반드시 분리배출해야 합니다.',
  },
  {
    id: 'paper',
    name: '종이류 & 종이팩',
    icon: '📦',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    doList: [
      '종이 상자는 비닐 테이프, 택배 송장 스티커, 철심을 완벽히 제거 후 펼쳐서 배출',
      '신문지, 책자, 노트류는 스프링이나 비닐 표지를 제거 후 배출',
      '우유팩, 두유팩 등 종이팩은 펼쳐서 씻고 말린 뒤 전용 종이팩 수거함에 배출',
    ],
    dontList: [
      '기름이나 음식물이 묻은 종이 (치킨 상자 밑지, 피자 상자 오염 부위)',
      '영수증, 영하권 감열지, 코팅 포장지, 부직포, 벽지',
      '사용한 휴지, 물티슈, 기저귀 (종량제 봉투 배출)',
    ],
    specialTips: '종이팩은 일반 종이와 재활용 공정이 달라 따로 배출하거나 주민센터의 화장지 교환 사업을 활용하세요.',
  },
  {
    id: 'vinyl',
    name: '비닐류 (필름 포장재)',
    icon: '🛍️',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    doList: [
      '라벨 스티커가 붙은 라면 봉지, 과자 봉지, 뽁뽁이(에어캡)',
      '이물질을 깨끗이 씻어서 물기를 말린 뒤 흩날리지 않게 모아서 배출',
      '투명 비닐, 색상 있는 비닐 모두 재활용 가능',
    ],
    dontList: [
      '고추장, 양념, 기름때가 지워지지 않는 찌꺼기 비닐',
      '식탁보, 돗자리, 천막, 장판',
      '아이스팩 (젤 형태 아이스팩은 종량제 봉투 배출)',
    ],
    specialTips: '비닐을 매듭지어 동그랗게 묶으면 풍력 선별기에서 튕겨 나가 재활용이 어렵습니다. 펴서 배출하세요.',
  },
  {
    id: 'metal',
    name: '캔류 & 금속류',
    icon: '🥫',
    badgeColor: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    doList: [
      '음료수 캔, 통조림 캔은 물로 세척 후 가능한 찌그러뜨려 배출',
      '부탄가스, 살충제 캔은 통풍이 잘되는 야외에서 구멍을 뚫어 잔여 가스 배출',
      '철사, 못, 프라이팬, 냄비 등 고철류는 고철 수거함에 배출',
    ],
    dontList: [
      '알루미늄 호일, 페인트통, 화학물질 용기 (특수 마대 배출)',
      '가스가 잔류한 부탄가스통 (화재 위험)',
    ],
    specialTips: '통조림 캔의 뚜껑도 고철이므로 캔 속에 넣어 함께 압착 배출하면 안전합니다.',
  },
  {
    id: 'glass',
    name: '유리병류',
    icon: '🍾',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
    doList: [
      '음료수병, 와인병, 화장품 유리병의 내용물을 비우고 헹굼',
      '소주병, 맥주병 등 빈용기 보증금 대상 병은 마트/슈퍼에 반납 시 보증금 환급',
    ],
    dontList: [
      '깨진 유리 (신문지에 싸서 불연성 종량제 마대에 배출)',
      '거울, 내열유리(락앤락 글라스, 크리스탈), 도자기, 내열 식기류, 깨진 전구',
    ],
    specialTips: '깨진 유리는 재활용 선별 작업자의 부상을 유발하므로 절대로 일반 유리병 수거함에 넣으면 안 됩니다.',
  },
  {
    id: 'styrofoam',
    name: '스티로폼 (발포스티로폼)',
    icon: '📦',
    badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
    doList: [
      '흰색 과일 상자, 흰색 스티로폼 택배 상자 (테이프, 운송장 완전 제거)',
    ],
    dontList: [
      '컵라면 용기, 색상이 들어간 무늬 스티로폼, 건축용 내외장재',
      '음식물이 착색되거나 오염된 스티로폼',
    ],
    specialTips: '스티로폼 포장재 내부의 은박 비닐이나 스티커는 꼭 제거 후 배출하세요.',
  },
];

export const CategoryGuide: React.FC = () => {
  const [search, setSearch] = useState('');

  const filtered = CATEGORIES_DATA.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.doList.some((item) => item.toLowerCase().includes(search.toLowerCase())) ||
      c.dontList.some((item) => item.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              대한민국 표준 품목별 분리배출 핵심 요령
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              환경부 지침 기반 핵심 O/X 분리수거 규칙 모음
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="품목 검색 (예: 페트병, 종이팩)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs focus:bg-white focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {filtered.map((cat) => (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-800/40 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{cat.icon}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${cat.badgeColor}`}>
                  {cat.name}
                </span>
              </div>

              {/* DO List */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" /> 올바른 배출 방법 (O)
                </span>
                <ul className="list-disc pl-5 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  {cat.doList.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* DONT List */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <XCircle className="h-4 w-4" /> 재활용 안 되는 항목 (X - 종량제 배출)
                </span>
                <ul className="list-disc pl-5 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  {cat.dontList.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Special Tip */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/60 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/40 text-[11px] flex items-start gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{cat.specialTips}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
