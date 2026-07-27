import { GoogleGenAI, Type } from '@google/genai';

// Initialize GoogleGenAI lazily with process.env.GEMINI_API_KEY
function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function handleGenerateRequest(reqBody: any) {
  const { prompt, image, mimeType } = reqBody;

  if (!prompt && !image) {
    throw new Error('분석할 쓰레기 이름이나 사진을 입력해주세요.');
  }

  const ai = getGenAIClient();

  const systemInstruction = `당신은 대한민국 환경부의 분리배출 지침 및 최신 재활용 규정을 완벽하게 숙지한 '스마트 분리수거 전문 AI 도우미'입니다.
사용자가 입력한 쓰레기 이름, 설명 또는 사진을 바탕으로 구성 재질을 세밀히 분석하고, 올바른 분리수거 가이드를 정확하고 한눈에 보기 쉽게 한국어로 작성해주세요.

다음 항목을 포함하여 JSON 형식으로 응답하세요:
1. itemName: 쓰레기의 대표 품목명 (예: 아이스 아메리카노 일회용 컵)
2. summary: 핵심 분리배출 요약 문장 (예: "플라스틱, 종이, 빨대가 결합된 복합 재질로 각각 분리하여 배출해야 합니다.")
3. primaryCategory: 대표 분리배출 분류 ("플라스틱류", "종이류", "종이팩", "비닐류", "캔/금속류", "유리병", "스티로폼", "일반쓰레기(종량제)", "대형폐기물", "복합재질(분리필수)" 중 하나)
4. difficulty: 분리 난이도 ("쉬움", "보통", "손질 필요", "복합 분리")
5. materials: 쓰레기를 구성하는 세부 재질 목록. 각 항목은 { name: 재질명(예: PET, PP, 종이, 금속), component: 부위(예: 컵 본체, 뚜껑, 컵홀더), recyclable: 재활용 가능 여부(boolean), icon: 아이콘타입("plastic"|"paper"|"vinyl"|"metal"|"glass"|"styrofoam"|"trash") }
6. steps: 단계별 분리배출 요령 배열. 각 항목은 { step: 단계번호(1부터 시작), title: 단계 제목(예: "내용물 비우기 및 세척"), description: 세부 안내 문장 }
7. precautions: 주의사항 및 꼭 알아야 할 팁 목록 (string 배열, 최소 2개 이상)
8. upcyclingTip: 창의적인 재활용/업사이클링 아이디어 (없으면 유용한 환경 팁)
9. ecoImpact: 올바른 분리배출 시 환경적 이점 메시지 (예: "플라스틱 컵 1개를 올바르게 재활용하면 약 12g의 탄소 배출을 절감할 수 있습니다!")
`;

  const contentsParts: any[] = [];

  if (image) {
    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');
    contentsParts.push({
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType || 'image/jpeg',
      },
    });
  }

  const userQueryText = prompt
    ? `분석할 쓰레기/품목: ${prompt}\n\n위 사진과 설명(입력값)을 바탕으로 상세 분리수거 가이드를 JSON 규격으로 생성해 주세요.`
    : `제시된 사진 속 쓰레기를 식별하고 상세 분리수거 가이드를 JSON 규격으로 생성해 주세요.`;

  contentsParts.push({ text: userQueryText });

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: { parts: contentsParts },
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          itemName: { type: Type.STRING },
          summary: { type: Type.STRING },
          primaryCategory: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          materials: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                component: { type: Type.STRING },
                recyclable: { type: Type.BOOLEAN },
                icon: { type: Type.STRING },
              },
              required: ['name', 'component', 'recyclable', 'icon'],
            },
          },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step: { type: Type.INTEGER },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ['step', 'title', 'description'],
            },
          },
          precautions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          upcyclingTip: { type: Type.STRING },
          ecoImpact: { type: Type.STRING },
        },
        required: [
          'itemName',
          'summary',
          'primaryCategory',
          'difficulty',
          'materials',
          'steps',
          'precautions',
        ],
      },
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error('Gemini API 응답이 비어있습니다.');
  }

  return JSON.parse(responseText);
}

// Vercel Serverless Function Handler export (for api/generate.js / api/generate compatibility)
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST 요청만 지원합니다.' });
  }

  try {
    const result = await handleGenerateRequest(req.body);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Error in /api/generate:', err);
    return res.status(500).json({ error: err.message || '서버 오류가 발생했습니다.' });
  }
}
